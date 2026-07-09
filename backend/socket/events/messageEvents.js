const Message = require('../../models/Message');
const Conversation = require('../../models/Conversation');
const { createNotification } = require('../../services/notificationService');
const { conversationRoom, userRoom } = require('../rooms');
const { emitNewNotification } = require('./notificationEvents');

const registerMessageEvents = (io, socket) => {
  const userId = socket.user._id.toString();

  // Client joins a conversation room when opening that chat
  socket.on('join room', async ({ conversationId }) => {
    if (!conversationId) return;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: userId,
    });
    if (!conversation) return; // silently ignore unauthorized join attempts

    socket.join(conversationRoom(conversationId));
  });

  socket.on('leave room', ({ conversationId }) => {
    if (!conversationId) return;
    socket.leave(conversationRoom(conversationId));
  });

  // Persist and broadcast a new message. Media uploads happen via the REST
  // endpoint first (Cloudinary needs multipart/form-data); this event
  // handles the resulting message payload for real-time delivery, as well
  // as plain text messages sent directly over the socket.
  socket.on('send message', async (payload, ack) => {
    try {
      const { conversationId, content, type = 'text', media, replyTo, mentions } = payload;

      const conversation = await Conversation.findOne({
        _id: conversationId,
        participants: userId,
      });
      if (!conversation) {
        return ack?.({ success: false, message: 'Conversation not found' });
      }

      const message = await Message.create({
        conversation: conversationId,
        sender: userId,
        content,
        type,
        media,
        replyTo: replyTo || null,
        mentions: mentions || [],
        status: 'sent',
      });

      const populatedMessage = await message.populate([
        { path: 'sender', select: 'name username avatar' },
        { path: 'replyTo' },
      ]);

      // Update conversation metadata: last message, activity time, unread counts
      conversation.lastMessage = message._id;
      conversation.lastActivity = new Date();

      conversation.participants.forEach((participantId) => {
        const pid = participantId.toString();
        if (pid === userId) return; // sender doesn't get their own unread bump

        const entry = conversation.unreadCounts.find((u) => u.user.toString() === pid);
        if (entry) {
          entry.count += 1;
        } else {
          conversation.unreadCounts.push({ user: pid, count: 1 });
        }
      });

      await conversation.save();

      io.to(conversationRoom(conversationId)).emit('receive message', populatedMessage);

      // Also notify each participant's personal room, so unread badges /
      // notification bells update even if they don't have this chat open
      for (const participantId of conversation.participants) {
        const pid = participantId.toString();
        if (pid === userId) continue;

        io.to(userRoom(pid)).emit('new message notification', {
          conversationId,
          message: populatedMessage,
        });

        const notification = await createNotification({
          recipient: pid,
          sender: userId,
          type: 'message',
          conversation: conversationId,
          message: populatedMessage._id,
          text: type === 'text' ? content?.slice(0, 100) : `Sent a ${type}`,
        });

        if (notification) emitNewNotification(io, { recipientId: pid, notification });
      }

      ack?.({ success: true, message: populatedMessage });
    } catch (error) {
      ack?.({ success: false, message: error.message });
    }
  });

  // Recipient's client confirms delivery (message reached their device)
  socket.on('message delivered', async ({ messageId, conversationId }) => {
    if (!messageId) return;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { deliveredTo: { user: userId, at: new Date() } },
      $set: { status: 'delivered' },
    });

    io.to(conversationRoom(conversationId)).emit('message delivered', { messageId, userId });
  });

  // Recipient's client confirms the message was seen/read
  socket.on('message seen', async ({ messageId, conversationId }) => {
    if (!messageId) return;

    await Message.findByIdAndUpdate(messageId, {
      $addToSet: { seenBy: { user: userId, at: new Date() } },
      $set: { status: 'seen' },
    });

    // Reset this user's unread count for the conversation
    await Conversation.updateOne(
      { _id: conversationId, 'unreadCounts.user': userId },
      { $set: { 'unreadCounts.$.count': 0 } }
    );

    io.to(conversationRoom(conversationId)).emit('message seen', { messageId, userId });
  });
};

module.exports = registerMessageEvents;
