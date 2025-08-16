const { JoinRequest } = require("../data/join_request");
const { LeaveInfo } = require("../data/leave_info");
const { SetTopics } = require("../data/set_topics");
const { WebRtcServerLogic } = require("./logic");

describe('Test webrtc server logic', () => {
    test('Test join leave', () => {
        var logic = new WebRtcServerLogic();
        var data = [3, 5, 9];
        var joinRequest = new JoinRequest('*', data);
        var id = logic.handleMessage(joinRequest).id;
        var joinInfo = logic.getJoinInfo(id);
        expect(joinInfo.id).toBe(id);
        expect(joinInfo.data.join(',')).toBe(data.join(','));
        var leaveInfo = new LeaveInfo(id);
        logic.handleMessage(leaveInfo);
        expect(logic.getJoinInfo(id)).toBe(undefined);
    });
    test('Test set topics', () => {
        var logic = new WebRtcServerLogic();
        var topics = 't1,t2,t3';
        var request = new JoinRequest(topics);
        var info = logic.handleMessage(request);
        expect(info.topics).toBe(topics);
        var setTopics = new SetTopics(info.id, 't4,t5,t6');
        logic.handleMessage(setTopics);
        info = logic.getJoinInfo(setTopics.id);
        expect(info.topics).toBe(setTopics.topics);
    });
    test('Test common topics', () => {
        expect(WebRtcServerLogic.commonTopics('t1,t5,t7,t9', 't4,t5,t6,t7')).toBe('t5,t7');
        expect(WebRtcServerLogic.commonTopics('t1,t3,*', 't1,t2')).toBe('*');
        expect(WebRtcServerLogic.commonTopics('t1,t2', 't3,t4,*')).toBe('*');
    });
    test('Test filter join infos', () => {
        var logic = new WebRtcServerLogic();
        var request1 = new JoinRequest('a,b,c');
        var id1 = logic.handleMessage(request1).id;
        var request2 = new JoinRequest('c,d,e');
        var id2 = logic.handleMessage(request2).id;
        var request3 = new JoinRequest('f,g,h');
        var id3 = logic.handleMessage(request3).id;
        var joinInfos1 = logic.filterJoinInfos();
        expect(joinInfos1.length).toBe(3);
        var joinInfos2 = logic.filterJoinInfos('c,g');
        expect(joinInfos2.length).toBe(3);
        var joinInfos3 = logic.filterJoinInfos('x');
        expect(joinInfos3.length).toBe(0);
        var joinInfos4 = logic.filterJoinInfos('x,c');
        expect(joinInfos4.length).toBe(2);
        expect(joinInfos4.map(i => i.id).join(',')).toBe([id1, id2].join(','));
        var joinInfos5 = logic.filterJoinInfos('b,d', id2);
        expect(joinInfos5.length).toBe(1);
        expect(joinInfos5[0].id).toBe(id1);
        var joinInfos6 = logic.filterJoinInfos('f,y');
        expect(joinInfos6.length).toBe(1);
        expect(joinInfos6[0].id).toBe(id3);
    });
});