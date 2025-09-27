const mongoose = require('mongoose');
const EvidenceSchema = new mongoose.Schema({
  complaintId: mongoose.Schema.Types.ObjectId,
  ipfsHash: String,
  uploadedBy: mongoose.Schema.Types.ObjectId,
  fileType: String,
  timestamp: { type: Date, default: Date.now }
});
module.exports = mongoose.model('Evidence', EvidenceSchema);
