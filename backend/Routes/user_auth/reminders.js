const express = require('express');
const router = express.Router();
const Reminder = require('../../models/Reminder'); // Mongoose model
const Customer = require('../../models/Customer'); // Assuming you have this
const { authenticateUser } = require('../../middleware/authentication'); // Authentication middleware
const cron = require('node-cron');
// const admin = require('./firebaseAdmin');

const getFcmTokenForUser = async (userId) => {
  try {
    const User = require('../../models/user'); // Adjust path as needed
    const user = await User.findOne({userId: userId});
    return user?.fcmToken || null;
  } catch (error) {
    console.error('Error fetching FCM token:', error);
    return null;
  }
};


// const sendPushNotification = async ({ title, body, token }) => {
//   try {
//     const message = {
//       notification: { title, body },
//       token: token,
//     };

//     const response = await admin.messaging().send(message);
//     console.log('Notification sent:', response);
//   } catch (error) {
//     console.error('Error sending notification:', error.message);
//   }
// };


// GET: All reminders for a user
// router.get('/reminders', authenticateUser, async (req, res) => {
//   try {
//     const userId = req.userId;

//     // Fetch reminders with customer details
//     const reminders = await Reminder.find({userId: userId})
//       // .populate('customerID', 'customerName') // Populate customer name
//       // .sort({ reminderDate: 1 });

