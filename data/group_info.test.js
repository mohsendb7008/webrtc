const { GroupInfo } = require("./group_info");
const { JoinInfo } = require("./join_info");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test group info', () => {
    test('Test type', () => {
        expect(GroupInfo.TYPE).toBe(dataTypes.GROUP_INFO);
    });
    test('Test serialize deserialize', () => {
        let joinInfo1 = new JoinInfo(1);
        let joinInfo2 = new JoinInfo(2);
        let joinInfo3 = new JoinInfo(3);
        let groupInfo = new GroupInfo(4, [joinInfo1, joinInfo2, joinInfo3]);
        let buffer = new ArrayBuffer(groupInfo.length());
        let view = new DataView(buffer);
        groupInfo.serialize(new MutableView(view));
        groupInfo.id = 0;
        groupInfo.joinInfos = [];
        groupInfo.deserialize(new MutableView(view));
        expect(groupInfo.id).toBe(4);
        expect(groupInfo.joinInfos.map(i => i.id).join(',')).toBe('1,2,3');
    });
});