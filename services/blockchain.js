import { ethers } from "ethers";
import fs from "fs";
import path from "path";
import url from "url";

// Resolve __dirname in ES modules
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

// Load JSON ABIs
const stakingJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../contracts/JustAIceSStakingManager.json")));
const complaintJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../contracts/JustAIceComplaint.json")));
const nftJSON = JSON.parse(fs.readFileSync(path.join(__dirname, "../contracts/JustAIceOfficerNFT.json")));

const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

export const stakingContract = new ethers.Contract(
  process.env.STAKING_ADDRESS,
  stakingJSON.abi,
  signer
);

export const complaintContract = new ethers.Contract(
  process.env.COMPLAINT_ADDRESS,
  complaintJSON.abi,
  signer
);

export const nftContract = new ethers.Contract(
  process.env.NFT_ADDRESS,
  nftJSON.abi,
  signer
);

export { ethers, signer };
