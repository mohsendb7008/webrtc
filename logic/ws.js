const WebSocket = require('ws');

const startWebSocketServer = (port) => {
  const wss = new WebSocket.Server({ port });
  wss.on('connection', (ws) => {
    ws.on('message', (message) => {
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client !== ws) {
          client.send(message);
        }
      });
    });
  });
  return wss;
};

module.exports = { startWebSocketServer };