import dotenv from "dotenv";
dotenv.config();

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import 'dotenv/config';

import authRoutes from "./routes/auth.js";
import complaintRoutes from "./routes/complaint.js";
import officerRoutes from "./routes/officer.js";
import adminRoutes from "./routes/admin.js";
import stakingRoutes from "./routes/staking.js";

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.use("/auth", authRoutes);
app.use("/complaint", complaintRoutes);
app.use("/officer", officerRoutes);
app.use("/admin", adminRoutes);
app.use("/staking", stakingRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`JustAIce backend running on port ${PORT}`);
});
