const dataTypes = Object.freeze({
    RAW: 0,
    ICE: 1,
    SDP: 2
});

class MutableView {
    static INT8_NUM_BYTES = 1;
    static INT16_NUM_BYTES = 2;
    static ARRAY_LEN_NUM_BYTES = 2;
    static STRING_LEN_NUM_BYTES = 2;

    constructor(view) {
        this.view = view;
    }

    getInt8(i) {
        return this.view.getInt8(i);
    }

    setInt8(i, v) {
        this.view.setInt8(i, v);
    }

    getUint8(i) {
        return this.view.getUint8(i);
    }

    setUint8(i, v) {
        this.view.setUint8(i, v);
    }

    getInt16(i) {
        return this.view.getInt16(i);
    }

    setInt16(i, v) {
        this.view.setInt16(i, v);
    }

    getUint16(i) {
        return this.view.getUint16(i);
    }

    setUint16(i, v) {
        this.view.setUint16(i, v);
    }

    seek(amount) {
        if (amount > this.view.byteLength) {
            throw new Error('Cannot seek more than data length')
        }
        this.view = new DataView(this.view.buffer, this.view.byteOffset + amount, this.view.byteLength - amount);
    }

    readInt8() {
        var x = this.getInt8(0);
        this.seek(MutableView.INT8_NUM_BYTES);
        return x;
    }

    writeInt8(x) {
        this.setInt8(0, x);
        this.seek(MutableView.INT8_NUM_BYTES);
    }

    readUint8() {
        var x = this.getUint8(0);
        this.seek(MutableView.INT8_NUM_BYTES);
        return x;
    }

    writeUint8(x) {
        this.setUint8(0, x);
        this.seek(MutableView.INT8_NUM_BYTES);
    }

    readInt16() {
        var x = this.getInt16(0);
        this.seek(MutableView.INT16_NUM_BYTES);
        return x;
    }

    writeInt16(x) {
        this.setInt16(0, x);
        this.seek(MutableView.INT16_NUM_BYTES);
    }

    readUint16() {
        var x = this.getUint16(0);
        this.seek(MutableView.INT16_NUM_BYTES);
        return x;
    }

    writeUint16(x) {
        this.setUint16(0, x);
        this.seek(MutableView.INT16_NUM_BYTES);
    }

    readBytes() {
        let length = this.readInt16();
        let bytes = new Int8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = this.readInt8();
        }
        return bytes;
    }

    writeBytes(bytes) {
        this.writeInt16(bytes.length);    
        for (let i = 0; i < bytes.length; i++) {
            this.writeInt8(bytes[i]);
        }
    }

    readString() {
        let length = this.readInt16();
        let bytes = new Uint8Array(length);
        for (let i = 0; i < length; i++) {
            bytes[i] = this.readUint8();
        }
        let decoder = new TextDecoder();
        return decoder.decode(bytes);
    }

    writeString(string) {
        let encoder = new TextEncoder();
        let bytes = encoder.encode(string);
        this.writeInt16(bytes.length);
        for (let i = 0; i < bytes.length; i++) {
            this.writeUint8(bytes[i]);
        }
    }
}

class RawData {
    static TYPE = dataTypes.RAW;

    constructor(data = []) {
        this.data = data;
    }

    length() {
        return MutableView.ARRAY_LEN_NUM_BYTES + this.data.length;
    }

    serialize(view) {
        view.writeBytes(this.data);
    }

    deserialize(view) {
        this.data = view.readBytes();
    }
}

class IceCandidateData {
    static TYPE = dataTypes.ICE;

    constructor(iceCandidate = '') {
        this.iceCandidate = iceCandidate;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.iceCandidate.length;
    }

    serialize(view) {
        view.writeString(this.iceCandidate);
    }

    deserialize(view) {
        this.iceCandidate = view.readString();
    }
}

class RemoteSdpData {
    static TYPE = dataTypes.SDP;

    constructor(sdpType = '', sdpCandidate = '') {
        this.sdpType = sdpType;
        this.sdpCandidate = sdpCandidate;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.sdpType.length + MutableView.STRING_LEN_NUM_BYTES + this.sdpCandidate.length;
    }

    serialize(view) {
        view.writeString(this.sdpType);
        view.writeString(this.sdpCandidate);
    }

    deserialize(view) {
        this.sdpType = view.readString();
        this.sdpCandidate = view.readString();
    }
}

