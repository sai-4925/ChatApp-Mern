const { userRoom } = require('../rooms');

/**
 * No client-emitted events needed here yet (notifications are server-driven).
 * This module exposes a helper other services/controllers can call via the
 * `io` instance stored on `req.app.get('io')` to push a real-time notification.
 */
const registerNotificationEvents = (io, socket) => {
  // Reserved for future client-emitted events, e.g. "mark all as read" over socket.
  socket.on('notification:ping', () => {
    socket.emit('notification:pong');
  });
};

const emitNewNotification = (io, { recipientId, notification }) => {
  io.to(userRoom(recipientId)).emit('new notification', notification);
};

module.exports = { registerNotificationEvents, emitNewNotification };
