const { WebRtcChannel } = require("./webrtc");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Test webrtc channel', () => {
    test('Test peer connection and data channel', async () => {
        let server = new WebRtcChannel();
        let client = new WebRtcChannel();
        let onError = (error) => expect(error).toBeNull();
        let onServerIceCandidate = (candidate) => {
            if (candidate) {
                console.log('Server ice candidate: ' + candidate.candidate);
                client.addIceCandidate(candidate.candidate, onError);
            } else {
                console.log('Server ice candidate is not available');
            }
        };
        let onClientIceCandidate = (candidate) => {
            if (candidate) {
                console.log('Client ice candidate: ' + candidate.candidate);
                server.addIceCandidate(candidate.candidate, onError);
            } else {
                console.log('Client ice candidate is not available');
            }
        }
        let serverReceivedData = null;
        let clientReceivedData = null;
        let onServerReceiveData = (data) => {
            console.log('Server receive data: ' + data);
            serverReceivedData = data;
        };
        let onClientReceiveData = (data) => {
            console.log('Client receive data: ' + data);
            clientReceivedData = data;
        }
        let channel = 'ch1';
        let onServerDataChannel = (dataChannel) => {
            console.log('Server data channel: ' + dataChannel.label);
            if (dataChannel.label === channel) {
                dataChannel.onmessage = event => onServerReceiveData(event.data);
            } else {
                console.log('Unexpected data channel for server');
            }
        };
        let onClientDataChannel = (dataChannel) => {
            console.log('Client data channel: ' + dataChannel.label);
            if (dataChannel.label === channel) {
                dataChannel.onmessage = event => onClientReceiveData(event.data);
            } else {
                console.log('Unexpected data channel for client')
            }
        }
        server.initPeerConnection(onServerIceCandidate, onServerDataChannel);
        client.initPeerConnection(onClientIceCandidate, onClientDataChannel);
        server.setDataChannel(channel, false);
        client.setDataChannel(channel, false);
        let onServerAnswer = (sdp) => {
            console.log('Server answer: ' + sdp);
            client.setRemoteDescription('answer', sdp, onError);
        }
        let onClientOffer = (sdp) => {
            console.log('Client offer: ' + sdp);
            server.setRemoteDescription('offer', sdp, onError);
            server.createAnswer(onServerAnswer, onError);
        }
        client.createOffer(onClientOffer, onError);
        await delay(100); // Wait for connection and handshakes
        let clientSendData = 'Client is sender';
        let serverSendData = 'Server is sender';
        client.sendData(clientSendData);
        server.sendData(serverSendData);
        await delay(100); // Wait for data transmission
        expect(serverReceivedData).toBe(clientSendData);
        expect(clientReceivedData).toBe(serverSendData);
        expect(server.isDead()).toBe(false);
        expect(client.isDead()).toBe(false);
        server.closeDataChannelAndPeerConnection();
        client.closeDataChannelAndPeerConnection();
        await delay(100); // Wait for graceful disconnection
        expect(server.isDead()).toBe(true);
        expect(client.isDead()).toBe(true);
    });
});