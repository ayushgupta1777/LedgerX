import React, { useState } from 'react';
import axios from 'axios';

const OTP = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Enter phone, 2: Enter OTP
  const [message, setMessage] = useState('');

  const sendOtp = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/send-otp`, { phoneNumber });
      setMessage(response.data.message); 
      setStep(2);
    } catch (error) {
      setMessage(error.response.data.message || 'Failed to send OTP1');
    }
  };

  const verifyOtp = async () => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/verify-otp`, { phoneNumber, otp });
      setMessage(response.data.message);
      setStep(1); // Reset to the initial step after verification
      setPhoneNumber('');
      setOtp('');
    } catch (error) {
      setMessage(error.response.data.message || 'Failed to verify OTP');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
      <h1>OTP Verification</h1>
      {step === 1 ? (
        <>
          <input
            type="text"
            placeholder="Enter Phone Number"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button onClick={sendOtp} style={{ width: '100%', padding: '10px', backgroundColor: 'blue', color: 'white' }}>
            Send OTP
          </button>
        </>
      ) : (
        <>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
          />
          <button onClick={verifyOtp} style={{ width: '100%', padding: '10px', backgroundColor: 'green', color: 'white' }}>
            Verify OTP
          </button>
        </>
      )}
      {message && <p style={{ color: 'red', marginTop: '10px' }}>{message}</p>}
    </div>
  );
};

export default OTP;
