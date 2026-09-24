const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const JobDescription = require('../models/JobDescription');
const { analyzeResumeAgainstJob } = require('../services/aiService');
const { AppError, sendResponse } = require('../utils/errors');

const AnalysisHistory = require('../models/AnalysisHistory');

exports.analyze = async (req, res, next) => {
  try {
    const { resumeId, jobId } = req.body;

    if (!resumeId || !jobId) {
      return next(new AppError('Please provide both resumeId and jobId', 400));
    }

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    const job = await JobDescription.findOne({ _id: jobId, user: req.user.id });

    if (!resume) return next(new AppError('Resume not found', 404));
    if (!job) return next(new AppError('Job Description not found', 404));

    // Call Mock AI Service
    const aiResult = await analyzeResumeAgainstJob(resume.extractedText, job.description);

    let analysis = await Analysis.findOne({ user: req.user.id, resume: resume._id, job: job._id });
    let previousScore = null;

    if (analysis) {
      previousScore = analysis.score;
      analysis.score = aiResult.score;
      analysis.feedback = aiResult.feedback;
      analysis.missingSkills = aiResult.missingSkills;
      analysis.matchingSkills = aiResult.matchingSkills;
      analysis.weakEvidence = aiResult.weakEvidence;
      analysis.keywordAnalysis = aiResult.keywordAnalysis;
      analysis.formatting = aiResult.formatting;
      analysis.improvements = aiResult.improvements;
      analysis.hrReview = aiResult.hrReview;
      analysis.interviewQuestions = aiResult.interviewQuestions;
      await analysis.save();
    } else {
      analysis = await Analysis.create({
        user: req.user.id,
        resume: resume._id,
        job: job._id,
        score: aiResult.score,
        feedback: aiResult.feedback,
        missingSkills: aiResult.missingSkills,
        matchingSkills: aiResult.matchingSkills,
        weakEvidence: aiResult.weakEvidence,
        keywordAnalysis: aiResult.keywordAnalysis,
        formatting: aiResult.formatting,
        improvements: aiResult.improvements,
        hrReview: aiResult.hrReview,
        interviewQuestions: aiResult.interviewQuestions
      });
    }

    // Persist History
    await AnalysisHistory.create({
      user: req.user.id,
      analysis: analysis._id,
      previousScore,
      newScore: analysis.score
    });

    sendResponse(res, 201, { analysis });
  } catch (err) {
    next(err);
  }
};

exports.getAllAnalyses = async (req, res, next) => {
  try {
    // Basic pagination (page & limit)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const query = { user: req.user.id };

    // Allows filtering by resume or job from query params if needed
    if (req.query.resumeId) query.resume = req.query.resumeId;
    if (req.query.jobId) query.job = req.query.jobId;

    const analyses = await Analysis.find(query)
      .populate('resume', 'title')
      .populate('job', 'title')
      .skip(skip)
      .limit(limit)
      .sort('-createdAt');
      
    const total = await Analysis.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: analyses.length,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      },
      data: { analyses }
    });
  } catch (err) {
    next(err);
  }
};

exports.getAnalysis = async (req, res, next) => {
  try {
    const analysis = await Analysis.findOne({ _id: req.params.id, user: req.user.id })
      .populate('resume')
      .populate('job');
      
    if (!analysis) {
      return next(new AppError('No analysis found with that ID', 404));
    }
    
    sendResponse(res, 200, { analysis });
  } catch (err) {
    next(err);
  }
};
