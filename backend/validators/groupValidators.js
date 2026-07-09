const { body, param } = require('express-validator');

const createGroupValidator = [
  body('name').trim().notEmpty().withMessage('Group name is required').isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
  body('memberIds').isArray({ min: 1 }).withMessage('At least one member is required'),
  body('memberIds.*').isMongoId().withMessage('Invalid member id'),
];

const groupIdParamValidator = [param('groupId').isMongoId().withMessage('Invalid group id')];

const memberIdParamValidator = [param('memberId').isMongoId().withMessage('Invalid member id')];

const addMembersValidator = [
  body('memberIds').isArray({ min: 1 }).withMessage('At least one member is required'),
  body('memberIds.*').isMongoId().withMessage('Invalid member id'),
];

const updateGroupValidator = [
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('description').optional().trim().isLength({ max: 500 }),
];

module.exports = {
  createGroupValidator,
  groupIdParamValidator,
  memberIdParamValidator,
  addMembersValidator,
  updateGroupValidator,
};
