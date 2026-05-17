import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Message from '../global/alert';
import { ThreeDot } from 'react-loading-indicators';
import '../../style/loans/home-page.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUser,
  faExchangeAlt,
  faChartLine,
  faHome,
  faMoneyBillWave,
  faUsers,
  faPlus,
  faHandHoldingUsd,
  faArrowDown,
  faSignOutAlt,
  faArrowUp,
  faChevronRight,
  faInfoCircle,
  faFileAlt,
  faAngleDown,
  faCog,
  faClipboardList,
  faUserCog,
  faHandHoldingDollar,
  faBell,
} from "@fortawesome/free-solid-svg-icons";
import LoadSKL from "../../component/global/Loading/Home_i";

import CompanyWatermark from "../global/water-mark/CompanyWatermark";

const formatToIndianCurrency = (number) => {
  if (!number) return '0';
  const numStr = number.toString().split('.')[0];
  return numStr.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
};

const REMINDER_API = `${process.env.REACT_APP_API_BASE_URL}/reminders`;
const authHeaders = () => ({ headers: { 'x-auth-token': localStorage.getItem('token') } });

const HomePage = ({ customerID }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState({
    peopleOwe: 0,
    youOwe: 0,
    totalLoanWithInterest: 0,
    totalAmount: 0,
    accruedInterest: 0,
    topUpInterest: 0,
    topUpTotal: 0,
    userId: ""
  });
  const [takenLoanTotals, setTakenLoanTotals] = useState({
    totalBorrowed: 0,
    totalInterest: 0,
    totalOutstanding: 0,
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isOpen, setIsOpen] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [showSwitchOptions, setShowSwitchOptions] = useState(false);
  const menuRef = useRef(null);
  const quickActionsRef = useRef(null);
  const menuOptionsRef = useRef(null);
  const switchOptionsRef = useRef(null);
  const [error, setError] = useState(false);
  const [stats, setStats] = useState({});

  const getTotals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/total-amount`,
        { headers: { 'x-auth-token': token } }
      );
      return response.data;
    } catch (error) {
      setError(true);
      throw error;
    }
  };

  const getStats = async () => {
    try {
      const response = await axios.get(`${REMINDER_API}/stats`, authHeaders());
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  const getTakenLoans = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/taken-loans`,
        { headers: { 'x-auth-token': token } }
      );
      return response.data.data || [];
    } catch (error) {
      setError(true);
      throw error;
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };




  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsResponse = await getStats();
        setStats(statsResponse);
      } catch (error) {
        // Silent fail
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
      if (quickActionsRef.current && !quickActionsRef.current.contains(event.target) &&
        !event.target.closest('.byaj-add-button')) {
        setShowQuickActions(false);
      }
      if (menuOptionsRef.current && !menuOptionsRef.current.contains(event.target) &&
        !event.target.closest('.byaj-menu-button')) {
        setShowMenuOptions(false);
      }
      if (switchOptionsRef.current && !switchOptionsRef.current.contains(event.target) &&
        !event.target.closest('.byaj-switch-button')) {
        setShowSwitchOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchTotals = async () => {
      try {
        const data = await getTotals();
        setLoading(false);
        setTotals(data);
        setError(false);
      } catch (error) {
        setError(true);
        setTimeout(fetchTotals, 5000);
      }
    };
    fetchTotals();
  }, []);


  useEffect(() => {
    const fetchTakenLoans = async () => {
      try {
        const takenLoans = await getTakenLoans();
        let totalBorrowed = 0;
        let totalInterest = 0;

        takenLoans.forEach(loan => {
          const loanDetails = loan.loanDetails || {};
          const amount = loanDetails.amount || 0;
          const topUpTotal = loanDetails.topUpTotal || 0;
          const accruedInterest = loanDetails.accruedInterest || 0;
          const totalAmount = loanDetails.totalAmount || 0;
          const P = topUpTotal + totalAmount;

          totalBorrowed += (amount + topUpTotal);
          totalInterest += accruedInterest;
        });

        const totalOutstanding = totalBorrowed + totalInterest;
        setTakenLoanTotals({
          totalBorrowed,
          totalInterest,
          totalOutstanding,
        });
        setLoading(false);
        setError(false);
      } catch (error) {
        setError(true);
        setLoading(false);
      }
    };

    fetchTakenLoans();
  }, []);

  const confirmLogout = useCallback(() => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      showMessage("success", "You have been logged out.");
      window.location.href = "/login";
    }
  }, []);

  const toggleQuickActions = useCallback(() => {
    setShowQuickActions(prev => !prev);
  }, []);

  const toggleMenuOptions = useCallback(() => {
    setShowMenuOptions(prev => !prev);
    setShowSwitchOptions(false);
    setShowQuickActions(false);
  }, []);

  const toggleSwitchOptions = useCallback(() => {
    setShowSwitchOptions(prev => !prev);
    setShowMenuOptions(false);
    setShowQuickActions(false);
  }, []);

  if (loading) {
    return <LoadSKL />;
  }

  return (
    <>
      <div className="byaj-home_l">
        <div className="byaj-home-container">
          <div className="byaj-header">
            <div className="byaj-profile-section">
              <div className="byaj-profile-image">
                <FontAwesomeIcon icon={faUser} size="2x" />
              </div>
              <div className="byaj-user-info">
                <div className="byaj-username">{totals.userId}</div>
                <div className="byaj-workspace">C Zone</div>
              </div>
            </div>
            <div className="byaj-switch-button" onClick={toggleSwitchOptions}>
              Switch <FontAwesomeIcon icon={faAngleDown} />
              {showSwitchOptions && (
                <div className="byaj-switch-options" ref={switchOptionsRef}>
                  <div className="byaj-switch-option active">
                    <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-switch-option-icon" />
                    <span>Loan Book</span>
                  </div>
                  <div className="byaj-switch-option" onClick={() => navigate('/ac')}>
                    <FontAwesomeIcon icon={faClipboardList} className="byaj-switch-option-icon" />
                    <span>Account Book</span>
                  </div>
                </div>
              )}
            </div>

            <button className="byaj-menu-button" onClick={toggleMenuOptions}>⋮
              {showMenuOptions && (
                <div className="byaj-menu-options" ref={menuOptionsRef}>
                  <div className="byaj-menu-option" onClick={() => navigate('/profile')}>
                    <FontAwesomeIcon icon={faUser} className="byaj-menu-option-icon" />
                    <span>Profile</span>
                  </div>
                  <div className="byaj-menu-option">
                    <FontAwesomeIcon icon={faCog} className="byaj-menu-option-icon" />
                    <span>Settings</span>
                  </div>
                  <div className="byaj-menu-option">
                    <FontAwesomeIcon icon={faUserCog} className="byaj-menu-option-icon" />
                    <span>Account</span>
                  </div>
                  <div className="byaj-menu-option" onClick={confirmLogout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="byaj-menu-option-icon" />
                    <span>Logout</span>
                  </div>
                </div>
              )}
            </button>
          </div>

          <div className="byaj-balance-card">
            <div className="byaj-balance-title">Total Outstanding</div>
            <div className="byaj-balance-amount">₹ {formatToIndianCurrency(totals.totalLoanWithInterest || 0)}</div>
            <div className="byaj-balance-split">
              <div className="byaj-split-row" onClick={() => navigate('/customer_Profiles')}>
                <div className="byaj-split-left">
                  <span className="byaj-split-label">Lend</span>
                  <span className="byaj-split-amount">₹ {formatToIndianCurrency(totals.totalAmount || 0)}</span>
                </div>
                <div className="byaj-icon-container byaj-green-icon">
                  <FontAwesomeIcon icon={faArrowUp} />
                </div>
              </div>
              <div className="byaj-split-row" onClick={() => navigate('/borrowed-accounts')}>
                <div className="byaj-split-left">
                  <span className="byaj-split-label">Borrowed</span>
                  <span className="byaj-split-amount">₹ {formatToIndianCurrency(takenLoanTotals.totalOutstanding || 0)}</span>
                </div>
                <div className="byaj-icon-container byaj-red-icon">
                  <FontAwesomeIcon icon={faArrowDown} />
                </div>
              </div>
            </div>
          </div>

          <div className="byaj-action-grid">
            <div className="byaj-action-card" onClick={() => navigate('/customer_Profiles')}>
              <div className="byaj-action-icon">
                <FontAwesomeIcon icon={faUsers} />
              </div>
              <div className="byaj-action-label">Profiles</div>
            </div>
            <div className="byaj-action-card" onClick={() => navigate('/lender-profiles')}>
              <div className="byaj-action-icon">
                <FontAwesomeIcon icon={faHandHoldingDollar} />
              </div>
              <div className="byaj-action-label">Borrowed Profiles</div>
            </div>
            <div className="byaj-action-card" onClick={() => navigate('/transaction')}>
              <div className="byaj-action-icon">
                <FontAwesomeIcon icon={faExchangeAlt} />
              </div>
              <div className="byaj-action-label">Transactions</div>
            </div>
            <div className="byaj-action-card" onClick={() => navigate('/graph')}>
              <div className="byaj-action-icon">
                <FontAwesomeIcon icon={faChartLine} />
              </div>
              <div className="byaj-action-label">Reports</div>
            </div>
          </div>

          <div className="byaj-feature-row">
            <div className="byaj-feature-button" onClick={() => navigate('/loan-reminders')}>
              <div className="byaj-feature-icon">
                <FontAwesomeIcon icon={faBell} />
              </div>
              <div className="byaj-feature-label">Reminders</div>
            </div>
            <div className="byaj-feature-button">
              <div className="byaj-feature-icon">
                <FontAwesomeIcon icon={faFileAlt} />
              </div>
              <div className="byaj-feature-label">Report</div>
            </div>
          </div>
          <div className="byaj-alerts-section">
            <div className="byaj-alerts-header">
              <FontAwesomeIcon icon={faInfoCircle} className="byaj-alert-icon" />
              <span>Alerts</span>
            </div>
            <div className="byaj-due-loans">
              <div className="byaj-due-loans-left">
                <FontAwesomeIcon icon={faBell} className="byaj-clock-icon" />
                <div className="byaj-due-loans-content">
                  <div className="byaj-due-loans-title">
                    Due Reminders Today
                  </div>
                  <div
                    className="byaj-due-loans-subtitle"
                    onClick={() => navigate('/ac', { state: { stats } })}
                    style={{ color: '#2563eb', cursor: 'pointer' }}
                  >
                    {stats.dueToday > 0 ? `View ${stats.dueToday} reminders` : 'No due reminders'}
                  </div>

                </div>
              </div>
              <FontAwesomeIcon icon={faChevronRight} className="byaj-chevron-icon" />
            </div>
            <div className="byaj-overdue-grid">
              <div className="byaj-overdue-card">
                <FontAwesomeIcon icon={faUsers} className="byaj-overdue-icon" />
                <div className="byaj-overdue-content">
                  <div className="byaj-overdue-title">Overdue</div>
                  <div className="byaj-overdue-subtitle">Loans</div>
                </div>
              </div>
              <div className="byaj-overdue-card">
                <FontAwesomeIcon icon={faFileAlt} className="byaj-overdue-icon" />
                <div className="byaj-overdue-content">
                  <div className="byaj-overdue-title">Collaterals</div>
                  <div className="byaj-overdue-subtitle">Overdue</div>
                </div>
              </div>
            </div>
          </div>

          <div className="byaj-bottom-nav">
            <div className="byaj-nav-item active">
              <FontAwesomeIcon icon={faHome} className="byaj-nav-icon" />
              <span className="byaj-nav-label">Home</span>
            </div>
            <div className="byaj-nav-item" onClick={() => navigate('/lend-accounts')}>
              <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-nav-icon" />
              <span className="byaj-nav-label">Lent</span>
            </div>
            <div className="byaj-nav-item" onClick={() => navigate('/borrowed-accounts')}>
              <FontAwesomeIcon icon={faHandHoldingUsd} className="byaj-nav-icon" />
              <span className="byaj-nav-label">Borrowed</span>
            </div>
            <div className="byaj-nav-item" onClick={() => navigate('/customer_Profiles')}>
              <FontAwesomeIcon icon={faUsers} className="byaj-nav-icon" />
              <span className="byaj-nav-label">People</span>
            </div>
          </div>

          {/* Add Button */}
          <div className="byaj-add-button-container" ref={quickActionsRef}>
            <div className="byaj-add-button" onClick={toggleQuickActions}>
              <FontAwesomeIcon icon={faPlus} />
            </div>

            {/* Quick Action Menu */}
            {showQuickActions && (
              <div className="byaj-quick-actions-menu">
                <div className="byaj-quick-action-item" onClick={() => navigate('/land_money_form')}>
                  <FontAwesomeIcon icon={faMoneyBillWave} className="byaj-quick-action-icon" />
                  <span>Give Loan</span>
                </div>
                <div className="byaj-quick-action-item" onClick={() => navigate('/lenderform')}>
                  <FontAwesomeIcon icon={faHandHoldingUsd} className="byaj-quick-action-icon" />
                  <span>Take Loan</span>
                </div>
              </div>
            )}

          </div>

          {/* ADD WATERMARK HERE - Above bottom nav */}
          <CompanyWatermark companyName="Adsngrow" companyUrl="https://adsngrow.in" />

        </div>
        {message.text && <Message type={message.type} text={message.text} />}
        {error && <Message type="error" text="Error fetching data. Retrying..." />}
        {loading && <LoadSKL />}
      </div>
    </>
  );
}

export default HomePage;