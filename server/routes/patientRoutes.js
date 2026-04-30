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
        id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at, admission_date, chemo_total, chemo_completed, dept, batch, session, student_id_url,
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
    const fields = isAdmin ? `*, fund:funds(*)` : `id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, created_at, admission_date, chemo_total, chemo_completed, dept, batch, session, student_id_url, fund:funds(*)`;
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
    const { fund, ...patientData } = req.body;
    
    // Insert Patient with admin_id
    patientData.admin_id = req.user.id;
    const { data: newPatient, error: pErr } = await supabase.from('patients').insert([patientData]).select();
    if (pErr) throw pErr;
    const pid = newPatient[0].id;

    // Insert Fund if provided
    if (fund) {
      const { error: fErr } = await supabase.from('funds').insert([{ ...fund, patient_id: pid }]);
      if (fErr) throw fErr;
    }

    clearCache('patients');
    res.status(201).json(newPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fund, created_at, id, ...patientData } = req.body;
    
    // Verify ownership and Update Patient
    const { data: checkOwnership } = await supabase.from('patients').select('admin_id').eq('id', req.params.id).single();
    if (!checkOwnership || checkOwnership.admin_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit patients you have added' });
    }

    const { data: updatedPatient, error: pErr } = await supabase.from('patients').update(patientData).eq('id', req.params.id).select();
    if (pErr) throw pErr;

    // Update Fund if provided
    if (fund) {
      const { data: existingFund } = await supabase.from('funds').select('id').eq('patient_id', req.params.id).single();
      if (existingFund) {
        const { error: fErr } = await supabase.from('funds').update(fund).eq('id', existingFund.id);
        if (fErr) throw fErr;
      } else {
        const { error: fErr } = await supabase.from('funds').insert([{ ...fund, patient_id: req.params.id }]);
        if (fErr) throw fErr;
      }
    }

    clearCache('patients');
    res.json(updatedPatient[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete Patient
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    // Verify ownership before deleting
    const { data: checkOwnership } = await supabase.from('patients').select('admin_id').eq('id', req.params.id).single();
    if (!checkOwnership || checkOwnership.admin_id !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete patients you have added' });
    }

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
    const { image } = req.body;
    const filename = `patient-${req.params.id}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage.from('patient-photos').upload(filename, Buffer.from(image, 'base64'), { contentType: 'image/jpeg', upsert: true });
    if (upErr) throw upErr;
    const photoUrl = supabase.storage.from('patient-photos').getPublicUrl(filename).data.publicUrl;
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

// QR Code upload (Dynamic for Bank, bKash, Nagad)
router.post('/:id/qr', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { image, type } = req.body; // type should be 'bank', 'bkash', or 'nagad'
    if (!['bank', 'bkash', 'nagad'].includes(type)) throw new Error('Invalid QR type');

    const filename = `${type}-qr-${req.params.id}-${Date.now()}.png`;
    const { error: upErr } = await supabase.storage.from('patient-photos').upload(filename, Buffer.from(image, 'base64'), { contentType: 'image/png', upsert: true });
    if (upErr) throw upErr;
    
    const url = supabase.storage.from('patient-photos').getPublicUrl(filename).data.publicUrl;
    const updateField = `${type}_qr_url`;
    
    await supabase.from('funds').update({ [updateField]: url }).eq('patient_id', req.params.id);
    res.json({ url });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = router;
