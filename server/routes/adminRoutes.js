const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get Dashboard Stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;
    console.log('[DEBUG] Stats requested for Admin ID:', adminId);

    const [pCount, fCount, fSum] = await Promise.all([
      supabase.from('patients').select('*', { count: 'exact', head: true }).eq('admin_id', adminId),
      supabase.from('funds').select('id', { count: 'exact', head: true }),
      supabase.from('funds').select('collected_amount')
    ]);

    console.log(`[DEBUG] Found ${pCount.count} patients for this admin.`);

    res.json({
      totalPatients: pCount.count || 0,
      activeFunds: fCount.count || 0,
      totalCollected: fSum.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0,
      totalDocuments: 0
    });
  } catch (error) {
    console.error('[CRITICAL] Stats Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Optimized: Get all patients
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id;
    console.log('[DEBUG] Fetching patients list for Admin ID:', adminId);

    const { data, error } = await supabase
      .from('patients')
      .select('*, funds(id, target_amount, collected_amount)')
      .eq('admin_id', adminId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[DEBUG] Supabase Error:', error);
      throw error;
    }

    console.log(`[DEBUG] Query returned ${data?.length || 0} rows.`);

    const formatted = (data || []).map(p => ({
      ...p,
      fund: (p.funds && p.funds.length > 0) ? p.funds[0] : null
    }));

    res.json(formatted);
  } catch (error) {
    console.error('[CRITICAL] Patients All Route Error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
