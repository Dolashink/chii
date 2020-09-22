const WebSocket = require('ws');
const url = require('url');
const ChannelManager = require('./ChannelManager');
const query = require('licia/query');

module.exports = class WebSocketServer {
  constructor() {
    this.channelManager = new ChannelManager();

    const wss = (this._wss = new WebSocket.Server({ noServer: true }));

    wss.on('connection', ws => {
      const type = ws.type;
      if (type === 'target') {
        const { id, url, title, favicon, ip} = ws;
        this.channelManager.createTarget(id, ws, url, title, favicon);
      } else {
        const { id, target, ip} = ws;
        this.channelManager.createClient(id, ws, target);
      }
    });
  }
  start(server) {
    const wss = this._wss;

    server.on('upgrade', function (request, socket, head) {
      const urlObj = url.parse(request.url);
      const pathname = urlObj.pathname.split('/');

      const type = pathname[1];
      const id = pathname[2];

      if (type === 'target' || type === 'client') {
        wss.handleUpgrade(request, socket, head, ws => {
          console.log(ws._socket.remoteAddress);
          ws.type = type;
          ws.id = id;
          ws.ip = ws._socket.remoteAddress;
          const q = query.parse(urlObj.query);
          if (type === 'target') {
            ws.url = q.url;
            ws.title = q.title;
            ws.favicon = q.favicon;
          } else {
            ws.target = q.target;
          }
          wss.emit('connection', ws, request);
        });
      } else {
        socket.destroy();
      }
    });
  }
};
