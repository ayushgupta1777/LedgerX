import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Message from '../global/alert';
import "../../style/user_auth/Login.css";
import "../../style/user_auth/CombinedAuth.css"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFacebook, faTwitter, faGoogle } from "@fortawesome/free-brands-svg-icons";


const CombinedAuth = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Login, 2: OTP Verification
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(["", "", "", "", "", ""]); // Array of 6 empty strings
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        mobileNumber,
        password,
      });

      if (response) {
        showMessage('success', 'Login credentials verified. Sending OTP...');
        setStep(2); // Proceed to OTP verification
        await sendOtp(); // Automatically send OTP after login verification
      } else {
        showMessage('error', response.data.message || 'Invalid credentials');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error during login');
    }
  };

  const autoFillOtp = (newOtp) => {
    if (newOtp.length === otp.length) {
      setOtp(newOtp.split("")); // Convert OTP string to array
    }
  };

  const sendOtp = async () => {
    try {
      setOtp(["", "", "", "", "", ""]);
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/send-otp`, {
        mobileNumber,
      });

    

      if (response) {
        showMessage('success', 'OTP sent successfully.');

        if (response.data.otp) {
              setTimeout(() => autoFillOtp(response.data.otp), 1000);
            }

        startResendTimer(); // Start the resend timer
      } else {
        showMessage('error', response.data.message || 'Failed to send OTP');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error sending OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/verify-otp`, {
        mobileNumber,
        otp: otp.join(""),
            });

      if (response) {
        const token = response.data.token;
        if (token) {
          // Store the token and redirect to home
          localStorage.setItem('token', token);
          showMessage('success', 'OTP verified successfully. Redirecting...');
          setTimeout(() => navigate('/'), 2000);
        } else {
          showMessage('error', 'Token not received from server.');
        }
      } else {
        showMessage('error', response.data.message || 'Invalid OTP');
      }
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error verifying OTP');
    }
  };

  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
  
      // Move focus to the next input
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };
  
  
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d{6}$/.test(pasteData)) {
      setOtp(pasteData.split(""));
      document.getElementById(`otp-input-5`).focus();
    }
  };


  const startResendTimer = () => {
    // setOtp("")
    setIsResendDisabled(true);
    setResendTimer(60);

    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev === 1) {
          clearInterval(interval);
          setIsResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="log-body">
       
      
      {step === 1 ? (
        <>
        <div className="login-form">
<h1 className="log-h2">Sign up</h1>
          <form onSubmit={handleLogin}>
          <div className="form-group">
          <label className="log-labal" htmlFor="mobileNumber">Mobile Number</label>
            <input
                className="log-input"
                id="mobileNumber"
                type="mobileNumber"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="Enter your mobile number"
                required
              />
            </div>
            <div className="form-group">
            <label className="log-labal" htmlFor="password">Password</label>
            <input
                className="log-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
           className="log-button"
            >
              Click for SIGN UP
            </button>
            <a className="button-a" href="/forgot-password">Forgot password?</a>
                <div className="social-login">
                    <p>Or Sign Up Using</p>
                    <div className="social-icons">
                      <FontAwesomeIcon icon={faFacebook} className="social-icon facebook" />
                      <FontAwesomeIcon icon={faTwitter} className="social-icon twitter" />
                      <FontAwesomeIcon icon={faGoogle} className="social-icon google" />
                    </div>
                </div>
                <a className="button-a" href="/signup">SIGN UP</a>

            
          </form>
          </div>
        </>
      ) : (
        <div className="otp-container">
            <h2>Enter OTP Code</h2>
            <div className="otp-inputs" onPaste={handlePaste} >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-input-${index}`}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onKeyDown={(e) => handleKeyDown(e, index)}

                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  className="otp-input"
                />
              ))}
            </div>
            <button onClick={verifyOtp} className="otp-button">
              Verify OTP
            </button>
            <button
              onClick={sendOtp}
              disabled={isResendDisabled}
              className="otp-resend-button"
            >
              {isResendDisabled
                ? `Resend OTP in ${resendTimer}s`
                : "Resend OTP"}
            </button>
          </div>
        )}
        {/* {message.text && (
          <p
            className={`auth-message ${
              message.type === "success" ? "success" : "error"
            }`}
          >
            {message.text}
          </p>
        )} */}
      <Message type={message.type} text={message.text} />
 
    </div>
  );
};

export default CombinedAuth;
