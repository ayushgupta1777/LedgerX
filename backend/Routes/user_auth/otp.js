const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../../models/user');
const axios = require('axios');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const TWOFACTOR_API_KEY = process.env.TWOFACTOR_API_KEY;

// Temporary storage for OTPs (in production, use Redis or database)
const otpStore = new Map();

// Helper function to generate 4-digit OTP (as per your template)
const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString(); // 4-digit OTP
};

// Helper function to check OTP expiration (5 minutes)
const isOTPExpired = (timestamp) => {
  const expirationTime = 5 * 60 * 1000; // 5 minutes
  return Date.now() - timestamp > expirationTime;
};

// 1️⃣ Send OTP using 2Factor with Custom Template
router.post('/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Validate phone number format
  if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this mobile number' });
    }

    const otp = generateOTP(); // 4-digit OTP
    
    // Store OTP with timestamp
    otpStore.set(mobileNumber, {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send OTP via 2Factor API with Custom Template
    // Using template: "XXXX is your OTP to verify your phone number at LedgerX. Please do not share OTP with anyone."
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${mobileNumber}/${otp}/OTP2`
    );

    if (response.data.Status === 'Success') {
      console.log(`OTP sent to ${mobileNumber}: ${otp}`); // For testing only, remove in production
      res.status(200).json({ 
        message: 'OTP sent successfully to your mobile number',
        sessionId: response.data.Details
      });
    } else {
      throw new Error('Failed to send OTP via 2Factor');
    }
  } catch (error) {
    console.error('Error sending OTP:', error.message);
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.response?.data?.Details || error.message 
    });
  }
});

// 2️⃣ Verify OTP (For Login)
router.post('/verify-otp', async (req, res) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    const storedData = otpStore.get(mobileNumber);

    if (!storedData) {
      return res.status(401).json({ message: 'OTP expired or not found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (isOTPExpired(storedData.timestamp)) {
      otpStore.delete(mobileNumber);
      return res.status(401).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(mobileNumber);
      return res.status(401).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp === otp.toString()) {
      // OTP is correct
      const user = await User.findOne({ mobileNumber });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.userId, 
          mobileNumber: user.mobileNumber,
          email: user.email 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Clear OTP after successful verification
      otpStore.delete(mobileNumber);

      res.status(200).json({ 
        message: 'OTP verified successfully', 
        token,
        user: {
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          mobileNumber: user.mobileNumber
        }
      });
    } else {
      // Increment failed attempts
      storedData.attempts += 1;
      otpStore.set(mobileNumber, storedData);
      
      return res.status(401).json({ 
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` 
      });
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Failed to verify OTP', error: error.message });
  }
});

