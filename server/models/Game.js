const mongoose = require('mongoose');

const gameSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  gameType: {
    type: String,
    enum: ['quick-math', 'number-sequence', 'algebra-solver', 'geometry-puzzle'],
    required: true
  },
  score: {
    type: Number,
    default: 0
  },
  correctAnswers: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'easy'
  },
  questions: [{
    question: String,
    correctAnswer: Number,
    userAnswer: Number,
    isCorrect: Boolean,
    timeTaken: Number // in seconds
  }],
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  },
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  }
});

const dailyActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  activities: {
    quizzesCompleted: { type: Number, default: 0 },
    gamesPlayed: { type: Number, default: 0 },
    forumPosts: { type: Number, default: 0 },
    timeSpent: { type: Number, default: 0 } // in minutes
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
dailyActivitySchema.index({ userId: 1, date: -1 });
dailyActivitySchema.index({ userId: 1, date: 1 }, { unique: true });

const GameSession = mongoose.model('GameSession', gameSessionSchema);
const DailyActivity = mongoose.model('DailyActivity', dailyActivitySchema);

module.exports = { GameSession, DailyActivity };



