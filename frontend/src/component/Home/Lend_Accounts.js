// BorrowedAccountsPage.jsx
import React, { useState, useEffect } from 'react';
import '../../style/home/LendAccountsPage.css';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BorrowedAccounts = () => {
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredTransactions, setFilteredTransactions] = useState([]);
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
            setShowCustomerModal(false);
            
            // Navigate to form with contact data
            navigate('/land_money_form', {
              state: {
                customerName: data.contact.name,
                customerPhone: data.contact.phone,
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
  
  const toggleCustomerModal = () => {
    setShowCustomerModal(!showCustomerModal);
  };
  
  const closeCustomerModal = (e) => {
    // Only close if clicking on the overlay and not the modal content
    if (e.target.className === 'borrowed_accounts_modal_overlay') {
      setShowCustomerModal(false);
    }
  };
  
  const navigateToManualForm = () => {
    setShowCustomerModal(false);
    navigate('/land_money_form');
  };

  // Fetch transactions and profiles data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions_loan`, {
          headers: { 'x-auth-token': token },
        });
        // Filter only borrowed transactions if needed
        const borrowedTransactions = response.data.data.filter(tx => tx.status === 'active');
        setTransactions(borrowedTransactions);
        setFilteredTransactions(borrowedTransactions);
        setProfiles(response.data.profile1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter transactions when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTransactions(transactions);
      setIsFiltering(false);
      return;
    }

    setIsFiltering(true);
    const query = searchQuery.toLowerCase();
    
    const filtered = transactions.filter(transaction => {
      const profile = profiles.find(p => p.customerID === transaction.customerID);
      
      if (!profile) return false;
      
      const firstName = (profile.FirstName || '').toLowerCase();
      const lastName = (profile.LastName || '').toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const phone = (profile.phoneNumber || '').toLowerCase();
      
      return fullName.includes(query) || 
             firstName.includes(query) || 
             lastName.includes(query) || 
             phone.includes(query);
    });
    
    setFilteredTransactions(filtered);
  }, [searchQuery, transactions, profiles]);

  // Calculate total borrowed amount
  const totalBorrowedAmount = transactions.reduce((sum, transaction) => {
    return sum + (transaction.loanDetails.amount || 0);
  }, 0);

  // Calculate total interest
  const totalInterest = transactions.reduce((sum, transaction) => {
    return sum + (transaction.loanDetails.accruedInterest || 0);
  }, 0);

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
    navigate(`/loan_profile/${customer.customerID}`);
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
  };

  // ========== CONTACT PICKER HANDLER ==========
  const handleContactPicker = async () => {
    try {
      console.log('[Web] 📞 Requesting contact picker...');
      
      // Check if running in WebView (React Native bridge available)
      const isWebView = window.ReactNativeWebView !== undefined;
      
      if (isWebView) {
        console.log('[Web] Running in WebView - using native bridge');
        // The navigator.contacts.select is overridden in the WebView injected JS
        // It will automatically communicate with React Native
      } else {
        console.log('[Web] Running in browser - using web API');
        // Running in regular browser, check if Contact Picker API exists
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
        
        // Extract contact details
        const name = contact.name && contact.name.length > 0 ? contact.name[0] : 'Unknown';
        const phone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : '';
        
        // Close modal
        setShowCustomerModal(false);
        
        // Navigate to form with contact data
        navigate('/land_money_form', {
          state: {
            customerName: name,
            customerPhone: phone,
            fromContacts: true
          }
        });
      }
    } catch (err) {
      console.error('[Web] Error accessing contacts:', err);
      
      // Provide specific error messages
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
    <div className="borrowed_accounts_container">
      <div className="borrowed_accounts_header">
        <span className="borrowed_accounts_title">Lend Accounts</span>
      </div>
      
      <div className="borrowed_accounts_summary_card">
        <div className="borrowed_accounts_summary_row">
          <div className="borrowed_accounts_summary_label">
            You
            <br />
            Lend
          </div>
          <div className="borrowed_accounts_summary_amount">
          ₹ {totalBorrowedAmount.toFixed(2)}
          </div>
          <div className="borrowed_accounts_icon_down">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FEF1EF" />
              <path d="M12 16L7 10H17L12 16Z" fill="#FF5F40" />
            </svg>
          </div>
        </div>
        
        <div className="borrowed_accounts_divider"></div>
        
        <div className="borrowed_accounts_summary_row">
          <div className="borrowed_accounts_summary_label">
            Interest
          </div>
          <div className="borrowed_accounts_summary_amount">
          ₹ {totalInterest.toFixed(2)}
          </div>
          <div className="borrowed_accounts_icon_up">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8L17 14H7L12 8Z" fill="#FF5F40" />
              <path d="M12 8L7 14H17L12 8Z" fill="none" stroke="#FF5F40" strokeWidth="1" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="borrowed_accounts_search_container">
        <div className="borrowed_accounts_search_input_wrapper">
          <div className="borrowed_accounts_search_icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#666666" />
            </svg>
          </div>
          <input 
            type="text" 
            className="borrowed_accounts_search_input" 
            placeholder="Search Member" 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          {searchQuery && (
            <div className="borrowed_accounts_search_clear" onClick={clearSearch}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#666666" />
              </svg>
            </div>
          )}
        </div>
        <div className="borrowed_accounts_filter_button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 17V19H9V17H3ZM3 5V7H13V5H3ZM13 21V19H21V17H13V15H11V21H13ZM7 9V11H3V13H7V15H9V9H7ZM21 13V11H11V13H21ZM15 9H17V7H21V5H17V3H15V9Z" fill="#888888" />
          </svg>
        </div>
      </div>
      
      {/* Customer List Section */}
      {loading ? (
        <div className="borrowed_accounts_loading">Loading...</div>
      ) : filteredTransactions.length > 0 ? (
        <div className="borrowed_accounts_customer_list">
          {filteredTransactions.map((transaction) => {
            const profile = profiles.find(p => p.customerID === transaction.customerID) || {};
            const firstName = profile.FirstName || 'Unknown';
            const lastName = profile.LastName || '';
            const phoneNumber = profile.phoneNumber || 'No phone';
            const firstInitial = firstName.charAt(0).toUpperCase();
            
            return (
              <div 
                key={transaction.customerID} 
                className="borrowed_accounts_customer_item"
                onClick={() => handleCustomerSelect(transaction)}
              >
                <div className="borrowed_accounts_customer_avatar">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt="Profile" />
                  ) : (
                    <span>{firstInitial}</span>
                  )}
                </div>
                <div className="borrowed_accounts_customer_info">
                  <div className="borrowed_accounts_customer_name">
                    {firstName} {lastName}
                  </div>
                  <div className="borrowed_accounts_customer_phone">
                    {phoneNumber}
                  </div>
                </div>
                <div className="borrowed_accounts_customer_amount">
                  <div className="borrowed_accounts_amount_label">
                    Amount
                  </div>
                  <div className="borrowed_accounts_amount_value">
                    ₹ {transaction.loanDetails.amount || 0}
                  </div>
                </div>
                <div className="borrowed_accounts_view_button">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6L16 12L10 18L8.59 16.59Z" fill="#666666" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="borrowed_accounts_empty_state">
          <div className="borrowed_accounts_empty_icon">
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
              <rect x="20" y="25" width="40" height="30" rx="4" stroke="#CCCCCC" strokeWidth="2" />
              <circle cx="32" cy="40" r="6" stroke="#CCCCCC" strokeWidth="2" />
              <path d="M50 30L60 30" stroke="#CCCCCC" strokeWidth="2" />
              <path d="M40 55L40 65" stroke="#CCCCCC" strokeWidth="2" />
            </svg>
          </div>
          <div className="borrowed_accounts_empty_text">
            <p className="borrowed_accounts_empty_title">
              {isFiltering ? 'No matches found' : 'Borrowed loans not yet added.'}
            </p>
            <p className="borrowed_accounts_empty_subtitle">
              {isFiltering ? 'Try a different search term' : 'Tap on \'+\' to add loans'}
            </p>
          </div>
        </div>
      )}
      
      <div className="borrowed_accounts_footer">
        <div className="borrowed_accounts_nav_item borrowed_accounts_home" onClick={() => navigate('/home')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M10 20V14H14V20H19V12H22L12 3L2 12H5V20H10Z" fill="#777777" />
          </svg>
          <span className="borrowed_accounts_nav_text">Home</span>
        </div>
        <div className="borrowed_accounts_nav_item borrowed_accounts_lent">
          <div className="borrowed_accounts_nav_icon_container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FEF1EF" />
              <path d="M12 8L17 14H7L12 8Z" fill="#FF5F40" />
            </svg>
          </div>
          <span className="borrowed_accounts_nav_text">Lent</span>
        </div>
        <div className="borrowed_accounts_add_button" onClick={toggleCustomerModal}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#FFFFFF" />
          </svg>
        </div>
        <div className="borrowed_accounts_nav_item borrowed_accounts_borrowed borrowed_accounts_nav_active" onClick={() => navigate('/borrowed-accounts')}>
          <div className="borrowed_accounts_nav_icon_container">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="12" fill="#FEF1EF" />
              <path d="M12 16L7 10H17L12 16Z" fill="#FF5F40" />
            </svg>
          </div>
          <span className="borrowed_accounts_nav_text">Borrowed</span>
        </div>
        <div className="borrowed_accounts_nav_item borrowed_accounts_people" onClick={() => navigate('/customer_Profiles')}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#777777" />
          </svg>
          <span className="borrowed_accounts_nav_text">People</span>
        </div>
      </div>
      
      {showCustomerModal && (
        <div className="borrowed_accounts_modal_overlay" onClick={closeCustomerModal}>
          <div className="borrowed_accounts_customer_modal">
            <div className="borrowed_accounts_modal_header">
              Choose customer
            </div>
            <div className="borrowed_accounts_modal_options">
              <div className="borrowed_accounts_modal_option" onClick={handleContactPicker}>
                <div className="borrowed_accounts_modal_icon borrowed_accounts_contacts_icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M36 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V8C40 5.79 38.21 4 36 4ZM12 8H22V24L17 21.5L12 24V8Z" fill="white" />
                  </svg>
                </div>
                <div className="borrowed_accounts_modal_option_text">FROM CONTACTS</div>
              </div>
              <div className="borrowed_accounts_modal_option" onClick={navigateToManualForm}>
                <div className="borrowed_accounts_modal_icon borrowed_accounts_manual_icon">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <path d="M38 14H10V10H38V14ZM38 22H10V18H38V22ZM38 30H10V26H38V30ZM10 38H26V34H10V38Z" fill="white" />
                    <path d="M36 24L30 18V22H18V26H30V30L36 24Z" fill="white" />
                  </svg>
                </div>
                <div className="borrowed_accounts_modal_option_text">ENTER MANUALLY</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedAccounts;