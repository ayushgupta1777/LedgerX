import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { useReactToPrint } from "react-to-print";

const ReceiptPage = ({ profile }) => {
  const { customerID } = useParams();
  const receiptRef = useRef(); // Ensure the ref is properly defined
  const [loanDetails, setLoanDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get(
         `${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`,
          { headers: { "x-auth-token": token } }
        );
        setLoanDetails(data);
      } catch (err) {
        console.error("Error fetching loan details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanDetails();
  }, [customerID]);

  const handlePrint = useReactToPrint({
    content: () => {
      if (!receiptRef.current) {
        console.error("Error: Receipt reference is null!");
        alert("Error: Nothing to print!");
        return null;
      }
      return receiptRef.current;
    },
    documentTitle: `Receipt_${customerID || "Receipt"}`,
    onBeforePrint: () => console.log("Preparing print..."),
    onAfterPrint: () => console.log("Print finished!"),
  });

  if (loading) return <p>Loading...</p>;
  if (!loanDetails) return <p>Error: Could not load loan details.</p>;

  const { name } = profile || {};
  const {
    loanType,
    amount,
    interestRate,
    startDate,
    accruedInterest,
    totalAmount,
    billNo,
  } = loanDetails?.loanDetails || {};

  return (
    <div className="receipt-container">
      {/* Ensure the div is properly referenced */}
      <div ref={receiptRef} className="receipt">
        <h2>Loan Receipt</h2>
        <p><strong>Name:</strong> {name}</p>
        <p><strong>Loan Type:</strong> {loanType}</p>
        <p><strong>Bill No:</strong> {billNo}</p>
        <p><strong>Start Date:</strong> {new Date(startDate).toLocaleDateString()}</p>
        <p><strong>Loan Amount:</strong> ₹{amount}</p>
        <p><strong>Interest Rate:</strong> {interestRate}%</p>
        <p><strong>Accrued Interest:</strong> ₹{accruedInterest}</p>
        <p><strong>Total Payable Amount:</strong> ₹{totalAmount}</p>
      </div>
      
      {/* Ensure the button is working */}
      <button onClick={handlePrint}>Print / Download</button>
    </div>
  );
};

export default ReceiptPage;
