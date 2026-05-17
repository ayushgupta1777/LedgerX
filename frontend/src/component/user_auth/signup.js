import Message from '../global/alert';
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../style/user_auth/Signup.css";
import CompanyWatermark from "../global/water-mark/CompanyWatermark";
const Signup = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [passwordMatch, setPasswordMatch] = useState(null); // Indicates match status
  const navigate = useNavigate(); // Initialize useNavigate hook

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    // Set timeout to remove the message after 5 seconds
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    // Check if passwords match
    setPasswordMatch(password && confirmPassword && password === confirmPassword);
  }, [password, confirmPassword]);


  const generateUniqueId = (firstName, lastName) => {
    const formattedName = (firstName + lastName).replace(/\s/g, '').toLowerCase();
    const randomNumber = Math.floor(100 + Math.random() * 900);
    return `${formattedName}${randomNumber}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!passwordMatch) {
      showMessage('error', 'Passwords do not match.');
      return;
    }

    const userId = generateUniqueId(firstName, lastName);

    const userData = {
      firstName,
      lastName,
      email,
      mobileNumber,
      password,
      userId,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        showMessage('success', 'User registered successfully!');
        navigate("/login");
      } else {
        const errorData = await response.json(); // Parse error details
        const errorMessage = errorData.message || "Failed to register user."; // Use error message from the server or a fallback
        showMessage("error", errorMessage);
      }
    } catch (error) {
      showMessage('error', 'Error during registration.');
    }
  };
  return (
    <div className="custom-signup-form">
      <h2>Signup</h2>
      <form onSubmit={handleSubmit}>
        <div className="custom-form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="custom-form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
        <div className="custom-form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="custom-form-group">
          <label htmlFor="mobileNumber">Mobile Number</label>
          <input
            type="text"
            id="mobileNumber"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            required
          />
        </div>
        <div className="custom-form-group">
          <label htmlFor="password">Password</label>
          <div className="custom-form-group12">
          <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="toggle-password"
            >
              {passwordVisible ? "👁️" : "👁️‍🗨️"}
            </button>
            </div>
          </div>
        <div className="custom-form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className="password-check">
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            {passwordMatch !== null && (
              <span className={`status-icon ${passwordMatch ? 'match' : 'mismatch'}`}>
                {passwordMatch ? '✔' : '✖'}
              </span>
            )}
          </div>
        </div>
        <button type="submit" disabled={!passwordMatch}>Sign Up</button>
      </form>

              {/* ADD WATERMARK HERE - Above bottom nav */}
        <CompanyWatermark companyName="ADSANGROW" companyUrl="https://adsangrow.com" />

      <Message type={message.type} text={message.text} />
    </div>
  );
};

export default Signup;