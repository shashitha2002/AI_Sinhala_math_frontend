const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: { type: String, required: true },
  latexContent: String, // For math equations
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  isModerated: { type: Boolean, default: false },
  moderationScore: Number, // AI moderation confidence
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date,
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

const forumPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: { type: String, required: true },
  content: { type: String, required: true },
  latexContent: String, // For math equations
  topic: {
    type: String,
    required: true,
    enum: [
      'algebra',
      'geometry',
      'trigonometry',
      'statistics',
      'calculus',
      'general'
    ]
  },
  tags: [String],
  sentiment: {
    type: String,
    enum: ['positive', 'neutral', 'negative'],
    default: 'neutral'
  },
  isModerated: { type: Boolean, default: false },
  moderationScore: Number, // AI moderation confidence
  moderationReason: String,
  comments: [commentSchema],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  views: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: Date
});

forumPostSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('ForumPost', forumPostSchema);


