const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Admin dashboard stats (admin only)
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Count patients
    const { count: totalPatients, error: patientsError } = await supabase
      .from('patients')
      .select('id', { count: 'exact', head: true });

    if (patientsError) throw patientsError;

    // Count active funds
    const { count: activeFunds, error: fundsError } = await supabase
      .from('funds')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active');

    if (fundsError) throw fundsError;

    // Get total collected
    const { data: fundTotals } = await supabase
      .from('funds')
      .select('collected_amount');

    const totalCollected = fundTotals?.reduce((sum, fund) => sum + (fund.collected_amount || 0), 0) || 0;

    // Count documents
    const { count: totalDocuments, error: docsError } = await supabase
      .from('documents')
      .select('id', { count: 'exact', head: true });

    if (docsError) throw docsError;

    res.json({
      totalPatients: totalPatients || 0,
      activeFunds: activeFunds || 0,
      totalCollected,
      totalDocuments: totalDocuments || 0
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get all patients with funds (admin only)
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Get all patients
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('*');

    if (patientsError) throw patientsError;

    // Get funds for each patient
    const patientsWithFunds = await Promise.all(
      patients.map(async (patient) => {
        const { data: fund } = await supabase
          .from('funds')
          .select('*')
          .eq('patient_id', patient.id)
          .single();

        return { ...patient, fund };
      })
    );

    res.json(patientsWithFunds);
  } catch (error) {
    console.error('Get patients all error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
