const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const ApiError = require('../utils/ApiError');
const { deleteAsset, resourceTypeForMessageType } = require('./uploadService');
const { PAGINATION } = require('../constants');

const SENDER_FIELDS = 'name username avatar';

const assertParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }
  return conversation;
};

/**
 * Fetches a page of messages for a conversation, newest-first, excluding
 * any messages the requesting user has individually deleted. Supports
 * infinite-scroll pagination via `before` (a message id/timestamp cursor).
 */
const getConversationMessages = async (
  conversationId,
  userId,
  { page = 1, limit = PAGINATION.DEFAULT_LIMIT } = {}
) => {
  await assertParticipant(conversationId, userId);

  const messages = await Message.find({
    conversation: conversationId,
    deletedFor: { $ne: userId },
  })
    .populate('sender', SENDER_FIELDS)
    .populate({ path: 'replyTo', populate: { path: 'sender', select: SENDER_FIELDS } })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Math.min(limit, PAGINATION.MAX_LIMIT));

  // Return chronological order (oldest first) for easy rendering top-to-bottom
  return messages.reverse();
};

/**
 * Creates a new message (text or media — media upload already happened via
 * the upload middleware, so `media` here is the resulting Cloudinary info).
 * Updates the parent conversation's lastMessage/lastActivity/unreadCounts.
 */
const sendMessage = async (userId, { conversationId, content, type = 'text', media, replyTo, mentions }) => {
  const conversation = await assertParticipant(conversationId, userId);

  const message = await Message.create({
    conversation: conversationId,
    sender: userId,
    content: content || '',
    type,
    media,
    replyTo: replyTo || null,
    mentions: mentions || [],
    status: 'sent',
  });

  conversation.lastMessage = message._id;
  conversation.lastActivity = new Date();

  conversation.participants.forEach((participantId) => {
    const pid = participantId.toString();
    if (pid === userId.toString()) return;

    const entry = conversation.unreadCounts.find((u) => u.user.toString() === pid);
    if (entry) entry.count += 1;
    else conversation.unreadCounts.push({ user: pid, count: 1 });
  });

  await conversation.save();

  await message.populate([
    { path: 'sender', select: SENDER_FIELDS },
    { path: 'replyTo', populate: { path: 'sender', select: SENDER_FIELDS } },
  ]);

  return { message, conversation };
};

/**
 * Forwards an existing message's content/media into one or more other
 * conversations the user participates in.
 */
const forwardMessage = async (userId, messageId, targetConversationIds) => {
  const original = await Message.findById(messageId);
  if (!original) throw new ApiError(404, 'Message not found');

  const results = [];
  for (const conversationId of targetConversationIds) {
    const { message } = await sendMessage(userId, {
      conversationId,
      content: original.content,
      type: original.type,
      media: original.media,
    });
    message.isForwarded = true;
    await message.save();
    results.push(message);
  }

  return results;
};

const editMessage = async (userId, messageId, newContent) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only edit your own messages');
  }
  if (message.type !== 'text') {
    throw new ApiError(400, 'Only text messages can be edited');
  }

  message.content = newContent;
  message.isEdited = true;
  message.editedAt = new Date();
  await message.save();
  await message.populate('sender', SENDER_FIELDS);

  return message;
};

/**
 * Hides a message from just this user's view (WhatsApp "Delete for me").
 */
const deleteForMe = async (userId, messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  await Message.updateOne({ _id: messageId }, { $addToSet: { deletedFor: userId } });
  return message;
};

/**
 * Deletes a message for all participants (WhatsApp "Delete for everyone").
 * Only the original sender may do this. Cleans up the Cloudinary asset
 * if the message contained media.
 */
const deleteForEveryone = async (userId, messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');
  if (message.sender.toString() !== userId.toString()) {
    throw new ApiError(403, 'You can only delete your own messages for everyone');
  }

  if (message.media?.publicId) {
    await deleteAsset(message.media.publicId, resourceTypeForMessageType(message.type));
  }

  message.deletedForEveryone = true;
  message.deletedAt = new Date();
  message.content = '';
  message.media = undefined;
  await message.save();

  return message;
};

const toggleReaction = async (userId, messageId, emoji) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  const existingIndex = message.reactions.findIndex(
    (r) => r.user.toString() === userId.toString() && r.emoji === emoji
  );

  if (existingIndex > -1) {
    // Same emoji already reacted by this user -> remove (toggle off)
    message.reactions.splice(existingIndex, 1);
  } else {
    // Remove any other reaction by this user first (one reaction per user per message)
    message.reactions = message.reactions.filter((r) => r.user.toString() !== userId.toString());
    message.reactions.push({ user: userId, emoji });
  }

  await message.save();
  return message;
};

const toggleStar = async (userId, messageId) => {
  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, 'Message not found');

  const isStarred = message.starredBy.some((id) => id.toString() === userId.toString());
  if (isStarred) {
    message.starredBy = message.starredBy.filter((id) => id.toString() !== userId.toString());
  } else {
    message.starredBy.push(userId);
  }

  await message.save();
  return message;
};

const getStarredMessages = async (userId) => {
  return Message.find({ starredBy: userId })
    .populate('sender', SENDER_FIELDS)
    .populate('conversation', 'isGroup')
    .sort({ createdAt: -1 });
};

/**
 * Searches message content within a single conversation using a case
 * insensitive regex (small-scale; a text index also exists for larger data).
 */
const searchMessagesInConversation = async (conversationId, userId, query) => {
  await assertParticipant(conversationId, userId);

  return Message.find({
    conversation: conversationId,
    deletedFor: { $ne: userId },
    deletedForEveryone: false,
    content: { $regex: query, $options: 'i' },
  })
    .populate('sender', SENDER_FIELDS)
    .sort({ createdAt: -1 });
};

module.exports = {
  getConversationMessages,
  sendMessage,
  forwardMessage,
  editMessage,
  deleteForMe,
  deleteForEveryone,
  toggleReaction,
  toggleStar,
  getStarredMessages,
  searchMessagesInConversation,
  assertParticipant,
};
