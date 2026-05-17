const express = require('express');
const router = express.Router();
const User = require('../../models/user');
const bcrypt = require('bcrypt');

router.post('/signup', async (req, res) => {
  try {
    const { firstName, lastName, email, mobileNumber, password, userId } = req.body;

    // Validation
    if (!firstName || !lastName || !email || !mobileNumber || !password) {
      return res.status(400).json({ 
        message: 'All fields are required: firstName, lastName, email, mobileNumber, password' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }

    // Validate mobile number format (10 digits)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      return res.status(400).json({ message: 'Mobile number must be 10 digits' });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user already exists with email
    const existingUserByEmail = await User.findOne({ email: email.toLowerCase() });
    if (existingUserByEmail) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Check if user already exists with mobile number
    const existingUserByPhone = await User.findOne({ mobileNumber });
    if (existingUserByPhone) {
      return res.status(400).json({ message: 'User with this mobile number already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate userId if not provided
    const generatedUserId = userId || 'U' + Date.now().toString() + Math.random().toString(36).substring(2, 7).toUpperCase();

    // Create new user
    const newUser = new User({
      firstName,
      lastName,
      email: email.toLowerCase(),
      mobileNumber,
      password: hashedPassword,
      userId: generatedUserId,
      isEmailVerified: false,
      isPhoneVerified: false,
      accountStatus: 'active'
    });

    // Save the user to the database
    await newUser.save();

    res.status(201).json({ 
      message: 'User created successfully',
      userId: generatedUserId
    });
  } catch (error) {
    if (error.code === 11000) {
      // Duplicate key error
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ 
        error: `A user with this ${field} already exists` 
      });
    }
    
    console.error('Error creating user:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      message: 'Failed to create user account' 
    });
  }
});

module.exports = router;