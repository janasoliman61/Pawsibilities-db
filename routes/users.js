// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require("../middleware/auth");

// Endpoints for user registration and login
router.post('/register', userController.register);
router.post('/login', userController.login);

router.post('/2fa/send-code', auth,  userController.send2FACode);//hayeb3at el code lel mail awel marra 3ashan yeb2a enabled
router.post('/2fa/verify-code', userController.verifyLogin2FA)// 3ashan ama te3mel log in we yeb3atlak el code yet2aked en enta tamam 
router.post('/2fa/verify-setup',  auth, userController.verify2FASetup); // 3ashan yet2aked en el code elly ba3ato tamam 
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password',  userController.resetPassword);



module.exports = router;
