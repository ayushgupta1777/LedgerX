const express = require('express');
const multer = require('multer');
const Loan = require('../../models/loans/loanSchema');
const Customer = require('../../models/loans/customer-land');
const path = require('path');
const fs = require('fs');
const { upload } = require("./cloudinary");
const { authenticateUser }  = require('../../middleware/authentication');
const { calculateTopUpInterest } = require('../../utils/interestCalculator');

const router = express.Router();
// router.use('/uploads', express.static('uploads'));
// router.use('/uploads', express.static(path.join(__dirname, '../../uploads')));


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

// Add customer and loan
router.post('/add-loan/:customerID', authenticateUser, upload.single('attachments'), async (req, res) => {
  const { customerID } = req.params;
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
  } = req.body;

  try {
    // Find the customer by customerID
    const customer = await Customer.findOne({ customerID: customerID });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const existingLoan = await Loan.findOne({ customerID });
    if (existingLoan) {
      return res.status(400).json({ message: 'Loan already exists for this customer ID.' });
    }



    // Validate required fields
    if (!loanType || !amount || !interestRate || !interestFrequency || !startDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const isCompoundInterest = compoundInterest === 'true';
    const uploadedFile = req.file ? req.file.path : null;


    // Create a new loan linked to the customer
    const loan = await Loan.create({
      customerID: customerID,
      addedBy: req.userId,
      loanDetails: {
        loanType,
        method,
        amount,
        interestRate,
        interestStartDate:Date(),
        interestFrequency,
        compoundInterest: {
          enabled: isCompoundInterest,
          frequency: isCompoundInterest ? compoundFrequency : null,
        },
        startDate,
        attachments: uploadedFile ? [uploadedFile] : [],
        remarks,
        
        
      },
    });

    res.status(201).json({ message: 'Loan added successfully', loan });
  } catch (error) {
    console.error('Error adding loan:', error);
    res.status(500).json({ message: 'Error adding loan', error: error.message });
  }
});

// Get all loans
router.get('/loan-profile/:customerID', authenticateUser, async (req, res) => {
  const { customerID } = req.params;

  try {
    const loan = await Loan.findOne({ 
      
      customerID: customerID, 
      addedBy: req.userId 
    
    }); // Use populate if ref is added
    if (!loan) {
      return res.status(403).json({ error: 'Unauthorized: You do not have access to this loan' });
    }

    // ON-THE-FLY CALCULATION for speed and accuracy
    const topUpHistory = loan.loanDetails.topUpHistory || [];
    const topDownHistory = loan.loanDetails.topDownHistory || [];
    const interestPaymentHistory = loan.loanDetails.interestPaymentHistory || [];

    const { 
      topUpInterest, 
      topUpTotal, 
      totalInterest, 
      remainingPrincipal,
      paidInterestTotal 
    } = calculateTopUpInterest(
      loan.loanDetails.amount, 
      loan.loanDetails.interestRate, 
      loan.loanDetails.startDate, 
      topUpHistory, 
      topDownHistory,
      interestPaymentHistory
    );

    // Inject calculated values into the response without necessarily saving to DB 
    // (saves DB writes and makes the request faster)
    const loanData = loan.toObject();
    loanData.loanDetails.topUpInterest = topUpInterest;
    loanData.loanDetails.topUpTotal = topUpTotal;
    loanData.loanDetails.accruedInterest = totalInterest;
    loanData.loanDetails.remainingPrincipal = remainingPrincipal;
    loanData.loanDetails.totalAmount = remainingPrincipal + totalInterest;
    loanData.loanDetails.paidInterestTotal = paidInterestTotal;

    res.json(loanData);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server Error' });
  }
});

