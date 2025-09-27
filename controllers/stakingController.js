import { stakingContract } from "../services/blockchain.js";
import { ethers } from "ethers";

// Stake ETH to file complaints
export const stakeETH = async (req, res) => {
  try {
    const userWallet = req.user.walletAddress;

    // Check if user has already staked
    const hasStaked = await stakingContract.hasStaked(userWallet);
    if (hasStaked) {
      return res.status(400).json({ message: "User has already staked" });
    }

    // Get required stake amount
    const requiredStake = await stakingContract.REQUIRED_STAKE();
    
    // Note: The actual staking transaction needs to be done from frontend
    // This endpoint provides the contract address and required amount
    res.status(200).json({
      message: "Staking information retrieved successfully",
      contractAddress: process.env.STAKING_CONTRACT_ADDRESS || "0x60A6ec872AAd3e4832832F951a9EfB3998EF73Df",
      requiredStake: ethers.formatEther(requiredStake),
      requiredStakeWei: requiredStake.toString(),
      userWallet: userWallet,
      hasStaked: false
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get staking information", details: err.message });
  }
};

// Check if user has staked
export const checkStakingStatus = async (req, res) => {
  try {
    const userWallet = req.user.walletAddress;
    
    const hasStaked = await stakingContract.hasStaked(userWallet);
    const requiredStake = await stakingContract.REQUIRED_STAKE();

    res.status(200).json({
      userWallet: userWallet,
      hasStaked: hasStaked,
      requiredStake: ethers.formatEther(requiredStake),
      requiredStakeWei: requiredStake.toString(),
      contractAddress: process.env.STAKING_CONTRACT_ADDRESS || "0x60A6ec872AAd3e4832832F951a9EfB3998EF73Df"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to check staking status", details: err.message });
  }
};

// Get required stake amount
export const getRequiredStake = async (req, res) => {
  try {
    const requiredStake = await stakingContract.REQUIRED_STAKE();
    
    res.status(200).json({
      requiredStake: ethers.formatEther(requiredStake),
      requiredStakeWei: requiredStake.toString(),
      contractAddress: process.env.STAKING_CONTRACT_ADDRESS || "0x60A6ec872AAd3e4832832F951a9EfB3998EF73Df"
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to get required stake", details: err.message });
  }
};