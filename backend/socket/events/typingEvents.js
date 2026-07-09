const { conversationRoom } = require('../rooms');

const registerTypingEvents = (io, socket) => {
  socket.on('typing', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(conversationRoom(conversationId)).emit('typing', {
      conversationId,
      userId: socket.user._id.toString(),
    });
  });

  socket.on('stop typing', ({ conversationId }) => {
    if (!conversationId) return;
    socket.to(conversationRoom(conversationId)).emit('stop typing', {
      conversationId,
      userId: socket.user._id.toString(),
    });
  });
};

module.exports = registerTypingEvents;
