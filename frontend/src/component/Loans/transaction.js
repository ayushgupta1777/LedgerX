import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import '../../style/loans/TransactionsList.css'; // External CSS for styling
import { ThreeDot } from 'react-loading-indicators';
import LoadingPage from '../global/loadingShadow';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Search, X } from "lucide-react"; // Import the clear (X) icon
import Transaction_loading from "../global/Loading/transactions"
import '../../style/loans/delete-modal.css'; // Improved Delete Modal Styles
import '../../style/loans/transaction-details.css'; // New Transaction Details Modal Styles

const TransactionsList = () => {
  const [transactions, setTransactions] = useState([]);
  const [profiles, setProfiles] = useState([]); // Store profiles separately
  const [activeTab, setActiveTab] = useState('Active');
  const [loading, setLoading] = useState(true);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  // const [searchQuery, setSearchQuery] = useState(''); // State for search input

  const [mobileNumber, setMobileNumber] = useState('');
  const [results, setResults] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7; // Show 5 items per page

  const [searchPerformed, setSearchPerformed] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

    const navigate = useNavigate();
  
    const [isPressed, setIsPressed] = useState(false);

      const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState(null);

  const handleDeleteClick = (transaction) => {
    setTransactionToDelete(transaction);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!transactionToDelete) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/delete-customer-profile/${transactionToDelete.customerID}`, {
        headers: { 'x-auth-token': token }
      });

      // Remove from list
      setTransactions(prev => prev.filter(t => t.customerID !== transactionToDelete.customerID));
      setResults(prev => prev.filter(t => t.customerID !== transactionToDelete.customerID));

      setIsDeleteModalOpen(false);
      setTransactionToDelete(null);
      if (selectedTransaction?.customerID === transactionToDelete.customerID) {
        closeModal();
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      alert('Failed to delete transaction');
    }
  };




  useEffect(() => {
    if (searchPerformed && mobileNumber) {
      handleSearch();
    }
  }, [transactions]); // This ensures the results persist when transactions change



  const handleSearch = async () => {
    // setLoading(true);
    setSearchPerformed(true);
    try {
      const token = localStorage.getItem('token'); // Assuming you use a token for auth
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/search/transactions`, {
        headers: { 'x-auth-token': token },
        params: { mobileNumber }, // Send mobile number as query param
      });
      setResults(response.data); // Update with the response data
      setMobileNumber('')

      const filteredResults = transactions.filter(
        (transaction) =>
          transaction.phoneNumber &&
          transaction.phoneNumber.includes(mobileNumber)
      );
  
      // setTimeout(() => {
      //   setResults(filteredResults);
      //   // setLoading(false);
      // }, 500); // Simulating API delay
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
    setLoading(false);
  };

  // Fetch transactions and profiles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions_loan`, {
          headers: { 'x-auth-token': token },
        });
        setTransactions(response.data.data); // Transactions
        setProfiles(response.data.profile1); // Profiles
        console.log('Fetched profiles:', response.data.profile1);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleCloseTransaction = (transaction) => {
    // Show confirmation alert
    const confirmClose = window.confirm(
      `Are you sure you want to close the transaction for Customer ID: ${transaction.customerID}?`
    );
    if (!confirmClose) return; // Exit if user cancels
  
    // Simulate human verification (optional)
    const verifyHuman = window.prompt("Please enter 'CONFIRM' to proceed:");
    if (verifyHuman !== "CONFIRM") {
      alert("Transaction closure cancelled. Human verification failed.");
      return;
    }
  
    // Update the status
    handleChangeStatus(transaction.customerID, "closed");
  };
  
  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
  };

  const closeModal = () => {
    setSelectedTransaction(null);
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


  const handleStopInterest = async (transactionId) => {
    try {
      const token = localStorage.getItem('token'); // Retrieve token
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/transactions-loan/stop-interest/${transactionId}`,
        
        { headers: { 'x-auth-token': token } }
      );
  
      alert(response.data.message); // Show success message
  
      const updatedTransaction = response.data.transaction;
  
      // setTransactions((prev) =>
      //   prev.map((txn) =>
      //     txn.customerID === transactionId ? updatedTransaction : txn
      //   )
      // );
      setTransactions((prev) =>
        prev.map((txn) =>
          txn.customerID === transactionId
            ? {
                ...txn,
                loanDetails: {
                  ...txn.loanDetails,
                  accruedInterest: 0, // Reset accrued interest
                  interestStartDate: new Date().toISOString(), // Update interest start date
                },
              }
            : txn
        )
      );
      
    } catch (error) {
      console.error('Error stopping interest:', error);
      alert('Failed to stop interest.');
    }
  };

  const filteredTransactions = transactions
  .filter((transaction) => transaction && transaction.status) // Avoid undefined
  .filter((transaction) => {
    if (activeTab === 'Active') return transaction.status === 'active';
    if (activeTab === 'Closed') return transaction.status === 'closed';
    return true;
  });

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  // Paginate transactions for the current page
  const currentTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  

  const handleClearSearch = () => {
    setMobileNumber(""); // Clear input field
    setResults([]); // Clear search results
    setSearchPerformed(false);
    setIsSearching(false);

  };

  const handleRedirect = (customerID) => {
    navigate(`/loan_profile/${customerID}`);
  };

  const tabs = ["Active", "Closed", "All Transactions"];


//   if (loading) return <div 
//   className="container" 
//   style={{
//     display: "flex",
//     justifyContent: "center",
//     alignItems: "center",
//     height: "100vh", // Full height of the viewport (optional)
//     width: "100%", // Full width of the container
//   }}
// >
//   <ThreeDot color="#32cd32" size="medium" text="" textColor="" />
// </div>;


if (loading) {
  return (
    <Transaction_loading/>
  );
}
  

  return (

<>

<div className="search-container-unique1">

<div className="card-view">
<nav style={{ color: "white" }}>    
  <a onClick={() => navigate(-1)} className="arrow-container">
      <svg
      style={{ color: "white" }}
        className="arrow"
        version="1.1"
        viewBox="0 0 512 512"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
      >
        <polygon
            fill="white"  // <-- Change color dynamically
          points="352,115.4 331.3,96 160,256 331.3,416 352,396.7 201.5,256"
          stroke="#727272"
        />
      </svg>
      Back to all Plants
    </a>
  </nav>
</div>

<div className='sbu-c'>
<div className="search-box-unique">
        <input
          type="text"
          value={mobileNumber}
          onChange={(e) => {
            setMobileNumber(e.target.value);
            setIsSearching(e.target.value.length > 0); // Hide UI when typing
          }}         
          placeholder="Search..."
          className="search-input-unique"
        />
        
        {/* Show Clear (X) Icon if Results Exist, Otherwise Show Search Icon */}
        {results.length > 0 || searchPerformed ? (
          <X onClick={handleClearSearch} className="search-icon-unique" size={20} />
        ) : (
          <Search onClick={handleSearch} className="search-icon-unique" size={20} />
        )}
      </div>
</div>
{loading && <p className="loading-text">Loading...</p>}

{/* <div className="results-container">
        {searchPerformed && results.length === 0 ? (
          <p className="no-results-text">No transactions found</p>
        ) : (
          <ul className="transactions-list">
            {results.map((result) => {
              const correspondingProfile = transactions.find(
                (profile) => profile.customerID === result.customerID
              );

              const correspondingProfile2 = profiles.find(
                (profile) => String(profile.customerID) === String(result.customerID)
              );

              return (
                <li key={result._id} className="transaction-card">
                  <div className="transaction-header">
                    <div className="profile-circle">
                      {result.profileImage ? (
                        <img src={result.profileImage} alt="Profile" className="profile-img" />
                      ) : (
                        <span>{result.FirstName.charAt(0)}</span>
                      )}
                    </div>
                    <div className="customer-info">
                    <span className="customer-name">
                      {correspondingProfile2 ? correspondingProfile2.FirstName : "Unknown"} {result.LastName || "Unknown"}
                    </span>                    
                    <span className="customer-phone">
                      {correspondingProfile2?.phoneNumber || "Unknown"}
                      </span>
                    </div>
                  </div>
                  

                  <div className="transaction-details">
                    <p className="transaction-amount">
                      <strong>Amount:</strong> {correspondingProfile?.loanDetails.amount || "N/A"}
                    </p>
                    <p className={`transaction-status ${result.status ? result.status.toLowerCase() : "unknown"}`}>
                      {correspondingProfile?.status || "Unknown"}
                    </p>
                  </div>

                  <div className="transaction-actions">
                    <button
                      className="detail-btn"
                      // onClick={() => handleTransactionClick(result)}
                      onClick={() => handleRedirect(correspondingProfile.customerID)}
                    >
                      View Details 1
                    </button>
                    {result.status === "active" && (
                      <button
                        className="close-btn"
                        onClick={() => handleChangeStatus(result._id, "closed")}
                      >
                        Close Transaction
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div> */}

<div className="results-container">
  {searchPerformed && results.length === 0 ? (
    <p className="no-results-text">No transactions found</p>
  ) : (
    <ul className="transactions-list-p">
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

        return (
          <li key={result._id} className="transaction-card-p">
            <div className="transaction-header">
              <div className="profile-circle">
                {result?.profileImage ? (
                  <img src={result.profileImage} alt="Profile" className="profile-img" />
                ) : (
                  <span>{firstInitial}</span>
                )}
              </div>

              <div className="customer-info">
                <span className="customer-name">
                  {correspondingProfile2
                    ? `${capitalize(correspondingProfile2?.FirstName || "Unknown")} ${capitalize(correspondingProfile2?.LastName || "Unknown")}`
                    : "Unknown Unknown"}
                </span>
                <span className="customer-phone">
                  {correspondingProfile2?.phoneNumber || "Unknown"}
                </span>
              </div>
            </div>

            <div className="transaction-details">
              <p className="transaction-amount">
                <strong>Amount:</strong>{" "}
                {correspondingProfile?.loanDetails?.amount ?? "N/A"}
              </p>
              <p
                                     className={`transaction-status ${correspondingProfile?.status ? correspondingProfile.status.toLowerCase() : "unknown"

                
                }`}
              >
                {correspondingProfile?.status || "Unknown"}
              </p>
            </div>

            <div className="transaction-actions">
              <button className="detail-btn" onClick={() => handleRedirect(result.customerID)}>
                View Details
              </button>
              {result.status === "active" && (
                <button className="close-btn" onClick={() => handleChangeStatus(result._id, "closed")}>
                  Close Transaction
                </button>

                
              )}
              <button
                        className="delete-btn"
                        style={{ backgroundColor: '#ff4d4d', color: 'white', marginLeft: '5px', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                        onClick={() => handleDeleteClick(result)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
            </div>
          </li>
        );
      })}
    </ul>
  )}
</div>

      {!isSearching && (
      <div className="tab-container-t">
      {tabs.map((tab, index) => (
        <button
          key={index}
          className={`tab-button-t ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab}
        </button>
      ))}
      <div
        className="tab-indicator-t"
        style={{
          transform: `translateX(${tabs.indexOf(activeTab) * 100}%)`,
        }}
      />
    </div>
  )}

