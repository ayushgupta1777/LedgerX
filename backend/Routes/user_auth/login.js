const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || 'anykey';
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Login with Email OR Phone Number
router.post('/login', async (req, res) => {
  try {
    const { email, mobileNumber, password } = req.body;

    // Check if either email or mobileNumber is provided
    if (!email && !mobileNumber) {
      return res.status(400).json({ message: 'Email or Mobile Number is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Find user by email OR mobile number
    let user;
    if (email) {
      user = await User.findOne({ email });
    } else if (mobileNumber) {
      user = await User.findOne({ mobileNumber });
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found. Please check your credentials.' });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId, mobileNumber: user.mobileNumber, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.status(200).json({ 
      message: 'Login successful', 
      token,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Error during login' });
  }
});

// Google Authentication - Only for EXISTING users
router.post('/auth/google', async (req, res) => {
  try {
    console.log("Google auth request received");
    const { token, email } = req.body;
    
    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google payload received:", payload);
    const { email: googleEmail, name, sub } = payload;

    // Check if user EXISTS with this email
    let user = await User.findOne({ email: googleEmail });

    if (!user) {
      // User does NOT exist - Google login is ONLY for existing users
      return res.status(404).json({ 
        error: 'No account found with this email. Please sign up first or login with phone number and password.' 
      });
    }

    // User exists - allow login
    console.log("User found with email:", googleEmail);

    // Update last login or any other fields if needed
    // user.lastLogin = new Date();
    // await user.save();

    // Generate JWT token
    const jwtToken = jwt.sign(
      { userId: user.userId, mobileNumber: user.mobileNumber, email: user.email },
      jwtSecret,
      { expiresIn: '24h' }
    );       

    console.log("Google authentication successful");
    res.status(200).json({ 
      token: jwtToken,
      user: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber
      }
    });
  } catch (error) {
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
});

module.exports = router;