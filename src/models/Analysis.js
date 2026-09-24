const mongoose = require('mongoose');

const analysisSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Analysis must belong to a user.']
    },
    resume: {
      type: mongoose.Schema.ObjectId,
      ref: 'Resume',
      required: [true, 'Analysis must reference a resume.']
    },
    job: {
      type: mongoose.Schema.ObjectId,
      ref: 'JobDescription',
      required: [true, 'Analysis must reference a job description.']
    },
    score: {
      type: Number,
      required: [true, 'Analysis score is required.'],
      min: 0,
      max: 100
    },
    feedback: {
      type: String,
      required: [true, 'Analysis feedback is required.']
    },
    missingSkills: [String],
    matchingSkills: [String],
    
    // New AI Feature Fields
    weakEvidence: [String],
    keywordAnalysis: mongoose.Schema.Types.Mixed,
    formatting: mongoose.Schema.Types.Mixed,
    improvements: [mongoose.Schema.Types.Mixed],
    hrReview: mongoose.Schema.Types.Mixed,
    interviewQuestions: [mongoose.Schema.Types.Mixed]
  },
  { timestamps: true }
);

// We can optionally use this same schema for AnalysisHistory as requested by the prompt 
// (or store analyses in one collection). The instruction states "Analyses, and AnalysisHistory."
// Keeping it simple as Analysis.

const Analysis = mongoose.model('Analysis', analysisSchema);
module.exports = Analysis;
