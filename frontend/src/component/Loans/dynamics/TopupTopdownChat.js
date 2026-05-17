import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../../style/loans/dynamic/TopupTopdownChat.css";
import { useParams, useNavigate } from 'react-router-dom';

const TopupTopdownChat = () => {
  const [loanDetails, setLoanDetails] = useState(null);
  const { customerID } = useParams();
  const navigate = useNavigate();
  const [loanData, setLoanData] = useState(null);
  const [loading, setLoading] = useState(true);

  const [topUpHistory, setTopUpHistory] = useState([]);
  const [topDownHistory, setTopDownHistory] = useState([]);
  const [InterestPaymentHistory, setInterestPaymentHistory] = useState([]);
  
  const [bgColor, setBgColor] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const optionsMenuRef = useRef(null);

  useEffect(() => {
    const fetchLoanDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        setLoanDetails(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching loan details:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLoanDetails();
  }, [customerID]);

  useEffect(() => {
    setBgColor(generateRandomColor());

    const token = localStorage.getItem('token');
    setLoading(true);
    axios.get(`${process.env.REACT_APP_API_BASE_URL}/top-t/${customerID}`, {
      headers: { 'x-auth-token': token }
    })
    .then(response => {
      setTopUpHistory(response.data.topUpHistory || []);
      setTopDownHistory(response.data.topDownHistory || []);
      setInterestPaymentHistory(response.data.interestPaymentHistory || []);
    })
    .catch(error => console.error("Error fetching transaction data:", error))
    .finally(() => {
      setLoading(false);
      
      // Smooth scroll to top when transactions load
      setTimeout(() => {
        const contentElement = document.querySelector('.ttc-loan-chat-content');
        if (contentElement) {
          contentElement.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }, 100);
    });
  }, [customerID]);

  const generateRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFBB33", "#8E44AD", "#2E86C1"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  const toggleOptions = () => {
    setShowOptions(!showOptions);
    setSelectedTransaction(null);
  };
  
  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsMenuRef.current && !optionsMenuRef.current.contains(event.target)) {
        setShowOptions(false);
        setSelectedTransaction(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  const handleTransactionClick = (transaction) => {
    console.log('Transaction clicked:', transaction);
  };
  
  const handleTransactionOptions = (e, transaction) => {
    e.stopPropagation();
    setSelectedTransaction(transaction);
  };
  
  const handlePrintReceipt = () => {
    if (selectedTransaction) {
      console.log('Print receipt for:', selectedTransaction);
      setSelectedTransaction(null);
    }
  };

  const renderProfileImage = () => {
    if (loading) return <div className="ttc-profile-image-loader"></div>;
    
    if (loanDetails?.profileImage) {
      return (
        <img 
          src={loanDetails.profileImage} 
          alt="Profile" 
          className="ttc-loan-profile-image-lp" 
          onContextMenu={(e) => e.preventDefault()} 
          draggable="false" 
        />
      );
    } else {
      return (
        <div className="ttc-profile-image-placeholder" style={{ backgroundColor: bgColor }}>
          {loanDetails?.name ? loanDetails.name.charAt(0).toUpperCase() : "👤"}
        </div>
      );
    }
  };

  // Get transaction display properties
  const getTransactionDisplay = (type) => {
    switch(type) {
      case "topup":
        return {
          icon: "↗️",
          label: "Extended Credit",
          className: "ttc-loan-topup"
        };
      case "topdown":
        return {
          icon: "↘️",
          label: "Partial Repayment",
          className: "ttc-loan-topdown"
        };
      case "interestpayment":
        return {
          icon: "💰",
          label: "Interest Paid",
          className: "ttc-loan-interest-payment"
        };
      default:
        return {
          icon: "📝",
          label: "Transaction",
          className: "ttc-loan-default"
        };
    }
  };

  // Merge & Sort Transactions by Date
  const transactions = [
    ...topUpHistory.map((t) => ({ ...t, type: "topup" })),
    ...topDownHistory.map((t) => ({ ...t, type: "topdown" })),
    ...InterestPaymentHistory.map((t) => ({ ...t, type: "interestpayment" })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Format date in a more readable way
  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-GB', options);
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const calculateTopUpInterest = (amount, rate, date) => {
    if (!amount || !rate || !date) return 0;
    const daysElapsed = Math.floor((new Date() - new Date(date)) / (1000 * 60 * 60 * 24));
    if (daysElapsed <= 0) return 0;
    const dailyRate = parseFloat(rate) / 100 / 30;
    return Math.floor(amount * dailyRate * daysElapsed);
  };

  return (
    <div className="ttc-loan-chat-container">
      {/* Header */}
      <div className="ttc-loan-chat-header">
        <button
          className="ttc-back-button"
          onClick={handleBackClick}
          aria-label="Go back"
        >
          &#8592;
        </button>

        <h2 className="ttc-customer-name">
          {loading ? "Loading..." : (loanDetails?.name || "Transaction History")}
        </h2>

        <div className="ttc-loan-profile-container-lp">
          {renderProfileImage()}
        </div>
      </div>

      {/* Chat Section */}
      {loading ? (
        <div className="ttc-loan-chat-loading">
          <div className="ttc-loading-spinner"></div>
          <span>Loading transactions...</span>
        </div>
      ) : (
        <div className="ttc-loan-chat-content">
          {transactions.length === 0 ? (
            <div className="ttc-loan-no-transactions">
              <p>No transactions found for this customer.</p>
            </div>
          ) : (
            transactions.map((transaction, index) => {
              const display = getTransactionDisplay(transaction.type);

              return (
                <div
                  key={transaction._id || index}
                  className={`ttc-loan-message ${display.className}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => handleTransactionClick(transaction)}
                >
                  <div className="ttc-loan-transaction-container-c">
                    <div className="ttc-loan-transaction-icon">
                      {display.icon}
                    </div>
                    <div className="ttc-loan-transaction-details">
                      <p className="ttc-loan-transfer-label">
                        {display.label} {transaction.type === 'topup' && transaction.topupinterestrate ? `(${transaction.topupinterestrate}%)` : ''}
                      </p>
                      <p className="ttc-loan-amount">
                        {formatCurrency(transaction.amount)}
                      </p>
                      {transaction.type === 'topup' && transaction.topupinterestrate && (
                        <p className="ttc-loan-method" style={{ color: '#ff9800', marginTop: '4px' }}>
                          Interest till today: {formatCurrency(calculateTopUpInterest(transaction.amount, transaction.topupinterestrate, transaction.date))}
                        </p>
                      )}
                      <p className="ttc-loan-method">{formatDate(transaction.date)}</p>
                    </div>
                  </div>
                  <div className="ttc-loan-transaction-footer-c">
                    <p className="ttc-loan-transaction-type">{transaction.method || "Bank Transfer"}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default TopupTopdownChat;