const { SimpleDataMessage } = require("./simple");
const { MutableView } = require("../data/view");
const { RawData } = require("../data/raw");

describe('Test simple data message', () => {
    test('Test raw data message', () => {
        let channel = 'ch1';
        let data = [2, 1, 3];
        let rawData = new RawData(data);
        let message = new SimpleDataMessage(channel, rawData);
        let buffer = new ArrayBuffer(message.length());
        let view = new DataView(buffer);
        message.serialize(new MutableView(view));
        message.channel = '';
        message.data = null;
        message.deserialize(new MutableView(view));
        expect(message.channel).toBe(channel);
        expect(message.data.constructor.TYPE).toBe(RawData.TYPE);
        expect(message.data.data.join(',')).toBe(data.join(','));
    });
});