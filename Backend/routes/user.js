const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Chat = require('../models/Chat');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      if (req.body.password) {
        user.password = req.body.password; // hashed in pre-save hook
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        settings: updatedUser.settings,
        subscription: updatedUser.subscription,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update settings
// @route   PUT /api/user/settings
// @access  Private
router.put('/settings', protect, async (req, res) => {
  const { theme, language, model, systemPrompt, memoryEnabled } = req.body;
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      if (theme !== undefined) user.settings.theme = theme;
      if (language !== undefined) user.settings.language = language;
      if (model !== undefined) user.settings.model = model;
      if (systemPrompt !== undefined) user.settings.systemPrompt = systemPrompt;
      if (memoryEnabled !== undefined) user.settings.memoryEnabled = memoryEnabled;

      const updatedUser = await user.save();
      res.json(updatedUser.settings);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/user/account
// @access  Private
router.delete('/account', protect, async (req, res) => {
  try {
    // Delete all chats associated with this user
    await Chat.deleteMany({ userId: req.user._id });
    
    // Delete the user
    await User.findByIdAndDelete(req.user._id);

    res.json({ message: 'Account and associated data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
