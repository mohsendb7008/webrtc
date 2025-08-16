const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class LeaveInfo {
    static TYPE = dataTypes.LEAVE_INFO;

    constructor(id = 0) {
        this.id = id;
    }

    length() {
        return MutableView.INT16_NUM_BYTES;
    }

    serialize(view) {
        view.writeUint16(this.id);
    }

    deserialize(view) {
        this.id = view.readUint16();
    }
}

module.exports = { LeaveInfo };