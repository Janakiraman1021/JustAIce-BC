const router = require('express').Router();
const Complaint = require('../models/Complaint');
const auth = require('../middleware/auth');

router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;
  const complaint = await Complaint.create({ title, description, userId: req.user.id });
  res.json(complaint);
});

router.get('/', auth, async (req, res) => {
  const filter = req.user.role === 'admin' ? {} :
                 req.user.role === 'officer' ? { assignedOfficer: req.user.id } :
                 { userId: req.user.id };
  const complaints = await Complaint.find(filter);
  res.json(complaints);
});

module.exports = router;
