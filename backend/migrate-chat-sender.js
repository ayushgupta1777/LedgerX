// migration_fix_string_types.js
// Run this ONCE to fix existing data after schema changes

const mongoose = require('mongoose');
const Chat = require('./models/Chat');
const Transaction = require('./models/Transaction');
const Customer = require('./models/Customer');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://ayush1777:agr11@cluster0.0128p.mongodb.net/FOILAR';

async function migrateData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Connected to MongoDB');
    console.log('Starting data migration...\n');

    // ✅ Fix Chat collection - Convert sender/receiver to strings
    console.log('🔄 Migrating Chat collection...');
    const chats = await Chat.find({});
    let chatUpdated = 0;

    for (const chat of chats) {
      const updates = {};
      
      if (typeof chat.sender !== 'string') {
        updates.sender = String(chat.sender);
      }
      
      if (typeof chat.receiver !== 'string') {
        updates.receiver = String(chat.receiver);
      }

      if (Object.keys(updates).length > 0) {
        await Chat.updateOne({ _id: chat._id }, { $set: updates });
        chatUpdated++;
      }
    }
    console.log(`✅ Updated ${chatUpdated} chat records\n`);

    // ✅ Fix Transaction collection - Convert sender/receiver to strings
    console.log('🔄 Migrating Transaction collection...');
    const transactions = await Transaction.find({});
    let transactionUpdated = 0;

    for (const txn of transactions) {
      const updates = {};
      
      if (typeof txn.sender !== 'string') {
        updates.sender = String(txn.sender);
      }
      
      if (typeof txn.receiver !== 'string') {
        updates.receiver = String(txn.receiver);
      }

      if (typeof txn.customerID !== 'string') {
        updates.customerID = String(txn.customerID);
      }

      if (typeof txn.createdBy !== 'string') {
        updates.createdBy = String(txn.createdBy);
      }

      if (txn.updatedBy && typeof txn.updatedBy !== 'string') {
        updates.updatedBy = String(txn.updatedBy);
      }

      if (Object.keys(updates).length > 0) {
        await Transaction.updateOne({ _id: txn._id }, { $set: updates });
        transactionUpdated++;
      }
    }
    console.log(`✅ Updated ${transactionUpdated} transaction records\n`);

    // ✅ Fix Customer collection - Ensure phone numbers are strings
    console.log('🔄 Migrating Customer collection...');
    const customers = await Customer.find({});
    let customerUpdated = 0;

    for (const customer of customers) {
      const updates = {};
      
      if (typeof customer.phoneNumber !== 'string') {
        updates.phoneNumber = String(customer.phoneNumber);
      }
      
      if (typeof customer.ByPhoneNumber !== 'string') {
        updates.ByPhoneNumber = String(customer.ByPhoneNumber);
      }

      if (typeof customer.customerID !== 'string') {
        updates.customerID = String(customer.customerID);
      }

      if (Object.keys(updates).length > 0) {
        await Customer.updateOne({ _id: customer._id }, { $set: updates });
        customerUpdated++;
      }
    }
    console.log(`✅ Updated ${customerUpdated} customer records\n`);

    // ✅ Verify data integrity
    console.log('🔍 Verifying data integrity...');
    
    const sampleChat = await Chat.findOne({});
    console.log('Sample Chat sender type:', typeof sampleChat?.sender);
    
    const sampleTxn = await Transaction.findOne({});
    console.log('Sample Transaction sender type:', typeof sampleTxn?.sender);
    
    const sampleCustomer = await Customer.findOne({});
    console.log('Sample Customer phoneNumber type:', typeof sampleCustomer?.phoneNumber);

    console.log('\n✅ Migration completed successfully!');
    console.log('Summary:');
    console.log(`- Chats updated: ${chatUpdated}`);
    console.log(`- Transactions updated: ${transactionUpdated}`);
    console.log(`- Customers updated: ${customerUpdated}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
}

// Run migration
migrateData();

// To run this script:
// node migration_fix_string_types.js