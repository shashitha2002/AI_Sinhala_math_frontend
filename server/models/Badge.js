const mongoose = require('mongoose');

const badgeCriteriaSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: [
      'quiz_completion',
      'quiz_score',
      'topic_mastery',
      'model_paper_score',
      'time_spent',
      'forum_participation',
      'streak',
      'total_quizzes',
      'game_achievement'
    ],
    required: true
  },
  condition: {
    type: String,
    enum: ['equals', 'greater_than', 'less_than', 'greater_equal', 'less_equal', 'contains', 'all'],
    required: true
  },
  value: mongoose.Schema.Types.Mixed, // Can be number, string, or array
  topic: String, // For topic-specific badges
  quizType: String // For quiz type specific badges (e.g., 'model-paper')
}, { _id: false });

const badgeSchema = new mongoose.Schema({
  badgeId: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    default: '🏆' // Default emoji icon
  },
  category: {
    type: String,
    enum: ['quiz', 'forum', 'time', 'streak', 'mastery', 'achievement', 'game'],
    required: true
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  criteria: [badgeCriteriaSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient badge lookup
badgeSchema.index({ badgeId: 1 });
badgeSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Badge', badgeSchema);





