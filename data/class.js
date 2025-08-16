const { RawData } = require("./raw");
const { IceCandidateData } = require("./ice");
const { RemoteSdpData } = require("./sdp");
const { JoinRequest } = require("./join_request");
const { JoinInfo } = require("./join_info");
const { LeaveInfo } = require("./leave_info");
const { SetTopics } = require("./set_topics");
const { GroupInfo } = require("./group_info");

const dataClasses = Object.freeze({
    0: RawData,
    1: IceCandidateData,
    2: RemoteSdpData,
    65409: JoinRequest,
    65535: JoinInfo,
    65533: GroupInfo,
    65531: LeaveInfo,
    205: SetTopics
});

module.exports = { dataClasses };