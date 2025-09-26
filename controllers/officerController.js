import { complaintContract } from "../services/blockchain.js";
import { uploadJSON } from "../services/filecoin.js";
import { STATUS } from "../utils/constants.js";

export const getAssignedComplaints = async (req, res) => {
  try {
    const officer = req.user.walletAddress;
    const totalComplaints = (await complaintContract.complaintCounter()).toNumber();
    const assigned = [];

    for (let i = 1; i <= totalComplaints; i++) {
      const complaint = await complaintContract.complaints(i);
      if (complaint.assignedOfficer.toLowerCase() === officer.toLowerCase()) {
        assigned.push(complaint);
      }
    }

    res.json(assigned);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const updateComplaint = async (req, res) => {
  try {
    const officer = req.user.walletAddress;
    const complaintId = req.params.id;
    const { evidence, status } = req.body;

    // Upload evidence JSON to Filecoin
    const evidenceCID = await uploadJSON(evidence, `evidence_${complaintId}.json`);

    // Update blockchain status & evidence
    const tx = await complaintContract.updateComplaint(
      complaintId,
      officer,
      evidenceCID,
      status
    );
    await tx.wait();

    res.json({ message: "Complaint updated", evidenceCID });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
