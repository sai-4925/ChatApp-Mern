const express = require('express');
const conversationController = require('../controllers/conversationController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const {
  createConversationValidator,
  conversationIdParamValidator,
  muteConversationValidator,
  wallpaperValidator,
} = require('../validators/conversationValidators');

const router = express.Router();

router.use(protect);

router.get('/', conversationController.getConversations);
router.post('/', createConversationValidator, validate, conversationController.createConversation);

router.put(
  '/:conversationId/pin',
  conversationIdParamValidator,
  validate,
  conversationController.togglePin
);
router.put(
  '/:conversationId/archive',
  conversationIdParamValidator,
  validate,
  conversationController.toggleArchive
);
router.put(
  '/:conversationId/mute',
  conversationIdParamValidator,
  muteConversationValidator,
  validate,
  conversationController.setMute
);
router.put(
  '/:conversationId/wallpaper',
  conversationIdParamValidator,
  wallpaperValidator,
  validate,
  conversationController.setWallpaper
);

module.exports = router;
