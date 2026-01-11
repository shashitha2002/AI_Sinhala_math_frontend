const mongoose = require('mongoose');

/**
 * Normalized Quiz Answer Model
 * Stores individual question answers with full details
 */
const quizAnswerSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  questionOptions: [String],
  correctAnswer: {
    type: Number,
    required: true
  },
  correctAnswerText: String,
  studentAnswer: {
    type: Number,
    required: true
  },
  studentAnswerText: String,
  isCorrect: {
    type: Boolean,
    required: true
  },
  marksAllocated: {
    type: Number,
    required: true,
    default: 1
  },
  marksObtained: {
    type: Number,
    required: true,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  topic: String,
  topicId: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  questionNumber: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes for efficient queries
quizAnswerSchema.index({ userId: 1, timestamp: -1 });
quizAnswerSchema.index({ quizId: 1 });
quizAnswerSchema.index({ questionId: 1 });
quizAnswerSchema.index({ topic: 1 });

module.exports = mongoose.model('QuizAnswer', quizAnswerSchema);

