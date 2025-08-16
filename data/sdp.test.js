const { RemoteSdpData } = require("./sdp");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test sdp data', () => {
    test('Test type', () => {
        expect(RemoteSdpData.TYPE).toBe(dataTypes.SDP);
    });
    test('Test serialize deserialize', () => {
        let type = 'offer';
        let sdp = "v=0\no=- xxx 2 IN IP4 127.0.0.1\ns=-\nt=0 0\na=group:BUNDLE 0\na=extmap-allow-mixed\na=msid-semantic: WMS\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\nc=IN IP4 0.0.0.0\na=ice-ufrag:GBKK\na=ice-pwd:/yyy\na=ice-options:trickle\na=fingerprint:sha-256 z:z:z\na=setup:actpass\na=mid:0\na=sctp-port:5000\na=max-message-size:262144";
        let sdpData = new RemoteSdpData(type, sdp);
        let buffer = new ArrayBuffer(sdpData.length());
        let view = new DataView(buffer);
        sdpData.serialize(new MutableView(view));
        sdpData.sdpType = '';
        sdpData.sdpCandidate = '';
        sdpData.deserialize(new MutableView(view));
        expect(sdpData.sdpType).toBe(type);
        expect(sdpData.sdpCandidate).toBe(sdp);
    })
});