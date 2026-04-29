const express = require('express');
const router = express.Router();
const Fund = require('../models/Fund');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get funds for patient (public - summary)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const fund = await Fund.findOne({ patientId: req.params.patientId });
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }
    
    // Public view - hide donor details
    const publicView = {
      _id: fund._id,
      patientId: fund.patientId,
      targetAmount: fund.targetAmount,
      collectedAmount: fund.collectedAmount,
      currency: fund.currency,
      description: fund.description,
      status: fund.status,
      progress: ((fund.collectedAmount / fund.targetAmount) * 100).toFixed(2),
      donorCount: fund.donors.length
    };
    
    res.json(publicView);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get full fund details (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const fund = await Fund.findById(req.params.id).populate('patientId');
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }
    res.json(fund);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create fund (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const fund = new Fund(req.body);
    await fund.save();
    res.status(201).json(fund);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add donor
router.post('/:fundId/donate', async (req, res) => {
  try {
    const { name, email, amount, message } = req.body;
    const fund = await Fund.findByIdAndUpdate(
      req.params.fundId,
      {
        $push: { donors: { name, email, amount, message, date: new Date() } },
        $inc: { collectedAmount: amount }
      },
      { new: true }
    );
    res.json({ message: 'Thank you for your donation!', fund });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add expense (admin only)
router.post('/:fundId/expense', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { category, amount, description, recieptImage } = req.body;
    const fund = await Fund.findByIdAndUpdate(
      req.params.fundId,
      {
        $push: {
          expenses: {
            category,
            amount,
            description,
            recieptImage: recieptImage ? Buffer.from(recieptImage, 'base64') : undefined,
            date: new Date()
          }
        }
      },
      { new: true }
    );
    res.json({ message: 'Expense added successfully', fund });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
