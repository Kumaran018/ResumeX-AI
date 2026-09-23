const JobDescription = require('../models/JobDescription');
const { AppError, sendResponse } = require('../utils/errors');

exports.createJob = async (req, res, next) => {
  try {
    const { title, description, requirements } = req.body;
    
    if (!title || !description) {
      return next(new AppError('Title and description are required', 400));
    }

    const newJob = await JobDescription.create({
      user: req.user.id,
      title,
      description,
      requirements
    });

    sendResponse(res, 201, { job: newJob });
  } catch (err) {
    next(err);
  }
};

exports.getAllJobs = async (req, res, next) => {
  try {
    const jobs = await JobDescription.find({ user: req.user.id });
    sendResponse(res, 200, { jobs });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const job = await JobDescription.findOne({ _id: req.params.id, user: req.user.id });
    if (!job) {
      return next(new AppError('No job description found with that ID', 404));
    }
    sendResponse(res, 200, { job });
  } catch (err) {
    next(err);
  }
};
