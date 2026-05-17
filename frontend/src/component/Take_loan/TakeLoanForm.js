import React, { useState } from 'react';
import { useNavigate,useParams } from 'react-router-dom';
import axios from 'axios';

const TakeLoanForm = () => {
  const [loanDetails, setLoanDetails] = useState({
    loanType: 'With Interest',
    method: 'Cash',
    amount: '',
    interestRate: '',
    interestFrequency: 'Monthly',
    compoundInterest: false,
    compoundFrequency: '',
    startDate: '',
    remarks: '',
    lenderName: '',
    lenderPhone: '',
    lenderAddress: ''
  });
  
  const { lenderID } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    setLoanDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

 const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    Object.keys(loanDetails).forEach((key) => {
      if (key === 'attachments') {
        if (loanDetails[key]) formData.append(key, loanDetails[key]);
      } else {
        formData.append(key, loanDetails[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/take-loan${lenderID ? `/${lenderID}` : ''}`, 
        formData,
        { headers: { 'x-auth-token': token } }
      );
      
      showMessage('success', 'Loan taken successfully!');
      navigate('/borrowed-accounts');
    } catch (error) {
      console.error('Error taking loan:', error);
      showMessage('error', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    },
    formContent: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      padding: '40px',
      maxWidth: '900px',
      margin: '0 auto'
    },
    header: {
      marginBottom: '30px'
    },
    backButton: {
      background: 'transparent',
      border: 'none',
      fontSize: '24px',
      marginBottom: '20px',
      cursor: 'pointer',
      padding: '10px'
    },
    title: {
      color: '#333',
      fontSize: '2.5rem',
      marginBottom: '10px',
      fontWeight: 'bold'
    },
    subtitle: {
      color: '#666',
      fontSize: '1.1rem'
    },
    section: {
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      marginBottom: '20px'
    },
    sectionTitle: {
      marginBottom: '15px',
      color: '#333',
      fontSize: '1.3rem',
      fontWeight: '600'
    },
    formGrid: {
      display: 'grid',
      gap: '15px'
    },
    inputGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '20px'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'block',
      marginBottom: '5px',
      fontWeight: '600',
      color: '#333'
    },
    required: {
      color: 'red'
    },
    input: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      fontSize: '16px',
      transition: 'border-color 0.3s',
      boxSizing: 'border-box'
    },
    inputFocus: {
      borderColor: '#667eea',
      outline: 'none'
    },
    select: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      fontSize: '16px',
      backgroundColor: 'white',
      cursor: 'pointer',
      boxSizing: 'border-box'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e1e5e9',
      borderRadius: '8px',
      fontSize: '16px',
      resize: 'vertical',
      minHeight: '100px',
      fontFamily: 'inherit',
      boxSizing: 'border-box'
    },
    checkboxContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '8px'
    },
    checkbox: {
      transform: 'scale(1.2)'
    },
    submitButton: {
      background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      border: 'none',
      padding: '15px 30px',
      borderRadius: '10px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: loading ? 'not-allowed' : 'pointer',
      transition: 'transform 0.2s',
      marginTop: '20px',
      width: '100%'
    },
    message: {
      position: 'fixed',
      top: '20px',
      right: '20px',
      padding: '15px 20px',
      borderRadius: '8px',
      zIndex: 1000,
      fontWeight: '500'
    },
    successMessage: {
      background: '#d4edda',
      color: '#155724',
      border: '1px solid #c3e6cb'
    },
    errorMessage: {
      background: '#f8d7da',
      color: '#721c24',
      border: '1px solid #f5c6cb'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContent}>
        <div style={styles.header}>
          <button 
            onClick={() => navigate(-1)}
            style={styles.backButton}
          >
            ← Back
          </button>
          <h2 style={styles.title}>
            Take Loan Details
          </h2>
          <p style={styles.subtitle}>
            Fill in the details for the loan you're taking from a lender.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Lender Information Section */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Lender Information</h3>
            
            <div style={styles.formGrid}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Lender Name <span style={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  name="lenderName"
                  value={loanDetails.lenderName}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter lender's full name"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Lender Phone <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="lenderPhone"
                  value={loanDetails.lenderPhone}
                  onChange={handleChange}
                  required
                  style={styles.input}
                  placeholder="Enter lender's phone number"
                />
              </div>

              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Lender Address
                </label>
                <input
                  type="text"
                  name="lenderAddress"
                  value={loanDetails.lenderAddress}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Enter lender's address (optional)"
                />
              </div>
            </div>
          </div>

          {/* Loan Details Section */}
          <div style={styles.inputGrid}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Loan Type</label>
              <select 
                name="loanType" 
                value={loanDetails.loanType} 
                onChange={handleChange}
                style={styles.select}
              >
                <option value="With Interest">With Interest</option>
                <option value="EMI Collection">EMI Collection</option>
                <option value="Without Interest">Without Interest</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Payment Method</label>
              <select 
                name="method" 
                value={loanDetails.method} 
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Cash">Cash</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Credit Card">Credit Card</option>
                <option value="UPI">UPI</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Amount <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="amount"
                value={loanDetails.amount}
                onChange={handleChange}
                required
                min="0"
                style={styles.input}
                placeholder="Enter loan amount"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Interest Rate (%) <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="interestRate"
                value={loanDetails.interestRate}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                style={styles.input}
                placeholder="Enter interest rate"
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Interest Frequency</label>
              <select
                name="interestFrequency"
                value={loanDetails.interestFrequency}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="15 Days">15 Days</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Start Date <span style={styles.required}>*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={loanDetails.startDate}
                onChange={handleChange}
                required
                style={styles.input}
              />
            </div>
          </div>

          {/* Compound Interest */}
          <div style={styles.checkboxContainer}>
            <input
              type="checkbox"
              name="compoundInterest"
              checked={loanDetails.compoundInterest}
              onChange={handleChange}
              style={styles.checkbox}
            />
            <label style={styles.label}>
              Compound Interest
            </label>
          </div>

          {loanDetails.compoundInterest && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Compound Frequency</label>
              <select
                name="compoundFrequency"
                value={loanDetails.compoundFrequency}
                onChange={handleChange}
                style={styles.select}
              >
                <option value="">Select frequency</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half-Yearly">Half-Yearly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Remarks</label>
            <textarea
              name="remarks"
              value={loanDetails.remarks}
              onChange={handleChange}
              style={styles.textarea}
              placeholder="Add any additional notes or remarks..."
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={styles.submitButton}
          >
            {loading ? 'Processing...' : 'Save Loan Details'}
          </button>
        </form>
      </div>

      {message.text && (
        <div 
          style={{
            ...styles.message,
            ...(message.type === 'success' ? styles.successMessage : styles.errorMessage)
          }}
        >
          {message.text}
        </div>
      )}
    </div>
  );
};

export default TakeLoanForm;