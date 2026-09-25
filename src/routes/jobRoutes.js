const express = require('express');
const jobController = require('../controllers/jobController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(jobController.createJob)
  .get(jobController.getAllJobs);

const { validateObjectId } = require('../middlewares/validateObjectId');

router.route('/:id')
  .get(validateObjectId, jobController.getJob);

module.exports = router;
