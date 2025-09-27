import express from "express";
import * as adminController from "../controllers/adminController.js";
import * as authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Assign complaint to officer
router.post("/assign/:id", authMiddleware.verifyAdmin, adminController.assignComplaint);

// Reward top officer
router.post("/reward", authMiddleware.verifyAdmin, adminController.rewardOfficer);


// Re-upload a local fallback file to web3.storage (admin only)
router.post("/reupload", authMiddleware.verifyAdmin, adminController.reuploadLocalComplaint);

// Get all users/officers/complaints
router.get("/dashboard", authMiddleware.verifyAdmin, adminController.getDashboard);

export default router;
