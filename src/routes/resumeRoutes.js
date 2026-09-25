const express = require('express');
const resumeController = require('../controllers/resumeController');
const { protect } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');

const router = express.Router();

// Protect all resume routes
router.use(protect);

router.route('/')
  .post(upload.single('resume'), resumeController.uploadResume)
  .get(resumeController.getAllResumes);

const { validateObjectId } = require('../middlewares/validateObjectId');

router.route('/:id')
  .get(validateObjectId, resumeController.getResume)
  .delete(validateObjectId, resumeController.deleteResume);

module.exports = router;
