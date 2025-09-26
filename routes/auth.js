const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// Signup/Login (wallet-based)
router.post("/login", authController.login);

module.exports = router;
