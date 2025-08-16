require('dotenv').config();
const config = require('config');

function getSignalingConfig() {
    return config.get('signaling');
}

module.exports = { getSignalingConfig };