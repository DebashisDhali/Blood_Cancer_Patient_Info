const express = require('express');
const router = express.Router();
const supabase = require('../config/supabaseClient');
const { authMiddleware, adminOnly } = require('../middleware/auth');

// Get documents for a patient
router.get('/patient/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('patient_id', req.params.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Upload document
router.post('/:patientId', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { title, document_type, file } = req.body; // file is base64
    const { patientId } = req.params;

    // Detect content type from title extension
    const ext = (title || '').split('.').pop().toLowerCase();
    const mimeMap = { pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png' };
    const contentType = mimeMap[ext] || 'application/pdf';
    const filename = `doc-${patientId}-${Date.now()}.${ext || 'pdf'}`;

    const { error: upErr } = await supabase.storage
      .from('patient-documents')
      .upload(filename, Buffer.from(file, 'base64'), { contentType, upsert: true });

    if (upErr) throw upErr;

    const fileUrl = supabase.storage.from('patient-documents').getPublicUrl(filename).data.publicUrl;

    const { data, error } = await supabase
      .from('documents')
      .insert([{ patient_id: patientId, title, document_type, file_url: fileUrl }])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete document
router.delete('/:id', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { error } = await supabase.from('documents').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
