const Settlement = require('../models/Settlement');

// @desc    Record a settlement payment
// @route   POST /api/settlements
// @access  Private
const createSettlement = async (req, res) => {
  try {
    const { group, paidBy, paidTo, amount, notes, date } = req.body;

    if (!paidBy || !paidTo || !amount || amount <= 0) {
      return res.status(400).json({ message: 'PaidBy, PaidTo and a valid positive amount are required' });
    }

    if (paidBy.toString() === paidTo.toString()) {
      return res.status(400).json({ message: 'Payer and Receiver cannot be the same user' });
    }

    const settlement = await Settlement.create({
      group: group || null,
      paidBy,
      paidTo,
      amount: Number(amount),
      notes: notes || 'Settled Up',
      date: date || new Date()
    });

    const populatedSettlement = await Settlement.findById(settlement._id)
      .populate('paidBy', 'name email avatar')
      .populate('paidTo', 'name email avatar')
      .populate('group', 'name category');

    res.status(201).json(populatedSettlement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get settlements for a group
// @route   GET /api/settlements/group/:groupId
// @access  Private
const getGroupSettlements = async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await Settlement.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('paidTo', 'name email avatar')
      .sort({ date: -1, createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get settlements between current user & a friend
// @route   GET /api/settlements/friend/:friendId
// @access  Private
const getFriendSettlements = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const settlements = await Settlement.find({
      group: null,
      $or: [
        { paidBy: currentUserId, paidTo: friendId },
        { paidBy: friendId, paidTo: currentUserId }
      ]
    })
      .populate('paidBy', 'name email avatar')
      .populate('paidTo', 'name email avatar')
      .sort({ date: -1, createdAt: -1 });

    res.json(settlements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSettlement,
  getGroupSettlements,
  getFriendSettlements
};
