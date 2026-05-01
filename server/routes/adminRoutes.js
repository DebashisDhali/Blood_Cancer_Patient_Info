const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Middleware to restrict to super_admin only
const superAdminOnly = (req, res, next) => {
  if (req.user.role !== 'super_admin') {
    return res.status(403).json({ message: 'Access denied: Super Admin only' });
  }
  next();
};

// Get Dashboard Stats
router.get('/stats', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const isSuperAdmin = req.user.role === 'super_admin';

    let pCountRes;
    if (isSuperAdmin) {
      pCountRes = await supabase.from('patients').select('id', { count: 'exact' });
    } else {
      pCountRes = await supabase.from('patients').select('id', { count: 'exact' }).eq('admin_id', adminId);
    }
    const fCountRes = await supabase.from('funds').select('id', { count: 'exact' });
    const fSumRes = await supabase.from('funds').select('collected_amount');

    const totalCollected = fSumRes.data?.reduce((sum, f) => sum + (f.collected_amount || 0), 0) || 0;

    res.json({
      totalPatients: pCountRes.count || 0,
      activeFunds: fCountRes.count || 0,
      totalCollected: totalCollected,
      totalDocuments: 0
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all patients (super admin gets ALL, regular admin gets own)
router.get('/patients/all', authMiddleware, adminOnly, async (req, res) => {
  try {
    const adminId = req.user.id || req.user.userId;
    const isSuperAdmin = req.user.role === 'super_admin';

    let query = supabase.from('patients').select('*, funds(id, target_amount, collected_amount)').order('created_at', { ascending: false });
    if (!isSuperAdmin) {
      console.log('Regular admin fetching own patients for adminId:', adminId);
      query = query.eq('admin_id', adminId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }
    console.log('Patients fetched:', data?.length);

    const formatted = (data || []).map(p => ({
      ...p,
      fund: (p.funds && p.funds.length > 0) ? p.funds[0] : null
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ── SUPER ADMIN ROUTES ──────────────────────────────────

// List all admins
router.get('/admins', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('admins')
      .select('id, username, email, role, is_verified, created_at')
      .eq('role', 'admin')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete an admin (super admin only, cannot delete self)
router.delete('/admins/:id', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const superAdminId = req.user.id || req.user.userId;
    if (req.params.id === superAdminId) {
      return res.status(400).json({ message: 'You cannot delete your own account here.' });
    }
    const { error } = await supabase.from('admins').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Admin removed successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle admin verified status
router.patch('/admins/:id/verify', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { is_verified } = req.body;
    const { data, error } = await supabase
      .from('admins')
      .update({ is_verified })
      .eq('id', req.params.id)
      .select('id, username, email, is_verified')
      .single();
    if (error) throw error;
    res.json({ message: `Admin ${is_verified ? 'verified' : 'suspended'}.`, admin: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Change admin role
router.patch('/admins/:id/role', authMiddleware, superAdminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!['admin', 'super_admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role.' });
    }
    const { data, error } = await supabase
      .from('admins')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, username, email, role')
      .single();
    if (error) throw error;
    res.json({ message: `Role updated to ${role}.`, admin: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
