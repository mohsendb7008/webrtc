const { RawData } = require("../data/raw");
const { SimpleDataMessage } = require("../message/simple");
const { Signaler } = require("./signaling");
const { startWebSocketServer } = require("./ws");
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

describe('Test signaler', () => {
    let port = 8081;
    let wss;
    beforeAll(() => {
        wss = startWebSocketServer(port);
    });
    afterAll(() => {
        wss.close();
    });
    test('Test connection and data transmission', async () => {
        let signalerA = new Signaler();
        let signalerB = new Signaler();
        let connectedA = false;
        let connectedB = false;
        signalerA.connect(() => connectedA = true, ':'+port);
        signalerB.connect(() => connectedB = true, ':'+port);
        await delay(200);
        expect(connectedA).toBe(true);
        expect(connectedB).toBe(true);
        let data = new RawData([10, 0, 127, -10, -128]);
        let sendMessage = new SimpleDataMessage('b6f06c02-c666-4038-8efb-a991fd076970', data);
        let receivedMessage = new SimpleDataMessage();
        signalerA.setOnReceivedMessage((message) => receivedMessage = message);
        signalerB.send(sendMessage);
        await delay(200);
        expect(receivedMessage.channel).toBe(sendMessage.channel);
        expect(receivedMessage.data.data.join(',')).toBe(sendMessage.data.data.join(','));
        signalerA.disconnect();
        signalerB.disconnect();
        await delay(200);
    });
});