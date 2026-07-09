const asyncHandler = require('express-async-handler');
const notificationService = require('../services/notificationService');
const { sendSuccess } = require('../utils/apiResponse');

/**
 * @route   GET /api/notifications?page=&limit=
 * @access  Private
 */
const getNotifications = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const notifications = await notificationService.getNotifications(req.user._id, {
    page: Number(page) || 1,
    limit: Number(limit) || undefined,
  });
  return sendSuccess(res, 200, 'Notifications fetched', { notifications });
});

/**
 * @route   GET /api/notifications/unread-count
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user._id);
  return sendSuccess(res, 200, 'Unread count fetched', { count });
});

/**
 * @route   PUT /api/notifications/:notificationId/read
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAsRead(req.user._id, req.params.notificationId);
  return sendSuccess(res, 200, 'Notification marked as read');
});

/**
 * @route   PUT /api/notifications/read-all
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user._id);
  return sendSuccess(res, 200, 'All notifications marked as read');
});

/**
 * @route   DELETE /api/notifications/:notificationId
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.user._id, req.params.notificationId);
  return sendSuccess(res, 200, 'Notification deleted');
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
