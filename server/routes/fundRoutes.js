const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get funds for patient (public - summary)
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { data: fund, error } = await supabase
      .from('funds')
      .select('*, donors(count)')
      .eq('patient_id', req.params.patientId)
      .single();

    if (error) throw error;
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    const publicView = {
      id: fund.id,
      patient_id: fund.patient_id,
      target_amount: fund.target_amount,
      collected_amount: fund.collected_amount,
      currency: fund.currency,
      description: fund.description,
      status: fund.status,
      progress: ((fund.collected_amount / fund.target_amount) * 100).toFixed(2),
      donor_count: fund.donors ? fund.donors[0]?.count || 0 : 0
    };

    res.json(publicView);
  } catch (error) {
    console.error('Get fund error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get full fund details (admin only)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: fund, error } = await supabase
      .from('funds')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!fund) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    // Get donors for this fund
    const { data: donors } = await supabase
      .from('donors')
      .select('*')
      .eq('fund_id', req.params.id);

    res.json({ ...fund, donors });
  } catch (error) {
    console.error('Get fund details error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create fund (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { patient_id, target_amount, currency, description } = req.body;

    if (!patient_id || !target_amount) {
      return res.status(400).json({ message: 'Patient ID and target amount are required' });
    }

    const { data: newFund, error } = await supabase
      .from('funds')
      .insert([{
        patient_id,
        target_amount,
        collected_amount: 0,
        currency: currency || 'BDT',
        status: 'active'
      }])
      .select();

    if (error) throw error;

    res.status(201).json(newFund[0]);
  } catch (error) {
    console.error('Create fund error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Add donor (donation information only - NO payment processing)
router.post('/:fundId/donate', async (req, res) => {
  try {
    const { donor_name, donor_email, amount, message } = req.body;

    if (!donor_name || !amount || !req.params.fundId) {
      return res.status(400).json({ message: 'Donor name, amount, and fund ID are required' });
    }

    // Add donor record
    const { data: newDonor, error: donorError } = await supabase
      .from('donors')
      .insert([{
        fund_id: req.params.fundId,
        donor_name,
        donor_email,
        amount,
        message
      }])
      .select();

    if (donorError) throw donorError;

    // Update collected amount
    const { data: fund } = await supabase
      .from('funds')
      .select('collected_amount')
      .eq('id', req.params.fundId)
      .single();

    if (fund) {
      await supabase
        .from('funds')
        .update({ collected_amount: (fund.collected_amount || 0) + amount })
        .eq('id', req.params.fundId);
    }

    res.json({ message: 'Thank you for your donation!', donor: newDonor[0] });
  } catch (error) {
    console.error('Add donor error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update fund (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { target_amount, currency, status } = req.body;

    const { data: updatedFund, error } = await supabase
      .from('funds')
      .update({ target_amount, currency, status })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!updatedFund || updatedFund.length === 0) {
      return res.status(404).json({ message: 'Fund not found' });
    }

    res.json(updatedFund[0]);
  } catch (error) {
    console.error('Update fund error:', error);
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

