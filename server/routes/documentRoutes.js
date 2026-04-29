const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get documents for patient (admin only)
router.get('/patient/:patientId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: documents, error } = await supabase
      .from('documents')
      .select('*')
      .eq('patient_id', req.params.patientId);

    if (error) throw error;

    res.json(documents || []);
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Upload document (admin only)
router.post('/', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { patient_id, document_type, file_name, file_data } = req.body;

    if (!patient_id || !file_name || !file_data) {
      return res.status(400).json({ message: 'Patient ID, file name, and file data are required' });
    }

    const filename = `${patient_id}-${Date.now()}-${file_name}`;

    // Upload to Supabase Storage
    const { error: uploadError } = await supabase
      .storage
      .from('documents')
      .upload(filename, Buffer.from(file_data, 'base64'));

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('documents')
      .getPublicUrl(filename);

    // Save document record
    const { data: newDocument, error: dbError } = await supabase
      .from('documents')
      .insert([{
        patient_id,
        file_name,
        file_url: publicUrl,
        document_type,
        status: 'pending',
        uploaded_by: req.user.id
      }])
      .select();

    if (dbError) throw dbError;

    res.status(201).json(newDocument[0]);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Verify document (admin only)
router.put('/:id/verify', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: updatedDoc, error } = await supabase
      .from('documents')
      .update({ status: 'Verified' })
      .eq('id', req.params.id)
      .select();

    if (error) throw error;

    res.json(updatedDoc[0]);
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Download document (admin only)
router.get('/:id/download', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { data: document, error } = await supabase
      .from('documents')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Redirect to file URL
    res.redirect(document.file_url);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
