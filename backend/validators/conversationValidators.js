const { body, param } = require('express-validator');

const createConversationValidator = [
  body('participantId').isMongoId().withMessage('A valid participant id is required'),
];

const conversationIdParamValidator = [
  param('conversationId').isMongoId().withMessage('Invalid conversation id'),
];

const muteConversationValidator = [
  body('until')
    .optional()
    .isISO8601()
    .withMessage('until must be a valid ISO date'),
];

const wallpaperValidator = [
  body('url').trim().notEmpty().withMessage('Wallpaper url is required'),
];

module.exports = {
  createConversationValidator,
  conversationIdParamValidator,
  muteConversationValidator,
  wallpaperValidator,
};
