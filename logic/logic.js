const { JoinRequest } = require("../data/join_request");
const { JoinInfo } = require("../data/join_info");
const { LeaveInfo } = require("../data/leave_info");
const { SetTopics } = require("../data/set_topics");
const { Uint16IdGenerator } = require("../util/Uint16IdGenerator");
const lodash = require('lodash');
const { RawData } = require("../data/raw");

class WebRtcServerLogic {
    constructor(idGenerator = new Uint16IdGenerator()) {
        this.idGenerator = idGenerator;
        this.clients = new Map();
    }

    getJoinInfo(id) {
        return this.clients.get(id);
    }

    setJoinInfo(id, joinInfo) {
        this.clients.set(id, joinInfo);
    }

    deleteJoinInfo(id) {
        this.clients.delete(id);
    }

    filterJoinInfos(topics='*', except=null) {
        return Array.from(this.clients.values()).filter(joinInfo => joinInfo.id != except && WebRtcServerLogic.commonTopics(joinInfo.topics, topics));
    }

    handleMessage(message) {
        let response = null;
        switch (message.constructor.TYPE) {
            case JoinRequest.TYPE: {
                var id = this.idGenerator.nextAvailableId();
                this.idGenerator.acquireId(id);
                var joinInfo = new JoinInfo(id, message.topics, message.data);
                this.setJoinInfo(id, joinInfo);
                response = joinInfo;
                break;
            }
            case LeaveInfo.TYPE: {
                this.idGenerator.releaseId(message.id);
                this.deleteJoinInfo(message.id);
                response = message;
                break;
            }
            case SetTopics.TYPE: {
                var joinInfo = this.getJoinInfo(message.id);
                if (joinInfo) {
                    joinInfo.topics = message.topics;
                }
                break;
            }
            case RawData.TYPE: {
                response = message;
                break;
            }
            default: {
                break;
            }
        }
        return response;
    }

    static commonTopics(A, B) {
        let a = A.split(',');
        let b = B.split(',');
        if (a.includes('*') || b.includes('*')) {
            return '*';
        }
        let intersection = lodash.intersection(a, b);
        return intersection.join(',');
    }
}

module.exports = { WebRtcServerLogic };