const dataClasses = Object.freeze({
    0: RawData,
    1: IceCandidateData,
    2: RemoteSdpData
});

class SimpleDataMessage {
    constructor(channel = '', data = new RawData()) {
        this.channel = channel;
        this.data = data;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.channel.length + MutableView.INT16_NUM_BYTES + this.data.length();
    }

    serialize(view) {
        view.writeString(this.channel);
        view.writeUint16(this.data.constructor.TYPE);
        this.data.serialize(view);
    }

    deserialize(view) {
        this.channel = view.readString();
        let type = view.readUint16();
        this.data = new dataClasses[type]();
        this.data.deserialize(view);
    }

    toBuffer() {
        const buffer = new ArrayBuffer(this.length());
        this.serialize(new MutableView(new DataView(buffer)));
        return buffer;
    }

    static fromBuffer(buffer) {
        const message = new SimpleDataMessage();
        message.deserialize(new MutableView(new DataView(buffer)));
        return message;
    }
}

class Signaler {
    connect(onConnected, port=':8081') {
        this.socket = new WebSocket('http://localhost'+port, []);
        this.socket.onopen = onConnected;
    }

    disconnect() {
        if (this.socket && this.socket.readyState != WebSocket.CLOSED) {
            this.socket.close();
        }
    }

    setOnReceivedMessage(onMessage) {
        this.socket.onmessage = async (event) => {
            try {
                let buffer = await event.data.arrayBuffer();
                let message = Signaler.deserialize(buffer);
                onMessage(message);
            } catch(e) {
                console.error(`Signaler received weird message: ${event.data}`);
                console.error(e);
            }
        };
    }

    send(message) {
        let buffer = Signaler.serialize(message);
        this.socket.send(buffer);
    }

    static deserialize(buffer) {
        return SimpleDataMessage.fromBuffer(buffer);
    }

    static serialize(message) {
        return message.toBuffer();
    }
}

class WebRtcChannel {
    constructor() {
        this.configuration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
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

let channel = null;
let ch = null;
let signaler = null;
let id = null;

function onError(error) {
    console.error(error);
}

function appendMessage(msg) {
    const messageBox = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.textContent = msg;
    messageBox.appendChild(newMessage);
    messageBox.scrollTop = messageBox.scrollHeight;
}

function onSignalerConnected() {
    channel.createOffer((sdp) => {
        let data = new RemoteSdpData('offer', sdp);
        let message = new SimpleDataMessage(ch, data);
        signaler.send(message);
    }, onError);
}

function onSignalerMessage(message) {
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
        appendMessage('Dropped message with different channel: ' + message.channel);
    }
}

function onIceCandidate(candidate) {
    if (candidate) {
        let data = new IceCandidateData(candidate.candidate);
        let message = new SimpleDataMessage(ch, data);
        signaler.send(message);
    }
}

function onDataReceive(data) {
    appendMessage(data);
}

function onDataChannel(dataChannel) {
    if (dataChannel.label === ch) {
        appendMessage(`Data channel ${id} opened successfully!`);
        dataChannel.onmessage = (event) => onDataReceive(event.data);
        signaler.disconnect();
        document.getElementById('message').disabled = false;
        document.querySelector('button[onclick="send()"]').disabled = false;
    } else {
        appendMessage('Unexpected data channel: ' + dataChannel.label);
    }
}

function generateUniqueString(length = 16) {
    const randomPart = [...Array(length)]
        .map(() => Math.random().toString(36)[2])
        .join('');
    const timestampPart = Date.now().toString(36);
    return randomPart + timestampPart;
}

function connect() {
    if (channel) {
        channel.closeDataChannelAndPeerConnection();
    }
    id = document.getElementById('username').value;
    if (!id) {
        alert('Please enter a username.');
        return;
    }
    channel = new WebRtcChannel();
    ch = generateUniqueString();
    signaler = new Signaler();
    signaler.connect(onSignalerConnected);
    signaler.setOnReceivedMessage(onSignalerMessage);
    channel.initPeerConnection(onIceCandidate, onDataChannel);
    channel.setDataChannel(ch, false);
}

function send() {
    let data = document.getElementById('message').value;
    if (!data) {
        alert('Please enter a message.');
        return;
    }
    channel.sendData(`${id}: ${data}`);
}