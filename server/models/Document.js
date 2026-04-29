const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  documentType: {
    type: String,
    enum: ['Medical Report', 'Lab Test', 'Prescription', 'Hospital Receipt', 'Insurance', 'Other'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  fileData: Buffer,
  fileName: String,
  fileType: String,
  fileSize: Number,
  uploadedBy: {
    type: String,
    default: 'Admin'
  },
  status: {
    type: String,
    enum: ['Pending', 'Verified', 'Expired'],
    default: 'Pending'
  },
  expiryDate: Date,
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Document', documentSchema);
