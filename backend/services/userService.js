const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { deleteAsset } = require('./uploadService');
const { PAGINATION } = require('../constants');

/**
 * Fetches a public-safe user profile by id, excluding the requesting
 * user's own blocked-list noise.
 */
const getUserById = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * Full-text-ish search across name/username/email, excluding the requester
 * and anyone who has blocked or been blocked by them.
 */
const searchUsers = async (requesterId, query, { page = 1, limit = PAGINATION.DEFAULT_LIMIT } = {}) => {
  const requester = await User.findById(requesterId).select('blockedUsers');

  const regex = new RegExp(query, 'i');
  const users = await User.find({
    _id: { $ne: requesterId, $nin: requester.blockedUsers },
    blockedUsers: { $ne: requesterId },
    $or: [{ name: regex }, { username: regex }, { email: regex }],
  })
    .select('name username avatar bio isOnline lastSeen')
    .skip((page - 1) * limit)
    .limit(Math.min(limit, PAGINATION.MAX_LIMIT));

  return users;
};

/**
 * Updates editable profile fields. Username/email uniqueness is enforced
 * by the Mongoose schema's unique index (surfaces as a 409 via errorMiddleware).
 */
const updateProfile = async (userId, updates) => {
  const allowedFields = ['name', 'username', 'bio', 'status'];
  const sanitizedUpdates = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) sanitizedUpdates[field] = updates[field];
  });

  const user = await User.findByIdAndUpdate(userId, sanitizedUpdates, {
    new: true,
    runValidators: true,
  });

  if (!user) throw new ApiError(404, 'User not found');
  return user;
};

/**
 * Replaces the user's avatar, cleaning up the previous Cloudinary asset.
 */
const updateAvatar = async (userId, { url, publicId }) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  const previousPublicId = user.avatar?.publicId;

  user.avatar = { url, publicId };
  await user.save();

  if (previousPublicId) {
    await deleteAsset(previousPublicId, 'image');
  }

  return user;
};

const updateSettings = async (userId, settingsUpdate) => {
  const user = await User.findById(userId);
  if (!user) throw new ApiError(404, 'User not found');

  if (settingsUpdate.theme) user.settings.theme = settingsUpdate.theme;
  if (settingsUpdate.notifications?.sound !== undefined) {
    user.settings.notifications.sound = settingsUpdate.notifications.sound;
  }
  if (settingsUpdate.notifications?.browser !== undefined) {
    user.settings.notifications.browser = settingsUpdate.notifications.browser;
  }
  if (settingsUpdate.privacy?.lastSeen) {
    user.settings.privacy.lastSeen = settingsUpdate.privacy.lastSeen;
  }
  if (settingsUpdate.privacy?.readReceipts !== undefined) {
    user.settings.privacy.readReceipts = settingsUpdate.privacy.readReceipts;
  }

  await user.save();
  return user;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await User.findById(userId).select('+password');
  if (!user) throw new ApiError(404, 'User not found');

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  user.password = newPassword;
  await user.save();
  return user;
};

const blockUser = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, 'You cannot block yourself');
  }

  const target = await User.findById(targetUserId);
  if (!target) throw new ApiError(404, 'User not found');

  await User.findByIdAndUpdate(userId, { $addToSet: { blockedUsers: targetUserId } });
  return target;
};

const unblockUser = async (userId, targetUserId) => {
  await User.findByIdAndUpdate(userId, { $pull: { blockedUsers: targetUserId } });
};

const getBlockedUsers = async (userId) => {
  const user = await User.findById(userId).populate('blockedUsers', 'name username avatar');
  return user.blockedUsers;
};

const addContact = async (userId, targetUserId) => {
  if (userId.toString() === targetUserId.toString()) {
    throw new ApiError(400, 'You cannot add yourself as a contact');
  }

  const target = await User.findById(targetUserId);
  if (!target) throw new ApiError(404, 'User not found');

  await User.findByIdAndUpdate(userId, { $addToSet: { contacts: targetUserId } });
  return target;
};

const removeContact = async (userId, targetUserId) => {
  await User.findByIdAndUpdate(userId, { $pull: { contacts: targetUserId } });
};

const getContacts = async (userId) => {
  const user = await User.findById(userId).populate(
    'contacts',
    'name username avatar bio isOnline lastSeen'
  );
  return user.contacts;
};

module.exports = {
  getUserById,
  searchUsers,
  updateProfile,
  updateAvatar,
  updateSettings,
  changePassword,
  blockUser,
  unblockUser,
  getBlockedUsers,
  addContact,
  removeContact,
  getContacts,
};
