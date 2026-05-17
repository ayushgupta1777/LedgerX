const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  customerID: {
    type: String,
    ref: 'Customer',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  reminderDate: {
    type: Date,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  reminderType: {
    type: String,
    enum: ['email', 'sms', 'push', 'followup', 'payment', 'general'],
    default: 'followup'
  },
  userId: {
    type: String,
    ref: 'User',
    required: true
  },
  // Status fields
  isSeen: {
    type: Boolean,
    default: false
  },
  seenAt: {
    type: Date,
    default: null
  },
  isDismissed: {
    type: Boolean,
    default: false
  },
  dismissedAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
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

// Update the updatedAt field before saving
reminderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// const reminderSchema = new mongoose.Schema({
//   customerID: {
//     type: String, // Assuming customerID refers to `_id` of Customer
//     ref: 'Customer',
//     required: true
//   },
//   customerName: {
//     type: String,
//     required: true
//   },
//   reminderDate: {
//     type: Date,
//     required: true
//   },
//   message: {
//     type: String,
//     required: true
//   },
//   isSeen: {
//     type: Boolean,
//     default: false
//   },
//   isDismissed: {
//     type: Boolean,
//     default: false
//   },
//   priority: {
//     type: String,
//     enum: ['low', 'medium', 'high'],
//     default: 'medium'
//   },
//   reminderType: {
//     type: String,
//     enum: ['email', 'sms', 'push', 'followup'],
//     default: 'followup'
//   },

//   phoneNumber: {
//     type: String
//   },
//   userId: {
//     type: String, // Assuming userId refers to `_id` of User
//     ref: 'User',
//     required: true
//   },
//   isActive: {
//     type: Boolean,
//     default: true
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now
//   }
// });

module.exports = mongoose.model('Reminder', reminderSchema);
