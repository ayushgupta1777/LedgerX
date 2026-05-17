import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../style/loans/profiles.css";
import { ThreeDot } from "react-loading-indicators";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import "../../style/loans/delete-modal.css"; // Improved Delete Modal Styles
import { 
  Search, 
  X, 
  Plus, 
  User, 
  FileText, 
  MoreVertical, 
  Edit, 
  Trash2, 
  ArrowLeft,
  Check
} from "lucide-react";

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState([]);
  const navigate = useNavigate();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [mobileNumber, setMobileNumber] = useState('');
  const [results, setResults] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const customersPerPage = 15;
  
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showCustomerSelection, setShowCustomerSelection] = useState(false);
  const [menuOpenForId, setMenuOpenForId] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  
  const addButtonRef = useRef(null);
  const menuRef = useRef(null);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
    setMenuOpenForId(null); // Close menu
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/delete-customer-profile/${transactionToDelete.customerID}`, {
        headers: { 'x-auth-token': token }
      });
      
      // Update UI
      setTransactions(prev => prev.filter(t => t.customerID !== transactionToDelete.customerID));
      setResults(prev => prev.filter(t => t.customerID !== transactionToDelete.customerID));
      
      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
    } catch (error) {
      console.error('Error deleting profile:', error);
      alert('Failed to delete profile');
    }
  };


  // Helper function to calculate grand total
  const calculateGrandTotal = (transaction) => {
    // Backend now provides totalAmount as (Principal + AccruedInterest)
    // and both already account for top-ups correctly.
    const totalAmountFromBackend = transaction.loanDetails?.totalAmount || 0;
    
    // For safety, if totalAmount is missing, fallback to calculation
    if (totalAmountFromBackend > 0) return totalAmountFromBackend;

    const amount = transaction.loanDetails?.amount || 0;
    const topUpTotal = transaction.loanDetails?.topUpTotal || 0;
    const accruedInterest = transaction.loanDetails?.accruedInterest || 0;
    
    return amount + topUpTotal + accruedInterest;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions_loan`, {
          headers: { 'x-auth-token': token },
        });
  
        const transactionsData = response.data.data;
        const profilesData = response.data.profile1;
  
        const updatedTransactions = transactionsData.map(transaction => {
          const matchingProfile = profilesData.find(profile => profile.customerID === transaction.customerID);
          
          const capitalize = (name) => 
            name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

          return {
            ...transaction,
            customerName: matchingProfile 
              ? `${capitalize(matchingProfile.FirstName)} ${capitalize(matchingProfile.LastName)}`
              : "Unknown Name",
          };
        });
  
        setTransactions(updatedTransactions);
        setProfiles(profilesData);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };
  
    fetchData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addButtonRef.current && !addButtonRef.current.contains(event.target)) {
        setShowAddOptions(false);
      }
      
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpenForId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  useEffect(() => {
    if (searchPerformed && mobileNumber) {
      handleSearch();
    }
  }, [transactions]);
  
  const handleSearch = async () => {
    setSearchPerformed(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/search/transactions`, {
        headers: { 'x-auth-token': token },
        params: { mobileNumber },
      });
      setResults(response.data);
      setMobileNumber('');
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };
  
  const handleClearSearch = () => {
    setMobileNumber("");
    setResults([]);
    setSearchPerformed(false);
    setIsSearching(false);
  };

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
    setShowCustomerSelection(false);
  };
  
  const handleChangeStatus = async (transactionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/update-transaction-status/${transactionId}`,
        { status: newStatus },
        { headers: { 'x-auth-token': token } }
      );
  
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.customerID === transactionId ? { ...txn, status: newStatus } : txn
        )
      );
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const totalPages = Math.ceil(transactions.length / customersPerPage);
  const indexOfLastCustomer = currentPage * customersPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
  const currentTransactions = transactions.slice(indexOfFirstCustomer, indexOfLastCustomer);
  
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleRedirect = (customerID) => {
    navigate(`/loan_profile/${customerID}`);
  };

  const getRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#A633FF"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const getInitials = (name) => {
    if (!name || typeof name !== "string") return "?";
    return name.charAt(0).toUpperCase();
  };

  const getStatusClass = (status) => {
    if (!status) return "status-default-profiles";
    
    switch (status.toLowerCase()) {
      case "active":
        return "status-active-profiles";
      case "closed":
        return "status-closed-profiles";
      default:
        return "status-default-profiles";
    }
  };
  
  const handleAddNewClick = () => {
    setShowAddOptions(!showAddOptions);
  };
  
  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer);
  };
  
  const handleCreateTransaction = () => {
    setSelectedCustomer(null);
    setShowCustomerSelection(false);
  };
  
  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setMenuOpenForId(menuOpenForId === id ? null : id);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  if (loading)
    return (
      <div
        className="loading-container-profiles"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",          
          height: "100vh",
          width: "100%",
          background: "transparent",
        }}
      >
        <ThreeDot color="#3168cc" size="medium" text="" textColor="" />
      </div>
    );

  return (
    <div className="transactions-container-unique">
      <div className="header-navigation-profiles">
        <button 
          className="back-button-profiles" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="back-arrow-profiles" size={16} />
          Back to Home
        </button>
        <h1 className="page-title-profiles">Transactions</h1>
      </div>

      <div className="search-box-container-profiles">
        <div className="search-box-profiles">
          <input
            type="text"
            value={mobileNumber}
            onChange={(e) => {
              setMobileNumber(e.target.value);
              setIsSearching(e.target.value.length > 0);
            }}         
            placeholder="Search..."
            className="search-input-profiles"
          />
          
          {results.length > 0 || searchPerformed ? (
            <X 
              onClick={handleClearSearch} 
              className="clear-icon-profiles" 
              size={18} 
            />
          ) : (
            <Search 
              onClick={handleSearch} 
              className="search-icon-profiles" 
              size={18} 
            />
          )}
        </div>
        
        <div ref={addButtonRef} style={{ position: 'relative' }}>
          <button 
            className="add-new-button-profiles"
            onClick={handleAddNewClick}
          >
            <Plus className="plus-icon-profiles" size={18} />
            Add New
          </button>
          
          {showAddOptions && (
            <div className="add-new-dropdown-profiles">
              <div 
                className="dropdown-option-profiles"
                // onClick={() => {
                //   setShowAddOptions(false);
                //   setShowCustomerSelection(true);
                // }}
                onClick={() => {
                  navigate('/land_money_form');
                }}
              >
                <User size={16} />
                New Customer
              </div>
              {/* <div 
                className="dropdown-option-profiles"
                onClick={() => {
                  setShowAddOptions(false);
                }}
              >
                <FileText size={16} />
                New Transaction
              </div> */}
            </div>
          )}
        </div>
      </div>

      {searchPerformed && (
        <div className="results-container-profiles">
          {results.length === 0 ? (
            <p className="no-results-text-profiles">No transactions found</p>
          ) : (
            <ul className="transactions-list-profiles">
              {results.map((result) => {
                const correspondingProfile = transactions.find(
                  (profile) => String(profile.customerID).trim() === String(result.customerID).trim()
                );

                const correspondingProfile2 = profiles.find(
                  (profile) => String(profile.customerID).trim() === String(result.customerID).trim()
                );

                const capitalize = (name) =>
                  name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "Unknown";

                const firstInitial = result?.FirstName ? result.FirstName.charAt(0).toUpperCase() : "?";
                const bgColor = getRandomColor();
                const grandTotal = correspondingProfile ? calculateGrandTotal(correspondingProfile) : 0;

                return (
                  <li 
                    key={result._id} 
                    className="transaction-item-profiles"
                    onClick={() => handleRedirect(result.customerID)}
                  >
                    <div className="transaction-header-profiles">
                      <p className="customer-name-profiles">
                        {correspondingProfile2
                          ? `${capitalize(correspondingProfile2?.FirstName || "Unknown")} ${capitalize(correspondingProfile2?.LastName || "Unknown")}`
                          : "Unknown Unknown"}
                      </p>
                      <span className={`status-badge-profiles ${getStatusClass(correspondingProfile?.status)}`}>
                        {correspondingProfile?.status || "Unknown"}
                      </span>
                    </div>

                    <div className="transaction-body-profiles">
                      <div className="profile-section-profiles">
                        {result?.profileImage ? (
                          <img src={result.profileImage} alt="Profile" className="profile-image-profiles" />
                        ) : (
                          <div className="profile-circle-profiles" style={{ backgroundColor: bgColor }}>
                            {firstInitial}
                          </div>
                        )}
                      </div>

                      <div className="transaction-info-profiles">
                        <p><strong>Total Amount:</strong> {formatCurrency(grandTotal)}</p>
                        <p><strong>Added On:</strong> {new Date(correspondingProfile?.createdAt || Date.now()).toLocaleDateString("en-GB")}</p>
                      </div>
                      
                      <div className="menu-container-profiles" ref={menuRef}>
                        <div 
                          className="three-dot-menu-profiles"
                          onClick={(e) => toggleMenu(result._id, e)}
                        >
                          <MoreVertical size={18} color="#727272" />
                        </div>
                        
                        {menuOpenForId === result._id && (
                          <div className="menu-dropdown-profiles">
                            <div className="menu-option-profiles">
                              <Edit size={14} style={{ marginRight: '8px' }} />
                              Edit
                            </div>
 <div 
                              className="menu-option-profiles delete-option-profiles"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteClick(result);
                              }}
                            >
                                                            <Trash2 size={14} style={{ marginRight: '8px' }} />
                              Delete
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {!isSearching && (
        <ul className="transactions-list-profiles">
          {currentTransactions.map((transaction) => {
            const grandTotal = calculateGrandTotal(transaction);
            
            return (
              <li 
                key={transaction._id} 
                className="transaction-item-profiles"
                onClick={() => handleRedirect(transaction.customerID)}
              >
                <div className="transaction-header-profiles">
                  <p className="customer-name-profiles">
                    {transaction.customerName || "Unknown Name"}
                  </p>
                  <span className={`status-badge-profiles ${getStatusClass(transaction.status)}`}>
                    {transaction.status || "Unknown"}
                  </span>
                </div>
                
                <div className="transaction-body-profiles">
                  <div className="profile-section-profiles">
                    {transaction.profileImage ? (
                      <img 
                        src={transaction.profileImage} 
                        alt="Profile" 
                        className="profile-image-profiles" 
                      />
                    ) : (
                      <div 
                        className="profile-circle-profiles" 
                        style={{ backgroundColor: getRandomColor() }}
                      >
                        {getInitials(transaction.customerName)}
                      </div>
                    )}
                  </div>
                  
                  <div className="transaction-info-profiles">
                    <p><strong>Total Amount:</strong> {formatCurrency(grandTotal)}</p>
                    
                    <p><strong>Loan Start Date:</strong> {new Date(transaction?.loanDetails?.startDate || transaction.createdAt).toLocaleDateString("en-GB")}</p>

                  </div>
                  
                  <div className="menu-container-profiles" ref={menuRef}>
                    <div 
                      className="three-dot-menu-profiles"
                      onClick={(e) => toggleMenu(transaction._id, e)}
                    >
                      <MoreVertical size={18} color="#727272" />
                    </div>
                    
                    {menuOpenForId === transaction._id && (
                      <div className="menu-dropdown-profiles">
                        <div className="menu-option-profiles">
                          <Edit size={14} style={{ marginRight: '8px' }} />
                          Edit
                        </div>
                       <div 
                          className="menu-option-profiles delete-option-profiles"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(transaction);
                          }}
                        >
                          
                          <Trash2 size={14} style={{ marginRight: '8px' }} />
                          Delete
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="pagination-profiles">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          «
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? "active" : ""}
            onClick={() => handlePageChange(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
        >
          »
        </button>
      </div>

      {showCustomerSelection && (
        <div className="modal-backdrop-profiles" onClick={closeModal}>
          <div className="modal-content-profiles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profiles">
              <h2 className="modal-title-profiles">Select Customer</h2>
              <button className="close-modal-profiles" onClick={closeModal}>×</button>
            </div>
            
            <div className="search-box-profiles" style={{ marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Search customers..."
                className="search-input-profiles"
              />
              <Search className="search-icon-profiles" size={18} />
            </div>

            <ul className="customer-selection-profiles">
              {profiles.map((profile) => {
                const capitalize = (name) => 
                  name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";
                
                const fullName = `${capitalize(profile.FirstName || "")} ${capitalize(profile.LastName || "")}`;
                const initials = getInitials(fullName);
                const bgColor = getRandomColor();
                const isSelected = selectedCustomer && selectedCustomer._id === profile._id;

                return (
                  <li 
                    key={profile._id}
                    className={`customer-option-profiles ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleCustomerSelect(profile)}
                  >
                    <div 
                      className="customer-avatar-profiles" 
                      style={{ backgroundColor: bgColor }}
                    >
                      {profile.profileImage ? (
                        <img src={profile.profileImage} alt={initials} />
                      ) : (
                        initials
                      )}
                    </div>
                    
                    <div className="customer-selection-info-profiles">
                      <p className="customer-selection-name-profiles">{fullName}</p>
                      <p className="customer-selection-phone-profiles">{profile.phoneNumber || "No phone"}</p>
                    </div>
                    
                    {isSelected && (
                      <Check size={18} color="#3168cc" />
                    )}
                  </li>
                );
              })}
            </ul>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button 
                className="add-new-button-profiles" 
                onClick={handleCreateTransaction}
                disabled={!selectedCustomer}
                style={{ 
                  opacity: selectedCustomer ? 1 : 0.6,
                  cursor: selectedCustomer ? 'pointer' : 'not-allowed'
                }}
              >
                Create Transaction
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTransaction && (
        <div className="modal-backdrop-profiles" onClick={closeModal}>
          <div className="modal-content-profiles" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-profiles">
              <h2 className="modal-title-profiles">Transaction Details</h2>
              <button className="close-modal-profiles" onClick={closeModal}>×</button>
            </div>
            
            <div style={{ padding: '10px 0' }}>
              <p><strong>Customer:</strong> {selectedTransaction.customerName}</p>
              <p><strong>Total Amount:</strong> {formatCurrency(calculateGrandTotal(selectedTransaction))}</p>
              <p><strong>Status:</strong> {selectedTransaction.status || "Unknown"}</p>
              <p><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleDateString("en-GB")}</p>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button 
                onClick={() => {
                  handleChangeStatus(selectedTransaction._id, "closed");
                  closeModal();
                }}
                style={{
                  backgroundColor: '#F39C12',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Close Transaction
              </button>
              <button 
                onClick={() => handleRedirect(selectedTransaction.customerID)}
                className="add-new-button-profiles"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="modal-overlay-custom">
          <div className="delete-modal-content">
            <div className="delete-icon-wrapper">
              <FontAwesomeIcon icon={faTrash} shake />
            </div>
            <h3 className="delete-modal-title">Delete Profile?</h3>
            <p className="delete-modal-text">
              Are you sure you want to delete <strong>{transactionToDelete?.customerName || 'this profile'}</strong>?
              <br />
              <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>This will remove the customer profile and all associated loan data.</span>
            </p>
            
            <div className="modal-actions">
              <button 
                className="btn-cancel" 
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="btn-delete" 
                onClick={confirmDelete}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TransactionsList;


// import React, { useEffect, useState, useRef } from "react";
// import { useNavigate } from "react-router-dom";
// import axios from "axios";
// import "../../style/loans/profiles.css"; // Import the existing CSS
// import { ThreeDot } from "react-loading-indicators";
// import { 
//   Search, 
//   X, 
//   Plus, 
//   User, 
//   FileText, 
//   MoreVertical, 
//   Edit, 
//   Trash2, 
//   ArrowLeft,
//   Check
// } from "lucide-react";
// import Profile_loading from "../global/Loading/Profiles";


// const TransactionsList = () => {
//   const [transactions, setTransactions] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [profiles, setProfiles] = useState([]);
//   const navigate = useNavigate();
//   const [selectedTransaction, setSelectedTransaction] = useState(null);
//   const [mobileNumber, setMobileNumber] = useState('');
//   const [results, setResults] = useState([]);
//   const [searchPerformed, setSearchPerformed] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const customersPerPage = 15;
  
//   // New state variables for UI enhancements
//   const [showAddOptions, setShowAddOptions] = useState(false);
//   const [showCustomerSelection, setShowCustomerSelection] = useState(false);
//   const [menuOpenForId, setMenuOpenForId] = useState(null);
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
  
//   // Refs for detecting clicks outside dropdowns
//   const addButtonRef = useRef(null);
//   const menuRef = useRef(null);
//   const [loanDetails, setLoanDetails] = useState(null);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions_loan', {
//           headers: { 'x-auth-token': token },
//         });
  
//         const transactionsData = response.data.data;
//         const profilesData = response.data.profile1;
  
//         // Map transactions with their corresponding profile name
//         const updatedTransactions = transactionsData.map(transaction => {
//           const matchingProfile = profilesData.find(profile => profile.customerID === transaction.customerID);
          
//           const capitalize = (name) => 
//             name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";

//           return {
//             ...transaction,
//             customerName: matchingProfile 
//               ? `${capitalize(matchingProfile.FirstName)} ${capitalize(matchingProfile.LastName)}`
//               : "Unknown Name",
//           };
//         });
  
//         setTransactions(updatedTransactions);
//         setLoanDetails(updatedTransactions)
//         setProfiles(profilesData);
//         setLoading(false);
//       } catch (error) {
//         console.error('Error fetching data:', error);
//         setLoading(false);
//       }
//     };
  
//     fetchData();
//   }, []);

//     useEffect(() => {
//       const fetchLoanDetails = async () => {
//         setBgColor(generateRandomColor());
  
//         try {
//           const token = localStorage.getItem('token');
  
//           const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/loan-profile/${customerID}`,{
//             headers: { 'x-auth-token': token }});
//           setLoanDetails(data);
//           setMessage({ type: 'success', text: 'Successful get Customer DATA' });
  
//           setLoading(false);
//         } catch (err) {
//           setError('Error fetching loan details. Please try again.');
//           setLoading(false);
//           setMessage({ type: 'error', text: 'Unauthorized: You do not have access to this loan' });
  
//         }
//       };
      
//       fetchLoanDetails();
//     }, [customerID]);

//   useEffect(() => {
//     // Close add options dropdown when clicking outside
//     const handleClickOutside = (event) => {
//       if (addButtonRef.current && !addButtonRef.current.contains(event.target)) {
//         setShowAddOptions(false);
//       }
      
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setMenuOpenForId(null);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);
  
//   useEffect(() => {
//     if (searchPerformed && mobileNumber) {
//       handleSearch();
//     }
//   }, [transactions]);


  
//   const handleSearch = async () => {
//     setSearchPerformed(true);
//     try {
//       const token = localStorage.getItem('token');
//       const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/search/transactions', {
//         headers: { 'x-auth-token': token },
//         params: { mobileNumber },
//       });
//       setResults(response.data);
//       setMobileNumber('');

//       const filteredResults = transactions.filter(
//         (transaction) =>
//           transaction.phoneNumber &&
//           transaction.phoneNumber.includes(mobileNumber)
//       );
//     } catch (error) {
//       console.error('Error fetching transactions:', error);
//     }
//     setLoading(false);
//   };

//    const formatToIndianCurrency = (number) => {
//     if (number === null || number === undefined) return '';
  
//     const numStr = number.toString(); // Convert to string
  
//     // Split into integer and decimal parts
//     const [integerPart, decimalPart] = numStr.split('.');
  
//     // Format integer part to Indian Number System
//     const formattedInteger = integerPart.replace(
//       /(\d)(?=(\d\d)+\d$)/g, // Regex for Indian Number System grouping
//       '$1,'
//     );
  
//     // Combine integer and decimal parts
//     return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
//   };
  
  
//   const handleClearSearch = () => {
//     setMobileNumber("");
//     setResults([]);
//     setSearchPerformed(false);
//     setIsSearching(false);
//   };

//   const handleTransactionClick = (transaction) => {
//     setSelectedTransaction(transaction);
//   };

//   const closeModal = () => {
//     setSelectedTransaction(null);
//     setShowCustomerSelection(false);
//   };
  
//   const handleChangeStatus = async (transactionId, newStatus) => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.put(
//         `${process.env.REACT_APP_API_BASE_URL}/update-transaction-status/${transactionId}`,
//         { status: newStatus },
//         { headers: { 'x-auth-token': token } }
//       );
  
//       setTransactions((prev) =>
//         prev.map((txn) =>
//           txn.customerID === transactionId ? { ...txn, status: newStatus } : txn
//         )
//       );
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   };

//   const totalPages = Math.ceil(transactions.length / customersPerPage);
//   const indexOfLastCustomer = currentPage * customersPerPage;
//   const indexOfFirstCustomer = indexOfLastCustomer - customersPerPage;
//   const currentTransactions = transactions.slice(indexOfFirstCustomer, indexOfLastCustomer);
  
//   const handlePageChange = (newPage) => {
//     if (newPage >= 1 && newPage <= totalPages) {
//       setCurrentPage(newPage);
//     }
//   };

//   const handleRedirect = (customerID) => {
//     navigate(`/loan_profile/${customerID}`);
//   };

//   // Function to generate a random background color
//   const getRandomColor = () => {
//     const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A6", "#A633FF"];
//     return colors[Math.floor(Math.random() * colors.length)];
//   };

//   // Function to get the first letter of a name
//   const getInitials = (name) => {
//     if (!name || typeof name !== "string") return "?";
//     return name.charAt(0).toUpperCase();
//   };

//   // Function to get status color
//   const getStatusClass = (status) => {
//     if (!status) return "status-default-profiles";
    
//     switch (status.toLowerCase()) {
//       case "active":
//         return "status-active-profiles";
//       case "closed":
//         return "status-closed-profiles";
//       default:
//         return "status-default-profiles";
//     }
//   };
  
//   // Handle add new customer click
//   const handleAddNewClick = () => {
//     setShowAddOptions(!showAddOptions);
//   };
  
//   // Handle customer selection
//   const handleCustomerSelect = (customer) => {
//     setSelectedCustomer(customer);
//   };
  
//   // Create new transaction with selected customer
//   const handleCreateTransaction = () => {
//     // Implementation would go here
//     setSelectedCustomer(null);
//     setShowCustomerSelection(false);
//   };
  
//   // Toggle menu for a transaction
//   const toggleMenu = (id, e) => {
//     e.stopPropagation(); // Prevent the click from bubbling to the transaction item
//     setMenuOpenForId(menuOpenForId === id ? null : id);
//   };

//   // if (loading)
//   //   return (
//   //     <div
//   //       className="loading-container-profiles"
//   //       style={{
//   //         display: "flex",
//   //         justifyContent: "center",
//   //         alignItems: "center",          
//   //         height: "100vh",
//   //         width: "100%",
//   //         background: "transparent",
//   //       }}
//   //     >
//   //       <ThreeDot color="#3168cc" size="medium" text="" textColor="" />
//   //     </div>
//   //   );

//   if (loading) {
//     return (
//       <Profile_loading/>
//     );
//   }

//   const { loanType, amount,  interestRate, startDate, compoundInterest, interestFrequency, remarks, billNo, remainingPrincipal, topUpTotal } = loanDetails?.loanDetails || {};
//   const { accruedInterest, totalAmount,topdownInterest  } = loanDetails?.loanDetails || {};
//   // const { updatedAt, createdAt, profileImage } = loanDetails || {};



//   // const topUpTotal = loanDetails?.loanDetails.topUpHistory?.reduce((sum, topUp) => sum + topUp.amount, 0) || 0;

//   const totalLoanAmount = amount + topUpTotal;


//   const topUpInterest = loanDetails?.loanDetails?.topUpInterest || 0;
  
//   const totalInterest = accruedInterest + topUpInterest ;
//   // const totalInterest = accruedInterest 
//   const  P = topUpTotal + totalAmount           

//    const grandTotal = P + totalInterest

//   return (
//     <div className="transactions-container-unique">
//       {/* Header with back navigation and page title */}
//       <div className="header-navigation-profiles">
//         <button 
//           className="back-button-profiles" 
//           onClick={() => navigate(-1)}
//         >
//           <ArrowLeft className="back-arrow-profiles" size={16} />
//           Back to Home
//         </button>
//         <h1 className="page-title-profiles">Transactions</h1>
//       </div>

//       {/* Search and Add New button */}
//       <div className="search-box-container-profiles">
//         <div className="search-box-profiles">
//           <input
//             type="text"
//             value={mobileNumber}
//             onChange={(e) => {
//               setMobileNumber(e.target.value);
//               setIsSearching(e.target.value.length > 0);
//             }}         
//             placeholder="Search..."
//             className="search-input-profiles"
//           />
          
//           {results.length > 0 || searchPerformed ? (
//             <X 
//               onClick={handleClearSearch} 
//               className="clear-icon-profiles" 
//               size={18} 
//             />
//           ) : (
//             <Search 
//               onClick={handleSearch} 
//               className="search-icon-profiles" 
//               size={18} 
//             />
//           )}
//         </div>
        
//         {/* Add new button with dropdown */}
//         <div ref={addButtonRef} style={{ position: 'relative' }}>
//           <button 
//             className="add-new-button-profiles"
//             onClick={handleAddNewClick}
//           >
//             <Plus className="plus-icon-profiles" size={18} />
//             Add New
//           </button>
          
//           {showAddOptions && (
//             <div className="add-new-dropdown-profiles">
//               <div 
//                 className="dropdown-option-profiles"
//                 onClick={() => {
//                   setShowAddOptions(false);
//                   setShowCustomerSelection(true);
//                 }}
//               >
//                 <User size={16} />
//                 New Customer
//               </div>
//               <div 
//                 className="dropdown-option-profiles"
//                 onClick={() => {
//                   setShowAddOptions(false);
//                   // Handle new transaction
//                 }}
//               >
//                 <FileText size={16} />
//                 New Transaction
//               </div>
//             </div>
//           )}
//         </div>
//       </div>

//       {/* Search Results Section */}
//       {searchPerformed && (
//         <div className="results-container-profiles">
//           {results.length === 0 ? (
//             <p className="no-results-text-profiles">No transactions found</p>
//           ) : (
//             <ul className="transactions-list-profiles">
//               {results.map((result) => {
//                 const correspondingProfile = transactions.find(
//                   (profile) => String(profile.customerID).trim() === String(result.customerID).trim()
//                 );

//                 const correspondingProfile2 = profiles.find(
//                   (profile) => String(profile.customerID).trim() === String(result.customerID).trim()
//                 );

//                 const capitalize = (name) =>
//                   name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "Unknown";

//                 const firstInitial = result?.FirstName ? result.FirstName.charAt(0).toUpperCase() : "?";
//                 const bgColor = getRandomColor();

//                 return (
//                   <li 
//                     key={result._id} 
//                     className="transaction-item-profiles"
//                     onClick={() => handleRedirect(result.customerID)}
//                   >
//                     <div className="transaction-header-profiles">
//                       <p className="customer-name-profiles">
//                         {correspondingProfile2
//                           ? `${capitalize(correspondingProfile2?.FirstName || "Unknown")} ${capitalize(correspondingProfile2?.LastName || "Unknown")}`
//                           : "Unknown Unknown"}
//                       </p>
//                       <span className={`status-badge-profiles ${getStatusClass(correspondingProfile?.status)}`}>
//                         {correspondingProfile?.status || "Unknown"}
//                       </span>
//                     </div>

//                     <div className="transaction-body-profiles">
//                       <div className="profile-section-profiles">
//                         {result?.profileImage ? (
//                           <img src={result.profileImage} alt="Profile" className="profile-image-profiles" />
//                         ) : (
//                           <div className="profile-circle-profiles" style={{ backgroundColor: bgColor }}>
//                             {firstInitial}
//                           </div>
//                         )}
//                       </div>

//                       <div className="transaction-info-profiles">
//                         <p><strong>Total Amount</strong> {formatToIndianCurrency(Math.floor(grandTotal))}</p>
//                         <p><strong>Added On:</strong> {new Date(correspondingProfile?.createdAt || Date.now()).toLocaleDateString("en-GB")}</p>
//                       </div>
                      
//                       {/* Three Dot Menu */}
//                       <div className="menu-container-profiles" ref={menuRef}>
//                         <div 
//                           className="three-dot-menu-profiles"
//                           onClick={(e) => toggleMenu(result._id, e)}
//                         >
//                           <MoreVertical size={18} color="#727272" />
//                         </div>
                        
//                         {menuOpenForId === result._id && (
//                           <div className="menu-dropdown-profiles">
//                             <div className="menu-option-profiles">
//                               <Edit size={14} style={{ marginRight: '8px' }} />
//                               Edit
//                             </div>
//                             <div className="menu-option-profiles delete-option-profiles">
//                               <Trash2 size={14} style={{ marginRight: '8px' }} />
//                               Delete
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     </div>
//                   </li>
//                 );
//               })}
//             </ul>
//           )}
//         </div>
//       )}

//       {/* Transaction List */}
//       {!isSearching && (
//         <ul className="transactions-list-profiles">
//           {currentTransactions.map((transaction) => (
//             <li 
//               key={transaction._id} 
//               className="transaction-item-profiles"
//               onClick={() => handleRedirect(transaction.customerID)}
//             >
//               <div className="transaction-header-profiles">
//                 <p className="customer-name-profiles">
//                   {transaction.customerName || "Unknown Name"}
//                 </p>
//                 <span className={`status-badge-profiles ${getStatusClass(transaction.status)}`}>
//                   {transaction.status || "Unknown"}
//                 </span>
//               </div>
              
//               <div className="transaction-body-profiles">
//                 <div className="profile-section-profiles">
//                   {transaction.profileImage ? (
//                     <img 
//                       src={transaction.profileImage} 
//                       alt="Profile" 
//                       className="profile-image-profiles" 
//                     />
//                   ) : (
//                     <div 
//                       className="profile-circle-profiles" 
//                       style={{ backgroundColor: getRandomColor() }}
//                     >
//                       {getInitials(transaction.customerName)}
//                     </div>
//                   )}
//                 </div>
                
//                 <div className="transaction-info-profiles">
//                         <p><strong>Total Amount</strong> {formatToIndianCurrency(Math.floor(grandTotal))}</p>
//                   <p><strong>Added On:</strong> {new Date(transaction.createdAt).toLocaleDateString("en-GB")}</p>
//                 </div>
                
//                 {/* Three Dot Menu */}
//                 <div className="menu-container-profiles" ref={menuRef}>
//                   <div 
//                     className="three-dot-menu-profiles"
//                     onClick={(e) => toggleMenu(transaction._id, e)}
//                   >
//                     <MoreVertical size={18} color="#727272" />
//                   </div>
                  
//                   {menuOpenForId === transaction._id && (
//                     <div className="menu-dropdown-profiles">
//                       <div className="menu-option-profiles">
//                         <Edit size={14} style={{ marginRight: '8px' }} />
//                         Edit
//                       </div>
//                       <div className="menu-option-profiles delete-option-profiles">
//                         <Trash2 size={14} style={{ marginRight: '8px' }} />
//                         Delete
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}

//       {/* Pagination Controls */}
//       <div className="pagination-profiles">
//         <button 
//           onClick={() => handlePageChange(currentPage - 1)} 
//           disabled={currentPage === 1}
//         >
//           «
//         </button>

//         {Array.from({ length: totalPages }, (_, index) => (
//           <button
//             key={index + 1}
//             className={currentPage === index + 1 ? "active" : ""}
//             onClick={() => handlePageChange(index + 1)}
//           >
//             {index + 1}
//           </button>
//         ))}

//         <button 
//           onClick={() => handlePageChange(currentPage + 1)} 
//           disabled={currentPage === totalPages}
//         >
//           »
//         </button>
//       </div>

//       {/* Customer Selection Modal */}
//       {showCustomerSelection && (
//         <div className="modal-backdrop-profiles" onClick={closeModal}>
//           <div className="modal-content-profiles" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header-profiles">
//               <h2 className="modal-title-profiles">Select Customer</h2>
//               <button className="close-modal-profiles" onClick={closeModal}>×</button>
//             </div>
            
//             <div className="search-box-profiles" style={{ marginBottom: '16px' }}>
//               <input
//                 type="text"
//                 placeholder="Search customers..."
//                 className="search-input-profiles"
//               />
//               <Search className="search-icon-profiles" size={18} />
//             </div>

//             <ul className="customer-selection-profiles">
//               {profiles.map((profile) => {
//                 const capitalize = (name) => 
//                   name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "";
                
//                 const fullName = `${capitalize(profile.FirstName || "")} ${capitalize(profile.LastName || "")}`;
//                 const initials = getInitials(fullName);
//                 const bgColor = getRandomColor();
//                 const isSelected = selectedCustomer && selectedCustomer._id === profile._id;

//                 return (
//                   <li 
//                     key={profile._id}
//                     className={`customer-option-profiles ${isSelected ? 'selected' : ''}`}
//                     onClick={() => handleCustomerSelect(profile)}
//                   >
//                     <div 
//                       className="customer-avatar-profiles" 
//                       style={{ backgroundColor: bgColor }}
//                     >
//                       {profile.profileImage ? (
//                         <img src={profile.profileImage} alt={initials} />
//                       ) : (
//                         initials
//                       )}
//                     </div>
                    
//                     <div className="customer-selection-info-profiles">
//                       <p className="customer-selection-name-profiles">{fullName}</p>
//                       <p className="customer-selection-phone-profiles">{profile.phoneNumber || "No phone"}</p>
//                     </div>
                    
//                     {isSelected && (
//                       <Check size={18} color="#3168cc" />
//                     )}
//                   </li>
//                 );
//               })}
//             </ul>
            
//             <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
//               <button 
//                 className="add-new-button-profiles" 
//                 onClick={handleCreateTransaction}
//                 disabled={!selectedCustomer}
//                 style={{ 
//                   opacity: selectedCustomer ? 1 : 0.6,
//                   cursor: selectedCustomer ? 'pointer' : 'not-allowed'
//                 }}
//               >
//                 Create Transaction
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Transaction Details Modal */}
//       {selectedTransaction && (
//         <div className="modal-backdrop-profiles" onClick={closeModal}>
//           <div className="modal-content-profiles" onClick={(e) => e.stopPropagation()}>
//             <div className="modal-header-profiles">
//               <h2 className="modal-title-profiles">Transaction Details</h2>
//               <button className="close-modal-profiles" onClick={closeModal}>×</button>
//             </div>
            
//             <div style={{ padding: '10px 0' }}>
//               <p><strong>Customer:</strong> {selectedTransaction.customerName}</p>
//               <p><strong>Bill Number:</strong> {selectedTransaction.loanDetails?.billNo || "N/A"}</p>
//               <p><strong>Amount:</strong> {selectedTransaction.loanDetails?.amount || "N/A"}</p>
//               <p><strong>Status:</strong> {selectedTransaction.status || "Unknown"}</p>
//               <p><strong>Date:</strong> {new Date(selectedTransaction.createdAt).toLocaleDateString("en-GB")}</p>
//             </div>
            
//             <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
//               <button 
//                 onClick={() => {
//                   handleChangeStatus(selectedTransaction._id, "closed");
//                   closeModal();
//                 }}
//                 style={{
//                   backgroundColor: '#F39C12',
//                   color: 'white',
//                   border: 'none',
//                   borderRadius: '8px',
//                   padding: '8px 16px',
//                   cursor: 'pointer',
//                   transition: 'all 0.2s ease'
//                 }}
//               >
//                 Close Transaction
//               </button>
//               <button 
//                 onClick={() => handleRedirect(selectedTransaction.customerID)}
//                 className="add-new-button-profiles"
//               >
//                 View Full Details
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>

//   );
// }
// export default TransactionsList;