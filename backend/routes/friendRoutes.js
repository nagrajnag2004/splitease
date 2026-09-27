const express = require('express');
const router = express.Router();
const { getFriends, addFriendByEmail } = require('../controllers/friendController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getFriends);
router.post('/add', protect, addFriendByEmail);

module.exports = router;
