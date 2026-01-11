const express = require('express');
const { GameSession, DailyActivity } = require('../models/Game');
const GameStatistics = require('../models/GameStatistics');
const User = require('../models/User');
const badgeEngine = require('../services/badgeEngine');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper function to update daily activity
async function updateDailyActivity(userId, additionalActivity = {}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const activity = await DailyActivity.findOneAndUpdate(
    { userId, date: { $gte: today, $lt: tomorrow } },
    {
      $inc: {
        'activities.quizzesCompleted': additionalActivity.quizzesCompleted || 0,
        'activities.gamesPlayed': additionalActivity.gamesPlayed || 0,
        'activities.forumPosts': additionalActivity.forumPosts || 0,
        'activities.timeSpent': additionalActivity.timeSpent || 0
      },
      $set: {
        lastActive: new Date()
      }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return activity;
}

// @route   POST /api/games/play
// @desc    Start/Submit a game session
// @access  Private
router.post('/play', protect, async (req, res) => {
  try {
    const { gameType, questions, score, correctAnswers, totalQuestions, timeSpent, difficulty, status } = req.body;

    const gameSession = await GameSession.create({
      userId: req.user._id,
      gameType,
      score,
      correctAnswers,
      totalQuestions,
      timeSpent,
      difficulty: difficulty || 'easy',
      questions: questions || [],
      status: status || 'completed',
      completedAt: status === 'completed' ? new Date() : null
    });

    // Update daily activity
    await updateDailyActivity(req.user._id, {
      gamesPlayed: 1,
      timeSpent: Math.floor((timeSpent || 0) / 60) // Convert seconds to minutes
    });

    // Update user's game statistics
    const user = await User.findById(req.user._id);
    if (!user.gameStats) {
      user.gameStats = {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0
      };
    }

    user.gameStats.totalGames += 1;
    user.gameStats.totalScore += (score || 0);
    user.gameStats.averageScore = user.gameStats.totalScore / user.gameStats.totalGames;
    
    if ((score || 0) > user.gameStats.bestScore) {
      user.gameStats.bestScore = score || 0;
    }

    // Update streak
    const lastActivity = await DailyActivity.findOne({ userId: req.user._id })
      .sort({ date: -1 });
    
    if (lastActivity) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const lastDate = new Date(lastActivity.date);
      lastDate.setHours(0, 0, 0, 0);
      const daysDiff = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Same day, maintain streak
        user.gameStats.currentStreak = lastActivity.streak || user.gameStats.currentStreak || 0;
      } else if (daysDiff === 1) {
        // Consecutive day, increment streak
        user.gameStats.currentStreak = (lastActivity.streak || user.gameStats.currentStreak || 0) + 1;
        if (user.gameStats.currentStreak > user.gameStats.longestStreak) {
          user.gameStats.longestStreak = user.gameStats.currentStreak;
        }
      } else {
        // Streak broken
        user.gameStats.currentStreak = 1;
      }
    } else {
      user.gameStats.currentStreak = 1;
    }

    await user.save();

    // Update normalized game statistics
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate total activities for today
    const todayActivity = await DailyActivity.findOne({
      userId: req.user._id,
      date: { $gte: today }
    });
    
    // Calculate active days (days with any activity)
    const allActivities = await DailyActivity.find({ userId: req.user._id });
    const activeDays = new Set(allActivities.map(a => a.date.toISOString().split('T')[0])).size;
    
    // Calculate current streak
    let currentStreak = 0;
    let checkDate = new Date(today);
    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const activity = await DailyActivity.findOne({
        userId: req.user._id,
        date: { $gte: dayStart, $lte: dayEnd }
      });
      
      if (activity && (activity.activities.quizzesCompleted > 0 || activity.activities.gamesPlayed > 0)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    // Calculate total activities
    const totalActivities = allActivities.reduce((sum, a) => 
      sum + (a.activities.quizzesCompleted || 0) + (a.activities.gamesPlayed || 0) + (a.activities.forumPosts || 0), 0
    );
    
    // Update or create game statistics
    let gameStats = await GameStatistics.findOne({ userId: req.user._id, date: today });
    
    if (!gameStats) {
      // Create new game statistics
      gameStats = await GameStatistics.create({
        userId: req.user._id,
        date: today,
        activeDays: activeDays,
        currentStreak: currentStreak,
        longestStreak: Math.max(currentStreak, user.gameStats.longestStreak || 0),
        totalActivities: totalActivities,
        gamesPlayed: (todayActivity?.activities.gamesPlayed || 0),
        quizzesCompleted: (todayActivity?.activities.quizzesCompleted || 0),
        forumPosts: (todayActivity?.activities.forumPosts || 0),
        totalTimeSpent: (todayActivity?.activities.timeSpent || 0),
        gameTypeStats: {
          [gameType]: {
            gamesPlayed: 1,
            totalScore: score || 0,
            averageScore: score || 0,
            bestScore: score || 0
          }
        }
      });
    } else {
      // Update existing game statistics
      gameStats.activeDays = activeDays;
      gameStats.currentStreak = currentStreak;
      gameStats.longestStreak = Math.max(currentStreak, user.gameStats.longestStreak || 0);
      gameStats.totalActivities = totalActivities;
      gameStats.gamesPlayed = (todayActivity?.activities.gamesPlayed || 0);
      gameStats.quizzesCompleted = (todayActivity?.activities.quizzesCompleted || 0);
      gameStats.forumPosts = (todayActivity?.activities.forumPosts || 0);
      gameStats.totalTimeSpent = (todayActivity?.activities.timeSpent || 0);
      
      // Update game type specific stats
      if (!gameStats.gameTypeStats) {
        gameStats.gameTypeStats = {};
      }
      if (!gameStats.gameTypeStats[gameType]) {
        gameStats.gameTypeStats[gameType] = {
          gamesPlayed: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0
        };
      }
      
      const typeStats = gameStats.gameTypeStats[gameType];
      typeStats.gamesPlayed = (typeStats.gamesPlayed || 0) + 1;
      typeStats.totalScore = (typeStats.totalScore || 0) + (score || 0);
      typeStats.averageScore = typeStats.totalScore / typeStats.gamesPlayed;
      if ((score || 0) > (typeStats.bestScore || 0)) {
        typeStats.bestScore = score || 0;
      }
      
      gameStats.lastUpdated = new Date();
      await gameStats.save();
    }

    // Check and award badges after game completion
    const newlyAwardedBadges = await badgeEngine.checkAndAwardBadges(
      req.user._id,
      'game_completed',
      {
        gameType,
        score: score || 0,
        correctAnswers: correctAnswers || 0,
        totalQuestions: totalQuestions || 0
      }
    );

    res.json({
      success: true,
      gameSession,
      stats: user.gameStats,
      newlyAwardedBadges: newlyAwardedBadges.length > 0 ? newlyAwardedBadges : undefined
    });
  } catch (error) {
    console.error('Game play error:', error);
    res.status(500).json({
      success: false,
      message: 'Error saving game session'
    });
  }
});

// @route   GET /api/games/stats
// @desc    Get user game statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('gameStats');

    const totalGames = await GameSession.countDocuments({ 
      userId: req.user._id,
      status: 'completed'
    });

    const recentGames = await GameSession.find({ 
      userId: req.user._id,
      status: 'completed'
    })
      .sort({ completedAt: -1 })
      .limit(10)
      .select('gameType score completedAt');

    res.json({
      success: true,
      stats: user.gameStats || {
        totalGames: 0,
        totalScore: 0,
        bestScore: 0,
        averageScore: 0,
        currentStreak: 0,
        longestStreak: 0
      },
      totalGames,
      recentGames
    });
  } catch (error) {
    console.error('Get game stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching game statistics'
    });
  }
});

