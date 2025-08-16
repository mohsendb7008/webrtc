require("../config");
const { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } = require('@roamhq/wrtc');

class WebRtcChannel {
    constructor() {
        this.configuration = { iceServers: [{ urls: process.env.GOOGLE_STUN_URL }] };
    }

    initPeerConnection(onIceCandidate, onDataChannel) {
        this.peerConnection = new RTCPeerConnection(this.configuration);
        this.peerConnection.onicecandidate = event => onIceCandidate(event.candidate);
        this.peerConnection.ondatachannel = event => onDataChannel(event.channel);
    }

    setDataChannel(channel, ordered) {
        this.channel = channel;
        this.dataChannel = this.peerConnection.createDataChannel(channel, { ordered: ordered });
    }

    createOffer(onSdp, onError) {
        this.peerConnection.createOffer(null).then((description) => {
            this.peerConnection.setLocalDescription(description).catch(onError);
            onSdp(description.sdp);
        }).catch(onError);
    }

    createAnswer(onSdp, onError) {
        this.peerConnection.createAnswer().then((description) => {
            this.peerConnection.setLocalDescription(description).catch(onError);
            onSdp(description.sdp);
        }).catch(onError);
    }

    addIceCandidate(candidate, onError) {
        this.peerConnection.addIceCandidate(new RTCIceCandidate({ candidate: candidate, sdpMid: 0, sdpMLineIndex: 0 })).catch(onError);
    }

    setRemoteDescription(type, sdp, onError) {
        this.peerConnection.setRemoteDescription(new RTCSessionDescription({ type: type, sdp: sdp })).catch(onError);
    }

    sendData(data) {
        if (this.dataChannel.readyState !== 'open') {
            console.error(`Data channel ${this.channel} is not open`);
            return;
        }
        this.dataChannel.send(data);
    }

    closeDataChannelAndPeerConnection() {
        if (this.dataChannel && this.dataChannel.readyState !== 'closed') {
            this.dataChannel.close();
        }
        if (this.peerConnection && this.peerConnection.connectionState !== 'closed') {
            this.peerConnection.close();
        }
    }

    isDead() {
        return (this.dataChannel && this.dataChannel.readyState === 'closed') || (this.peerConnection && ['closed', 'disconnected', 'failed'].includes(this.peerConnection.connectionState));
    }
}

module.exports = { WebRtcChannel };