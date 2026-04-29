const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all patients (public)
router.get('/', async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at')
      .order('created_at', { ascending: false });
    if (error) throw error;
    res.json(patients || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID — PUBLIC (safe fields only; full data if admin token provided)
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
    const fields = isAdmin
      ? '*'
      : 'id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at';
    const { data: patient, error } = await supabase
      .from('patients').select(fields).eq('id', req.params.id).single();
    if (error) throw error;
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new patient (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { name, age, gender, blood_type, cancer_type, phone, email, address, doctor_name, hospital } = req.body;
    if (!name || !age) return res.status(400).json({ message: 'Name and age are required' });
    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert([{ name, age, gender, blood_type, cancer_type, phone, email, address, doctor_name, hospital, status: 'in-treatment' }])
      .select();
    if (error) throw error;
    res.status(201).json(newPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update patient (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: updatedPatient, error } = await supabase
      .from('patients').update({ ...req.body, updated_at: new Date() }).eq('id', req.params.id).select();
    if (error) throw error;
    if (!updatedPatient || updatedPatient.length === 0) return res.status(404).json({ message: 'Patient not found' });
    res.json(updatedPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upload patient photo (admin only) — tries Supabase Storage, falls back to base64 in DB
router.post('/:id/photo', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { photo } = req.body;
    if (!photo) return res.status(400).json({ message: 'Photo is required' });

    let photoUrl;
    try {
      const filename = `patient-${req.params.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('patient-photos')
        .upload(filename, Buffer.from(photo, 'base64'), { contentType: 'image/jpeg', upsert: true });
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('patient-photos').getPublicUrl(filename);
      photoUrl = publicUrl;
    } catch (storageErr) {
      // Fallback: store as base64 data URL directly
      photoUrl = `data:image/jpeg;base64,${photo}`;
    }

    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients').update({ photo_url: photoUrl }).eq('id', req.params.id).select();
    if (updateError) throw updateError;
    res.json({ message: 'Photo uploaded successfully', patient: updatedPatient[0] });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get patient photo (public redirect)
router.get('/:id/photo', async (req, res) => {
  try {
    const { data: patient, error } = await supabase.from('patients').select('photo_url').eq('id', req.params.id).single();
    if (error || !patient?.photo_url) return res.status(404).json({ message: 'Photo not found' });
    res.redirect(patient.photo_url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
