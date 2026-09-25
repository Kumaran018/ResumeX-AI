const mongoose = require('mongoose');

const analysisHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: true
    },
    analysis: {
      type: mongoose.Schema.ObjectId,
      ref: 'Analysis',
      required: true
    },
    previousScore: Number,
    newScore: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

const AnalysisHistory = mongoose.model('AnalysisHistory', analysisHistorySchema);
module.exports = AnalysisHistory;
