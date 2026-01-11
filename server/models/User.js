const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  studentId: {
    type: String,
    unique: true,
    sparse: true
  },
  role: {
    type: String,
    enum: ['student', 'teacher', 'admin'],
    default: 'student'
  },
  profile: {
    school: String,
    district: String,
    grade: String,
    syllabusTopics: [{
      topic: String,
      mastery: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    currentGoal: {
      title: String,
      description: String,
      priority: String,
      type: String
    },
    lastRecommendation: {
      topic: String,
      predicted_success_rate: Number,
      updatedAt: Date
    }
  },
  performance: {
    totalQuizzes: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    totalTimeSpent: { type: Number, default: 0 }, // in minutes
    badges: [String],
    achievements: [{
      title: String,
      description: String,
      date: Date
    }]
  },
  stressIndicators: {
    lastAnalysis: Date,
    stressLevel: { type: Number, default: 0, min: 0, max: 100 },
    patterns: [{
      timestamp: Date,
      indicators: {
        responseDelay: Number,
        sessionDuration: Number,
        errorRate: Number,
        clickPattern: Number
      }
    }]
  },
  gameStats: {
    totalGames: { type: Number, default: 0 },
    totalScore: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    currentStreak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);


