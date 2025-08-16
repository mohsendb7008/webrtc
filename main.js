const { startWebSocketServer } = require("./logic/ws");
let wss = startWebSocketServer(8081);
const { NetworkingWebRtcServer } = require("./logic/networking");
let server = new NetworkingWebRtcServer();
server.setErrorHandler((error) => console.error(error));
server.start();
console.log('Server is running.');
setInterval(() => {
    server.clean();
}, 1000);
const http = require('http');
let httpServer = http.createServer((request, response) => {
    if (request.method == 'GET') {
        response.writeHead(200, { 'Content-Type': 'text/plain' });
        response.end('Webrtc Signaler Port: 8081');
    } else {
        response.writeHead(404);
        response.end();
    }
});
httpServer.listen(80);
let exit = () => {
    console.log('Graceful shutdown.');
    httpServer.close();
    server.shutdown();
    wss.close();
    process.exit();
}
process.on('SIGINT', exit);
process.on('SIGTSTP', exit);