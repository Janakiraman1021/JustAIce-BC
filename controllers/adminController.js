import fs from "fs";
import path from "path";
import { Web3Storage, File } from "web3.storage";

// Helper: get web3.storage client
function getWeb3Client() {
  return new Web3Storage({ token: process.env.WEB3_STORAGE_TOKEN });
}

// POST /admin/reupload { localName: "169XYZ-complaint.json" }
export const reuploadLocalComplaint = async (req, res) => {
  try {
    const { localName } = req.body;
    if (!localName || typeof localName !== "string") {
      return res.status(400).json({ error: "Missing or invalid localName" });
    }
    const filePath = path.join(process.cwd(), "backend", "uploads", localName);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found: " + localName });
    }
    const jsonData = fs.readFileSync(filePath, "utf8");
    const blob = new Blob([jsonData], { type: "application/json" });
    const file = new File([blob], localName);
    const client = getWeb3Client();
    const cid = await client.put([file]);
    res.json({ message: "Re-uploaded to web3.storage", localName, cid });
  } catch (err) {
    console.error("Re-upload failed:", err.message);
    res.status(500).json({ error: "Re-upload failed", details: err.message });
  }
};
import { complaintContract, nftContract } from "../services/blockchain.js";
import { STATUS } from "../utils/constants.js";
import * as authController from "./authController.js";

export const assignComplaint = async (req, res) => {
  try {
    const complaintId = req.params.id;
    const { officer } = req.body;
    const tx = await complaintContract.assignComplaint(complaintId, officer);
    await tx.wait();
    res.json({ message: `Complaint ${complaintId} assigned to ${officer}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const rewardOfficer = async (req, res) => {
  try {
    const { officer, metadataURI } = req.body; // metadataURI = NFT metadata CID
    const tx = await nftContract.rewardOfficer(officer, metadataURI);
    await tx.wait();
    res.json({ message: `NFT rewarded to ${officer}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getDashboard = async (req, res) => {
  try {
    const users = authController.getUsers();
    const totalComplaints = (await complaintContract.complaintCounter()).toNumber();
    const complaints = [];

    for (let i = 1; i <= totalComplaints; i++) {
      const c = await complaintContract.complaints(i);
      complaints.push(c);
    }

    res.json({ users, complaints });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