// COMPREHENSIVE ENDPOINT: Fetches everything in one trip for "Ultrafast" experience
router.get('/comprehensive-loan/:customerID', authenticateUser, async (req, res) => {
  const { customerID } = req.params;

  try {
    // Run DB lookups in parallel for maximum speed
    const [loan, profile] = await Promise.all([
      Loan.findOne({ customerID, addedBy: req.userId }),
      Customer.findOne({ customerID }).select('FirstName LastName phoneNumber')
    ]);

    if (!loan) {
      return res.status(404).json({ error: 'Loan not found or unauthorized' });
    }

    // ON-THE-FLY CALCULATION
    const topUpHistory = loan.loanDetails.topUpHistory || [];
    const topDownHistory = loan.loanDetails.topDownHistory || [];
    const interestPaymentHistory = loan.loanDetails.interestPaymentHistory || [];

    const calculated = calculateTopUpInterest(
      loan.loanDetails.amount, 
      loan.loanDetails.interestRate, 
      loan.loanDetails.startDate, 
      topUpHistory, 
      topDownHistory,
      interestPaymentHistory
    );

    const loanData = loan.toObject();
    
    // Consolidate response
    const comprehensiveData = {
      loan: {
        ...loanData,
        calculated: {
          accruedInterest: calculated.totalInterest,
          remainingPrincipal: calculated.remainingPrincipal,
          totalAmount: calculated.remainingPrincipal + calculated.totalInterest,
          paidInterestTotal: calculated.paidInterestTotal,
          topUpInterest: calculated.topUpInterest,
          topUpTotal: calculated.topUpTotal,
        }
      },
      profile: profile || { FirstName: 'Unknown', LastName: 'Customer' },
      remarks: loan.loanDetails.remarks || ""
    };

    res.json(comprehensiveData);
  } catch (error) {
    console.error('Error fetching comprehensive loan data:', error);
    res.status(500).json({ error: 'Server Error' });
  }
});

// const multer = require('multer');
// const uploads = multer({ storage: storage });

// router.post('/loan-profile/:customerID/signature', authenticateUser, upload.single('attachments'), async (req, res) => {
//   const { customerID } = req.params;
//   try {
//     // const { customerID } = req.params;
//     const filePath = req.file ? `/uploads/${req.file.filename}` : null;

//     console.log('Uploaded File Path:', filePath); // Debug

//     if (!filePath) {
//       return res.status(400).send({ message: 'No file uploaded.' });
//     }
//     const attachmentEntry = {
//       path: filePath,
//       date: new Date(), // Automatically set the current date
//     };

//     const loan = await Loan.findOneAndUpdate(
//       { customerID, addedBy: req.userId },
   
//       { $push: { "loanDetails.signature": attachmentEntry } }, // Ensure the correct path is used
//       { new: true }
//     );

//     if (!loan) {
//       return res.status(404).send({ message: 'Loan not found.' });
//     }

//     console.log('Updated Loan:', loan); // Debug

//     res.status(200).send(loan);
//   } catch (error) {
//     console.error('Error saving signature:', error);
//     res.status(500).send({ message: 'Error saving signature.' });
//   }
// });

router.put('/billNo/:customerID', async (req, res) => {  
  const { customerID } = req.params;  
  const { billNumber } = req.body;  

  try {  
    const loan = await Loan.findOneAndUpdate(  
      { customerID },  
      { $set: { "loanDetails.billNo": billNumber } }, // Adjust the path based on your schema  
      { new: true }  
    );  
    
    if (!loan) {  
      return res.status(404).send({ message: 'Loan not found.' });  
    }  

    res.status(200).send(loan);  
  } catch (error) {  
    console.error('Error updating loan:', error);  
    res.status(500).send({ message: 'Error updating loan.' });  
  }  
});  

router.get('/total-amount', authenticateUser, async (req, res) => {
  try {
    const loans = await Loan.find({ addedBy: req.userId, status: 'active' });
    
    let totalPrincipal = 0;
    let totalInterest = 0;
    let totalTopUpInterest = 0;
    let totalTopUpTotal = 0;

    loans.forEach(loan => {
      const topUpHistory = loan.loanDetails.topUpHistory || [];
      const topDownHistory = loan.loanDetails.topDownHistory || [];
      const interestPaymentHistory = loan.loanDetails.interestPaymentHistory || [];

      const result = calculateTopUpInterest(
        loan.loanDetails.amount, 
        loan.loanDetails.interestRate, 
        loan.loanDetails.startDate, 
        topUpHistory, 
        topDownHistory,
        interestPaymentHistory
      );

      totalPrincipal += result.remainingPrincipal;
      totalInterest += result.totalInterest;
      totalTopUpInterest += result.topUpInterest;
      totalTopUpTotal += result.topUpTotal;
    });

    const youOweTotal = await Loan.aggregate([
      {
        $match: { 
          loanType: 'You Owe',
          addedBy: req.userId
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$loanDetails.amount' },
        },
      },
    ]);

    res.json({
      totalAmount: totalPrincipal,
      accruedInterest: totalInterest,
      topUpInterest: totalTopUpInterest,
      topUpTotal: totalTopUpTotal,
      totalLoanWithInterest: totalPrincipal + totalInterest,
      youOwe: youOweTotal[0]?.totalAmount || 0,
      userId: req.userId,
    });
  } catch (error) {
    console.error('Error calculating totals:', error);
    res.status(500).json({ message: 'Error calculating totals', error });
  }
});
  


