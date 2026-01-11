const mongoose = require('mongoose');
const User = require('../models/User');
const Badge = require('../models/Badge');
const Quiz = require('../models/Quiz');
const ForumPost = require('../models/ForumPost');
const { GameSession, DailyActivity } = require('../models/Game');

/**
 * Badge Engine Service
 * Handles badge criteria evaluation and automatic badge awarding
 */
class BadgeEngine {
  /**
   * Check and award badges for a user based on their current activity
   * @param {String} userId - User ID
   * @param {String} activityType - Type of activity that triggered the check (e.g., 'quiz_completed', 'forum_post')
   * @param {Object} activityData - Additional data about the activity
   * @returns {Promise<Array>} Array of newly awarded badges
   */
  async checkAndAwardBadges(userId, activityType, activityData = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error(`User ${userId} not found`);
        return [];
      }

      // Get all active badges
      const allBadges = await Badge.find({ isActive: true });
      const newlyAwarded = [];

      // Get user's current badges to avoid duplicates
      const userBadges = user.performance.badges || [];

      // Collect user statistics for badge evaluation
      const userStats = await this.collectUserStats(userId, activityType, activityData);

      // Check each badge's criteria
      for (const badge of allBadges) {
        // Skip if user already has this badge
        if (userBadges.includes(badge.badgeId)) {
          continue;
        }

        // Evaluate badge criteria
        const meetsCriteria = await this.evaluateBadgeCriteria(
          badge,
          userStats,
          activityType,
          activityData
        );

        if (meetsCriteria) {
          // Award the badge
          await this.awardBadge(user, badge);
          newlyAwarded.push({
            badgeId: badge.badgeId,
            name: badge.name,
            description: badge.description,
            icon: badge.icon,
            category: badge.category,
            rarity: badge.rarity
          });
        }
      }

