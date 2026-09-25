const express = require('express');
const analysisController = require('../controllers/analysisController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

// Apply auth middleware to all analysis routes
router.use(protect);

const { validateObjectId } = require('../middlewares/validateObjectId');

router.post('/', analysisController.analyze);
router.get('/', analysisController.getAllAnalyses);
router.get('/:id', validateObjectId, analysisController.getAnalysis);

module.exports = router;
