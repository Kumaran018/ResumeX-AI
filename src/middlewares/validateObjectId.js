const { AppError } = require('../utils/errors');

const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

const validateObjectId = (req, res, next) => {
  if (req.params.id && !uuidRegex.test(req.params.id)) {
    return next(new AppError('Invalid ID format.', 400));
  }
  next();
};

module.exports = { validateObjectId };
