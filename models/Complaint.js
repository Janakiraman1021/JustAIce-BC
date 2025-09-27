import mongoose from 'mongoose'
import { v4 as uuidv4 } from 'uuid'

const ComplaintSchema = new mongoose.Schema({
  complaintId: {
    type: String,
    default: uuidv4,
    unique: true,
  },
  title: String,
  description: String,
  type: String,
  location: String,
  date: String,
  tags: [String],
  ipfsHash: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    default: 'Pending'
  }
}, { timestamps: true })

const Complaint = mongoose.model("Complaint", ComplaintSchema, "complaints");
export default Complaint;