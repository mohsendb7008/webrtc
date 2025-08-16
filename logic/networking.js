const { dataClasses } = require("../data/class");
const { GroupInfo } = require("../data/group_info");
const { JoinInfo } = require("../data/join_info");
const { LeaveInfo } = require("../data/leave_info");
const { RawData } = require("../data/raw");
const { MutableView } = require("../data/view");
const { WebRtcServerLogic } = require("./logic");
const { WebRtcServer } = require("./server");

class NetworkingWebRtcServer extends WebRtcServer {
    constructor(onData = (channel, data) => this.handleData(channel, data), logic = new WebRtcServerLogic()) {
        super();
        this.setOnData(onData);
        this.logic = logic;
        this.channelToId = new Map();
    }

    filterChannels(topics='*', except=null) {
        return this
                .channelToId
                .entries()
                .filter(([channel, id]) => {
                    if (channel == except) {
                        return false;
                    }
                    let joinInfo = this.logic.getJoinInfo(id);
                    return joinInfo && WebRtcServerLogic.commonTopics(joinInfo.topics, topics);
                })
                .map(([channel, _]) => channel);
    }

    handleData(channel, data) {
        if (!(data instanceof ArrayBuffer)) {
            this.broadcastData(data);
            return;
        }
        let message = NetworkingWebRtcServer.deserialize(data);
        let response = this.logic.handleMessage(message);
        if (response) {
            switch (response.constructor.TYPE) {
                case JoinInfo.TYPE: {
                    this.channelToId.set(channel, response.id);
                    this.multicastData(response, response.topics, channel);
                    let groupInfo = new GroupInfo(response.id, this.logic.filterJoinInfos(response.topics, response.id));
                    this.sendDataToChannel(channel, groupInfo);
                    break;
                }
                case LeaveInfo.TYPE: {
                    this.multicastData(response, '*', channel);
                    this.channelToId.delete(channel);
                    break;
                }
                case RawData.TYPE: {
                    var topics = '*';
                    var id = this.channelToId.get(channel);
                    if (id) {
                        var joinInfo = this.logic.getJoinInfo(id);
                        if (joinInfo) {
                            topics = joinInfo.topics;
                        }
                    }
                    this.multicastData(response, topics, channel);
                    break;
                }
                default: {
                    break;
                }
            }
        }
    }

    sendDataToChannel(label, data) {
        let raw = NetworkingWebRtcServer.serialize(data);
        super.sendDataToChannel(label, raw);
    }

    multicastData(data, topics='*', except=null) {
        let channels = this.filterChannels(topics, except);
        for (let channel of channels) {
            this.sendDataToChannel(channel, data);
        }
    }

    static deserialize(raw) {
        let view = new MutableView(new DataView(raw));
        let type = view.readUint16();
        let data = new dataClasses[type]();
        data.deserialize(view);
        return data;
    }

    static serialize(data) {
        let raw = new ArrayBuffer(MutableView.INT16_NUM_BYTES + data.length());
        let view = new MutableView(new DataView(raw));
        view.writeUint16(data.constructor.TYPE);
        data.serialize(view);
        return raw;
    }
}

module.exports = { NetworkingWebRtcServer };