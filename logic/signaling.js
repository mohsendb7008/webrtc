require("../config");
const { SimpleDataMessage } = require("../message/simple");
const { getSignalingConfig } = require("../config");

class Signaler {
    connect(onConnected, port='') {
        this.socket = new WebSocket(getSignalingConfig().get('websocket-url')+port, []);
        this.socket.onopen = onConnected;
    }

    disconnect() {
        if (this.socket && this.socket.readyState != WebSocket.CLOSED) {
            this.socket.close();
        }
    }

    setOnReceivedMessage(onMessage) {
        this.socket.onmessage = async (event) => {
            try {
                let buffer = await event.data.arrayBuffer();
                let message = Signaler.deserialize(buffer);
                onMessage(message);
            } catch(e) {
                console.error(`Signaler received weird message: ${event.data}`);
                console.error(e);
            }
        };
    }

    send(message) {
        let buffer = Signaler.serialize(message);
        this.socket.send(buffer);
    }

    static deserialize(buffer) {
        return SimpleDataMessage.fromBuffer(buffer);
    }

    static serialize(message) {
        return message.toBuffer();
    }
}

module.exports = { Signaler };