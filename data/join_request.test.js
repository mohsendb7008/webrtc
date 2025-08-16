const { JoinRequest } = require("./join_request");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test join request', () => {
    test('Test type', () => {
        expect(JoinRequest.TYPE).toBe(dataTypes.JOIN_REQUEST);
    });
    test('Test serialize deserialize', () => {
        let topics = 't1,t2';
        let data = [44, 100, -56];
        let joinRequest = new JoinRequest(topics, data);
        let buffer = new ArrayBuffer(joinRequest.length());
        let view = new DataView(buffer);
        joinRequest.serialize(new MutableView(view));
        joinRequest.topics = '*';
        joinRequest.data = [];
        joinRequest.deserialize(new MutableView(view));
        expect(joinRequest.topics).toBe(topics);
        expect(joinRequest.data.join(',')).toBe(data.join(','));
    });
});