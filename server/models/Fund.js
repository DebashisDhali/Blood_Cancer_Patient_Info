const mongoose = require('mongoose');

const fundSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  targetAmount: {
    type: Number,
    required: true
  },
  collectedAmount: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'BDT'
  },
  description: {
    type: String
  },
  donors: [{
    name: String,
    email: String,
    amount: Number,
    date: { type: Date, default: Date.now },
    message: String
  }],
  expenses: [{
    category: String,
    amount: Number,
    description: String,
    date: { type: Date, default: Date.now },
    recieptImage: Buffer
  }],
  status: {
    type: String,
    enum: ['Active', 'Completed', 'On Hold'],
    default: 'Active'
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

module.exports = mongoose.model('Fund', fundSchema);
