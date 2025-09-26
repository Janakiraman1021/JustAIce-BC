import { stakingContract, complaintContract } from "../services/blockchain.js";
import { uploadJSON } from "../services/filecoin.js";
import { STATUS } from "../utils/constants.js";

export const fileComplaint = async (req, res) => {
  try {
    const { complaintType, description } = req.body;
    const reporter = req.user.walletAddress;

    // Check if user has staked
    const staked = await stakingContract.hasStaked(reporter);
    if (!staked)
      return res.status(400).json({ message: "User must stake 0.001 ETH first" });

    // Prepare complaint JSON
    const complaintJSON = {
      reporter,
      complaintType,
      description,
      status: STATUS.PENDING,
      timestamp: Date.now(),
    };

    // Upload to Filecoin
    const cid = await uploadJSON(complaintJSON);

    // Call blockchain to store complaint CID
    const tx = await complaintContract.fileComplaint(cid);
    await tx.wait();

    res.json({ message: "Complaint filed successfully", filecoinCID: cid });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

export const getComplaint = async (req, res) => {
  try {
    const id = req.params.id;
    const complaint = await complaintContract.complaints(id);
    res.json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};
