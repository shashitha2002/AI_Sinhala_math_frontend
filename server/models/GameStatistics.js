const mongoose = require('mongoose');

/**
 * Normalized Game Statistics Model
 * Stores comprehensive game statistics
 */
const gameStatisticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  activeDays: {
    type: Number,
    default: 0
  },
  currentStreak: {
    type: Number,
    default: 0
  },
  longestStreak: {
    type: Number,
    default: 0
  },
  totalActivities: {
    type: Number,
    default: 0
  },
  gamesPlayed: {
    type: Number,
    default: 0
  },
  quizzesCompleted: {
    type: Number,
    default: 0
  },
  forumPosts: {
    type: Number,
    default: 0
  },
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  gameTypeStats: {
    'quick-math': {
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 }
    },
    'number-sequence': {
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 }
    },
    'algebra-solver': {
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 }
    },
    'geometry-puzzle': {
      gamesPlayed: { type: Number, default: 0 },
      totalScore: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      bestScore: { type: Number, default: 0 }
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
gameStatisticsSchema.index({ userId: 1, date: -1 });
gameStatisticsSchema.index({ userId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('GameStatistics', gameStatisticsSchema);

