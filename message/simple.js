const { RawData } = require("../data/raw");
const { dataClasses } = require("../data/class");
const { MutableView } = require("../data/view");

class SimpleDataMessage {
    constructor(channel = '', data = new RawData()) {
        this.channel = channel;
        this.data = data;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.channel.length + MutableView.INT16_NUM_BYTES + this.data.length();
    }

    serialize(view) {
        view.writeString(this.channel);
        view.writeUint16(this.data.constructor.TYPE);
        this.data.serialize(view);
    }

    deserialize(view) {
        this.channel = view.readString();
        let type = view.readUint16();
        this.data = new dataClasses[type]();
        this.data.deserialize(view);
    }

    toBuffer() {
        const buffer = new ArrayBuffer(this.length());
        this.serialize(new MutableView(new DataView(buffer)));
        return buffer;
    }

    static fromBuffer(buffer) {
        const message = new SimpleDataMessage();
        message.deserialize(new MutableView(new DataView(buffer)));
        return message;
    }
}

module.exports = { SimpleDataMessage };