const mongoose = require('mongoose');

// ✅ FLEXIBLE SCHEMA: Accepts both String and Number for sender
// This allows gradual migration without breaking existing data
const ChatSchema = new mongoose.Schema({
  sender: { 
    type: mongoose.Schema.Types.Mixed, // ✅ Accepts both String and Number
    ref: 'User', 
    required: true 
  },
  receiver: { type: String, ref: 'User', required: true },
  customerID: { type: String, ref: 'Customer', required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  senderYou: { type: String, required: true },
  isRead: { type: Boolean, default: false },
});

// ✅ Virtual getter to always return sender as string
ChatSchema.virtual('senderString').get(function() {
  return String(this.sender);
});

// ✅ Pre-save hook to normalize sender to string
ChatSchema.pre('save', function(next) {
  if (this.sender !== undefined && this.sender !== null) {
    this.sender = String(this.sender);
  }
  next();
});

// Add indexes for better query performance
ChatSchema.index({ sender: 1, receiver: 1, timestamp: -1 });
ChatSchema.index({ receiver: 1, isRead: 1 });
ChatSchema.index({ customerID: 1 });

// Configure to include virtuals in JSON/Object output
ChatSchema.set('toJSON', { virtuals: true });
ChatSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Chat', ChatSchema);