const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const User = require('../models/User');
const simplifyDebts = require('../utils/simplifyDebts');

// Helper function to calculate net balances for a specific group
const calculateGroupNetBalances = async (groupId) => {
  const group = await Group.findById(groupId).populate('members', '-password');
  if (!group) throw new Error('Group not found');

  const expenses = await Expense.find({ group: groupId });
  const settlements = await Settlement.find({ group: groupId });

  const balancesMap = {};

  // Initialize balances for all group members
  group.members.forEach((member) => {
    balancesMap[member._id.toString()] = {
      user: {
        _id: member._id,
        name: member.name,
        email: member.email,
        avatar: member.avatar
      },
      netBalance: 0
    };
  });

  // Calculate from Expenses
  let totalExpensesAmount = 0;
  expenses.forEach((expense) => {
    totalExpensesAmount += expense.amount;
    const payerId = expense.paidBy.toString();

    // Payer gets credited full amount paid
    if (balancesMap[payerId]) {
      balancesMap[payerId].netBalance += expense.amount;
    }

    // Each participant gets debited their split amount
    expense.splits.forEach((split) => {
      const uId = split.user.toString();
      if (balancesMap[uId]) {
        balancesMap[uId].netBalance -= split.amount;
      }
    });
  });

  // Calculate from Settlements (PaidBy gives money to PaidTo)
  // PaidBy balance goes UP (less debt / more credit), PaidTo balance goes DOWN (received payment)
  settlements.forEach((settlement) => {
    const payerId = settlement.paidBy.toString();
    const receiverId = settlement.paidTo.toString();

    if (balancesMap[payerId]) {
      balancesMap[payerId].netBalance += settlement.amount;
    }
    if (balancesMap[receiverId]) {
      balancesMap[receiverId].netBalance -= settlement.amount;
    }
  });

  const userBalancesArray = Object.values(balancesMap).map((b) => ({
    user: b.user,
    netBalance: Number(b.netBalance.toFixed(2))
  }));

  // Run debt simplification algorithm
  const simplifiedDebts = simplifyDebts(userBalancesArray);

  return {
    group: {
      _id: group._id,
      name: group.name,
      category: group.category
    },
    userBalances: userBalancesArray,
    simplifiedDebts,
    totalExpensesAmount: Number(totalExpensesAmount.toFixed(2))
  };
};

// @desc    Get who owes whom & debt simplification for a group
// @route   GET /api/balances/group/:groupId
// @access  Private
const getGroupBalances = async (req, res) => {
  try {
    const result = await calculateGroupNetBalances(req.params.groupId);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overall balance breakdown across all groups & 1-on-1 expenses for logged in user
// @route   GET /api/balances/summary
// @access  Private
const getUserOverallBalance = async (req, res) => {
  try {
    const currentUserId = req.user._id.toString();

    // 1. Fetch user's groups
    const userGroups = await Group.find({ members: currentUserId });

    let totalYouOwe = 0;
    let totalYouAreOwed = 0;
    const groupSummaries = [];

    for (const g of userGroups) {
      const gBal = await calculateGroupNetBalances(g._id);
      const myBalObj = gBal.userBalances.find((b) => b.user._id.toString() === currentUserId);
      const net = myBalObj ? myBalObj.netBalance : 0;

      if (net < 0) {
        totalYouOwe += Math.abs(net);
      } else if (net > 0) {
        totalYouAreOwed += net;
      }

      // Find direct simplified debts involving current user in this group
      const myDebts = gBal.simplifiedDebts.filter(
        (d) => d.from._id.toString() === currentUserId || d.to._id.toString() === currentUserId
      );

      groupSummaries.push({
        groupId: g._id,
        groupName: g.name,
        category: g.category,
        netBalance: net,
        simplifiedDebts: myDebts
      });
    }

    // 2. Fetch 1-on-1 non-group expenses & settlements
    const nonGroupExpenses = await Expense.find({
      group: null,
      $or: [{ paidBy: currentUserId }, { 'splits.user': currentUserId }]
    });

    const nonGroupSettlements = await Settlement.find({
      group: null,
      $or: [{ paidBy: currentUserId }, { paidTo: currentUserId }]
    });

    // Compute friend 1-on-1 balances map
    const friendBalancesMap = {}; // friendId => { friendUser, netBalance }

    nonGroupExpenses.forEach((exp) => {
      const payerId = exp.paidBy.toString();
      const isMePayer = payerId === currentUserId;

      exp.splits.forEach((split) => {
        const uId = split.user.toString();
        if (uId !== currentUserId) {
          if (!friendBalancesMap[uId]) friendBalancesMap[uId] = 0;
          if (isMePayer) {
            // I paid, friend owes split amount
            friendBalancesMap[uId] += split.amount;
          }
        } else if (!isMePayer) {
          // Friend paid, I owe my split amount
          if (!friendBalancesMap[payerId]) friendBalancesMap[payerId] = 0;
          friendBalancesMap[payerId] -= split.amount;
        }
      });
    });

    nonGroupSettlements.forEach((set) => {
      const payerId = set.paidBy.toString();
      const receiverId = set.paidTo.toString();

      if (payerId === currentUserId) {
        // I paid friend -> friend balance goes UP (less debt)
        if (!friendBalancesMap[receiverId]) friendBalancesMap[receiverId] = 0;
        friendBalancesMap[receiverId] += set.amount;
      } else if (receiverId === currentUserId) {
        // Friend paid me -> friend balance goes DOWN
        if (!friendBalancesMap[payerId]) friendBalancesMap[payerId] = 0;
        friendBalancesMap[payerId] -= set.amount;
      }
    });

    const friendSummaries = [];
    for (const [fId, net] of Object.entries(friendBalancesMap)) {
      const roundedNet = Number(net.toFixed(2));
      if (Math.abs(roundedNet) > 0.01) {
        const friendUser = await User.findById(fId).select('name email avatar');
        if (friendUser) {
          if (roundedNet < 0) {
            totalYouOwe += Math.abs(roundedNet);
          } else {
            totalYouAreOwed += roundedNet;
          }
          friendSummaries.push({
            friend: friendUser,
            netBalance: roundedNet
          });
        }
      }
    }

    const netOverall = Number((totalYouAreOwed - totalYouOwe).toFixed(2));

    res.json({
      totalYouOwe: Number(totalYouOwe.toFixed(2)),
      totalYouAreOwed: Number(totalYouAreOwed.toFixed(2)),
      netOverall,
      groupSummaries,
      friendSummaries
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getGroupBalances,
  getUserOverallBalance
};
