const { IceCandidateData } = require("./ice");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test ice data', () => {
    test('Test type', () => {
        expect(IceCandidateData.TYPE).toBe(dataTypes.ICE);
    });
    test('Test serialize deserialize', () => {
        let ice = "candidate:xxx 1 udp yyy 127.0.0.1 zzz typ host generation 0 ufrag wp/b network-id ?";
        let iceData = new IceCandidateData(ice);
        let buffer = new ArrayBuffer(iceData.length());
        let view = new DataView(buffer);
        iceData.serialize(new MutableView(view));
        iceData.iceCandidate = '';
        iceData.deserialize(new MutableView(view));
        expect(iceData.iceCandidate).toBe(ice);
    });
});