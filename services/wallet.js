import jwt from 'jsonwebtoken';

export const login = async (req, res) => {
  const { walletAddress } = req.body;
  const token = jwt.sign({ walletAddress, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token });
};

export const register = async (req, res) => {
  // implement user creation logic
  res.json({ message: 'User registered' });
};