      return newlyAwarded;
    } catch (error) {
      console.error('Error checking badges:', error);
      return [];
    }
  }

  /**
   * Collect comprehensive user statistics for badge evaluation
   */
  async collectUserStats(userId, activityType, activityData) {
    const user = await User.findById(userId);

    // Get quiz statistics
    const allQuizzes = await Quiz.find({
      userId,
      status: 'completed'
    });

    const totalQuizzes = allQuizzes.length;
    const modelPapers = allQuizzes.filter(q => q.type === 'model-paper');
    const adaptiveQuizzes = allQuizzes.filter(q => q.type === 'adaptive');

    // Calculate scores
    const scores = allQuizzes
      .map(q => q.score?.percentage)
      .filter(s => s !== undefined && s !== null);
    const averageScore = user.performance.averageScore || 0;
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

    // Topic mastery
    const topicMastery = {};
    allQuizzes.forEach(quiz => {
      quiz.questions.forEach((question, index) => {
        const answer = quiz.answers[index];
        if (question.topic) {
          if (!topicMastery[question.topic]) {
            topicMastery[question.topic] = { correct: 0, total: 0 };
          }
          topicMastery[question.topic].total++;
          if (answer && answer.isCorrect) {
            topicMastery[question.topic].correct++;
          }
        }
      });
    });

    // Calculate mastery percentages
    const topicMasteryPercentages = {};
    Object.keys(topicMastery).forEach(topic => {
      topicMasteryPercentages[topic] =
        (topicMastery[topic].correct / topicMastery[topic].total) * 100;
    });

    // Forum participation
    const forumPosts = await ForumPost.countDocuments({ userId });
    const forumComments = await ForumPost.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $project: { commentCount: { $size: '$comments' } } },
      { $group: { _id: null, total: { $sum: '$commentCount' } } }
    ]);
    const totalForumComments = forumComments[0]?.total || 0;

    // Time spent
    const totalTimeSpent = user.performance.totalTimeSpent || 0; // in minutes

    // Streak calculation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayStart = new Date(checkDate);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasActivity = await Quiz.exists({
        userId,
        timeStarted: { $gte: dayStart, $lte: dayEnd }
      }) || await GameSession.exists({
        userId,
        startedAt: { $gte: dayStart, $lte: dayEnd }
      });

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Game statistics
    const gameStats = user.gameStats || {
      totalGames: 0,
      bestScore: 0,
      averageScore: 0,
      currentStreak: 0
    };

    return {
      totalQuizzes,
      modelPapers: modelPapers.length,
      adaptiveQuizzes: adaptiveQuizzes.length,
      averageScore,
      bestScore,
      topicMastery: topicMasteryPercentages,
      topicCompletion: topicMastery, // For checking if all quizzes in a topic are completed
      forumPosts,
      forumComments: totalForumComments,
      totalTimeSpent,
      streak,
      gameStats,
      recentQuiz: activityData.quiz || null,
      recentScore: activityData.score || null,
      recentTopic: activityData.topic || null
    };
  }

  /**
   * Evaluate if user meets badge criteria
   */
  async evaluateBadgeCriteria(badge, userStats, activityType, activityData) {
    // All criteria must be met (AND logic)
    for (const criterion of badge.criteria) {
      const meetsCriterion = this.evaluateCriterion(criterion, userStats, activityType, activityData);
      if (!meetsCriterion) {
        return false;
      }
    }
    return true;
  }

  /**
   * Evaluate a single criterion
   */
  evaluateCriterion(criterion, userStats, activityType, activityData) {
    const { type, condition, value, topic, quizType } = criterion;

    switch (type) {
      case 'quiz_completion':
        if (condition === 'all' && topic) {
          // Check if all quizzes for a specific topic are completed
          const topicQuizzes = userStats.topicCompletion[topic] || { total: 0 };
          // This would need additional logic to check if ALL quizzes in topic are done
          // For now, we'll use a threshold
          return topicQuizzes.total >= (value || 10);
        }
        return this.compareValues(userStats.totalQuizzes, condition, value);

      case 'quiz_score':
        // Check if this is for a perfect score (100%) - check recent score
        if (condition === 'equals' && value === 100 && activityData.score) {
          return activityData.score === 100;
        }
        // Otherwise check average score across all quizzes
        const scoreToCheck = userStats.averageScore;
        return this.compareValues(scoreToCheck, condition, value);

      case 'topic_mastery':
        if (topic) {
          const mastery = userStats.topicMastery[topic] || 0;
          return this.compareValues(mastery, condition, value);
        }
        // Check if any topic has mastery >= value
        return Object.values(userStats.topicMastery).some(
          mastery => this.compareValues(mastery, condition, value)
        );

      case 'model_paper_score':
        if (activityData.quizType === 'model-paper' && activityData.score) {
          return this.compareValues(activityData.score, condition, value);
        }
        return false;

      case 'time_spent':
        return this.compareValues(userStats.totalTimeSpent, condition, value);

      case 'forum_participation':
        // Check if criterion specifies posts or comments
        const isPosts = !criterion.value || typeof criterion.value === 'number';
        const forumCount = isPosts ?
          userStats.forumPosts :
          userStats.forumComments;
        return this.compareValues(forumCount, condition, value);

      case 'streak':
        return this.compareValues(userStats.streak, condition, value);

      case 'total_quizzes':
        return this.compareValues(userStats.totalQuizzes, condition, value);

      case 'game_achievement':
        if (condition === 'best_score') {
          return this.compareValues(userStats.gameStats.bestScore, 'greater_equal', value);
        }
        if (condition === 'total_games') {
          return this.compareValues(userStats.gameStats.totalGames, condition, value);
        }
        return false;

      default:
        return false;
    }
  }

  /**
   * Compare values based on condition
   */
  compareValues(actual, condition, expected) {
    if (actual === null || actual === undefined) {
      return false;
    }

    switch (condition) {
      case 'equals':
        return actual === expected;
      case 'greater_than':
        return actual > expected;
      case 'less_than':
        return actual < expected;
      case 'greater_equal':
        return actual >= expected;
      case 'less_equal':
        return actual <= expected;
      case 'contains':
        if (Array.isArray(actual)) {
          return actual.includes(expected);
        }
        return String(actual).includes(String(expected));
      case 'all':
        if (Array.isArray(expected)) {
          return expected.every(val =>
            Array.isArray(actual) ? actual.includes(val) : actual === val
          );
        }
        return actual === expected;
      default:
        return false;
    }
  }

  /**
   * Award a badge to a user
   */
  async awardBadge(user, badge) {
    // Add badge ID to user's badges array if not already present
    if (!user.performance.badges.includes(badge.badgeId)) {
      user.performance.badges.push(badge.badgeId);
    }

    // Add achievement record
    user.performance.achievements.push({
      title: badge.name,
      description: badge.description,
      date: new Date()
    });

    // Keep only last 50 achievements
    if (user.performance.achievements.length > 50) {
      user.performance.achievements = user.performance.achievements.slice(-50);
    }

    await user.save();
  }

  /**
   * Initialize default badges in the database
   */
  async initializeDefaultBadges() {
    const defaultBadges = [
      {
        badgeId: 'first_quiz',
        name: 'First Steps',
        description: 'Completed your first quiz',
        icon: '🎯',
        category: 'quiz',
        rarity: 'common',
        criteria: [{ type: 'total_quizzes', condition: 'greater_equal', value: 1 }]
      },
      {
        badgeId: 'quiz_master_10',
        name: 'Quiz Enthusiast',
        description: 'Completed 10 quizzes',
        icon: '📚',
        category: 'quiz',
        rarity: 'common',
        criteria: [{ type: 'total_quizzes', condition: 'greater_equal', value: 10 }]
      },
      {
        badgeId: 'quiz_master_50',
        name: 'Quiz Master',
        description: 'Completed 50 quizzes',
        icon: '🏆',
        category: 'quiz',
        rarity: 'rare',
        criteria: [{ type: 'total_quizzes', condition: 'greater_equal', value: 50 }]
      },
      {
        badgeId: 'quiz_master_100',
        name: 'Quiz Legend',
        description: 'Completed 100 quizzes',
        icon: '👑',
        category: 'quiz',
        rarity: 'epic',
        criteria: [{ type: 'total_quizzes', condition: 'greater_equal', value: 100 }]
      },
      {
        badgeId: 'excellent_score',
        name: 'Excellent Performer',
        description: 'Achieved an average score of 80% or higher',
        icon: '⭐',
        category: 'achievement',
        rarity: 'uncommon',
        criteria: [{ type: 'quiz_score', condition: 'greater_equal', value: 80 }]
      },
      {
        badgeId: 'perfect_score',
        name: 'Perfect Score',
        description: 'Achieved 100% on a quiz',
        icon: '💯',
        category: 'achievement',
        rarity: 'rare',
        criteria: [{ type: 'quiz_score', condition: 'equals', value: 100 }]
      },
      {
        badgeId: 'model_paper_80',
        name: 'Model Paper Expert',
        description: 'Scored 80% or higher on a model paper',
        icon: '📝',
        category: 'quiz',
        rarity: 'uncommon',
        criteria: [
          { type: 'model_paper_score', condition: 'greater_equal', value: 80, quizType: 'model-paper' }
        ]
      },
      {
        badgeId: 'model_paper_90',
        name: 'Model Paper Master',
        description: 'Scored 90% or higher on a model paper',
        icon: '🎓',
        category: 'quiz',
        rarity: 'rare',
        criteria: [
          { type: 'model_paper_score', condition: 'greater_equal', value: 90, quizType: 'model-paper' }
        ]
      },
      {
        badgeId: 'topic_master',
        name: 'Topic Master',
        description: 'Achieved 80% mastery in any topic',
        icon: '🎯',
        category: 'mastery',
        rarity: 'uncommon',
        criteria: [{ type: 'topic_mastery', condition: 'greater_equal', value: 80 }]
      },
      {
        badgeId: 'dedicated_learner',
        name: 'Dedicated Learner',
        description: 'Spent 10 hours (600 minutes) on the platform',
        icon: '⏰',
        category: 'time',
        rarity: 'common',
        criteria: [{ type: 'time_spent', condition: 'greater_equal', value: 600 }]
      },
      {
        badgeId: 'time_champion',
        name: 'Time Champion',
        description: 'Spent 50 hours (3000 minutes) on the platform',
        icon: '⏳',
        category: 'time',
        rarity: 'rare',
        criteria: [{ type: 'time_spent', condition: 'greater_equal', value: 3000 }]
      },
      {
        badgeId: 'consistent_7',
        name: 'Week Warrior',
        description: 'Maintained a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'uncommon',
        criteria: [{ type: 'streak', condition: 'greater_equal', value: 7 }]
      },
      {
        badgeId: 'consistent_30',
        name: 'Monthly Champion',
        description: 'Maintained a 30-day learning streak',
        icon: '🌟',
        category: 'streak',
        rarity: 'epic',
        criteria: [{ type: 'streak', condition: 'greater_equal', value: 30 }]
      },
      // Game Badges
      {
        badgeId: 'game_explorer',
        name: 'Game Explorer',
        description: 'Played your first game',
        icon: '🎮',
        category: 'game',
        rarity: 'common',
        criteria: [{ type: 'game_achievement', condition: 'total_games', value: 1 }]
      },
      {
        badgeId: 'arcade_fan',
        name: 'Arcade Fan',
        description: 'Played 10 games',
        icon: '🕹️',
        category: 'game',
        rarity: 'uncommon',
        criteria: [{ type: 'game_achievement', condition: 'total_games', value: 10 }]
      },
      {
        badgeId: 'high_scorer',
        name: 'High Scorer',
        description: 'Achieved a score of 1000 or more in a game',
        icon: '🎯',
        category: 'game',
        rarity: 'rare',
        criteria: [{ type: 'game_achievement', condition: 'best_score', value: 1000 }]
      },
      // New Average Score Badges
      {
        badgeId: 'avg_score_45',
        name: 'Bronze Scholar',
        description: 'Achieved an average score above 45%',
        icon: '🥉',
        category: 'achievement',
        rarity: 'common',
        criteria: [{ type: 'quiz_score', condition: 'greater_than', value: 45 }]
      },
      {
        badgeId: 'avg_score_55',
        name: 'Silver Scholar',
        description: 'Achieved an average score above 55%',
        icon: '🥈',
        category: 'achievement',
        rarity: 'uncommon',
        criteria: [{ type: 'quiz_score', condition: 'greater_than', value: 55 }]
      },
      {
        badgeId: 'avg_score_65',
        name: 'Gold Scholar',
        description: 'Achieved an average score above 65%',
        icon: '🥇',
        category: 'achievement',
        rarity: 'rare',
        criteria: [{ type: 'quiz_score', condition: 'greater_than', value: 65 }]
      },
      {
        badgeId: 'avg_score_75',
        name: 'Platinum Scholar',
        description: 'Achieved an average score above 75%',
        icon: '💎',
        category: 'achievement',
        rarity: 'epic',
        criteria: [{ type: 'quiz_score', condition: 'greater_than', value: 75 }]
      }
    ];

    for (const badgeData of defaultBadges) {
      await Badge.findOneAndUpdate(
        { badgeId: badgeData.badgeId },
        badgeData,
        { upsert: true, new: true }
      );
    }

    console.log(`✅ Initialized ${defaultBadges.length} default badges`);
  }
}

// Export singleton instance
module.exports = new BadgeEngine();

