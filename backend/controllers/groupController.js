const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Create a new group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res) => {
  try {
    const { name, description, category, memberEmails } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Group name is required' });
    }

    const memberIds = [req.user._id];

    if (Array.isArray(memberEmails) && memberEmails.length > 0) {
      for (const email of memberEmails) {
        if (email.trim()) {
          const user = await User.findOne({ email: email.trim().toLowerCase() });
          if (user && !memberIds.some((id) => id.toString() === user._id.toString())) {
            memberIds.push(user._id);
          }
        }
      }
    }

    const group = await Group.create({
      name,
      description: description || '',
      category: category || 'Other',
      createdBy: req.user._id,
      members: memberIds
    });

    const populatedGroup = await Group.findById(group._id).populate('members', '-password');

    res.status(201).json(populatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all groups for the logged-in user
// @route   GET /api/groups
// @access  Private
const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', '-password')
      .populate('createdBy', 'name email avatar')
      .sort({ updatedAt: -1 });

    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get group details by ID
// @route   GET /api/groups/:id
// @access  Private
const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', '-password')
      .populate('createdBy', 'name email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    // Check if req.user is a member of this group
    const isMember = group.members.some(
      (member) => member._id.toString() === req.user._id.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: 'Not authorized to view this group' });
    }

    res.json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Member email is required' });
    }

    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    const userToAdd = await User.findOne({ email: email.trim().toLowerCase() });
    if (!userToAdd) {
      return res.status(440).json({ message: 'User with this email was not found' });
    }

    const isAlreadyMember = group.members.some(
      (mId) => mId.toString() === userToAdd._id.toString()
    );

    if (isAlreadyMember) {
      return res.status(400).json({ message: 'User is already a member of this group' });
    }

    group.members.push(userToAdd._id);
    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('members', '-password')
      .populate('createdBy', 'name email avatar');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const group = await Group.findById(id);

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    group.members = group.members.filter(
      (mId) => mId.toString() !== userId.toString()
    );

    await group.save();

    const updatedGroup = await Group.findById(group._id)
      .populate('members', '-password')
      .populate('createdBy', 'name email avatar');

    res.json(updatedGroup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createGroup,
  getMyGroups,
  getGroupDetails,
  addMember,
  removeMember
};
