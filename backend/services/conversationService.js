const Conversation = require('../models/Conversation');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');

const POPULATE_PARTICIPANTS = 'name username avatar isOnline lastSeen';

/**
 * Lists all conversations a user participates in, sorted by most recent
 * activity. `filter` narrows to pinned or archived views; by default,
 * archived conversations are excluded from the main list.
 */
const getUserConversations = async (userId, filter = 'all') => {
  const query = { participants: userId };

  if (filter === 'pinned') {
    query.pinnedBy = userId;
  } else if (filter === 'archived') {
    query.archivedBy = userId;
  } else {
    query.archivedBy = { $ne: userId };
  }

  const conversations = await Conversation.find(query)
    .populate('participants', POPULATE_PARTICIPANTS)
    .populate({
      path: 'lastMessage',
      populate: { path: 'sender', select: 'name username' },
    })
    .populate('group', 'name avatar description')
    .sort({ lastActivity: -1 });

  return conversations;
};

/**
 * Finds an existing 1:1 conversation between two users, or creates one.
 * Keeps a single canonical conversation per pair rather than duplicating.
 */
const findOrCreateOneToOne = async (userId, participantId) => {
  if (userId.toString() === participantId.toString()) {
    throw new ApiError(400, 'Cannot start a conversation with yourself');
  }

  const participant = await User.findById(participantId);
  if (!participant) throw new ApiError(404, 'User not found');

  let conversation = await Conversation.findOne({
    isGroup: false,
    participants: { $all: [userId, participantId], $size: 2 },
  });

  if (!conversation) {
    conversation = await Conversation.create({
      isGroup: false,
      participants: [userId, participantId],
    });
  }

  await conversation.populate('participants', POPULATE_PARTICIPANTS);
  return conversation;
};

const assertParticipant = async (conversationId, userId) => {
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) throw new ApiError(404, 'Conversation not found');
  if (!conversation.participants.some((p) => p.toString() === userId.toString())) {
    throw new ApiError(403, 'You are not a participant in this conversation');
  }
  return conversation;
};

const togglePin = async (conversationId, userId) => {
  const conversation = await assertParticipant(conversationId, userId);
  const isPinned = conversation.pinnedBy.some((id) => id.toString() === userId.toString());

  if (isPinned) {
    conversation.pinnedBy = conversation.pinnedBy.filter((id) => id.toString() !== userId.toString());
  } else {
    conversation.pinnedBy.push(userId);
  }

  await conversation.save();
  return conversation;
};

const toggleArchive = async (conversationId, userId) => {
  const conversation = await assertParticipant(conversationId, userId);
  const isArchived = conversation.archivedBy.some((id) => id.toString() === userId.toString());

  if (isArchived) {
    conversation.archivedBy = conversation.archivedBy.filter(
      (id) => id.toString() !== userId.toString()
    );
  } else {
    conversation.archivedBy.push(userId);
  }

  await conversation.save();
  return conversation;
};

const setMute = async (conversationId, userId, until) => {
  const conversation = await assertParticipant(conversationId, userId);

  conversation.muteUntil = conversation.muteUntil.filter(
    (m) => m.user.toString() !== userId.toString()
  );

  if (until) {
    conversation.muteUntil.push({ user: userId, until: new Date(until) });
  }

  await conversation.save();
  return conversation;
};

const setWallpaper = async (conversationId, userId, url) => {
  const conversation = await assertParticipant(conversationId, userId);

  conversation.chatWallpaper = conversation.chatWallpaper.filter(
    (w) => w.user.toString() !== userId.toString()
  );
  conversation.chatWallpaper.push({ user: userId, url });

  await conversation.save();
  return conversation;
};

module.exports = {
  getUserConversations,
  findOrCreateOneToOne,
  assertParticipant,
  togglePin,
  toggleArchive,
  setMute,
  setWallpaper,
};