//     res.json(reminders);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// POST: Create a new reminder
router.post('/reminderss', authenticateUser, async (req, res) => {
  try {
    const { customerID, customerName, reminderDate, message, phoneNumber, priority } = req.body;
    const userId = req.userId;

    const newReminder = new Reminder({
      customerID,
      customerName,
      reminderDate,
      message,
      phoneNumber,
      userId,
      isActive: true,
      isSeen: false,
      isDismissed: false,
      priority, // Default priority
    });

    const savedReminder = await newReminder.save();

    // Schedule notification
    scheduleNotification(savedReminder._id, reminderDate, message, customerName);

    res.status(201).json({
      id: savedReminder._id,
      message: 'Reminder created successfully'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to schedule a reminder notification (backend-only logging)
function scheduleNotification(reminderId, reminderDate, message, customerName) {
  const now = new Date();
  const scheduledTime = new Date(reminderDate);
  const delay = scheduledTime.getTime() - now.getTime();

  if (delay > 0) {
    setTimeout(async () => {
      console.log(`Reminder: ${message} for ${customerName}`);

      // TODO: Trigger push/email/other notification service here

      // Mark as inactive
      await Reminder.findByIdAndUpdate(reminderId, { isActive: true });
    }, delay);
  }
}

// CRON: Run every minute to check missed reminders

cron.schedule('* * * * *', async () => {

//   admin.messaging().send({
//   notification: {
//     title: "Manual Test",
//     body: "Hello from backend",
//   },
//   token: "cROcpgAqpv53cQz2uMDDrw:APA91bHfvVYvyYbs0lwe9-fQieyR5kX0Wh3fTExwkyR1uLcVxW67SsFsj-IE-hqYiW_uHBB96QIH76HmLTcjU3w7f8299fKd87Mi0v4ncBzdryrGioLRq98"
// });

  const now = new Date();

  // 1. Find due reminders
  const reminders = await Reminder.find({ reminderDate: { $lte: now }, isActive: true });

  for (let reminder of reminders) {
    // 2. Send notification HERE
    const fcmToken = await getFcmTokenForUser(reminder.userId); // You must store tokens during login

    if (fcmToken) {
      await sendPushNotification({
        title: `Reminder: ${reminder.customerName}`,
        body: reminder.message,
        token: fcmToken
      });
    }
    console.log(`[CRON] Checking reminders at ${new Date().toISOString()}`);
console.log(`[CRON] Found ${reminders.length} due reminders`);
console.log(`[CRON] Sending to token: ${fcmToken}`);


    // 3. Mark reminder inactive
    // reminder.isActive = false;
    await reminder.save();
  }
});

// New  reminder endpoint


// GET /api/reminders - Get all reminders with filtering
router.get('/reminders', authenticateUser, async (req, res) => {
  try {
    const { status, priority, reminderType, customerName, startDate, endDate } = req.query;
    const userId = req.userId;

    // Build query object
    let query = { userId, isActive: true };

    // Apply status filters
    if (status) {
      switch (status) {
        case 'active':
          query.isDismissed = false;
          break;
        case 'dismissed':
          query.isDismissed = true;
          break;
        case 'unseen':
          query.isSeen = false;
          query.isDismissed = false;
          break;
        case 'seen':
          query.isSeen = true;
          break;
        case 'overdue':
          query.reminderDate = { $lt: new Date() };
          query.isDismissed = false;
          break;
        case 'today':
          const today = new Date();
          const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
          const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
          query.reminderDate = { $gte: startOfDay, $lt: endOfDay };
          query.isDismissed = false;
          break;
        case 'upcoming':
          query.reminderDate = { $gte: new Date() };
          query.isDismissed = false;
          break;
      }
    }

    // Apply priority filter
    if (priority && priority !== 'all') {
      query.priority = priority;
    }

    // Apply reminder type filter
    if (reminderType && reminderType !== 'all') {
      query.reminderType = reminderType;
    }

    // Apply customer name filter (case-insensitive search)
    if (customerName) {
      query.customerName = { $regex: customerName, $options: 'i' };
    }

    // Apply date range filter
    if (startDate || endDate) {
      query.reminderDate = {};
      if (startDate) {
        query.reminderDate.$gte = new Date(startDate);
      }
      if (endDate) {
        query.reminderDate.$lte = new Date(endDate);
      }
    }

    // Get reminders with sorting
    const reminders = await Reminder.find(query)
      .sort({ 
        isDismissed: 1,           // Active reminders first
        isSeen: 1,                // Unseen reminders first
        reminderDate: 1,          // Earlier dates first
        priority: -1,             // High priority first (custom sort needed)
        createdAt: -1             // Newest first
      });

    // Custom priority sorting (high -> medium -> low)
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    reminders.sort((a, b) => {
      // First sort by dismissed status
      if (a.isDismissed !== b.isDismissed) {
        return a.isDismissed - b.isDismissed;
      }
      // Then by seen status (unseen first)
      if (a.isSeen !== b.isSeen) {
        return a.isSeen - b.isSeen;
      }
      // Then by priority
      const priorityDiff = (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      // Finally by reminder date
      return new Date(a.reminderDate) - new Date(b.reminderDate);
    });

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching reminders:', error);
    res.status(500).json({ message: 'Server error while fetching reminders', error: error.message });
  }
});

// GET /api/reminders/stats - Get reminder statistics
router.get('/reminders/stats', authenticateUser, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    
    // Get start and end of today
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
    
    // Get start of current week (assuming week starts on Sunday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    // Base query for active reminders
    const baseQuery = { userId, isActive: true };

    // Run all stat queries in parallel
    const [
      totalReminders,
      activeReminders,
      unseenReminders,
      dismissedReminders,
      dueTodayReminders,
      overdueReminders,
      thisWeekReminders,
      highPriorityReminders,
      mediumPriorityReminders,
      lowPriorityReminders,
      emailReminders,
      smsReminders,
      pushReminders,
      followupReminders,
      paymentReminders,
      generalReminders
    ] = await Promise.all([
      // Total count
      Reminder.countDocuments(baseQuery),
      
      // Active (not dismissed)
      Reminder.countDocuments({ ...baseQuery, isDismissed: false }),
      
      // Unseen and not dismissed
      Reminder.countDocuments({ ...baseQuery, isSeen: false, isDismissed: false }),
      
      // Dismissed
      Reminder.countDocuments({ ...baseQuery, isDismissed: true }),
      
      // Due today (not dismissed)
      Reminder.countDocuments({
        ...baseQuery,
        isDismissed: false,
        reminderDate: { $gte: startOfDay, $lt: endOfDay }
      }),
      
      // Overdue (not dismissed)
      Reminder.countDocuments({
        ...baseQuery,
        isDismissed: false,
        reminderDate: { $lt: now }
      }),
      
      // This week (not dismissed)
      Reminder.countDocuments({
        ...baseQuery,
        isDismissed: false,
        reminderDate: { $gte: startOfWeek, $lt: endOfWeek }
      }),
      
      // By Priority
      Reminder.countDocuments({ ...baseQuery, priority: 'high' }),
      Reminder.countDocuments({ ...baseQuery, priority: 'medium' }),
      Reminder.countDocuments({ ...baseQuery, priority: 'low' }),
      
      // By Reminder Type
      Reminder.countDocuments({ ...baseQuery, reminderType: 'email' }),
      Reminder.countDocuments({ ...baseQuery, reminderType: 'sms' }),
      Reminder.countDocuments({ ...baseQuery, reminderType: 'push' }),
      Reminder.countDocuments({ ...baseQuery, reminderType: 'followup' }),
      Reminder.countDocuments({ ...baseQuery, reminderType: 'payment' }),
      Reminder.countDocuments({ ...baseQuery, reminderType: 'general' })
    ]);

    // Calculate upcoming (next 7 days, excluding today)
    const tomorrowStart = new Date(endOfDay);
    const nextWeekEnd = new Date(tomorrowStart);
    nextWeekEnd.setDate(tomorrowStart.getDate() + 6);
    
    const upcomingReminders = await Reminder.countDocuments({
      ...baseQuery,
      isDismissed: false,
      reminderDate: { $gte: tomorrowStart, $lt: nextWeekEnd }
    });

    const stats = {
      total: totalReminders,
      active: activeReminders,
      unseen: unseenReminders,
      dismissed: dismissedReminders,
      dueToday: dueTodayReminders,
      overdue: overdueReminders,
      thisWeek: thisWeekReminders,
      upcoming: upcomingReminders,
      byPriority: {
        high: highPriorityReminders,
        medium: mediumPriorityReminders,
        low: lowPriorityReminders
      },
      byType: {
        email: emailReminders,
        sms: smsReminders,
        push: pushReminders,
        followup: followupReminders,
        payment: paymentReminders,
        general: generalReminders
      },
      summary: {
        needsAttention: unseenReminders + overdueReminders,
        completionRate: totalReminders > 0 ? Math.round((dismissedReminders / totalReminders) * 100) : 0
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Error fetching reminder stats:', error);
    res.status(500).json({ message: 'Server error while fetching stats', error: error.message });
  }
});

// GET /api/reminders/:id - Get single reminder
router.get('/reminders/:id', authenticateUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOne({
      _id: req.params.id,
      userId: req.userId,
      isActive: true
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error fetching reminder:', error);
    res.status(500).json({ message: 'Server error while fetching reminder', error: error.message });
  }
});

// POST /api/reminders - Create new reminder
router.post('/reminders', authenticateUser, async (req, res) => {
  try {
    const {
      customerID,
      customerName,
      phoneNumber,
      reminderDate,
      message,
      priority = 'medium',
      reminderType = 'followup'
    } = req.body;

    // Validation
    if (!customerID || !customerName || !phoneNumber || !reminderDate || !message) {
      return res.status(400).json({
        message: 'Missing required fields: customerID, customerName, phoneNumber, reminderDate, message'
      });
    }

    const newReminder = new Reminder({
      customerID,
      customerName,
      phoneNumber,
      reminderDate: new Date(reminderDate),
      message,
      priority,
      reminderType,
      userId: req.userId
    });

    const savedReminder = await newReminder.save();
    res.status(201).json(savedReminder);
  } catch (error) {
    console.error('Error creating reminder:', error);
    res.status(500).json({ message: 'Server error while creating reminder', error: error.message });
  }
});

// PATCH /api/reminders/:id/seen - Mark reminder as seen
router.patch('/reminders/:id/seen', authenticateUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        isSeen: true, 
        seenAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error marking reminder as seen:', error);
    res.status(500).json({ message: 'Server error while updating reminder', error: error.message });
  }
});

// PATCH /api/reminders/:id/dismiss - Dismiss reminder
router.patch('/reminders/:id/dismiss', authenticateUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        isDismissed: true, 
        dismissedAt: new Date(),
        isSeen: true, // Auto-mark as seen when dismissed
        seenAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error dismissing reminder:', error);
    res.status(500).json({ message: 'Server error while dismissing reminder', error: error.message });
  }
});

// PATCH /api/reminders/:id/restore - Restore dismissed reminder
router.patch('/reminders/:id/restore', authenticateUser, async (req, res) => {
  try {
    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { 
        isDismissed: false, 
        dismissedAt: null,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error restoring reminder:', error);
    res.status(500).json({ message: 'Server error while restoring reminder', error: error.message });
  }
});

// PUT /api/reminders/:id - Update reminder
router.put('/reminders/:id', authenticateUser, async (req, res) => {
  try {
    const {
      customerName,
      phoneNumber,
      reminderDate,
      message,
      priority,
      reminderType
    } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    // Only update provided fields
    if (customerName) updateData.customerName = customerName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (reminderDate) updateData.reminderDate = new Date(reminderDate);
    if (message) updateData.message = message;
    if (priority) updateData.priority = priority;
    if (reminderType) updateData.reminderType = reminderType;

    const reminder = await Reminder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId, isActive: true },
      updateData,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json(reminder);
  } catch (error) {
    console.error('Error updating reminder:', error);
    res.status(500).json({ message: 'Server error while updating reminder', error: error.message });
  }
});

// DELETE /api/reminders/:id - Soft delete reminder
// router.delete('/reminders/:id', authenticateUser, async (req, res) => {
//   try {
//     const reminder = await Reminder.findOneAndUpdate(
//       { _id: req.params.id, userId: req.userId },
//       { 
//         isActive: false,
//         updatedAt: new Date()
//       },
//       { new: true }
//     );

//     if (!reminder) {
//       return res.status(404).json({ message: 'Reminder not found' });
//     }

//     res.json({ message: 'Reminder deleted successfully' });
//   } catch (error) {
//     console.error('Error deleting reminder:', error);
//     res.status(500).json({ message: 'Server error while deleting reminder', error: error.message });
//   }
// });

// GET /api/reminders/search - Search reminders

router.get('/reminders/search', authenticateUser, async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const reminders = await Reminder.find({
      userId: req.userId,
      isActive: true,
      $or: [
        { customerName: { $regex: q, $options: 'i' } },
        { message: { $regex: q, $options: 'i' } },
        { phoneNumber: { $regex: q, $options: 'i' } }
      ]
    })
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });

    res.json(reminders);
  } catch (error) {
    console.error('Error searching reminders:', error);
    res.status(500).json({ message: 'Server error while searching reminders', error: error.message });
  }
});

