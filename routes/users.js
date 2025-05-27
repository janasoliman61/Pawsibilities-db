// routes/users.js
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Endpoints for user registration and login
router.post("/register", userController.register);
router.post("/login", userController.login);
// router.post('/forgot-password', userController.forgotPassword);
// router.post('/reset-password',  userController.resetPassword);

router.put("/change-email", userController.changeEmail);
router.put("/change-password", userController.changePassword);
router.put("/update-preferences", userController.updatePreferences);
router.put("/finduser", userController.finduser);

module.exports = router;