{!isSearching && (
    <div className="unique-table-container">
  <div className="unique-table-header">
    <h3>Transactions</h3>
    <button className="unique-btn-view-all" onClick={() => navigate('/customer_Profiles')} >View All Data</button>
  </div>
  <table className="unique-custom-table">
    <thead>
      <tr>
        <th>Customer Name</th>
        <th>Phone Number</th>
        <th>Amount</th>
        {/* <th>Added On</th> */}
        <th>Status</th>
        {/* <th>Actions</th> */}
      </tr>
    </thead>
    <tbody>
      {currentTransactions.map((transaction) => {
        // Find the corresponding profile based on customerID
        const correspondingProfile = profiles.find(
          (profile) => profile.customerID === transaction.customerID
        );

        return (
          <tr key={transaction._id} onClick={() => handleTransactionClick(transaction)}>
            <td>{correspondingProfile ? correspondingProfile.FirstName : "Unknown"}</td>
            <td>{correspondingProfile?.phoneNumber || "N/A"}</td>
            <td>{transaction.loanDetails.amount}</td>
            {/* <td>{new Date(transaction.createdAt).toLocaleDateString()}</td> */}
            <td>
              <span
                 className={`unique-status-badge ${transaction.status === "active"
                    ? "unique-status-active"
                    : "unique-status-closed"
                }`}
              > 
                {transaction.status === "active" ? "Active" : "Closed"}
              </span>
            </td>
            {/* <td>
              <button
                className="unique-btn-action unique-btn-detail"
                onClick={() => handleTransactionClick(transaction)}
              >
                ✏️
              </button>
              {transaction.status === "active" && (
                <button
                  className="unique-btn-action unique-btn-close"
                  onClick={() => handleChangeStatus(transaction._id, "closed")}
                >
                  🗑️
                </button>
              )}
            </td> */}
          </tr>
        );
      })}
    </tbody>
  </table>
        {/* Pagination */}
 <div className="unique-pagination">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &laquo;
              </button>
              {Array.from({ length: totalPages }, (_, index) => (
                <button
                  key={index}
                  className={currentPage === index + 1 ? 'unique-active' : ''}
                  onClick={() => handlePageChange(index + 1)}
                >
                  {index + 1}
                </button>
              ))}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &raquo;
              </button>
            </div>
          </div>
        )}

        {selectedTransaction && (() => {
          const correspondingProfile = profiles.find(
            (profile) => String(profile.customerID) === String(selectedTransaction.customerID)
          );

          const capitalize = (name) =>
            name ? name.charAt(0).toUpperCase() + name.slice(1).toLowerCase() : "Unknown";

          const fullName = correspondingProfile
            ? `${capitalize(correspondingProfile.FirstName)} ${capitalize(correspondingProfile.LastName)}`
            : "Unknown Unknown";

          return (
            <div className="details-modal-overlay" onClick={closeModal}>
              <div className="details-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="details-header">
                  <h3>Transaction Details</h3>
                  <button className="close-icon-btn" onClick={closeModal}>
                    <X size={24} />
                  </button>
                </div>

                <div className="details-body">
                  <div className="info-row">
                    <span className="info-label">Customer Name</span>
                    <span className="info-value">{fullName}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Customer ID</span>
                    <span className="info-value">{selectedTransaction.customerID}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Amount</span>
                    <span className="info-value">₹{selectedTransaction.loanDetails.amount}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Description</span>
                    <span className="info-value">{selectedTransaction.loanDetails.remarks || "No description"}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Type</span>
                    <span className="info-value">{selectedTransaction.loanDetails.loanType}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Date Added</span>
                    <span className="info-value">{new Date(selectedTransaction.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status</span>
                    <span className={`status-badge ${selectedTransaction.status}`}>
                      {selectedTransaction.status}
                    </span>
                  </div>
                </div>

                <div className="details-actions">
                  {selectedTransaction.status === "active" && (
                    <button
                      className="action-btn btn-primary"
                      onClick={() => {
                        closeModal();
                        handleCloseTransaction(selectedTransaction);
                      }}
                    >
                      <FontAwesomeIcon icon={faArrowRight} /> Close Transaction
                    </button>
                  )}

                  <button
                    className="action-btn btn-warning"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStopInterest(selectedTransaction.customerID);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Stop Interest
                  </button>

                  <button
                    className="action-btn btn-danger"
                    onClick={() => {
                      // closeModal(); // Optional: close details modal before showing confirmation? 
                      // actually keeping it open in background or closing it depends on preference. 
                      // Let's close it to avoid stacking modals heavily.
                      closeModal();
                      handleDeleteClick(selectedTransaction);
                    }}
                  >
                    <FontAwesomeIcon icon={faTrash} /> Delete Transaction
                  </button>
                </div>

                <button
                  className="view-profile-btn"
                  onClick={() => navigate(`/loan_profile/${selectedTransaction.customerID}`)}
                  title="View Full Profile"
                >
                  <FontAwesomeIcon icon={faArrowRight} size="lg" />
                </button>
              </div>
            </div>
          );
        })()}

        {/* {selectedTransaction && (
  <div className="modal-overlay" onClick={closeModal}>
    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
      <h3>Transaction Details</h3>
      <p><strong>Customer Name:</strong> {selectedTransaction.name || "Unknown"}</p>
      <p><strong>Customer ID:</strong> {selectedTransaction.customerID}</p>
      <p><strong>Amount:</strong> {selectedTransaction.loanDetails.amount}</p>
      <p><strong>Description:</strong> {selectedTransaction.loanDetails.remarks || "No description"}</p>
      <p><strong>Type:</strong> {selectedTransaction.loanDetails.loanType}</p>
      <p><strong>Status:</strong> {selectedTransaction.status}</p>
      <p><strong>Added On:</strong> {new Date(selectedTransaction.createdAt).toLocaleDateString()}</p>

      {selectedTransaction.status === "active" && (
        <button
        className="close-transaction-btn"
        onClick={(e) => {
          closeModal(); // Prevent modal close
          handleCloseTransaction(selectedTransaction);
        }}
      >
        Close Transaction
      </button>
      )}

        <button
        className="stop-interest-btn"
        onClick={(e) => {
          e.stopPropagation(); // Prevent modal close
          handleStopInterest(selectedTransaction.customerID);
        }}
      >
        Stop Interest
      </button>

      <button className="close-btn" onClick={closeModal}>
        Close
      </button>

      <button
  className={`neumorphic-button ${isPressed ? "pressed" : ""}`}
  onClick={() => navigate(`/loan_profile/${selectedTransaction.customerID}`)}
  >
    <FontAwesomeIcon icon={faArrowRight} className="icon" />
  </button>
    </div>
  </div>
)}  
     */}
      </div>







      {isDeleteModalOpen && (
        <div className="modal-overlay-custom">
          <div className="delete-modal-content">
            <div className="delete-icon-wrapper">
              <FontAwesomeIcon icon={faTrash} shake />
            </div>
            <h3 className="delete-modal-title">Delete Transaction?</h3>
            <p className="delete-modal-text">
              Are you sure you want to remove this transaction for <strong>{transactionToDelete?.FirstName || 'this customer'}</strong>?
              <br />
              <span style={{ fontSize: '0.9rem', color: '#ef4444' }}>This action cannot be undone.</span>
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
    </>
  );
};

export default TransactionsList;
