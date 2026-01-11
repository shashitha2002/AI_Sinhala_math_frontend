const PerformanceData = require('../models/PerformanceData');
const Question = require('../models/Question');
const User = require('../models/User');
const SyllabusTopic = require('../models/SyllabusTopic');
const Quiz = require('../models/Quiz');
const dktService = require('./dktService');
const mongoose = require('mongoose');

/**
 * Progress Controller - Implements Adaptive Goal Setting & Topic Prioritization
 */
class ProgressController {
  /**
   * Get student learning history as sequence for DKT model
   * @param {String} studentId - MongoDB user ID
   * @returns {Promise<Array>} Array of interaction objects
   */
  async getStudentLearningHistory(studentId) {
    try {
      const history = await PerformanceData.aggregate([
        // Match student's performance data
        {
          $match: {
            studentId: new mongoose.Types.ObjectId(studentId)
          }
        },
        // Sort by timestamp
        {
          $sort: { timestamp: 1 }
        },
        // Lookup question details
        {
          $lookup: {
            from: 'questions',
            localField: 'questionId',
            foreignField: '_id',
            as: 'question'
          }
        },
        // Unwind question
        {
          $unwind: {
            path: '$question',
            preserveNullAndEmptyArrays: true
          }
        },
        // Project required fields
        {
          $project: {
            question_id: {
              $ifNull: [
                {
                  $convert: {
                    input: {
                      $substr: [
                        { $ifNull: ['$question.questionId', 'Q0'] },
                        1,
                        -1
                      ]
                    },
                    to: 'int',
                    onError: 0,
                    onNull: 0
                  }
                },
                0
              ]
            },
            topic_id: {
              $ifNull: [
                {
                  $convert: {
                    input: {
                      $substr: [
                        { $ifNull: ['$topicId', 'G10_0'] },
                        4,
                        -1
                      ]
                    },
                    to: 'int',
                    onError: 0,
                    onNull: 0
                  }
                },
                0
              ]
            },
            is_correct: { $cond: ['$isCorrect', 1, 0] },
            time_taken: {
              $ifNull: [
                { $divide: ['$timeTaken', 100] },
                0
              ]
            },
            attempts: {
              $ifNull: ['$attemptsCount', 1]
            },
            timestamp: '$timestamp',
            topic_name: '$question.topic',
            difficulty: {
              $ifNull: ['$question.irtParameters.difficulty', 0]
            }
          }
        }
      ]);

      // Convert to format expected by DKT model
      const sequence = history.map(item => ({
        question_id: item.question_id || 0,
        topic_id: item.topic_id || 0,
        is_correct: item.is_correct || 0,
        time_taken: Math.min(item.time_taken || 0, 300), // Cap at 300 seconds
        attempts: Math.min(item.attempts || 1, 5) // Cap at 5 attempts
      }));

      return sequence;
    } catch (error) {
      console.error('Error getting student learning history:', error);
      return [];
    }
  }

  /**
   * Get unattempted questions for a student
   * @param {String} studentId - MongoDB user ID
   * @returns {Promise<Array>} Array of unattempted questions
   */
  async getUnattemptedQuestions(studentId) {
    try {
      // Get all attempted question IDs
      const attemptedQuestions = await PerformanceData.distinct('questionId', {
        studentId: new mongoose.Types.ObjectId(studentId)
      });

      // Get unattempted questions
      const unattempted = await Question.find({
        _id: { $nin: attemptedQuestions }
      })
        .select('questionId topic topicId irtParameters')
        .limit(100); // Limit for performance

      // Format for DKT model
      return unattempted.map(q => ({
        question_id: parseInt(q.questionId.replace('Q', '')) || 0,
        topic_id: parseInt(q.topicId.replace(/G\d+_/, '')) || 0,
        topic_name: q.topic || 'Unknown',
        difficulty: q.irtParameters?.difficulty || 0,
        questionId: q._id.toString()
      }));
    } catch (error) {
      console.error('Error getting unattempted questions:', error);
      return [];
    }
  }

