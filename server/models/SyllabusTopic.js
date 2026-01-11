const mongoose = require('mongoose');

const subTopicSchema = new mongoose.Schema({
  subTopicId: {
    type: String,
    required: true
  },
  subTopicName: {
    type: String,
    required: true
  },
  competencyLevel: {
    type: String,
    required: true
  },
  learningOutcomes: [String]
}, { _id: false });

const syllabusTopicSchema = new mongoose.Schema({
  topicId: {
    type: String,
    required: true,
    unique: true
  },
  topicName: {
    type: String,
    required: true
  },
  topicNameSinhala: {
    type: String,
    required: true
  },
  grade: {
    type: Number,
    required: true,
    enum: [10, 11]
  },
  subTopics: [subTopicSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
syllabusTopicSchema.index({ topicId: 1 });
syllabusTopicSchema.index({ grade: 1 });

module.exports = mongoose.model('SyllabusTopic', syllabusTopicSchema);





