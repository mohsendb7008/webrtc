const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class JoinRequest {
    static TYPE = dataTypes.JOIN_REQUEST;

    constructor(topics = '*', data = []) {
        this.topics = topics;
        this.data = data;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.topics.length + MutableView.ARRAY_LEN_NUM_BYTES + this.data.length;
    }

    serialize(view) {
        view.writeString(this.topics);
        view.writeBytes(this.data);
    }

    deserialize(view) {
        this.topics = view.readString();
        this.data = view.readBytes();
    }
}

module.exports = { JoinRequest };