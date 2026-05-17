import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { faPen } from "@fortawesome/free-solid-svg-icons";
import '../../style/loans/DetailPage.css';


import CompanyWatermark from "../global/water-mark/CompanyWatermark";

const LoanProfileDetailPage = () => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [remarks, setRemark] = useState("");
  const [savedRemark, setSavedRemark] = useState("");
  const [note, setNote] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(null);


  useEffect(() => {
    // Fetch loan profile details
    const fetchLoanDetails = async () => {
      try {
        const token = localStorage.getItem('token');

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`,{
          headers: { 'x-auth-token': token }});
        setLoanDetails(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching loan details:', error.message);
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [customerID]);

 // Fetch existing note from database
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

// Update note in the database
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
        
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile2/${customerID}`,{
          headers: { 'x-auth-token': token }});
        setProfile(data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching loan details. 85678 Please try again.');
        setLoading(false);

      }
    };
    
    fetchLoanDetails1();
  }, [customerID]);

// const handleImageChange = (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     setPreview(URL.createObjectURL(file)); // Show preview before upload
//     uploadImage(file); // Upload image to Cloudinary
//   }
// };

// const uploadImage = async (file) => {
//   // setLoading(true);
//   const formData = new FormData();
//   formData.append("image", file);

//   try {
//     const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/images/signature/upload/${customerID}`, formData, {
//       headers: { "Content-Type": "multipart/form-data" },
//     });

