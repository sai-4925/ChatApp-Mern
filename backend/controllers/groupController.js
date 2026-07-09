const asyncHandler = require('express-async-handler');
const groupService = require('../services/groupService');
const Conversation = require('../models/Conversation');
const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');
const { conversationRoom } = require('../socket/rooms');
const { emitGroupMemberAdded, emitGroupMemberRemoved } = require('../socket/events/groupEvents');
const { emitNewNotification } = require('../socket/events/notificationEvents');

/**
 * @route   POST /api/groups
 * @body    { name, description, memberIds }
 * @access  Private
 */
const createGroup = asyncHandler(async (req, res) => {
  const { group, conversation } = await groupService.createGroup(req.user._id, req.body);
  return sendSuccess(res, 201, 'Group created', { group, conversation });
});

/**
 * @route   GET /api/groups/:groupId
 * @access  Private
 */
const getGroup = asyncHandler(async (req, res) => {
  const group = await groupService.getGroupById(req.params.groupId, req.user._id);
  return sendSuccess(res, 200, 'Group fetched', { group });
});

/**
 * @route   PUT /api/groups/:groupId
 * @body    { name?, description? }
 * @access  Private (admin only)
 */
const updateGroup = asyncHandler(async (req, res) => {
  const group = await groupService.updateGroupDetails(req.params.groupId, req.user._id, req.body);

  const conversation = await Conversation.findOne({ group: group._id });
  const io = req.app.get('io');
  io.to(conversationRoom(conversation._id)).emit('group updated', {
    groupId: group._id,
    conversationId: conversation._id,
  });

  return sendSuccess(res, 200, 'Group updated', { group });
});

/**
 * @route   PUT /api/groups/:groupId/avatar
 * @access  Private (admin only)
 */
const updateGroupAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const group = await groupService.updateGroupAvatar(req.params.groupId, req.user._id, {
    url: req.file.path,
    publicId: req.file.filename,
  });

  return sendSuccess(res, 200, 'Group avatar updated', { group });
});

/**
 * @route   POST /api/groups/:groupId/members
 * @body    { memberIds }
 * @access  Private (admin only)
 */
const addMembers = asyncHandler(async (req, res) => {
  const { group, conversation, addedMemberIds } = await groupService.addMembers(
    req.params.groupId,
    req.user._id,
    req.body.memberIds
  );

  const io = req.app.get('io');
  emitGroupMemberAdded(io, {
    conversationId: conversation._id,
    groupId: group._id,
    addedUserIds: addedMemberIds,
    actorId: req.user._id,
  });

  for (const memberId of addedMemberIds) {
    const notification = await notificationService.createNotification({
      recipient: memberId,
      sender: req.user._id,
      type: 'group_add',
      conversation: conversation._id,
      text: `You were added to ${group.name}`,
    });
    if (notification) emitNewNotification(io, { recipientId: memberId, notification });
  }

  return sendSuccess(res, 200, 'Members added', { group });
});

/**
 * @route   DELETE /api/groups/:groupId/members/:memberId
 * @access  Private (admin only, or self to leave the group)
 */
const removeMember = asyncHandler(async (req, res) => {
  const { group, conversation } = await groupService.removeMember(
    req.params.groupId,
    req.user._id,
    req.params.memberId
  );

  const io = req.app.get('io');
  emitGroupMemberRemoved(io, {
    conversationId: conversation._id,
    groupId: group._id,
    removedUserId: req.params.memberId,
    actorId: req.user._id,
  });

  const notification = await notificationService.createNotification({
    recipient: req.params.memberId,
    sender: req.user._id,
    type: 'group_remove',
    conversation: conversation._id,
    text: `You were removed from ${group.name}`,
  });
  if (notification) emitNewNotification(io, { recipientId: req.params.memberId, notification });

  return sendSuccess(res, 200, 'Member removed', { group });
});

/**
 * @route   PUT /api/groups/:groupId/members/:memberId/promote
 * @access  Private (admin only)
 */
const promoteToAdmin = asyncHandler(async (req, res) => {
  const group = await groupService.promoteToAdmin(req.params.groupId, req.user._id, req.params.memberId);
  return sendSuccess(res, 200, 'Member promoted to admin', { group });
});

/**
 * @route   PUT /api/groups/:groupId/members/:memberId/demote
 * @access  Private (admin only)
 */
const demoteAdmin = asyncHandler(async (req, res) => {
  const group = await groupService.demoteAdmin(req.params.groupId, req.user._id, req.params.memberId);
  return sendSuccess(res, 200, 'Admin demoted to member', { group });
});

module.exports = {
  createGroup,
  getGroup,
  updateGroup,
  updateGroupAvatar,
  addMembers,
  removeMember,
  promoteToAdmin,
  demoteAdmin,
};
