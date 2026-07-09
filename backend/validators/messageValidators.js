const { body, param, query } = require('express-validator');

const conversationIdParamValidator = [
  param('conversationId').isMongoId().withMessage('Invalid conversation id'),
];

const messageIdParamValidator = [
  param('messageId').isMongoId().withMessage('Invalid message id'),
];

const sendMessageValidator = [
  body('conversationId').isMongoId().withMessage('A valid conversation id is required'),
  body('content')
    .if(body('type').equals('text'))
    .trim()
    .notEmpty()
    .withMessage('Message content cannot be empty')
    .isLength({ max: 5000 }),
  body('type').optional().isIn(['text', 'image', 'video', 'audio', 'document']),
  body('replyTo').optional().isMongoId(),
];

const editMessageValidator = [
  body('content').trim().notEmpty().withMessage('Message content cannot be empty').isLength({ max: 5000 }),
];

const reactionValidator = [
  body('emoji').trim().notEmpty().withMessage('Emoji is required'),
];

const forwardMessageValidator = [
  body('conversationIds')
    .isArray({ min: 1 })
    .withMessage('At least one target conversation is required'),
  body('conversationIds.*').isMongoId().withMessage('Invalid target conversation id'),
];

const searchMessagesValidator = [
  query('q').trim().notEmpty().withMessage('Search query is required'),
];

const paginationValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  conversationIdParamValidator,
  messageIdParamValidator,
  sendMessageValidator,
  editMessageValidator,
  reactionValidator,
  forwardMessageValidator,
  searchMessagesValidator,
  paginationValidator,
};
