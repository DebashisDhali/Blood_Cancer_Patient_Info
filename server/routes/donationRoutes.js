const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { clearCache } = require('../middleware/cache');

// Helper to update fund total
const syncFundTotal = async (fundId) => {
  const { data: donations, error } = await supabase
    .from('donations')
    .select('amount')
    .eq('fund_id', fundId);
  
  if (error) return;
  const total = donations.reduce((sum, d) => sum + Number(d.amount), 0);
  
  await supabase
    .from('funds')
    .update({ collected_amount: total })
    .eq('id', fundId);
    
  clearCache('patients');
};

// Get donations for a fund
router.get('/fund/:fundId', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('donations')
      .select('*')
      .eq('fund_id', req.params.fundId)
      .order('date', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add daily donation
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fund_id, amount, date, note } = req.body;
    const { data, error } = await supabase
      .from('donations')
      .insert([{ fund_id, amount, date, note }])
      .select();
    
    if (error) throw error;
    await syncFundTotal(fund_id);
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update donation
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { amount, date, note, fund_id } = req.body;
    const { data, error } = await supabase
      .from('donations')
      .update({ amount, date, note })
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    await syncFundTotal(fund_id);
    res.json(data[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete donation
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: donation, error: fetchErr } = await supabase
      .from('donations')
      .select('fund_id')
      .eq('id', req.params.id)
      .single();
    
    if (fetchErr) throw fetchErr;

    const { error } = await supabase.from('donations').delete().eq('id', req.params.id);
    if (error) throw error;
    
    await syncFundTotal(donation.fund_id);
    res.json({ message: 'Donation record removed' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
