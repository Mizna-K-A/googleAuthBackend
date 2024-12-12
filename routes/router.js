const express = require('express');
const { registerUser, loginUser, googleAuth } = require('../controllers/authController');

const router = express.Router();

// Register
router.post('/register', registerUser);

// Login
router.post('/login', loginUser);

// Google 
router.post('/google', googleAuth);

module.exports = router;