const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionId: {
    type: String,
    required: true,
    unique: true
  },
  question: {
    type: String,
    required: true
  },
  options: [String],
  correctAnswer: {
    type: Number,
    required: true
  },
  explanation: String,
  topic: {
    type: String,
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true,
    enum: [10, 11]
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    default: 1
  },
  syllabusUnit: String,
  // IRT Parameters (Item Response Theory)
  irtParameters: {
    discrimination: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 2.5
    },
    difficulty: {
      type: Number,
      default: 0.0,
      min: -3,
      max: 3
    },
    guessing: {
      type: Number,
      default: 0.25,
      min: 0,
      max: 1
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
questionSchema.index({ topicId: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ grade: 1 });
questionSchema.index({ difficulty: 1 });

module.exports = mongoose.model('Question', questionSchema);





