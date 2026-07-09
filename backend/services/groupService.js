const Group = require('../models/Group');
const Conversation = require('../models/Conversation');
const ApiError = require('../utils/ApiError');
const { deleteAsset } = require('./uploadService');

const assertIsAdmin = (group, userId) => {
  if (!group.admins.some((id) => id.toString() === userId.toString())) {
    throw new ApiError(403, 'Only group admins can perform this action');
  }
};

const assertIsMember = (group, userId) => {
  if (!group.members.some((id) => id.toString() === userId.toString())) {
    throw new ApiError(403, 'You are not a member of this group');
  }
};

/**
 * Creates a group and its backing Conversation document together, since
 * every group chat needs both: Group holds the group-specific metadata,
 * Conversation is what messages actually attach to.
 */
const createGroup = async (creatorId, { name, description, memberIds }) => {
  const uniqueMemberIds = Array.from(new Set([...memberIds, creatorId.toString()]));

  const group = await Group.create({
    name,
    description: description || '',
    admins: [creatorId],
    members: uniqueMemberIds,
    createdBy: creatorId,
  });

  const conversation = await Conversation.create({
    isGroup: true,
    participants: uniqueMemberIds,
    group: group._id,
  });

  await group.populate('members admins', 'name username avatar');
  return { group, conversation };
};

const getGroupById = async (groupId, userId) => {
  const group = await Group.findById(groupId).populate('members admins', 'name username avatar isOnline');
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsMember(group, userId);
  return group;
};

const updateGroupDetails = async (groupId, userId, updates) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, userId);

  if (updates.name !== undefined) group.name = updates.name;
  if (updates.description !== undefined) group.description = updates.description;

  await group.save();
  return group;
};

const updateGroupAvatar = async (groupId, userId, { url, publicId }) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, userId);

  const previousPublicId = group.avatar?.publicId;
  group.avatar = { url, publicId };
  await group.save();

  if (previousPublicId) await deleteAsset(previousPublicId, 'image');
  return group;
};

const addMembers = async (groupId, actorId, memberIds) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, actorId);

  const newMemberIds = memberIds.filter(
    (id) => !group.members.some((m) => m.toString() === id.toString())
  );

  group.members.push(...newMemberIds);
  await group.save();

  await Conversation.updateOne(
    { group: groupId },
    { $addToSet: { participants: { $each: newMemberIds } } }
  );

  const conversation = await Conversation.findOne({ group: groupId });
  return { group, conversation, addedMemberIds: newMemberIds };
};

const removeMember = async (groupId, actorId, memberId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, actorId);

  const isSelfLeave = actorId.toString() === memberId.toString();
  if (!isSelfLeave) {
    assertIsAdmin(group, actorId);
  }

  group.members = group.members.filter((id) => id.toString() !== memberId.toString());
  group.admins = group.admins.filter((id) => id.toString() !== memberId.toString());
  await group.save();

  await Conversation.updateOne({ group: groupId }, { $pull: { participants: memberId } });

  const conversation = await Conversation.findOne({ group: groupId });
  return { group, conversation };
};

const promoteToAdmin = async (groupId, actorId, memberId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, actorId);
  assertIsMember(group, memberId);

  if (!group.admins.some((id) => id.toString() === memberId.toString())) {
    group.admins.push(memberId);
    await group.save();
  }

  return group;
};

const demoteAdmin = async (groupId, actorId, memberId) => {
  const group = await Group.findById(groupId);
  if (!group) throw new ApiError(404, 'Group not found');
  assertIsAdmin(group, actorId);

  if (group.admins.length === 1 && group.admins[0].toString() === memberId.toString()) {
    throw new ApiError(400, 'Cannot demote the only remaining admin');
  }

  group.admins = group.admins.filter((id) => id.toString() !== memberId.toString());
  await group.save();
  return group;
};

module.exports = {
  createGroup,
  getGroupById,
  updateGroupDetails,
  updateGroupAvatar,
  addMembers,
  removeMember,
  promoteToAdmin,
  demoteAdmin,
};
