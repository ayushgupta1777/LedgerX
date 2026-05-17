import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "../../style/loans/dynamic/TakenLoanHistory.css";
import { useParams, useNavigate } from 'react-router-dom';

const TakenLoanHistory = () => {
    const [loanDetails, setLoanDetails] = useState(null);
    const { lenderID } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    const [topUpHistory, setTopUpHistory] = useState([]);
    const [repaymentHistory, setRepaymentHistory] = useState([]);
    const [interestPaymentHistory, setInterestPaymentHistory] = useState([]);

    const [bgColor, setBgColor] = useState("");

    useEffect(() => {
        const fetchLoanDetails = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-profile/${lenderID}`, {
                    headers: { 'x-auth-token': token }
                });
                setLoanDetails(data);
            } catch (err) {
                console.error("Error fetching taken loan details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchLoanDetails();
    }, [lenderID]);

    useEffect(() => {
        setBgColor(generateRandomColor());

        const token = localStorage.getItem('token');
        setLoading(true);
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-history/${lenderID}`, {
            headers: { 'x-auth-token': token }
        })
            .then(response => {
                setTopUpHistory(response.data.topUpHistory || []);
                // Note: the backend returns 'repaymentHistory', taking the place of 'topDownHistory'
                setRepaymentHistory(response.data.repaymentHistory || []);
                setInterestPaymentHistory(response.data.interestPaymentHistory || []);
            })
            .catch(error => console.error("Error fetching transaction data:", error))
            .finally(() => {
                setLoading(false);

                // Smooth scroll to top when transactions load
                setTimeout(() => {
                    const contentElement = document.querySelector('.tlh-loan-chat-content');
                    if (contentElement) {
                        contentElement.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                }, 100);
            });
    }, [lenderID]);

    const generateRandomColor = () => {
        const colors = ["#56ab2f", "#4caf50", "#8bc34a", "#cddc39", "#009688"];
        return colors[Math.floor(Math.random() * colors.length)];
    };

    const handleBackClick = () => {
        navigate(-1);
    };

    const renderProfileImage = () => {
        if (loading) return <div className="tlh-profile-image-loader"></div>;

        if (loanDetails?.profileImage) {
            return (
                <img
                    src={loanDetails.profileImage}
                    alt="Profile"
                    className="tlh-loan-profile-image-lp"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable="false"
                />
            );
        } else {
            // Find the lender's name if populated from loanDetails (often populated from lender Profile)
            // Fallback to "👤" if not directly available on the loan object
            const displayName = loanDetails?.lenderID?.FirstName || "CZONE";
            return (
                <div className="tlh-profile-image-placeholder" style={{ backgroundColor: bgColor }}>
                    {displayName.charAt(0).toUpperCase()}
                </div>
            );
        }
    };

    // Get transaction display properties
    const getTransactionDisplay = (type) => {
        switch (type) {
            case "topup":
                return {
                    icon: "⬆️",
                    label: "Additional Loan Taken",
                    className: "tlh-loan-topup"
                };
            case "repayment":
                return {
                    icon: "💵",
                    label: "Principal Repayment",
                    className: "tlh-loan-repayment"
                };
            case "interestpayment":
                return {
                    icon: "💰",
                    label: "Interest Payment",
                    className: "tlh-loan-interest-payment"
                };
            default:
                return {
                    icon: "📝",
                    label: "Transaction",
                    className: "tlh-loan-default"
                };
        }
    };

    // Merge & Sort Transactions by Date
    const transactions = [
        ...topUpHistory.map((t) => ({ ...t, type: "topup" })),
        ...repaymentHistory.map((t) => ({ ...t, type: "repayment" })),
        ...interestPaymentHistory.map((t) => ({ ...t, type: "interestpayment" })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    const formatDate = (dateString) => {
        const options = { day: 'numeric', month: 'short', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-GB', options);
    };

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
        <div className="tlh-loan-chat-container">
            {/* Header */}
            <div className="tlh-loan-chat-header">
                <button
                    className="tlh-back-button"
                    onClick={handleBackClick}
                    aria-label="Go back"
                >
                    &#8592;
                </button>

                <h2 className="tlh-customer-name">
                    {loading ? "Loading..." : "Transaction History"}
                </h2>

                <div className="tlh-loan-profile-container-lp">
                    {renderProfileImage()}
                </div>
            </div>

            {/* Chat Section */}
            {loading ? (
                <div className="tlh-loan-chat-loading">
                    <div className="tlh-loading-spinner"></div>
                    <span>Loading transactions...</span>
                </div>
            ) : (
                <div className="tlh-loan-chat-content">
                    {transactions.length === 0 ? (
                        <div className="tlh-loan-no-transactions">
                            <p>No transactions found for this loan.</p>
                        </div>
                    ) : (
                        transactions.map((transaction, index) => {
                            const display = getTransactionDisplay(transaction.type);

                            return (
                                <div
                                    key={transaction._id || index}
                                    className={`tlh-loan-message ${display.className}`}
                                    style={{ animationDelay: `${index * 0.1}s` }}
                                >
                                    <div className="tlh-loan-transaction-container-c">
                                        <div className="tlh-loan-transaction-icon">
                                            {display.icon}
                                        </div>
                                        <div className="tlh-loan-transaction-details">
                                            <p className="tlh-loan-transfer-label">
                                                {display.label} {transaction.type === 'topup' && transaction.topupinterestrate ? `(${transaction.topupinterestrate}%)` : ''}
                                            </p>
                                            <p className="tlh-loan-amount">
                                                {formatCurrency(transaction.amount)}
                                            </p>
                                            {transaction.type === 'topup' && transaction.topupinterestrate && (
                                                <p className="tlh-loan-method" style={{ color: '#ff9800', marginTop: '4px' }}>
                                                    Interest till today: {formatCurrency(calculateTopUpInterest(transaction.amount, transaction.topupinterestrate, transaction.date))}
                                                </p>
                                            )}
                                            <p className="tlh-loan-method">{formatDate(transaction.date)}</p>
                                        </div>
                                    </div>
                                    <div className="tlh-loan-transaction-footer-c">
                                        <p className="tlh-loan-transaction-type">{transaction.method || "Bank Transfer"}</p>
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

export default TakenLoanHistory;
