const Notification = require('../models/Notification');
const { PAGINATION } = require('../constants');

/**
 * Creates a notification document. Callers (message/group services or
 * controllers) are responsible for also emitting the real-time socket
 * event via `emitNewNotification` — this function only persists.
 */
const createNotification = async ({ recipient, sender, type, conversation, message, text }) => {
  // Don't notify users about their own actions
  if (recipient.toString() === sender.toString()) return null;

  return Notification.create({ recipient, sender, type, conversation, message, text });
};

const getNotifications = async (userId, { page = 1, limit = PAGINATION.DEFAULT_LIMIT } = {}) => {
  return Notification.find({ recipient: userId })
    .populate('sender', 'name username avatar')
    .populate('conversation', 'isGroup')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(Math.min(limit, PAGINATION.MAX_LIMIT));
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ recipient: userId, isRead: false });
};

const markAsRead = async (userId, notificationId) => {
  await Notification.updateOne({ _id: notificationId, recipient: userId }, { isRead: true });
};

const markAllAsRead = async (userId) => {
  await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });
};

const deleteNotification = async (userId, notificationId) => {
  await Notification.deleteOne({ _id: notificationId, recipient: userId });
};

module.exports = {
  createNotification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
