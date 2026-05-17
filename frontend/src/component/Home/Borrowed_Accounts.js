import React, { useState, useEffect } from 'react';
import '../../style/home/BorrowedAccountsPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BorrowedAccounts = () => {
  const [showLenderModal, setShowLenderModal] = useState(false);
  const [borrowedLoans, setBorrowedLoans] = useState([]);
  const [lenderProfiles, setLenderProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredLoans, setFilteredLoans] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  const navigate = useNavigate();
  
  // ========== WEBVIEW CONTACT PICKER LISTENER ==========
  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'contact-picker-result') {
          console.log('[Web] Contact picker result:', data);
          
          if (data.success && data.contact) {
            // Close modal
            setShowLenderModal(false);
            
            // Navigate to form with contact data
            navigate('/lenderform', {
              state: {
                lenderName: data.contact.name,
                lenderPhone: data.contact.phone,
                firstName: data.contact.firstName,
                lastName: data.contact.lastName,
                fromContacts: true
              }
            });
          } else {
            // Show error
            alert(data.message || 'Could not access contacts. Please try adding manually.');
          }
        }
      } catch (e) {
        // Not a JSON message, ignore
      }
    };

    // Listen for messages from React Native WebView
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage); // For iOS

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, [navigate]);
  // =====================================================
  
  const toggleLenderModal = () => {
    setShowLenderModal(!showLenderModal);
  };
  
  const closeLenderModal = (e) => {
    if (e.target.className === 'borrowed_modal_overlay') {
      setShowLenderModal(false);
    }
  };
  
  const navigateToManualForm = () => {
    setShowLenderModal(false);
    navigate('/lenderform');
  };

  // Fetch borrowed loans data
  useEffect(() => {
    const fetchBorrowedData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/borrowed-loans`, {
          headers: { 'x-auth-token': token },
        });
        
        const activeBorrowedLoans = response.data.data.filter(loan => loan.status === 'active');
        setBorrowedLoans(activeBorrowedLoans);
        setFilteredLoans(activeBorrowedLoans);
        setLenderProfiles(response.data.lenderProfiles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching borrowed loans:', error);
        setLoading(false);
      }
    };

    fetchBorrowedData();
  }, []);

  // Filter loans when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLoans(borrowedLoans);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    const query = searchQuery.toLowerCase();
    
    const filtered = borrowedLoans.filter(loan => {
      const lender = lenderProfiles.find(p => p.lenderID === loan.lenderID);
      
      if (!lender) return false;
      
      const firstName = (lender.FirstName || '').toLowerCase();
      const lastName = (lender.LastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const phone = (lender.phoneNumber || '').toLowerCase();
      
      return fullName.includes(query) || 
             firstName.includes(query) || 
             lastName.includes(query) || 
             phone.includes(query);
    });
    
    setFilteredLoans(filtered);
  }, [searchQuery, borrowedLoans, lenderProfiles]);

  // Calculate total borrowed amount
  // Calculate total borrowed amount
  const totalBorrowedAmount = borrowedLoans.reduce((sum, loan) => {
    return sum + (loan.loanDetails.amount || 0) + (loan.loanDetails.topUpTotal || 0);
  }, 0);


  // Calculate total interest owed
  const totalInterestOwed = borrowedLoans.reduce((sum, loan) => {
    return sum + (loan.loanDetails.accruedInterest || 0);
  }, 0);

  // Calculate total repaid
  const totalRepaid = borrowedLoans.reduce((sum, loan) => {
    return sum + (loan.loanDetails.repaymentTotal || 0);
  }, 0);

  // Handle lender selection
  const handleLenderSelect = (loan) => {
    navigate(`/taken_loan_profile/${loan.lenderID}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Format currency
  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // ========== CONTACT PICKER HANDLER ==========
  const handleContactPicker = async () => {
    try {
      console.log('[Web] 📞 Requesting contact picker...');
      
      // Check if running in WebView (React Native bridge available)
      const isWebView = window.ReactNativeWebView !== undefined;
      
      if (isWebView) {
        console.log('[Web] Running in WebView - using native bridge');
      } else {
        console.log('[Web] Running in browser - using web API');
        if (!('contacts' in navigator) || !navigator.contacts) {
          alert('Contact picker is not supported on this device/browser. Please add manually.');
          return;
        }
      }

      // Request contact selection (works for both WebView and browser)
      const contacts = await navigator.contacts.select(
        ['name', 'tel'], 
        { multiple: false }
      );

      // This code only runs in regular browsers (not WebView)
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        console.log('[Web] Selected contact:', contact);
        
        const name = contact.name && contact.name.length > 0 ? contact.name[0] : 'Unknown';
        const phone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : '';
        
        setShowLenderModal(false);
        
        navigate('/lenderform', {
          state: {
            lenderName: name,
            lenderPhone: phone,
            fromContacts: true
          }
        });
      }
    } catch (err) {
      console.error('[Web] Error accessing contacts:', err);
      
      if (err.name === 'NotSupportedError') {
        alert('Contact picker is not supported on this device. Please add manually.');
      } else if (err.name === 'NotAllowedError') {
        alert('Permission to access contacts was denied. Please add manually or check your browser permissions.');
      } else {
        alert('Could not access contacts. Please try adding manually.');
      }
    }
  };
  // ==========================================

  return (
    <div className="borrowed_container">
      <div className="borrowed_header">
        <span className="borrowed_title">Borrowed Accounts</span>
        <div className="borrowed_subtitle">Money I've Borrowed</div>
      </div>
      
      <div className="borrowed_summary_card">
        <div className="borrowed_summary_row">
          <div className="borrowed_summary_label">
            Total
            <br />
            Borrowed
          </div>
          <div className="borrowed_summary_amount borrowed_amount_red">
            ₹ {formatCurrency(totalBorrowedAmount)}
          </div>
          <div className="borrowed_icon_down">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FFE8E8" />
              <path d="M12 16L7 10H17L12 16Z" fill="#FF5F40" />
            </svg>
          </div>
        </div>
        
        <div className="borrowed_divider"></div>
        
        <div className="borrowed_summary_row">
          <div className="borrowed_summary_label">
            Interest
            <br />
            Owed
          </div>
          <div className="borrowed_summary_amount borrowed_amount_orange">
            ₹ {formatCurrency(totalInterestOwed)}
          </div>
          <div className="borrowed_icon_up">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FFF5E8" />
              <path d="M12 8L17 14H7L12 8Z" fill="#FF9F40" />
            </svg>
          </div>
        </div>

        <div className="borrowed_divider"></div>
        
        <div className="borrowed_summary_row">
          <div className="borrowed_summary_label">
            Total
            <br />
            Repaid
          </div>
          <div className="borrowed_summary_amount borrowed_amount_green">
            ₹ {formatCurrency(totalRepaid)}
          </div>
          <div className="borrowed_icon_check">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#E8F5E9" />
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#4CAF50" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="borrowed_search_container">
        <div className="borrowed_search_input_wrapper">
          <div className="borrowed_search_icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#666666" />
            </svg>
          </div>
          <input 
            type="text" 
            className="borrowed_search_input" 
            placeholder="Search Lender" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <div className="borrowed_search_clear" onClick={clearSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#666666" />
              </svg>
            </div>
          )}
        </div>
        <div className="borrowed_filter_button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill="#888888" />
          </svg>
        </div>
      </div>
      
      {/* Lender List Section */}
      <div className="borrowed_content_area">
        {loading ? (
          <div className="borrowed_loading">
            <div className="borrowed_loading_spinner"></div>
            <p>Loading borrowed accounts...</p>
          </div>
        ) : filteredLoans.length > 0 ? (
          <div className="borrowed_lender_list">
              {filteredLoans.map((loan) => {
              const lender = lenderProfiles.find(p => p.lenderID === loan.lenderID) || {};
              const firstName = lender.FirstName || 'Unknown';
              const lastName = lender.LastName || '';
              const phoneNumber = lender.phoneNumber || 'No phone';
              const firstInitial = firstName.charAt(0).toUpperCase();
              const amount = (loan.loanDetails.amount || 0) + (loan.loanDetails.topUpTotal || 0);
              const interest = loan.loanDetails.accruedInterest || 0;
              const totalOwed = amount + interest;
              
              return (
                <div 
                  key={loan.lenderID} 
                  className="borrowed_lender_item"
                  onClick={() => handleLenderSelect(loan)}
                >
                  <div className="borrowed_lender_avatar">
                    {lender.profileImage ? (
                      <img src={lender.profileImage} alt="Profile" />
                    ) : (
                      <span>{firstInitial}</span>
                    )}
                  </div>
                  <div className="borrowed_lender_info">
                    <div className="borrowed_lender_name">
                      {firstName} {lastName}
                    </div>
                    <div className="borrowed_lender_phone">
                      {phoneNumber}
                    </div>
                    <div className="borrowed_lender_status">
                      <span className="borrowed_status_badge">Active Loan</span>
                    </div>
                  </div>
                  <div className="borrowed_lender_amounts">
                    <div className="borrowed_amount_row">
                      <span className="borrowed_amount_small_label">Borrowed:</span>
                      <span className="borrowed_amount_small_value">₹ {formatCurrency(amount)}</span>
                    </div>
                    <div className="borrowed_amount_row">
                      <span className="borrowed_amount_small_label">Interest:</span>
                      <span className="borrowed_amount_small_value borrowed_interest_text">₹ {formatCurrency(interest)}</span>
                    </div>
                    <div className="borrowed_total_owed">
                      <span className="borrowed_total_label">Total Owed:</span>
                      <span className="borrowed_total_value">₹ {formatCurrency(totalOwed)}</span>
                    </div>
                  </div>
                  <div className="borrowed_view_button">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="#666666" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="borrowed_empty_state">
            <div className="borrowed_empty_icon">
              <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="30" stroke="#CCCCCC" strokeWidth="2" fill="none"/>
                <path d="M40 25V40L50 50" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
                <path d="M25 55H55" stroke="#CCCCCC" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            <div className="borrowed_empty_text">
              <p className="borrowed_empty_title">
                {isFiltering ? 'No matches found' : 'No borrowed loans yet'}
              </p>
              <p className="borrowed_empty_subtitle">
                {isFiltering ? 'Try a different search term' : 'Tap on \'+\' to add a borrowed loan'}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="borrowed_footer">
        <div className="borrowed_nav_item" onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="#999999" />
          </svg>
          <span className="borrowed_nav_text">Home</span>
        </div>
        <div className="borrowed_nav_item" onClick={() => navigate('/lend-accounts')}>
          <div className="borrowed_nav_icon_container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#E8F5E9" />
              <path d="M12 8L17 14H7L12 8Z" fill="#4CAF50" />
            </svg>
          </div>
          <span className="borrowed_nav_text">Lent</span>
        </div>
        <div className="borrowed_add_button" onClick={toggleLenderModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="borrowed_nav_item borrowed_nav_active">
          <div className="borrowed_nav_icon_container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FFE8E8" />
              <path d="M12 16L7 10H17L12 16Z" fill="#FF5F40" />
            </svg>
          </div>
          <span className="borrowed_nav_text">Borrowed</span>
        </div>
        <div className="borrowed_nav_item" onClick={() => navigate('/customer_Profiles')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#999999" />
          </svg>
          <span className="borrowed_nav_text">People</span>
        </div>
      </div>
      
      {showLenderModal && (
        <div className="borrowed_modal_overlay" onClick={closeLenderModal}>
          <div className="borrowed_lender_modal">
            <div className="borrowed_modal_header">
              Add Borrowed Loan
              <button className="borrowed_modal_close" onClick={() => setShowLenderModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#666666" />
                </svg>
              </button>
            </div>
            <div className="borrowed_modal_options">
              <div className="borrowed_modal_option" onClick={handleContactPicker}>
                <div className="borrowed_modal_icon borrowed_contacts_icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M36 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V8C40 5.79 38.21 4 36 4ZM12 8H22V24L17 21.5L12 24V8Z" fill="white" />
                  </svg>
                </div>
                <div className="borrowed_modal_option_text">FROM CONTACTS</div>
              </div>

              <div className="borrowed_modal_option" onClick={navigateToManualForm}>
                <div className="borrowed_modal_icon borrowed_manual_icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M38 14H10V10H38V14ZM38 22H10V18H38V22ZM38 30H10V26H38V30ZM10 38H26V34H10V38Z" fill="white" />
                  </svg>
                </div>
                <div className="borrowed_modal_option_text">ENTER MANUALLY</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedAccounts;