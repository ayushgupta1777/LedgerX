import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faPencil, faPen } from '@fortawesome/free-solid-svg-icons';
import '../../style/loans/DetailPage.css';

const LoanProfileDetailPage = () => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setLoanDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching loan details:', error.message);
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [customerID]);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/${customerID}/remark`);
        setNote(response.data.remark || "Write your note here...");
      } catch (error) {
        console.error("Error fetching note:", error);
      }
    };

    fetchNote();
  }, [customerID]);

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/${customerID}/remark`, { remarks: note });
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating note:", error);
    }
  };

  useEffect(() => {
    const fetchLoanDetails1 = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile2/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching loan details.');
        setLoading(false);
      }
    };

    fetchLoanDetails1();
  }, [customerID]);

  const handleUpdateBillNumber = async () => {
    const newBillNumber = prompt('Enter new bill number:');
    if (newBillNumber) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/billNo/${customerID}`, {
          billNumber: newBillNumber
        });
        setLoanDetails(response.data);
        alert('Bill number updated successfully!');
      } catch (error) {
        console.error('Error updating bill number:', error);
        alert('Failed to update bill number. Please try again.');
      }
    }
  };

  const formatToIndianCurrency = (number) => {
    if (number === null || number === undefined) return '0';

    const numStr = number.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    const formattedInteger = integerPart.replace(
      /(\d)(?=(\d\d)+\d$)/g,
      '$1,'
    );

    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  const handleGoBack = () => {
    navigate(`/loan_profile/${customerID}`);
  };

  const handleGoToSignaturePage = () => {
    navigate(`/add-signature/${customerID}`);
  };

  if (loading) {
    return <div className="detaipage-loading">Loading loan details...</div>;
  }

  if (!loanDetails) {
    return (
      <div className="detaipage-error">
        Error: Could not fetch loan details. <br />
        <button onClick={handleGoBack}>Go Back</button>
      </div>
    );
  }


  // Extract all loan details properly
  const loanInfo = loanDetails?.loanDetails || {};
  const { FirstName, LastName, phoneNumber } = profile || {};
  const billNo = loanInfo?.billNo || "N/A";

  // Calculate all amounts correctly
  const principalAmount = loanInfo?.amount || 0;
  const topUpTotal = loanInfo?.topUpTotal || 0;
  const totalLoanAmount = principalAmount + topUpTotal;

  // Interest and principal calculations from server
  const totalInterest = loanInfo?.accruedInterest || 0;
  const topUpInterest = loanInfo?.topUpInterest || 0;
  const baseAccruedInterest = totalInterest - topUpInterest;
  const paidInterestTotal = loanInfo?.paidInterestTotal || 0;
  
  const remainingPrincipal = loanInfo?.remainingPrincipal || 0;
  const grandTotal = remainingPrincipal + totalInterest;

  // Use the history from loanInfo for UI display
  const topDownTotal = loanInfo?.topDownHistory?.reduce((sum, td) => sum + td.amount, 0) || 0;

  const { status, updatedAt, createdAt } = loanDetails;

  return (
    <div className="detaipage-container">
      <div className="detaipage-header">
        <FontAwesomeIcon 
          icon={faArrowLeft} 
          className="detaipage-back-icon" 
          onClick={handleGoBack} 
        />
        <span>Loan Profile Details</span>
        <span className="detaipage-record">Record</span>
      </div>

      {/* Main Content */}
      <div className="detaipage-content">
        <h1 className="detaipage-amount">₹ {formatToIndianCurrency(Math.floor(grandTotal))}</h1>
        <p className="detaipage-subtitle">Total Amount Due</p>

        <div className="detaipage-details">
          {/* Bill Number with Edit */}
          <div className="customer-info" onClick={handleUpdateBillNumber}>
            <p style={{ color: 'blue', cursor : 'pointer' }}>Bill #: {billNo}</p>
            <span className="update-btn">
              <FontAwesomeIcon icon={faPencil} />
            </span>
          </div>

          {/* Customer Information */}
          <div className="detaipage-section">
            <h3 className="detaipage-section-title">Customer Information</h3>
            
            <div className="detaipage-row">
              <span>Name</span>
              <span className="detaipage-value">{FirstName} {LastName}</span>
            </div>
            
            <div className="detaipage-row">
              <span>Phone Number</span>
              <span className="detaipage-value">{phoneNumber}</span>
            </div>
          </div>

          {/* Loan Details */}
          <div className="detaipage-section">
            <h3 className="detaipage-section-title">Loan Details</h3>
            
            <div className="detaipage-row">
              <span>Loan Type</span>
              <span className="detaipage-value">{loanInfo?.loanType}</span>
            </div>

            <div className="detaipage-row">
              <span>Original Loan Amount</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(principalAmount)}</span>
            </div>

            <div className="detaipage-row">
              <span>Top-up Amount</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(topUpTotal)}</span>
            </div>

            <div className="detaipage-row highlight">
              <span>Total Loan Given</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(totalLoanAmount)}</span>
            </div>

            <div className="detaipage-row">
              <span>Interest Rate</span>
              <span className="detaipage-value">{loanInfo?.interestRate}%</span>
            </div>

            <div className="detaipage-row">
              <span>Interest Frequency</span>
              <span className="detaipage-value">{loanInfo?.interestFrequency}</span>
            </div>

            <div className="detaipage-row">
              <span>Start Date</span>
              <span className="detaipage-value">
                {loanInfo?.startDate ? new Date(loanInfo.startDate).toLocaleDateString() : 'N/A'}
              </span>
            </div>
          </div>

          {/* Interest Breakdown */}
          <div className="detaipage-section">
            <h3 className="detaipage-section-title">Interest Breakdown</h3>
            
            <div className="detaipage-row">
              <span>Base Interest</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(Math.floor(baseAccruedInterest))}</span>
            </div>

            <div className="detaipage-row">
              <span>Top-up Interest</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(Math.floor(topUpInterest))}</span>
            </div>

            {paidInterestTotal > 0 && (
              <div className="detaipage-row paid">
                <span>Paid Interest</span>
                <span className="detaipage-value">- ₹ {formatToIndianCurrency(Math.floor(paidInterestTotal))}</span>
              </div>
            )}

            <div className="detaipage-row highlight">
              <span>Total Interest Due</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(Math.floor(totalInterest))}</span>
            </div>
          </div>

          {/* Repayment Details */}
          <div className="detaipage-section">
            <h3 className="detaipage-section-title">Repayment Details</h3>
            
            {topDownTotal > 0 && (
              <div className="detaipage-row paid">
                <span>Principal Repaid</span>
                <span className="detaipage-value">- ₹ {formatToIndianCurrency(Math.floor(topDownTotal))}</span>
              </div>
            )}

            <div className="detaipage-row highlight">
              <span>Remaining Principal</span>
              <span className="detaipage-value">₹ {formatToIndianCurrency(Math.floor(remainingPrincipal))}</span>
            </div>

            <div className="detaipage-row total">
              <span><strong>Grand Total Due</strong></span>
              <span className="detaipage-value"><strong>₹ {formatToIndianCurrency(Math.floor(grandTotal))}</strong></span>
            </div>
          </div>

          {/* Status & Dates */}
          <div className="detaipage-section">
            <h3 className="detaipage-section-title">Status & Timeline</h3>
            
            <div className="detaipage-row">
              <span>Status</span>
              <span className={`detaipage-value status-${status?.toLowerCase()}`}>{status}</span>
            </div>

            <div className="detaipage-row">
              <span>Created On</span>
              <span className="detaipage-value">
                {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
              </span>
            </div>

            <div className="detaipage-row">
              <span>Last Updated</span>
              <span className="detaipage-value">
                {updatedAt ? new Date(updatedAt).toLocaleString() : 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer Notice */}
        <p className="detaipage-footer">
          📌 All calculations are updated in real-time based on the interest rate and payment history.
        </p>

        {/* Signatures Section */}
        <div className="detaipage-invite">
          <h3 className="detaipage-section-title">Signatures</h3>
          {loanInfo?.signature?.length > 0 ? (
            <div className="signature-grid">
              {loanInfo.signature.map((sig, index) => (
                <div key={index} className="signature-item">
                  <img
                    src={sig.path}
                    alt={`Signature ${index + 1}`}
                    className="signature-image"
                  />
                  <p>{FirstName} {LastName}</p>
                  <p className="signature-date">
                    {new Date(sig.date).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-signatures">No signatures saved yet.</p>
          )}

          {/* Notes Section */}
          <div className="note-container">
            <h4>Remarks</h4>
            {isEditing ? (
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === "Enter" && handleSave()}
                autoFocus
              />
            ) : (
              <div className="note-display">
                <p>{note}</p>
                <FontAwesomeIcon 
                  icon={faPen} 
                  className="edit-icon" 
                  onClick={() => setIsEditing(true)} 
                />
              </div>
            )}
          </div>
        </div>

        <button className="detaipage-invite-btn" onClick={handleGoToSignaturePage}>
          Add/Update Signatures
        </button>
      </div>
    </div>
  );
};

export default LoanProfileDetailPage;