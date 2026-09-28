const { pool } = require('../config/db');
const { AppError, sendResponse } = require('../utils/errors');

exports.createJob = async (req, res, next) => {
  try {
    const { title, description, requirements } = req.body;
    
    if (!title || !description) {
      return next(new AppError('Title and description are required', 400));
    }

    const result = await pool.query(
      'INSERT INTO jobs (user_id, title, description, requirements) VALUES ($1, $2, $3, $4) RETURNING *, id AS _id',
      [req.user.id, title, description, requirements || []]
    );

    sendResponse(res, 201, { job: result.rows[0] });
  } catch (err) {
    next(err);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT *, id AS _id FROM jobs WHERE user_id = $1', [req.user.id]);
    sendResponse(res, 200, { jobs: result.rows });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const result = await pool.query('SELECT *, id AS _id FROM jobs WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
    const job = result.rows[0];
    if (!job) {
      return next(new AppError('No job description found with that ID', 404));
    }
    sendResponse(res, 200, { job });
  } catch (err) {
    next(err);
  }
};
