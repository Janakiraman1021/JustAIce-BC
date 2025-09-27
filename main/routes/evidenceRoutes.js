const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const Evidence = require('../models/Evidence');
const uploadToIPFS = require('../utils/uploadToIPFS');

const upload = multer();

router.post('/upload', auth, role('officer'), upload.single('file'), async (req, res) => {
  const ipfsHash = await uploadToIPFS(req.file.buffer);
  const evidence = await Evidence.create({
    complaintId: req.body.complaintId,
    ipfsHash,
    uploadedBy: req.user.id,
    fileType: req.file.mimetype
  });
  res.json(evidence);
});

module.exports = router;
