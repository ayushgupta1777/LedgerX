const express = require('express');
const multer = require('multer');
const TakenLoan = require('../../models/takenLoanSchema');
const Lender = require('../../models/lenderSchema');
const path = require('path');
const fs = require('fs');
const { authenticateUser } = require('../../middleware/authentication');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();
const upload = require("../dbs/multerConfig");
// Create uploads directory if it doesn't exist
// const uploadDirectory = './uploads/';
// if (!fs.existsSync(uploadDirectory)) {
//   fs.mkdirSync(uploadDirectory);
// }

// // Multer setup for file uploads
// const storage = multer.diskStorage({
//   destination: uploadDirectory,
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
//   },
// });

// const upload = multer({ storage: storage });

// Add lender first, then taken loan
router.post('/add-lender', authenticateUser, async (req, res) => {
  const { lenderName, lenderPhone, lenderAddress } = req.body;

  try {
    // Check if lender already exists
    const existingLender = await Lender.findOne({ 
      phoneNumber: lenderPhone,
      borrowedBy: req.ByPhoneNumber 
    });

    let message = 'Lender added successfully';
    let lender;

    if (existingLender) {
      message = 'Lender with this phone number already exists';
      lender = existingLender;
    } else {
      // Create a new lender
      lender = await Lender.create({
        lenderID: uuidv4(),
        FirstName: lenderName.split(' ')[0] || '',
        LastName: lenderName.split(' ').slice(1).join(' ') || '',
        phoneNumber: lenderPhone,
        address: lenderAddress || '',
        borrowedBy: req.ByPhoneNumber,
        userId: req.userId,
      });
    }

    res.status(201).json({
      message,
      lender,
      lenderID: lender.lenderID || lender._id,
    });
  } catch (error) {
    console.error('Error adding lender:', error);
    res.status(500).json({ message: 'Error adding lender', error: error.message });
  }
});

