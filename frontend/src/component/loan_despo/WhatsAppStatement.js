import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faArrowLeft, 
  // faWhatsapp, 
  faEnvelope, 
  faEdit, 
  faPaperPlane, 
  faTimes, 
  faCopy,
  faDownload 
} from '@fortawesome/free-solid-svg-icons';

const ComprehensiveLoanStatement = () => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const [loanDetails, setLoanDetails] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editableMessage, setEditableMessage] = useState('');
  const [copied, setCopied] = useState(false);
  const [sendMethod, setSendMethod] = useState('whatsapp'); // whatsapp, email, sms

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const [loanResponse, profileResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`, {
            headers: { 'x-auth-token': token }
          }),
          axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile2/${customerID}`, {
            headers: { 'x-auth-token': token }
          })
        ]);

        setLoanDetails(loanResponse.data);
        setProfile(profileResponse.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [customerID]);

  const formatToIndianCurrency = (number) => {
    if (!number) return '0';
    return number.toString().replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
  };

  const calculateDaysBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end - start) / (1000 * 60 * 60 * 24));
  };

  const calculateMonthsBetween = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  };

  const generateDetailedStatement = () => {
    if (!loanDetails || !profile) return '';

    const loanInfo = loanDetails.loanDetails;
    const startDate = new Date(loanInfo.startDate);
    const today = new Date();
    const totalDays = calculateDaysBetween(startDate, today);
    const totalMonths = calculateMonthsBetween(startDate, today);

    // Calculate all amounts
    const principalAmount = loanInfo.amount || 0;
    const topUpTotal = loanInfo.topUpTotal || 0;
    const totalLoanGiven = principalAmount + topUpTotal;
    
    const baseInterest = loanInfo.accruedInterest || 0;
    const topUpInterest = loanInfo.topUpInterest || 0;
    const totalInterestAccrued = baseInterest + topUpInterest;
    
    const paidInterest = loanInfo.paidInterestTotal || 0;
    const remainingInterest = totalInterestAccrued - paidInterest;
    
    const principalRepaid = loanInfo.topDownHistory?.reduce((sum, td) => sum + td.amount, 0) || 0;
    const remainingPrincipal = totalLoanGiven - principalRepaid;
    
 const totalInterest = baseInterest + topUpInterest ;
const totalAmount = loanInfo.totalAmount
  const  P = topUpTotal + totalAmount           

  const totalOutstanding = P + totalInterest

    let message = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `       📊 LOAN STATEMENT\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Customer Information
    message += `👤 *CUSTOMER DETAILS*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Name: ${profile.FirstName} ${profile.LastName || ''}\n`;
    message += `Phone: ${profile.phoneNumber}\n`;
    message += `Bill No: ${loanInfo.billNo}\n`;
    message += `Account ID: ${customerID}\n\n`;
    
    // Loan Period
    message += `📅 *LOAN PERIOD*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Start Date: ${startDate.toLocaleDateString('en-IN')}\n`;
    message += `Current Date: ${today.toLocaleDateString('en-IN')}\n`;
    message += `Duration: ${totalDays} days (${totalMonths} months)\n\n`;
    
    // Original Loan Details
    message += `💰 *ORIGINAL LOAN*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Principal Amount: ₹${formatToIndianCurrency(principalAmount)}\n`;
    message += `Interest Rate: ${loanInfo.interestRate}% ${loanInfo.interestFrequency}\n`;
    message += `Loan Type: ${loanInfo.loanType}\n`;
    message += `Base Interest Accrued: ₹${formatToIndianCurrency(Math.floor(baseInterest))}\n\n`;

    // Top-Up Details (if any)
    if (loanInfo.topUpHistory && loanInfo.topUpHistory.length > 0) {
      message += `📈 *TOP-UP DETAILS*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      loanInfo.topUpHistory.forEach((topUp, index) => {
        const topUpDate = new Date(topUp.date);
        const daysFromTopUp = calculateDaysBetween(topUpDate, today);
        message += `\n${index + 1}. Top-Up Amount: ₹${formatToIndianCurrency(topUp.amount)}\n`;
        message += `   Date: ${topUpDate.toLocaleDateString('en-IN')}\n`;
        message += `   Rate: ${topUp.topupinterestrate}%\n`;
        message += `   Days Active: ${daysFromTopUp}\n`;
        message += `   Method: ${topUp.method || 'N/A'}\n`;
      });
      message += `\n📊 Total Top-Up: ₹${formatToIndianCurrency(topUpTotal)}\n`;
      message += `💵 Top-Up Interest: ₹${formatToIndianCurrency(Math.floor(topUpInterest))}\n\n`;
    }

    // Total Loan Summary
    message += `💼 *TOTAL LOAN SUMMARY*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Original Principal: ₹${formatToIndianCurrency(principalAmount)}\n`;
    message += `+ Top-Ups: ₹${formatToIndianCurrency(topUpTotal)}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*Total Loan Given: ₹${formatToIndianCurrency(totalLoanGiven)}*\n\n`;

    // Interest Breakdown
    message += `💵 *INTEREST BREAKDOWN*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Base Interest: ₹${formatToIndianCurrency(Math.floor(baseInterest))}\n`;
    if (topUpInterest > 0) {
      message += `Top-Up Interest: ₹${formatToIndianCurrency(Math.floor(topUpInterest))}\n`;
    }
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Total Interest Accrued: ₹${formatToIndianCurrency(Math.floor(totalInterestAccrued))}\n`;
    if (paidInterest > 0) {
      message += `Less: Interest Paid: -₹${formatToIndianCurrency(Math.floor(paidInterest))}\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    }
    message += `*Interest Outstanding: ₹${formatToIndianCurrency(Math.floor(remainingInterest))}*\n\n`;

    // Principal Repayment History
    if (loanInfo.topDownHistory && loanInfo.topDownHistory.length > 0) {
      message += `✅ *PRINCIPAL REPAYMENT HISTORY*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      loanInfo.topDownHistory.forEach((repay, index) => {
        const repayDate = new Date(repay.date);
        message += `${index + 1}. ₹${formatToIndianCurrency(repay.amount)} on ${repayDate.toLocaleDateString('en-IN')} (${repay.method})\n`;
      });
      message += `\n💚 Total Principal Repaid: ₹${formatToIndianCurrency(principalRepaid)}\n\n`;
    }

    // Interest Payment History
    if (loanInfo.interestPaymentHistory && loanInfo.interestPaymentHistory.length > 0) {
      message += `💳 *INTEREST PAYMENT HISTORY*\n`;
      message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
      loanInfo.interestPaymentHistory.forEach((payment, index) => {
        const payDate = new Date(payment.date);
        message += `${index + 1}. ₹${formatToIndianCurrency(payment.amount)} on ${payDate.toLocaleDateString('en-IN')} (${payment.method})\n`;
      });
      message += `\n💚 Total Interest Paid: ₹${formatToIndianCurrency(Math.floor(paidInterest))}\n\n`;
    }

    // Final Outstanding Summary
    message += `🔴 *CURRENT OUTSTANDING*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Principal Outstanding: ₹${formatToIndianCurrency(Math.floor(remainingPrincipal))}\n`;
    message += `Interest Outstanding: ₹${formatToIndianCurrency(Math.floor(remainingInterest))}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `*TOTAL AMOUNT DUE: ₹${formatToIndianCurrency(Math.floor(totalOutstanding))}*\n\n`;
    
    // Payment Calculation
    message += `📊 *PAYMENT CALCULATION*\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `Total Loan Given: ₹${formatToIndianCurrency(totalLoanGiven)}\n`;
    message += `+ Interest Accrued: ₹${formatToIndianCurrency(Math.floor(totalInterestAccrued))}\n`;
    message += `= Gross Total: ₹${formatToIndianCurrency(Math.floor(totalLoanGiven + totalInterestAccrued))}\n\n`;
    message += `Payments Made:\n`;
    message += `- Principal Paid: ₹${formatToIndianCurrency(principalRepaid)}\n`;
    message += `- Interest Paid: ₹${formatToIndianCurrency(Math.floor(paidInterest))}\n`;
    message += `= Total Paid: ₹${formatToIndianCurrency(Math.floor(principalRepaid + paidInterest))}\n\n`;
    message += `*Balance Due: ₹${formatToIndianCurrency(Math.floor(totalOutstanding))}*\n\n`;

    // Footer
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `📅 Generated: ${today.toLocaleDateString('en-IN')} ${today.toLocaleTimeString('en-IN', {hour: '2-digit', minute: '2-digit'})}\n`;
    message += `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    message += `_This is a system-generated statement_\n`;
    message += `_For queries, contact your loan officer_\n\n`;
    message += `Thank you for your business! 🙏`;

    return message;
  };

  const handleEditMessage = () => {
    const message = generateDetailedStatement();
    setEditableMessage(message);
    setShowEditor(true);
  };

  const handleSend = (customMessage = null) => {
    const message = customMessage || generateDetailedStatement();
    const phoneNumber = profile?.phoneNumber?.replace(/\D/g, '');
    
    if (sendMethod === 'whatsapp') {
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    } else if (sendMethod === 'email') {
      const subject = `Loan Statement - ${profile?.FirstName} ${profile?.LastName || ''}`;
      const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      window.location.href = mailtoUrl;
    } else if (sendMethod === 'sms') {
      const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
      window.location.href = smsUrl;
    }
    
    setShowEditor(false);
  };

  const handleCopyToClipboard = () => {
    const message = generateDetailedStatement();
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const message = generateDetailedStatement();
    const blob = new Blob([message], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Loan_Statement_${profile?.FirstName}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={styles.loadingText}>Loading statement...</p>
      </div>
    );
  }

  if (!loanDetails || !profile) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorText}>Error loading statement</p>
      </div>
    );
  }

  const loanInfo = loanDetails.loanDetails;
  const principalAmount = loanInfo.amount || 0;
  const topUpTotal = loanInfo.topUpTotal || 0;
  const totalLoanGiven = principalAmount + topUpTotal;
  const baseInterest = loanInfo.accruedInterest || 0;
  const topUpInterest = loanInfo.topUpInterest || 0;
  const totalInterestAccrued = baseInterest + topUpInterest;
  const paidInterest = loanInfo.paidInterestTotal || 0;
  const remainingInterest = totalInterestAccrued - paidInterest;
  const principalRepaid = loanInfo.topDownHistory?.reduce((sum, td) => sum + td.amount, 0) || 0;
  const remainingPrincipal = totalLoanGiven ;


  const totalInterest = baseInterest + topUpInterest ;
