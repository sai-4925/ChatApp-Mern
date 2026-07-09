const { body, param, query } = require('express-validator');

const updateProfileValidator = [
  body('name').optional().trim().isLength({ max: 50 }).withMessage('Name cannot exceed 50 characters'),
  body('bio').optional().trim().isLength({ max: 150 }).withMessage('Bio cannot exceed 150 characters'),
  body('status').optional().trim().isLength({ max: 100 }).withMessage('Status cannot exceed 100 characters'),
  body('username')
    .optional()
    .trim()
    .toLowerCase()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-z0-9_.]+$/)
    .withMessage('Username can only contain letters, numbers, underscores, and periods'),
];

const searchUsersValidator = [
  query('q').trim().notEmpty().withMessage('Search query is required'),
];

const userIdParamValidator = [
  param('userId').isMongoId().withMessage('Invalid user id'),
];

const updateSettingsValidator = [
  body('theme').optional().isIn(['light', 'dark', 'system']),
  body('notifications.sound').optional().isBoolean(),
  body('notifications.browser').optional().isBoolean(),
  body('privacy.lastSeen').optional().isIn(['everyone', 'contacts', 'nobody']),
  body('privacy.readReceipts').optional().isBoolean(),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters')
    .matches(/\d/)
    .withMessage('New password must contain at least one number'),
];

module.exports = {
  updateProfileValidator,
  searchUsersValidator,
  userIdParamValidator,
  updateSettingsValidator,
  changePasswordValidator,
};
