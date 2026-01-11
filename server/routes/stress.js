const express = require('express');
const axios = require('axios');
const User = require('../models/User');
const Quiz = require('../models/Quiz');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/stress/analyze
// @desc    Analyze student behavior for stress detection
// @access  Private
router.post('/analyze', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    
    // Get recent activity data
    const recentQuizzes = await Quiz.find({
      userId: req.user._id,
      timeStarted: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
    }).limit(10);

    // Collect behavioral indicators
    const indicators = {
      responseDelay: [], // Average time per question
      sessionDuration: [], // Total time spent
      errorRate: [], // Percentage of wrong answers
      clickPattern: 0, // Number of rapid clicks/changes
      timeSpentToday: req.body.timeSpentToday || 0,
      recentActivity: recentQuizzes.length
    };

    recentQuizzes.forEach(quiz => {
      if (quiz.answers && quiz.answers.length > 0) {
        const avgTime = quiz.answers.reduce((sum, ans) => sum + (ans.timeSpent || 0), 0) / quiz.answers.length;
        indicators.responseDelay.push(avgTime);
        
        const errorRate = quiz.answers.filter(a => !a.isCorrect).length / quiz.answers.length;
        indicators.errorRate.push(errorRate);
      }
      
      if (quiz.timeStarted && quiz.timeCompleted) {
        const duration = (quiz.timeCompleted - quiz.timeStarted) / 1000 / 60; // minutes
        indicators.sessionDuration.push(duration);
      }
    });

    // Call ML service for stress analysis
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/analyze-stress`,
        {
          userId: req.user._id.toString(),
          indicators: {
            responseDelay: indicators.responseDelay.length > 0 
              ? indicators.responseDelay.reduce((a, b) => a + b, 0) / indicators.responseDelay.length 
              : 0,
            avgSessionDuration: indicators.sessionDuration.length > 0
              ? indicators.sessionDuration.reduce((a, b) => a + b, 0) / indicators.sessionDuration.length
              : 0,
            avgErrorRate: indicators.errorRate.length > 0
              ? indicators.errorRate.reduce((a, b) => a + b, 0) / indicators.errorRate.length
              : 0,
            timeSpentToday: indicators.timeSpentToday,
            recentActivity: indicators.recentActivity
          },
          historicalPatterns: user.stressIndicators.patterns.slice(-5) // Last 5 patterns
        }
      );

      // Update user stress indicators
      user.stressIndicators.lastAnalysis = new Date();
      user.stressIndicators.stressLevel = mlResponse.data.stressLevel;
      user.stressIndicators.patterns.push({
        timestamp: new Date(),
        indicators: {
          responseDelay: indicators.responseDelay.length > 0 
            ? indicators.responseDelay.reduce((a, b) => a + b, 0) / indicators.responseDelay.length 
            : 0,
          sessionDuration: indicators.sessionDuration.length > 0
            ? indicators.sessionDuration.reduce((a, b) => a + b, 0) / indicators.sessionDuration.length
            : 0,
          errorRate: indicators.errorRate.length > 0
            ? indicators.errorRate.reduce((a, b) => a + b, 0) / indicators.errorRate.length
            : 0,
          clickPattern: indicators.clickPattern
        }
      });

      // Keep only last 20 patterns
      if (user.stressIndicators.patterns.length > 20) {
        user.stressIndicators.patterns = user.stressIndicators.patterns.slice(-20);
      }

      await user.save();

      res.json({
        success: true,
        stressLevel: mlResponse.data.stressLevel,
        recommendation: mlResponse.data.recommendation,
        motivationalMessage: mlResponse.data.motivationalMessage,
        indicators: mlResponse.data.indicators
      });
    } catch (mlError) {
      console.error('ML Service Error:', mlError);
      
      // Fallback stress calculation
      const avgErrorRate = indicators.errorRate.length > 0
        ? indicators.errorRate.reduce((a, b) => a + b, 0) / indicators.errorRate.length
        : 0;
      
      const estimatedStress = Math.min(100, Math.max(0, avgErrorRate * 100 + 20));
      
      res.json({
        success: true,
        stressLevel: estimatedStress,
        recommendation: estimatedStress > 60 
          ? 'Take a short break and practice easier questions'
          : 'You\'re doing well! Keep practicing.',
        motivationalMessage: 'Remember, consistent practice leads to improvement!',
        indicators: {
          avgErrorRate,
          recentActivity: indicators.recentActivity
        }
      });
    }
  } catch (error) {
    console.error('Stress analysis error:', error);
    res.status(500).json({
      success: false,
      message: 'Error analyzing stress levels'
    });
  }
});

// @route   GET /api/stress/history
// @desc    Get stress analysis history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      stressLevel: user.stressIndicators.stressLevel,
      lastAnalysis: user.stressIndicators.lastAnalysis,
      patterns: user.stressIndicators.patterns.slice(-10) // Last 10 patterns
    });
  } catch (error) {
    console.error('Get stress history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stress history'
    });
  }
});

module.exports = router;