const totalAmount = loanInfo.totalAmount
  const  P = topUpTotal + totalAmount           

  const totalOutstanding = P + totalInterest

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <FontAwesomeIcon 
          icon={faArrowLeft} 
          style={styles.backIcon}
          onClick={() => navigate(`/loan_profile/${customerID}`)} 
        />
        <h2 style={styles.headerTitle}>Comprehensive Statement</h2>
        <div style={styles.headerActions}>
          <button 
            style={{...styles.actionBtn, ...styles.copyBtn}} 
            onClick={handleCopyToClipboard}
          >
            <FontAwesomeIcon icon={faCopy} />
            {copied ? ' Copied!' : ' Copy'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.content}>
        {/* Summary Cards */}
        <div style={styles.summaryGrid}>
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>💰</div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Total Loan Given</p>
              <p style={styles.cardValue}>₹{formatToIndianCurrency(totalLoanGiven)}</p>
            </div>
          </div>
          
          <div style={styles.summaryCard}>
            <div style={styles.cardIcon}>💵</div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Interest Outstanding</p>
              <p style={styles.cardValue}>₹{formatToIndianCurrency(Math.floor(remainingInterest))}</p>
            </div>
          </div>
          
          <div style={{...styles.summaryCard, ...styles.highlightCard}}>
            <div style={styles.cardIcon}>🔴</div>
            <div style={styles.cardContent}>
              <p style={styles.cardLabel}>Total Outstanding</p>
              <p style={{...styles.cardValue, color: '#dc2626'}}>₹{formatToIndianCurrency(Math.floor(totalOutstanding))}</p>
            </div>
          </div>
        </div>

        {/* Preview Section */}
        <div style={styles.previewSection}>
          <h3 style={styles.previewTitle}>Statement Preview</h3>
          <pre style={styles.previewText}>{generateDetailedStatement()}</pre>
        </div>

        {/* Send Method Selector */}
        <div style={styles.methodSelector}>
          <button
            style={{
              ...styles.methodBtn,
              ...(sendMethod === 'whatsapp' ? styles.methodBtnActive : {})
            }}
            onClick={() => setSendMethod('whatsapp')}
          >
            {/* <FontAwesomeIcon icon={faWhatsapp} /> */}
            WhatsApp
          </button>
          <button
            style={{
              ...styles.methodBtn,
              ...(sendMethod === 'email' ? styles.methodBtnActive : {})
            }}
            onClick={() => setSendMethod('email')}
          >
            <FontAwesomeIcon icon={faEnvelope} />
            Email
          </button>
          <button
            style={{
              ...styles.methodBtn,
              ...(sendMethod === 'sms' ? styles.methodBtnActive : {})
            }}
            onClick={() => setSendMethod('sms')}
          >
            <FontAwesomeIcon icon={faPaperPlane} />
            SMS
          </button>
        </div>

        {/* Action Buttons */}
        <div style={styles.actionButtons}>
          <button style={styles.editBtn} onClick={handleEditMessage}>
            <FontAwesomeIcon icon={faEdit} />
            Edit & Send
          </button>
          <button style={styles.sendBtn} onClick={() => handleSend()}>
            <FontAwesomeIcon icon={faPaperPlane} />
            Send via {sendMethod === 'whatsapp' ? 'WhatsApp' : sendMethod === 'email' ? 'Email' : 'SMS'}
          </button>
          <button style={styles.downloadBtn} onClick={handleDownload}>
            <FontAwesomeIcon icon={faDownload} />
            Download
          </button>
        </div>
      </div>

      {/* Editor Modal */}
      {showEditor && (
        <div style={styles.modal} onClick={() => setShowEditor(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Edit Statement</h3>
              <FontAwesomeIcon 
                icon={faTimes} 
                style={styles.closeIcon}
                onClick={() => setShowEditor(false)}
              />
            </div>
            <textarea
              style={styles.textarea}
              value={editableMessage}
              onChange={(e) => setEditableMessage(e.target.value)}
              rows={25}
            />
            <div style={styles.modalFooter}>
              <button 
                style={styles.cancelBtn} 
                onClick={() => setShowEditor(false)}
              >
                Cancel
              </button>
              <button 
                style={styles.modalSendBtn}
                onClick={() => handleSend(editableMessage)}
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                Send via {sendMethod === 'whatsapp' ? 'WhatsApp' : sendMethod === 'email' ? 'Email' : 'SMS'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #e0e0e0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    marginTop: '20px',
    fontSize: '16px',
    color: '#666',
  },
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa',
  },
  errorText: {
    fontSize: '18px',
    color: '#e53e3e',
  },
  header: {
    backgroundColor: '#fff',
    padding: '20px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  backIcon: {
    fontSize: '20px',
    color: '#333',
    cursor: 'pointer',
  },
  headerTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  actionBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  copyBtn: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
  },
  content: {
    maxWidth: '900px',
    margin: '0 auto',
    padding: '20px',
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  highlightCard: {
    background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
  },
  cardIcon: {
    fontSize: '32px',
  },
  cardContent: {
    flex: 1,
  },
  cardLabel: {
    fontSize: '14px',
    color: '#666',
    margin: '0 0 5px 0',
  },
  cardValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#333',
    margin: 0,
  },
  previewSection: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '20px',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '15px',
  },
  previewText: {
    backgroundColor: '#f9fafb',
    padding: '20px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.6',
    fontFamily: 'monospace',
    maxHeight: '400px',
    overflow: 'auto',
    whiteSpace: 'pre-wrap',
    wordWrap: 'break-word',
  },
  methodSelector: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    justifyContent: 'center',
  },
  methodBtn: {
    padding: '12px 24px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.2s',
  },
  methodBtnActive: {
    backgroundColor: '#667eea',
    color: '#fff',
    borderColor: '#667eea',
  },
  actionButtons: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  editBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '16px',
    border: '2px solid #667eea',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#667eea',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
  },
  sendBtn: {
    flex: 2,
    minWidth: '200px',
    padding: '16px',
    border: 'none',
    borderRadius: '12px',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: '#fff',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
  },
  downloadBtn: {
    flex: 1,
    minWidth: '150px',
    padding: '16px',
    border: '2px solid #3b82f6',
    borderRadius: '12px',
    backgroundColor: '#fff',
    color: '#3b82f6',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.2s',
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '700px',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    borderBottom: '2px solid #e0e0e0',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px 16px 0 0',
  },
  modalTitle: {
    margin: 0,
    fontSize: '20px',
    fontWeight: '600',
    color: '#fff',
  },
  closeIcon: {
    fontSize: '24px',
    color: '#fff',
    cursor: 'pointer',
  },
  textarea: {
    flex: 1,
    padding: '20px',
    border: 'none',
    fontSize: '13px',
    fontFamily: 'monospace',
    lineHeight: '1.6',
    resize: 'none',
    outline: 'none',
    backgroundColor: '#f9fafb',
  },
  modalFooter: {
    display: 'flex',
    gap: '10px',
    padding: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  cancelBtn: {
    flex: 1,
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: '#fff',
    color: '#666',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalSendBtn: {
    flex: 2,
    padding: '12px',
    border: 'none',
    borderRadius: '8px',
    background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
};

export default ComprehensiveLoanStatement;

// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowLeft, faShare } from '@fortawesome/free-solid-svg-icons';
// // import '../../style/loans/WhatsAppStatement.css';

// const WhatsAppStatement = () => {
//   const { customerID } = useParams();
//   const navigate = useNavigate();
//   const [loanDetails, setLoanDetails] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
        
//         const [loanResponse, profileResponse] = await Promise.all([
//           axios.get(`http://localhost:5000/api/loan-profile/${customerID}`, {
//             headers: { 'x-auth-token': token }
//           }),
//           axios.get(`http://localhost:5000/api/loan-profile2/${customerID}`, {
//             headers: { 'x-auth-token': token }
//           })
//         ]);

//         setLoanDetails(loanResponse.data);
//         setProfile(profileResponse.data);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [customerID]);

//   const formatToIndianCurrency = (number) => {
//     if (!number) return '0';
//     return number.toString().replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
//   };

//   const calculateDaysBetween = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     return Math.floor((end - start) / (1000 * 60 * 60 * 24));
//   };

//   const calculateMonthsBetween = (startDate, endDate) => {
//     const start = new Date(startDate);
//     const end = new Date(endDate);
//     return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
//   };

//   const generateWhatsAppMessage = () => {
//     if (!loanDetails || !profile) return '';

//     const loanInfo = loanDetails.loanDetails;
//     const startDate = new Date(loanInfo.startDate);
//     const today = new Date();
//     const totalDays = calculateDaysBetween(startDate, today);
//     const totalMonths = calculateMonthsBetween(startDate, today);

//     // Calculate all amounts
//     const principalAmount = loanInfo.amount || 0;
//     const topUpTotal = loanInfo.topUpTotal || 0;
//     const totalLoanGiven = principalAmount + topUpTotal;
    
//     const baseInterest = loanInfo.accruedInterest || 0;
//     const topUpInterest = loanInfo.topUpInterest || 0;
//     const paidInterest = loanInfo.paidInterestTotal || 0;
//     const totalInterest = baseInterest + topUpInterest - paidInterest;
    
//     const principalRepaid = loanInfo.topDownHistory?.reduce((sum, td) => sum + td.amount, 0) || 0;
//     const remainingPrincipal = totalLoanGiven - principalRepaid;
//     const totalDue = remainingPrincipal + totalInterest;

//     // Build message
//     let message = `*📊 LOAN ACCOUNT STATEMENT*\n`;
//     message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
//     message += `*Customer Details:*\n`;
//     message += `👤 Name: ${profile.FirstName} ${profile.LastName || ''}\n`;
//     message += `📱 Phone: ${profile.phoneNumber}\n`;
//     message += `🔖 Bill No: ${loanInfo.billNo}\n\n`;
    
//     message += `*Loan Period:*\n`;
//     message += `📅 Start Date: ${startDate.toLocaleDateString('en-IN')}\n`;
//     message += `📅 Current Date: ${today.toLocaleDateString('en-IN')}\n`;
//     message += `⏱️ Duration: ${totalDays} days (${totalMonths} months)\n\n`;
    
//     message += `*Original Loan Details:*\n`;
//     message += `💰 Principal Amount: ₹${formatToIndianCurrency(principalAmount)}\n`;
//     message += `📈 Interest Rate: ${loanInfo.interestRate}%\n`;
//     message += `📊 Interest Type: ${loanInfo.interestFrequency}\n`;
//     message += `💵 Base Interest Accrued: ₹${formatToIndianCurrency(Math.floor(baseInterest))}\n\n`;

//     // Top-up details
//     if (loanInfo.topUpHistory && loanInfo.topUpHistory.length > 0) {
//       message += `*Top-Up History:*\n`;
//       loanInfo.topUpHistory.forEach((topUp, index) => {
//         const topUpDate = new Date(topUp.date);
//         const daysFromTopUp = calculateDaysBetween(topUpDate, today);
//         message += `${index + 1}. ₹${formatToIndianCurrency(topUp.amount)} on ${topUpDate.toLocaleDateString('en-IN')}\n`;
//         message += `   Rate: ${topUp.topupinterestrate}% | Days: ${daysFromTopUp}\n`;
//       });
//       message += `📊 Total Top-Up: ₹${formatToIndianCurrency(topUpTotal)}\n`;
//       message += `💵 Top-Up Interest: ₹${formatToIndianCurrency(Math.floor(topUpInterest))}\n\n`;
//     }

//     message += `*Total Loan Given:*\n`;
//     message += `💰 ₹${formatToIndianCurrency(totalLoanGiven)}\n\n`;

//     // Interest summary
//     message += `*Interest Breakdown:*\n`;
//     message += `📊 Base Interest: ₹${formatToIndianCurrency(Math.floor(baseInterest))}\n`;
//     if (topUpInterest > 0) {
//       message += `📊 Top-Up Interest: ₹${formatToIndianCurrency(Math.floor(topUpInterest))}\n`;
//     }
//     if (paidInterest > 0) {
//       message += `✅ Interest Paid: -₹${formatToIndianCurrency(Math.floor(paidInterest))}\n`;
//     }
//     message += `💵 *Total Interest Due: ₹${formatToIndianCurrency(Math.floor(totalInterest))}*\n\n`;

//     // Repayment details
//     if (loanInfo.topDownHistory && loanInfo.topDownHistory.length > 0) {
//       message += `*Principal Repayment History:*\n`;
//       loanInfo.topDownHistory.forEach((repay, index) => {
//         const repayDate = new Date(repay.date);
//         message += `${index + 1}. ₹${formatToIndianCurrency(repay.amount)} on ${repayDate.toLocaleDateString('en-IN')}\n`;
//       });
//       message += `✅ Total Repaid: ₹${formatToIndianCurrency(principalRepaid)}\n\n`;
//     }

//     // Interest payments
//     if (loanInfo.interestPaymentHistory && loanInfo.interestPaymentHistory.length > 0) {
//       message += `*Interest Payment History:*\n`;
//       loanInfo.interestPaymentHistory.forEach((payment, index) => {
//         const payDate = new Date(payment.date);
//         message += `${index + 1}. ₹${formatToIndianCurrency(payment.amount)} on ${payDate.toLocaleDateString('en-IN')}\n`;
//       });
//       message += `✅ Total Interest Paid: ₹${formatToIndianCurrency(Math.floor(paidInterest))}\n\n`;
//     }

//     // Final summary
//     message += `*CURRENT OUTSTANDING:*\n`;
//     message += `━━━━━━━━━━━━━━━━━━━━\n`;
//     message += `💰 Remaining Principal: ₹${formatToIndianCurrency(Math.floor(remainingPrincipal))}\n`;
//     message += `💵 Interest Due: ₹${formatToIndianCurrency(Math.floor(totalInterest))}\n`;
//     message += `━━━━━━━━━━━━━━━━━━━━\n`;
//     message += `*🔴 TOTAL AMOUNT DUE: ₹${formatToIndianCurrency(Math.floor(totalDue))}*\n\n`;
    
//     message += `_Statement generated on ${today.toLocaleString('en-IN')}_\n`;
//     message += `_This is a system-generated statement_`;

//     return message;
//   };

//   const handleWhatsAppShare = () => {
//     const message = generateWhatsAppMessage();
//     const phoneNumber = profile?.phoneNumber?.replace(/\D/g, ''); // Remove non-digits
//     const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   const handleCopyToClipboard = () => {
//     const message = generateWhatsAppMessage();
//     navigator.clipboard.writeText(message);
//     alert('Statement copied to clipboard!');
//   };

//   if (loading) {
//     return <div className="statement-loading">Loading statement...</div>;
//   }

//   if (!loanDetails || !profile) {
//     return <div className="statement-error">Error loading statement</div>;
//   }

//   const loanInfo = loanDetails.loanDetails;
//   const startDate = new Date(loanInfo.startDate);
//   const today = new Date();
//   const totalDays = calculateDaysBetween(startDate, today);
//   const totalMonths = calculateMonthsBetween(startDate, today);

//   // Calculate amounts for display
//   const principalAmount = loanInfo.amount || 0;
//   const topUpTotal = loanInfo.topUpTotal || 0;
//   const totalLoanGiven = principalAmount + topUpTotal;
  
//   const baseInterest = loanInfo.accruedInterest || 0;
//   const topUpInterest = loanInfo.topUpInterest || 0;
//   const paidInterest = loanInfo.paidInterestTotal || 0;
//   const totalInterest = baseInterest + topUpInterest - paidInterest;
  
//   const principalRepaid = loanInfo.topDownHistory?.reduce((sum, td) => sum + td.amount, 0) || 0;
//   const remainingPrincipal = totalLoanGiven - principalRepaid;
//   const totalDue = remainingPrincipal + totalInterest;

//   return (
//     <div className="whatsapp-statement-container">
//       <div className="statement-header">
//         <FontAwesomeIcon 
//           icon={faArrowLeft} 
//           className="back-icon" 
//           onClick={() => navigate(`/loan_profile/${customerID}`)} 
//         />
//         <h2>Account Statement</h2>
//         <div className="header-actions">
//           <button className="action-btn copy-btn" onClick={handleCopyToClipboard}>
//             <FontAwesomeIcon icon={faShare} /> Copy
//           </button>
//         </div>
//       </div>

//       <div className="statement-content">
//         <div className="statement-preview">
//           <div className="preview-header">
//             <h3>📊 LOAN ACCOUNT STATEMENT</h3>
//           </div>

//           <div className="statement-section">
//             <h4>Customer Details</h4>
//             <div className="detail-row">
//               <span>Name:</span>
//               <span>{profile.FirstName} {profile.LastName || ''}</span>
//             </div>
//             <div className="detail-row">
//               <span>Phone:</span>
//               <span>{profile.phoneNumber}</span>
//             </div>
//             <div className="detail-row">
//               <span>Bill No:</span>
//               <span>{loanInfo.billNo}</span>
//             </div>
//           </div>

//           <div className="statement-section">
//             <h4>Loan Period</h4>
//             <div className="detail-row">
//               <span>Start Date:</span>
//               <span>{startDate.toLocaleDateString('en-IN')}</span>
//             </div>
//             <div className="detail-row">
//               <span>Current Date:</span>
//               <span>{today.toLocaleDateString('en-IN')}</span>
//             </div>
//             <div className="detail-row highlight">
//               <span>Duration:</span>
//               <span>{totalDays} days ({totalMonths} months)</span>
//             </div>
//           </div>

//           <div className="statement-section">
//             <h4>Original Loan</h4>
//             <div className="detail-row">
//               <span>Principal:</span>
//               <span>₹{formatToIndianCurrency(principalAmount)}</span>
//             </div>
//             <div className="detail-row">
//               <span>Interest Rate:</span>
//               <span>{loanInfo.interestRate}% {loanInfo.interestFrequency}</span>
//             </div>
//             <div className="detail-row">
//               <span>Base Interest:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(baseInterest))}</span>
//             </div>
//           </div>

//           {loanInfo.topUpHistory && loanInfo.topUpHistory.length > 0 && (
//             <div className="statement-section">
//               <h4>Top-Up Details</h4>
//               {loanInfo.topUpHistory.map((topUp, index) => {
//                 const topUpDate = new Date(topUp.date);
//                 const daysFromTopUp = calculateDaysBetween(topUpDate, today);
//                 return (
//                   <div key={index} className="transaction-item">
//                     <div className="transaction-header">
//                       <span>Top-Up #{index + 1}</span>
//                       <span className="amount">₹{formatToIndianCurrency(topUp.amount)}</span>
//                     </div>
//                     <div className="transaction-details">
//                       <span>Date: {topUpDate.toLocaleDateString('en-IN')}</span>
//                       <span>Rate: {topUp.topupinterestrate}%</span>
//                       <span>Days: {daysFromTopUp}</span>
//                     </div>
//                   </div>
//                 );
//               })}
//               <div className="detail-row highlight">
//                 <span>Total Top-Up:</span>
//                 <span>₹{formatToIndianCurrency(topUpTotal)}</span>
//               </div>
//               <div className="detail-row">
//                 <span>Top-Up Interest:</span>
//                 <span>₹{formatToIndianCurrency(Math.floor(topUpInterest))}</span>
//               </div>
//             </div>
//           )}

//           <div className="statement-section">
//             <h4>Interest Summary</h4>
//             <div className="detail-row">
//               <span>Base Interest:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(baseInterest))}</span>
//             </div>
//             {topUpInterest > 0 && (
//               <div className="detail-row">
//                 <span>Top-Up Interest:</span>
//                 <span>₹{formatToIndianCurrency(Math.floor(topUpInterest))}</span>
//               </div>
//             )}
//             {paidInterest > 0 && (
//               <div className="detail-row paid">
//                 <span>Interest Paid:</span>
//                 <span>-₹{formatToIndianCurrency(Math.floor(paidInterest))}</span>
//               </div>
//             )}
//             <div className="detail-row total">
//               <span>Total Interest Due:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(totalInterest))}</span>
//             </div>
//           </div>

//           {loanInfo.topDownHistory && loanInfo.topDownHistory.length > 0 && (
//             <div className="statement-section">
//               <h4>Principal Repayments</h4>
//               {loanInfo.topDownHistory.map((repay, index) => (
//                 <div key={index} className="transaction-item paid">
//                   <div className="transaction-header">
//                     <span>Payment #{index + 1}</span>
//                     <span className="amount">₹{formatToIndianCurrency(repay.amount)}</span>
//                   </div>
//                   <div className="transaction-details">
//                     <span>{new Date(repay.date).toLocaleDateString('en-IN')}</span>
//                     <span>{repay.method}</span>
//                   </div>
//                 </div>
//               ))}
//               <div className="detail-row paid">
//                 <span>Total Repaid:</span>
//                 <span>₹{formatToIndianCurrency(principalRepaid)}</span>
//               </div>
//             </div>
//           )}

//           {loanInfo.interestPaymentHistory && loanInfo.interestPaymentHistory.length > 0 && (
//             <div className="statement-section">
//               <h4>Interest Payments</h4>
//               {loanInfo.interestPaymentHistory.map((payment, index) => (
//                 <div key={index} className="transaction-item paid">
//                   <div className="transaction-header">
//                     <span>Payment #{index + 1}</span>
//                     <span className="amount">₹{formatToIndianCurrency(payment.amount)}</span>
//                   </div>
//                   <div className="transaction-details">
//                     <span>{new Date(payment.date).toLocaleDateString('en-IN')}</span>
//                     <span>{payment.method}</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}

//           <div className="statement-section final-summary">
//             <h4>CURRENT OUTSTANDING</h4>
//             <div className="detail-row">
//               <span>Remaining Principal:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(remainingPrincipal))}</span>
//             </div>
//             <div className="detail-row">
//               <span>Interest Due:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(totalInterest))}</span>
//             </div>
//             <div className="detail-row total-due">
//               <span>TOTAL AMOUNT DUE:</span>
//               <span>₹{formatToIndianCurrency(Math.floor(totalDue))}</span>
//             </div>
//           </div>

//           <div className="statement-footer">
//             <p>Statement generated on {today.toLocaleString('en-IN')}</p>
//             <p>This is a system-generated statement</p>
//           </div>
//         </div>

//         <button className="whatsapp-share-btn" onClick={handleWhatsAppShare}>
//           {/* <FontAwesomeIcon icon={faWhatsapp} size="lg" /> */}
//           <span>Share on WhatsApp</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default WhatsAppStatement;