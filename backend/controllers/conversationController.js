const asyncHandler = require('express-async-handler');
const conversationService = require('../services/conversationService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @route   GET /api/conversations?filter=all|pinned|archived
 * @access  Private
 */
const getConversations = asyncHandler(async (req, res) => {
  const { filter } = req.query;
  const conversations = await conversationService.getUserConversations(req.user._id, filter);
  return sendSuccess(res, 200, 'Conversations fetched', { conversations });
});

/**
 * @route   POST /api/conversations
 * @body    { participantId }
 * @access  Private
 */
const createConversation = asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const conversation = await conversationService.findOrCreateOneToOne(req.user._id, participantId);
  return sendSuccess(res, 200, 'Conversation ready', { conversation });
});

/**
 * @route   PUT /api/conversations/:conversationId/pin
 * @access  Private
 */
const togglePin = asyncHandler(async (req, res) => {
  const conversation = await conversationService.togglePin(req.params.conversationId, req.user._id);
  return sendSuccess(res, 200, 'Pin status toggled', { conversation });
});

/**
 * @route   PUT /api/conversations/:conversationId/archive
 * @access  Private
 */
const toggleArchive = asyncHandler(async (req, res) => {
  const conversation = await conversationService.toggleArchive(
    req.params.conversationId,
    req.user._id
  );
  return sendSuccess(res, 200, 'Archive status toggled', { conversation });
});

/**
 * @route   PUT /api/conversations/:conversationId/mute
 * @body    { until? } - omit to unmute
 * @access  Private
 */
const setMute = asyncHandler(async (req, res) => {
  const conversation = await conversationService.setMute(
    req.params.conversationId,
    req.user._id,
    req.body.until
  );
  return sendSuccess(res, 200, 'Mute preference updated', { conversation });
});

/**
 * @route   PUT /api/conversations/:conversationId/wallpaper
 * @body    { url }
 * @access  Private
 */
const setWallpaper = asyncHandler(async (req, res) => {
  const conversation = await conversationService.setWallpaper(
    req.params.conversationId,
    req.user._id,
    req.body.url
  );
  return sendSuccess(res, 200, 'Wallpaper updated', { conversation });
});

module.exports = {
  getConversations,
  createConversation,
  togglePin,
  toggleArchive,
  setMute,
  setWallpaper,
};
