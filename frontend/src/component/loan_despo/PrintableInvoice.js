import React, { useState, useEffect, useRef } from 'react';
import { Download, Share2, Printer } from 'lucide-react';

const LoanBillGenerator = () => {
  const billRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [billData, setBillData] = useState(null);

  useEffect(() => {
    const fetchBillData = async () => {
      try {
        setLoading(true);
        
        const customerID = window.location.pathname.split('/').pop();
        const token = localStorage.getItem('token');
        
        const loanResponse = await fetch(`https://serverczone.vercel.app/api/loan-profile/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        const loanData = await loanResponse.json();
        
        const profileResponse = await fetch(`https://serverczone.vercel.app/api/loan-profile2/${customerID}`, {
          headers: { 'x-auth-token': token }
        });
        const profileData = await profileResponse.json();
        
        prepareBillData(loanData, profileData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching bill data:', err);
        setError('Failed to load bill data');
        setLoading(false);
      }
    };

    fetchBillData();
  }, []);

  const calculateDaysBetween = (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateInterest = (principal, rate, days) => {
    const monthlyRate = rate / 100;
    return (principal * monthlyRate * days) / 30;
  };

  const prepareBillData = (loanData, profileData) => {
    const { loanDetails: loan, updatedAt, createdAt } = loanData;
    const { FirstName, LastName, phoneNumber, address } = profileData;

    const billNumber = loan.billNo || `BILL-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    
    setBillData({
      customerName: `${FirstName || ''} ${LastName || ''}`.trim() || 'N/A',
      customerPhone: phoneNumber || 'N/A',
      customerAddress: address || 'N/A',
      businessName: "CZONE",
      businessAddress: "547 High Street, London",
      businessRegNo: "12345678",
      businessVAT: "GB123456789",
      businessPhone: "07831261234",
      businessEmail: "contact@czone.co.uk",
      billNumber: billNumber,
      billDate: new Date(createdAt).toLocaleDateString('en-GB'),
      loanStartDate: new Date(loan.startDate).toLocaleDateString('en-GB'),
      calculationDate: new Date().toLocaleDateString('en-GB'),
      lastUpdated: new Date(updatedAt).toLocaleString('en-GB'),
      
      // Raw data for calculations
      rawData: {
        principalAmount: loan.amount || 0,
        interestRate: loan.interestRate || 0,
        startDate: loan.startDate,
        topUpHistory: loan.topUpHistory || [],
        topDownHistory: loan.topDownHistory || [],
        interestPaymentHistory: loan.interestPaymentHistory || [],
        accruedInterest: loan.accruedInterest || 0,
        paidInterestTotal: loan.paidInterestTotal || 0,
        remainingPrincipal: loan.remainingPrincipal || loan.amount,
        topUpTotal: loan.topUpTotal || 0,
        topUpInterest: loan.topUpInterest || 0,
      },
      
      vehicleInfo: loan.remarks || "Loan Account",
      paymentTerms: "Payment to be made within 14 days",
    });
  };

  const generateTransactionTimeline = () => {
    if (!billData) return [];
    
    const { rawData } = billData;
    const timeline = [];
    const today = new Date();
    
    // Combine all transactions with dates
    const allTransactions = [
      { type: 'loan_start', date: rawData.startDate, amount: rawData.principalAmount },
      ...rawData.topUpHistory.map(t => ({ type: 'topup', date: t.date, amount: t.amount, rate: t.topupinterestrate || rawData.interestRate })),
      ...rawData.topDownHistory.map(t => ({ type: 'principal_payment', date: t.date, amount: t.amount })),
      ...rawData.interestPaymentHistory.map(t => ({ type: 'interest_payment', date: t.date, amount: t.amount })),
    ];
    
    // Sort by date
    allTransactions.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let currentPrincipal = rawData.principalAmount;
    let currentAccruedInterest = 0;
    let lastCalculationDate = new Date(rawData.startDate);
    let transactionNumber = 0;
    
    // Initial loan entry
    timeline.push({
      id: ++transactionNumber,
      type: 'loan_start',
      date: new Date(rawData.startDate).toLocaleDateString('en-GB'),
      description: 'Initial Loan Amount',
      detail: `Loan issued at ${rawData.interestRate}% monthly interest`,
      principal: rawData.principalAmount,
      interest: 0,
      runningPrincipal: rawData.principalAmount,
      runningInterest: 0,
    });
    
    // Process each transaction
    allTransactions.forEach((transaction, index) => {
      if (transaction.type === 'loan_start') return; // Already added
      
      const transactionDate = new Date(transaction.date);
      const daysElapsed = calculateDaysBetween(lastCalculationDate, transactionDate);
      
      // Calculate interest accrued up to this transaction
      if (daysElapsed > 0 && currentPrincipal > 0) {
        const interestAccrued = calculateInterest(currentPrincipal, rawData.interestRate, daysElapsed);
        currentAccruedInterest += interestAccrued;
        
        // Show interest accrual
        timeline.push({
          id: ++transactionNumber,
          type: 'interest_accrual',
          date: transactionDate.toLocaleDateString('en-GB'),
          description: `Interest Accrued (${daysElapsed} days)`,
          detail: `From ${lastCalculationDate.toLocaleDateString('en-GB')} to ${transactionDate.toLocaleDateString('en-GB')} on ₹${currentPrincipal.toFixed(2)}`,
          principal: 0,
          interest: interestAccrued,
          runningPrincipal: currentPrincipal,
          runningInterest: currentAccruedInterest,
        });
      }
      
      // Process the transaction
      if (transaction.type === 'topup') {
        currentPrincipal += transaction.amount;
        timeline.push({
          id: ++transactionNumber,
          type: 'topup',
          date: transactionDate.toLocaleDateString('en-GB'),
          description: 'Top-up Amount Added',
          detail: `Additional loan at ${transaction.rate}% interest`,
          principal: transaction.amount,
          interest: 0,
          runningPrincipal: currentPrincipal,
          runningInterest: currentAccruedInterest,
        });
      } 
      else if (transaction.type === 'principal_payment') {
        currentPrincipal -= transaction.amount;
        timeline.push({
          id: ++transactionNumber,
          type: 'principal_payment',
          date: transactionDate.toLocaleDateString('en-GB'),
          description: 'Principal Repayment',
          detail: `Payment towards principal balance - New balance: ₹${currentPrincipal.toFixed(2)}`,
          principal: -transaction.amount,
          interest: 0,
          runningPrincipal: currentPrincipal,
          runningInterest: currentAccruedInterest,
          highlight: true,
        });
      } 
      else if (transaction.type === 'interest_payment') {
        currentAccruedInterest -= transaction.amount;
        timeline.push({
          id: ++transactionNumber,
          type: 'interest_payment',
          date: transactionDate.toLocaleDateString('en-GB'),
          description: 'Interest Payment',
          detail: `Payment towards accrued interest - Remaining interest: ₹${currentAccruedInterest.toFixed(2)}`,
          principal: 0,
          interest: -transaction.amount,
          runningPrincipal: currentPrincipal,
          runningInterest: currentAccruedInterest,
          highlight: true,
        });
      }
      
      lastCalculationDate = transactionDate;
    });
    
    // Calculate interest from last transaction to today
    const finalDays = calculateDaysBetween(lastCalculationDate, today);
    if (finalDays > 0 && currentPrincipal > 0) {
      const finalInterest = calculateInterest(currentPrincipal, rawData.interestRate, finalDays);
      currentAccruedInterest += finalInterest;
      
      timeline.push({
        id: ++transactionNumber,
        type: 'interest_accrual',
        date: today.toLocaleDateString('en-GB'),
        description: `Current Interest (${finalDays} days)`,
        detail: `From ${lastCalculationDate.toLocaleDateString('en-GB')} to ${today.toLocaleDateString('en-GB')} on ₹${currentPrincipal.toFixed(2)}`,
        principal: 0,
        interest: finalInterest,
        runningPrincipal: currentPrincipal,
        runningInterest: currentAccruedInterest,
        isCurrent: true,
      });
    }
    
    return timeline;
  };

  const calculateFinalTotals = () => {
    if (!billData) return { principal: 0, interest: 0, total: 0 };
    
    const timeline = generateTransactionTimeline();
    const lastEntry = timeline[timeline.length - 1];
    
    return {
      principal: lastEntry?.runningPrincipal || 0,
      interest: lastEntry?.runningInterest || 0,
      total: (lastEntry?.runningPrincipal || 0) + (lastEntry?.runningInterest || 0),
    };
  };

  const timeline = generateTransactionTimeline();
  const totals = calculateFinalTotals();

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(Math.abs(amount));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    alert('Download functionality would generate a PDF of this bill');
  };

  const handleShare = () => {
    if (!billData) return;
    
    const message = `
*Bill #${billData.billNumber}*

Dear ${billData.customerName},

Outstanding Amount: ₹${formatCurrency(totals.total)}
Principal: ₹${formatCurrency(totals.principal)}
Interest: ₹${formatCurrency(totals.interest)}

${billData.businessName}
${billData.businessPhone}
    `.trim();

    const whatsappUrl = `https://wa.me/${billData.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '1rem' }}>
        <div style={{ width: '48px', height: '48px', border: '4px solid #e5e7eb', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
        <p>Loading bill data...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error || !billData) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: '2rem', color: '#dc2626' }}>
        <p>{error || 'Failed to load bill'}</p>
      </div>
    );
  }

  return (
    <div className="bill-wrapper">
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .bill-container, .bill-container * { visibility: visible; }
          .bill-container { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
        
        .bill-wrapper { min-height: 100vh; background: #f3f4f6; padding: 2rem; font-family: 'Arial', sans-serif; }
        @media print { .bill-wrapper { padding: 0; background: white; } }
        
        .bill-actions { max-width: 60rem; margin: 0 auto 1rem; display: flex; gap: 0.5rem; justify-content: flex-end; }
        .btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; color: white; border: none; border-radius: 0.375rem; cursor: pointer; transition: all 0.2s; font-size: 0.875rem; }
        .btn-print { background: #4b5563; }
        .btn-print:hover { background: #374151; }
        .btn-download { background: #3b82f6; }
        .btn-download:hover { background: #2563eb; }
        .btn-share { background: #16a34a; }
        .btn-share:hover { background: #15803d; }
        
        .bill-update-info { max-width: 60rem; margin: 0 auto 1rem; display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; }
        .update-indicator { width: 8px; height: 8px; background: #22c55e; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .bill-container { max-width: 60rem; margin: 0 auto; background: white; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border: 1px solid #e5e7eb; }
        
        .bill-header { padding: 2rem 3rem; border-bottom: 3px double #3b82f6; background: linear-gradient(to bottom, #ffffff 0%, #f8fafc 100%); }
        .bill-header-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1.5rem; }
        .bill-logo { flex-shrink: 0; }
        .logo-box { width: 7rem; height: 7rem; background: linear-gradient(135deg, #eab308 0%, #f59e0b 100%); display: flex; align-items: center; justify-content: center; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .company-details { text-align: right; font-size: 0.875rem; color: #4b5563; }
        .company-name { font-size: 1.75rem; font-weight: bold; margin-bottom: 0.5rem; color: #111827; letter-spacing: -0.5px; }
        .company-details p { margin: 0.125rem 0; }
        
        .bill-title-section { text-align: center; margin: 1.5rem 0; padding: 1rem; background: #f8fafc; border-radius: 8px; }
        .bill-title { font-size: 2rem; font-weight: bold; color: #1e293b; margin: 0; letter-spacing: 1px; }
        .bill-subtitle { font-size: 0.875rem; color: #64748b; margin: 0.5rem 0 0 0; }
        
        .bill-info-section { display: flex; justify-content: space-between; padding: 2rem 3rem; background: #fafbfc; }
        .bill-to h3 { font-weight: 600; color: #374151; margin-bottom: 0.75rem; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .customer-name { font-weight: 600; font-size: 1.125rem; margin: 0.25rem 0; color: #111827; }
        .bill-to p { font-size: 0.875rem; color: #4b5563; margin: 0.125rem 0; }
        
        .bill-details { text-align: right; }
        .detail-item { margin-bottom: 0.75rem; display: flex; justify-content: flex-end; gap: 1rem; }
        .detail-label { font-size: 0.875rem; color: #6b7280; font-weight: 500; }
        .detail-value { font-size: 0.875rem; font-weight: 700; color: #111827; min-width: 120px; text-align: right; }
        
        .bill-table-wrapper { padding: 2rem 3rem; }
        .section-title { font-size: 1.125rem; font-weight: 700; color: #1e293b; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 2px solid #3b82f6; }
        
        .bill-table { width: 100%; border-collapse: collapse; border: 1px solid #e5e7eb; margin-bottom: 2rem; }
        .bill-table thead { background: linear-gradient(to bottom, #1e293b 0%, #334155 100%); color: white; }
        .bill-table th { padding: 0.875rem 1rem; text-align: left; font-weight: 700; font-size: 0.8125rem; text-transform: uppercase; letter-spacing: 0.5px; }
        .bill-table td { padding: 1rem; border-bottom: 1px solid #e5e7eb; font-size: 0.875rem; vertical-align: top; }
        .bill-table tbody tr:hover { background: #f8fafc; }
        .bill-table tbody tr.highlight-row { background: #fef2f2; border-left: 3px solid #dc2626; }
        .bill-table tbody tr.current-row { background: #eff6ff; border-left: 3px solid #3b82f6; font-weight: 600; }
        
        .col-no { width: 5%; text-align: center; }
        .col-date { width: 12%; }
        .col-description { width: 38%; }
        .col-principal { width: 15%; text-align: right; }
        .col-interest { width: 15%; text-align: right; }
        .col-balance { width: 15%; text-align: right; }
        
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .item-description { color: #111827; font-weight: 600; margin-bottom: 0.25rem; }
        .item-detail { color: #6b7280; font-size: 0.8125rem; line-height: 1.4; }
        .amount-positive { color: #059669; font-weight: 600; }
        .amount-negative { color: #dc2626; font-weight: 600; }
        .amount-neutral { color: #4b5563; }
        
        .bill-totals { padding: 0 3rem 2rem; display: flex; justify-content: flex-end; }
        .totals-wrapper { width: 450px; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden; }
        .total-row { display: flex; justify-content: space-between; padding: 0.875rem 1.5rem; font-size: 0.9375rem; border-bottom: 1px solid #e5e7eb; }
        .total-row:last-child { border-bottom: none; }
        .total-row span:first-child { color: #374151; font-weight: 500; }
        .total-row span:last-child { font-weight: 700; color: #111827; }
        .total-outstanding { background: #dbeafe; padding: 1.25rem 1.5rem !important; }
        .total-outstanding span { font-size: 1.25rem; font-weight: 800; }
        .total-outstanding span:first-child { color: #1e40af; }
        .total-outstanding span:last-child { color: #1e40af; }
        
        .bill-signature-section { padding: 2rem 3rem; border-top: 2px solid #e5e7eb; }
        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; margin-top: 3rem; }
        .signature-box { text-align: center; }
        .signature-line { border-top: 2px solid #111827; padding-top: 0.5rem; margin-top: 3rem; font-size: 0.875rem; color: #374151; font-weight: 600; }
        .signature-label { margin-top: 0.25rem; font-size: 0.8125rem; color: #6b7280; }
        
        .bill-footer { background: #1e293b; color: white; padding: 1.5rem 3rem; text-align: center; }
        .footer-text { font-size: 0.8125rem; margin: 0.25rem 0; }
        .footer-brand { margin-top: 1rem; font-weight: 700; font-size: 1rem; letter-spacing: 2px; }
      `}</style>

      <div className="bill-actions no-print">
        <button onClick={handlePrint} className="btn-action btn-print">
          <Printer size={18} />
          Print
        </button>
        <button onClick={handleDownload} className="btn-action btn-download">
          <Download size={18} />
          Download PDF
        </button>
        <button onClick={handleShare} className="btn-action btn-share">
          <Share2 size={18} />
          Share via WhatsApp
        </button>
      </div>

      <div className="bill-update-info no-print">
        <span className="update-indicator"></span>
        Last updated: {billData.lastUpdated}
      </div>

      <div ref={billRef} className="bill-container">
        
        <div className="bill-header">
          <div className="bill-header-top">
            <div className="bill-logo">
              <div className="logo-box">
                <svg width="70" height="70" viewBox="0 0 100 100" fill="none">
                  <rect x="35" y="20" width="30" height="50" rx="2" fill="#333" stroke="#333" strokeWidth="2"/>
                  <circle cx="50" cy="35" r="8" fill="#fff"/>
                  <rect x="42" y="45" width="16" height="3" fill="#fff"/>
                  <rect x="42" y="52" width="16" height="3" fill="#fff"/>
                  <path d="M 20 70 L 30 60 L 30 70 Z" fill="#333"/>
                  <path d="M 80 70 L 70 60 L 70 70 Z" fill="#333"/>
                  <rect x="28" y="70" width="44" height="8" fill="#333"/>
                </svg>
              </div>
            </div>

            <div className="company-details">
              <h1 className="company-name">{billData.businessName}</h1>
              <p>{billData.businessAddress}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Co. Reg:</strong> {billData.businessRegNo}</p>
              <p><strong>VAT:</strong> {billData.businessVAT}</p>
              <p style={{ marginTop: '0.5rem' }}><strong>Phone:</strong> {billData.businessPhone}</p>
              <p><strong>Email:</strong> {billData.businessEmail}</p>
            </div>
          </div>

          <div className="bill-title-section">
            <h2 className="bill-title">LOAN BILL</h2>
            <p className="bill-subtitle">Detailed Transaction Statement</p>
          </div>
        </div>

        <div className="bill-info-section">
          <div className="bill-to">
            <h3>Bill To:</h3>
            <p className="customer-name">{billData.customerName}</p>
            <p>{billData.customerAddress}</p>
            <p>{billData.customerPhone}</p>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#6b7280' }}>
              Ref: {billData.vehicleInfo}
            </p>
          </div>

          <div className="bill-details">
            <div className="detail-item">
              <span className="detail-label">Bill Number:</span>
              <span className="detail-value">{billData.billNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Bill Date:</span>
              <span className="detail-value">{billData.billDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Loan Start:</span>
              <span className="detail-value">{billData.loanStartDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Calculated Till:</span>
              <span className="detail-value">{billData.calculationDate}</span>
            </div>
          </div>
        </div>

        <div className="bill-table-wrapper">
          <h3 className="section-title">📊 Transaction Timeline</h3>
          
          <table className="bill-table">
            <thead>
              <tr>
                <th className="col-no">#</th>
                <th className="col-date">Date</th>
                <th className="col-description">Description</th>
                <th className="col-principal">Principal (₹)</th>
                <th className="col-interest">Interest (₹)</th>
                <th className="col-balance">Balance (₹)</th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item) => (
                <tr 
                  key={item.id} 
                  className={item.highlight ? 'highlight-row' : item.isCurrent ? 'current-row' : ''}
                >
                  <td className="text-center">{item.id}</td>
                  <td>{item.date}</td>
                  <td>
                    <div className="item-description">{item.description}</div>
                    <div className="item-detail">{item.detail}</div>
                  </td>
                  <td className="text-right">
                    {item.principal !== 0 && (
                      <span className={item.principal < 0 ? 'amount-negative' : 'amount-positive'}>
                        {item.principal < 0 ? '-' : ''}₹{formatCurrency(item.principal)}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    {item.interest !== 0 && (
                      <span className={item.interest < 0 ? 'amount-negative' : 'amount-positive'}>
                        {item.interest < 0 ? '-' : ''}₹{formatCurrency(item.interest)}
                      </span>
                    )}
                  </td>
                  <td className="text-right">
                    <span className="amount-neutral">
                      ₹{formatCurrency(item.runningPrincipal + item.runningInterest)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bill-totals">
          <div className="totals-wrapper">
            <div className="total-row">
              <span>Current Principal Balance</span>
              <span>₹{formatCurrency(totals.principal)}</span>
            </div>
            <div className="total-row">
              <span>Current Interest Accrued</span>
              <span>₹{formatCurrency(totals.interest)}</span>
            </div>
            <div className="total-row total-outstanding">
              <span>TOTAL OUTSTANDING</span>
              <span>₹{formatCurrency(totals.total)}</span>
            </div>
          </div>
        </div>

        <div className="bill-signature-section">
          <p style={{ fontSize: '0.875rem', color: '#4b5563', marginBottom: '1rem', textAlign: 'center' }}>
            <strong>Payment Terms:</strong> {billData.paymentTerms}
          </p>
          
          <div className="signature-grid">
            <div className="signature-box">
              <div className="signature-line">Authorized Signature</div>
              <div className="signature-label">{billData.businessName}</div>
            </div>
            <div className="signature-box">
              <div className="signature-line">Customer Signature</div>
              <div className="signature-label">{billData.customerName}</div>
            </div>
          </div>
        </div>

        <div className="bill-footer">
          <p className="footer-text">This is a computer-generated bill and is valid without signature</p>
          <p className="footer-text">{billData.businessAddress} | {billData.businessPhone} | {billData.businessEmail}</p>
          <p className="footer-brand">{billData.businessName}</p>
        </div>
      </div>
    </div>
  );
};

export default LoanBillGenerator;



// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FileText, Share2, Download, ArrowLeft } from 'lucide-react';
// import './Invoice.css';

// const LoanBillGenerator = () => {
//   const { customerID } = useParams();
//   const navigate = useNavigate();
//   const [loanDetails, setLoanDetails] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [billData, setBillData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchLoanDetails();
//   }, [customerID]);

//   const fetchLoanDetails = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       const [loanRes, profileRes] = await Promise.all([
//         axios.get(`http://localhost:5000/api/loan-profile/${customerID}`, {
//           headers: { 'x-auth-token': token }
//         }),
//         axios.get(`http://localhost:5000/api/loan-profile2/${customerID}`, {
//           headers: { 'x-auth-token': token }
//         })
//       ]);

//       setLoanDetails(loanRes.data);
//       setProfile(profileRes.data);
//       generateBillData(loanRes.data, profileRes.data);
//     } catch (err) {
//       setError('Failed to fetch loan details');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateBillData = (loan, prof) => {
//     const { loanDetails: ld } = loan;
//     const { amount, interestRate, startDate, topUpHistory = [], topDownHistory = [] } = ld;
//     const { FirstName, LastName } = prof;

//     const today = new Date();
//     const dailyRate = interestRate / 100 / 30;

//     // Build invoice rows
//     const invoiceRows = [];
//     let runningPrincipal = amount;
//     let totalInterestAccrued = 0;
//     let lastDate = new Date(startDate);

//     // 1. PRINCIPAL ROW - Interest from start till today
//     const daysFromStart = Math.floor((today - new Date(startDate)) / (1000 * 60 * 60 * 24));
//     const principalInterest = amount * dailyRate * daysFromStart;

//     invoiceRows.push({
//       date: startDate,
//       type: 'Principal Amount',
//       amount: amount,
//       daysElapsed: daysFromStart,
//       interestTillDate: principalInterest,
//       runningTotal: amount
//     });

//     totalInterestAccrued = principalInterest;

//     // 2. MERGE ALL TRANSACTIONS (Top-Ups + Top-Downs)
//     const allTransactions = [
//       ...topUpHistory.map(t => ({ ...t, transactionType: 'TOP_UP' })),
//       ...topDownHistory.map(t => ({ ...t, transactionType: 'TOP_DOWN' }))
//     ].sort((a, b) => new Date(a.date) - new Date(b.date));

//     // 3. PROCESS EACH TRANSACTION
//     allTransactions.forEach(transaction => {
//       const transactionDate = new Date(transaction.date);
//       const daysSinceLastTransaction = Math.floor((transactionDate - lastDate) / (1000 * 60 * 60 * 24));
      
//       // Interest from transaction date to today
//       const daysFromTransactionToToday = Math.floor((today - transactionDate) / (1000 * 60 * 60 * 24));
      
//       if (transaction.transactionType === 'TOP_UP') {
//         // Calculate interest on this top-up amount from its date till today
//         const topUpInterestTillToday = transaction.amount * dailyRate * daysFromTransactionToToday;
//         totalInterestAccrued += topUpInterestTillToday;
//         runningPrincipal += transaction.amount;

//         invoiceRows.push({
//           date: transaction.date,
//           type: 'Top-Up',
//           amount: transaction.amount,
//           daysElapsed: daysFromTransactionToToday,
//           interestTillDate: topUpInterestTillToday,
//           runningTotal: runningPrincipal,
//           method: transaction.method
//         });
//       } 
//       else if (transaction.transactionType === 'TOP_DOWN') {
//         // Interest accrued on principal before repayment
//         const interestBeforePayment = runningPrincipal * dailyRate * daysSinceLastTransaction;
        
//         const deductionAmount = Math.min(transaction.amount, runningPrincipal);
//         runningPrincipal -= deductionAmount;

//         invoiceRows.push({
//           date: transaction.date,
//           type: 'Top-Down (Repayment)',
//           amount: -deductionAmount,
//           daysElapsed: daysSinceLastTransaction,
//           interestTillDate: interestBeforePayment,
//           runningTotal: runningPrincipal,
//           method: transaction.method
//         });
//       }

//       lastDate = transactionDate;
//     });

//     const totalPrincipal = runningPrincipal;
//     const totalPayable = totalPrincipal + totalInterestAccrued;

//     setBillData({
//       customerName: `${FirstName} ${LastName || ''}`,
//       customerID,
//       billDate: today.toLocaleDateString('en-IN'),
//       loanStartDate: new Date(startDate).toLocaleDateString('en-IN'),
//       interestRate: interestRate,
//       invoiceRows: invoiceRows,
//       summary: {
//         totalPrincipal: totalPrincipal,
//         totalInterest: totalInterestAccrued,
//         totalPayable: totalPayable,
//         originalAmount: amount,
//         totalTopUps: topUpHistory.reduce((sum, t) => sum + t.amount, 0),
//         totalRepayments: topDownHistory.reduce((sum, t) => sum + t.amount, 0)
//       }
//     });
//   };

//   const formatCurrency = (num) => {
//     if (!num && num !== 0) return '₹0.00';
//     return '₹' + Math.abs(num).toLocaleString('en-IN', { 
//       minimumFractionDigits: 2,
//       maximumFractionDigits: 2 
//     });
//   };

//   const generateWhatsAppMessage = () => {
//     if (!billData) return '';

//     let msg = `*🧾 LOAN STATEMENT*\n\n`;
//     msg += `*Customer:* ${billData.customerName}\n`;
//     msg += `*ID:* ${billData.customerID}\n`;
//     msg += `*Date:* ${billData.billDate}\n`;
//     msg += `*Interest Rate:* ${billData.interestRate}% per month\n\n`;
    
//     msg += `*━━━ TRANSACTION DETAILS ━━━*\n\n`;
    
//     billData.invoiceRows.forEach((row, idx) => {
//       msg += `${idx + 1}. *${row.type}*\n`;
//       msg += `   Date: ${new Date(row.date).toLocaleDateString('en-IN')}\n`;
//       msg += `   Amount: ${formatCurrency(row.amount)}\n`;
//       msg += `   Interest (${row.daysElapsed} days): ${formatCurrency(row.interestTillDate)}\n`;
//       msg += `   Running Total: ${formatCurrency(row.runningTotal)}\n\n`;
//     });
    
//     msg += `*━━━━━━━━━━━━━━━━━━━━*\n`;
//     msg += `*Total Principal:* ${formatCurrency(billData.summary.totalPrincipal)}\n`;
//     msg += `*Total Interest:* ${formatCurrency(billData.summary.totalInterest)}\n`;
//     msg += `*━━━━━━━━━━━━━━━━━━━━*\n`;
//     msg += `*TOTAL PAYABLE:* ${formatCurrency(billData.summary.totalPayable)}\n\n`;
//     msg += `📌 Interest calculated till ${billData.billDate}. Any repayment or top-up after this date will be reflected in the next invoice.`;

//     return encodeURIComponent(msg);
//   };

//   const handleWhatsAppShare = () => {
//     const message = generateWhatsAppMessage();
//     const whatsappUrl = `https://wa.me/?text=${message}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   const handlePrintBill = () => {
//     window.print();
//   };

//   if (loading) {
//     return (
//       <div className="loading-container">
//         <div className="spinner"></div>
//         <p>Loading bill details...</p>
//       </div>
//     );
//   }

//   if (error || !billData) {
//     return (
//       <div className="error-container">
//         <p className="error-text">{error || 'No bill data available'}</p>
//         <button onClick={() => navigate(`/loan_profile/${customerID}`)} className="btn-primary">
//           Back to Loan Profile
//         </button>
//       </div>
//     );
//   }

//   return (
//     <div className="invoice-page">
//       {/* Header */}
//       <div className="invoice-header">
//         <button onClick={() => navigate(`/loan_profile/${customerID}`)} className="btn-back">
//           <ArrowLeft size={20} />
//           Back
//         </button>
//         <h1>Loan Bill Statement</h1>
//         <div className="spacer"></div>
//       </div>

//       {/* Action Buttons */}
//       <div className="action-buttons">
//         <button onClick={handleWhatsAppShare} className="btn-whatsapp">
//           <Share2 size={18} />
//           Share via WhatsApp
//         </button>
//         <button onClick={handlePrintBill} className="btn-print">
//           <FileText size={18} />
//           Print Bill
//         </button>
//       </div>

//       {/* Bill Container */}
//       <div id="bill-container" className="bill-container">
//         {/* Bill Header */}
//         <div className="bill-header-section">
//           <h2>LOAN STATEMENT</h2>
//           <p className="bill-subtitle">Detailed Transaction and Interest Calculation Report</p>
//         </div>

//         {/* Customer Details */}
//         <div className="customer-details">
//           <div className="detail-item">
//             <span className="label">CUSTOMER NAME</span>
//             <span className="value">{billData.customerName}</span>
//           </div>
//           <div className="detail-item">
//             <span className="label">CUSTOMER ID</span>
//             <span className="value">{billData.customerID}</span>
//           </div>
//           <div className="detail-item">
//             <span className="label">LOAN START DATE</span>
//             <span className="value">{billData.loanStartDate}</span>
//           </div>
//           <div className="detail-item">
//             <span className="label">STATEMENT DATE</span>
//             <span className="value">{billData.billDate}</span>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="summary-cards">
//           <div className="summary-card blue">
//             <span className="card-label">Original Amount</span>
//             <span className="card-value">{formatCurrency(billData.summary.originalAmount)}</span>
//           </div>
//           <div className="summary-card green">
//             <span className="card-label">Total Top-ups</span>
//             <span className="card-value">{formatCurrency(billData.summary.totalTopUps)}</span>
//           </div>
//           <div className="summary-card orange">
//             <span className="card-label">Total Repayments</span>
//             <span className="card-value">{formatCurrency(billData.summary.totalRepayments)}</span>
//           </div>
//           <div className="summary-card red">
//             <span className="card-label">Current Principal</span>
//             <span className="card-value">{formatCurrency(billData.summary.totalPrincipal)}</span>
//           </div>
//         </div>

//         {/* ============================================ */}
//         {/* RESTRUCTURED INVOICE TABLE SECTION */}
//         {/* ============================================ */}
        
//         <div className="invoice-table-wrapper">
//           <h3 className="section-title">DETAILED INVOICE</h3>
          
//           <table className="invoice-table">
//             <thead>
//               <tr>
//                 <th>Date</th>
//                 <th>Type</th>
//                 <th className="text-right">Amount</th>
//                 <th className="text-right">Days</th>
//                 <th className="text-right">Interest Till Date</th>
//                 <th className="text-right">Running Total</th>
//               </tr>
//             </thead>
//             <tbody>
//               {/* Dynamic Rows: Principal + Top-Ups + Top-Downs */}
//               {billData.invoiceRows.map((row, index) => (
//                 <tr key={index} className={row.type.includes('Top-Down') ? 'row-repayment' : ''}>
//                   <td>{new Date(row.date).toLocaleDateString('en-IN')}</td>
//                   <td className="type-cell">
//                     <strong>{row.type}</strong>
//                     {row.method && <span className="method-badge">{row.method}</span>}
//                   </td>
//                   <td className={`text-right ${row.amount < 0 ? 'amount-negative' : 'amount-positive'}`}>
//                     {row.amount < 0 ? '-' : '+'}{formatCurrency(row.amount)}
//                   </td>
//                   <td className="text-right">{row.daysElapsed}</td>
//                   <td className="text-right">{formatCurrency(row.interestTillDate)}</td>
//                   <td className="text-right balance-cell">{formatCurrency(row.runningTotal)}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Bottom Summary Section */}
//           <div className="invoice-summary">
//             <div className="summary-row">
//               <span className="summary-label">Subtotal Interest:</span>
//               <span className="summary-value">{formatCurrency(billData.summary.totalInterest)}</span>
//             </div>
//             <div className="summary-row total-row">
//               <span className="summary-label">TOTAL PAYABLE AMOUNT:</span>
//               <span className="summary-value total-amount">{formatCurrency(billData.summary.totalPayable)}</span>
//             </div>
//             <div className="summary-note">
//               <p>📌 <strong>Note:</strong> Interest calculated till <strong>{billData.billDate}</strong>. Any repayment or top-up after this date will be reflected in the next invoice.</p>
//               <p className="interest-rate-note">Interest Rate: <strong>{billData.interestRate}% per month</strong></p>
//             </div>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="bill-footer">
//           <p>This is a computer-generated statement. No signature required.</p>
//           <p>Generated on {new Date().toLocaleString('en-IN')}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoanBillGenerator;















// import React, { useEffect, useState } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FileText, Share2, Download, ArrowLeft } from 'lucide-react';

// const LoanBillGenerator = () => {
//   const { customerID } = useParams();
//   const navigate = useNavigate();
//   const [loanDetails, setLoanDetails] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [billData, setBillData] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     fetchLoanDetails();
//   }, [customerID]);

//   const fetchLoanDetails = async () => {
//     try {
//       setLoading(true);
//       const token = localStorage.getItem('token');
      
//       const [loanRes, profileRes] = await Promise.all([
//         axios.get(`http://localhost:5000/api/loan-profile/${customerID}`, {
//           headers: { 'x-auth-token': token }
//         }),
//         axios.get(`http://localhost:5000/api/loan-profile2/${customerID}`, {
//           headers: { 'x-auth-token': token }
//         })
//       ]);

//       setLoanDetails(loanRes.data);
//       setProfile(profileRes.data);
//       generateBillData(loanRes.data, profileRes.data);
//     } catch (err) {
//       setError('Failed to fetch loan details');
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const generateBillData = (loan, prof) => {
//     const { loanDetails: ld } = loan;
//     const { amount, interestRate, startDate, topUpHistory = [], topDownHistory = [], topUpInterest, topUpTotal, accruedInterest, totalAmount } = ld;
//     const { FirstName, LastName } = prof;

//     const today = new Date();
//     const dailyRate = interestRate / 100 / 30;

//     // Build transaction details
//     const transactions = [];
//     let runningPrincipal = amount;
//     let runningInterest = 0;
//     let lastDate = new Date(startDate);

//     // Initial loan entry
//     transactions.push({
//       type: 'Initial Loan',
//       date: startDate,
//       principal: amount,
//       interestRate: interestRate,
//       daysElapsed: 0,
//       interestAccrued: 0,
//       totalPrincipal: amount,
//       totalInterest: 0,
//       balance: amount
//     });

//     // Process top-ups
//     if (topUpHistory && topUpHistory.length > 0) {
//       topUpHistory.forEach((topUp, idx) => {
//         const topUpDate = new Date(topUp.date);
//         const daysSinceStart = Math.floor((topUpDate - new Date(startDate)) / (1000 * 60 * 60 * 24));
//         const interestBeforeTopUp = runningPrincipal * dailyRate * daysSinceStart;
        
//         transactions.push({
//           type: 'Top-Up (Added Loan)',
//           date: topUp.date,
//           principal: topUp.amount,
//           interestRate: topUp.topupinterestrate || interestRate,
//           daysElapsed: daysSinceStart,
//           interestAccrued: interestBeforeTopUp,
//           totalPrincipal: runningPrincipal + topUp.amount,
//           totalInterest: runningInterest + interestBeforeTopUp,
//           balance: runningPrincipal + topUp.amount,
//           method: topUp.method
//         });

//         runningPrincipal += topUp.amount;
//         runningInterest += interestBeforeTopUp;
//         lastDate = topUpDate;
//       });
//     }

//     // Process repayments
//     if (topDownHistory && topDownHistory.length > 0) {
//       topDownHistory.forEach((payment, idx) => {
//         const paymentDate = new Date(payment.date);
//         const daysSinceLastTransaction = Math.floor((paymentDate - lastDate) / (1000 * 60 * 60 * 24));
//         const interestSinceLastTransaction = runningPrincipal * dailyRate * daysSinceLastTransaction;

//         runningInterest += interestSinceLastTransaction;

//         // Deduct from principal
//         const newPrincipal = Math.max(0, runningPrincipal - payment.amount);
//         const principalDeducted = runningPrincipal - newPrincipal;

//         transactions.push({
//           type: 'Repayment (Principal)',
//           date: payment.date,
//           principal: -payment.amount,
//           interestAccrued: interestSinceLastTransaction,
//           totalPrincipal: newPrincipal,
//           totalInterest: runningInterest,
//           balance: newPrincipal,
//           method: payment.method
//         });

//         runningPrincipal = newPrincipal;
//         lastDate = paymentDate;
//       });
//     }

//     // Current interest calculation
//     const daysSinceLastTransaction = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));
//     const currentInterestAccrued = runningPrincipal * dailyRate * daysSinceLastTransaction;
//     const totalCurrentInterest = runningInterest + currentInterestAccrued;

//     setBillData({
//       customerName: `${FirstName} ${LastName || ''}`,
//       customerID,
//       billDate: new Date().toLocaleDateString('en-IN'),
//       loanStartDate: new Date(startDate).toLocaleDateString('en-IN'),
      
//       summary: {
//         originalAmount: amount,
//         totalTopUps: topUpTotal || 0,
//         totalRepayments: topDownHistory?.reduce((sum, t) => sum + t.amount, 0) || 0,
//         currentPrincipal: runningPrincipal,
//         accruedInterest: totalCurrentInterest,
//         totalDue: runningPrincipal + totalCurrentInterest
//       },

//       transactions: transactions,
//       interestRate: interestRate
//     });
//   };

//   const formatCurrency = (num) => {
//     if (!num) return '₹0';
//     return '₹' + num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
//   };

//   const generateWhatsAppMessage = () => {
//     if (!billData) return '';

//     const msg = `
// *LOAN STATEMENT - DETAILED BILL*

// *Customer Details:*
// Name: ${billData.customerName}
// Customer ID: ${billData.customerID}
// Statement Date: ${billData.billDate}

// *Loan Summary:*
// Original Amount: ${formatCurrency(billData.summary.originalAmount)}
// Total Top-ups: ${formatCurrency(billData.summary.totalTopUps)}
// Total Repayments: ${formatCurrency(billData.summary.totalRepayments)}
// Current Principal: ${formatCurrency(billData.summary.currentPrincipal)}
// Accrued Interest: ${formatCurrency(billData.summary.accruedInterest)}
// Interest Rate: ${billData.interestRate}% per month

// *Total Due: ${formatCurrency(billData.summary.totalDue)}*

// *Transaction Details:*
// ${billData.transactions.map((t, idx) => `
// ${idx + 1}. ${t.type}
//    Date: ${new Date(t.date).toLocaleDateString('en-IN')}
//    Amount: ${formatCurrency(t.principal)}
//    Interest Accrued: ${formatCurrency(t.interestAccrued)}
//    Running Principal: ${formatCurrency(t.totalPrincipal)}
//    Running Interest: ${formatCurrency(t.totalInterest)}
// `).join('')}

// Generated on: ${new Date().toLocaleString('en-IN')}
//     `.trim();

//     return encodeURIComponent(msg);
//   };

//   const handleWhatsAppShare = () => {
//     const message = generateWhatsAppMessage();
//     const whatsappUrl = `https://wa.me/?text=${message}`;
//     window.open(whatsappUrl, '_blank');
//   };

//   const handlePrintBill = () => {
//     window.print();
//   };

//   const handleDownloadBill = () => {
//     const element = document.getElementById('bill-container');
//     const printWindow = window.open('', '', 'height=500,width=800');
//     printWindow.document.write('<pre>' + element.innerText + '</pre>');
//     printWindow.document.close();
//     printWindow.print();
//   };

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
//           <p className="text-gray-600">Loading bill details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error || !billData) {
//     return (
//       <div className="flex items-center justify-center min-h-screen bg-gray-50">
//         <div className="text-center">
//           <p className="text-red-600 mb-4">{error || 'No bill data available'}</p>
//           <button
//             onClick={() => navigate(`/loan_profile/${customerID}`)}
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Back to Loan Profile
//           </button>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-50 p-4">
//       {/* Header */}
//       <div className="max-w-4xl mx-auto mb-6">
//         <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-md">
//           <button
//             onClick={() => navigate(`/loan_profile/${customerID}`)}
//             className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
//           >
//             <ArrowLeft size={20} />
//             Back
//           </button>
//           <h1 className="text-2xl font-bold text-gray-800">Loan Bill Statement</h1>
//           <div className="w-20"></div>
//         </div>
//       </div>

//       {/* Action Buttons */}
//       <div className="max-w-4xl mx-auto mb-6 flex gap-3 flex-wrap">
//         <button
//           onClick={handleWhatsAppShare}
//           className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
//         >
//           <Share2 size={18} />
//           Share via WhatsApp
//         </button>
//         <button
//           onClick={handlePrintBill}
//           className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//         >
//           <FileText size={18} />
//           Print Bill
//         </button>
//         <button
//           onClick={handleDownloadBill}
//           className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
//         >
//           <Download size={18} />
//           Download
//         </button>
//       </div>

//       {/* Bill Container */}
//       <div id="bill-container" className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
//         {/* Bill Header */}
//         <div className="border-b-2 border-gray-300 pb-6 mb-6">
//           <h2 className="text-3xl font-bold text-gray-900 mb-2">LOAN STATEMENT</h2>
//           <p className="text-gray-600">Detailed Transaction and Interest Calculation Report</p>
//         </div>

//         {/* Customer Details */}
//         <div className="grid grid-cols-2 gap-6 mb-8">
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">CUSTOMER NAME</p>
//             <p className="text-lg font-bold text-gray-900">{billData.customerName}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">CUSTOMER ID</p>
//             <p className="text-lg font-bold text-gray-900">{billData.customerID}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">LOAN START DATE</p>
//             <p className="text-lg font-bold text-gray-900">{billData.loanStartDate}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600 font-semibold">STATEMENT DATE</p>
//             <p className="text-lg font-bold text-gray-900">{billData.billDate}</p>
//           </div>
//         </div>

//         {/* Summary Cards */}
//         <div className="grid grid-cols-2 gap-4 mb-8">
//           <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
//             <p className="text-sm text-gray-600">Original Amount</p>
//             <p className="text-2xl font-bold text-blue-600">{formatCurrency(billData.summary.originalAmount)}</p>
//           </div>
//           <div className="bg-green-50 p-4 rounded-lg border border-green-200">
//             <p className="text-sm text-gray-600">Total Top-ups</p>
//             <p className="text-2xl font-bold text-green-600">{formatCurrency(billData.summary.totalTopUps)}</p>
//           </div>
//           <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
//             <p className="text-sm text-gray-600">Total Repayments</p>
//             <p className="text-2xl font-bold text-orange-600">{formatCurrency(billData.summary.totalRepayments)}</p>
//           </div>
//           <div className="bg-red-50 p-4 rounded-lg border border-red-200">
//             <p className="text-sm text-gray-600">Current Principal</p>
//             <p className="text-2xl font-bold text-red-600">{formatCurrency(billData.summary.currentPrincipal)}</p>
//           </div>
//           <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 col-span-2">
//             <p className="text-sm text-gray-600">Accrued Interest</p>
//             <p className="text-2xl font-bold text-purple-600">{formatCurrency(billData.summary.accruedInterest)}</p>
//           </div>
//         </div>

//         {/* Total Due */}
//         <div className="bg-gray-900 text-white p-6 rounded-lg mb-8">
//           <p className="text-lg font-semibold">TOTAL AMOUNT DUE</p>
//           <p className="text-4xl font-bold mt-2">{formatCurrency(billData.summary.totalDue)}</p>
//           <p className="text-sm text-gray-400 mt-2">Interest Rate: {billData.interestRate}% per month</p>
//         </div>

//         {/* Transaction Details */}
//         <div className="mb-8">
//           <h3 className="text-xl font-bold text-gray-900 mb-4">TRANSACTION DETAILS</h3>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse">
//               <thead>
//                 <tr className="bg-gray-200">
//                   <th className="border border-gray-300 px-4 py-2 text-left">Date</th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">Type</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Amount</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Interest</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Principal</th>
//                   <th className="border border-gray-300 px-4 py-2 text-right">Balance</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {billData.transactions.map((t, idx) => (
//                   <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
//                     <td className="border border-gray-300 px-4 py-2">{new Date(t.date).toLocaleDateString('en-IN')}</td>
//                     <td className="border border-gray-300 px-4 py-2 font-semibold">{t.type}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(t.principal)}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(t.interestAccrued)}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(t.totalPrincipal)}</td>
//                     <td className="border border-gray-300 px-4 py-2 text-right font-bold">{formatCurrency(t.balance)}</td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           </div>
//         </div>

//         {/* Footer */}
//         <div className="border-t-2 border-gray-300 pt-6 text-center text-gray-600 text-sm">
//           <p>This is a computer-generated statement. No signature required.</p>
//           <p className="mt-2">Generated on {new Date().toLocaleString('en-IN')}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LoanBillGenerator;














// import React, { useEffect, useState, useRef } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faArrowLeft, faPrint, faDownload } from '@fortawesome/free-solid-svg-icons';
// // import '../../style/loans/PrintableInvoice.css';

// const PrintableInvoice = () => {
//   const { customerID } = useParams();
//   const navigate = useNavigate();
//   const [loanDetails, setLoanDetails] = useState(null);
//   const [profile, setProfile] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [companyInfo, setCompanyInfo] = useState({
//     name: 'KhataTroops Finance',
//     address: 'Indore, Madhya Pradesh',
//     phone: '+91 XXXXX XXXXX',
//     email: 'info@khatatroops.com',
//     gst: 'GSTIN: XXXXXXXXXXXXX'
//   });
//   const invoiceRef = useRef();

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
//     if (!number) return '0.00';
//     return number.toFixed(2).replace(/(\d)(?=(\d\d)+\d\.)/g, '$1,');
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

//   const handlePrint = () => {
//     window.print();
//   };

//   const handleDownload = () => {
//     window.print(); // This will allow user to save as PDF
//   };

//   if (loading) {
//     return <div className="invoice-loading">Loading invoice...</div>;
//   }

//   if (!loanDetails || !profile) {
//     return <div className="invoice-error">Error loading invoice</div>;
//   }

//   const loanInfo = loanDetails.loanDetails;
//   const startDate = new Date(loanInfo.startDate);
//   const today = new Date();
//   const totalDays = calculateDaysBetween(startDate, today);
//   const totalMonths = calculateMonthsBetween(startDate, today);

//   // Calculate all amounts
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
//     <div className="printable-invoice-container">
//       {/* Print Controls - Hidden in print */}
//       <div className="print-controls no-print">
//         <FontAwesomeIcon 
//           icon={faArrowLeft} 
//           className="back-icon" 
//           onClick={() => navigate(`/loan_profile/${customerID}`)} 
//         />
//         <h2>Invoice / Bill</h2>
//         <div className="control-buttons">
//           <button className="control-btn print-btn" onClick={handlePrint}>
//             <FontAwesomeIcon icon={faPrint} /> Print
//           </button>
//           <button className="control-btn download-btn" onClick={handleDownload}>
//             <FontAwesomeIcon icon={faDownload} /> Save PDF
//           </button>
//         </div>
//       </div>

//       {/* Invoice Content - Printable */}
//       <div className="invoice-content" ref={invoiceRef}>
//         {/* Invoice Header */}
//         <div className="invoice-header">
//           <div className="company-info">
//             <h1>{companyInfo.name}</h1>
//             <p>{companyInfo.address}</p>
//             <p>Phone: {companyInfo.phone}</p>
//             <p>Email: {companyInfo.email}</p>
//             <p>{companyInfo.gst}</p>
//           </div>
//           <div className="invoice-meta">
//             <div className="invoice-badge">LOAN STATEMENT</div>
//             <p><strong>Invoice No:</strong> {loanInfo.billNo}</p>
//             <p><strong>Date:</strong> {today.toLocaleDateString('en-IN')}</p>
//             <p><strong>Status:</strong> <span className={`status-${loanDetails.status}`}>{loanDetails.status.toUpperCase()}</span></p>
//           </div>
//         </div>

//         {/* Customer Information */}
//         <div className="invoice-section">
//           <h3>BILL TO</h3>
//           <div className="customer-details">
//             <p><strong>Name:</strong> {profile.FirstName} {profile.LastName || ''}</p>
//             <p><strong>Phone:</strong> {profile.phoneNumber}</p>
//             <p><strong>Customer ID:</strong> {customerID}</p>
//           </div>
//         </div>

//         {/* Loan Period */}
//         <div className="invoice-section period-section">
//           <h3>LOAN PERIOD</h3>
//           <table className="period-table">
//             <tbody>
//               <tr>
//                 <td>Start Date:</td>
//                 <td><strong>{startDate.toLocaleDateString('en-IN')}</strong></td>
//               </tr>
//               <tr>
//                 <td>Current Date:</td>
//                 <td><strong>{today.toLocaleDateString('en-IN')}</strong></td>
//               </tr>
//               <tr>
//                 <td>Total Duration:</td>
//                 <td><strong>{totalDays} Days ({totalMonths} Months)</strong></td>
//               </tr>
//               <tr>
//                 <td>Interest Rate:</td>
//                 <td><strong>{loanInfo.interestRate}% {loanInfo.interestFrequency}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Loan Details Table */}
//         <div className="invoice-section">
//           <h3>LOAN DETAILS</h3>
//           <table className="details-table">
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th className="text-right">Amount (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>Original Principal Amount</td>
//                 <td className="text-right">{formatToIndianCurrency(principalAmount)}</td>
//               </tr>
//               {topUpTotal > 0 && (
//                 <tr>
//                   <td>Top-Up Amount ({loanInfo.topUpHistory?.length || 0} transactions)</td>
//                   <td className="text-right">{formatToIndianCurrency(topUpTotal)}</td>
//                 </tr>
//               )}
//               <tr className="subtotal-row">
//                 <td><strong>Total Loan Given</strong></td>
//                 <td className="text-right"><strong>{formatToIndianCurrency(totalLoanGiven)}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Interest Breakdown */}
//         <div className="invoice-section">
//           <h3>INTEREST CALCULATION</h3>
//           <table className="details-table">
//             <thead>
//               <tr>
//                 <th>Description</th>
//                 <th className="text-right">Amount (₹)</th>
//               </tr>
//             </thead>
//             <tbody>
//               <tr>
//                 <td>Base Interest (on Principal: ₹{formatToIndianCurrency(principalAmount)})</td>
//                 <td className="text-right">{formatToIndianCurrency(baseInterest)}</td>
//               </tr>
//               {topUpInterest > 0 && (
//                 <tr>
//                   <td>Top-Up Interest (on Top-Up: ₹{formatToIndianCurrency(topUpTotal)})</td>
//                   <td className="text-right">{formatToIndianCurrency(topUpInterest)}</td>
//                 </tr>
//               )}
//               {paidInterest > 0 && (
//                 <tr className="paid-row">
//                   <td>Less: Interest Already Paid</td>
//                   <td className="text-right">-{formatToIndianCurrency(paidInterest)}</td>
//                 </tr>
//               )}
//               <tr className="subtotal-row">
//                 <td><strong>Total Interest Due</strong></td>
//                 <td className="text-right"><strong>{formatToIndianCurrency(totalInterest)}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Repayment History */}
//         {principalRepaid > 0 && (
//           <div className="invoice-section">
//             <h3>REPAYMENT HISTORY</h3>
//             <table className="details-table">
//               <thead>
//                 <tr>
//                   <th>Date</th>
//                   <th>Payment Type</th>
//                   <th>Method</th>
//                   <th className="text-right">Amount (₹)</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {loanInfo.topDownHistory?.map((repay, index) => (
//                   <tr key={index}>
//                     <td>{new Date(repay.date).toLocaleDateString('en-IN')}</td>
//                     <td>Principal Repayment</td>
//                     <td>{repay.method}</td>
//                     <td className="text-right">{formatToIndianCurrency(repay.amount)}</td>
//                   </tr>
//                 ))}
//                 {loanInfo.interestPaymentHistory?.map((payment, index) => (
//                   <tr key={`int-${index}`}>
//                     <td>{new Date(payment.date).toLocaleDateString('en-IN')}</td>
//                     <td>Interest Payment</td>
//                     <td>{payment.method}</td>
//                     <td className="text-right">{formatToIndianCurrency(payment.amount)}</td>
//                   </tr>
//                 ))}
//                 <tr className="total-row">
//                   <td colSpan="3"><strong>Total Paid</strong></td>
//                   <td className="text-right"><strong>{formatToIndianCurrency(principalRepaid + paidInterest)}</strong></td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         )}

//         {/* Outstanding Summary */}
//         <div className="invoice-section outstanding-section">
//           <h3>OUTSTANDING SUMMARY</h3>
//           <table className="summary-table">
//             <tbody>
//               <tr>
//                 <td>Remaining Principal:</td>
//                 <td className="text-right"><strong>₹ {formatToIndianCurrency(remainingPrincipal)}</strong></td>
//               </tr>
//               <tr>
//                 <td>Interest Due:</td>
//                 <td className="text-right"><strong>₹ {formatToIndianCurrency(totalInterest)}</strong></td>
//               </tr>
//               <tr className="grand-total">
//                 <td><strong>TOTAL AMOUNT DUE:</strong></td>
//                 <td className="text-right"><strong>₹ {formatToIndianCurrency(totalDue)}</strong></td>
//               </tr>
//             </tbody>
//           </table>
//         </div>

//         {/* Terms & Conditions */}
//         <div className="invoice-section terms-section">
//           <h3>TERMS & CONDITIONS</h3>
//           <ul>
//             <li>Interest is calculated on a daily basis as per the agreed rate</li>
//             <li>All payments should be made on or before the due date</li>
//             <li>Late payment may attract additional charges</li>
//             <li>This is a computer-generated statement and does not require a signature</li>
//           </ul>
//         </div>

//         {/* Footer */}
//         <div className="invoice-footer">
//           <div className="signature-section">
//             <div className="signature-box">
//               <p>_______________________</p>
//               <p>Customer Signature</p>
//               <p>Date: {today.toLocaleDateString('en-IN')}</p>
//             </div>
//             <div className="signature-box">
//               <p>_______________________</p>
//               <p>Authorized Signature</p>
//               <p>Date: {today.toLocaleDateString('en-IN')}</p>
//             </div>
//           </div>
//           <div className="footer-note">
//             <p>Thank you for your business!</p>
//             <p>For queries, please contact: {companyInfo.phone} | {companyInfo.email}</p>
//             <p className="generated-text">Generated on: {today.toLocaleString('en-IN')}</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default PrintableInvoice;