const express = require('express');
const { param } = require('express-validator');
const notificationController = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');

const router = express.Router();

router.use(protect);

const notificationIdParamValidator = [
  param('notificationId').isMongoId().withMessage('Invalid notification id'),
];

router.get('/', notificationController.getNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.put('/read-all', notificationController.markAllAsRead);
router.put(
  '/:notificationId/read',
  notificationIdParamValidator,
  validate,
  notificationController.markAsRead
);
router.delete(
  '/:notificationId',
  notificationIdParamValidator,
  validate,
  notificationController.deleteNotification
);

module.exports = router;
