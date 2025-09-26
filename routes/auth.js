import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Signup/Login (wallet-based)
router.post("/login", authController.login);

export default router;
