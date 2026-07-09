const socketAuth = require('./socketAuth');
const registerOnlineEvents = require('./events/onlineEvents');
const registerTypingEvents = require('./events/typingEvents');
const registerMessageEvents = require('./events/messageEvents');
const { registerGroupEvents } = require('./events/groupEvents');
const { registerNotificationEvents } = require('./events/notificationEvents');

/**
 * Wires up the Socket.io server: authenticates every connecting socket via
 * JWT, then registers each domain's event handlers on that socket.
 */
const initSocket = (io) => {
  io.use(socketAuth);

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id} (user ${socket.user._id})`);

    registerOnlineEvents(io, socket);
    registerTypingEvents(io, socket);
    registerMessageEvents(io, socket);
    registerGroupEvents(io, socket);
    registerNotificationEvents(io, socket);

    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id} (${reason})`);
    });
  });
};

module.exports = initSocket;
