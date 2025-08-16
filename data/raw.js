const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class RawData {
    static TYPE = dataTypes.RAW;

    constructor(data = []) {
        this.data = data;
    }

    length() {
        return MutableView.ARRAY_LEN_NUM_BYTES + this.data.length;
    }

    serialize(view) {
        view.writeBytes(this.data);
    }

    deserialize(view) {
        this.data = view.readBytes();
    }
}

module.exports = { RawData };