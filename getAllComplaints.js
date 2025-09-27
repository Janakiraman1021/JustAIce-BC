// getAllComplaints.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'your-mongodb-uri-here'; // Replace if needed

// Define minimal User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  role: String
});
const User = mongoose.model('User', userSchema);

// Define Complaint schema
const complaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: String,
  location: String,
  date: String,
  tags: [String],
  ipfsHash: String,
  status: { type: String, default: 'Pending' },
  complaintId: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

const Complaint = mongoose.model('Complaint', complaintSchema);

async function run() {
  try {
    await mongoose.connect(MONGO_URI, { dbName: 'test' });
    console.log('✅ Connected to MongoDB');

    const complaints = await Complaint.find()
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    if (!complaints.length) {
      console.log('⚠️ No complaints found.');
    } else {
      console.log(`📦 Found ${complaints.length} complaints:\n`);
      complaints.forEach((c, i) => {
        console.log(`${i + 1}. ${c.title} | ID: ${c.complaintId} | Status: ${c.status}`);
        console.log(`    👤 User: ${c.createdBy?.name} (${c.createdBy?.email})`);
        if (c.assignedTo) {
          console.log(`    👮 Police: ${c.assignedTo?.name} (${c.assignedTo?.email})`);
        }
      });
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

run();
