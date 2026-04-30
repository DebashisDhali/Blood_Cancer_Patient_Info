const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get Dashboard Stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;
    const [pCount, fCount, fSum] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('admin_id', adminId),
      supabase.from('funds').select('id, patient_id', { count: 'exact', head: true }), // Simplified
      supabase.from('funds').select('collected_amount') // Simplified
    ]);

    if (pCount.error) console.error('Stats pCount Error:', pCount.error);

    res.json({
      totalPatients: pCount.count || 0,
      activeFunds: fCount.count || 0,
      totalCollected: fSum.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0,
      totalDocuments: 0
    });
  } catch (error) {
    console.error('Stats Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Optimized: Get all patients with their funds
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;
    console.log('Fetching patients for admin:', adminId);

    const { data, error } = await supabase
      .from('patients')
      .select(`
        *,
        funds (id, target_amount, collected_amount)
      `)
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch Patients Error:', error);
      throw error;
    }

    // Flatten fund array
    const formatted = (data || []).map(p => ({
      ...p,
      fund: (p.funds && p.funds.length > 0) ? p.funds[0] : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('Patients All Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