router.get("/latest-loan", authenticateUser, async (req, res) => {
  try {
    const latestLoan = await Loan.findOne({addedBy: req.userId}).sort({ createdAt: -1 }); // Get latest loan
    if (!latestLoan) return res.status(404).json({ message: "No loan records found" });

    res.json({
      method: latestLoan.loanDetails.method,
      amount: latestLoan.loanDetails.amount,
      date: latestLoan.createdAt,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// router.get("/loan-trends", authenticateUser, async (req, res) => {
//   try {
//     const loans = await Loan.aggregate([
//       {$match: { addedBy: req.userId }, }, // Only fetch user's loans
//       { $sort: { createdAt: -1 } }, // Sort by latest date first
//       { $limit: 100 }, // Limit to the last 100 entries
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           totalLoans: { $sum: "$loanDetails.amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const formattedData = loans.map(entry => ({
//       date: entry._id,
//       loanAmount: entry.totalLoans,
//     }));

//     res.json(formattedData);
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// router.get("/loan-trends", authenticateUser, async (req, res) => {
//   try {
//     const { range } = req.query; 
//     const matchStage = { addedBy: req.userId };

//     let startDate = new Date();
//     if (range === "1H") startDate.setHours(startDate.getHours() - 1);
//     else if (range === "1D") startDate.setDate(startDate.getDate() - 1);
//     else if (range === "1W") startDate.setDate(startDate.getDate() - 7);
//     else if (range === "1M") startDate.setMonth(startDate.getMonth() - 1);
//     else if (range === "1Y") startDate.setFullYear(startDate.getFullYear() - 1);
//     else startDate = null;

//     if (startDate) {
//       matchStage.createdAt = { $gte: startDate };
//     }

//     const loans = await Loan.aggregate([
//       { $match: matchStage },
//       {
//         $group: {
//           _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
//           totalLoans: { $sum: "$loanDetails.amount" },
//         },
//       },
//       { $sort: { _id: 1 } },
//     ]);

//     const totalSelectedRange = loans.reduce((sum, entry) => sum + entry.totalLoans, 0);

//     const allTimeTotal = await Loan.aggregate([
//       { $match: { addedBy: req.userId } },
//       { $group: { _id: null, totalAllTime: { $sum: "$loanDetails.amount" } } },
//     ]);
    
//     const totalAllTime = allTimeTotal.length > 0 ? allTimeTotal[0].totalAllTime : 0;
//     const increaseAmount = totalSelectedRange - totalAllTime;
//     const percentageChange = totalAllTime > 0 ? ((increaseAmount) / totalAllTime) * 100 : 0;

//     res.json({
//       trendData: loans,
//       totalAllTime,
//       increaseAmount,
//       percentageChange,
//     });

//   } catch (error) {
//     console.error(error);
//     res.status(500).send("Server error");
//   }
// });

// Helper function to get the previous time range
router.get("/loan-trends", authenticateUser, async (req, res) => {
  try {
    const { range } = req.query;
    let matchFilter = { addedBy: req.userId };

    const now = new Date();
    let startDate, prevStartDate, prevEndDate;

    switch (range) {
      case "1H":
        startDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        prevStartDate = new Date(now.getTime() - 2 * 60 * 60 * 1000);
        prevEndDate = new Date(now.getTime() - 1 * 60 * 60 * 1000);
        break;
      case "1D":
        startDate = new Date(now.setHours(0, 0, 0, 0));
        prevStartDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        prevEndDate = startDate;
        break;
      case "1W":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        prevStartDate = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
        prevEndDate = startDate;
        break;
      case "1M":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        prevStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        prevEndDate = startDate;
        break;
      case "1Y":
        startDate = new Date(now.getFullYear(), 0, 1);
        prevStartDate = new Date(now.getFullYear() - 1, 0, 1);
        prevEndDate = startDate;
        break;
      default:
        startDate = new Date(0); // All time
        prevStartDate = null;
        prevEndDate = null;
        break;
    }

    matchFilter.createdAt = { $gte: startDate };
    let prevMatchFilter = prevStartDate && prevEndDate ? { 
      addedBy: req.userId, createdAt: { $gte: prevStartDate, $lt: prevEndDate } 
    } : null;

    // Aggregate total loans till now
    const totalLoansResult = await Loan.aggregate([
      { $match: { addedBy: req.userId } },
      { $group: { _id: null, totalLoans: { $sum: "$loanDetails.amount" } } }
    ]);

    const totalLoans = totalLoansResult.length ? totalLoansResult[0].totalLoans : 0;

    // Aggregate loans for selected range
    const rangeLoansResult = await Loan.aggregate([
      { $match: matchFilter },
      { $group: { _id: null, totalLoans: { $sum: "$loanDetails.amount" } } }
    ]);

    const rangeLoans = rangeLoansResult.length ? rangeLoansResult[0].totalLoans : 0;

    // Aggregate previous period loans
    let previousLoans = 0;
    if (prevMatchFilter) {
      const previousLoansResult = await Loan.aggregate([
        { $match: prevMatchFilter },
        { $group: { _id: null, totalLoans: { $sum: "$loanDetails.amount" } } }
      ]);
      previousLoans = previousLoansResult.length ? previousLoansResult[0].totalLoans : 0;
    }

    // Calculate percentage increase
    const percentageIncrease = totalLoans > 0 ? (rangeLoans / totalLoans) * 100 : 0;

    // Fetch loan trends for the graph
    const trendData = await Loan.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          loanAmount: { $sum: "$loanDetails.amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      trendData,
      totalLoans,
      rangeLoans,
      previousLoans,
      percentageIncrease,
    });
  } catch (error) {
    console.error("Error fetching loan trends:", error);
    res.status(500).send("Server error");
  }
});


// Fetch customer remark
router.get("/:customerID/remark", async (req, res) => {
  try {
    const customer = await Loan.findOne({ customerID: req.params.customerID });
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json({ remark: customer.loanDetails.remarks });
  } catch (error) {
    res.status(500).json({ message: "Error fetching remark", error });
  }
});

// Update customer remark
router.put("/:customerID/remark", async (req, res) => {
  try {
    const { remarks } = req.body;
    const customer = await Loan.findOneAndUpdate(
      { customerID: req.params.customerID },
      { $set: { "loanDetails.remarks": remarks } }, // ✅ Correct way to update nested field
      { new: true, upsert: true }
    );
    res.json({ message: "Remark updated successfully", customer });
  } catch (error) {
    res.status(500).json({ message: "Error updating remark", error });
  }
});



// Delete customer profile and associated loan
router.delete('/delete-customer-profile/:customerID', authenticateUser, async (req, res) => {
  try {
    const { customerID } = req.params;

    // Delete the customer profile
    const deletedCustomer = await Customer.findOneAndDelete({
      customerID: customerID,
      userId: req.userId // Ensure user owns the customer
    });

    if (!deletedCustomer) {
      // If customer not found, maybe just try deleting the loan? 
      // Or return 404? Let's assume strict consistency first.
      // Actually, if customer is gone, loan might still exist? 
      // Let's try to delete loan regardless to clean up.
    }

    // Delete the associated loan
    const deletedLoan = await Loan.findOneAndDelete({
      customerID: customerID,
      addedBy: req.userId
    });

    if (!deletedCustomer && !deletedLoan) {
      return res.status(404).json({ message: 'Profile not found or unauthorized' });
    }

    res.json({ message: 'Profile and associated loan deleted successfully' });
  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ message: 'Error deleting profile', error: error.message });
  }
});


module.exports = router;