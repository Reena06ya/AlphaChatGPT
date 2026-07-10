const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const User = require('../models/User');
const Chat = require('../models/Chat');
const Subscription = require('../models/Subscription');

// @desc    Get Admin dashboard metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
router.get('/metrics', protect, admin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalChats = await Chat.countDocuments({});
    
    // Aggregate subscriptions revenue
    const subscriptions = await Subscription.find({});
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.amount, 0);
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;

    // AI Usage Mock calculations
    const chats = await Chat.find({});
    let totalTokens = 0;
    chats.forEach(chat => {
      chat.messages.forEach(msg => {
        totalTokens += msg.tokens || 0;
      });
    });

    res.json({
      totalUsers,
      totalChats,
      activeSubscriptions,
      totalRevenue,
      totalTokens,
      revenueHistory: [
        { month: 'Jan', revenue: Math.round(totalRevenue * 0.2) },
        { month: 'Feb', revenue: Math.round(totalRevenue * 0.4) },
        { month: 'Mar', revenue: Math.round(totalRevenue * 0.6) },
        { month: 'Apr', revenue: Math.round(totalRevenue * 0.8) },
        { month: 'May', revenue: totalRevenue },
      ],
      aiUsageHistory: [
        { day: 'Mon', tokens: Math.round(totalTokens * 0.1) },
        { day: 'Tue', tokens: Math.round(totalTokens * 0.15) },
        { day: 'Wed', tokens: Math.round(totalTokens * 0.25) },
        { day: 'Thu', tokens: Math.round(totalTokens * 0.35) },
        { day: 'Fri', tokens: totalTokens },
      ]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update a user (role or subscription plan)
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res) => {
  const { role, plan, subscriptionStatus } = req.body;
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (role) user.role = role;
    
    if (plan) {
      user.subscription.plan = plan;
      user.subscription.status = subscriptionStatus || 'active';
      if (plan !== 'Free') {
        user.subscription.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
        
        // Record payment mock
        await Subscription.create({
          userId: user._id,
          plan: plan,
          amount: plan === 'Pro' ? 20 : 100,
          status: 'active',
          paymentId: 'admin-manual-' + Math.random().toString(36).substring(2, 9)
        });
      } else {
        user.subscription.expiresAt = null;
      }
    }

    await user.save();
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Delete user account
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete user's chats
    await Chat.deleteMany({ userId: user._id });
    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all chats list
// @route   GET /api/admin/chats
// @access  Private/Admin
router.get('/chats', protect, admin, async (req, res) => {
  try {
    const chats = await Chat.find({})
      .populate('userId', 'name email')
      .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
