import express from "express";
import * as complaintController from "../controllers/complaintController.js";
import * as authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// File a complaint (user)
router.post("/file", authMiddleware.verifyUser, complaintController.fileComplaint);

// Get complaint by CID
router.get("/:cid", authMiddleware.verifyUserOrAdmin, complaintController.getComplaintByCID);

export default router;
