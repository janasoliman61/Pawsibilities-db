// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require("../middleware/auth");

// Endpoints for user registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password',  userController.resetPassword);
router.post('/2fa/send-code', auth , ctl.send2FACode);
router.post('/2fa/verify-code', auth , ctl.verify2FASetup)
// 2FA setup (must be logged in)
router.post('/2fa/send-code',     auth, ctl.send2FACode);
router.post('/2fa/verify-setup',  auth, ctl.verify2FASetup);

// 2FA login (no auth header yet)
router.post('/login/2fa',         ctl.verifyLogin2FA);



module.exports = router;
