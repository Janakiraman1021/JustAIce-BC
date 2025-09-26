const express = require("express");
const router = express.Router();
const complaintController = require("../controllers/complaintController");
const authMiddleware = require("../middleware/authMiddleware");

// File a complaint (user)
router.post("/file", authMiddleware.verifyUser, complaintController.fileComplaint);

// Get complaint by ID
router.get("/:id", authMiddleware.verifyUserOrAdmin, complaintController.getComplaint);

module.exports = router;
