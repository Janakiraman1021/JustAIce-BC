const router = require('express').Router();
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Complaint = require('../models/Complaint');

router.put('/assign/:id', auth, role('admin'), async (req, res) => {
  const { officerId } = req.body;
  const updated = await Complaint.findByIdAndUpdate(req.params.id, {
    assignedOfficer: officerId,
    status: 'Assigned'
  }, { new: true });
  res.json(updated);
});

router.put('/update/:id', auth, role('admin'), async (req, res) => {
  const { status } = req.body;
  const updated = await Complaint.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(updated);
});

module.exports = router;
