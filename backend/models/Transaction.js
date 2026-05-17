const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  sender: { type: String, ref: 'User', required: true },
  receiver: { type: String, ref: 'User', required: true },
  customerID: { type: String, ref: 'Customer', required: true },
  transactionType: { type: String, enum: ['receive', 'give'], required: true },
  amount: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  createdBy: { type: String, ref: 'User', required: true },
  updatedBy: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
});

module.exports = mongoose.model('Transaction', TransactionSchema);