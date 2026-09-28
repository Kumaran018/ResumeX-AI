const express = require('express');
const { protect, admin } = require('../middlewares/auth');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Apply auth and admin middlewares to all admin routes
router.use(protect, admin);

router.get('/stats', adminController.getStats);
router.get('/users', adminController.getUsers);
router.get('/resumes', adminController.getResumes);
router.get('/jobs', adminController.getJobs);
router.get('/analyses', adminController.getAnalyses);
router.get('/ai-monitoring', adminController.getAIMonitoring);
router.get('/system-health', adminController.getSystemHealth);

module.exports = router;
