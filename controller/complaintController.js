import Complaint from '../models/Complaint.js'
import { pinJSONToIPFS } from '../config/pinata.js'
import contract from '../config/blockchain.js'
import User from '../models/User.js'
import { ethers } from 'ethers'
import { executeTransaction } from '../utils/blockchainUtils.js'

// File a new complaint
export const fileComplaint = async (req, res) => {
  const { title, description, type, location, date, tags } = req.body
  const userId = req.user._id

  try {
    const payload = {
      title,
      description,
      type,
      location,
      date,
      tags,
      submittedBy: userId.toString(),
      submittedAt: new Date().toISOString()
    }

    // Upload complaint data to IPFS via Pinata
    const ipfsHash = await pinJSONToIPFS(payload)

    // Create complaint in database
    const complaint = await Complaint.create({
      title,
      description,
      type,
      location,
      date,
      tags,
      ipfsHash,
      createdBy: userId
    })

    // Upload complaintId + IPFS hash to smart contract using blockchainUtils
    // Using legacy transactions for Avalanche C-Chain compatibility
    try {
      // Use the executeTransaction utility which handles transaction with better error logging
      await executeTransaction(
        contract.addComplaint,
        [complaint.complaintId, req.user.name, ipfsHash],
        { 
          gasLimit: 2000000, // Lower gas limit for Avalanche
          gasPrice: ethers.parseUnits('25', 'gwei'), // Use gasPrice for legacy transactions
          type: 0 // Legacy transaction type for Avalanche compatibility
        }
      );
      
      console.log('Blockchain transaction successful on Avalanche network');
    } catch (error) {
      console.error('Blockchain transaction failed on Avalanche:', error.message);
      // Continue with the response even if blockchain transaction fails
      // This prevents the entire complaint filing from failing
      // In production, you might want to handle this differently
    }

    res.status(201).json({
      message: 'Complaint filed successfully',
      complaintId: complaint.complaintId,
      ipfsHash
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to file complaint', details: err.message })
  }
}

// Retrieve a complaint by ID with role-based access
export const getComplaintById = async (req, res) => {
  const { complaintId } = req.params
  const { _id, role } = req.user

  try {
    const complaint = await Complaint.findOne({ complaintId })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')

    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Allow only creator, assigned officer or admin to view
    if (
      role !== 'admin' &&
      !complaint.createdBy._id.equals(_id) &&
      (!complaint.assignedTo || !complaint.assignedTo._id.equals(_id))
    ) {
      return res.status(403).json({ error: 'You are not authorized to view this complaint' })
    }

    res.json({
      complaintId: complaint.complaintId,
      title: complaint.title,
      description: complaint.description,
      type: complaint.type,
      location: complaint.location,
      date: complaint.date,
      tags: complaint.tags,
      ipfsHash: complaint.ipfsHash,
      createdBy: complaint.createdBy,
      assignedTo: complaint.assignedTo,
      status: complaint.status,
      createdAt: complaint.createdAt,
      updatedAt: complaint.updatedAt
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch complaint', details: err.message })
  }
}


export const getComplaintsByUserId = async (req, res) => {
  const { userId } = req.params
  const { _id, role } = req.user

  // Only allow the user themselves or admin to access
  if (role !== 'admin' && userId !== _id.toString()) {
    return res.status(403).json({ error: 'Unauthorized access' })
  }

  try {
    const complaints = await Complaint.find({ createdBy: userId })
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })

    res.status(200).json(complaints)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch complaints', details: err.message })
  }
}

export const assignComplaintToPolice = async (req, res) => {
  const { complaintId } = req.params
  const { policeId } = req.body

  try {
    // Check if complaint exists
    const complaint = await Complaint.findOne({ complaintId })
    if (!complaint) {
      return res.status(404).json({ error: 'Complaint not found' })
    }

    // Check if user exists and is a police officer
    const policeOfficer = await User.findById(policeId)
    if (!policeOfficer || policeOfficer.role !== 'police') {
      return res.status(400).json({ error: 'Invalid police officer ID' })
    }

    // Assign complaint
    complaint.assignedTo = policeOfficer._id
    complaint.status = 'Assigned'
    complaint.markModified('assignedTo'); // Ensure Mongoose tracks the change
    await complaint.save();
    console.log('assignComplaintToPolice: complaint after save =', complaint);

    const updatedComplaint = await Complaint.findOne({ complaintId })
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')

    res.status(200).json({
      message: 'Complaint assigned successfully',
      complaint: updatedComplaint
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to assign complaint', details: err.message })
  }
}

export const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 })

    if (!complaints.length) {
      return res.status(404).json({ error: 'No complaints found' })
    }

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    })
  } catch (err) {
    console.error('❌ Error fetching complaints:', err)
    res.status(500).json({ error: 'Failed to fetch complaints', details: err.message })
  }
}

// Get all complaints assigned to the logged-in police officer
// controllers/complaintController.js
// const Complaint = require("../models/complaintModel");

// Get complaints assigned to the logged-in officer
// Improved version of getAssignedComplaints with better error handling
export const getAssignedComplaints = async (req, res) => {
  try {
    // Get user_id from query parameter
    const userId = req.query.user_id;
    if (!userId) {
      return res.status(400).json({ error: "Missing user_id in query parameters" });
    }

    // Find complaints assigned to this user
    const complaints = await Complaint.find({ assignedTo: userId })
      .populate("createdBy", "name email role")
      .populate("assignedTo", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching assigned complaints:", error);
    res.status(500).json({ 
      message: "Error fetching assigned complaints",
      error: error.message 
    });
  }
};
