const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  updateProfileValidator,
  searchUsersValidator,
  userIdParamValidator,
  updateSettingsValidator,
  changePasswordValidator,
} = require('../validators/userValidators');

const router = express.Router();

router.use(protect);

// Current user ("me") routes — order matters: keep these above /:userId
router.get('/me', userController.getCurrentUser);
router.put('/me', updateProfileValidator, validate, userController.updateProfile);
router.put('/me/avatar', upload.single('avatar'), userController.updateAvatar);
router.put('/me/settings', updateSettingsValidator, validate, userController.updateSettings);
router.put('/me/password', changePasswordValidator, validate, userController.changePassword);
router.get('/me/blocked', userController.getBlockedUsers);
router.get('/me/contacts', userController.getContacts);

router.get('/search', searchUsersValidator, validate, userController.searchUsers);

router.get('/:userId', userIdParamValidator, validate, userController.getUserProfile);
router.post('/:userId/block', userIdParamValidator, validate, userController.blockUser);
router.delete('/:userId/block', userIdParamValidator, validate, userController.unblockUser);
router.post('/:userId/contact', userIdParamValidator, validate, userController.addContact);
router.delete('/:userId/contact', userIdParamValidator, validate, userController.removeContact);

module.exports = router;
