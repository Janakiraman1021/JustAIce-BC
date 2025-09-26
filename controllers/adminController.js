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
