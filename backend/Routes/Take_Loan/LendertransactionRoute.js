const express = require('express');
const router = express.Router();
const { authenticateUser } = require('../../middleware/authentication');
const TakenLoan = require('../../models/takenLoanSchema'); // Fixed: should be takenLoanSchema
const Lender = require('../../models/lenderSchema'); // Fixed: should be lenderSchema

// ==========================================
// DELETE TRANSACTION
// ==========================================
router.delete('/delete-transaction/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Delete Transaction - Lender ID:', lenderID);
    console.log('Delete Transaction - User ID:', userId);

    // Find the loan and verify ownership
    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found or you do not have permission to delete this transaction' 
      });
    }

    // Delete the loan transaction
    await TakenLoan.deleteOne({ _id: loan._id });

    res.status(200).json({ 
      message: 'Transaction deleted successfully',
      deletedLoanId: loan._id
    });

  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ 
      message: 'Error deleting transaction', 
      error: error.message 
    });
  }
});

// ==========================================
// STOP INTEREST
// ==========================================
router.put('/stop-interest/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Stop Interest - Lender ID:', lenderID);
    console.log('Stop Interest - User ID:', userId);

    // Find the loan and verify ownership
    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found or you do not have permission to modify this loan' 
      });
    }

    // Stop interest by setting interestStopped flag and recording the stop date
    loan.loanDetails.interestStopped = true;
    loan.loanDetails.interestStoppedDate = new Date();
    
    await loan.save();

    res.status(200).json({ 
      message: 'Interest stopped successfully',
      loan: {
        lenderID: loan.lenderID,
        interestStopped: loan.loanDetails.interestStopped,
        interestStoppedDate: loan.loanDetails.interestStoppedDate,
        accruedInterest: loan.loanDetails.accruedInterest
      }
    });

  } catch (error) {
    console.error('Error stopping interest:', error);
    res.status(500).json({ 
      message: 'Error stopping interest', 
      error: error.message 
    });
  }
});

// ==========================================
// CLOSE PROFILE
// ==========================================
router.put('/close-profile/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Close Profile - Lender ID:', lenderID);
    console.log('Close Profile - User ID:', userId);

    // Find the loan and verify ownership
    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found or you do not have permission to close this profile' 
      });
    }

    // Close the profile by setting status to 'closed'
    loan.status = 'closed';
    loan.closedDate = new Date();
    
    // Stop interest when closing
    loan.loanDetails.interestStopped = true;
    loan.loanDetails.interestStoppedDate = new Date();

    await loan.save();

    // Optionally update lender profile status as well
    await Lender.findOneAndUpdate(
      { lenderID: lenderID, userId: userId },
      { 
        status: 'closed',
        closedDate: new Date()
      }
    );

    res.status(200).json({ 
      message: 'Profile closed successfully',
      loan: {
        lenderID: loan.lenderID,
        status: loan.status,
        closedDate: loan.closedDate
      }
    });

  } catch (error) {
    console.error('Error closing profile:', error);
    res.status(500).json({ 
      message: 'Error closing profile', 
      error: error.message 
    });
  }
});

// ==========================================
// DELETE PROFILE
// ==========================================
router.delete('/delete-profile/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Delete Profile - Lender ID:', lenderID);
    console.log('Delete Profile - User ID:', userId);

    // Find the loan and verify ownership
    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found or you do not have permission to delete this profile' 
      });
    }

    // Delete all loans associated with this lender
    await TakenLoan.deleteMany({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    // Delete the lender profile
    const deletedLender = await Lender.findOneAndDelete({ 
      lenderID: lenderID,
      userId: userId 
    });

    res.status(200).json({ 
      message: 'Profile and all associated data deleted successfully',
      deletedLenderID: lenderID,
      deletedLenderName: deletedLender ? `${deletedLender.FirstName} ${deletedLender.LastName}` : 'Unknown'
    });

  } catch (error) {
    console.error('Error deleting profile:', error);
    res.status(500).json({ 
      message: 'Error deleting profile', 
      error: error.message 
    });
  }
});

// ==========================================
// REOPEN PROFILE
// ==========================================
router.put('/reopen-profile/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Reopen Profile - Lender ID:', lenderID);
    console.log('Reopen Profile - User ID:', userId);

    // Find the loan and verify ownership
    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found or you do not have permission to reopen this profile' 
      });
    }

    // Reopen the profile
    loan.status = 'active';
    loan.closedDate = null;
    
    // Optionally restart interest
    loan.loanDetails.interestStopped = false;
    loan.loanDetails.interestStoppedDate = null;

    await loan.save();

    // Reopen lender profile
    await Lender.findOneAndUpdate(
      { lenderID: lenderID, userId: userId },
      { 
        status: 'active',
        closedDate: null
      }
    );

    res.status(200).json({ 
      message: 'Profile reopened successfully',
      loan: {
        lenderID: loan.lenderID,
        status: loan.status
      }
    });

  } catch (error) {
    console.error('Error reopening profile:', error);
    res.status(500).json({ 
      message: 'Error reopening profile', 
      error: error.message 
    });
  }
});

// ==========================================
// GET PROFILE STATUS
// ==========================================
router.get('/profile-status/:lenderID', authenticateUser, async (req, res) => {
  try {
    const { lenderID } = req.params;
    const userId = req.userId;

    console.log('Get Profile Status - Lender ID:', lenderID);
    console.log('Get Profile Status - User ID:', userId);

    const loan = await TakenLoan.findOne({ 
      lenderID: lenderID,
      takenBy: userId 
    });

    if (!loan) {
      return res.status(404).json({ 
        message: 'Loan not found' 
      });
    }

    res.status(200).json({ 
      lenderID: loan.lenderID,
      status: loan.status,
      interestStopped: loan.loanDetails.interestStopped,
      closedDate: loan.closedDate,
      interestStoppedDate: loan.loanDetails.interestStoppedDate
    });

  } catch (error) {
    console.error('Error fetching profile status:', error);
    res.status(500).json({ 
      message: 'Error fetching profile status', 
      error: error.message 
    });
  }
});

module.exports = router;