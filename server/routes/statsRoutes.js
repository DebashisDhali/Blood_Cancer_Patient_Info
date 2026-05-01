const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { cacheMiddleware } = require('../middleware/cache');

// Public Global Stats (cached for 5 minutes)
router.get('/global', cacheMiddleware(300), async (req, res) => {
  try {
    // Run all 3 queries in parallel
    const [pCountRes, chemoRes, fundRes] = await Promise.all([
      supabase.from('patients').select('id', { count: 'exact' }),
      supabase.from('patients').select('chemo_completed'),
      supabase.from('funds').select('collected_amount')
    ]);

    const totalPatients  = pCountRes.count || 0;
    const totalChemo     = chemoRes.data?.reduce((sum, p) => sum + (p.chemo_completed || 0), 0) || 0;
    const totalCollected = fundRes.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0;

    res.json({
      totalPatients,
      totalChemo,
      totalCollected,
      impactFactor: Math.round(totalCollected / 1000)
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

module.exports = router;
