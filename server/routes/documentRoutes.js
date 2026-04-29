const express = require('express');
const router = express.Router();
const Document = require('../models/Document');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get documents for patient (admin only)
router.get('/patient/:patientId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const documents = await Document.find({ patientId: req.params.patientId });
    res.json(documents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { patientId, documentType, title, description, fileData, fileName, fileType } = req.body;
    
    const document = new Document({
      patientId,
      documentType,
      title,
      description,
      fileData: Buffer.from(fileData, 'base64'),
      fileName,
      fileType,
      fileSize: Buffer.byteLength(fileData, 'base64')
    });

    await document.save();
    res.status(201).json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Verify document (admin only)
router.put('/:id/verify', authMiddleware, adminOnly, async (req, res) => {
  try {
    const document = await Document.findByIdAndUpdate(
      req.params.id,
      { status: 'Verified' },
      { new: true }
    );
    res.json(document);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Download document (admin only)
router.get('/:id/download', authMiddleware, adminOnly, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.contentType(document.fileType);
    res.attachment(document.fileName);
    res.send(document.fileData);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
