const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { cacheMiddleware } = require('../middleware/cache');

// Public Global Stats (cached for 5 minutes)
router.get('/global', cacheMiddleware(300), async (req, res) => {
  try {
    // 1. Total Patients
    const pCountRes = await supabase.from('patients').select('id', { count: 'exact' });
    const totalPatients = pCountRes.count || 0;

    // 2. Total Chemos Funded/Completed
    const chemoRes = await supabase.from('patients').select('chemo_completed');
    const totalChemo = chemoRes.data?.reduce((sum, p) => sum + (p.chemo_completed || 0), 0) || 0;

    // 3. Total Collected Amount
    const fundRes = await supabase.from('funds').select('collected_amount');
    const totalCollected = fundRes.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0;

    res.json({
      totalPatients,
      totalChemo,
      totalCollected,
      impactFactor: Math.round(totalCollected / 1000) // Dummy impact factor calculation
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
