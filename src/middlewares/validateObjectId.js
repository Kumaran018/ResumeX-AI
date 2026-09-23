const mongoose = require('mongoose');
const { AppError } = require('../utils/errors');

const validateObjectId = (req, res, next) => {
  if (req.params.id && !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new AppError('Invalid ID format.', 400));
  }
  next();
};

module.exports = { validateObjectId };
