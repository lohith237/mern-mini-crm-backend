function handleConnection(ws) {
  console.log('📲 A client connected');

  ws.send('👋 Welcome to the chat!');

  ws.on('message', (message) => {
    console.log('💬 Message from client:', message);
  });

  ws.on('close', () => {
    console.log('❌ Client disconnected');
  });
}

module.exports = { handleConnection };
