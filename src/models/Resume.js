const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Resume must belong to a user.']
    },
    title: {
      type: String,
      required: [true, 'Please provide a title for the resume.']
    },
    filePath: {
      type: String,
      required: [true, 'File path is required.'],
      select: false
    },
    extractedText: {
      type: String,
      required: [true, 'Extracted text is required.']
    }
  },
  { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume;
