const { pool } = require('../config/db');
const { AppError, sendResponse } = require('../utils/errors');

exports.getStats = async (req, res, next) => {
  try {
    const usersCountResult = await pool.query('SELECT COUNT(*) FROM users');
    const resumesCountResult = await pool.query('SELECT COUNT(*) FROM resumes');
    const jobsCountResult = await pool.query('SELECT COUNT(*) FROM jobs');
    const analysesCountResult = await pool.query('SELECT COUNT(*) FROM analyses');
    const avgScoreResult = await pool.query('SELECT AVG(score) as avg_score FROM analyses');

    sendResponse(res, 200, {
      stats: {
        totalUsers: parseInt(usersCountResult.rows[0].count, 10),
        totalResumes: parseInt(resumesCountResult.rows[0].count, 10),
        totalJobs: parseInt(jobsCountResult.rows[0].count, 10),
        totalAnalyses: parseInt(analysesCountResult.rows[0].count, 10),
        averageAtsScore: avgScoreResult.rows[0].avg_score ? parseFloat(avgScoreResult.rows[0].avg_score) : null,
        llmRequests: null // Not explicitly tracked in DB schema
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id AS _id, name, email, role, created_at, updated_at FROM users ORDER BY created_at DESC'
    );
    sendResponse(res, 200, { users: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getResumes = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT r.id AS _id, r.title, r.created_at, u.name as user_name, u.email as user_email
      FROM resumes r
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    sendResponse(res, 200, { resumes: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getJobs = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT j.id AS _id, j.title, j.created_at, u.name as user_name, u.email as user_email
      FROM jobs j
      JOIN users u ON j.user_id = u.id
      ORDER BY j.created_at DESC
    `);
    sendResponse(res, 200, { jobs: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getAnalyses = async (req, res, next) => {
  try {
    const result = await pool.query(`
      SELECT a.id AS _id, a.score, a.created_at, u.name as user_name, u.email as user_email,
             r.title as resume_title, j.title as job_title
      FROM analyses a
      JOIN users u ON a.user_id = u.id
      JOIN resumes r ON a.resume_id = r.id
      JOIN jobs j ON a.job_id = j.id
      ORDER BY a.created_at DESC
    `);
    // Convert decimal string back to number for score
    const analyses = result.rows.map(row => ({
      ...row,
      score: Number(row.score)
    }));
    sendResponse(res, 200, { analyses });
  } catch (err) {
    next(err);
  }
};

exports.getAIMonitoring = async (req, res, next) => {
  try {
    sendResponse(res, 200, {
      monitoring: {
        status: 'not tracked',
        message: 'LLM requests and AI metrics are not currently stored in the database.'
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getSystemHealth = async (req, res, next) => {
  try {
    const health = {
      backend: 'healthy',
      database: 'unhealthy',
      aiService: 'unhealthy',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'not configured'
    };

    // Check DB
    try {
      await pool.query('SELECT 1');
      health.database = 'healthy';
    } catch (e) {
      console.error('Database health check failed', e);
    }

    // Check Python AI Service
    try {
      const response = await fetch('http://127.0.0.1:8000/health', { signal: AbortSignal.timeout(3000) });
      if (response.ok) {
        health.aiService = 'healthy';
      }
    } catch (e) {
      console.error('AI Service health check failed', e);
    }

    sendResponse(res, 200, { health });
  } catch (err) {
    next(err);
  }
};
