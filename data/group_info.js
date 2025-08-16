const { JoinInfo } = require("./join_info");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class GroupInfo {
    static TYPE = dataTypes.GROUP_INFO;

    constructor(id = 0, joinInfos = []) {
        this.id = id;
        this.joinInfos = joinInfos;
    }

    length() {
        return MutableView.INT16_NUM_BYTES + MutableView.ARRAY_LEN_NUM_BYTES + this.joinInfos.map(i => i.length()).reduce((a, v) => a + v, 0);
    }

    serialize(view) {
        view.writeUint16(this.id);
        view.writeInt16(this.joinInfos.length);
        for (let joinInfo of this.joinInfos) {
            joinInfo.serialize(view);
        }
    }

    deserialize(view) {
        this.id = view.readUint16();
        this.joinInfos = [];
        let length = view.readInt16();
        for (let i = 0; i < length; i++) {
            let joinInfo = new JoinInfo();
            joinInfo.deserialize(view);
            this.joinInfos.push(joinInfo);
        }
    }
}

module.exports = { GroupInfo };