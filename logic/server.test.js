const { WebRtcServer } = require("./server");
const { startWebSocketServer } = require("./ws");
const { startRtcMockClient } = require("./client");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Test webrtc server', () => {
    let port = 8082;
    let wss;
    beforeAll(() => {
        wss = startWebSocketServer(port);
    });
    afterAll(() => {
        wss.close();
    });
    test('Test connection and data transmission', async () => {
        let onError = (error) => console.error(error);
        let server = new WebRtcServer();
        server.setErrorHandler(onError);
        server.start(':'+port);
        let ch = '4938fd2c-6118-4469-8f6c-1e71ad031df4';
        let receivedData = '';
        let onDataReceive = (data) => {
            console.log('Received data is: ' + data);
            receivedData = data;
        }
        let client = await startRtcMockClient(ch, port, onError, onDataReceive);
        let sendData = 'some random data';
        client.sendData(sendData);
        await delay(200);
        expect(receivedData).toBe(sendData);
        server.clean();
        expect(server.channels.size).toBe(1);
        server.shutdown();
        client.closeDataChannelAndPeerConnection();
        await delay(200);
        server.clean();
        expect(server.channels.size).toBe(0);
    });
});