const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Fund = require('../models/Fund');
const Document = require('../models/Document');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Admin dashboard stats (admin only)
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const activeFunds = await Fund.countDocuments({ status: 'Active' });
    const totalCollected = await Fund.aggregate([
      { $group: { _id: null, total: { $sum: '$collectedAmount' } } }
    ]);
    const totalDocuments = await Document.countDocuments();

    res.json({
      totalPatients,
      activeFunds,
      totalCollected: totalCollected[0]?.total || 0,
      totalDocuments
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all patients with funds (admin only)
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const patients = await Patient.find();
    const patientsWithFunds = await Promise.all(
      patients.map(async (patient) => {
        const fund = await Fund.findOne({ patientId: patient._id });
        return { ...patient.toObject(), fund };
      })
    );
    res.json(patientsWithFunds);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
