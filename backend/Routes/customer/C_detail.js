const express = require('express');
const Customer = require('../../models/Customer');
const Transaction = require('../../models/Transaction')
const Chat = require('../../models/Chat');
const { authenticateUser }  = require('../../middleware/authentication');
const router = express.Router();
const jwt = require("jsonwebtoken");

// ✅ FIXED: Proper balance calculation based on transaction semantics
router.get('/customers', authenticateUser, async (req, res) => {
  const byPhoneNumber = String(req.ByPhoneNumber);

  try {
    const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });

    const customerData = await Promise.all(
      customers.map(async (customer) => {
        try {
          const customerPhone = String(customer.phoneNumber);
          const userPhone = String(byPhoneNumber);

          // Get last message timestamp
          const lastMessage = await Chat.findOne({
            $or: [
              { sender: customerPhone, receiver: userPhone },
              { sender: userPhone, receiver: customerPhone }
            ],
          })
            .sort({ timestamp: -1 })
            .select('timestamp');
    
          // Get unread count
          const unreadCount = await Chat.countDocuments({
            sender: customerPhone,
            receiver: userPhone,
            isRead: false,
          });
    
          // ✅ CORRECT BALANCE LOGIC
          const customerID = String(customer.customerID);
          const allTransactions = await Transaction.find({ customerID: customerID });
          
          let balance = 0;
          
          // Transaction semantics:
          // 'receive' = YOU received money FROM customer → Customer gave you → Positive balance
          // 'give' = YOU gave money TO customer → You gave customer → Negative balance
          
          for (const txn of allTransactions) {
            const amount = Number(txn.amount);
            
            if (txn.transactionType === 'receive') {
              // You received = Customer gave you = They're in ADVANCE
              balance += amount;
            } else if (txn.transactionType === 'give') {
              // You gave = Customer received = They have DUE
              balance -= amount;
            }
          }
          
          // Positive balance = Customer is in ADVANCE (you owe them)
          // Negative balance = Customer has DUE (they owe you)
          const balanceType = balance >= 0 ? 'Advance' : 'Due';
          const displayBalance = Math.abs(balance);

          console.log(`Customer ${customer.name}:`, {
            transactionCount: allTransactions.length,
            rawBalance: balance,
            balanceType,
            displayBalance
          });

          return {
            ...customer._doc,
            lastMessageTimestamp: lastMessage ? lastMessage.timestamp : 0,
            unreadCount,
            balance: displayBalance,
            balanceType
          };
        } catch (err) {
          console.error('Error processing customer:', customer.phoneNumber, err.message);
          return {
            ...customer._doc,
            lastMessageTimestamp: 0,
            unreadCount: 0,
            balance: 0,
            balanceType: 'Advance',
            error: 'Data unavailable'
          };
        }
      })
    );

    // Sort customers by unread count and timestamp
    customerData.sort((a, b) => {
      if (b.unreadCount !== a.unreadCount) {
        return b.unreadCount - a.unreadCount;
      }
      return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp);
    });

    res.status(200).json(customerData);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
  }
});

