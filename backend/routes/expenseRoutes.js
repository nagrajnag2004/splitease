const express = require('express');
const router = express.Router();
const {
  createExpense,
  getGroupExpenses,
  getFriendExpenses,
  getRecentExpenses,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const { protect } = require('../middleware/authMiddleware');

router.post('/', protect, createExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/friend/:friendId', protect, getFriendExpenses);
router.get('/recent', protect, getRecentExpenses);
router.route('/:id')
  .put(protect, updateExpense)
  .delete(protect, deleteExpense);

module.exports = router;
