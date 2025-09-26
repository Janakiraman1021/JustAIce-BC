const express = require("express");
const router = express.Router();
const officerController = require("../controllers/officerController");
const authMiddleware = require("../middleware/authMiddleware");

// Get assigned complaints
router.get("/assigned", authMiddleware.verifyOfficer, officerController.getAssignedComplaints);

// Update complaint status + upload evidence
router.post("/update/:id", authMiddleware.verifyOfficer, officerController.updateComplaint);

module.exports = router;
