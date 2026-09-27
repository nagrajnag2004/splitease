const User = require('../models/User');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

// @desc    Get all friends (users with whom logged in user shares groups, expenses, or settlements)
// @route   GET /api/friends
// @access  Private
const getFriends = async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Find all groups user belongs to
    const myGroups = await Group.find({ members: currentUserId });
    const friendIds = new Set();

    myGroups.forEach((g) => {
      g.members.forEach((mId) => {
        if (mId.toString() !== currentUserId.toString()) {
          friendIds.add(mId.toString());
        }
      });
    });

    // Find all 1-on-1 expenses
    const nonGroupExpenses = await Expense.find({
      group: null,
      $or: [{ paidBy: currentUserId }, { 'splits.user': currentUserId }]
    });

    nonGroupExpenses.forEach((exp) => {
      if (exp.paidBy.toString() !== currentUserId.toString()) {
        friendIds.add(exp.paidBy.toString());
      }
      exp.splits.forEach((s) => {
        if (s.user.toString() !== currentUserId.toString()) {
          friendIds.add(s.user.toString());
        }
      });
    });

    // Find all 1-on-1 settlements
    const settlements = await Settlement.find({
      group: null,
      $or: [{ paidBy: currentUserId }, { paidTo: currentUserId }]
    });

    settlements.forEach((set) => {
      if (set.paidBy.toString() !== currentUserId.toString()) {
        friendIds.add(set.paidBy.toString());
      }
      if (set.paidTo.toString() !== currentUserId.toString()) {
        friendIds.add(set.paidTo.toString());
      }
    });

    const friendsList = await User.find({ _id: { $in: Array.from(friendIds) } }).select('-password');
    res.json(friendsList);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add a friend by email (returns user info)
// @route   POST /api/friends/add
// @access  Private
const addFriendByEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (email.trim().toLowerCase() === req.user.email.toLowerCase()) {
      return res.status(400).json({ message: 'You cannot add yourself as a friend' });
    }

    const friend = await User.findOne({ email: email.trim().toLowerCase() }).select('-password');
    if (!friend) {
      return res.status(404).json({ message: 'User with this email not found' });
    }

    res.json(friend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFriends,
  addFriendByEmail
};
