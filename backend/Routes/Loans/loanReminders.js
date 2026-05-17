const express = require('express');
const router = express.Router();
const Loan = require('../../models/loans/loanSchema');
const Customer = require('../../models/loans/customer-land');
const Reminder = require('../../models/Reminder'); // Reuse generic reminder for status
const { authenticateUser } = require('../../middleware/authentication');

// GET: Calculate and fetch loan reminders with backend-stored status
router.get('/loan-reminders', authenticateUser, async (req, res) => {
    try {
        const userId = req.userId;
        const loans = await Loan.find({ addedBy: userId, 'loanDetails.loanType': 'With Interest' });
        const customers = await Customer.find({ userId: userId });

        const now = new Date();
        const generatedReminders = [];

        for (const loan of loans) {
            const customer = customers.find(c => c.customerID === loan.customerID);
            const { startDate, interestRate, amount, topUpTotal } = loan.loanDetails || {};

            if (!startDate || !interestRate || !amount) continue;

            const start = new Date(startDate);
            const customerName = customer ? `${customer.FirstName} ${customer.LastName}` : 'Unknown Customer';
            const principal = amount + (topUpTotal || 0);
            const monthlyRate = interestRate / 100;
            const monthlyInterest = principal * monthlyRate;

            let currentReminderDate = new Date(start);
            currentReminderDate.setMonth(currentReminderDate.getMonth() + 1);

            let accumulatedInterest = 0;

            while (currentReminderDate <= now || isSameMonth(currentReminderDate, now)) {
                const periodEnd = new Date(currentReminderDate);
                const periodStart = new Date(currentReminderDate);
                periodStart.setMonth(periodStart.getMonth() - 1);

                accumulatedInterest += monthlyInterest;

                // Unique ID for this specific monthly bucket
                const reminderKey = `loan-interest-${loan._id}-${periodEnd.toISOString().slice(0, 7)}`;

                // Check if this "bucket" is already marked as seen in DB
                const dbReminder = await Reminder.findOne({
                    userId: userId,
                    message: { $regex: reminderKey } // We'll store the key in the message or a dedicated field
                });

                generatedReminders.push({
                    id: reminderKey,
                    customerID: loan.customerID,
                    customerName,
                    period: `${formatDate(periodStart)} to ${formatDate(periodEnd)}`,
                    interestAmount: monthlyInterest,
                    totalAccrued: accumulatedInterest,
                    dueDate: periodEnd,
                    isRead: !!dbReminder
                });

                currentReminderDate.setMonth(currentReminderDate.getMonth() + 1);
            }
        }

        generatedReminders.sort((a, b) => b.dueDate - a.dueDate);
        res.json(generatedReminders);
    } catch (error) {
        console.error('Error calculating loan reminders:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

// PATCH: Mark a specific loan interest bucket as read
router.patch('/loan-reminders/:key/seen', authenticateUser, async (req, res) => {
    try {
        const { key } = req.params;
        const userId = req.userId;

        // Use the Reminder model to store the "Seen" status of a virtual reminder
        // This is a minimal way to persist state without a new schema
        let dbReminder = await Reminder.findOne({ userId, message: { $regex: key } });

        if (!dbReminder) {
            dbReminder = new Reminder({
                customerID: 'SYSTEM', // Virtual
                customerName: 'Loan Reminder System',
                phoneNumber: 'N/A',
                reminderDate: new Date(),
                message: `STATUS_KEY:${key}`, // Embed the key in message
                userId: userId,
                isSeen: true,
                isActive: false // Don't show in regular reminders
            });
            await dbReminder.save();
        }

        res.json({ message: 'Marked as read', key });
    } catch (error) {
        console.error('Error marking loan reminder as read:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

function isSameMonth(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth();
}

function formatDate(date) {
    const d = new Date(date);
    const day = d.getDate();
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${day} ${monthNames[d.getMonth()]}`;
}

module.exports = router;
