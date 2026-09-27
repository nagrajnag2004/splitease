const Expense = require('../models/Expense');
const Group = require('../models/Group');

// Helper to compute split amounts
const calculateSplits = ({ amount, splitType, rawSplits }) => {
  // rawSplits: [{ user: userId, amount?: number, percentage?: number }]
  const numUsers = rawSplits.length;
  if (numUsers === 0) return [];

  if (splitType === 'equal') {
    const equalShare = Number((amount / numUsers).toFixed(2));
    // handle remainder rounding on first split
    const remainder = Number((amount - equalShare * numUsers).toFixed(2));
    return rawSplits.map((s, idx) => ({
      user: s.user,
      amount: idx === 0 ? Number((equalShare + remainder).toFixed(2)) : equalShare,
      percentage: Number(((1 / numUsers) * 100).toFixed(2))
    }));
  }

  if (splitType === 'exact') {
    let totalExact = 0;
    const splits = rawSplits.map((s) => {
      const val = Number(s.amount || 0);
      totalExact += val;
      return {
        user: s.user,
        amount: Number(val.toFixed(2)),
        percentage: amount > 0 ? Number(((val / amount) * 100).toFixed(2)) : 0
      };
    });

    if (Math.abs(totalExact - amount) > 0.05) {
      throw new Error(`The exact split amounts ($${totalExact.toFixed(2)}) do not match total amount ($${amount.toFixed(2)})`);
    }
    return splits;
  }

  if (splitType === 'percentage') {
    let totalPercent = 0;
    const splits = rawSplits.map((s) => {
      const pct = Number(s.percentage || 0);
      totalPercent += pct;
      const calculatedAmt = Number(((amount * pct) / 100).toFixed(2));
      return {
        user: s.user,
        amount: calculatedAmt,
        percentage: pct
      };
    });

    if (Math.abs(totalPercent - 100) > 0.1) {
      throw new Error(`Percentages must sum to 100% (currently ${totalPercent.toFixed(1)}%)`);
    }
    return splits;
  }

  return rawSplits;
};

// @desc    Add a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { group, description, amount, paidBy, splitType, splits, category, date, notes } = req.body;

    if (!description || !amount || amount <= 0) {
      return res.status(400).json({ message: 'Description and a valid amount are required' });
    }

    if (!paidBy) {
      return res.status(400).json({ message: 'Payer (paidBy) is required' });
    }

    if (!splits || !Array.isArray(splits) || splits.length === 0) {
      return res.status(400).json({ message: 'At least one participant is required' });
    }

    const computedSplits = calculateSplits({
      amount: Number(amount),
      splitType: splitType || 'equal',
      rawSplits: splits
    });

    const expense = await Expense.create({
      group: group || null,
      description,
      amount: Number(amount),
      paidBy,
      splitType: splitType || 'equal',
      splits: computedSplits,
      category: category || 'General',
      date: date || new Date(),
      notes: notes || ''
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .populate('group', 'name category');

    res.status(201).json(populatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get expenses for a specific group
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ group: groupId })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get 1-on-1 expenses with a friend
// @route   GET /api/expenses/friend/:friendId
// @access  Private
const getFriendExpenses = async (req, res) => {
  try {
    const { friendId } = req.params;
    const currentUserId = req.user._id;

    const expenses = await Expense.find({
      group: null,
      $or: [
        { paidBy: currentUserId, 'splits.user': friendId },
        { paidBy: friendId, 'splits.user': currentUserId }
      ]
    })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .sort({ date: -1, createdAt: -1 });

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent expenses for logged in user
// @route   GET /api/expenses/recent
// @access  Private
const getRecentExpenses = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const expenses = await Expense.find({
      $or: [{ paidBy: currentUserId }, { 'splits.user': currentUserId }]
    })
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .populate('group', 'name category')
      .sort({ date: -1, createdAt: -1 })
      .limit(20);

    res.json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an expense
// @route   PUT /api/expenses/:id
// @access  Private
const updateExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, splitType, splits, category, date, notes } = req.body;
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    if (description !== undefined) expense.description = description;
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (notes !== undefined) expense.notes = notes;
    if (paidBy !== undefined) expense.paidBy = paidBy;

    if (amount !== undefined || splitType !== undefined || splits !== undefined) {
      const newAmount = amount !== undefined ? Number(amount) : expense.amount;
      const newSplitType = splitType || expense.splitType;
      const rawSplits = splits || expense.splits;

      expense.amount = newAmount;
      expense.splitType = newSplitType;
      expense.splits = calculateSplits({
        amount: newAmount,
        splitType: newSplitType,
        rawSplits
      });
    }

    await expense.save();

    const updatedExpense = await Expense.findById(expense._id)
      .populate('paidBy', 'name email avatar')
      .populate('splits.user', 'name email avatar')
      .populate('group', 'name category');

    res.json(updatedExpense);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete an expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await Expense.deleteOne({ _id: req.params.id });
    res.json({ message: 'Expense deleted successfully', id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createExpense,
  getGroupExpenses,
  getFriendExpenses,
  getRecentExpenses,
  updateExpense,
  deleteExpense
};
