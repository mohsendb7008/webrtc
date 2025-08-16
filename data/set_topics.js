const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class SetTopics {
    static TYPE = dataTypes.SET_TOPICS;

    constructor(id = 0, topics = '*') {
        this.id = id;
        this.topics = topics;
    }

    length() {
        return MutableView.INT16_NUM_BYTES + MutableView.STRING_LEN_NUM_BYTES + this.topics.length;
    }

    serialize(view) {
        view.writeUint16(this.id);
        view.writeString(this.topics);
    }

    deserialize(view) {
        this.id = view.readUint16();
        this.topics = view.readString();
    }
}

module.exports = { SetTopics };