  /**
   * Get adaptive recommendation using DKT model
   * @param {String} studentId - MongoDB user ID
   * @returns {Promise<Object>} Recommendation with goal and next action
   */
  async getAdaptiveRecommendation(studentId) {
    try {
      // 1. Check if user has completed any quizzes (more reliable than PerformanceData)
      const completedQuizzes = await Quiz.countDocuments({
        userId: new mongoose.Types.ObjectId(studentId),
        status: 'completed'
      });

      // 2. Get processed history sequence
      const studentHistory = await this.getStudentLearningHistory(studentId);

      // 3. If no completed quizzes, return welcome message
      if (completedQuizzes === 0) {
        return {
          success: true,
          recommendation: {
            type: 'welcome',
            message: 'Welcome! Start by taking your first quiz.',
            recommended_action: 'Take a practice quiz',
            predicted_success_rate: 0.5,
            mastery_level: 0.0
          },
          goal: {
            title: 'Get Started',
            description: 'Complete your first quiz to begin learning',
            priority: 'high'
          }
        };
      }

      // 4. If user has completed quizzes but no PerformanceData, create fallback recommendation
      if (studentHistory.length === 0 && completedQuizzes > 0) {
        // Get user's quiz performance to generate recommendation
        const user = await User.findById(studentId);
        const recentQuizzes = await Quiz.find({
          userId: new mongoose.Types.ObjectId(studentId),
          status: 'completed'
        })
          .sort({ timeCompleted: -1 })
          .limit(5)
          .select('score questions');

        const averageScore = user?.performance?.averageScore || 0;
        const totalQuizzes = user?.performance?.totalQuizzes || completedQuizzes;

        // Determine recommendation based on quiz performance
        let goal, recommendedAction, priority, predictedSuccessRate, masteryLevel;

        if (averageScore < 50) {
          goal = {
            title: 'Review Fundamentals',
            description: `You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Focus on reviewing basic concepts.`,
            priority: 'high',
            type: 'review'
          };
          recommendedAction = 'Review Concepts';
          priority = 'high';
          predictedSuccessRate = 0.4;
          masteryLevel = averageScore / 100;
        } else if (averageScore < 70) {
          goal = {
            title: 'Practice More',
            description: `You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Keep practicing to improve!`,
            priority: 'medium',
            type: 'practice'
          };
          recommendedAction = 'Take Practice Quiz';
          priority = 'medium';
          predictedSuccessRate = 0.6;
          masteryLevel = averageScore / 100;
        } else {
          goal = {
            title: 'Challenge Yourself',
            description: `Great job! You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Try a model paper simulation!`,
            priority: 'low',
            type: 'challenge'
          };
          recommendedAction = 'Try Model Paper Simulation';
          priority = 'low';
          predictedSuccessRate = 0.8;
          masteryLevel = averageScore / 100;
        }

        return {
          success: true,
          recommendation: {
            recommended_topic: recentQuizzes[0]?.questions[0]?.topic || 'General',
            recommended_action: recommendedAction,
            predicted_success_rate: predictedSuccessRate,
            mastery_level: masteryLevel,
            priority: priority
          },
          goal: goal,
          knowledge_state: {
            mastery_scores: {},
            message: 'Performance data is being processed. Recommendation based on quiz scores.'
          }
        };
      }

      // 5. CALL DKT SERVICE - Predict knowledge state (user has PerformanceData)
      const knowledgeState = await dktService.predictKnowledgeState(studentHistory);
      
      // If DKT service fails, use fallback rule-based recommendation
      if (!knowledgeState.success) {
        console.warn('DKT service unavailable, using fallback recommendation based on quiz performance');
        
        // Get user's quiz performance to generate recommendation
        const user = await User.findById(studentId);
        const recentQuizzes = await Quiz.find({
          userId: new mongoose.Types.ObjectId(studentId),
          status: 'completed'
        })
          .sort({ timeCompleted: -1 })
          .limit(5)
          .select('score questions');

        const averageScore = user?.performance?.averageScore || 0;
        const totalQuizzes = user?.performance?.totalQuizzes || completedQuizzes;

        // Determine recommendation based on quiz performance
        let goal, recommendedAction, priority, predictedSuccessRate, masteryLevel;

        if (averageScore < 50) {
          goal = {
            title: 'Review Fundamentals',
            description: `You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Focus on reviewing basic concepts.`,
            priority: 'high',
            type: 'review'
          };
          recommendedAction = 'Review Concepts';
          priority = 'high';
          predictedSuccessRate = 0.4;
          masteryLevel = averageScore / 100;
        } else if (averageScore < 70) {
          goal = {
            title: 'Practice More',
            description: `You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Keep practicing to improve!`,
            priority: 'medium',
            type: 'practice'
          };
          recommendedAction = 'Take Practice Quiz';
          priority = 'medium';
          predictedSuccessRate = 0.6;
          masteryLevel = averageScore / 100;
        } else {
          goal = {
            title: 'Challenge Yourself',
            description: `Great job! You've completed ${totalQuizzes} quiz${totalQuizzes > 1 ? 'es' : ''} with an average score of ${averageScore.toFixed(0)}%. Try a model paper simulation!`,
            priority: 'low',
            type: 'challenge'
          };
          recommendedAction = 'Try Model Paper Simulation';
          priority = 'low';
          predictedSuccessRate = 0.8;
          masteryLevel = averageScore / 100;
        }

        return {
          success: true,
          recommendation: {
            recommended_topic: recentQuizzes[0]?.questions[0]?.topic || 'General',
            recommended_action: recommendedAction,
            predicted_success_rate: predictedSuccessRate,
            mastery_level: masteryLevel,
            priority: priority
          },
          goal: goal,
          knowledge_state: {
            mastery_scores: {},
            message: 'DKT service unavailable. Recommendation based on quiz scores.'
          },
          source: 'fallback'
        };
      }

      const knowledgeVector = knowledgeState.knowledge_vector;

      // 6. Get unattempted questions
      const unattemptedQuestions = await this.getUnattemptedQuestions(studentId);

      // 7. CALL DKT SERVICE - Get recommendation
      const recommendation = await dktService.recommendNextAction(
        knowledgeVector,
        unattemptedQuestions
      );

      // 8. Determine goal and action based on predicted success rate
      let goal, recommendedAction, priority;

      if (recommendation.predicted_success_rate < 0.6) {
        // High risk - Need review
        goal = {
          title: `Review ${recommendation.recommended_topic || 'Concepts'}`,
          description: `Your mastery level is ${(recommendation.mastery_level * 100).toFixed(0)}%. Review the fundamentals before attempting new challenges.`,
          priority: 'high',
          type: 'review'
        };
        recommendedAction = 'Review Concept';
        priority = 'high';
      } else if (recommendation.predicted_success_rate >= 0.6 && recommendation.predicted_success_rate < 0.8) {
        // Optimal learning zone
        goal = {
          title: `Practice ${recommendation.recommended_topic || 'Topics'}`,
          description: `You're ready for practice! Predicted success rate: ${(recommendation.predicted_success_rate * 100).toFixed(0)}%`,
          priority: 'medium',
          type: 'practice'
        };
        recommendedAction = 'Take Practice Quiz';
        priority = 'medium';
      } else {
        // Ready for challenge
        goal = {
          title: `Challenge Yourself in ${recommendation.recommended_topic || 'Advanced Topics'}`,
          description: `You're excelling! Try a model paper simulation to test your mastery.`,
          priority: 'low',
          type: 'challenge'
        };
        recommendedAction = 'Try Model Paper Simulation';
        priority = 'low';
      }

      // 9. Update user profile with recommendation
      await this.updateUserGoal(studentId, goal, recommendation);

      return {
        success: true,
        recommendation: {
          optimal_question_id: recommendation.optimal_question_id,
          recommended_topic: recommendation.recommended_topic,
          predicted_success_rate: recommendation.predicted_success_rate,
          mastery_level: recommendation.mastery_level,
          recommended_action: recommendedAction,
          priority: priority
        },
        goal: goal,
        knowledge_state: {
          mastery_scores: knowledgeState.mastery_scores,
          top_topics: this.getTopTopics(knowledgeState.mastery_scores, 5),
          weak_topics: this.getWeakTopics(knowledgeState.mastery_scores, 5)
        },
        all_recommendations: recommendation.all_recommendations || []
      };
    } catch (error) {
      console.error('Error getting adaptive recommendation:', error);
      return {
        success: false,
        error: error.message,
        recommendation: {
          type: 'fallback',
          message: 'Unable to generate recommendation. Please try again.',
          recommended_action: 'Take a practice quiz'
        }
      };
    }
  }

  /**
   * Update user profile with goal and recommendation
   */
  async updateUserGoal(studentId, goal, recommendation) {
    try {
      await User.findByIdAndUpdate(studentId, {
        $set: {
          'profile.currentGoal': goal,
          'profile.lastRecommendation': {
            topic: recommendation.recommended_topic,
            predicted_success_rate: recommendation.predicted_success_rate,
            updatedAt: new Date()
          }
        }
      });
    } catch (error) {
      console.error('Error updating user goal:', error);
    }
  }

  /**
   * Get top performing topics
   */
  getTopTopics(masteryScores, limit = 5) {
    const sorted = Object.entries(masteryScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
    
    return sorted.map(([topic, score]) => ({
      topic,
      mastery: score * 100
    }));
  }

  /**
   * Get weak topics
   */
  getWeakTopics(masteryScores, limit = 5) {
    const sorted = Object.entries(masteryScores)
      .filter(([_, score]) => score < 0.6)
      .sort((a, b) => a[1] - b[1])
      .slice(0, limit);
    
    return sorted.map(([topic, score]) => ({
      topic,
      mastery: score * 100
    }));
  }
}

module.exports = new ProgressController();


