const { Server } = require('socket.io');

// The Socket.io layer for Plume. The REST controllers stay the source of
// truth for writes (create post, like, follow); after a successful write
// they call `emitToAll(...)` so every connected client updates live without
// polling. This module owns the single `io` instance and a tiny presence
// counter that proves the realtime pipe is open ("N writing now").
let io = null;
let onlineCount = 0;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    onlineCount += 1;
    // Send the new arrival the current count immediately, then tell everyone.
    socket.emit('presence:count', onlineCount);
    socket.broadcast.emit('presence:count', onlineCount);

    socket.on('disconnect', () => {
      onlineCount = Math.max(0, onlineCount - 1);
      io.emit('presence:count', onlineCount);
    });
  });

  console.log('✓ Socket.io ready');
  return io;
};

// Broadcast a realtime event to every connected client. No-op if sockets
// aren't initialized (e.g. during seeding), so controllers can call it freely.
const emitToAll = (event, payload) => {
  if (io) io.emit(event, payload);
};

const getIO = () => {
  if (!io) throw new Error('Socket.io has not been initialized');
  return io;
};

module.exports = { initSocket, emitToAll, getIO };
