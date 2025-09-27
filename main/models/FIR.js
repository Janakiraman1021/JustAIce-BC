const mongoose = require('mongoose');
const FIRSchema = new mongoose.Schema({
  complaintId: mongoose.Schema.Types.ObjectId,
  ipfsHash: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  uploadedAt: { type: Date, default: Date.now }
});
module.exports = mongoose.model('FIR', FIRSchema);
