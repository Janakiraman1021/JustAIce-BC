import * as complaintController from "../controllers/complaintController.js";
import { stakingContract, complaintContract } from "../services/blockchain.js";
import { uploadJSON } from "../services/filecoin.js";
import { STATUS } from "../utils/constants.js";
import fs from "fs";
import path from "path";

// File a new complaint
export const fileComplaint = async (req, res) => {
  try {
    const { title, description, type, location, date, tags } = req.body;
    const reporter = req.user.walletAddress;

    // Check if user has staked
    // const staked = await stakingContract.hasStaked(reporter);
    // if (!staked)
    //   return res.status(400).json({ message: "User must stake 0.001 ETH first" });

    // Prepare complaint JSON
    const complaintJSON = {
      title,
      description,
      type,
      location,
      date,
      tags,
      reporter,
      status: STATUS.PENDING,
      submittedAt: new Date().toISOString(),
    };

    // Upload to Filecoin
    const cid = await uploadJSON(complaintJSON);

    // Store complaint on blockchain (using CID as identifier)
    const tx = await complaintContract.fileComplaint(cid);
    await tx.wait();

    res.status(201).json({
      message: "Complaint filed successfully",
      filecoinCID: cid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to file complaint", details: err.message });
  }
};

// Retrieve a complaint by CID (from blockchain)
export const getComplaintByCID = async (req, res) => {
  try {
    const { cid } = req.params;
    // If CID is a local fallback token, read from local uploads
    if (typeof cid === 'string' && cid.startsWith('LOCAL::')) {
      const localName = cid.replace('LOCAL::', '');
      const filePath = path.join(process.cwd(), 'backend', 'uploads', localName);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: 'Complaint not found (local file missing)' });
      }
      const contents = fs.readFileSync(filePath, 'utf8');
      const complaint = JSON.parse(contents);
      return res.json(complaint);
    }
    // Get complaint details from blockchain
    const complaint = await complaintContract.getComplaintByCID(cid);
    if (!complaint) {
      return res.status(404).json({ error: "Complaint not found" });
    }
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaint", details: err.message });
  }
};

// Get all complaints (CIDs) from blockchain
export const getAllComplaints = async (req, res) => {
  try {
    const cids = await complaintContract.getAllComplaintCIDs();
    res.status(200).json({ cids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch complaints", details: err.message });
  }
};

// Assign complaint to police (by CID)
export const assignComplaintToPolice = async (req, res) => {
  try {
    const { cid } = req.params;
    const { officerWallet } = req.body;

    // Assign on blockchain
    const tx = await complaintContract.assignComplaint(cid, officerWallet);
    await tx.wait();

    res.status(200).json({ message: "Complaint assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to assign complaint", details: err.message });
  }
};

// Get complaints assigned to a police officer (by wallet address)
export const getAssignedComplaints = async (req, res) => {
  try {
    const { officerWallet } = req.query;
    if (!officerWallet) {
      return res.status(400).json({ error: "Missing officerWallet in query parameters" });
    }
    const cids = await complaintContract.getComplaintsAssignedTo(officerWallet);
    res.status(200).json({ cids });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching assigned complaints", details: err.message });
  }
};
