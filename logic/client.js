const { IceCandidateData } = require("../data/ice");
const { RemoteSdpData } = require("../data/sdp");
const { SimpleDataMessage } = require("../message/simple");
const { Signaler } = require("./signaling");
const { WebRtcChannel } = require("./webrtc");

async function startWebRtcClient(ch, port, onError, onData) {
    let success = false;
    let signaler = new Signaler();
    let channel = new WebRtcChannel();
    let onSignalerMessage = (message) => {
        if (message.channel === ch) {
            switch (message.data.constructor.TYPE) {
                case IceCandidateData.TYPE: {
                    channel.addIceCandidate(message.data.iceCandidate, onError);
                    break;
                }
                case RemoteSdpData.TYPE: {
                    if (message.data.sdpType === 'answer') {
                        channel.setRemoteDescription(message.data.sdpType, message.data.sdpCandidate, onError);
                    } else {
                        onError(new Error('Unexpected sdp type received: ' + message.data.sdpType));
                    }
                    break;
                }
                default: {
                    break;
                }
            }
        } else {
            console.log('Dropped message with different channel: ' + message.channel);
        }
    };
    let onIceCandidate = (candidate) => {
        if (candidate) {
            let data = new IceCandidateData(candidate.candidate);
            let message = new SimpleDataMessage(ch, data);
            signaler.send(message);
        }
    };
    let onDataChannel = (dataChannel) => {
        if (dataChannel.label === ch) {
            console.log(`Data channel ${ch} opened successfully!`);
            dataChannel.onmessage = (event) => onData(event.data);
            signaler.disconnect();
            success = true;
        } else {
            console.error('Unexpected data channel: ' + dataChannel.label);
        }
    };
    let onSignalerConnected = () => {
        channel.createOffer((sdp) => {
            let data = new RemoteSdpData('offer', sdp);
            let message = new SimpleDataMessage(ch, data);
            signaler.send(message);
        }, onError);
    };
    signaler.connect(onSignalerConnected, ':'+port);
    signaler.setOnReceivedMessage(onSignalerMessage);
    channel.initPeerConnection(onIceCandidate, onDataChannel);
    channel.setDataChannel(ch, false);
    await new Promise((resolve) => {
        const interval = setInterval(() => {
            if (success) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
    return channel;
}

module.exports = { startWebRtcClient };