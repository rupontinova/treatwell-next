const express = require('express');
const { register, login, getMe } = require('../controllers/auth');
const { googleAuth } = require('../controllers/googleAuth');
const { forgotPassword, resetPassword } = require('../controllers/passwordReset');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resettoken', resetPassword);
router.get('/me', protect, getMe);

module.exports = router; 