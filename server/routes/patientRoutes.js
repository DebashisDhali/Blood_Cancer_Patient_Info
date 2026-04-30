const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');
const { cacheMiddleware, clearCache } = require('../middleware/cache');

// Optimized: Get all patients with funds in ONE query
router.get('/', cacheMiddleware(60), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select(`
        id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at, admission_date, chemo_total, chemo_completed,
        fund:funds(*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const formatted = data.map(p => ({
      ...p,
      fund: p.fund ? p.fund[0] : null
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID
router.get('/:id', async (req, res) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    let isAdmin = false;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        isAdmin = ['admin', 'super_admin'].includes(decoded.role);
      } catch (e) {}
    }
    const fields = isAdmin ? `*, fund:funds(*)` : `id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at, admission_date, chemo_total, chemo_completed, fund:funds(*)`;
    const { data: patient, error } = await supabase.from('patients').select(fields).eq('id', req.params.id).single();
    if (error) throw error;
    
    // Flatten fund
    if (patient && patient.fund) patient.fund = patient.fund[0];
    
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create/Update Logic
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: newPatient, error } = await supabase.from('patients').insert([req.body]).select();
    if (error) throw error;
    clearCache('patients');
    res.status(201).json(newPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { created_at, id, ...updateData } = req.body;
    updateData.updated_at = new Date();
    const { data: updatedPatient, error } = await supabase.from('patients').update(updateData).eq('id', req.params.id).select();
    if (error) throw error;
    clearCache('patients');
    res.json(updatedPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Patient
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('patients').delete().eq('id', req.params.id);
    if (error) throw error;
    clearCache('patients');
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Photo upload
router.post('/:id/photo', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { photo } = req.body;
    const filename = `patient-${req.params.id}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from('patient-photos').upload(filename, Buffer.from(photo, 'base64'), { contentType: 'image/jpeg' });
    let photoUrl = upErr ? `data:image/jpeg;base64,${photo}` : supabase.storage.from('patient-photos').getPublicUrl(filename).data.publicUrl;
    await supabase.from('patients').update({ photo_url: photoUrl }).eq('id', req.params.id);
    res.json({ photoUrl });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Student ID upload
router.post('/:id/student-id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { image } = req.body;
    const filename = `sid-${req.params.id}-${Date.now()}.png`;
    const { error: upErr } = await supabase.storage.from('patient-photos').upload(filename, Buffer.from(image, 'base64'), { contentType: 'image/png', upsert: true });
    if (upErr) throw upErr;
    const url = supabase.storage.from('patient-photos').getPublicUrl(filename).data.publicUrl;
    await supabase.from('patients').update({ student_id_url: url }).eq('id', req.params.id);
    res.json({ url });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = router;
