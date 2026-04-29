const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  bloodType: {
    type: String,
    required: true
  },
  diagnosisDate: {
    type: Date,
    required: true
  },
  cancerType: {
    type: String,
    required: true
  },
  chemoStartDate: {
    type: Date
  },
  chemoEndDate: {
    type: Date
  },
  chemoSessions: {
    total: { type: Number, default: 0 },
    completed: { type: Number, default: 0 }
  },
  status: {
    type: String,
    enum: ['Active', 'In Treatment', 'Recovery', 'Monitoring'],
    default: 'In Treatment'
  },
  photo: {
    data: Buffer,
    contentType: String
  },
  doctor: {
    name: String,
    hospital: String,
    phone: String
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Patient', patientSchema);