// Take loan from lender
router.post('/take-loan/:lenderID?', authenticateUser, upload.single('attachments'), async (req, res) => {
  const { lenderID } = req.params;
  const {
    loanType,
    method,
    amount,
    interestRate,
    interestFrequency,
    compoundInterest,
    compoundFrequency,
    startDate,
    remarks,
    lenderName,
    lenderPhone,
    lenderAddress
  } = req.body;

  try {
    let lender;

    if (lenderID) {
      // Find existing lender
      lender = await Lender.findOne({ 
        lenderID: lenderID,
        borrowedBy: req.ByPhoneNumber 
      });
      if (!lender) {
        return res.status(404).json({ message: 'Lender not found' });
      }
    } else {
      // Create new lender
      const existingLender = await Lender.findOne({ 
        phoneNumber: lenderPhone,
        borrowedBy: req.ByPhoneNumber 
      });

      if (existingLender) {
        lender = existingLender;
      } else {
        lender = await Lender.create({
          lenderID: uuidv4(),
          FirstName: lenderName.split(' ')[0] || '',
          LastName: lenderName.split(' ').slice(1).join(' ') || '',
          phoneNumber: lenderPhone,
          address: lenderAddress || '',
          borrowedBy: req.ByPhoneNumber,
          userId: req.userId,
        });
      }
    }

    // Check if loan already exists for this lender
    const existingTakenLoan = await TakenLoan.findOne({ 
      lenderID: lender.lenderID,
      takenBy: req.userId 
    });
    if (existingTakenLoan) {
      return res.status(400).json({ message: 'Loan already exists from this lender.' });
    }

    // Validate required fields
    if (!loanType || !amount || !interestRate || !interestFrequency || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const isCompoundInterest = compoundInterest === 'true' || compoundInterest === true;

    // Create a new taken loan
    const takenLoan = await TakenLoan.create({
      lenderID: lender.lenderID,
      takenBy: req.userId,
      borrowedBy: req.ByPhoneNumber,
      loanDetails: {
        loanType,
        method,
        amount: parseFloat(amount),
        interestRate: parseFloat(interestRate),
        interestStartDate: new Date(),
        interestFrequency,
        compoundInterest: {
          enabled: isCompoundInterest,
          frequency: isCompoundInterest ? compoundFrequency : null,
        },
        startDate,
        attachments: req.file ? [`/uploads/${req.file.filename}`] : [],
        remarks,
        billNo: `TL-${Date.now()}`, // Generate bill number for taken loan
        status: 'active',
        // Initialize calculation fields
        accruedInterest: 0,
        totalAmount: parseFloat(amount),
        topUpHistory: [],
        repaymentHistory: [],
        topUpTotal: 0,
        remainingPrincipal: parseFloat(amount),
      },
    });

    res.status(201).json({ 
      message: 'Loan taken successfully', 
      takenLoan,
      lenderID: lender.lenderID 
    });
  } catch (error) {
    console.error('Error taking loan:', error);
    res.status(500).json({ message: 'Error taking loan', error: error.message });
  }
});

// Get taken loan profile
router.get('/taken-loan-profile/:lenderID', authenticateUser, async (req, res) => {
  const { lenderID } = req.params;

  try {
    const takenLoan = await TakenLoan.findOne({ 
      lenderID: lenderID, 
      takenBy: req.userId 
    });
    
    if (!takenLoan) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this loan' });
    }
    
    res.json(takenLoan);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get lender profile
router.get('/lender-profile/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const borrowedBy = req.ByPhoneNumber;

    const lender = await Lender.findOne({ 
      lenderID, 
      borrowedBy: borrowedBy 
    });

    if (!lender) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this lender' });
    }

    res.json(lender);
  } catch (error) {
    console.error('Error fetching lender profile:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Get all taken loans
router.get('/taken-loans', authenticateUser, async (req, res) => {
  try {
    const takenLoans = await TakenLoan.find({ takenBy: req.userId }).sort({ createdAt: -1 });
    const lenders = await Lender.find({ borrowedBy: req.ByPhoneNumber }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: takenLoans,
      lenders: lenders,
    });
  } catch (error) {
    console.error('Error fetching taken loans:', error);
    res.status(500).json({ success: false, message: 'Error fetching taken loans', error });
  }
});

// Make repayment on taken loan
router.put('/make-repayment/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { amount, date, method } = req.body;
    const takenLoan = await TakenLoan.findOne({ 
      lenderID: req.params.lenderID,
      takenBy: req.userId 
    });

    if (!takenLoan) {
      return res.status(404).json({ message: 'Taken loan not found' });
    }

    takenLoan.loanDetails.repaymentHistory.push({ 
      amount: parseFloat(amount), 
      date, 
      method 
    });

    await takenLoan.save();

    res.json({ message: 'Repayment added successfully', takenLoan });
  } catch (error) {
    console.error('Error processing repayment:', error);
    res.status(500).json({ message: 'Error processing repayment', error });
  }
});

// Get additional loan (like top-up for borrowed money)
router.put('/additional-loan/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { amount, date, method, interestRate } = req.body;
    const takenLoan = await TakenLoan.findOne({
      lenderID: req.params.lenderID,
      takenBy: req.userId
    });

    if (!takenLoan) {
      return res.status(404).json({ message: 'Taken loan not found' });
    }

    if (!takenLoan.loanDetails.topUpHistory) {
      takenLoan.loanDetails.topUpHistory = [];
    }

    takenLoan.loanDetails.topUpHistory.push({
      amount: parseFloat(amount),
      date,
      method,
      topupinterestrate: parseFloat(interestRate) || takenLoan.loanDetails.interestRate
    });

    await takenLoan.save();

    res.json({ message: 'Additional loan amount added successfully', takenLoan });
  } catch (error) {
    console.error('Error adding additional loan:', error);
    res.status(500).json({ message: 'Error adding additional loan', error: error.message });
  }
});

