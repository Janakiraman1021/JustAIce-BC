const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware/authMiddleware");

// Assign complaint to officer
router.post("/assign/:id", authMiddleware.verifyAdmin, adminController.assignComplaint);

// Reward top officer
router.post("/reward", authMiddleware.verifyAdmin, adminController.rewardOfficer);

// Get all users/officers/complaints
router.get("/dashboard", authMiddleware.verifyAdmin, adminController.getDashboard);

module.exports = router;
