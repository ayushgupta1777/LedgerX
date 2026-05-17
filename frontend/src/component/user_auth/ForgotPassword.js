import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Message from "../global/alert";
import "../../style/user_auth/ForgotPassword.css";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Enter phone, 2: OTP, 3: Reset Password
  const [mobileNumber, setMobileNumber] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]); // 4-digit OTP for LedgerX template
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    setPasswordMatch(newPassword === confirmPassword && newPassword.length > 0);
  }, [newPassword, confirmPassword]);

  // Resend OTP Timer
  useEffect(() => {
    let interval;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // Step 1: Send OTP to Mobile with 2Factor (LedgerX Template)
  const sendOtp = async () => {
    if (!mobileNumber || mobileNumber.length !== 10) {
      showMessage("error", "Please enter a valid 10-digit mobile number");
      return;
    }

    // Validate Indian mobile number
    if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
      showMessage("error", "Please enter a valid Indian mobile number");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/forgot-password/send-otp`,
        { mobileNumber }
      );

      if (response.status === 200) {
        showMessage("success", "4-digit OTP sent to your mobile via LedgerX");
        setStep(2);
        setResendTimer(60); // 60 seconds cooldown
      } else {
        showMessage("error", response.data.message || "Failed to send OTP");
      }
    } catch (error) {
      console.error('Send OTP Error:', error);
      showMessage(
        "error", 
        error.response?.data?.message || "Error sending OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Resend OTP using 2Factor
  const resendOtp = async () => {
    if (resendTimer > 0) return;
    
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/resend-otp`,
        { 
          mobileNumber,
          type: 'forgot-password'
        }
      );

      if (response.status === 200) {
        showMessage("success", "OTP resent successfully");
        setResendTimer(60); // 60 seconds cooldown
        // Clear existing OTP inputs
        setOtp(["", "", "", ""]);
      }
    } catch (error) {
      showMessage(
        "error", 
        error.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP (2FA using 2Factor)
  const verifyOtp = async () => {
    const otpCode = otp.join("");
    
    if (otpCode.length !== 4) {
      showMessage("error", "Please enter complete 4-digit OTP");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/forget-password/verify-otp`,
        {
          mobileNumber,
          otp: otpCode,
        }
      );

      if (response.status === 200) {
        showMessage("success", "OTP verified successfully");
        setStep(3);
      } else {
        showMessage("error", response.data.message || "Invalid OTP");
      }
    } catch (error) {
      console.error('Verify OTP Error:', error);
      showMessage(
        "error", 
        error.response?.data?.message || "Invalid OTP. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const resetPassword = async () => {
    if (!passwordMatch) {
      showMessage("error", "Passwords do not match!");
      return;
    }

    if (newPassword.length < 6) {
      showMessage("error", "Password must be at least 6 characters long");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/reset-password`,
        {
          mobileNumber,
          newPassword,
        }
      );

      if (response.status === 200) {
        showMessage("success", "Password reset successfully! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        showMessage("error", response.data.message || "Failed to reset password");
      }
    } catch (error) {
      console.error('Reset Password Error:', error);
      showMessage(
        "error", 
        error.response?.data?.message || "Error resetting password"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP Input with auto-focus (4 digits)
  const handleOtpChange = (value, index) => {
    if (/^\d*$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);

      // Auto focus next input
      if (value && index < otp.length - 1) {
        document.getElementById(`otp-input-${index + 1}`).focus();
      }
    }
  };

  // Handle OTP Backspace
  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-input-${index - 1}`).focus();
    }
  };

  // Handle Paste OTP (4 digits)
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    if (/^\d{4}$/.test(pastedData)) {
      const otpArray = pastedData.split('');
      setOtp(otpArray);
      // Focus last input
      document.getElementById(`otp-input-3`).focus();
    }
  };

  return (
    <div className="forgot-password-container">
      {step === 1 && (
        <div className="step-container">
          <h2>Forgot Password</h2>
          <p className="step-description">
            Enter your mobile number to receive 4-digit OTP from LedgerX
          </p>
          <div className="phone-input-wrapper">
            <span className="country-code">+91</span>
            <input
              type="tel"
              placeholder="Enter 10-digit mobile number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
              maxLength="10"
              required
            />
          </div>
          <button 
            onClick={sendOtp} 
            className="otp-button"
            disabled={isLoading || mobileNumber.length !== 10}
          >
            {isLoading ? 'Sending OTP...' : 'Send OTP'}
          </button>
          <button 
            onClick={() => navigate('/login')} 
            className="back-button"
          >
            Back to Login
          </button>
          
          <div className="info-text">
            <p>🔒 Secured by 2Factor Authentication</p>
            <p>You will receive a 4-digit OTP from LedgerX</p>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="step-container">
          <h2>Enter 4-Digit OTP</h2>
          <p className="step-description">
            We've sent a 4-digit OTP to +91 {mobileNumber}
          </p>
          <p className="otp-template-info">
            Message: "XXXX is your OTP to verify your phone number at LedgerX"
          </p>
          <div className="otp-inputs otp-4digit" onPaste={handleOtpPaste}>
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-input-${index}`}
                type="text"
                inputMode="numeric"
                pattern="\d*"
                maxLength="1"
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                onKeyDown={(e) => handleOtpKeyDown(e, index)}
                className="otp-input"
              />
            ))}
          </div>
          
          <p className="otp-hint">💡 Tip: You can paste the entire 4-digit OTP</p>
          
          <button 
            onClick={verifyOtp} 
            className="otp-button"
            disabled={isLoading || otp.join('').length !== 4}
          >
            {isLoading ? 'Verifying...' : 'Verify OTP'}
          </button>
          
          <div className="resend-container">
            {resendTimer > 0 ? (
              <p className="resend-timer">
                Resend OTP in <strong>{resendTimer}s</strong>
              </p>
            ) : (
              <button 
                onClick={resendOtp} 
                className="resend-button"
                disabled={isLoading}
              >
                {isLoading ? 'Resending...' : 'Resend OTP'}
              </button>
            )}
          </div>

          <button 
            onClick={() => {
              setStep(1);
              setOtp(["", "", "", ""]);
            }} 
            className="back-button"
          >
            Change Number
          </button>
          
          <div className="security-badge">
            <span>🔐 LedgerX • Secured by 2Factor</span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="step-container">
          <h2>Reset Password</h2>
          <p className="step-description">Create a new secure password</p>
          
          <div className="password-field">
            <input
              type={passwordVisible ? "text" : "password"}
              placeholder="Enter new password (min 6 characters)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
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

          <div className="password-check">
            <input
              type={confirmPasswordVisible ? "text" : "password"}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <button 
              type="button" 
              onClick={toggleConfirmPasswordVisibility} 
              className="toggle-password"
            >
              {confirmPasswordVisible ? "👁️" : "👁️‍🗨️"}
            </button>
            
            {passwordMatch !== null && (
              <span className={`status-icon ${passwordMatch ? "match" : "mismatch"}`}>
                {passwordMatch ? "✓ Passwords match" : "✗ Passwords do not match"}
              </span>
            )}
          </div>

          <div className="password-requirements">
            <p>Password Requirements:</p>
            <ul>
              <li className={newPassword.length >= 6 ? 'valid' : ''}>
                ✓ At least 6 characters long
              </li>
              <li className={newPassword === confirmPassword && newPassword ? 'valid' : ''}>
                ✓ Passwords must match
              </li>
            </ul>
          </div>

          <button 
            onClick={resetPassword} 
            disabled={!passwordMatch || isLoading || newPassword.length < 6} 
            className="reset-button"
          >
            {isLoading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </div>
      )}

      <Message type={message.type} text={message.text} />
    </div>
  );
};

export default ForgotPassword;