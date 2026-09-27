const express = require('express');
const router = express.Router();
const { getGroupBalances, getUserOverallBalance } = require('../controllers/balanceController');
const { protect } = require('../middleware/authMiddleware');

router.get('/group/:groupId', protect, getGroupBalances);
router.get('/summary', protect, getUserOverallBalance);

module.exports = router;
