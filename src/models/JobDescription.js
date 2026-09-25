const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Job Description must belong to a user.']
    },
    title: {
      type: String,
      required: [true, 'Job title is required.']
    },
    description: {
      type: String,
      required: [true, 'Job description text is required.']
    },
    requirements: [String]
  },
  { timestamps: true }
);

const JobDescription = mongoose.model('JobDescription', jobDescriptionSchema);
module.exports = JobDescription;
