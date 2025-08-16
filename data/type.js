const dataTypes = Object.freeze({
    RAW: 0,
    ICE: 1,
    SDP: 2,
    JOIN_REQUEST: 65409,
    JOIN_INFO: 65535,
    GROUP_INFO: 65533,
    LEAVE_INFO: 65531,
    SET_TOPICS: 205
});

module.exports = { dataTypes };