// 3️⃣ Send OTP for Forgot Password using 2Factor with Custom Template
router.post('/forgot-password/send-otp', async (req, res) => {
  const { mobileNumber } = req.body;

  if (!mobileNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Validate phone number format
  if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Check if user exists
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this mobile number' });
    }

    const otp = generateOTP(); // 4-digit OTP
    
    // Store OTP with timestamp (separate key for forgot password)
    otpStore.set(`forgot_${mobileNumber}`, {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send OTP via 2Factor API with Custom Template (TWOFCT)
    // Template: "XXXX is your OTP to verify your phone number at LedgerX. Please do not share OTP with anyone."
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${mobileNumber}/${otp}/OTP2`
    );

    if (response.data.Status === 'Success') {
      console.log(`Forgot Password OTP sent to ${mobileNumber}: ${otp}`); // For testing only
      res.status(200).json({ 
        message: 'OTP sent successfully to your mobile number',
        sessionId: response.data.Details
      });
    } else {
      throw new Error('Failed to send OTP via 2Factor');
    }
  } catch (error) {
    console.error('Error sending forgot password OTP:', error.message);
    res.status(500).json({ 
      message: 'Failed to send OTP', 
      error: error.response?.data?.Details || error.message 
    });
  }
});

// 4️⃣ Verify OTP for Forgot Password (2FA)
router.post('/forget-password/verify-otp', async (req, res) => {
  const { mobileNumber, otp } = req.body;

  if (!mobileNumber || !otp) {
    return res.status(400).json({ message: 'Phone number and OTP are required' });
  }

  try {
    const storedData = otpStore.get(`forgot_${mobileNumber}`);

    if (!storedData) {
      return res.status(401).json({ message: 'OTP expired or not found. Please request a new OTP.' });
    }

    // Check if OTP is expired
    if (isOTPExpired(storedData.timestamp)) {
      otpStore.delete(`forgot_${mobileNumber}`);
      return res.status(401).json({ message: 'OTP has expired. Please request a new OTP.' });
    }

    // Check attempts
    if (storedData.attempts >= 3) {
      otpStore.delete(`forgot_${mobileNumber}`);
      return res.status(401).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (storedData.otp === otp.toString()) {
      // OTP is correct - mark as verified but don't delete yet
      storedData.verified = true;
      otpStore.set(`forgot_${mobileNumber}`, storedData);
      
      res.status(200).json({ message: 'OTP verified successfully. You can now reset your password.' });
    } else {
      // Increment failed attempts
      storedData.attempts += 1;
      otpStore.set(`forgot_${mobileNumber}`, storedData);
      
      return res.status(401).json({ 
        message: `Invalid OTP. ${3 - storedData.attempts} attempts remaining.` 
      });
    }
  } catch (error) {
    console.error('Error verifying forgot password OTP:', error);
    res.status(500).json({ message: 'Verification failed', error: error.message });
  }
});

// 5️⃣ Reset Password (After OTP Verification)
router.post('/reset-password', async (req, res) => {
  const { mobileNumber, newPassword } = req.body;

  if (!mobileNumber || !newPassword) {
    return res.status(400).json({ message: 'Mobile number and new password are required' });
  }

  // Validate password length
  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    // Check if OTP was verified
    const storedData = otpStore.get(`forgot_${mobileNumber}`);
    
    if (!storedData || !storedData.verified) {
      return res.status(401).json({ message: 'Please verify OTP before resetting password' });
    }

    // Find user
    const user = await User.findOne({ mobileNumber });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password
    user.password = hashedPassword;
    user.updatedAt = new Date();
    await user.save();

    // Clear OTP after successful password reset
    otpStore.delete(`forgot_${mobileNumber}`);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
});

// 6️⃣ Resend OTP (For any purpose)
router.post('/resend-otp', async (req, res) => {
  const { mobileNumber, type } = req.body; // type: 'login' or 'forgot-password'

  if (!mobileNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  // Check rate limiting (prevent spam)
  const key = type === 'forgot-password' ? `forgot_${mobileNumber}` : mobileNumber;
  const existingData = otpStore.get(key);
  
  if (existingData && !isOTPExpired(existingData.timestamp)) {
    const remainingTime = Math.ceil((5 * 60 * 1000 - (Date.now() - existingData.timestamp)) / 1000);
    return res.status(429).json({ 
      message: `Please wait ${remainingTime} seconds before requesting a new OTP` 
    });
  }

  try {
    const otp = generateOTP(); // 4-digit OTP
    
    // Store new OTP
    otpStore.set(key, {
      otp: otp,
      timestamp: Date.now(),
      attempts: 0
    });

    // Send OTP via 2Factor with Custom Template
    const response = await axios.get(
      `https://2factor.in/API/V1/${TWOFACTOR_API_KEY}/SMS/${mobileNumber}/${otp}/OTP2`
    );

    if (response.data.Status === 'Success') {
      console.log(`OTP resent to ${mobileNumber}: ${otp}`);
      res.status(200).json({ 
        message: 'OTP resent successfully',
        sessionId: response.data.Details
      });
    } else {
      throw new Error('Failed to resend OTP');
    }
  } catch (error) {
    console.error('Error resending OTP:', error);
    res.status(500).json({ 
      message: 'Failed to resend OTP', 
      error: error.response?.data?.Details || error.message 
    });
  }
});

module.exports = router;