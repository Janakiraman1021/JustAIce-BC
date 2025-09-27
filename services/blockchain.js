<<<<<<< HEAD
 
=======
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

// Directly set the values here
const SEPOLIA_RPC_URL = "https://sepolia.infura.io/v3/bad27a6f20b245f09224bb5a715a8d0a";
const PRIVATE_KEY = "0xb066d8c9e4b3052c0843aa9c64539f7e2fde708030d4c0e7057582e791ccabbe";
const STAKING_ADDRESS = "0x60A6ec872AAd3e4832832F951a9EfB3998EF73Df";
const COMPLAINT_ADDRESS = "0xFE717db294F0847E876255CD3f1b70DFE78258E0";
const NFT_ADDRESS = "0xc6829d6fFC3022F64C3c43cdC24f9DebAb4beb92";

const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
const signer = new ethers.Wallet(PRIVATE_KEY, provider);

export const stakingContract = new ethers.Contract(
  STAKING_ADDRESS,
  stakingJSON.abi,
  signer
);

export const complaintContract = new ethers.Contract(
  COMPLAINT_ADDRESS,
  complaintJSON.abi,
  signer
);

export const nftContract = new ethers.Contract(
  NFT_ADDRESS,
  nftJSON.abi,
  signer
);

export { ethers, signer };
>>>>>>> 709a887c242aa33f539198820897e271352b36c3
