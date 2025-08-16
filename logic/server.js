const { IceCandidateData } = require("../data/ice");
const { RemoteSdpData } = require("../data/sdp");
const { Signaler } = require("./signaling");
const { WebRtcChannel } = require("./webrtc");
const { SimpleDataMessage } = require("../message/simple");
const { SlidingWindow } = require("../message/window");

class WebRtcServer {
    constructor(errorHandler = (_) => {}, onData = (_, data) => { this.broadcastData(data) }, signaler = new Signaler(), buffered = new SlidingWindow()) {
        this.errorHandler = errorHandler;
        this.onData = onData;
        this.signaler = signaler;
        this.channels = new Map();
        this.buffered = buffered;
    }

    setErrorHandler(errorHandler) {
        this.errorHandler = errorHandler;
    }

    setOnData(onData) {
        this.onData = onData;
    }

    start(port='') {
        this.signaler.connect(() => this.signaler.setOnReceivedMessage((message) => this.handleMessages(message)), port);
    }

    shutdown() {
        this.signaler.disconnect();
        for(let channel of this.channels.values()) {
            channel.closeDataChannelAndPeerConnection();
        }
    }

    clean() {
        for(let [label, channel] of this.channels.entries()) {
            if (channel.isDead()) {
                this.channels.delete(label);
            }
        }
    }

    getOrInitRtcChannel(channel) {
        let rtc = this.channels.get(channel);
        if (!rtc) {
            rtc = new WebRtcChannel();
            rtc.initPeerConnection(
                (candidate) => this.onIceCandidate(channel, candidate),
                (dataChannel) => {
                    if (dataChannel.label === channel) {
                        this.onDataChannelReady(dataChannel);
                        for(let data of this.buffered.queue) {
                            rtc.sendData(data);
                        }
                    }
                }
            );
            rtc.setDataChannel(channel, false);
            this.channels.set(channel, rtc);
        }
        return rtc;
    }

    onIceCandidate(channel, candidate) {
        if (candidate) {
            let data = new IceCandidateData(candidate.candidate);
            let message = new SimpleDataMessage(channel, data);
            this.signaler.send(message);
        }
    }

    onDataChannelReady(dataChannel) {
        console.log('Data channel ' + dataChannel.label + ' is ready');
        dataChannel.onmessage = (event) => this.onData(dataChannel.label, event.data);
    }

    sendDataToChannel(label, data) {
        let channel = this.channels.get(label);
        if (channel) {
            channel.sendData(data);
            return true;
        }
        return false;
    }

    broadcastData(data, except=null) {
        for(let [label, channel] of this.channels.entries()) {
            if (label == except) {
                continue;
            }
            channel.sendData(data);
        }
        this.buffered.move(data);
    }

    handleMessages(message) {
        switch (message.data.constructor.TYPE) {
            case IceCandidateData.TYPE: {
                let rtc = this.getOrInitRtcChannel(message.channel);
                rtc.addIceCandidate(message.data.iceCandidate, this.errorHandler);
                break;
            }
            case RemoteSdpData.TYPE: {
                let rtc = this.getOrInitRtcChannel(message.channel);
                if (message.data.sdpType === 'offer') {
                    rtc.setRemoteDescription(message.data.sdpType, message.data.sdpCandidate, this.errorHandler);
                    rtc.createAnswer((sdp) => {
                        let data = new RemoteSdpData('answer', sdp);
                        let msg = new SimpleDataMessage(message.channel, data);
                        this.signaler.send(msg);
                    }, this.errorHandler);
                } else {
                    this.errorHandler(new Error('Unexpected sdp type received: ' + message.data.sdpType));
                }
                break;
            }
            default: {
                break;
            }
        }
    }
}

module.exports = { WebRtcServer };