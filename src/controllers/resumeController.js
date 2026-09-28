const { pool } = require('../config/db');
const { extractTextFromPDF } = require('../services/pdfService');
const { AppError, sendResponse } = require('../utils/errors');
const fs = require('fs');

exports.uploadResume = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('No file uploaded!', 400));
    }

    if (!req.body.title) {
       throw new AppError('Please provide a title for the resume', 400);
    }

    const extractedText = await extractTextFromPDF(req.file.path);

    const result = await pool.query(
      'INSERT INTO resumes (user_id, title, file_path, extracted_text) VALUES ($1, $2, $3, $4) RETURNING *, id AS _id',
      [req.user.id, req.body.title, req.file.path, extractedText]
    );

    sendResponse(res, 201, { resume: result.rows[0] }, 'Resume uploaded and processed successfully');
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
    const result = await pool.query('SELECT *, id AS _id FROM resumes WHERE user_id = $1', [req.user.id]);
    sendResponse(res, 200, { resumes: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getResume = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT *, id AS _id FROM resumes WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const resume = result.rows[0];
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
    const result = await pool.query('DELETE FROM resumes WHERE id = $1 AND user_id = $2 RETURNING *', [req.params.id, req.user.id]);
    const resume = result.rows[0];
    if (!resume) {
      return next(new AppError('No resume found with that ID', 404));
    }

    // Delete associated file
    if (fs.existsSync(resume.file_path)) fs.unlinkSync(resume.file_path);
    
    // Note: Analysis and AnalysisHistory are automatically deleted via ON DELETE CASCADE in Postgres.

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    next(err);
  }
};