// Interest calculation for taken loans (similar to given loans but reversed perspective)
function calculateTakenLoanInterest(
  principal,
  interestRate,
  frequency,
  startDate,
  topUpHistory = [],
  repaymentHistory = [],
   interestPaymentHistory = [],
  endDate = new Date()
) {
  const loanStartDate = new Date(startDate);
  const calculationEndDate = new Date(endDate);
  
  const getDaysInPeriod = (frequency) => {
    switch (frequency) {
      case 'Daily': return 1;
      case 'Weekly': return 7;
      case '15 Days': return 15;
      case 'Monthly': return 30;
      case 'Quarterly': return 90;
      case 'Half-Yearly': return 180;
      case 'Yearly': return 365;
      default: return 30;
    }
  };
  
  const daysInPeriod = getDaysInPeriod(frequency);
  const dailyRate = interestRate / 100 / daysInPeriod;
  
  let currentPrincipal = principal;
  let totalInterest = 0;
  let currentDate = new Date(loanStartDate);
  let interestAccrued = 0;
  
  const events = [
    ...topUpHistory.map(event => ({
      date: new Date(event.date),
      amount: parseFloat(event.amount),
      interestRate: parseFloat(event.topupinterestrate) || interestRate,
      type: 'additional'
    })),
    ...repaymentHistory.map(event => ({
      date: new Date(event.date),
      amount: parseFloat(event.amount),
      type: 'repayment'
    }))
  ].filter(event => event.date <= calculationEndDate)
    .sort((a, b) => a.date - b.date);
  
  if (events.length > 0) {
    for (const event of events) {
      const daysElapsed = Math.floor((event.date - currentDate) / (1000 * 60 * 60 * 24));
      
      if (daysElapsed > 0) {
        const interestForPeriod = currentPrincipal * dailyRate * daysElapsed;
        interestAccrued += interestForPeriod;
        totalInterest += interestForPeriod;
      }
      
      if (event.type === 'additional') {
        currentPrincipal += event.amount;
      } else if (event.type === 'repayment') {
        if (interestAccrued > 0) {
          if (event.amount >= interestAccrued) {
            const remainingPayment = event.amount - interestAccrued;
            interestAccrued = 0;
            currentPrincipal = Math.max(0, currentPrincipal - remainingPayment);
          } else {
            interestAccrued -= event.amount;
          }
        } else {
          currentPrincipal = Math.max(0, currentPrincipal - event.amount);
        }
        
        if (event.amount >= (currentPrincipal + interestAccrued)) {
          currentPrincipal = 0;
          interestAccrued = 0;
        }
      }
      
      currentDate = new Date(event.date);
    }
  }
  
  const finalDaysElapsed = Math.floor((calculationEndDate - currentDate) / (1000 * 60 * 60 * 24));
  if (finalDaysElapsed > 0 && currentPrincipal > 0) {
    const finalInterest = currentPrincipal * dailyRate * finalDaysElapsed;
    interestAccrued += finalInterest;
    totalInterest += finalInterest;
  }
  
  const topUpTotal = topUpHistory.reduce((sum, event) => sum + parseFloat(event.amount), 0);
  const repaymentTotal = repaymentHistory.reduce((sum, event) => sum + parseFloat(event.amount), 0);
    const paidInterestTotal = interestPaymentHistory.reduce((sum, event) => sum + parseFloat(event.amount), 0);

  interestAccrued -= paidInterestTotal;
  totalInterest -= paidInterestTotal;

  if (interestAccrued < 0) interestAccrued = 0;
  if (totalInterest < 0) totalInterest = 0;

  return {
    originalPrincipal: principal,
    currentPrincipal: currentPrincipal,
    interestAccrued: interestAccrued,
    totalInterest: totalInterest,
    totalAmount: currentPrincipal + interestAccrued,
    topUpTotal: topUpTotal,
    repaymentTotal: repaymentTotal,
     paidInterestTotal: paidInterestTotal,
    fullyPaidOff: currentPrincipal === 0 && interestAccrued === 0
  };
}

// Update taken loan interest
router.put('/update-taken-loan-interest/:lenderID', async (req, res) => {
  try {
    const takenLoan = await TakenLoan.findOne({ 
      lenderID: req.params.lenderID 
    });

    if (!takenLoan) {
      return res.status(404).json({ message: 'Taken loan not found' });
    }

    const result = calculateTakenLoanInterest(
      takenLoan.loanDetails.amount,
      takenLoan.loanDetails.interestRate,
      takenLoan.loanDetails.interestFrequency,
      takenLoan.loanDetails.startDate,
      takenLoan.loanDetails.topUpHistory || [],
      takenLoan.loanDetails.repaymentHistory || [],
      takenLoan.loanDetails.interestPaymentHistory || []
    );

    // Update taken loan details
    takenLoan.loanDetails.remainingPrincipal = result.currentPrincipal;
    takenLoan.loanDetails.accruedInterest = result.interestAccrued;
    takenLoan.loanDetails.totalInterest = result.totalInterest;
    takenLoan.loanDetails.totalAmount = result.totalAmount;
    takenLoan.loanDetails.topUpTotal = result.topUpTotal;
    takenLoan.loanDetails.repaymentTotal = result.repaymentTotal;
        takenLoan.loanDetails.paidInterestTotal = result.paidInterestTotal;

    takenLoan.loanDetails.status = result.fullyPaidOff ? 'completed' : 'active';
    takenLoan.updatedAt = new Date();

    await takenLoan.save();

    res.json({ 
      message: 'Taken loan interest updated successfully', 
      takenLoan,
      calculationDetails: result 
    });
  } catch (error) {
    console.error('Error updating taken loan interest:', error);
    res.status(500).json({ message: 'Error updating taken loan interest', error: error.message });
  }
});

