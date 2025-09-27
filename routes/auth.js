import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Wallet-based register & login
router.post("/register", authController.register);
router.post("/login", authController.login);

export default router;
