window.signaling_websocket_url = 'http://localhost';

let id = null;
let ch = null;
let channel = null;

function onError(error) {
    console.error(error);
}

function appendMessage(msg) {
    const messageBox = document.getElementById('messages');
    const newMessage = document.createElement('div');
    newMessage.textContent = msg;
    messageBox.appendChild(newMessage);
    messageBox.scrollTop = messageBox.scrollHeight;
}

function onDataReceive(data) {
    appendMessage(data);
}

function generateUniqueString(length = 16) {
    const randomPart = [...Array(length)]
        .map(() => Math.random().toString(36)[2])
        .join('');
    const timestampPart = Date.now().toString(36);
    return randomPart + timestampPart;
}

function connect() {
    if (channel) {
        channel.closeDataChannelAndPeerConnection();
    }
    id = document.getElementById('username').value;
    if (!id) {
        alert('Please enter a username.');
        return;
    }
    ch = generateUniqueString();
    RtcLib.startWebRtcClient(ch, 8081, onError, onDataReceive)
        .then((rtc) => {
            channel = rtc;
            appendMessage(`Data channel ${id} opened successfully!`);
            document.getElementById('message').disabled = false;
            document.querySelector('button[onclick="send()"]').disabled = false;
        })
        .catch(error => {
            appendMessage('Could not open channel, check console for errors.')
            onError(error);
        });
}

function send() {
    let data = document.getElementById('message').value;
    if (!data) {
        alert('Please enter a message.');
        return;
    }
    channel.sendData(`${id}: ${data}`);
}