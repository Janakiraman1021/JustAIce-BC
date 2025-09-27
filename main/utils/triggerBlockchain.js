const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

// Load ABI and Contract Address
const contractJson = require("../contracts/ComplaintCustody.json");
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

module.exports = async function triggerBlockchain(complaintId, officerWallet) {
  try {
    // Provider (Infura)
    const provider = new ethers.JsonRpcProvider(`https://sepolia.infura.io/v3/${process.env.INFURA_PROJECT_ID}`);

    // Signer (Officer/Admin wallet)
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

    // Contract
    const contract = new ethers.Contract(CONTRACT_ADDRESS, contractJson.abi, wallet);

    // Call function from smart contract
    const tx = await contract.logComplaintEvent(complaintId, officerWallet);
    const receipt = await tx.wait();

    return {
      success: true,
      txHash: receipt.transactionHash,
      blockNumber: receipt.blockNumber
    };
  } catch (err) {
    console.error("Blockchain Trigger Error:", err);
    return {
      success: false,
      error: err.message
    };
  }
};
