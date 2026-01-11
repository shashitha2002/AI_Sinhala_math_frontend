const express = require('express');
const progressController = require('../services/progressController');
const dktService = require('../services/dktService');
const projectionService = require('../services/projectionService');
const User = require('../models/User');
const Recommendation = require('../models/Recommendation');
const XAIResponse = require('../models/XAIResponse');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/recommendations/adaptive
// @desc    Get adaptive recommendation using DKT model with XAI explanation
// @access  Private
router.get('/adaptive', protect, async (req, res) => {
  try {
    const includeXAI = req.query.xai === 'true' || req.query.xai === '1';
    
    const recommendation = await progressController.getAdaptiveRecommendation(
      req.user._id
    );

    // Store recommendation in database
    let savedRecommendation = null;
    if (recommendation.success && recommendation.recommendation) {
      try {
        savedRecommendation = await Recommendation.create({
          userId: req.user._id,
          recommendationType: 'adaptive',
          recommendedTopic: recommendation.recommendation.recommended_topic,
          recommendedAction: recommendation.recommendation.recommended_action,
          optimalQuestionId: recommendation.recommendation.optimal_question_id,
          predictedSuccessRate: recommendation.recommendation.predicted_success_rate,
          masteryLevel: recommendation.recommendation.mastery_level,
          priority: recommendation.recommendation.priority,
          goal: recommendation.goal,
          knowledgeState: recommendation.knowledge_state,
          allRecommendations: recommendation.all_recommendations,
          source: 'dkt-model'
        });
      } catch (error) {
        console.error('Error saving recommendation:', error);
      }
    }

    // Add XAI explanation if requested
    let savedXAI = null;
    if (includeXAI && recommendation.success && recommendation.recommendation) {
      try {
        // Get user data and knowledge state
        const user = await User.findById(req.user._id);
        const history = await progressController.getStudentLearningHistory(req.user._id);
        const knowledgeState = await dktService.predictKnowledgeState(history);
        
        if (knowledgeState.success) {
          const xaiExplanation = await projectionService.getXAIExplanation(
            recommendation.recommendation,
            user.toObject(),
            knowledgeState.knowledge_vector
          );
          
          recommendation.xai_explanation = xaiExplanation;

          // Store XAI response in database
          if (savedRecommendation) {
            savedXAI = await XAIResponse.create({
              userId: req.user._id,
              recommendationId: savedRecommendation._id,
              explanationType: 'recommendation',
              explanation: xaiExplanation.explanation || xaiExplanation.reasoning || '',
              factors: xaiExplanation.factors || [],
              confidence: xaiExplanation.confidence || 0.5,
              reasoning: xaiExplanation.reasoning || '',
              visualizations: xaiExplanation.visualizations || [],
              metadata: {
                modelVersion: '1.0',
                algorithm: 'DKT',
                processingTime: xaiExplanation.processingTime || 0
              }
            });
          }
        }
      } catch (xaiError) {
        console.error('XAI explanation error:', xaiError);
        // Continue without XAI if it fails
      }
    }

    res.json({
      success: true,
      ...recommendation,
      recommendationId: savedRecommendation?._id,
      xaiResponseId: savedXAI?._id
    });
  } catch (error) {
    console.error('Get adaptive recommendation error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating recommendation',
      error: error.message
    });
  }
});

// @route   GET /api/recommendations/knowledge-state
// @desc    Get current knowledge state for student
// @access  Private
router.get('/knowledge-state', protect, async (req, res) => {
  try {
    const history = await progressController.getStudentLearningHistory(
      req.user._id
    );

    if (history.length === 0) {
      return res.json({
        success: true,
        knowledge_state: {
          mastery_scores: {},
          message: 'No learning history yet. Start by taking quizzes!'
        }
      });
    }

    const knowledgeState = await dktService.predictKnowledgeState(history);

    res.json({
      success: true,
      knowledge_state: {
        mastery_scores: knowledgeState.mastery_scores,
        top_topics: progressController.getTopTopics(knowledgeState.mastery_scores, 5),
        weak_topics: progressController.getWeakTopics(knowledgeState.mastery_scores, 5)
      }
    });
  } catch (error) {
    console.error('Get knowledge state error:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting knowledge state',
      error: error.message
    });
  }
});

// @route   GET /api/recommendations/dkt-health
// @desc    Check DKT service health
// @access  Private
router.get('/dkt-health', protect, async (req, res) => {
  try {
    const health = await dktService.healthCheck();
    res.json({
      success: true,
      ...health
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'ERROR',
      model_loaded: false,
      error: error.message
    });
  }
});

module.exports = router;


