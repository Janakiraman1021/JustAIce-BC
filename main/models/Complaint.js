const mongoose = require('mongoose');
const ComplaintSchema = new mongoose.Schema({
  title: String,
  description: String,
  userId: mongoose.Schema.Types.ObjectId,
  status: { type: String, default: 'Pending' },
  assignedOfficer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});
module.exports = mongoose.model('Complaint', ComplaintSchema);
