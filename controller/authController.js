import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Register
export const register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with provided role
    const user = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role
    });

    res.status(201).json({
      message: `User registered successfully with role: ${role}`,
      role: user.role,
      user
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};


// Email login
export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    
    res.json({ 
      token, 
      role: user.role, 
      userID: user._id,
      name: user.name,
      email: user.email,
      wallet: user.wallet
    });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
};

// Wallet login
export const walletLogin = async (req, res) => {
  const { wallet } = req.body;
  if (!wallet) return res.status(400).json({ error: 'Wallet address required' });

  try {
    let user = await User.findOne({ wallet });

    if (!user) {
      user = await User.create({ wallet, role: 'user' });
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '2h' });
    res.json({ token, role: user.role });
  } catch (err) {
    res.status(500).json({ error: 'Wallet login failed', details: err.message });
  }
};
// Get user profile
export const getProfile = async (req, res) => {
  try {
    res.json(req.user); // Already attached in middleware
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get all police users (admin only)
export const getAllPolice = async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    const policeUsers = await User.find({ role: 'police' }).select('-password');
    res.status(200).json(policeUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch police users', details: err.message });
  }
};

// Get all admin users (admin only)
export const getAllAdmins = async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    const adminUsers = await User.find({ role: 'admin' }).select('-password');
    res.status(200).json(adminUsers);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch admin users', details: err.message });
  }
};

// Get all users (admin only)
export const getAllUsers = async (req, res) => {
  try {
    // Check if the requester is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }
    const users = await User.find().select('-password');
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users', details: err.message });
  }
};