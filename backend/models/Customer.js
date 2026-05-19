const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  customerID: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  ByPhoneNumber: { type:Number, required:true },
  userId: { type: String, ref: 'User', required: true },
  profileImage: {  type: String },
    address: { type: String, default: '' },

  images: [  
    {  
        image: { type: String, required: true },  
        timestamp: { type: Date, default: Date.now, required: true },  
        senderYou: { type: String, required: true }, // e.g., 'Credit Card', 'Bank Transfer'  
    },  
],
  // images: [{ type: String, timestamp: { type: Date, default: Date.now } }], 
  documents: [{ url: String, timestamp: { type: Date, default: Date.now } }],
  balance: { type: Number, default: 0 },
balanceType: { type: String, enum: ['Advance', 'Due'], default: 'Advance' }

});

// Index for fast relational lookup
customerSchema.index({ userId: 1 });

module.exports = mongoose.model('Customer', customerSchema);
