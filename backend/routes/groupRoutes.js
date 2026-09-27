const express = require('express');
const router = express.Router();
const {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMember,
  removeMember
} = require('../controllers/groupController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createGroup)
  .get(protect, getMyGroups);

router.route('/:id')
  .get(protect, getGroupDetails);

router.route('/:id/members')
  .post(protect, addMember);

router.route('/:id/members/:userId')
  .delete(protect, removeMember);

module.exports = router;