// Get taken loan transaction history
router.get('/taken-loan-history/:lenderID', authenticateUser, async (req, res) => {
  const { lenderID } = req.params;

  try {
    const takenLoan = await TakenLoan.findOne({ 
      lenderID: lenderID, 
      takenBy: req.userId 
    });
    
    if (!takenLoan) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this loan' });
    }

    const historyData = {
      topUpHistory: takenLoan.loanDetails.topUpHistory,
      repaymentHistory: takenLoan.loanDetails.repaymentHistory,
            interestPaymentHistory: takenLoan.loanDetails.interestPaymentHistory,

    };

    res.json(historyData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// Pay interest on taken loan
router.put('/taken-loan-interest-payment/:lenderID', async (req, res) => {
  const { lenderID } = req.params;
  const { amount, date, method } = req.body;

  if (!amount || amount <= 0 || !date) {
    return res.status(400).json({ error: 'Invalid amount or date.' });
  }

  try {
    const takenLoan = await TakenLoan.findOne({ lenderID: lenderID });
    if (!takenLoan) {
      return res.status(404).json({ error: 'Taken loan not found.' });
    }

    const topUpHistory = takenLoan.loanDetails.topUpHistory || [];
    const repaymentHistory = takenLoan.loanDetails.repaymentHistory || [];
    const interestPaymentHistory = takenLoan.loanDetails.interestPaymentHistory || [];

    const result = calculateTakenLoanInterest(
      takenLoan.loanDetails.amount,
      takenLoan.loanDetails.interestRate,
      takenLoan.loanDetails.interestFrequency,
      takenLoan.loanDetails.startDate,
      topUpHistory,
      repaymentHistory,
      interestPaymentHistory
    );

    const currentTotalInterest = result.interestAccrued;

    if (currentTotalInterest <= 0) {
      return res.status(400).json({
        error: 'No interest available to pay. Current interest is zero.',
        currentInterest: currentTotalInterest
      });
    }

    if (amount > currentTotalInterest) {
      return res.status(400).json({
        error: `Payment amount (₹${amount}) exceeds available interest (₹${currentTotalInterest.toFixed(2)})`,
        currentInterest: currentTotalInterest
      });
    }

    if (!takenLoan.loanDetails.interestPaymentHistory) {
      takenLoan.loanDetails.interestPaymentHistory = [];
    }

    takenLoan.loanDetails.interestPaymentHistory.push({
      amount: parseFloat(amount),
      date: new Date(date),
      method: method || 'Cash',
      paidInterest: parseFloat(amount)
    });

    await takenLoan.save();

    res.json({
      message: 'Interest payment recorded successfully',
      paidAmount: amount,
      remainingInterest: currentTotalInterest - amount,
      takenLoan
    });

  } catch (err) {
    console.error('Error processing interest payment for taken loan:', err);
    res.status(500).json({ error: 'Failed to process interest payment.' });
  }
});


// Update taken loan bill number
router.put('/taken-loan-bill/:lenderID', async (req, res) => {
  const { lenderID } = req.params;
  const { billNumber } = req.body;

  try {
    const takenLoan = await TakenLoan.findOneAndUpdate(
      { lenderID },
      { $set: { "loanDetails.billNo": billNumber } },
      { new: true }
    );
    
    if (!takenLoan) {
      return res.status(404).send({ message: 'Taken loan not found.' });
    }

    res.status(200).send(takenLoan);
  } catch (error) {
    console.error('Error updating taken loan:', error);
    res.status(500).send({ message: 'Error updating taken loan.' });
  }
});
router.put('/taken-loan/:loanId/remark', async (req, res) => {
  const { loanId } = req.params;
  const { remark } = req.body;

  try {
    const takenLoan = await TakenLoan.findOneAndUpdate(
      { lenderID: loanId },
      { $set: { "loanDetails.remarks": remark } }, // ✅ Correct way to update nested field
      { new: true, upsert: true }
    );
    res.json({ message: "Remark updated successfully", takenLoan });
  } catch (error) {
    res.status(500).json({ message: "Error updating remark", error });
  }
});
router.get('/taken-loan/:loanId/remark', async (req, res) => {
  const { loanId } = req.params;
  try {
    const takenLoan = await TakenLoan.findOne({ lenderID: loanId });
    if (!takenLoan) {
      return res.status(404).json({ message: 'Taken loan not found' });
    }
    res.json({ remark: takenLoan.loanDetails.remarks });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching remark', error });
  }
});

router.get('/borrowed-loans', authenticateUser, async (req, res) => {
  try {
    const lenderProfiles = await Lender.find({ borrowedBy: req.ByPhoneNumber }).sort({ createdAt: -1 });
    const takenLoans = await TakenLoan.find({ takenBy: req.userId }).sort({ createdAt: -1 });
    res.json({ success: true, data: takenLoans, lenderProfiles: lenderProfiles });
  } catch (error) {
    console.error('Error fetching borrowed loans:', error);
    res.status(500).json({ success: false, message: 'Error fetching borrowed loans', error });
  }
});

module.exports = router;