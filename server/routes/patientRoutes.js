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
        id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, phone, address, created_at, admission_date, chemo_total, chemo_completed, dept, batch, session, student_id_url,
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
    const fields = isAdmin ? `*, fund:funds(*)` : `id, name, age, gender, blood_type, cancer_type, photo_url, status, doctor_name, hospital, phone, address, created_at, admission_date, chemo_total, chemo_completed, dept, batch, session, student_id_url, fund:funds(*)`;
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
    const adminId = req.user.id || req.user.userId;
    
    console.log('Attaching admin_id:', adminId);

    // Insert Patient with explicit admin_id
    const { data: newPatient, error: pErr } = await supabase
      .from('patients')
      .insert([{ ...patientData, admin_id: adminId }])
      .select();

    if (pErr) {
      console.error('Patient Insert Error:', pErr);
      throw pErr;
    }

    if (!newPatient || newPatient.length === 0) {
      throw new Error('Patient created but Supabase returned no data. Check RLS.');
    }

    const pid = newPatient[0].id;

    // Insert Fund if provided
    if (fund) {
      const { error: fErr } = await supabase.from('funds').insert([{ ...fund, patient_id: pid }]);
      if (fErr) {
        console.error('Fund Insert Error:', fErr);
        throw fErr;
      }
    }

    clearCache('patients');
    res.status(201).json(newPatient[0]);
  } catch (error) {
    console.error('Create Patient Route Error:', error);
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fund, created_at, id, ...patientData } = req.body;
    
    // Verify ownership or allow update if admin_id is missing/broken
    const { data: checkOwnership } = await supabase.from('patients').select('admin_id').eq('id', req.params.id).single();
    const currentAdminId = req.user.id || req.user.userId;
    
    // Auto-fix logic: If current admin_id is NULL or "undefined", let the current user take ownership
    const isBrokenId = !checkOwnership || !checkOwnership.admin_id || checkOwnership.admin_id === 'undefined';
    const isOwner = checkOwnership && checkOwnership.admin_id === currentAdminId;
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isSuperAdmin && !isOwner && !isBrokenId) {
      return res.status(403).json({ message: 'Unauthorized: You can only edit patients you have added' });
    }

    // Attach current admin_id to ensure it's fixed in the DB
    const finalData = { ...patientData, admin_id: currentAdminId };

    const { data: updatedPatient, error: pErr } = await supabase.from('patients').update(finalData).eq('id', req.params.id).select();
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
    // Verify ownership or allow Super Admin
    const { data: checkOwnership } = await supabase.from('patients').select('admin_id').eq('id', req.params.id).single();
    const currentAdminId = req.user.id || req.user.userId;
    const isOwner = checkOwnership && checkOwnership.admin_id === currentAdminId;
    const isSuperAdmin = req.user.role === 'super_admin';

    if (!isSuperAdmin && !isOwner) {
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
