import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  wallet: { type: String, default: null },
  role: { 
    type: String, 
    enum: ['admin', 'police', 'citizen'], // Allowed roles
    default: 'citizen'
  },
  status: { type: String, default: 'active' },
  joinDate: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('User', userSchema);