// ✅ FIXED: Get balance for a specific customer
router.get('/customers/:customerId/balance', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;
    const byPhoneNumber = String(req.ByPhoneNumber);

    const customer = await Customer.findOne({ customerID: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const customerID = String(customerId);
    const allTransactions = await Transaction.find({ customerID: customerID });
    
    let balance = 0;
    let totalReceive = 0;
    let totalGive = 0;
    
    for (const txn of allTransactions) {
      const amount = Number(txn.amount);
      
      if (txn.transactionType === 'receive') {
        balance += amount;
        totalReceive += amount;
      } else if (txn.transactionType === 'give') {
        balance -= amount;
        totalGive += amount;
      }
    }
    
    const balanceType = balance >= 0 ? 'Advance' : 'Due';
    const displayBalance = Math.abs(balance);

    res.json({
      customerID: customerId,
      balance: displayBalance,
      balanceType,
      totalReceive,
      totalGive,
      rawBalance: balance
    });
  } catch (err) {
    console.error('Error fetching customer balance:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ FIXED: Owner summary endpoint
router.get('/me/summary', authenticateUser, async (req, res) => {
  try {
    const byPhoneNumber = String(req.ByPhoneNumber);

    const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });
    const accountsCount = customers.length;

    let totalAdvance = 0;
    let totalDue = 0;

    for (const customer of customers) {
      const customerID = String(customer.customerID);
      const allTransactions = await Transaction.find({ customerID: customerID });
      
      let balance = 0;
      
      for (const txn of allTransactions) {
        const amount = Number(txn.amount);
        
        if (txn.transactionType === 'receive') {
          balance += amount;
        } else if (txn.transactionType === 'give') {
          balance -= amount;
        }
      }
      
      if (balance >= 0) {
        totalAdvance += balance;
      } else {
        totalDue += Math.abs(balance);
      }
    }

    // Net calculation
    const netAmount = totalAdvance - totalDue;
    const netType = netAmount >= 0 ? 'Advance' : 'Due';

    res.json({
      accountsCount,
      totalAdvance,
      totalDue,
      net: {
        amount: Math.abs(netAmount),
        type: netType
      }
    });
  } catch (err) {
    console.error('Error fetching owner summary:', err);
    res.status(500).json({ error: err.message });
  }
});

router.use('/customer_who_added_me', authenticateUser, async (req, res, next) => {
  const byPhoneNumber = String(req.ByPhoneNumber);
  try {
      const users = await Customer.find({ phoneNumber: byPhoneNumber })
      res.status(200).json(users);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users who added you', error: error.message });
  }
});

router.get("/transactions/summary", authenticateUser, async (req, res) => {
  try {
    const myPhoneNumber = String(req.ByPhoneNumber);
    console.log("Fetching transactions for phone:", myPhoneNumber);

    const allTransactions = await Transaction.find({
      $or: [
        { sender: myPhoneNumber },
        { receiver: myPhoneNumber }
      ]
    });
    
    let totalReceived = 0;
    let totalGiven = 0;
    
    for (const txn of allTransactions) {
      const amount = Number(txn.amount);
      
      if (txn.transactionType === 'receive') {
        totalReceived += amount;
      } else if (txn.transactionType === 'give') {
        totalGiven += amount;
      }
    }

    console.log("Total Received:", totalReceived, "Total Given:", totalGiven);
    res.json({ totalReceived, totalGiven, userId: req.userId });
  } catch (error) {
    console.error("Error fetching transaction summary:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

router.get("/ping", (req, res) => {
  res.send("Backend is alive, Host Vercel, AERO31");
});

router.get('/customers/:customerId', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOne({ customerID: customerId });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error("Error fetching profile:", err);
    res.status(500).json({ error: err.message });
  }
});

router.put('/customers/:customerId/address', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Address is required' });
    }

    const customer = await Customer.findOneAndUpdate(
      { customerID: customerId },
      { address },
      { new: true }
    );

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    console.error("Error updating address:", err);
    res.status(500).json({ error: err.message });
  }
});

router.delete('/customers/:customerId', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;
    const customer = await Customer.findOneAndDelete({ customerID: customerId });

    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    res.json({ message: 'Customer profile deleted successfully' });
  } catch (err) {
    console.error("Error deleting profile:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ DEBUG ENDPOINT
router.get('/debug/customer/:customerId', authenticateUser, async (req, res) => {
  try {
    const { customerId } = req.params;
    const byPhoneNumber = String(req.ByPhoneNumber);

    const customer = await Customer.findOne({ customerID: customerId });
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const allTransactions = await Transaction.find({ customerID: customerId });
    
    let balance = 0;
    const breakdown = allTransactions.map(txn => {
      const amount = Number(txn.amount);
      let effect = 0;
      
      if (txn.transactionType === 'receive') {
        effect = amount;
        balance += amount;
      } else if (txn.transactionType === 'give') {
        effect = -amount;
        balance -= amount;
      }
      
      return {
        type: txn.transactionType,
        amount: txn.amount,
        effect,
        runningBalance: balance,
        note: txn.note,
        timestamp: txn.timestamp
      };
    });
    
    const balanceType = balance >= 0 ? 'Advance' : 'Due';
    const displayBalance = Math.abs(balance);

    res.json({
      customer: {
        name: customer.name,
        phone: customer.phoneNumber
      },
      calculations: {
        rawBalance: balance,
        displayBalance,
        balanceType
      },
      transactions: breakdown,
      explanation: balance >= 0 
        ? `Customer is in ₹${displayBalance} ADVANCE (you owe them)`
        : `Customer has ₹${displayBalance} DUE (they owe you)`
    });
  } catch (err) {
    console.error('Debug error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



// const express = require('express');
// const Customer = require('../../models/Customer');
// const Transaction = require('../../models/Transaction')
// const Chat = require('../../models/Chat');
// const { authenticateUser }  = require('../../middleware/authentication');
// const router = express.Router();
// const jwt = require("jsonwebtoken");

// // ✅ FIXED: Enhanced customers endpoint with balance calculation
// router.get('/customers', authenticateUser, async (req, res) => {
//   const byPhoneNumber = req.ByPhoneNumber;

//   try {
//     // Fetch customers for the user
//     const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });

//     // Fetch unread message counts, latest timestamps, AND balance info
//     const customerData = await Promise.all(
//       customers.map(async (customer) => {
//         try {
//           // Ensure phone numbers are strings
//           const customerPhone = String(customer.phoneNumber);
//           const userPhone = String(byPhoneNumber);

//           // Get last message timestamp
//           const lastMessage = await Chat.findOne({
//             $or: [
//               { sender: customerPhone, receiver: userPhone },
//               { sender: userPhone, receiver: customerPhone }
//             ],
//           })
//             .sort({ timestamp: -1 })
//             .select('timestamp');
    
//           // Get unread count
//           const unreadCount = await Chat.countDocuments({
//             sender: customerPhone,
//             receiver: userPhone,
//             isRead: false,
//           });
    
//           // ✅ NEW: Calculate balance for this customer
//           const receivedTransactions = await Transaction.find({ 
//             receiver: byPhoneNumber,
//             customerID: customer.customerID 
//           });
//           const totalReceived = receivedTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//           const givenTransactions = await Transaction.find({ 
//             sender: byPhoneNumber,
//             customerID: customer.customerID 
//           });
//           const totalGiven = givenTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//           // Calculate net balance
//           const netBalance = totalReceived - totalGiven;
//           const balanceType = netBalance >= 0 ? 'Advance' : 'Due';
//           const balance = Math.abs(netBalance);

//           return {
//             ...customer._doc,
//             lastMessageTimestamp: lastMessage ? lastMessage.timestamp : 0,
//             unreadCount,
//             balance, // ✅ Add balance
//             balanceType, // ✅ Add balance type
//             totalReceived, // Optional: for debugging
//             totalGiven // Optional: for debugging
//           };
//         } catch (err) {
//           console.error('Error processing customer:', customer.phoneNumber, err.message);
//           return {
//             ...customer._doc,
//             lastMessageTimestamp: 0,
//             unreadCount: 0,
//             balance: 0,
//             balanceType: 'Advance',
//             error: 'Data unavailable'
//           };
//         }
//       })
//     );

//     // Sort customers:
//     // 1️⃣ First, by unread messages (higher unread messages come first).
//     // 2️⃣ If unread counts are the same, sort by the latest message timestamp.
//     customerData.sort((a, b) => {
//       if (b.unreadCount !== a.unreadCount) {
//         return b.unreadCount - a.unreadCount; // Higher unread first
//       }
//       return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp); // Newest messages first
//     });

//     res.status(200).json(customerData);
//   } catch (error) {
//     console.error('Error fetching customers:', error);
//     res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
//   }
// });

// // ✅ NEW: Get balance for a specific customer
// router.get('/customers/:customerId/balance', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const byPhoneNumber = req.ByPhoneNumber;

//     const customer = await Customer.findOne({ customerID: customerId });
//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     // Calculate balance
//     const receivedTransactions = await Transaction.find({ 
//       receiver: byPhoneNumber,
//       customerID: customerId 
//     });
//     const totalReceived = receivedTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     const givenTransactions = await Transaction.find({ 
//       sender: byPhoneNumber,
//       customerID: customerId 
//     });
//     const totalGiven = givenTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     const netBalance = totalReceived - totalGiven;
//     const balanceType = netBalance >= 0 ? 'Advance' : 'Due';
//     const balance = Math.abs(netBalance);

//     res.json({
//       customerID: customerId,
//       balance,
//       balanceType,
//       totalReceived,
//       totalGiven,
//       netBalance
//     });
//   } catch (err) {
//     console.error('Error fetching customer balance:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // Existing routes below...
// router.use('/customer_who_added_me', authenticateUser, async (req, res, next) => {
//   const byPhoneNumber = req.ByPhoneNumber;
//   try {
//       const users = await Customer.find({ phoneNumber: byPhoneNumber })
//       res.status(200).json(users);
//   } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch users who added you', error: error.message });
//   }
// });

// router.get("/transactions/summary", authenticateUser, async (req, res) => {
//   try {
//     const myPhoneNumber = req.ByPhoneNumber.toString();
//     console.log("Fetching transactions for phone:", myPhoneNumber);

//     const receivedTransactions = await Transaction.find({ receiver: myPhoneNumber });
//     const totalReceived = receivedTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     const givenTransactions = await Transaction.find({ sender: myPhoneNumber });
//     const totalGiven = givenTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     console.log("Total Received:", totalReceived, "Total Given:", totalGiven);
//     res.json({ totalReceived, totalGiven, userId: req.userId, });
//   } catch (error) {
//     console.error("Error fetching transaction summary:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });

// router.get("/ping", (req, res) => {
//   res.send("Backend is alive, Host Vercel, AERO31");
// });

// router.get('/customers/:customerId', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const customer = await Customer.findOne({ customerID: customerId });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(customer);
//   } catch (err) {
//     console.error("Error fetching profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.put('/customers/:customerId/address', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { address } = req.body;

//     if (!address) {
//       return res.status(400).json({ error: 'Address is required' });
//     }

//     const customer = await Customer.findOneAndUpdate(
//       { customerID: customerId },
//       { address },
//       { new: true }
//     );

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(customer);
//   } catch (err) {
//     console.error("Error updating address:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.delete('/customers/:customerId', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const customer = await Customer.findOneAndDelete({ customerID: customerId });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json({ message: 'Customer profile deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

// const express = require('express');
// const Customer = require('../../models/Customer');
// const Transaction = require('../../models/Transaction')
// const Chat = require('../../models/Chat');
// const { authenticateUser }  = require('../../middleware/authentication');
// const router = express.Router();
// const jwt = require("jsonwebtoken");

// // router.get('/customers', authenticateUser,  async (req, res) => {
// //   const byPhoneNumber = req.ByPhoneNumber;

// //   try {
// //     const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });
// //       // .sort({ createdAt: -1 });
// //       res.status(200).json(customers);
// //   } catch (error) {
// //       res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
// //   }
// // });


// router.get('/customers', authenticateUser, async (req, res) => {
//   const byPhoneNumber = req.ByPhoneNumber;

//   try {
//     // Fetch customers for the user
//     const customers = await Customer.find({ ByPhoneNumber: byPhoneNumber });

//     // Fetch unread message counts & latest timestamps
//     const customerData = await Promise.all(
//       customers.map(async (customer) => {
//         try {
//           const lastMessage = await Chat.findOne({
//             $or: [{ sender: customer.phoneNumber }, { receiver: customer.phoneNumber }],
//           })
//             .sort({ timestamp: -1 })
//             .select('timestamp');
    
//           const unreadCount = await Chat.countDocuments({
//             sender: customer.phoneNumber,
//             receiver: byPhoneNumber,
//             isRead: false,
//           });
    
//           return {
//             ...customer._doc,
//             lastMessageTimestamp: lastMessage ? lastMessage.timestamp : 0,
//             unreadCount,
//           };
//         } catch (err) {
//           console.error('Error processing customer:', customer.phoneNumber, err.message);
//           return {
//             ...customer._doc,
//             lastMessageTimestamp: 0,
//             unreadCount: 0,
//             error: 'Chat data unavailable'
//           };
//         }
//       })
//     );
    
    

//     // Sort customers:
//     // 1️⃣ First, by unread messages (higher unread messages come first).
//     // 2️⃣ If unread counts are the same, sort by the latest message timestamp.
//     customerData.sort((a, b) => {
//       if (b.unreadCount !== a.unreadCount) {
//         return b.unreadCount - a.unreadCount; // Higher unread first
//       }
//       return new Date(b.lastMessageTimestamp) - new Date(a.lastMessageTimestamp); // Newest messages first
//     });

//     res.status(200).json(customerData);
//   } catch (error) {
//     res.status(500).json({ message: 'Failed to fetch customers', error: error.message });
//   }
// });








// router.use('/customer_who_added_me', authenticateUser, async (req, res, next) => {

//   const byPhoneNumber = req.ByPhoneNumber; // Assuming the user's phone number is extracted from the JWT.

//   try {
//       const users = await Customer.find({ phoneNumber: byPhoneNumber })
//       // const addedByUsers = users.map((record) => ({
//           // addedByName: record.createdBy.name,
//           // addedByPhone: record.createdBy.phoneNumber,
      
//       res.status(200).json(users);
//   } catch (error) {
//       res.status(500).json({ message: 'Failed to fetch users who added you', error: error.message });
//   }
// });

// router.get("/transactions/summary", authenticateUser, async (req, res) => {
//   try {
//     const myPhoneNumber = req.ByPhoneNumber.toString(); // Ensure it's a string

//     console.log("Fetching transactions for phone:", myPhoneNumber);

//     // Get all received transactions
//     const receivedTransactions = await Transaction.find({ receiver: myPhoneNumber });
//     const totalReceived = receivedTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     // Get all given transactions
//     const givenTransactions = await Transaction.find({ sender: myPhoneNumber });
//     const totalGiven = givenTransactions.reduce((acc, txn) => acc + txn.amount, 0);

//     console.log("Total Received:", totalReceived, "Total Given:", totalGiven);

//     res.json({ totalReceived, totalGiven, userId: req.userId, });
//   } catch (error) {
//     console.error("Error fetching transaction summary:", error);
//     res.status(500).json({ message: "Server Error" });
//   }
// });


// router.get("/ping", (req, res) => {
//   res.send("Backend is alive, Host Vercel, AERO31");
// });


// // GET customer profile
// router.get('/customers/:customerId', authenticateUser, 
//   async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const customer = await Customer.findOne({ customerID: customerId });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(customer);
//   } catch (err) {
//     console.error("Error fetching profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// }
// );

// // UPDATE customer address
// router.put('/customers/:customerId/address', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const { address } = req.body;

//     if (!address) {
//       return res.status(400).json({ error: 'Address is required' });
//     }

//     const customer = await Customer.findOneAndUpdate(
//       { customerID: customerId },
//       { address },
//       { new: true }
//     );

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json(customer);
//   } catch (err) {
//     console.error("Error updating address:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // DELETE customer profile
// router.delete('/customers/:customerId', authenticateUser, async (req, res) => {
//   try {
//     const { customerId } = req.params;
//     const customer = await Customer.findOneAndDelete({ customerID: customerId });

//     if (!customer) {
//       return res.status(404).json({ error: 'Customer not found' });
//     }

//     res.json({ message: 'Customer profile deleted successfully' });
//   } catch (err) {
//     console.error("Error deleting profile:", err);
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;
