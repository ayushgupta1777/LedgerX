const express = require('express');
const Transaction = require('../../models/Transaction');
const Customer = require('../../models/Customer');
const { authenticateUser } = require('../../middleware/authentication');
const router = express.Router();

// Simple async handler
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Simple response helper
const ResponseHelper = {
  success: (res, data, message = 'Success', status = 200) => {
    res.status(status).json({
      success: true,
      message,
      data
    });
  },
  notFound: (res, resource = 'Resource') => {
    res.status(404).json({
      success: false,
      message: `${resource} not found`
    });
  },
  error: (res, message = 'Internal server error', status = 500) => {
    res.status(status).json({
      success: false,
      message
    });
  }
};

// Validation middleware
const validateTransactionID = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return ResponseHelper.error(res, 'Invalid transaction ID', 400);
  }
  next();
};

const validateCustomerID = (req, res, next) => {
  const { customerID } = req.params;
  if (!customerID) {
    return ResponseHelper.error(res, 'Customer ID is required', 400);
  }
  next();
};
// Add a new transaction
router.post('/transactions',authenticateUser, async (req, res) => {
  const { customerID, transactionType, amount, receiver, note, date } = req.body;

  try {
    const customer = await Customer.findOne({customerID:customerID});
    if (!customer || customer.userId.toString() !== req.userId) {
      return res.status(404).json({ error: 'Customer not found or unauthorized' });
    }

    const transaction = new Transaction({
      sender: req.ByPhoneNumber,
      receiver,
      customerID,
      transactionType,
      amount,
      note: note || '',
      createdBy: req.userId,
      timestamp: date ? new Date(date) : new Date(),
    });
    await transaction.save();

    res.status(201).json({ message: 'Transaction added successfully', transaction });
  } catch (error) {
    console.error('Transaction error:', error);
    res.status(500).json({ error: 'Failed to add transaction' });
  }
});

// Get transactions for a customer
router.get('/transactions/:customerID', authenticateUser, async (req, res) => { 
  const { customerID } = req.params; 
  try { 
    const customer = await Customer.findOne({customerID:customerID}); 
  if (!customer || customer.userId.toString() !== req.userId) { 
    return res.status(404).json({ error: 'Customer not found or unauthorized' }); 
  } 
    const transactions = await Transaction.find({customerID:customerID});
    res.json(transactions); 
  } 
    catch (error) { console.error('Fetch transactions error:', error); 
      res.status(500).json({ error: 'Failed to fetch transactions' }); 
    } });

router.get('/customers/:customerID', authenticateUser, async(req, res) => {
  const { customerID } = req.params; // Extract customerID from the route
  // const customer = customer.find((c) => c.customerID === customerID);
  const customer = await Customer.findOne({customerID:customerID});
  // findOne({id: id});
if (!customer || customer.userId.toString() !== req.userId) {
  return res.status(404).json({ error: 'Customer not found or unauthorized' });
}

  if (!customer) {
    return res.status(404).json({ error: 'Customer not found' }); // Respond with 404 if not found
  }

  res.json(customer); // Respond with the customer details
});


router.put('/transactions/:id', 
  validateTransactionID,
  authenticateUser, 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { amount, transactionType, note, date, customerID } = req.body;
    
    const existingTransaction = await Transaction.findById(id);
    if (!existingTransaction) {
      return ResponseHelper.notFound(res, 'Transaction');
    }
    
    // Build update object
    const updateData = {
      updatedAt: new Date(),
      updatedBy: req.userId
    };
    
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (transactionType) updateData.transactionType = transactionType.toLowerCase();
    if (note !== undefined) updateData.note = note;
    if (date) updateData.timestamp = new Date(date);

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      id, 
      updateData, 
      { 
        new: true, 
        runValidators: true 
      }
    );
    
    // Recalculate balance if amount or type changed
    if (customerID && (amount !== undefined || transactionType)) {
      await recalculateCustomerBalance(customerID);
    }
    
    ResponseHelper.success(res, updatedTransaction, 'Transaction updated successfully');
  })
);

// DELETE /api/transactions/:id - Delete transaction
router.delete('/transactions/:id', 
  validateTransactionID,
  authenticateUser, 
  asyncHandler(async (req, res) => {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return ResponseHelper.notFound(res, 'Transaction');
    }
    
    const customerID = transaction.customerID;
    
    await Transaction.findByIdAndDelete(id);
    
    // Recalculate customer balance after deletion
    await recalculateCustomerBalance(customerID);
    
    ResponseHelper.success(res, { deletedId: id }, 'Transaction deleted successfully');
  })
);

// GET /api/transactions/:customerID/balance - Get current balance calculation
router.get('/transactions/:customerID/balance', 
  validateCustomerID,
  authenticateUser, 
  asyncHandler(async (req, res) => {
    const { customerID } = req.params;
    
    const customer = await Customer.findOne({customerID});
    if (!customer || customer.userId.toString() !== req.userId) {
      return ResponseHelper.notFound(res, 'Customer');
    }
    
    const transactions = await Transaction.find({ customerID });
    
    let runningBalance = 0;
    const transactionSummary = {
      totalReceived: 0,
      totalGiven: 0,
      transactionCount: transactions.length
    };
    
    transactions.forEach((txn) => {
      if (txn.transactionType === 'receive') {
        runningBalance += txn.amount;
        transactionSummary.totalReceived += txn.amount;
      } else {
        runningBalance -= txn.amount;
        transactionSummary.totalGiven += txn.amount;
      }
    });
    
    const finalBalance = Math.abs(runningBalance);
    const balanceType = runningBalance > 0 ? 'Advance' : runningBalance < 0 ? 'Due' : 'Settled';
    
    ResponseHelper.success(res, {
      balance: finalBalance,
      balanceType,
      rawBalance: runningBalance,
      ...transactionSummary
    }, 'Balance calculated successfully');
  })
);

// Helper function to recalculate customer balance
const recalculateCustomerBalance = async (customerID) => {
  try {
    const transactions = await Transaction.find({ customerID });
    
    let balance = 0;
    transactions.forEach((txn) => {
      balance += txn.transactionType === 'receive' ? txn.amount : -txn.amount;
    });
    
    const finalBalance = Math.abs(balance);
    const balanceType = balance > 0 ? 'Advance' : balance < 0 ? 'Due' : 'Settled';
    
    await Customer.findOneAndUpdate(
      { customerID },
      { 
        balance: finalBalance, 
        balanceType: balanceType,
        updatedAt: new Date()
      },
      { upsert: false }
    );
    
    return { balance: finalBalance, balanceType };
  } catch (error) {
    console.error('Error recalculating customer balance:', error);
    throw new Error('Failed to recalculate balance');
  }
};

module.exports = router;
