import { ethers } from 'ethers';
import fs from 'fs';
const abi = JSON.parse(fs.readFileSync(new URL('../abi/ComplaintContract.json', import.meta.url)));

// Configure provider with Avalanche C-Chain specific settings
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL, {
  name: 'avalanche',
  chainId: 43113, // Avalanche Fuji testnet
}, {
  staticNetwork: true,
  timeout: 60000, // 60 seconds timeout (Avalanche has faster finality)
  polling: { interval: 2000 }, // 2 second polling interval (Avalanche has faster blocks)
  // Add retry options
  retryOptions: {
    maxRetries: 5,
    retryDelay: 1000,
    retryJitter: 100
  }
});

// Remove '0x' prefix if present in the private key for Avalanche compatibility
const privateKey = process.env.PRIVATE_KEY.startsWith('0x') ? process.env.PRIVATE_KEY.substring(2) : process.env.PRIVATE_KEY;
const signer = new ethers.Wallet(privateKey, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, signer);

export default contract;
