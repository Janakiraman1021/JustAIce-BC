<<<<<<< HEAD
import express from 'express';
import { register, login, walletLogin,getProfile,getAllPolice ,getAllAdmins,getAllUsers} from '../controller/authController.js';
import { protect,verifyToken,verifyAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/wallet-login', walletLogin);
router.get('/me', protect, getProfile); // 👈 Protected route
router.get('/police', verifyToken, verifyAdmin, getAllPolice);
router.get('/admins', verifyToken, verifyAdmin, getAllAdmins);
router.get('/users', verifyToken, verifyAdmin, getAllUsers);
=======
import express from "express";
import * as authController from "../controllers/authController.js";

const router = express.Router();

// Wallet-based register & login
router.post("/register", authController.register);
router.post("/login", authController.login);
>>>>>>> 709a887c242aa33f539198820897e271352b36c3

export default router;
