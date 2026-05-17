// models/loans/lenderSchema.js
const mongoose = require('mongoose');

const lenderSchema = new mongoose.Schema({
  lenderID: {
    type: String,
    required: true,
    unique: true,
  },
  FirstName: {
    type: String,
    required: true,
  },
  LastName: {
    type: String,
    default: '',
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    default: '',
  },
  profileImage: {
    type: String,
    default: '',
  },
  borrowedBy: { // The phone number of the person who borrowed from this lender
    type: String,
    required: true,
  },
  userId: { // The user ID of the person who borrowed
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active',
  },
  closedDate: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

// Compound index to ensure one lender per phone number per borrower
lenderSchema.index({ phoneNumber: 1, borrowedBy: 1 }, { unique: true });

module.exports = mongoose.model('Lender', lenderSchema);