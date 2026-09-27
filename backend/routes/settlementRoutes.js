const express = require('express');
const router = express.Router();
const {
  createSettlement,
  getGroupSettlements,
  getFriendSettlements
} = require('../controllers/settlementController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createSettlement);
router.get('/group/:groupId', protect, getGroupSettlements);
router.get('/friend/:friendId', protect, getFriendSettlements);

module.exports = router;
