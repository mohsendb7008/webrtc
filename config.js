let signalingConfig;

if (typeof window === 'undefined') {
    require('dotenv').config();
    const config = require('config');
    signalingConfig = config.get('signaling');
} else {
    signalingConfig = {};
    signalingConfig.get = (x) => {
        if (x === 'websocket-url')
            return window.signaling_websocket_url;
        return signalingConfig[x];
    };
}

function getSignalingConfig() {
    return signalingConfig;
}

module.exports = { getSignalingConfig };