import jwt from "jsonwebtoken";
import { ROLES } from "../utils/constants.js";

// In-memory user store for MVP
// Structure: { walletAddressLowerCase: { role, walletAddress } }
const users = {};

function createToken(walletAddress, role) {
  return jwt.sign(
    { walletAddress, role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

// ✅ REGISTER
export const register = async (req, res) => {
  try {
    const { walletAddress, role } = req.body;
    if (!walletAddress || !role) {
      return res.status(400).json({ message: "Missing wallet or role" });
    }
    if (![ROLES.USER, ROLES.OFFICER, ROLES.ADMIN].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const addr = walletAddress.toLowerCase();
    if (users[addr]) {
      return res.status(409).json({ message: "User already registered" });
    }

    users[addr] = { walletAddress: addr, role };
    const token = createToken(addr, role);

    res.status(201).json({ token, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// ✅ LOGIN
export const login = async (req, res) => {
  try {
    const { walletAddress } = req.body;
    if (!walletAddress) {
      return res.status(400).json({ message: "Missing wallet address" });
    }

    const addr = walletAddress.toLowerCase();
    const user = users[addr];
    if (!user) {
      return res.status(404).json({ message: "User not found. Please register." });
    }

    const token = createToken(addr, user.role);
    res.json({ token, role: user.role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// helper to fetch all users (for testing/admin)
export const getUsers = () => users;
