const { userRoom, conversationRoom } = require('../rooms');

/**
 * Group membership changes are triggered via the REST group controller
 * (so they go through validation/admin checks), which then uses
 * `req.app.get('io')` to emit these same events. This module just centralizes
 * the socket-side listeners for anything a client emits directly, such as
 * a lightweight "member is viewing group info" presence signal.
 */
const registerGroupEvents = (io, socket) => {
  socket.on('group updated', ({ groupId, conversationId }) => {
    if (!conversationId) return;
    io.to(conversationRoom(conversationId)).emit('group updated', { groupId, conversationId });
  });
};

/**
 * Helper used by groupController to notify newly added/removed members
 * and existing members about group changes.
 */
const emitGroupMemberAdded = (io, { conversationId, groupId, addedUserIds, actorId }) => {
  io.to(conversationRoom(conversationId)).emit('group member added', {
    groupId,
    conversationId,
    addedUserIds,
    actorId,
  });
  addedUserIds.forEach((uid) => {
    io.to(userRoom(uid)).emit('added to group', { groupId, conversationId });
  });
};

const emitGroupMemberRemoved = (io, { conversationId, groupId, removedUserId, actorId }) => {
  io.to(conversationRoom(conversationId)).emit('group member removed', {
    groupId,
    conversationId,
    removedUserId,
    actorId,
  });
  io.to(userRoom(removedUserId)).emit('removed from group', { groupId, conversationId });
};

module.exports = {
  registerGroupEvents,
  emitGroupMemberAdded,
  emitGroupMemberRemoved,
};