// GET /api/reminders/upcoming - Get upcoming reminders (next 7 days)
router.get('/reminders/upcoming', authenticateUser, async (req, res) => {
  try {
    const now = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(now.getDate() + 7);

    const reminders = await Reminder.find({
      userId: req.userId,
      isActive: true,
      isDismissed: false,
      reminderDate: { $gte: now, $lte: nextWeek }
    })
    .sort({ reminderDate: 1 })
    .limit(20);

    res.json(reminders);
  } catch (error) {
    console.error('Error fetching upcoming reminders:', error);
    res.status(500).json({ message: 'Server error while fetching upcoming reminders', error: error.message });
  }
});

// PATCH /api/reminders/bulk/seen - Mark multiple reminders as seen
router.patch('/reminders/bulk/seen', authenticateUser, async (req, res) => {
  try {
    const { reminderIds } = req.body;

    if (!Array.isArray(reminderIds) || reminderIds.length === 0) {
      return res.status(400).json({ message: 'reminderIds array is required' });
    }

    const result = await Reminder.updateMany(
      { 
        _id: { $in: reminderIds }, 
        userId: req.userId 
      },
      { 
        isSeen: true, 
        seenAt: new Date(),
        updatedAt: new Date()
      }
    );

    res.json({ 
      message: `${result.modifiedCount} reminders marked as seen`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk marking as seen:', error);
    res.status(500).json({ message: 'Server error while bulk updating reminders', error: error.message });
  }
});

// PATCH /api/reminders/bulk/dismiss - Dismiss multiple reminders
router.patch('/reminders/bulk/dismiss', authenticateUser, async (req, res) => {
  try {
    const { reminderIds } = req.body;

    if (!Array.isArray(reminderIds) || reminderIds.length === 0) {
      return res.status(400).json({ message: 'reminderIds array is required' });
    }

    const result = await Reminder.updateMany(
      { 
        _id: { $in: reminderIds }, 
        userId: req.userId 
      },
      { 
        isDismissed: true, 
        dismissedAt: new Date(),
        isSeen: true,
        seenAt: new Date(),
        updatedAt: new Date()
      }
    );

    res.json({ 
      message: `${result.modifiedCount} reminders dismissed`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error bulk dismissing:', error);
    res.status(500).json({ message: 'Server error while bulk dismissing reminders', error: error.message });
  }
});

module.exports = router;



