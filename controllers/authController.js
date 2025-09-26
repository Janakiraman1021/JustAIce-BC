import jwt from "jsonwebtoken";
import { ROLES } from "../utils/constants.js";

// Mock in-memory user storage
const users = {}; // { walletAddress: { role, wallet } }

export const login = async (req, res) => {
  try {
    const { walletAddress, role } = req.body;
    if (!walletAddress || !role)
      return res.status(400).json({ message: "Missing wallet or role" });

    if (![ROLES.USER, ROLES.OFFICER, ROLES.ADMIN].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    // Save user (in-memory for MVP, replace with DB in prod)
    users[walletAddress.toLowerCase()] = { role, walletAddress: walletAddress.toLowerCase() };

    const token = jwt.sign(
      { walletAddress: walletAddress.toLowerCase(), role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.json({ token, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// helper to fetch all users
export const getUsers = () => users;
