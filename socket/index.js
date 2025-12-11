const WebSocket = require('ws');
const { handleConnection } = require('./handlers');

function setupWebSocket(server) {
  const wss = new WebSocket.Server({ server });

  wss.on('connection', (ws) => {
    console.log('🟢 WebSocket client connected');
    handleConnection(ws);
  });

  wss.on('error', (err) => {
    console.log('WebSocket Server Error:', err.message);
  });
}

module.exports = { setupWebSocket };
