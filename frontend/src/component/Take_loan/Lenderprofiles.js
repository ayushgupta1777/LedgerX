import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../style/take_loan/Lenderprofiles.css';

const LenderProfiles = () => {
  const [allLenders, setAllLenders] = useState([]);
  const [filteredLenders, setFilteredLenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'active', 'closed'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(7);
  
  // Action modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showStopInterestModal, setShowStopInterestModal] = useState(false);
  const [showCloseProfileModal, setShowCloseProfileModal] = useState(false);
  const [showDeleteProfileModal, setShowDeleteProfileModal] = useState(false);
  const [selectedLender, setSelectedLender] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // Fetch all lenders and their loans
  useEffect(() => {
    fetchLendersData();
  }, []);

  const fetchLendersData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/borrowed-loans`,
        { headers: { 'x-auth-token': token } }
      );
      
      // Combine loan data with lender profile data
      const loansWithProfiles = response.data.data.map(loan => {
        const lender = response.data.lenderProfiles.find(
          p => p.lenderID === loan.lenderID
        );
        return {
          ...loan,
          lenderProfile: lender || {}
        };
      });
      
      setAllLenders(loansWithProfiles);
      setFilteredLenders(loansWithProfiles);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching lenders:', error);
      showMessage('error', 'Failed to load lender profiles');
      setLoading(false);
    }
  };

  // Apply filters
  useEffect(() => {
    let result = [...allLenders];
    
    // Filter by status
    if (activeTab === 'active') {
      result = result.filter(loan => loan.status === 'active');
    } else if (activeTab === 'closed') {
      result = result.filter(loan => loan.status === 'closed');
    }
    
    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(loan => {
        const lender = loan.lenderProfile;
        const firstName = (lender.FirstName || '').toLowerCase();
        const lastName = (lender.LastName || '').toLowerCase();
        const fullName = `${firstName} ${lastName}`;
        const phone = (lender.phoneNumber || '').toLowerCase();
        
        return fullName.includes(query) || 
               firstName.includes(query) || 
               lastName.includes(query) || 
               phone.includes(query);
      });
    }
    
    setFilteredLenders(result);
    setCurrentPage(1);
  }, [activeTab, searchQuery, allLenders]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLenders = filteredLenders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredLenders.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatCurrency = (amount) => {
    return amount.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  // Modal handlers
  const openDeleteModal = (loan) => {
    setSelectedLender(loan);
    setShowDeleteModal(true);
  };
  
  const openStopInterestModal = (loan) => {
    setSelectedLender(loan);
    setShowStopInterestModal(true);
  };
  
  const openCloseProfileModal = (loan) => {
    setSelectedLender(loan);
    setShowCloseProfileModal(true);
  };
  
  const openDeleteProfileModal = (loan) => {
    setSelectedLender(loan);
    setShowDeleteProfileModal(true);
  };

  // Action handlers
  const handleDeleteTransaction = async () => {
    if (!selectedLender) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/delete-transaction/${selectedLender.lenderID}`,
        { headers: { 'x-auth-token': token } }
      );
      
      showMessage('success', 'Transaction deleted successfully!');
      setShowDeleteModal(false);
      fetchLendersData(); // Refresh data
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error deleting transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStopInterest = async () => {
    if (!selectedLender) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/stop-interest/${selectedLender.lenderID}`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      showMessage('success', 'Interest stopped successfully!');
      setShowStopInterestModal(false);
      fetchLendersData(); // Refresh data
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error stopping interest');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseProfile = async () => {
    if (!selectedLender) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/close-profile/${selectedLender.lenderID}`,
        {},
        { headers: { 'x-auth-token': token } }
      );
      
      showMessage('success', 'Profile closed successfully!');
      setShowCloseProfileModal(false);
      fetchLendersData(); // Refresh data
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error closing profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProfile = async () => {
    if (!selectedLender) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/delete-profile/${selectedLender.lenderID}`,
        { headers: { 'x-auth-token': token } }
      );
      
      showMessage('success', 'Profile deleted successfully!');
      setShowDeleteProfileModal(false);
      fetchLendersData(); // Refresh data
    } catch (error) {
      showMessage('error', error.response?.data?.message || 'Error deleting profile');
    } finally {
      setActionLoading(false);
    }
  };

  const handleViewProfile = (loan) => {
    navigate(`/taken_loan_profile/${loan.lenderID}`);
  };

  //  const handleHistory = () => {
  //   navigate(`/taken-loan-history/${lenderID}`);
  // };

  // Count statistics
  const activeCount = allLenders.filter(l => l.status === 'active').length;
  const closedCount = allLenders.filter(l => l.status === 'closed').length;

  return (
    <div className="lender_profiles_container">
      {/* Header */}
      <div className="lender_profiles_header">
        <button 
          className="lender_profiles_back_btn"
          onClick={() => navigate(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="white"/>
          </svg>
        </button>
        <div className="lender_profiles_header_content">
          <h1 className="lender_profiles_title">Lender Profiles</h1>
          <p className="lender_profiles_subtitle">Manage all your lenders</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="lender_profiles_tabs">
        <button
          className={`lender_profiles_tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All ({allLenders.length})
        </button>
        <button
          className={`lender_profiles_tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          Active ({activeCount})
        </button>
        <button
          className={`lender_profiles_tab ${activeTab === 'closed' ? 'active' : ''}`}
          onClick={() => setActiveTab('closed')}
        >
          Closed ({closedCount})
        </button>
      </div>

      {/* Search Bar */}
      <div className="lender_profiles_search">
        <div className="lender_profiles_search_wrapper">
          <svg className="lender_profiles_search_icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15.5 14H14.71L14.43 13.73C15.41 12.59 16 11.11 16 9.5C16 5.91 13.09 3 9.5 3C5.91 3 3 5.91 3 9.5C3 13.09 5.91 16 9.5 16C11.11 16 12.59 15.41 13.73 14.43L14 14.71V15.5L19 20.49L20.49 19L15.5 14ZM9.5 14C7.01 14 5 11.99 5 9.5C5 7.01 7.01 5 9.5 5C11.99 5 14 7.01 14 9.5C14 11.99 11.99 14 9.5 14Z" fill="#999"/>
          </svg>
          <input
            type="text"
            className="lender_profiles_search_input"
            placeholder="Search by name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="lender_profiles_search_clear"
              onClick={() => setSearchQuery('')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#999"/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Results Info */}
      {filteredLenders.length > 0 && (
        <div className="lender_profiles_results">
          Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredLenders.length)} of {filteredLenders.length} lenders
        </div>
      )}

      {/* Lender List */}
      <div className="lender_profiles_content">
        {loading ? (
          <div className="lender_profiles_loading">
            <div className="lender_profiles_spinner"></div>
            <p>Loading lender profiles...</p>
          </div>
        ) : currentLenders.length > 0 ? (
          <>
            <div className="lender_profiles_list">
              {currentLenders.map((loan) => {
                const lender = loan.lenderProfile;
                const firstName = lender.FirstName || 'Unknown';
                const lastName = lender.LastName || '';
                const phoneNumber = lender.phoneNumber || 'No phone';
                const firstInitial = firstName.charAt(0).toUpperCase();
                const amount = loan.loanDetails?.amount || 0;
                const interest = loan.loanDetails?.accruedInterest || 0;
                const totalOwed = amount + interest;
                const isActive = loan.status === 'active';

                return (
                  <div key={loan.lenderID} className="lender_profiles_card">
                    {/* Card Header */}
                    <div className="lender_profiles_card_header" onClick={() => handleViewProfile(loan)}>
                      <div className="lender_profiles_avatar">
                        {lender.profileImage ? (
                          <img src={lender.profileImage} alt="Profile" />
                        ) : (
                          <span>{firstInitial}</span>
                        )}
                      </div>
                      <div className="lender_profiles_info">
                        <div className="lender_profiles_name_row">
                          <h3 className="lender_profiles_name">{firstName} {lastName}</h3>
                          <span className={`lender_profiles_status ${isActive ? 'active' : 'closed'}`}>
                            {isActive ? '● Active' : '● Closed'}
                          </span>
                        </div>
                        <p className="lender_profiles_phone">{phoneNumber}</p>
                      </div>
                    </div>

                    {/* Amount Details */}
                    <div className="lender_profiles_amounts">
                      <div className="lender_profiles_amount_item">
                        <span className="lender_profiles_amount_label">Borrowed</span>
                        <span className="lender_profiles_amount_value">₹{formatCurrency(amount)}</span>
                      </div>
                      <div className="lender_profiles_amount_item">
                        <span className="lender_profiles_amount_label">Interest</span>
                        <span className="lender_profiles_amount_value interest">₹{formatCurrency(interest)}</span>
                      </div>
                      <div className="lender_profiles_amount_item total">
                        <span className="lender_profiles_amount_label">Total Owed</span>
                        <span className="lender_profiles_amount_value">₹{formatCurrency(totalOwed)}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="lender_profiles_actions">
                      <button
                        className="lender_profiles_action_btn stop"
                        onClick={() => openStopInterestModal(loan)}
                        title="Stop Interest"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M6 6h12v12H6z" fill="currentColor"/>
                        </svg>
                        Stop Interest
                      </button>

                      <button
                        className="lender_profiles_action_btn close"
                        onClick={() => openCloseProfileModal(loan)}
                        title="Close Profile"
                        disabled={!isActive}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                        </svg>
                        Close Profile
                      </button>

                      <button
                        className="lender_profiles_action_btn delete"
                        onClick={() => openDeleteModal(loan)}
                        title="Delete Transaction"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                        </svg>
                        Delete Transaction
                      </button>

                      <button
                        className="lender_profiles_action_btn delete_profile"
                        onClick={() => openDeleteProfileModal(loan)}
                        title="Delete Profile"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="currentColor"/>
                        </svg>
                        Delete Profile
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="lender_profiles_pagination">
                <button 
                  className="lender_profiles_page_btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                  </svg>
                  Previous
                </button>
                
                <div className="lender_profiles_page_numbers">
                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1;
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`lender_profiles_page_number ${currentPage === pageNumber ? 'active' : ''}`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      pageNumber === currentPage - 2 ||
                      pageNumber === currentPage + 2
                    ) {
                      return <span key={pageNumber} className="lender_profiles_page_dots">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button 
                  className="lender_profiles_page_btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="lender_profiles_empty">
            <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
              <circle cx="50" cy="50" r="40" stroke="#ddd" strokeWidth="2"/>
              <path d="M35 45h30M35 55h30" stroke="#ddd" strokeWidth="2"/>
            </svg>
            <h3>No lenders found</h3>
            <p>{searchQuery ? 'Try a different search term' : `No ${activeTab} lenders`}</p>
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Delete Transaction Modal */}
      {showDeleteModal && selectedLender && (
        <div className="lp_modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="lp_modal lp_modal_danger" onClick={(e) => e.stopPropagation()}>
            <div className="lp_modal_header">
              <svg className="lp_modal_icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="#ff4757"/>
              </svg>
              <h3>Delete Transaction</h3>
            </div>
            <div className="lp_modal_body">
              <div className="lp_modal_person_info">
                <p className="lp_modal_label">Lender Details:</p>
                <p className="lp_modal_name">
                  {selectedLender.lenderProfile.FirstName} {selectedLender.lenderProfile.LastName}
                </p>
                <p className="lp_modal_phone">📞 {selectedLender.lenderProfile.phoneNumber}</p>
                <p className="lp_modal_amount">💰 Amount: ₹{formatCurrency(selectedLender.loanDetails?.amount || 0)}</p>
              </div>
              <p>Are you sure you want to delete this transaction?</p>
              <p className="lp_modal_warning">⚠️ This action cannot be undone.</p>
            </div>
            <div className="lp_modal_footer">
              <button 
                className="lp_modal_btn lp_modal_btn_cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="lp_modal_btn lp_modal_btn_danger"
                onClick={handleDeleteTransaction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Transaction'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stop Interest Modal */}
      {showStopInterestModal && selectedLender && (
        <div className="lp_modal_overlay" onClick={() => setShowStopInterestModal(false)}>
          <div className="lp_modal lp_modal_warning" onClick={(e) => e.stopPropagation()}>
            <div className="lp_modal_header">
              <svg className="lp_modal_icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M6 6h12v12H6z" fill="#ffa502"/>
              </svg>
              <h3>Stop Interest</h3>
            </div>
            <div className="lp_modal_body">
              <div className="lp_modal_person_info">
                <p className="lp_modal_label">Lender Details:</p>
                <p className="lp_modal_name">
                  {selectedLender.lenderProfile.FirstName} {selectedLender.lenderProfile.LastName}
                </p>
                <p className="lp_modal_phone">📞 {selectedLender.lenderProfile.phoneNumber}</p>
                <p className="lp_modal_amount">💰 Current Interest: ₹{formatCurrency(selectedLender.loanDetails?.accruedInterest || 0)}</p>
              </div>
              <p>Are you sure you want to stop interest on this loan?</p>
              <p className="lp_modal_info">ℹ️ Current accrued interest will be preserved.</p>
            </div>
            <div className="lp_modal_footer">
              <button 
                className="lp_modal_btn lp_modal_btn_cancel"
                onClick={() => setShowStopInterestModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="lp_modal_btn lp_modal_btn_warning"
                onClick={handleStopInterest}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Stop Interest'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Close Profile Modal */}
      {showCloseProfileModal && selectedLender && (
        <div className="lp_modal_overlay" onClick={() => setShowCloseProfileModal(false)}>
          <div className="lp_modal lp_modal_warning" onClick={(e) => e.stopPropagation()}>
            <div className="lp_modal_header">
              <svg className="lp_modal_icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="#ffa502"/>
              </svg>
              <h3>Close Profile</h3>
            </div>
            <div className="lp_modal_body">
              <div className="lp_modal_person_info">
                <p className="lp_modal_label">Lender Details:</p>
                <p className="lp_modal_name">
                  {selectedLender.lenderProfile.FirstName} {selectedLender.lenderProfile.LastName}
                </p>
                <p className="lp_modal_phone">📞 {selectedLender.lenderProfile.phoneNumber}</p>
                <p className="lp_modal_amount">
                  💰 Total Owed: ₹{formatCurrency((selectedLender.loanDetails?.amount || 0) + (selectedLender.loanDetails?.accruedInterest || 0))}
                </p>
              </div>
              <p>Are you sure you want to close this lender profile?</p>
              <p className="lp_modal_info">ℹ️ Profile will be marked as closed. All data will be preserved.</p>
            </div>
            <div className="lp_modal_footer">
              <button 
                className="lp_modal_btn lp_modal_btn_cancel"
                onClick={() => setShowCloseProfileModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="lp_modal_btn lp_modal_btn_warning"
                onClick={handleCloseProfile}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Close Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Profile Modal */}
      {showDeleteProfileModal && selectedLender && (
        <div className="lp_modal_overlay" onClick={() => setShowDeleteProfileModal(false)}>
          <div className="lp_modal lp_modal_danger" onClick={(e) => e.stopPropagation()}>
            <div className="lp_modal_header">
              <svg className="lp_modal_icon" width="50" height="50" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z" fill="#ff4757"/>
              </svg>
              <h3>Delete Profile</h3>
            </div>
            <div className="lp_modal_body">
              <div className="lp_modal_person_info">
                <p className="lp_modal_label">Lender Details:</p>
                <p className="lp_modal_name">
                  {selectedLender.lenderProfile.FirstName} {selectedLender.lenderProfile.LastName}
                </p>
                <p className="lp_modal_phone">📞 {selectedLender.lenderProfile.phoneNumber}</p>
                <p className="lp_modal_amount">
                  💰 Total Owed: ₹{formatCurrency((selectedLender.loanDetails?.amount || 0) + (selectedLender.loanDetails?.accruedInterest || 0))}
                </p>
              </div>
              <p>Are you sure you want to permanently delete this profile?</p>
              <p className="lp_modal_warning">⚠️ CRITICAL: All data will be permanently deleted!</p>
            </div>
            <div className="lp_modal_footer">
              <button 
                className="lp_modal_btn lp_modal_btn_cancel"
                onClick={() => setShowDeleteProfileModal(false)}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                className="lp_modal_btn lp_modal_btn_danger"
                onClick={handleDeleteProfile}
                disabled={actionLoading}
              >
                {actionLoading ? 'Deleting...' : 'Delete Profile'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Notification */}
      {message.text && (
        <div className={`lp_message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default LenderProfiles;