// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Endpoints for user registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password',  userController.resetPassword);


module.exports = router;
