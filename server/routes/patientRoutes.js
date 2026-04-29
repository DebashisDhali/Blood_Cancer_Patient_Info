const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get all patients (public - masked data)
router.get('/', async (req, res) => {
  try {
    const { data: patients, error } = await supabase
      .from('patients')
      .select('id, name, age, gender, blood_type, cancer_type, photo_url, status, created_at');

    if (error) throw error;
    
    res.json(patients || []);
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get patient by ID (admin only - full data)
router.get('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create new patient (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const {
      name, age, gender, blood_type, cancer_type, 
      phone, email, address, doctor_name, hospital
    } = req.body;

    if (!name || !age) {
      return res.status(400).json({ message: 'Name and age are required' });
    }

    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert([{
        name,
        age,
        gender,
        blood_type,
        cancer_type,
        phone,
        email,
        address,
        doctor_name,
        hospital,
        status: 'in-treatment'
      }])
      .select();

    if (error) throw error;
    
    res.status(201).json(newPatient[0]);
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update patient (admin only)
router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({
        ...req.body,
        updated_at: new Date()
      })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;
    if (!updatedPatient || updatedPatient.length === 0) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    res.json(updatedPatient[0]);
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Upload patient photo (admin only)
router.post('/:id/photo', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { photo } = req.body;

    if (!photo) {
      return res.status(400).json({ message: 'Photo is required' });
    }

    const filename = `patient-${req.params.id}-${Date.now()}.jpg`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('patients')
      .upload(filename, Buffer.from(photo, 'base64'), {
        contentType: 'image/jpeg'
      });

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('patients')
      .getPublicUrl(filename);

    // Update patient with photo URL
    const { data: updatedPatient, error: updateError } = await supabase
      .from('patients')
      .update({ photo_url: publicUrl })
      .eq('id', req.params.id)
      .select();

    if (updateError) throw updateError;

    res.json({ message: 'Photo uploaded successfully', patient: updatedPatient[0] });
  } catch (error) {
    console.error('Upload photo error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Get patient photo (public)
router.get('/:id/photo', async (req, res) => {
  try {
    const { data: patient, error } = await supabase
      .from('patients')
      .select('photo_url')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!patient || !patient.photo_url) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Redirect to public URL
    res.redirect(patient.photo_url);
  } catch (error) {
    console.error('Get photo error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
