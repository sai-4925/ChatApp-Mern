const express = require('express');
const messageController = require('../controllers/messageController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  conversationIdParamValidator,
  messageIdParamValidator,
  sendMessageValidator,
  editMessageValidator,
  reactionValidator,
  forwardMessageValidator,
  searchMessagesValidator,
  paginationValidator,
} = require('../validators/messageValidators');

const router = express.Router();

router.use(protect);

// Static paths first, before the /:conversationId catch-all
router.get('/starred/me', messageController.getStarredMessages);

router.post(
  '/',
  upload.single('media'),
  sendMessageValidator,
  validate,
  messageController.sendMessage
);

router.get(
  '/:conversationId/search',
  conversationIdParamValidator,
  searchMessagesValidator,
  validate,
  messageController.searchMessages
);

router.get(
  '/:conversationId',
  conversationIdParamValidator,
  paginationValidator,
  validate,
  messageController.getMessages
);

router.put(
  '/:messageId',
  messageIdParamValidator,
  editMessageValidator,
  validate,
  messageController.editMessage
);
router.delete('/:messageId/me', messageIdParamValidator, validate, messageController.deleteForMe);
router.delete(
  '/:messageId/everyone',
  messageIdParamValidator,
  validate,
  messageController.deleteForEveryone
);
router.post(
  '/:messageId/react',
  messageIdParamValidator,
  reactionValidator,
  validate,
  messageController.toggleReaction
);
router.post('/:messageId/star', messageIdParamValidator, validate, messageController.toggleStar);
router.post(
  '/:messageId/forward',
  messageIdParamValidator,
  forwardMessageValidator,
  validate,
  messageController.forwardMessage
);

module.exports = router;
