const User = require('../../models/User');
const Conversation = require('../../models/Conversation');
const { userRoom, conversationRoom } = require('../rooms');

// Tracks how many active socket connections each user currently has open
// (they may have multiple tabs/devices), so we only mark them "offline"
// once every connection has closed.
const activeConnectionCounts = new Map();

const registerOnlineEvents = (io, socket) => {
  const userId = socket.user._id.toString();

  const handleConnect = async () => {
    socket.join(userRoom(userId));

    const count = (activeConnectionCounts.get(userId) || 0) + 1;
    activeConnectionCounts.set(userId, count);

    if (count === 1) {
      await User.findByIdAndUpdate(userId, { isOnline: true });

      // Notify every conversation this user is part of that they're online
      const conversations = await Conversation.find({ participants: userId }).select('_id');
      conversations.forEach((c) => {
        io.to(conversationRoom(c._id)).emit('user online', { userId });
      });
    }
  };

  const handleDisconnect = async () => {
    const count = Math.max((activeConnectionCounts.get(userId) || 1) - 1, 0);
    activeConnectionCounts.set(userId, count);

    if (count === 0) {
      const lastSeen = new Date();
      await User.findByIdAndUpdate(userId, { isOnline: false, lastSeen });

      const conversations = await Conversation.find({ participants: userId }).select('_id');
      conversations.forEach((c) => {
        io.to(conversationRoom(c._id)).emit('user offline', { userId, lastSeen });
      });
    }
  };

  handleConnect();
  socket.on('disconnect', handleDisconnect);
};

module.exports = registerOnlineEvents;
