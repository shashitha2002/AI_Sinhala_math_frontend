const express = require('express');
const User = require('../models/User');
const Badge = require('../models/Badge');
const badgeEngine = require('../services/badgeEngine');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/badges
// @desc    Get all available badges
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const badges = await Badge.find({ isActive: true })
      .sort({ category: 1, rarity: 1 })
      .select('badgeId name description icon category rarity');

    res.json({
      success: true,
      badges
    });
  } catch (error) {
    console.error('Get badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badges'
    });
  }
});

// @route   GET /api/badges/my-badges
// @desc    Get user's earned badges
// @access  Private
router.get('/my-badges', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('performance.badges');
    const userBadgeIds = user.performance.badges || [];

    // Get full badge details for user's badges
    const earnedBadges = await Badge.find({
      badgeId: { $in: userBadgeIds },
      isActive: true
    }).select('badgeId name description icon category rarity');

    // Get all badges to show which ones are not earned
    const allBadges = await Badge.find({ isActive: true })
      .select('badgeId name description icon category rarity');

    const badgeMap = {};
    earnedBadges.forEach(badge => {
      badgeMap[badge.badgeId] = { ...badge.toObject(), earned: true, earnedDate: null };
    });

    // Add earned date from achievements
    const userFull = await User.findById(req.user._id).select('performance.achievements');
    userFull.performance.achievements.forEach(achievement => {
      const badge = allBadges.find(b => b.name === achievement.title);
      if (badge && badgeMap[badge.badgeId]) {
        badgeMap[badge.badgeId].earnedDate = achievement.date;
      }
    });

    // Create list with earned status
    const badgesWithStatus = allBadges.map(badge => ({
      ...badge.toObject(),
      earned: badgeMap[badge.badgeId] ? true : false,
      earnedDate: badgeMap[badge.badgeId]?.earnedDate || null
    }));

    res.json({
      success: true,
      earnedBadges: earnedBadges.map(b => ({
        ...b.toObject(),
        earned: true,
        earnedDate: badgeMap[b.badgeId]?.earnedDate || null
      })),
      allBadges: badgesWithStatus,
      totalEarned: earnedBadges.length,
      totalAvailable: allBadges.length,
      progress: allBadges.length > 0 ? 
        Math.round((earnedBadges.length / allBadges.length) * 100) : 0
    });
  } catch (error) {
    console.error('Get my badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user badges'
    });
  }
});

// @route   POST /api/badges/check
// @desc    Manually trigger badge check for current user
// @access  Private
router.post('/check', protect, async (req, res) => {
  try {
    const { activityType = 'manual', activityData = {} } = req.body;

    const newlyAwarded = await badgeEngine.checkAndAwardBadges(
      req.user._id,
      activityType,
      activityData
    );

    res.json({
      success: true,
      newlyAwarded,
      count: newlyAwarded.length
    });
  } catch (error) {
    console.error('Check badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking badges'
    });
  }
});

// @route   GET /api/badges/stats
// @desc    Get badge statistics for user
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('performance.badges performance.achievements');
    const allBadges = await Badge.find({ isActive: true });

    const userBadgeIds = user.performance.badges || [];
    const earnedCount = userBadgeIds.length;

    // Count badges by category
    const categoryCounts = {};
    const earnedByCategory = {};

    allBadges.forEach(badge => {
      if (!categoryCounts[badge.category]) {
        categoryCounts[badge.category] = 0;
        earnedByCategory[badge.category] = 0;
      }
      categoryCounts[badge.category]++;
      if (userBadgeIds.includes(badge.badgeId)) {
        earnedByCategory[badge.category]++;
      }
    });

    // Count badges by rarity
    const rarityCounts = {};
    const earnedByRarity = {};

    allBadges.forEach(badge => {
      if (!rarityCounts[badge.rarity]) {
        rarityCounts[badge.rarity] = 0;
        earnedByRarity[badge.rarity] = 0;
      }
      rarityCounts[badge.rarity]++;
      if (userBadgeIds.includes(badge.badgeId)) {
        earnedByRarity[badge.rarity]++;
      }
    });

    res.json({
      success: true,
      stats: {
        totalEarned: earnedCount,
        totalAvailable: allBadges.length,
        progress: allBadges.length > 0 ? 
          Math.round((earnedCount / allBadges.length) * 100) : 0,
        byCategory: categoryCounts,
        earnedByCategory,
        byRarity: rarityCounts,
        earnedByRarity,
        recentAchievements: user.performance.achievements
          .slice(-10)
          .reverse()
          .map(a => ({
            title: a.title,
            description: a.description,
            date: a.date
          }))
      }
    });
  } catch (error) {
    console.error('Get badge stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching badge statistics'
    });
  }
});

// @route   POST /api/badges/initialize
// @desc    Initialize default badges (admin only - add admin check if needed)
// @access  Private
router.post('/initialize', protect, async (req, res) => {
  try {
    await badgeEngine.initializeDefaultBadges();

    res.json({
      success: true,
      message: 'Default badges initialized successfully'
    });
  } catch (error) {
    console.error('Initialize badges error:', error);
    res.status(500).json({
      success: false,
      message: 'Error initializing badges'
    });
  }
});

module.exports = router;





