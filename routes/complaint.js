<<<<<<< HEAD
import express from 'express';
import {
  fileComplaint,
  getComplaintById,
  getComplaintsByUserId,
  assignComplaintToPolice
} from '../controller/complaintController.js';
import { protect, verifyToken, verifyAdmin } from '../middlewares/authMiddleware.js';
import Complaint from '../models/Complaint.js';
import { getAssignedComplaints } from '../controller/complaintController.js';



const router = express.Router();

// ✅ New complaint
router.post('/new', protect, fileComplaint);

// ✅ My complaints (user only)
router.get('/my-complaints/:userId', verifyToken, getComplaintsByUserId);

// ✅ Assign complaint to police (admin only)
router.put('/assign/:complaintId', verifyToken, verifyAdmin, assignComplaintToPolice);

// ✅ Admin view: All complaints (with user + police details)
router.get('/admin-view-comp', verifyToken, verifyAdmin, async (req, res) => {
  console.log("✅ /admin-view-comp route hit");
  try {
    const complaints = await Complaint.find()
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    if (!complaints.length) {
      return res.status(404).json({ error: 'No complaints found' });
    }

    res.json({ complaints });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ error: "Server error", details: err.message });
  }
});

// ✅ Specific complaint view (must be LAST!)
router.get('/:complaintId', verifyToken, getComplaintById);

// ✅ Optional test route
router.get('/ping', (req, res) => {
  res.send("✅ Complaint route is active");
});

router.get('/assigned:user_id', getAssignedComplaints);
// router.get('/assigned/:userId', verifyToken, getAssignedComplaints);
=======
import express from "express";
import * as complaintController from "../controllers/complaintController.js";
import * as authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// File a complaint (user)
router.post("/file", authMiddleware.verifyUser, complaintController.fileComplaint);

// Get complaint by CID
router.get("/:cid", authMiddleware.verifyUserOrAdmin, complaintController.getComplaintByCID);
>>>>>>> 709a887c242aa33f539198820897e271352b36c3

export default router;
