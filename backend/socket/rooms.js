/**
 * Every conversation (1:1 or group) gets its own Socket.io room so events
 * (new message, typing, seen) only reach participants of that conversation.
 */
const conversationRoom = (conversationId) => `conversation:${conversationId}`;

/**
 * Each user also joins a personal room so we can push events to them
 * directly (e.g. notifications, "you were added to a group") regardless
 * of which conversation room they're currently viewing.
 */
const userRoom = (userId) => `user:${userId}`;

module.exports = { conversationRoom, userRoom };
