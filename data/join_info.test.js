const { JoinInfo } = require("./join_info");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test join info', () => {
    test('Test type', () => {
        expect(JoinInfo.TYPE).toBe(dataTypes.JOIN_INFO);
    });
    test('Test serialize deserialize', () => {
        let id = 205;
        let topics = 't3,t50,t700';
        let data = [44, 100, -56];
        let joinInfo = new JoinInfo(id, topics, data);
        let buffer = new ArrayBuffer(joinInfo.length());
        let view = new DataView(buffer);
        joinInfo.serialize(new MutableView(view));
        joinInfo.id = 0;
        joinInfo.topics = '*';
        joinInfo.data = [];
        joinInfo.deserialize(new MutableView(view));
        expect(joinInfo.id).toBe(id);
        expect(joinInfo.topics).toBe(topics);
        expect(joinInfo.data.join(',')).toBe(data.join(','));
    });
});