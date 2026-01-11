const mongoose = require('mongoose');

/**
 * Normalized XAI Response Model
 * Stores all XAI (Explainable AI) explanations
 */
const xaiResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  recommendationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recommendation',
    index: true
  },
  explanationType: {
    type: String,
    enum: ['recommendation', 'prediction', 'knowledge-state', 'action'],
    required: true
  },
  explanation: {
    type: String,
    required: true
  },
  factors: [{
    factor: String,
    impact: Number, // -1 to 1, negative = negative impact, positive = positive impact
    description: String
  }],
  confidence: {
    type: Number,
    min: 0,
    max: 1
  },
  reasoning: String,
  visualizations: [{
    type: String, // 'chart', 'graph', 'heatmap', etc.
    data: mongoose.Schema.Types.Mixed
  }],
  metadata: {
    modelVersion: String,
    algorithm: String,
    processingTime: Number
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Indexes
xaiResponseSchema.index({ userId: 1, timestamp: -1 });
xaiResponseSchema.index({ recommendationId: 1 });
xaiResponseSchema.index({ explanationType: 1 });

module.exports = mongoose.model('XAIResponse', xaiResponseSchema);

