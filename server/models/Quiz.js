const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: String,
  question: { type: String, required: true },
  options: [String],
  correctAnswer: { type: Number, required: true },
  explanation: String,
  topic: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: { type: Number, default: 1 },
  syllabusUnit: String,
  irtParameters: {
    discrimination: Number,
    difficulty: Number,
    guessing: Number
  }
});

const quizSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['adaptive', 'model-paper', 'practice'],
    default: 'adaptive'
  },
  questions: [questionSchema],
  answers: [{
    questionId: String,
    selectedAnswer: Number,
    isCorrect: Boolean,
    timeSpent: Number, // in seconds
    timestamp: Date
  }],
  score: {
    total: Number,
    obtained: Number,
    percentage: Number
  },
  timeLimit: Number, // in minutes
  timeStarted: Date,
  timeCompleted: Date,
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  adaptiveParams: {
    initialDifficulty: Number,
    adjustments: [{
      questionIndex: Number,
      difficultyChange: Number,
      reason: String
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Quiz', quizSchema);


