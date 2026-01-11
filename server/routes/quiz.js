const express = require('express');
const axios = require('axios');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const SyllabusTopic = require('../models/SyllabusTopic');
const Question = require('../models/Question');
const PerformanceData = require('../models/PerformanceData');
const QuizAnswer = require('../models/QuizAnswer');
const badgeEngine = require('../services/badgeEngine');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/quiz/generate
// @desc    Generate adaptive quiz
// @access  Private
router.get('/generate', protect, async (req, res) => {
  try {
    const { type = 'adaptive', topic, difficulty } = req.query;

    // Get user's performance history
    const user = await User.findById(req.user._id);
    const pastQuizzes = await Quiz.find({ 
      userId: req.user._id, 
      status: 'completed' 
    }).limit(10);

    // Call ML service for quiz generation
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/generate-quiz`,
        {
          userId: req.user._id.toString(),
          type,
          topic,
          difficulty,
          userPerformance: {
            averageScore: user.performance.averageScore,
            mastery: user.profile.syllabusTopics,
            pastQuizzes: pastQuizzes.map(q => ({
              score: q.score.percentage,
              topics: q.questions.map(q => q.topic)
            }))
          }
        }
      );

      // Create quiz in database
      const quiz = await Quiz.create({
        userId: req.user._id,
        type,
        questions: mlResponse.data.questions,
        timeStarted: new Date(),
        status: 'in-progress',
        adaptiveParams: mlResponse.data.adaptiveParams || {}
      });

      res.json({
        success: true,
        quiz: {
          id: quiz._id,
          questions: quiz.questions,
          type: quiz.type,
          timeLimit: quiz.timeLimit
        }
      });
    } catch (mlError) {
      console.error('ML Service Error:', mlError);
      // Fallback to database-based quiz generation
      try {
        const questions = await generateQuizFromDatabase(topic, difficulty, type);
        
        if (questions.length === 0) {
          return res.status(404).json({
            success: false,
            message: 'No questions found for the selected topic. Please ensure questions are seeded in the database.'
          });
        }

        const quiz = await Quiz.create({
          userId: req.user._id,
          type,
          questions: questions,
          timeStarted: new Date(),
          status: 'in-progress',
          timeLimit: type === 'model-paper' ? 180 : questions.length * 2
        });

        res.json({
          success: true,
          quiz: {
            id: quiz._id,
            questions: quiz.questions,
            type: quiz.type,
            timeLimit: quiz.timeLimit
          }
        });
      } catch (fallbackError) {
        console.error('Fallback quiz generation error:', fallbackError);
        res.status(503).json({
          success: false,
          message: 'Quiz generation service temporarily unavailable'
        });
      }
    }
  } catch (error) {
    console.error('Generate quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating quiz'
    });
  }
});

// @route   POST /api/quiz/submit
// @desc    Submit quiz answers
// @access  Private
router.post('/submit', protect, async (req, res) => {
  try {
    const { quizId, answers } = req.body;

    const quiz = await Quiz.findOne({
      _id: quizId,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Calculate score
    let correctAnswers = 0;
    const answerResults = quiz.questions.map((question, index) => {
      const userAnswer = answers[index];
      const isCorrect = userAnswer.selectedAnswer === question.correctAnswer;
      if (isCorrect) correctAnswers++;

      return {
        questionId: question._id.toString(),
        selectedAnswer: userAnswer.selectedAnswer,
        isCorrect,
        timeSpent: userAnswer.timeSpent || 0,
        timestamp: new Date()
      };
    });

    const totalQuestions = quiz.questions.length;
    const scorePercentage = (correctAnswers / totalQuestions) * 100;

    // Update quiz
    quiz.answers = answerResults;
    quiz.score = {
      total: totalQuestions,
      obtained: correctAnswers,
      percentage: scorePercentage
    };
    quiz.status = 'completed';
    quiz.timeCompleted = new Date();

    await quiz.save();

    // Update user performance
    const user = await User.findById(req.user._id);
    user.performance.totalQuizzes += 1;
    const totalQuizzes = user.performance.totalQuizzes;
    user.performance.averageScore = 
      ((user.performance.averageScore * (totalQuizzes - 1)) + scorePercentage) / totalQuizzes;
    
    // Update total time spent (calculate from quiz duration)
    if (quiz.timeStarted && quiz.timeCompleted) {
      const durationMinutes = (quiz.timeCompleted - quiz.timeStarted) / (1000 * 60);
      user.performance.totalTimeSpent = (user.performance.totalTimeSpent || 0) + durationMinutes;
    }

    // Update topic mastery
    quiz.questions.forEach((question, index) => {
      if (answerResults[index].isCorrect) {
        const topicMastery = user.profile.syllabusTopics.find(
          t => t.topic === question.topic
        );
        if (topicMastery) {
          topicMastery.mastery = Math.min(100, topicMastery.mastery + 2);
        } else {
          user.profile.syllabusTopics.push({
            topic: question.topic,
            mastery: 50
          });
        }
      }
    });

    await user.save();

    // Store normalized quiz answers and performance data
    const quizAnswerPromises = quiz.questions.map((question, index) => {
      const answer = answerResults[index];
      const topicId = question.topicId || question.topic;
      const marksObtained = answer.isCorrect ? (question.marks || 1) : 0;
      
      // Store normalized quiz answer
      const quizAnswerData = {
        quizId: quiz._id,
        userId: req.user._id,
        questionId: question._id || question.questionId,
        questionText: question.question,
        questionOptions: question.options || [],
        correctAnswer: question.correctAnswer,
        correctAnswerText: question.options ? question.options[question.correctAnswer] : '',
        studentAnswer: answer.selectedAnswer,
        studentAnswerText: question.options ? question.options[answer.selectedAnswer] : '',
        isCorrect: answer.isCorrect,
        marksAllocated: question.marks || 1,
        marksObtained: marksObtained,
        timeSpent: answer.timeSpent || 0,
        topic: question.topic,
        topicId: topicId,
        difficulty: question.difficulty || 'medium',
        questionNumber: index + 1
      };
      
      return QuizAnswer.create(quizAnswerData);
    });

    // Store performance data for analysis
    const performanceDataPromises = quiz.questions.map((question, index) => {
      const answer = answerResults[index];
      const topicId = question.topicId || question.topic;
      
      return PerformanceData.create({
        studentId: req.user._id,
        questionId: question._id || question.questionId,
        topicId: topicId,
        isCorrect: answer.isCorrect,
        timeTaken: answer.timeSpent || 0,
        attemptsCount: 1,
        studentProficiency: user.performance.averageScore / 100, // Normalize to 0-1
        questionDifficulty: question.difficulty === 'easy' ? 0.3 : question.difficulty === 'medium' ? 0.6 : 0.9,
        probabilityCorrect: answer.isCorrect ? 1 : 0,
        quizId: quiz._id,
        timestamp: new Date()
      });
    });

    await Promise.all([...quizAnswerPromises, ...performanceDataPromises]);

    // Check and award badges after quiz completion
    const newlyAwardedBadges = await badgeEngine.checkAndAwardBadges(
      req.user._id,
      'quiz_completed',
      {
        quiz: quiz,
        quizType: quiz.type,
        score: scorePercentage,
        topic: quiz.questions[0]?.topic || null
      }
    );

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        score: quiz.score,
        answers: answerResults,
        correctAnswers,
        totalQuestions
      },
      newlyAwardedBadges: newlyAwardedBadges.length > 0 ? newlyAwardedBadges : undefined
    });
  } catch (error) {
    console.error('Submit quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting quiz'
    });
  }
});

// @route   GET /api/quiz/model-paper
// @desc    Generate model paper (full exam simulation)
// @access  Private
router.get('/model-paper', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    // Call ML service for model paper generation
    try {
      const mlResponse = await axios.post(
        `${process.env.ML_SERVICE_URL || 'http://localhost:5001'}/generate-model-paper`,
        {
          userId: req.user._id.toString(),
          userPerformance: {
            averageScore: user.performance.averageScore,
            mastery: user.profile.syllabusTopics
          }
        }
      );

      const quiz = await Quiz.create({
        userId: req.user._id,
        type: 'model-paper',
        questions: mlResponse.data.questions,
        timeLimit: mlResponse.data.timeLimit || 180, // 3 hours default
        timeStarted: new Date(),
        status: 'in-progress'
      });

      res.json({
        success: true,
        quiz: {
          id: quiz._id,
          questions: quiz.questions,
          timeLimit: quiz.timeLimit
        }
      });
    } catch (mlError) {
      console.error('ML Service Error:', mlError);
      res.status(503).json({
        success: false,
        message: 'Model paper generation service temporarily unavailable'
      });
    }
  } catch (error) {
    console.error('Generate model paper error:', error);
    res.status(500).json({
      success: false,
      message: 'Error generating model paper'
    });
  }
});

// @route   GET /api/quiz/history
// @desc    Get quiz history
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select('type score status timeStarted timeCompleted');

    res.json({
      success: true,
      quizzes
    });
  } catch (error) {
    console.error('Get quiz history error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz history'
    });
  }
});

// @route   GET /api/quiz/topics
// @desc    Get available topics from SyllabusTopic database
// @access  Private
router.get('/topics', protect, async (req, res) => {
  try {
    const { grade } = req.query;
    
    // Build query
    const query = {};
    if (grade) {
      query.grade = parseInt(grade);
    }

    // Fetch topics from SyllabusTopic database
    const topics = await SyllabusTopic.find(query)
      .select('topicId topicName topicNameSinhala grade')
      .sort({ topicName: 1 });

    console.log(`Found ${topics.length} topics from database`);

    // Format topics for dropdown (include empty option for "all topics")
    const formattedTopics = [
      { value: '', label: 'All Topics', labelSinhala: 'සියලුම මාතෘකා' },
      ...topics.map(topic => ({
        value: topic.topicName.toLowerCase(),
        label: topic.topicName || '',
        labelSinhala: topic.topicNameSinhala || '',
        topicId: topic.topicId,
        topicName: topic.topicName,
        topicNameSinhala: topic.topicNameSinhala
      }))
    ];

    res.json({
      success: true,
      topics: formattedTopics,
      count: topics.length
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
});

// @route   GET /api/quiz/:id
// @desc    Get quiz by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    res.json({
      success: true,
      quiz: {
        id: quiz._id,
        questions: quiz.questions,
        type: quiz.type,
        timeLimit: quiz.timeLimit,
        status: quiz.status
      }
    });
  } catch (error) {
    console.error('Get quiz error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quiz'
    });
  }
});

// Helper function to generate quiz from database
async function generateQuizFromDatabase(topic, difficulty, type) {
  try {
    const query = {};
    
    // Filter by topic if specified
    if (topic) {
      // Try to find topic by name (case insensitive)
      const topicDoc = await SyllabusTopic.findOne({
        $or: [
          { topicName: { $regex: new RegExp(`^${topic}$`, 'i') } },
          { topicNameSinhala: { $regex: new RegExp(`^${topic}$`, 'i') } }
        ]
      });
      
      if (topicDoc) {
        query.topicId = topicDoc.topicId;
        query.topic = topicDoc.topicName;
      } else {
        // Fallback to direct topic name match
        query.topic = { $regex: new RegExp(`^${topic}$`, 'i') };
      }
    }

    // Filter by difficulty
    if (difficulty && difficulty !== 'mixed') {
      query.difficulty = difficulty;
    }

    // Determine number of questions based on type
    const numQuestions = type === 'model-paper' ? 25 : 10;
    
    // Get questions from database
    let questions = await Question.find(query)
      .limit(numQuestions * 2) // Get more than needed for randomization
      .lean();

    // If no questions found and topic was specified, try without topic filter
    if (questions.length === 0 && topic) {
      const fallbackQuery = difficulty && difficulty !== 'mixed' ? { difficulty } : {};
      questions = await Question.find(fallbackQuery)
        .limit(numQuestions * 2)
        .lean();
    }

    // If still no questions, generate sample questions from topics
    if (questions.length === 0) {
      const topics = await SyllabusTopic.find().limit(10);
      questions = generateSampleQuestions(topics, topic, difficulty, numQuestions);
    } else {
      // Shuffle and limit
      questions = questions.sort(() => Math.random() - 0.5).slice(0, numQuestions);
    }

    // Format questions for quiz
    return questions.map((q, index) => ({
      questionId: q.questionId || `q_${index + 1}`,
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || `Explanation for ${q.topic || 'this question'}`,
      topic: q.topic || 'General',
      topicId: q.topicId || '',
      difficulty: q.difficulty || 'medium',
      marks: q.marks || 1,
      syllabusUnit: q.syllabusUnit || '',
      irtParameters: q.irtParameters || {
        discrimination: 1.0,
        difficulty: 0.0,
        guessing: 0.25
      }
    }));
  } catch (error) {
    console.error('Error generating quiz from database:', error);
    return [];
  }
}

// Generate sample questions when database is empty
function generateSampleQuestions(topics, selectedTopic, difficulty, numQuestions) {
  const questions = [];
  const selectedTopics = selectedTopic 
    ? topics.filter(t => t.topicName.toLowerCase().includes(selectedTopic.toLowerCase()))
    : topics;

  if (selectedTopics.length === 0) {
    selectedTopics.push(...topics.slice(0, 3));
  }

  const difficulties = difficulty === 'mixed' 
    ? ['easy', 'medium', 'hard'] 
    : [difficulty || 'medium'];

  for (let i = 0; i < numQuestions; i++) {
    const topic = selectedTopics[i % selectedTopics.length];
    const diff = difficulties[i % difficulties.length];
    
    questions.push({
      questionId: `sample_q_${i + 1}`,
      question: `Sample question ${i + 1} about ${topic.topicName}`,
      options: ['Option A', 'Option B', 'Option C', 'Option D'],
      correctAnswer: Math.floor(Math.random() * 4),
      explanation: `This is a sample question for ${topic.topicName}`,
      topic: topic.topicName,
      topicId: topic.topicId,
      difficulty: diff,
      marks: 1,
      syllabusUnit: topic.topicName,
      irtParameters: {
        discrimination: 1.0,
        difficulty: diff === 'easy' ? -1 : diff === 'medium' ? 0 : 1,
        guessing: 0.25
      }
    });
  }

  return questions;
}

module.exports = router;


