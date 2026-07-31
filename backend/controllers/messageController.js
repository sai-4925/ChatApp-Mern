const asyncHandler = require('express-async-handler');
const messageService = require('../services/messageService');
const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');
const { conversationRoom } = require('../socket/rooms');
const { emitNewNotification } = require('../socket/events/notificationEvents');
const ApiError = require('../utils/ApiError');

/**
 * @route   GET /api/messages/:conversationId?page=&limit=
 * @access  Private
 */
const getMessages = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const messages = await messageService.getConversationMessages(
    req.params.conversationId,
    req.user._id,
    { page: Number(page) || 1, limit: Number(limit) || undefined }
  );
  return sendSuccess(res, 200, 'Messages fetched', { messages });
});

/**
 * @route   POST /api/messages
 * @access  Private
 * @note    Handles both text messages and media messages (media messages
 *          run through `upload.single('media')` first; text-only messages
 *          sent purely for real-time delivery are typically sent via the
 *          socket 'send message' event instead — this REST endpoint is the
 *          canonical path whenever a file attachment is involved).
 */
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content, type, replyTo, mentions } = req.body;

  const media = req.file
  ? {
      url: `/uploads/${req.file.filename}`,
      publicId: req.file.filename,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    }
  : undefined;

  const { message, conversation } = await messageService.sendMessage(req.user._id, {
    conversationId,
    content,
    type: media ? type : 'text',
    media,
    replyTo,
    mentions,
  });

  const io = req.app.get('io');
  io.to(conversationRoom(conversationId)).emit('receive message', message);

  for (const participantId of conversation.participants) {
    if (participantId.toString() === req.user._id.toString()) continue;

    io.to(`user:${participantId}`).emit('new message notification', {
      conversationId,
      message,
    });

    const notification = await notificationService.createNotification({
      recipient: participantId,
      sender: req.user._id,
      type: 'message',
      conversation: conversationId,
      message: message._id,
      text: type === 'text' ? content?.slice(0, 100) : `Sent a ${type}`,
    });

    if (notification) emitNewNotification(io, { recipientId: participantId, notification });
  }

  return sendSuccess(res, 201, 'Message sent', { message });
});

/**
 * @route   PUT /api/messages/:messageId
 * @body    { content }
 * @access  Private
 */
const editMessage = asyncHandler(async (req, res) => {
  const message = await messageService.editMessage(req.user._id, req.params.messageId, req.body.content);

  const io = req.app.get('io');
  io.to(conversationRoom(message.conversation)).emit('message edited', message);

  return sendSuccess(res, 200, 'Message updated', { message });
});

/**
 * @route   DELETE /api/messages/:messageId/me
 * @access  Private
 */
const deleteForMe = asyncHandler(async (req, res) => {
  await messageService.deleteForMe(req.user._id, req.params.messageId);
  return sendSuccess(res, 200, 'Message deleted for you');
});

/**
 * @route   DELETE /api/messages/:messageId/everyone
 * @access  Private
 */
const deleteForEveryone = asyncHandler(async (req, res) => {
  const message = await messageService.deleteForEveryone(req.user._id, req.params.messageId);

  const io = req.app.get('io');
  io.to(conversationRoom(message.conversation)).emit('message deleted', {
    messageId: message._id,
  });

  return sendSuccess(res, 200, 'Message deleted for everyone');
});

/**
 * @route   POST /api/messages/:messageId/react
 * @body    { emoji }
 * @access  Private
 */
const toggleReaction = asyncHandler(async (req, res) => {
  const message = await messageService.toggleReaction(req.user._id, req.params.messageId, req.body.emoji);

  const io = req.app.get('io');
  io.to(conversationRoom(message.conversation)).emit('message reaction', {
    messageId: message._id,
    reactions: message.reactions,
  });

  return sendSuccess(res, 200, 'Reaction updated', { message });
});

/**
 * @route   POST /api/messages/:messageId/star
 * @access  Private
 */
const toggleStar = asyncHandler(async (req, res) => {
  const message = await messageService.toggleStar(req.user._id, req.params.messageId);
  return sendSuccess(res, 200, 'Star toggled', { message });
});

/**
 * @route   GET /api/messages/starred/me
 * @access  Private
 */
const getStarredMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.getStarredMessages(req.user._id);
  return sendSuccess(res, 200, 'Starred messages fetched', { messages });
});

/**
 * @route   POST /api/messages/:messageId/forward
 * @body    { conversationIds: [] }
 * @access  Private
 */
const forwardMessage = asyncHandler(async (req, res) => {
  const messages = await messageService.forwardMessage(
    req.user._id,
    req.params.messageId,
    req.body.conversationIds
  );

  const io = req.app.get('io');
  messages.forEach((message) => {
    io.to(conversationRoom(message.conversation)).emit('receive message', message);
  });

  return sendSuccess(res, 201, 'Message forwarded', { messages });
});

/**
 * @route   GET /api/messages/:conversationId/search?q=
 * @access  Private
 */
const searchMessages = asyncHandler(async (req, res) => {
  const messages = await messageService.searchMessagesInConversation(
    req.params.conversationId,
    req.user._id,
    req.query.q
  );
  return sendSuccess(res, 200, 'Search results fetched', { messages });
});

module.exports = {
  getMessages,
  sendMessage,
  editMessage,
  deleteForMe,
  deleteForEveryone,
  toggleReaction,
  toggleStar,
  getStarredMessages,
  forwardMessage,
  searchMessages,
};
