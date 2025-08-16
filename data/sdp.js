const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class RemoteSdpData {
    static TYPE = dataTypes.SDP;

    constructor(sdpType = '', sdpCandidate = '') {
        this.sdpType = sdpType;
        this.sdpCandidate = sdpCandidate;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.sdpType.length + MutableView.STRING_LEN_NUM_BYTES + this.sdpCandidate.length;
    }

    serialize(view) {
        view.writeString(this.sdpType);
        view.writeString(this.sdpCandidate);
    }

    deserialize(view) {
        this.sdpType = view.readString();
        this.sdpCandidate = view.readString();
    }
}

module.exports = { RemoteSdpData };