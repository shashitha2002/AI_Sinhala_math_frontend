const express = require('express');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/progress/dashboard
// @desc    Get student dashboard data
// @access  Private
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Get recent quiz performance
    const recentQuizzes = await Quiz.find({
      userId: req.user._id,
      status: 'completed'
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .select('type score timeStarted createdAt questions.topic');

    // Calculate statistics
    const allQuizzes = await Quiz.find({
      userId: req.user._id,
      status: 'completed'
    });

    const totalQuizzes = allQuizzes.length;
    const averageScore = user.performance.averageScore;

    // Calculate topic-wise performance
    const topicPerformance = {};
    allQuizzes.forEach(quiz => {
      quiz.questions.forEach((question, index) => {
        const answer = quiz.answers[index];
        if (answer && answer.isCorrect && question.topic) {
          if (!topicPerformance[question.topic]) {
            topicPerformance[question.topic] = { correct: 0, total: 0 };
          }
          topicPerformance[question.topic].correct++;
          topicPerformance[question.topic].total++;
        } else if (question.topic) {
          if (!topicPerformance[question.topic]) {
            topicPerformance[question.topic] = { correct: 0, total: 0 };
          }
          topicPerformance[question.topic].total++;
        }
      });
    });

    const topicStats = Object.keys(topicPerformance).map(topic => ({
      topic,
      accuracy: (topicPerformance[topic].correct / topicPerformance[topic].total) * 100,
      total: topicPerformance[topic].total
    }));

    // Calculate streak (consecutive days with activity)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    while (true) {
      const dayStart = new Date(checkDate);
      const dayEnd = new Date(checkDate);
      dayEnd.setHours(23, 59, 59, 999);

      const hasActivity = await Quiz.exists({
        userId: req.user._id,
        timeStarted: { $gte: dayStart, $lte: dayEnd }
      });

      if (hasActivity) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    // Check for new badges (using badge engine)
    const badgeEngine = require('../services/badgeEngine');
    await badgeEngine.checkAndAwardBadges(req.user._id, 'dashboard_view', {
      totalQuizzes,
      averageScore,
      streak
    });

    // Refresh user to get updated badges
    const updatedUser = await User.findById(req.user._id);
    const badges = updatedUser.performance.badges || [];

    res.json({
      success: true,
      dashboard: {
        totalQuizzes,
        averageScore: Math.round(averageScore * 10) / 10,
        totalTimeSpent: user.performance.totalTimeSpent,
        currentStreak: streak,
        badges,
        recentQuizzes: recentQuizzes.map(q => ({
          id: q._id,
          type: q.type,
          topic: q.questions[0]?.topic || 'General',
          score: q.score.percentage,
          date: q.timeStarted || q.createdAt
        })),
        topicPerformance: topicStats,
        mastery: user.profile.syllabusTopics
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard data'
    });
  }
});

// @route   GET /api/progress/portfolio
// @desc    Generate portfolio/CV
// @access  Private
router.get('/portfolio', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    const allQuizzes = await Quiz.find({
      userId: req.user._id,
      status: 'completed'
    });

    // Calculate comprehensive statistics
    const totalQuizzes = allQuizzes.length;
    const modelPapers = allQuizzes.filter(q => q.type === 'model-paper').length;
    const adaptiveQuizzes = allQuizzes.filter(q => q.type === 'adaptive').length;

    const scores = allQuizzes.map(q => q.score.percentage).filter(s => s !== undefined);
    const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const averageScore = user.performance.averageScore;

    // Calculate topic mastery
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

    const masteryList = Object.keys(topicMastery).map(topic => ({
      topic,
      mastery: (topicMastery[topic].correct / topicMastery[topic].total) * 100,
      questionsAttempted: topicMastery[topic].total
    })).sort((a, b) => b.mastery - a.mastery);

    // Generate portfolio data
    const portfolio = {
      studentInfo: {
        name: user.name,
        email: user.email,
        studentId: user.studentId || 'N/A',
        school: user.profile.school || 'N/A',
        district: user.profile.district || 'N/A',
        grade: user.profile.grade || 'O-Level'
      },
      academicSummary: {
        totalQuizzes,
        modelPapersCompleted: modelPapers,
        adaptiveQuizzesCompleted: adaptiveQuizzes,
        averageScore: Math.round(averageScore * 10) / 10,
        bestScore: Math.round(bestScore * 10) / 10,
        totalTimeSpent: Math.round(user.performance.totalTimeSpent * 10) / 10
      },
      achievements: user.performance.achievements || [],
      badges: user.performance.badges || [],
      topicMastery: masteryList,
      strengths: masteryList.filter(t => t.mastery >= 70).map(t => t.topic),
      areasForImprovement: masteryList.filter(t => t.mastery < 50).map(t => t.topic),
      generatedAt: new Date()
    };

    res.json({
      success: true,
      portfolio,
      formattedText: formatPortfolioText(portfolio)
    });
  } catch (error) {
    console.error('Generate portfolio error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating portfolio'
    });
  }
});

// Helper function to format portfolio as text
function formatPortfolioText(portfolio) {
  let text = `O-LEVEL MATHEMATICS LEARNING PORTFOLIO\n`;
  text += `==========================================\n\n`;
  text += `STUDENT INFORMATION\n`;
  text += `-------------------\n`;
  text += `Name: ${portfolio.studentInfo.name}\n`;
  text += `Student ID: ${portfolio.studentInfo.studentId}\n`;
  text += `School: ${portfolio.studentInfo.school}\n`;
  text += `District: ${portfolio.studentInfo.district}\n`;
  text += `Grade: ${portfolio.studentInfo.grade}\n\n`;

  text += `ACADEMIC SUMMARY\n`;
  text += `----------------\n`;
  text += `Total Quizzes Completed: ${portfolio.academicSummary.totalQuizzes}\n`;
  text += `Model Papers: ${portfolio.academicSummary.modelPapersCompleted}\n`;
  text += `Adaptive Quizzes: ${portfolio.academicSummary.adaptiveQuizzesCompleted}\n`;
  text += `Average Score: ${portfolio.academicSummary.averageScore}%\n`;
  text += `Best Score: ${portfolio.academicSummary.bestScore}%\n`;
  text += `Total Time Spent: ${portfolio.academicSummary.totalTimeSpent} minutes\n\n`;

  if (portfolio.badges.length > 0) {
    text += `BADGES EARNED\n`;
    text += `-------------\n`;
    portfolio.badges.forEach(badge => {
      text += `• ${badge.toUpperCase()}\n`;
    });
    text += `\n`;
  }

  if (portfolio.strengths.length > 0) {
    text += `STRENGTHS\n`;
    text += `---------\n`;
    portfolio.strengths.forEach(topic => {
      text += `• ${topic}\n`;
    });
    text += `\n`;
  }

  if (portfolio.areasForImprovement.length > 0) {
    text += `AREAS FOR IMPROVEMENT\n`;
    text += `---------------------\n`;
    portfolio.areasForImprovement.forEach(topic => {
      text += `• ${topic}\n`;
    });
    text += `\n`;
  }

  text += `TOPIC MASTERY\n`;
  text += `-------------\n`;
  portfolio.topicMastery.slice(0, 10).forEach(topic => {
    text += `${topic.topic}: ${Math.round(topic.mastery)}% (${topic.questionsAttempted} questions)\n`;
  });
  text += `\n`;

  text += `Generated on: ${portfolio.generatedAt.toLocaleDateString()}\n`;

  return text;
}

module.exports = router;


