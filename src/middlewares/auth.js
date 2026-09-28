const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { AppError } = require('../utils/errors');

const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT *, id AS _id FROM users WHERE id = $1', [decoded.id]);
    const currentUser = result.rows[0];

    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again!', 401));
    }
    if (err.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired! Please log in again.', 401));
    }
    next(err);
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
};

module.exports = { protect, admin };
