import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/loans/loanForm.css';

const LoanForm = () => {
  
  const [loanDetails, setLoanDetails] = useState({
    loanType: 'With Interest',
    method: 'Cash',
    amount: '',
    interestRate: '',
    interestFrequency: 'Monthly',
    compoundInterest: false,
    compoundFrequency: '',
    startDate: '',
    attachments: null,
    remarks: '',
    
  });
  const { customerID } = useParams();
  const navigate = useNavigate();


  const handleChange = (e) => {
    const { name, type, checked, value } = e.target;
    console.log(`${name} is now: ${type === 'checkbox' ? checked : value}`);
    setLoanDetails((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };
  

  const handleFileChange = (e) => {
    setLoanDetails({ ...loanDetails, attachments: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const customer = JSON.parse(localStorage.getItem('customer'));

    const formData = new FormData();
    formData.append('customer', JSON.stringify(customer));
    Object.keys(loanDetails).forEach((key) => {
      if (key === 'attachments') {
        formData.append(key, loanDetails[key]);
      } else {
        formData.append(key, loanDetails[key]);
      }
    });

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/add-loan/${customerID}`, formData ,
        { headers: { 'x-auth-token': token } });
      alert('Loan Saved Successfully!');
      navigate(`/loan_profile/${customerID}`);
    } catch (error) {
      console.error('Error saving loan:', error);
      alert(error.response?.data?.message || error.message || 'Something went wrong');

    }
  };

  return (
    <div className="page-content">
      <div className="form-v10-content">
        <div className="form-left">
          <h2>Loan Details</h2>
          <p>Fill in the loan details below to create a new account.</p>
        </div>
        <div className="form-right">
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <label>Loan Type</label>
              <select name="loanType" value={loanDetails.loanType} onChange={handleChange}>
                <option value="With Interest">With Interest</option>
                <option value="EMI Collection">EMI Collection</option>
              </select>
            </div>

            <div className="form-row">
              <label>Method</label>
              <select name="method" value={loanDetails.method} onChange={handleChange}>
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              </select>
            </div>

            <div className="form-row">
              <label>Amount <span className="required-lf">*</span></label>
              <input
                type="number"
                name="amount"
                value={loanDetails.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Interest Rate <span className="required-lf">*</span></label>
              <input
                type="number"
                name="interestRate"
                value={loanDetails.interestRate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Interest Frequency <span className="required-lf">*</span></label>
              <select
                name="interestFrequency"
                value={loanDetails.interestFrequency}
                onChange={handleChange}
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

            <div className="form-checkbox2">
              <input
                type="checkbox"
                name="compoundInterest"
                checked={loanDetails.compoundInterest}
                onChange={handleChange}
              />
              <label>Compound Interest</label>
            </div>

            {loanDetails.compoundInterest && (
              <div className="form-row">
                <label>Compound Frequency:</label>
                <select
                  name="compoundFrequency"
                  value={loanDetails.compoundFrequency}
                  onChange={handleChange}
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly</option>
                </select>
              </div>
            )}

            <div className="form-row">
              <label>Start Date <span className="required-lf">*</span></label>
              <input
                type="date"
                name="startDate"
                value={loanDetails.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <label>Attachments </label>
              <input type="file" name="attachments" onChange={handleFileChange} />
            </div>

            <div className="form-row">
              <label>Remarks:</label>
              <textarea
                name="remarks"
                value={loanDetails.remarks}
                onChange={handleChange}
              ></textarea>
            </div>

            <div className="form-row-last">
              <input type="submit" value="Save Account" />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};




const formStyle = {
  width: '300px',
  margin: '50px auto',
  textAlign: 'center',
};

const buttonStyle = {
  marginTop: '20px',
  padding: '10px 20px',
  fontSize: '16px',
  cursor: 'pointer',
};

export default LoanForm;
