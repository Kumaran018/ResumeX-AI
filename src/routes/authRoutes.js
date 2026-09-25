const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/logout', authController.logout);

// Protect all routes below this line
router.use(protect);
router.get('/me', authController.getMe);

module.exports = router;
