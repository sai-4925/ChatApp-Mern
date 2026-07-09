const asyncHandler = require('express-async-handler');
const userService = require('../services/userService');
const { sendSuccess } = require('../utils/apiResponse');
const ApiError = require('../utils/ApiError');

/**
 * @route   GET /api/users/me
 * @access  Private
 */
const getCurrentUser = asyncHandler(async (req, res) => {
  return sendSuccess(res, 200, 'Current user fetched', { user: req.user.toSafeObject() });
});

/**
 * @route   GET /api/users/search?q=&page=&limit=
 * @access  Private
 */
const searchUsers = asyncHandler(async (req, res) => {
  const { q, page, limit } = req.query;
  const users = await userService.searchUsers(req.user._id, q, {
    page: Number(page) || 1,
    limit: Number(limit) || undefined,
  });
  return sendSuccess(res, 200, 'Users fetched', { users });
});

/**
 * @route   GET /api/users/:userId
 * @access  Private
 */
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  return sendSuccess(res, 200, 'User fetched', { user: user.toSafeObject() });
});

/**
 * @route   PUT /api/users/me
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user._id, req.body);
  return sendSuccess(res, 200, 'Profile updated', { user: user.toSafeObject() });
});

/**
 * @route   PUT /api/users/me/avatar
 * @access  Private
 * @note    Expects `upload.single('avatar')` middleware to run first,
 *          populating req.file with the Cloudinary result.
 */
const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No image file provided');

  const user = await userService.updateAvatar(req.user._id, {
    url: req.file.path,
    publicId: req.file.filename,
  });

  return sendSuccess(res, 200, 'Avatar updated', { user: user.toSafeObject() });
});

/**
 * @route   PUT /api/users/me/settings
 * @access  Private
 */
const updateSettings = asyncHandler(async (req, res) => {
  const user = await userService.updateSettings(req.user._id, req.body);
  return sendSuccess(res, 200, 'Settings updated', { user: user.toSafeObject() });
});

/**
 * @route   PUT /api/users/me/password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user._id, currentPassword, newPassword);
  return sendSuccess(res, 200, 'Password changed successfully');
});

/**
 * @route   POST /api/users/:userId/block
 * @access  Private
 */
const blockUser = asyncHandler(async (req, res) => {
  await userService.blockUser(req.user._id, req.params.userId);
  return sendSuccess(res, 200, 'User blocked');
});

/**
 * @route   DELETE /api/users/:userId/block
 * @access  Private
 */
const unblockUser = asyncHandler(async (req, res) => {
  await userService.unblockUser(req.user._id, req.params.userId);
  return sendSuccess(res, 200, 'User unblocked');
});

/**
 * @route   GET /api/users/me/blocked
 * @access  Private
 */
const getBlockedUsers = asyncHandler(async (req, res) => {
  const blockedUsers = await userService.getBlockedUsers(req.user._id);
  return sendSuccess(res, 200, 'Blocked users fetched', { blockedUsers });
});

/**
 * @route   POST /api/users/:userId/contact
 * @access  Private
 */
const addContact = asyncHandler(async (req, res) => {
  await userService.addContact(req.user._id, req.params.userId);
  return sendSuccess(res, 200, 'Contact added');
});

/**
 * @route   DELETE /api/users/:userId/contact
 * @access  Private
 */
const removeContact = asyncHandler(async (req, res) => {
  await userService.removeContact(req.user._id, req.params.userId);
  return sendSuccess(res, 200, 'Contact removed');
});

/**
 * @route   GET /api/users/me/contacts
 * @access  Private
 */
const getContacts = asyncHandler(async (req, res) => {
  const contacts = await userService.getContacts(req.user._id);
  return sendSuccess(res, 200, 'Contacts fetched', { contacts });
});

module.exports = {
  getCurrentUser,
  searchUsers,
  getUserProfile,
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
