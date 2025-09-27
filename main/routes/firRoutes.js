const router = require('express').Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const FIR = require('../models/FIR');
const uploadToIPFS = require('../utils/uploadToIPFS');

const upload = multer();

router.post('/:complaintId', auth, role('officer'), upload.single('file'), async (req, res) => {
  const ipfsHash = await uploadToIPFS(req.file.buffer);
  const fir = await FIR.create({
    complaintId: req.params.complaintId,
    ipfsHash,
    uploadedBy: req.user.id
  });
  res.json(fir);
});

module.exports = router;
