import express from "express";
import * as stakingController from "../controllers/stakingController.js";
import * as authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Get staking information for authenticated user
router.get("/info", authMiddleware.verifyUser, stakingController.stakeETH);

// Check if user has staked
router.get("/status", authMiddleware.verifyUser, stakingController.checkStakingStatus);

// Get required stake amount (public endpoint)
router.get("/required", stakingController.getRequiredStake);

export default router;