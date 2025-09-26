import express from "express";
import * as officerController from "../controllers/officerController.js";
import * as authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get assigned complaints
router.get("/assigned", authMiddleware.verifyOfficer, officerController.getAssignedComplaints);

// Update complaint status + upload evidence
router.post("/update/:id", authMiddleware.verifyOfficer, officerController.updateComplaint);

export default router;
