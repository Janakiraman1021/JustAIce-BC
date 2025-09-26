const { ethers } = require("ethers");
const stakingABI = require("../contracts/JustAIceSStakingManager.json").abi;
const complaintABI = require("../contracts/JustAIceComplaint.json").abi;
const nftABI = require("../contracts/JustAIceOfficerNFT.json").abi;

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const stakingContract = new ethers.Contract(process.env.STAKING_ADDRESS, stakingABI, signer);
const complaintContract = new ethers.Contract(process.env.COMPLAINT_ADDRESS, complaintABI, signer);
const nftContract = new ethers.Contract(process.env.NFT_ADDRESS, nftABI, signer);

module.exports = {
  stakingContract,
  complaintContract,
  nftContract,
  ethers,
  signer
};
