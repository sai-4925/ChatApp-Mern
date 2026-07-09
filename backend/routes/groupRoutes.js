const express = require('express');
const groupController = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validateMiddleware');
const upload = require('../middleware/uploadMiddleware');
const {
  createGroupValidator,
  groupIdParamValidator,
  memberIdParamValidator,
  addMembersValidator,
  updateGroupValidator,
} = require('../validators/groupValidators');

const router = express.Router();

router.use(protect);

router.post('/', createGroupValidator, validate, groupController.createGroup);
router.get('/:groupId', groupIdParamValidator, validate, groupController.getGroup);
router.put(
  '/:groupId',
  groupIdParamValidator,
  updateGroupValidator,
  validate,
  groupController.updateGroup
);
router.put(
  '/:groupId/avatar',
  groupIdParamValidator,
  validate,
  upload.single('avatar'),
  groupController.updateGroupAvatar
);

router.post(
  '/:groupId/members',
  groupIdParamValidator,
  addMembersValidator,
  validate,
  groupController.addMembers
);
router.delete(
  '/:groupId/members/:memberId',
  groupIdParamValidator,
  memberIdParamValidator,
  validate,
  groupController.removeMember
);
router.put(
  '/:groupId/members/:memberId/promote',
  groupIdParamValidator,
  memberIdParamValidator,
  validate,
  groupController.promoteToAdmin
);
router.put(
  '/:groupId/members/:memberId/demote',
  groupIdParamValidator,
  memberIdParamValidator,
  validate,
  groupController.demoteAdmin
);

module.exports = router;
