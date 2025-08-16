const { dataTypes } = require("./type");
const { MutableView } = require("./view");

class IceCandidateData {
    static TYPE = dataTypes.ICE;

    constructor(iceCandidate = '') {
        this.iceCandidate = iceCandidate;
    }

    length() {
        return MutableView.STRING_LEN_NUM_BYTES + this.iceCandidate.length;
    }

    serialize(view) {
        view.writeString(this.iceCandidate);
    }

    deserialize(view) {
        this.iceCandidate = view.readString();
    }
}

module.exports = { IceCandidateData };