// require('dotenv').config(); 
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();
const PORT = process.env.PORT || 5050;
const mongoose = require('mongoose');

const signup = require('./Routes/user_auth/signup');
const login = require('./Routes/user_auth/login');
const otp = require('./Routes/user_auth/otp');
const profile = require('./Routes/user_auth/profile');

const c_detail = require('./Routes/customer/C_detail')
const customer = require('./Routes/customer/customer');
const transactions = require('./Routes/customer/transaction');
const chat = require('./Routes/customer/chat');

const s_detail = require('./Routes/supplier/S_detail');
const supplier = require('./Routes/supplier/supplier');
const suppconnect = require('./Routes/supplier/supp-connect');

const seebycustomer = require('./Routes/look_by_customer/see_by_customer')
const connect = require('./Routes/look_by_customer/connect');

const loanRoutes = require('./Routes/Loans/loanRoutes');
const loanProfile = require('./Routes/Loans/loan-profile');
const evolve = require('./Routes/Loans/evolve');
const add = require('./Routes/Loans/add');
const imageRoutes = require("./Routes/dbs/imageRoutes");
const sigRoute = require('./Routes/Loans/signature/sigRoute');
const imgRoute = require('./Routes/customer/imageRoute');
const docs = require('./Routes/customer/uploads');
const reminderRoutes = require('./Routes/user_auth/reminders');
const Lendertransaction = require('./Routes/Take_Loan/LendertransactionRoute');

const LoanReminder = require('./Routes/Loans/loanReminders');

app.use(bodyParser.json());

app.use(cors({
  origin: [
    'https://czone-credit.web.app',
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3030',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3030'
  ],
  credentials: true
}));

// Initial Routes
app.get("/api/health", (req, res) => res.status(200).json({ status: "ok", message: "API is healthy" }));

// Auth Routes
app.use('/api', signup);
app.use('/api', login);  
app.use('/api', otp);
app.use('/api', profile);

// Loan Reminders (Priority)
app.use('/api', LoanReminder);

// Customer Routes
app.use('/api', c_detail);
app.use('/api', customer);
app.use('/api', transactions);
app.use('/api', chat);
app.use("/api", imgRoute );
app.use("/api", docs );

// Supplier Routes
app.use('/api', s_detail);
app.use('/api', supplier);
app.use('/api', suppconnect);

// Look By Customer Routes
app.use('/api', seebycustomer);
app.use('/api', connect);

// Given Loans Routes
app.use('/api', add);
app.use('/api', loanRoutes);
app.use('/api', loanProfile);
app.use('/api', evolve);
app.use("/api", sigRoute );

// Taken Loans Routes
app.use('/api', require('./Routes/Take_Loan/takeLoanRoutes'));
app.use('/api', Lendertransaction);

// Misc Routes
app.use("/api/images", imageRoutes);
app.use('/api', reminderRoutes);

// AI Routes
app.use('/api/ai/credit-intelligence', require('./Routes/ai/creditIntelligence'));


// Middleware

const mongoURI = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-atlas-indigo-kite:gRWMSMiendHySpHx@atlas-indigo-kite.idyx0mv.mongodb.net/?retryWrites=true&w=majority";

mongoose
  .connect(mongoURI, { useNewUrlParser: true,serverSelectionTimeoutMS: 10000, })
  .then(() => console.log('Connected to MongoDB using Mongoose 8.2.1'))
  .catch((err) => console.error('Connection error:', err));
  
  const db = mongoose.connection;
db.once('open', () => {
  console.log('Connected to MongoDB');
});
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/uploads', express.static('uploads'));

app.use(express.json());

// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.get("/",(req,res) => {
  res.status(200).send("hi, Its working.");
})

// Start the server ui
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


// 00