const { SetTopics } = require("./set_topics");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test set topics', () => {
    test('Test type', () => {
        expect(SetTopics.TYPE).toBe(dataTypes.SET_TOPICS);
    });
    test('Test serialize deserialize', () => {
        let id = 65535;
        let topics = 'any,topic,i,would,like';
        let setTopics = new SetTopics(id, topics);
        let buffer = new ArrayBuffer(setTopics.length());
        let view = new DataView(buffer);
        setTopics.serialize(new MutableView(view));
        setTopics.id = 0;
        setTopics.topics = '*';
        setTopics.deserialize(new MutableView(view));
        expect(setTopics.id).toBe(id);
        expect(setTopics.topics).toBe(topics);
    });
});