const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class JoinInfo {
    static TYPE = dataTypes.JOIN_INFO;

    constructor(id = 0, topics = '*', data = []) {
        this.id = id;
        this.topics = topics;
        this.data = data;
    }

    length() {
        return MutableView.INT16_NUM_BYTES + MutableView.STRING_LEN_NUM_BYTES + this.topics.length + MutableView.ARRAY_LEN_NUM_BYTES + this.data.length;
    }

    serialize(view) {
        view.writeUint16(this.id);
        view.writeString(this.topics);
        view.writeBytes(this.data);
    }

    deserialize(view) {
        this.id = view.readUint16();
        this.topics = view.readString();
        this.data = view.readBytes();
    }
}

module.exports = { JoinInfo };