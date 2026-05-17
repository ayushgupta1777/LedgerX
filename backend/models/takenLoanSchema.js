const mongoose = require('mongoose');

const takenLoanSchema = new mongoose.Schema({
  lenderID: {
    type: String,
    required: true,
    ref: 'Lender',
  },
  takenBy: { // User ID of the person who took the loan
    type: String,
    required: true,
  },
  borrowedBy: { // Phone number of the person who took the loan
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'defaulted', 'paused', 'closed'],
    default: 'active',
  },
  closedDate: {
    type: Date,
    default: null,
  },
  loanDetails: {
    loanType: {
      type: String,
      required: true,
      enum: ['With Interest', 'EMI Collection', 'Without Interest'],
    },
    method: {
      type: String,
      required: true,
      enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI'],
    },
    amount: {
      type: Number,
      required: true,
    },
    interestRate: {
      type: Number,
      required: true,
    },
    interestFrequency: {
      type: String,
      required: true,
      enum: ['Daily', 'Weekly', '15 Days', 'Monthly', 'Quarterly', 'Half-Yearly', 'Yearly'],
    },
    compoundInterest: {
      enabled: { type: Boolean, required: true },
      frequency: { 
        type: String,
       required: function () { return this.loanDetails.compoundInterest.enabled } 
      }
    },
    startDate: {
      type: Date,
      required: true,
    },
    interestStartDate: {
      type: Date,
      default: Date.now,
    },
    interestStopped: {
      type: Boolean,
      default: false,
    },
    interestStoppedDate: {
      type: Date,
      default: null,
    },
    attachments: [{
      type: String,
    }],
    signature: [{
      path: String,
      date: {
        type: Date,
        default: Date.now,
      },
    }],
    remarks: {
      type: String,
      default: '',
    },
    billNo: {
      type: String,
      default: function() {
        return `TL-${Date.now()}`;
      },
    },
    
    // Calculated fields
    accruedInterest: {
      type: Number,
      default: 0,
    },
    totalInterest: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      default: function() {
        return this.amount;
      },
    },
    remainingPrincipal: {
      type: Number,
      default: function() {
        return this.amount;
      },
    },
    
    // Transaction histories
    topUpHistory: [{
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      method: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI'],
        default: 'Cash',
      },
      topupinterestrate: {
        type: Number,
        default: 0,
      },
    }],
    
    repaymentHistory: [{
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      method: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI'],
        default: 'Cash',
      },
    }],

     interestPaymentHistory: [{
      amount: {
        type: Number,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
      method: {
        type: String,
        enum: ['Cash', 'Bank Transfer', 'Credit Card', 'UPI'],
        default: 'Cash',
      },
      paidInterest: {
        type: Number,
        default: 0,
      }
    }],
    
    topUpTotal: {
      type: Number,
      default: 0,
    },
    repaymentTotal: {
      type: Number,
      default: 0,
    },
    paidInterestTotal: {
      type: Number,
      default: 0,
    },
  },
}, {
  timestamps: true,
});

// Compound index to ensure one active loan per lender per borrower
takenLoanSchema.index({ lenderID: 1, takenBy: 1 }, { unique: true });

module.exports = mongoose.model('TakenLoan', takenLoanSchema);