// @route   GET /api/games/activity
// @desc    Get daily activity and streak data (alias for backward compatibility)
// @access  Private
router.get('/activity', protect, async (req, res) => {
  try {
    const { days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    startDate.setHours(0, 0, 0, 0);

    const activities = await DailyActivity.find({
      userId: req.user._id,
      date: { $gte: startDate }
    })
      .sort({ date: -1 })
      .limit(parseInt(days));

    // Get current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);
    
    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);
      
      const activity = await DailyActivity.findOne({
        userId: req.user._id,
        date: { $gte: dayStart, $lte: dayEnd }
      });
      
      if (activity && (activity.activities.quizzesCompleted > 0 || activity.activities.gamesPlayed > 0)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Get game statistics for today (reuse today variable)
    const gameStats = await GameStatistics.findOne({ userId: req.user._id, date: today });
    
    // Format activities for calendar view
    const calendarData = activities.map(activity => ({
      date: activity.date,
      quizzes: activity.activities.quizzesCompleted || 0,
      games: activity.activities.gamesPlayed || 0,
      posts: activity.activities.forumPosts || 0,
      timeSpent: activity.activities.timeSpent || 0,
      hasActivity: (activity.activities.quizzesCompleted || 0) > 0 || 
                   (activity.activities.gamesPlayed || 0) > 0 || 
                   (activity.activities.forumPosts || 0) > 0
    }));

    res.json({
      success: true,
      currentStreak: streak,
      activities: calendarData,
      activityLog: calendarData, // Alias for backward compatibility
      totalDays: activities.length,
      gameStatistics: gameStats ? {
        activeDays: gameStats.activeDays || 0,
        currentStreak: gameStats.currentStreak || 0,
        totalActivities: gameStats.totalActivities || 0
      } : {
        activeDays: 0,
        currentStreak: streak,
        totalActivities: calendarData.reduce((sum, a) => sum + a.quizzes + a.games + a.posts, 0)
      }
    });
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching activity data'
    });
  }
});

module.exports = router;