//     setImage(response.data.imageUrl); // Store the uploaded image URL
//     console.log(response)
//   } catch (error) {
//     console.error("Error uploading image", error);
//   } finally {
//     // setLoading(false);
//   }
// };

  const handleUpdateBillNumber = async () => {  
    const newBillNumber = prompt('Enter new bill number:'); // Simple input method  
    if (newBillNumber) {  
      try {  
        // Assuming there's an API endpoint to update the loan bill number  
        const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/billNo/${customerID}`, {  
          billNumber: newBillNumber // Include other necessary data based on your requirements  
        });  
        
        // Update the state with the new loan details  
        setLoanDetails(response.data);  
        alert('Bill number updated successfully!');  
      } catch (error) {  
        console.error('Error updating bill number:', error);  
        alert('Failed to update bill number. Please try again.');  
      }  
    }  
  };

 // Format to Indian Number System
 const formatToIndianCurrency = (number) => {
  if (number === null || number === undefined) return '';

  const numStr = number.toString(); // Convert to string

  // Split into integer and decimal parts
  const [integerPart, decimalPart] = numStr.split('.');

  // Format integer part to Indian Number System
  const formattedInteger = integerPart.replace(
    /(\d)(?=(\d\d)+\d$)/g, // Regex for Indian Number System grouping
    '$1,'
  );

  // Combine integer and decimal parts
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};


  const handleGoBack = () => {
    navigate(`/loan_profile/${customerID}`);
  };

  const handleGoToSignaturePage = () => {
    navigate(`/add-signature/${customerID}`);
  };

  if (loading) {
    return <div>Loading loan details...</div>;
  }

  if (!loanDetails) {
    return <div>Error: Could not fetch loan details. <br/> Take back and try again!</div>;
  }

  const {
    loanDetails: loanInfo,
    signature,
    status,
    billNo,
    updatedAt
  } = loanDetails;

  const { accruedInterest, totalAmount, topUpTotal } = loanInfo || {};
  const { FirstName, LastName, phoneNumber } = profile || {};

  // Backend now provides totalAmount as (RemainingPrincipal + AccruedInterest)
  // which already correctly accounts for top-ups and repayments.
  const grandTotal = totalAmount || 0;


  return (
    <>

    {/* <div className="loan-profile-detail-page">
      <div className="heading">
        <span onClick={handleGoBack}>
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </span>
        Loan Profile Details
      </div>

      <div className="loan-profile-info">
        <h2>Loan Information</h2>
        <p><strong>Bill No:</strong> {loanInfo?.billNo}</p>
        <p><strong>Loan Type:</strong> {loanDetails.loanDetails.loanType}</p>
        <p><strong>Loan Amount:</strong> {loanInfo?.amount}</p>
        <p><strong>Interest Rate:</strong> {loanInfo?.interestRate}%</p>
        <p><strong>Accrued Interest:</strong> {accruedInterest}</p>
        <p><strong>Total Amount:</strong> {totalAmount}</p>
        <p><strong>Interest Frequency:</strong> {loanInfo?.interestFrequency}</p>
        <p><strong>Remarks:</strong> {remarks || 'None'}</p>
        <p><strong>Status:</strong> {status}</p>
        <p><strong>Last Updated:</strong> {new Date(updatedAt).toLocaleString()}</p>
      </div>

      <div className="signatures-section">
  <h2>Saved Signatures</h2>
  {loanDetails?.loanDetails?.signature?.length > 0 ? (
    <div className="signature-grid">
      {loanDetails.loanDetails.signature.map((sig, index) => (
        <div key={index} className="signature-item">
          <img
            src={`https://aero31.vercel.app${sig.path}`}
            alt={`Signature ${index + 1}`}
            className="signature-image"
          />
          <p>Uploaded on: {new Date(sig.date).toLocaleString()}</p>
        </div>
      ))}
    </div>
  ) : (
    <p>No signatures saved yet.</p>
  )}

      </div>

      <div className="actions">
        <button className="go-to-signature" onClick={handleGoToSignaturePage}>
          Add/Update Signatures
        </button>
      </div>

      <div className='actiion-group3'>

        <button className={`menu-item `}>💵 Record Payment</button>

        </div>
    </div> */}

    <div className="detaipage-container">
      <div className="detaipage-header">
        <FontAwesomeIcon icon={faArrowLeft} className="detaipage-back-icon" onClick={handleGoBack} />
        <span>        Loan Profile Details
        </span>
        <span className="detaipage-record">Record</span>
      </div>

      {/* Main Content */}
      <div className="detaipage-content">
        <h1 className="detaipage-amount">₹ {formatToIndianCurrency(Math.floor(grandTotal))}</h1>
        <p className="detaipage-subtitle">Today bounty</p>

        <div className="detaipage-details">

          {/* <div className="detaipage-row" onClick={handleUpdateBillNumber}>
            <span>Bill No.</span>
            <span className="detaipage-value">{loanInfo?.billNo}</span>
            <span className="update-btn"><FontAwesomeIcon icon={faPencil} /></span>  
          </div> */}
          <div className="customer-info" onClick={handleUpdateBillNumber}>
              <p>Bill #: {loanInfo?.billNo}</p>
              <span  className="update-btn"><FontAwesomeIcon icon={faPencil} /></span>  
            </div>

          <div className="detaipage-row">
            <span>Name</span>
            <span className="detaipage-value">{FirstName} {LastName}</span>
          </div>
          <div className="detaipage-row">
            <span>Phone Number</span>
            <span className="detaipage-value">{phoneNumber}</span>
          </div>
          <div className="detaipage-row">
            <span>Loan Type</span>
            <span className="detaipage-value"> {loanDetails.loanDetails.loanType}</span>
          </div>
          <div className="detaipage-row">
            <span>Loan Amount</span>
            <span className="detaipage-value">₹ {loanInfo?.amount}</span>
          </div>
          <div className="detaipage-row">
            <span>Accrued Interest</span>
            <span className="detaipage-value">{loanInfo?.interestRate}%</span>
          </div>
          <div className="detaipage-row">
            <span>Accrued Interest</span>
            <span className="detaipage-value">₹ {loanInfo?.accruedInterest}</span>
          </div>
          <div className="detaipage-row">
            <span>Total Amount</span>
            <span className="detaipage-value">₹ {loanInfo?.totalAmount}</span>
          </div>
          <div className="detaipage-row">
            <span>Interest Frequency</span>
            <span className="detaipage-value">{loanInfo?.interestFrequency}</span>
          </div>
          <div className="detaipage-row">
            <span>Status:</span>
            <span className="detaipage-value">{status}</span>
          </div>
          <div className="detaipage-row">
            <span>Last Updated</span>
            <span className="detaipage-value">{new Date(updatedAt).toLocaleString()}</span>
          </div>
          
          {/* <div className="detaipage-row">
            <span>Bounty the month</span>
            <span className="detaipage-value">$42.00</span>
          </div>
          <div className="detaipage-row">
            <span>Bounty the month</span>
            <span className="detaipage-value">$42.00</span>
          </div>
          <div className="detaipage-row">
            <span>Bounty the month</span>
            <span className="detaipage-value">$42.00</span>
          </div> */}


        </div>

        {/* Footer Notice */}
        <p className="detaipage-footer">
          🔹 The amount will be transferred to your bank card on the 15th of each month.
        </p>

        {/* Invite Friends Section */}
        <div className="detaipage-invite">
        {loanDetails?.loanDetails?.signature?.length > 0 ? (
    <div className="signature-grid">
      {loanDetails.loanDetails.signature.map((sig, index) => (
        <div key={index} className="signature-item">
          <img
            src={sig.path}
            alt={`Signature ${index + 1}`}
            className="signature-image"
          />
          <p>{FirstName} {LastName} {new Date(sig.date).toLocaleString()}</p>
          </div>
      ))}
    </div>
  ) : (
    <p>No signatures saved yet.</p>
  )}
          {/* <div className="invite-step">1️⃣ Send a link to friends</div>
          <div className="invite-step">2️⃣ Friends loan successful</div>
          <div className="invite-step">3️⃣ Get bonus earnings</div> */}
          <div className="note-container">
            {isEditing ? (
              <textarea
                className="note-input"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onBlur={handleSave} // Save on blur
                onKeyDown={(e) => e.key === "Enter" && handleSave()} // Save on Enter key
                autoFocus
              />
            ) : (
              <div className="note-display">
                <p>{note}</p>
                <FontAwesomeIcon icon={faPen} className="edit-icon" onClick={() => setIsEditing(true)} />
              </div>
            )}
          </div>
        </div>

        <button className="detaipage-invite-btn" onClick={handleGoToSignaturePage} > Add/Update Signatures
        </button>

                {/* ADD WATERMARK HERE - Above bottom nav */}
        <CompanyWatermark companyName="ADSANGROW" companyUrl="https://adsangrow.com" />

      </div>
    </div>

    
    
    </>
  );
};

export default LoanProfileDetailPage;
