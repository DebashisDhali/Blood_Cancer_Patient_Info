const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all patients (public - masked data)
router.get('/', async (req, res) => {
  try {
    const patients = await Patient.find().select('-phone -email');
    res.json(patients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID (admin only - full data)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new patient (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const patient = new Patient(req.body);
    await patient.save();
    res.status(201).json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update patient (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    res.json(patient);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload patient photo (admin only)
router.post('/:id/photo', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { photo, contentType } = req.body;
    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      {
        photo: {
          data: Buffer.from(photo, 'base64'),
          contentType: contentType
        }
      },
      { new: true }
    );
    res.json({ message: 'Photo uploaded successfully', patient });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get patient photo (public)
router.get('/:id/photo', async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id);
    if (!patient || !patient.photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.contentType(patient.photo.contentType);
    res.send(patient.photo.data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
