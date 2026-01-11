const mongoose = require('mongoose');

const performanceDataSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  topicId: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    required: true
  },
  timeTaken: {
    type: Number, // in seconds
    required: true
  },
  attemptsCount: {
    type: Number,
    default: 1,
    min: 1
  },
  studentProficiency: {
    type: Number,
    required: true
  },
  questionDifficulty: {
    type: Number,
    required: true
  },
  probabilityCorrect: {
    type: Number,
    required: true
  },
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz'
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
performanceDataSchema.index({ studentId: 1, timestamp: -1 });
performanceDataSchema.index({ questionId: 1 });
performanceDataSchema.index({ topicId: 1 });
performanceDataSchema.index({ timestamp: -1 });

module.exports = mongoose.model('PerformanceData', performanceDataSchema);





