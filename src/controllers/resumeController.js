const Resume = require('../models/Resume');
const { extractTextFromPDF } = require('../services/pdfService');
const { AppError, sendResponse } = require('../utils/errors');
const fs = require('fs');
const Analysis = require('../models/Analysis');

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded!', 400));
    }

    if (!req.body.title) {
       throw new AppError('Please provide a title for the resume', 400);
    }

    const extractedText = await extractTextFromPDF(req.file.path);

    const newResume = await Resume.create({
      user: req.user.id,
      title: req.body.title,
      filePath: req.file.path,
      extractedText
    });

    sendResponse(res, 201, { resume: newResume }, 'Resume uploaded and processed successfully');
  } catch (err) {
    if (req.file && fs.existsSync(req.file.path)) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanErr) {
        console.error('Failed to cleanup file:', cleanErr);
      }
    }
    next(err);
  }
};

exports.getAllResumes = async (req, res, next) => {
  try {
    const resumes = await Resume.find({ user: req.user.id });
    sendResponse(res, 200, { resumes });
  } catch (err) {
    next(err);
  }
};

exports.getResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOne({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return next(new AppError('No resume found with that ID', 404));
    }
    sendResponse(res, 200, { resume });
  } catch (err) {
    next(err);
  }
};

exports.deleteResume = async (req, res, next) => {
  try {
    const resume = await Resume.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resume) {
      return next(new AppError('No resume found with that ID', 404));
    }

    // Delete associated file
    if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
    
    // Find all analyses referencing this resume to delete their history
    const analyses = await Analysis.find({ resume: resume._id });
    const analysisIds = analyses.map(a => a._id);
    await require('../models/AnalysisHistory').deleteMany({ analysis: { $in: analysisIds } });

    // Delete dependent analyses
    await Analysis.deleteMany({ resume: resume._id });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
