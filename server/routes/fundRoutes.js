const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get fund by patient ID
router.get('/patient/:patientId', async (req, res) => {
  try {
    const { data: fund, error } = await supabase.from('funds').select('*').eq('patient_id', req.params.patientId).single();
    if (error && error.code !== 'PGRST116') throw error;
    res.json(fund || null);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update Fund
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: newFund, error } = await supabase.from('funds').insert([req.body]).select();
    if (error) throw error;
    res.status(201).json(newFund[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id, created_at, ...updateData } = req.body;
    const { data: updated, error } = await supabase.from('funds').update(updateData).eq('id', req.params.id).select();
    if (error) throw error;
    res.json(updated[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// QR Code Upload
router.post('/:id/qr', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { photo } = req.body;
    const filename = `qr-${req.params.id}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from('patient-photos').upload(filename, Buffer.from(photo, 'base64'), { contentType: 'image/jpeg' });
    let qrUrl = upErr ? `data:image/jpeg;base64,${photo}` : supabase.storage.from('patient-photos').getPublicUrl(filename).data.publicUrl;
    await supabase.from('funds').update({ qr_code_url: qrUrl }).eq('id', req.params.id);
    res.json({ qrUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
