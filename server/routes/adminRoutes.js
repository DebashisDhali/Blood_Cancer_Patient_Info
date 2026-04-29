const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get Dashboard Stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const [pCount, fCount, fSum] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }),
      supabase.from('funds').select('*', { count: 'exact', head: true }),
      supabase.from('funds').select('collected_amount')
    ]);

    const totalCollected = fSum.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0;

    res.json({
      totalPatients: pCount.count || 0,
      activeFunds: fCount.count || 0,
      totalCollected: totalCollected,
      totalDocuments: 0 // Will implement if needed
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Optimized: Get all patients with their funds in ONE query
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        fund:funds(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Flatten fund array (since it's a 1-to-1 relationship in our logic)
    const formatted = data.map(p => ({
      ...p,
      fund: p.fund ? p.fund[0] : null
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
