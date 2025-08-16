const { LeaveInfo } = require("./leave_info");
const { dataTypes } = require("./type");
const { MutableView } = require("./view");

describe('Test leave info', () => {
    test('Test type', () => {
        expect(LeaveInfo.TYPE).toBe(dataTypes.LEAVE_INFO);
    });
    test('Test serialize deserialize', () => {
        let id = 205;
        let leaveInfo = new LeaveInfo(id);
        let buffer = new ArrayBuffer(leaveInfo.length());
        let view = new DataView(buffer);
        leaveInfo.serialize(new MutableView(view));
        leaveInfo.id = 0;
        leaveInfo.deserialize(new MutableView(view));
        expect(leaveInfo.id).toBe(id);
    });
});