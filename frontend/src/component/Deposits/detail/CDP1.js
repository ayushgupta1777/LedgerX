import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import LoadingPage from '../../global/Loading';
import { io } from 'socket.io-client';
import "../../../style/deposits/detail/cdp1.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp , faPhone,faEllipsisV,faVideo,
  faImages,faArrowLeftLong, faArrowDown,   faSignOutAlt,
  faUser, faCog, faAddressBook, faUserCog, faCalendarAlt, faEllipsisVertical
} from "@fortawesome/free-solid-svg-icons";

import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";


import CDP1 from "../../global/Loading/CDP1"

const CustomerTransaction = ({ customers, customerID: propCustomerID, inline }) => {
  const { customerID: paramCustomerID } = useParams();
  const customerID = propCustomerID || paramCustomerID;
  const navigate = useNavigate();
  const inputRef = useRef(null);

      const COMPANY_NAME = "CZONE";
  const OWNER_NAME = "Your Name";

  const [customer, setCustomer] = useState(null);
  const [ transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const transactionsEndRef = useRef(null);
  const [transactionKey, setTransactionKey] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceType, setBalanceType] = useState('Advance');
  const [chatMessages, setChatMessages ] = useState([]);

  const [imageDocs, setImageDocs] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [previewDocs, setPreviewDocs] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionAmount, setTransactionAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState('');
  const [transactionNote, setTransactionNote] = useState('');


  const [showTransactionDetailModal, setShowTransactionDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editTransactionType, setEditTransactionType] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editDate, setEditDate] = useState('');

    // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuOptionsRef.current && !menuOptionsRef.current.contains(event.target)) {
        setShowMenuOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Determine balance color based on type
  const getBalanceColor = () => {
    if (balanceType?.toLowerCase().includes('advance')) {
      return '#4caf50'; // Green for advance
    } else if (balanceType?.toLowerCase().includes('due')) {
      return '#f44336'; // Red for due
    }
    return '#666'; // Default gray
  };
  

  const activities = [...chatMessages.map(msg => ({ ...msg,})), 
    ...transactions.map(txn => ({ ...txn, type: 'transaction' })),

    ...imageDocs.map((img, index) => ({
      id: index, // Ensure unique keys in React
      type: "image",
      content: img.image || img, // Handle both object & string cases
      timestamp: img.timestamp || new Date().toISOString(), // Fallback timestamp
      senderYou:img.senderYou,
    })),
    
    ...previewDocs.map((img, index) => ({
      id: index, // Ensure unique keys in React
      type: "previewDocs",
      content: img.content || img, // Handle both object & string cases
      timestamp: img.timestamp || new Date().toISOString(), // Fallback timestamp
      senderYou:img.senderYou,
    })),
  ];

  
    const [chatInput, setChatInput] = useState('');
  // const socketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("message"); // Default to "message" tab
const [transactionInput, setTransactionInput] = useState(""); // Default input value for transactions
const [inputValue, setInputValue] = useState("");

const [activeTab, setActiveTab] = React.useState('Message'); // Default active tab

const [image, setImage] = useState(null);
const [preview, setPreview] = useState(null);
const [bgColor, setBgColor] = useState("");

  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showMenuOptions, setShowMenuOptions] = useState(false);
  const [showSwitchOptions, setShowSwitchOptions] = useState(false);
  const menuRef = useRef(null);
  const quickActionsRef = useRef(null);
  const menuOptionsRef = useRef(null);
  const switchOptionsRef = useRef(null);

    const [showReminderModal, setShowReminderModal] = useState(false);
const [reminderDate, setReminderDate] = useState('');
const [reminderTime, setReminderTime] = useState('');
const [reminderMessage, setReminderMessage] = useState('');

  const [reminderPriority, setReminderPriority] = useState('medium'); // Default priority



const handleSend = () => {
  if (activeTab === 'Message') {
    // Handle message sending
    console.log('Message:', inputValue);
  } else if (activeTab === 'Receive') {
    // Handle receive action
    console.log('Received Amount:', inputValue);
  } else if (activeTab === 'Give') {
    // Handle give action
    console.log('Given Amount:', inputValue);
  }
  setInputValue(''); // Clear the input field
};


useEffect(() => {
  const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/events`);

  eventSource.onmessage = (event) => {
    const newMessage = JSON.parse(event.data);
    setChatMessages((prevMessages) => [...prevMessages, newMessage]);
    scrollToBottom();
  };

  eventSource.onerror = () => {
    console.error('SSE connection error. Retrying...');
    eventSource.close();
  };

  return () => {
    eventSource.close();
  };
}, []);


// after your useStates for showTransactionModal/showReminderModal
// useEffect(() => {
//   const open = showTransactionModal || showReminderModal;
//   document.body.classList.toggle('modal-open', open);
//   return () => document.body.classList.remove('modal-open');
// }, [showTransactionModal, showReminderModal]);
const toggleBodyClass = (open) => {
  if (open) {
    document.body.classList.add("modal-open");
  } else {
    document.body.classList.add("modal-open");
  }
};
const handleOpenTransactionModal = () => {
  setShowTransactionModal(true);
  toggleBodyClass(true);
};

const handleCloseTransactionModal = () => {
  setShowTransactionModal(false);
  toggleBodyClass(false);
};

useEffect(() => {
  // when this page is mounted
  document.body.classList.add("modal-open");

  // when leaving/unmounting this page
  return () => {
    // document.body.classList.remove("modal-open");
  };
}, []);


const handleTransactionClick = (transaction) => {
  setSelectedTransaction(transaction);
  setEditAmount(transaction.amount.toString());
  setEditTransactionType(transaction.transactionType);
  setEditNote(transaction.note || '');
  setEditDate(transaction.date ? dayjs(transaction.date).format('YYYY-MM-DD') : 
              dayjs(transaction.timestamp).format('YYYY-MM-DD'));
  setShowTransactionDetailModal(true);
  toggleBodyClass(true);
};

// Add this function to handle transaction updates
const handleUpdateTransaction = async () => {
  if (!editAmount || !editTransactionType) {
    alert('Please fill in all required fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${process.env.REACT_APP_API_BASE_URL}/transactions/${selectedTransaction._id}`,
      {
        amount: parseFloat(editAmount),
        transactionType: editTransactionType,
        note: editNote,
        date: editDate,
        customerID
      },
      { headers: { 'x-auth-token': token } }
    );

    // Update the transactions state
    setTransactions(prevTransactions =>
      prevTransactions.map(txn =>
        txn._id === selectedTransaction._id ? response.data : txn
      )
    );

    setTransactionKey(transactionKey + 1);
    setShowTransactionDetailModal(false);
    toggleBodyClass(false);
    alert('Transaction updated successfully!');
  } catch (error) {
    console.error('Failed to update transaction:', error.response?.data || error.message);
    alert('Failed to update transaction');
  }
};

// Add this function to handle transaction deletion
const handleDeleteTransaction = async () => {
  if (window.confirm('Are you sure you want to delete this transaction?')) {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${process.env.REACT_APP_API_BASE_URL}/transactions/${selectedTransaction._id}`,
        { headers: { 'x-auth-token': token } }
      );

      // Remove from transactions state
      setTransactions(prevTransactions =>
        prevTransactions.filter(txn => txn._id !== selectedTransaction._id)
      );

      setTransactionKey(transactionKey + 1);
      setShowTransactionDetailModal(false);
      toggleBodyClass(false);
      alert('Transaction deleted successfully!');
    } catch (error) {
      console.error('Failed to delete transaction:', error.response?.data || error.message);
      alert('Failed to delete transaction');
    }
  }
};


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          return alert('You are not logged in. Please log in to continue.');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/customers/${customerID}`, {
          headers: { 'x-auth-token': token },
        });
        setCustomer(response.data);

        const transactionResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions/${customerID}`, {
          headers: { 'x-auth-token': token },
        });

        const transactionsData = Array.isArray(transactionResponse.data) ? transactionResponse.data : [transactionResponse.data];
        setTransactions(transactionsData);

        let initialBalance = 0;
        transactionsData.forEach((txn) => {
          initialBalance += txn.transactionType === 'receive' ? txn.amount : -txn.amount;
        });
        setBalance(Math.abs(initialBalance));
        setBalanceType(initialBalance >= 0 ? 'Advance' : 'Due');


        const chatResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/chat/${customerID}`, {
          headers: { 'x-auth-token': token },
        });
        setChatMessages(chatResponse.data);

      } catch (error) {
        console.error('Failed to fetch customer:', error.response?.data || error.message);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };
    fetchCustomer();
  }, [customerID, transactionKey]);

 

  const handleSendMessage = async () => {
    if (!chatInput.trim()) {
      alert('Message cannot be empty!');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const newMessage = {
        customerID,
        message: chatInput.trim(),
        receiver: customer.phoneNumber,
        senderYou: 'You',
        timestamp: new Date(),
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/chat`,
        newMessage,
        { headers: { 'x-auth-token': token } }
      );

      // setChatMessages((prevMessages) => [...prevMessages, response.data]);
      setChatInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error.response?.data || error.message);
    }
  };

  // const handleTransaction = async () => {
  //   if (amount && transactionType) {
  //     try {
  //       const token = localStorage.getItem('token');
  //       const response = await axios.post(
  //         `${process.env.REACT_APP_API_BASE_URL}/transactions`,
  //         {
  //           customerID,
  //           transactionType,
  //           amount: parseFloat(amount),
  //           receiver: customer.phoneNumber,
  //         },
  //         { headers: { 'x-auth-token': token } }
  //       );
  //       setTransactions((prevTransactions) => [...prevTransactions, response.data]);
  //       setTransactionKey(transactionKey + 1);
  //       alert(`${transactionType} transaction of ₹${amount} added!`);

  //       setAmount('');
  //       // setTransactionType('');
  //       scrollToBottom();
  //     } catch (error) {
  //       console.error('Transaction failed:', error.response.data);
  //       alert('Failed to add transaction.');
  //     }
  //   } else {
  //     alert('Please select transaction type and enter an amount.');
  //   }
  // };

  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file)); // Show preview before upload
      uploadImage(file); // Upload image to Cloudinary
    }
  };
  
  const uploadImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append("image", file);
  
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/ac/upload/${customerID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      setImage(response.data.imageUrl); // Store the uploaded image URL
      console.log(response)
    } catch (error) {
      console.error("Error uploading image", error);
    } finally {
      setLoading(false);
    }
  };
  

  const generateRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFBB33", "#8E44AD", "#2E86C1"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const scrollToBottom = () => {
    transactionsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatDate = (timestamp) => {
    const today = dayjs().startOf('day');
    const yesterday = dayjs().subtract(1, 'day').startOf('day');
    const transactionDate = dayjs(timestamp).startOf('day');
    if (transactionDate.isSame(today)) {
      return 'Today';
    } else if (transactionDate.isSame(yesterday)) {
      return 'Yesterday';
    } else {
      return dayjs(timestamp).format('DD MMM YYYY');
    }
  };



   
  useEffect(() => {
    fetchFiles();
  }, [customerID]);

  const fetchFiles = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/files/${customerID}`);
      setImageDocs(response.data.images);
      setDocuments(response.data.documents);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };

  // -----------------------------------------confirem pic-----------------------------

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;
  
    const newPreviews = files.map((file, index) => ({
      id: Date.now() + index, // Unique ID
      type: "preview",
      content: URL.createObjectURL(file),
      file: file, // Store actual file for upload later
      timestamp: new Date().toISOString(),
      senderYou: "You"
    }));
  
    setSelectedFiles((prev) => [...prev, ...newPreviews.map((preview) => preview.file)]);
    setPreviewDocs((prev) => [...prev, ...newPreviews]); // Store preview objects
  };
  
  
  const handleCancel = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewDocs((prev) => prev.filter((_, i) => i !== index));
    setImageDocs((prev) => prev.filter((_, i) => i !== index));
  };
  

  const handleConfirmUpload = () => {
    if (selectedFiles.length === 0) {
      alert("No files selected!");
      return;
    }
    uploadFiles(selectedFiles);
    alert("Files uploaded successfully!");
  };
  

  const uploadFiles = async (files) => {
    setLoading(true);
    const formData = new FormData();
     files.forEach((file) => formData.append("images",file));

    console.log([...formData.entries()]); // Debugging


    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/doc/upload/${customerID}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

     // 🔹 Instantly update UI with local preview images
  const newPreviewImages = files.map((file) => ({
    image: URL.createObjectURL(file),
    timestamp: new Date().toISOString(),
    senderYou: "You",
  }));
  setImageDocs((prev) => [...newPreviewImages, ...prev]); 

       setSelectedFiles([]); // Clear selected files
    setPreviewDocs([]); // Clear preview

    } catch (error) {
      console.error("Error uploading file", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    // Scroll the input section into view when the page loads
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  useEffect(() => {
    scrollToBottom(); // Step 2: Auto-scroll when data updates
  }, [chatMessages, transactions, imageDocs]);

  const checkNewDay = (txn, prevTxn) => {
    const txnDate = txn.timestamp ? dayjs(txn.timestamp).format('DD MMM YYYY') : null;
    const prevTxnDate = prevTxn && prevTxn.timestamp ? dayjs(prevTxn.timestamp).format('DD MMM YYYY') : null;
    return txnDate !== prevTxnDate;
  };
  

  const formatTime = (timestamp) => {
    return dayjs(timestamp).format('h:mm A');
  };

  if (loading) {
    return <CDP1 />;
  }

    const confirmLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      showMessage("success", "You have been logged out.");
      window.location.href = "/login";
    }
  };

  const toggleQuickActions = () => {
    setShowQuickActions(!showQuickActions);
  };

  const toggleMenuOptions = () => {
    setShowMenuOptions(!showMenuOptions);
    // Close other menus
    setShowSwitchOptions(false);
    setShowQuickActions(false);
  };

  const toggleSwitchOptions = () => {
    setShowSwitchOptions(!showSwitchOptions);
    // Close other menus
    setShowMenuOptions(false);
    setShowQuickActions(false);
  };

  // if (!customer) {
  //   return <p>Customer not found!</p>;
  // }

  
  const handleTabClick = (tab, type) => {
    setActiveTab(tab);
    setTransactionType(type);
  };

  const getIndicatorTransform = () => {
    switch (activeTab) {
      case 'Message': return 'translateX(0%)';
      case 'Receive': return 'translateX(100%)';
      case 'Give': return 'translateX(200%)';
    }
  };

  const getIndicatorStyle = () => {
    const baseStyle = {
      transform: getIndicatorTransform(),
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'absolute',
      width: '33.33%',
      height: 'calc(100% - 4px)',
      borderRadius: '18px',
      zIndex: 1,
      top: '2px',
      left: '2px',
    };

    switch (activeTab) {
      case 'Message':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #90c6ff, #74b9ff)',
          boxShadow: '0 2px 10px rgba(116, 185, 255, 0.3)',
        };
      case 'Receive':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #4CAF50, #45a049)',
          boxShadow: '0 2px 10px rgba(76, 175, 80, 0.3)',
        };
      case 'Give':
        return {
          ...baseStyle,
          background: 'linear-gradient(135deg, #ff6b6b, #ee5a24)',
          boxShadow: '0 2px 10px rgba(255, 107, 107, 0.3)',
        };
      default:
        return baseStyle;
    }
  };

    const handleSetReminder = async () => {
  if (!reminderDate || !reminderTime || !reminderMessage) {
    alert('Please fill all reminder fields');
    return;
  }

  try {
    const token = localStorage.getItem('token');
    const reminderDateTime = new Date(`${reminderDate}T${reminderTime}`);
    
    const response = await axios.post(
     `${process.env.REACT_APP_API_BASE_URL}/reminders`,
      {
        customerID,
        customerName: customer.name,
        reminderDate: reminderDateTime,
        message: reminderMessage,
        phoneNumber: customer.phoneNumber,
        priority: reminderPriority,
        reminderType: 'followup',
      },
      { headers: { 'x-auth-token': token } }
    );

    alert('Reminder set successfully!');
    setShowReminderModal(false);
    setReminderDate('');
    setReminderTime('');
    setReminderMessage('');
  } catch (error) {
    console.error('Failed to set reminder:', error.response?.data || error.message);
    alert('Failed to set reminder');
  }
};


const calculateRunningBalance = (activities) => {
  const transactionActivities = activities
    .filter(activity => activity.type === 'transaction')
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  
  let runningBalance = 0;
  const balanceMap = new Map();
  
  transactionActivities.forEach((transaction) => {
    if (transaction.transactionType === 'give') {
      runningBalance += transaction.amount; // Give increases the due amount
    } else if (transaction.transactionType === 'receive') {
      runningBalance -= transaction.amount; // Receive decreases the due amount
    }
    
    // Store the balance for this transaction
    balanceMap.set(transaction._id || transaction.id, {
      balance: Math.abs(runningBalance),
      type: runningBalance > 0 ? 'Due' : runningBalance < 0 ? 'Advance' : 'Settled'
    });
  });
  
  return balanceMap;
};


  const shareTransactionViaWhatsApp = (transaction, balanceInfo) => {
    const transactionType = transaction.transactionType === 'receive' ? 'Received' : 'Credit';
    const transactionIcon = transaction.transactionType === 'receive' ? '💰' : '🎁';
    
    const message = `${transactionIcon} ${transactionType} ₹${transaction.amount} from ${COMPANY_NAME}.

Balance: ₹${balanceInfo.balance} ${balanceInfo.type}

Date: ${dayjs(transaction.timestamp).format('DD MMM YYYY, h:mm A')}
${transaction.note ? `Note: ${transaction.note}` : ''}

— ${OWNER_NAME}
${COMPANY_NAME}`;

    const encodedMessage = encodeURIComponent(message);
    const phoneNumber = customer.phoneNumber.replace(/\D/g, '');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };



// Update the handleTransaction function to use the new state:
const handleTransaction = async () => {
  const finalAmount = transactionAmount || amount;
  if (finalAmount && transactionType) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
       `${process.env.REACT_APP_API_BASE_URL}/transactions`,
        {
          customerID,
          transactionType,
          amount: parseFloat(finalAmount),
          receiver: customer.phoneNumber,
          date: transactionDate,
          note: transactionNote
        },
        { headers: { 'x-auth-token': token } }
      );
      setTransactions((prevTransactions) => [...prevTransactions, response.data]);
      setTransactionKey(transactionKey + 1);
      alert(`${transactionType} transaction of ₹${finalAmount} added!`);

      setAmount('');
      setTransactionAmount('');
      setTransactionNote('');
      scrollToBottom();
    } catch (error) {
      console.error('Transaction failed:', error.response?.data);
      alert('Failed to add transaction.');
    }
  } else {
    alert('Please select transaction type and enter an amount.');
  }
};




  return (
    <div className="customer-transaction" style={{
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  backgroundAttachment: "fixed",
  backgroundRepeat: "no-repeat",
  backgroundSize: "cover",
  boxSizing: "border-box",
}}>
      {/* Header */}
      <div className="modern-header-cdp">
        {/* Left Section: Back Button & Customer Info */}
        <div className="modern-header-left">
          {/* Modern Back Button */}
          {!inline && (
            <button onClick={() => navigate(-1)} className="modern-back-button">
              <FontAwesomeIcon icon={faArrowLeftLong} className="back-icon" />
            </button>
          )}

          {/* Customer Info */}
          <div 
            className="modern-customer-info" 
            onClick={() => navigate(`/profile/${customer.customerID}`)}
          >
            <div className="profile-container">
              {customer?.profileImage ? (
                <img
                  src={customer.profileImage}
                  alt="Profile"
                  className="modern-profile-image"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
              ) : (
                <div 
                  className="modern-profile-placeholder" 
                  style={{ backgroundColor: bgColor }}
                >
                  {customer?.name ? customer?.name.charAt(0).toUpperCase() : "?"}
                </div>
              )}
              <div className="profile-overlay">
                <FontAwesomeIcon icon={faUser} className="profile-overlay-icon" />
              </div>
            </div>

            {/* Customer Details */}
            <div className="customer-details">
              <h2 className="modern-customer-name">
                {customer?.name || "Unknown"}
              </h2>
              <p className="customer-phone">
                {customer?.phoneNumber || "N/A"}
              </p>
              <span className="view-profile-text">
                View Profile
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Balance and Menu */}
        <div className="modern-header-right">
          {/* Balance Section */}
          <div className="modern-balance-section">
            <div className="balance-container">
              {/* <span className="balance-label">Balance</span> */}
              <h3 
                className="modern-balance" 
                style={{ color: getBalanceColor() }}
              >
                ₹{balance}
              </h3>
              <span 
                className="modern-balance-type"
                style={{ color: getBalanceColor() }}
              >
                {balanceType}
              </span>
            </div>
          </div>

          {/* Modern Menu Button */}
          <button className="modern-menu-trigger" onClick={toggleMenuOptions}>
            <FontAwesomeIcon icon={faEllipsisVertical} className="modern-menu-icon" />
            
            {showMenuOptions && (
              <div className="modern-dropdown-menu" ref={menuOptionsRef}>
                <div className="modern-menu-item" onClick={() => setShowReminderModal(true)}>
                  <FontAwesomeIcon icon={faCalendarAlt} className="modern-menu-item-icon" />
                  <span className="modern-menu-item-text">Set Reminder</span>
                </div>
                
                <div className="modern-menu-divider"></div>
                
                <div className="modern-menu-item modern-menu-item-danger" onClick={confirmLogout}>
                  <FontAwesomeIcon icon={faSignOutAlt} className="modern-menu-item-icon" />
                  <span className="modern-menu-item-text">Logout</span>
                </div>
              </div>
            )}
          </button>
        </div>
      </div>

      <div className="content-frame">


      </div> 
      

      {/* <div className="activity-timeline">
  {activities
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by timestamp
    .map((activity, index) => {
      const isNewDay =
        index === 0 || checkNewDay(activity, activities[index - 1]);

      return (

        
        

              <React.Fragment key={index}>
                {isNewDay && (
                  <div style={{
                    textAlign: 'center',
                    margin: '20px 0',
                    padding: '8px 16px',
                    backgroundColor: '#a8c7fa',
                    borderRadius: '15px',
                    display: 'inline-block',
                    fontSize: '12px',
                    color: 'white',
                    fontWeight: '500',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    position: 'relative'
                  }}>
                    {formatDate(activity.timestamp)}
                  </div>
                )}
                <div style={{
                  display: 'flex',
                  justifyContent: activity.type === 'transaction' 
                    ? (activity.transactionType === 'receive' ? 'flex-start' : 'flex-end')
                    : activity.senderYou === 'You' ? 'flex-end' : 'flex-start',
                  marginBottom: '12px'
                }}>
                  {activity.type === 'transaction' ? (
                    // Transaction bubble with arrow (like reference)
                    <div style={{
                      backgroundColor: 'white',
                      borderRadius: '20px',
                      padding: '12px 20px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                      position: 'relative',
                      maxWidth: '70%',
                      zIndex: 1
                    }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: activity.transactionType === 'receive' ? '#e8f5e8' : '#ffe8e8',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <FontAwesomeIcon 
                            icon={activity.transactionType === 'receive' ? faArrowDown : faArrowUp} 
                            style={{ 
                              color: activity.transactionType === 'receive' ? '#2e7d32' : '#d32f2f',
                              fontSize: '12px'
                            }}
                          />
                        </div>
                        <span style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: '#333'
                        }}>
                          ₹{activity.amount}
                        </span>
                        <span style={{
                          fontSize: '12px',
                          color: '#666'
                        }}>
                          {formatTime(activity.timestamp)}
                        </span>
                        <FontAwesomeIcon icon={faEllipsisV} style={{ color: "#ccc", fontSize: "10px" }} />
                      </div>
                      
                      <div style={{
                        fontSize: '14px',
                        color: '#d32f2f',
                        fontWeight: '500'
                      }}>
                        ₹{balance} <span className="balance-type">({balanceType})</span>
                      </div>
                    </div>
                  ) : (

              //   <div style={{
              //     display: 'flex',
              //     justifyContent: activity.type === 'transaction' 
              //       ? 'center' 
              //       : activity.senderYou === 'You' ? 'flex-end' : 'flex-start',
              //     marginBottom: '12px'
              //   }}>
              //     {activity.type === 'transaction' ? (
              //       // Transaction bubble with arrow (like reference)
              //       <div style={{
              //         backgroundColor: 'white',
              //         borderRadius: '20px',
              //         padding: '12px 20px',
              //         boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              //         position: 'relative',
              //         maxWidth: '70%',
              //         margin: '0 auto',
              //         zIndex: 1

              //       }}>
              //         <div style={{
              //           display: 'flex',
              //           alignItems: 'center',
              //           gap: '8px',
              //           marginBottom: '8px'
              //         }}>
              //           <div style={{
              //             width: '24px',
              //             height: '24px',
              //             borderRadius: '50%',
              //             backgroundColor: activity.transactionType === 'receive' ? '#e8f5e8' : '#ffe8e8',
              //             display: 'flex',
              //             alignItems: 'center',
              //             justifyContent: 'center'
              //           }}>
              //             <FontAwesomeIcon 
              //               icon={activity.transactionType === 'receive' ? faArrowDown : faArrowUp} 
              //               style={{ 
              //                 color: activity.transactionType === 'receive' ? '#2e7d32' : '#d32f2f',
              //                 fontSize: '12px'
              //               }}
              //             />
              //           </div>
              //           <span style={{
              //             fontSize: '16px',
              //             fontWeight: '600',
              //             color: '#333'
              //           }}>
              //             ₹{activity.amount}
              //           </span>
              //           <span style={{
              //             fontSize: '12px',
              //             color: '#666'
              //           }}>
              //             {formatTime(activity.timestamp)}
              //           </span>
              //           <FontAwesomeIcon icon={faEllipsisV} style={{ color: "#ccc", fontSize: "10px" }} />
              //         </div>
                      
              //         <div style={{
              //           fontSize: '14px',
              //           color: '#d32f2f',
              //           fontWeight: '500'
              //         }}>
              //             ₹{balance} <span className="balance-type">({balanceType})</span>

              //         </div>
              //       </div>
              //     ) : (
                    // Regular message bubble
                    activity.message && (
                      <div style={{
                        backgroundColor: activity.senderYou === 'You' ? '#e3f2fd' : 'white',
                        borderRadius: '18px',
                        padding: '12px 16px',
                        maxWidth: '70%',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                      }}>
                        <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                          {activity.message}
                        </p>
                        <p style={{
                          fontSize: '11px',
                          color: '#666',
                          margin: '4px 0 0 0',
                          textAlign: 'right'
                        }}>
                          {formatTime(activity.timestamp)}
                        </p>
                      </div>
                    )
                  )}

{activity.type === "image" && activity.content && (
  <div
    className="message-bubble image-bubble"
    style={{
      backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
      padding: "10px",
      borderRadius: "10px",
      maxWidth: "60%",
      textAlign: activity.senderYou === "You" ? "right" : "left",
      margin: "0 10px",
    }}
  >
    <img
      src={activity.content} // ✅ Use activity.content directly
      alt="Uploaded"
      style={{ width: "220px", height: "auto", borderRadius: "8px" }}
      onError={(e) => console.error("Image Load Error:", e)}
    />
    <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
      {formatTime(activity.timestamp)}
    </p>
  </div>
)}

{activity.type === "previewDocs" && (
        <div className="message-bubble image-bubble"
          style={{
            backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
            padding: "10px",
            borderRadius: "10px",
            maxWidth: "70%",
            textAlign: activity.senderYou === "You" ? "right" : "left",
            margin: "0 10px",
          }}
        >
          <img
            src={activity.content}
            alt="Uploaded"
            style={{ width: "250px", height: "auto", borderRadius: "8px" }}
            onError={(e) => console.error("Image Load Error:", e)}
          />
          
        

{activity.type === "previewDocs" && (
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    gap: "5px", 
    marginTop: "10px",
    background: "linear-gradient(to right, #2196F3, #9C27B0)",
    padding: "5px 10px",
    borderRadius: "50px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
  }}>
    <button
      onClick={() => handleConfirmUpload(activity.id)}
      style={{
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "0.3s",
        flex: 1,
        textAlign: "center"
      }}
    >
    Confirm
    </button>

    <div style={{ 
      width: "40px", 
      height: "40px", 
      background: "white", 
      color: "black",
      fontSize: "14px",
      fontWeight: "bold",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      borderRadius: "50%",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
    }}>
      OR
    </div>

    <button
      onClick={() => handleCancel(activity.id)}
      style={{
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "0.3s",
        flex: 1,
        textAlign: "center"
      }}
    >
      Cancel
    </button>
  </div>
)}



          <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
            {formatTime(activity.timestamp)}
          </p>
        </div>
      )}
                </div>
              </React.Fragment>

      );
    })}
</div> */}

<div className="activity-timeline">
  {(() => {
    const sortedActivities = activities.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const balanceMap = calculateRunningBalance(sortedActivities);
    
    return sortedActivities.map((activity, index) => {
      const isNewDay = index === 0 || checkNewDay(activity, sortedActivities[index - 1]);
      
      return (
        <React.Fragment key={index}>
          {isNewDay && (
            <div style={{
              textAlign: 'center',
              margin: '20px 0',
              padding: '8px 16px',
              backgroundColor: '#a8c7fa',
              borderRadius: '15px',
              display: 'inline-block',
              fontSize: '12px',
              color: 'white',
              fontWeight: '500',
              left: '50%',
              transform: 'translateX(-50%)',
              position: 'relative'
            }}>
              {formatDate(activity.timestamp)}
            </div>
          )}
          
          <div style={{
            display: 'flex',
            justifyContent: activity.type === 'transaction' 
              ? (activity.transactionType === 'receive' ? 'flex-start' : 'flex-end')
              : activity.senderYou === 'You' ? 'flex-end' : 'flex-start',
            marginBottom: '12px'
          }}>
            {activity.type === 'transaction' ? (
              <div style={{
                backgroundColor: 'white',
                borderRadius: '20px',
                padding: '12px 20px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                position: 'relative',
                maxWidth: '70%',
                cursor: 'pointer', // Add cursor pointer
    transition: 'transform 0.2s ease', // Add hover effect
                // zIndex: 1
              }}
              onClick={() => handleTransactionClick(activity)} // Add click handler
  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}

              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: '8px'
                }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: activity.transactionType === 'receive' ? '#e8f5e8' : '#ffe8e8',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FontAwesomeIcon 
                      icon={activity.transactionType === 'receive' ? faArrowDown : faArrowUp} 
                      style={{ 
                        color: activity.transactionType === 'receive' ? '#2e7d32' : '#d32f2f',
                        fontSize: '12px'
                      }}
                    />
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#333'
                  }}>
                    ₹{activity.amount}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    color: '#666'
                  }}>
                    {formatTime(activity.timestamp)}
                  </span>
                  {/* <FontAwesomeIcon icon={faEllipsisV} style={{ color: "#ccc", fontSize: "10px" }} /> */}
                
                                      <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const balanceInfo = balanceMap.get(activity._id || activity.id);
                                            if (balanceInfo) {
                                              shareTransactionViaWhatsApp(activity, balanceInfo);
                                            }
                                          }}
                                          style={{
                                            marginLeft: 'auto',
                                            background: 'linear-gradient(135deg, #25D366, #128C7E)',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: '32px',
                                            height: '32px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            boxShadow: '0 2px 8px rgba(37, 211, 102, 0.4)',
                                            transition: 'all 0.2s ease'
                                          }}
                                          onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'scale(1.15)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.6)';
                                          }}
                                          onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'scale(1)';
                                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 211, 102, 0.4)';
                                          }}
                                          title="Share via WhatsApp"
                                         >
                                          <FontAwesomeIcon 
                                            icon={faWhatsapp} 
                                            style={{ 
                                              color: 'white', 
                                              fontSize: '18px' 
                                            }} 
                                          />
                                        </button>
                
                </div>
                
                {/* Running Balance Display */}
                {(() => {
                  const balanceInfo = balanceMap.get(activity._id || activity.id);
                  if (!balanceInfo) return null;
                  
                  const balanceColor = balanceInfo.type === 'Due' ? '#d32f2f' : 
                                     balanceInfo.type === 'Advance' ? '#4caf50' : '#666';
                  
                  return (
                    <div style={{
                      fontSize: '14px',
                      color: balanceColor,
                      fontWeight: '500'
                    }}>
                      {balanceInfo.balance === 0 ? (
                        <span style={{ color: '#4caf50' }}>₹0 (Settled)</span>
                      ) : (
                        <>₹{balanceInfo.balance} <span className="balance-type">({balanceInfo.type})</span></>
                      )}
                    </div>
                  );
                })()}
              </div>
            ) : (
              // Regular message bubble (unchanged)
              activity.message && (
                <div style={{
                  backgroundColor: activity.senderYou === 'You' ? '#e3f2fd' : 'white',
                  borderRadius: '18px',
                  padding: '12px 16px',
                  maxWidth: '70%',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                  <p style={{ margin: 0, fontSize: '14px', color: '#333' }}>
                    {activity.message}
                  </p>
                  <p style={{
                    fontSize: '11px',
                    color: '#666',
                    margin: '4px 0 0 0',
                    textAlign: 'right'
                  }}>
                    {formatTime(activity.timestamp)}
                  </p>
                </div>
              )
            )}

            {/* Image handling (unchanged) */}
            {activity.type === "image" && activity.content && (
              <div className="message-bubble image-bubble" style={{
                backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "60%",
                textAlign: activity.senderYou === "You" ? "right" : "left",
                margin: "0 10px",
              }}>
                <img
                  src={activity.content}
                  alt="Uploaded"
                  style={{ width: "220px", height: "auto", borderRadius: "8px" }}
                  onError={(e) => console.error("Image Load Error:", e)}
                />
                <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            )}

            {/* Preview docs handling (unchanged) */}
            {activity.type === "previewDocs" && (
              <div className="message-bubble image-bubble" style={{
                backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
                padding: "10px",
                borderRadius: "10px",
                maxWidth: "70%",
                textAlign: activity.senderYou === "You" ? "right" : "left",
                margin: "0 10px",
              }}>
                <img
                  src={activity.content}
                  alt="Uploaded"
                  style={{ width: "250px", height: "auto", borderRadius: "8px" }}
                  onError={(e) => console.error("Image Load Error:", e)}
                />
                
                {activity.type === "previewDocs" && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    justifyContent: "center",
                    gap: "5px", 
                    marginTop: "10px",
                    background: "linear-gradient(to right, #2196F3, #9C27B0)",
                    padding: "5px 10px",
                    borderRadius: "50px",
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
                  }}>
                    <button
                      onClick={() => handleConfirmUpload(activity.id)}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        transition: "0.3s",
                        flex: 1,
                        textAlign: "center"
                      }}
                    >
                      Confirm
                    </button>

                    <div style={{ 
                      width: "40px", 
                      height: "40px", 
                      background: "white", 
                      color: "black",
                      fontSize: "14px",
                      fontWeight: "bold",
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      borderRadius: "50%",
                      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
                    }}>
                      OR
                    </div>

                    <button
                      onClick={() => handleCancel(activity.id)}
                      style={{
                        backgroundColor: "transparent",
                        color: "white",
                        border: "none",
                        padding: "10px 20px",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontSize: "14px",
                        fontWeight: "bold",
                        transition: "0.3s",
                        flex: 1,
                        textAlign: "center"
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
                  {formatTime(activity.timestamp)}
                </p>
              </div>
            )}
          </div>
        </React.Fragment>
      );
    });
  })()}
</div>


<div className="floating-menu-wrapper">
        <div className="floating-menu-container">
          <div className="floating-menu-tabs">
            <button
              className={`menu-btn menu-btn-message ${activeTab === 'Message' ? 'active' : ''}`}
              onClick={() => setActiveTab('Message')}
              
            >
              Message
            </button>
            <button
              className={`menu-btn menu-btn-receive ${activeTab === 'Receive' ? 'active' : ''}`}
              onClick={() =>  {
                setTransactionType('receive');
                setActiveTab('Receive');
                                handleOpenTransactionModal();

              }}
            >
              Received
            </button>
            <button
              className={`menu-btn menu-btn-give ${activeTab === 'Give' ? 'active' : ''}`}
              onClick={() => {
                setTransactionType('give');
                setActiveTab('Give');
                                handleOpenTransactionModal();

              }}
            >
              Given
            </button>
            <div style={getIndicatorStyle()} />

          </div>
        </div>
      </div>

      {/* <style jsx>{`
        @media (max-width: 480px) {
          .floating-menu-wrapper {
            width: 95% !important;
            bottom: 70px !important;
          }
          
          .floating-menu-wrapper button {
            font-size: 0.8rem !important;
            padding: 10px 4px !important;
            min-height: 40px !important;
          }
          
          .floating-menu-wrapper .bg-white\\/95 {
            padding: 6px !important;
          }
        }

        @media (max-width: 360px) {
          .floating-menu-wrapper {
            width: 98% !important;
          }
          
          .floating-menu-wrapper button {
            font-size: 0.75rem !important;
            gap: 4px !important;
          }
        }

        @media (min-width: 481px) and (max-width: 768px) {
          .floating-menu-wrapper {
            width: 70% !important;
            max-width: 350px !important;
          }
        }

        @media (min-width: 769px) {
          .floating-menu-wrapper {
            width: 60% !important;
            max-width: 400px !important;
            bottom: 90px !important;
          }
          
          .floating-menu-wrapper button {
            font-size: 0.9rem !important;
            padding: 14px 12px !important;
          }
        }
      `}</style> */}


  <div className="input-section" style={{ 
  display: 'flex', 
  alignItems: 'center', 
  backgroundColor: '#f4f4f8',
  borderRadius: '30px',
  padding: '8px 12px',
  width: '100%',
  gap: '10px',
  marginBottom:'1px',
   }}>

     <label htmlFor="ImageCONFIRMATION" style={{ cursor: 'pointer', marginRight: '8px', marginLeft:'8px',
        boxShadow: '0px 4px 8px rgba(108, 92, 231, 0.4)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
        overflow: 'hidden',

        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        minWidth: '45px',
        minHeight: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.9)';
          e.currentTarget.style.boxShadow = '0px 2px 4px rgba(108, 92, 231, 0.3)';
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0px 4px 8px rgba(108, 92, 231, 0.4)';
        }}
        className="send-button-cdp1" 

        >
        <FontAwesomeIcon icon={faImages} style={{ color: '#6c5ce7', fontSize: '20px',

          color: '#6c5ce7', 
          fontSize: '18px',  // Reduce font size slightly
          lineHeight: '1',   // Fix vertical alignment issues
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
         }} />
      </label>
      
      <input
        type="file"
        id="ImageCONFIRMATION"
        name="images"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />

  {activeTab === 'Message' && (
    <div className="message-input" ref={inputRef} >
 <input
    type="text"
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    placeholder="Type something..."
    style={{
      flex: 1,
      padding: '12px 15px',
      border: 'none',
      outline: 'none',
      backgroundColor: 'transparent',
      fontSize: '14px',
      color: '#333',
    }}
  />

    </div>
  )}

{activeTab === 'Give' && (
  <div className="transaction-input">
    <input
      type="text"
      value="Enter Amount"
      readOnly
      onClick={() => setShowTransactionModal(true)}
      placeholder="Enter Amount"
      style={{
        flex: 1,
        padding: '12px 15px',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        fontSize: '14px',
        color: '#333',
        cursor: 'pointer'
      }}
    />
  </div>
)}

{activeTab === 'Receive' && (
  <div className="transaction-input">
    <input
      type="text"
      value="Enter Amount"
      readOnly
      onClick={() => setShowTransactionModal(true)}
      placeholder="Enter Amount"
      style={{
        flex: 1,
        padding: '12px 15px',
        border: 'none',
        outline: 'none',
        backgroundColor: 'transparent',
        fontSize: '14px',
        color: '#333',
        cursor: 'pointer'
      }}
    />
  </div>
)}


{showTransactionModal && (
  // <div className="transaction-modal" onClick={() => setShowTransactionModal(false)}>
  //   <div className="transaction-modal-content" onClick={(e) => e.stopPropagation()}>

  <div
   style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    // marginTop: '200px',
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '15px',
      width: '90%',
      maxWidth: '400px',
      maxHeight: '100vh',
      overflow: 'auto',
      boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      position: 'relative',
      zIndex: 100000,
      border: '1px solid rgba(255,255,255,0.2)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '1px solid #eee'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#e3f2fd',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>V</span>
        </div>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px' }}>{customer?.name}</h3>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>₹{balance}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <span style={{
            backgroundColor: '#e8f5e8',
            color: '#2e7d32',
            padding: '4px 8px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold'
          }}>
            SECURED 🔒
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px'
      }}>
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '5px'
        }}>
          ₹
        </div>
        <input
            type="text"          // prevent mobile number pad
            inputMode="none" 
          value={transactionAmount}
          onChange={(e) => setTransactionAmount(e.target.value)}
          placeholder="0"
          style={{
            fontSize: '32px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: 'none',
            outline: 'none',

            width: '100%',
            backgroundColor: 'transparent'
          }}
          autoFocus
            readOnly   
        />
        <div style={{
          width: '80px',
          height: '2px',
          backgroundColor: '#ddd',
          margin: '10px auto'
        }}></div>
      </div>

      {/* Date Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          color: '#666'
        }}>
          Date
        </label>
        <input
          type="date"
          value={transactionDate}
          onChange={(e) => setTransactionDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #eee',
            borderRadius: '8px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px'
      }}>
        <button style={{
          flex: 1,
          padding: '12px',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          backgroundColor: 'white',
          color: '#4CAF50',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          📷 Add Images
        </button>
        <button style={{
          flex: 1,
          padding: '12px',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          backgroundColor: 'white',
          color: '#4CAF50',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px'
        }}>
          🧾 Create Bills
          <span style={{
            backgroundColor: '#ff9800',
            color: 'white',
            fontSize: '10px',
            padding: '2px 6px',
            borderRadius: '4px',
            marginLeft: '4px'
          }}>
            NEW
          </span>
        </button>
      </div>

      {/* Add Note */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          padding: '12px',
          border: '2px solid #eee',
          borderRadius: '8px',
          gap: '10px'
        }}>
          <span style={{ fontSize: '18px' }}>📝</span>
          <input
            type="text"
            value={transactionNote}
            onChange={(e) => setTransactionNote(e.target.value)}
            placeholder="Add Note (Optional)"
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px'
            }}
          />
          <span style={{ fontSize: '18px', color: '#4CAF50' }}>🎤</span>
        </div>
      </div>

      {/* Calculator */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '10px',
        marginBottom: '20px'
      }}>
        {[1, 2, 3, '⌫', 4, 5, 6, '.', 7, 8, 9, 0,].map((item, index) => (
          <button
            key={index}
            onClick={() => {
              if (typeof item === 'number' || item === '.') {
                setTransactionAmount(prev => prev + item.toString());
              } else if (item === '⌫') {
                setTransactionAmount(prev => prev.slice(0, -1));
              }
            }}
            style={{
              padding: '15px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              backgroundColor: 
                item === '⌫' ? '#ffebee' :
                ['×', '−', '+'].includes(item) ? '#e8f5e8' :
                item === '=' ? '#4CAF50' : '#f5f5f5',
              color: 
                item === '⌫' ? '#d32f2f' :
                ['×', '−', '+'].includes(item) ? '#2e7d32' :
                item === '=' ? 'white' : '#333'
            }}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px'
      }}>
        <button
          onClick={() => {
            setShowTransactionModal(false);
            setTransactionAmount('');
            setTransactionNote('');
          }}
          style={{
            flex: 1,
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Cancel
        </button>
        <button
          onClick={() => {
            // Handle transaction submission
            setAmount(transactionAmount);
            handleTransaction();
            setShowTransactionModal(false);
            setTransactionAmount('');
            setTransactionNote('');
          }}
          style={{
            flex: 1,
            padding: '15px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#4CAF50',
            color: 'white',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold'
          }}
        >
          ✓
        </button>
      </div>
    </div>
  </div>
  
)}

{showTransactionDetailModal && selectedTransaction && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '25px',
      borderRadius: '20px',
      width: '90%',
      maxWidth: '420px',
      maxHeight: '80vh',
      overflow: 'auto',
      boxShadow: '0 25px 80px rgba(0,0,0,0.4)',
      position: 'relative',
      zIndex: 100000,
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '25px',
        paddingBottom: '15px',
        borderBottom: '2px solid #f0f0f0'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '45px',
            height: '45px',
            borderRadius: '50%',
            backgroundColor: editTransactionType === 'receive' ? '#e8f5e8' : '#ffe8e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <FontAwesomeIcon 
              icon={editTransactionType === 'receive' ? faArrowDown : faArrowUp}
              style={{ 
                color: editTransactionType === 'receive' ? '#2e7d32' : '#d32f2f',
                fontSize: '18px'
              }}
            />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
              Transaction Details
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
              {dayjs(selectedTransaction.timestamp).format('DD MMM YYYY, h:mm A')}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setShowTransactionDetailModal(false);
            toggleBodyClass(false);
          }}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '24px',
            color: '#999',
            cursor: 'pointer',
            padding: '5px'
          }}
        >
          ×
        </button>
      </div>

      {/* Transaction Type Selector */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Transaction Type
        </label>
        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <button
            onClick={() => setEditTransactionType('receive')}
            style={{
              flex: 1,
              padding: '12px',
              border: `2px solid ${editTransactionType === 'receive' ? '#4CAF50' : '#ddd'}`,
              borderRadius: '10px',
              backgroundColor: editTransactionType === 'receive' ? '#e8f5e8' : 'white',
              color: editTransactionType === 'receive' ? '#2e7d32' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faArrowDown} />
            Received
          </button>
          <button
            onClick={() => setEditTransactionType('give')}
            style={{
              flex: 1,
              padding: '12px',
              border: `2px solid ${editTransactionType === 'give' ? '#f44336' : '#ddd'}`,
              borderRadius: '10px',
              backgroundColor: editTransactionType === 'give' ? '#ffe8e8' : 'white',
              color: editTransactionType === 'give' ? '#d32f2f' : '#666',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <FontAwesomeIcon icon={faArrowUp} />
            Given
          </button>
        </div>
      </div>

      {/* Amount Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Amount
        </label>
        <div style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
        }}>
          <span style={{
            position: 'absolute',
            left: '15px',
            fontSize: '18px',
            color: '#666',
            zIndex: 1
          }}>
            ₹
          </span>
          <input
            type="number"
            value={editAmount}
            onChange={(e) => setEditAmount(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 15px 15px 35px',
              border: '2px solid #eee',
              borderRadius: '10px',
              fontSize: '16px',
              outline: 'none',
              fontWeight: '600'
            }}
            placeholder="0"
          />
        </div>
      </div>

      {/* Date Input */}
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Date
        </label>
        <input
          type="date"
          value={editDate}
          onChange={(e) => setEditDate(e.target.value)}
          style={{
            width: '100%',
            padding: '12px 15px',
            border: '2px solid #eee',
            borderRadius: '10px',
            fontSize: '14px',
            outline: 'none'
          }}
        />
      </div>

      {/* Notes Section */}
      <div style={{ marginBottom: '25px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          fontSize: '14px',
          fontWeight: '500',
          color: '#333'
        }}>
          Notes {editNote && <span style={{ color: '#4CAF50', fontSize: '12px' }}>(Added)</span>}
        </label>
        <div style={{
          border: '2px solid #eee',
          borderRadius: '10px',
          padding: '12px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px'
        }}>
          <span style={{ fontSize: '16px', color: '#4CAF50', marginTop: '2px' }}>📝</span>
          <textarea
            value={editNote}
            onChange={(e) => setEditNote(e.target.value)}
            placeholder={editNote ? editNote : "Add a note for this transaction..."}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '14px',
              resize: 'vertical',
              minHeight: '60px',
              backgroundColor: 'transparent'
            }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column'
      }}>
        {/* Update Button */}
        <button
          onClick={handleUpdateTransaction}
          style={{
            width: '100%',
            padding: '15px',
            border: 'none',
            borderRadius: '10px',
            backgroundColor: '#4CAF50',
            color: 'white',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <FontAwesomeIcon icon={faCog} />
          Update Transaction
        </button>

        {/* Delete Button */}
        <button
          onClick={handleDeleteTransaction}
          style={{
            width: '100%',
            padding: '15px',
            border: '2px solid #f44336',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#f44336',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          🗑️ Delete Transaction
        </button>

        {/* Cancel Button */}
        <button
          onClick={() => {
            setShowTransactionDetailModal(false);
            toggleBodyClass(false);
          }}
          style={{
            width: '100%',
            padding: '12px',
            border: '2px solid #ddd',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#666',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}


{['Message', 'Give', 'Receive'].includes(activeTab) && (
    <button 
      className="send-button" 
      onClick={activeTab === 'Message' ? handleSendMessage : handleTransaction}
      style={{
        backgroundColor: '#6c5ce7',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        width: '45px',
        height: '45px',
        minWidth: '45px',
        minHeight: '45px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        // flexShrink: 0,
        boxShadow: '0px 4px 8px rgba(108, 92, 231, 0.4)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.9)';
        e.currentTarget.style.boxShadow = '0px 2px 4px rgba(108, 92, 231, 0.3)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0px 4px 8px rgba(108, 92, 231, 0.4)';
      }}
    >
      <FontAwesomeIcon icon={faArrowUp} />
    </button>
  )}



</div>

  {/* Remider Fix */}

  {showReminderModal && (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  }}>
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '15px',
      width: '80%',
      maxWidth: '400px'
    }}>
      <h3 style={{ marginBottom: '20px', textAlign: 'center' }}>Set Reminder</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Date:</label>
        <input
          type="date"
          value={reminderDate}
          onChange={(e) => setReminderDate(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Time:</label>
        <input
          type="time"
          value={reminderTime}
          onChange={(e) => setReminderTime(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Priority:</label>
        <select
          value={reminderPriority}
          onChange={(e) => setReminderPriority(e.target.value)}
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>


      
      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Message:</label>
        <textarea
          value={reminderMessage}
          onChange={(e) => setReminderMessage(e.target.value)}
          placeholder="e.g., Ask for payment, Send receipt..."
          style={{
            width: '100%',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            fontSize: '14px',
            minHeight: '80px',
            resize: 'vertical'
          }}
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => setShowReminderModal(false)}
          style={{
            padding: '10px 20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: 'white',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
        <button
          onClick={handleSetReminder}
          style={{
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            backgroundColor: '#6c5ce7',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Set Reminder
        </button>
      </div>
    </div>
  </div>
)}
        <div ref={transactionsEndRef} />
    </div>
  );
};

export default CustomerTransaction;

{/* <React.Fragment key={index}>
  {isNewDay && (
    <div style={{ textAlign: 'center', margin: '10px 0', color: 'grey' }}>
      {formatDate(activity.timestamp)}
    </div>
  )}
  <div
    className={`activity-item ${activity.type}`}
    style={{
      display: 'flex',
      justifyContent:
        activity.type === 'transaction'
          ? activity.transactionType === 'receive'
            ? 'flex-start'
            : 'flex-end'
          : activity.senderYou === 'You'
          ? 'flex-end'
          : 'flex-start',
      marginBottom: '10px',
    }}
  >
    {activity.type === 'transaction' ? (
      <div
        className="message-bubble"
        style={{
          backgroundColor:
            activity.transactionType === 'receive' ? 'white' : 'white',
          color: activity.transactionType === 'receive' ? 'green' : 'red',
          padding: '10px 15px',
          borderRadius: '20px',
          maxWidth: '60%',
          textAlign:
            activity.transactionType === 'receive' ? 'left' : 'right',
            margin: '0 10px',
        }}
      >
        <p style={{ margin: 0 }}>
          <strong>
            {activity.transactionType === 'receive' ? 'Received' : 'Given'}:
          </strong>{' '}
          ₹{activity.amount}
        </p>
        <p
          style={{
            fontSize: '0.8em',
            color: 'lightgray',
            margin: 0,
            textAlign: 'right',
          }}
        >
          {formatTime(activity.timestamp)}
        </p>
      </div>
    ) : (
      (activity.message || (activity.message === "image" && activity.message)) && (

      <div
        className="message-bubble"
        style={{
          backgroundColor:
          //   activity.senderYou === 'You' ? '#007bff  ' : '#f1f1f1',
          // color: activity.senderYou === 'You' ? 'white' : '#333',
          activity.senderYou === 'You' ? '#f1f1f1' : '#007bff',
          color: activity.senderYou === 'You' ? '#333' : 'white',
          padding: '10px 15px',
          borderRadius: '20px',
          maxWidth: '60%',
          textAlign: activity.senderYou === 'You' ? 'right' : 'left',
          margin: '0 10px',
        }}
      >
                 {activity.message && (
        <p style={{ margin: 0 }}>
          <strong>{activity.senderYou}:</strong> {activity.message}
        </p>
                )}
 {activity.message && (

        <p
          style={{
            fontSize: '0.8em',
            color: 'lightgray',
            margin: 0,
            textAlign: 'right',
          }}
        >
          {formatTime(activity.timestamp)}
        </p>
                 )}
      </div>
)

    )}

{activity.type === "image" && activity.content && (
  <div
    className="message-bubble image-bubble"
    style={{
      backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
      padding: "10px",
      borderRadius: "10px",
      maxWidth: "60%",
      textAlign: activity.senderYou === "You" ? "right" : "left",
      margin: "0 10px",
    }}
  >
    <img
      src={activity.content} // ✅ Use activity.content directly
      alt="Uploaded"
      style={{ width: "220px", height: "auto", borderRadius: "8px" }}
      onError={(e) => console.error("Image Load Error:", e)}
    />
    <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
      {formatTime(activity.timestamp)}
    </p>
  </div>
)}

{activity.type === "previewDocs" && (
        <div className="message-bubble image-bubble"
          style={{
            backgroundColor: activity.senderYou === "You" ? "#f1f1f1" : "#007bff",
            padding: "10px",
            borderRadius: "10px",
            maxWidth: "70%",
            textAlign: activity.senderYou === "You" ? "right" : "left",
            margin: "0 10px",
          }}
        >
          <img
            src={activity.content}
            alt="Uploaded"
            style={{ width: "250px", height: "auto", borderRadius: "8px" }}
            onError={(e) => console.error("Image Load Error:", e)}
          />
          
         

{activity.type === "previewDocs" && (
  <div style={{ 
    display: "flex", 
    alignItems: "center", 
    justifyContent: "center",
    gap: "5px", 
    marginTop: "10px",
    background: "linear-gradient(to right, #2196F3, #9C27B0)",
    padding: "5px 10px",
    borderRadius: "50px",
    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
  }}>
    <button
      onClick={() => handleConfirmUpload(activity.id)}
      style={{
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "0.3s",
        flex: 1,
        textAlign: "center"
      }}
    >
    Confirm
    </button>

    <div style={{ 
      width: "40px", 
      height: "40px", 
      background: "white", 
      color: "black",
      fontSize: "14px",
      fontWeight: "bold",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      borderRadius: "50%",
      boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)"
    }}>
      OR
    </div>

    <button
      onClick={() => handleCancel(activity.id)}
      style={{
        backgroundColor: "transparent",
        color: "white",
        border: "none",
        padding: "10px 20px",
        borderRadius: "50px",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "bold",
        transition: "0.3s",
        flex: 1,
        textAlign: "center"
      }}
    >
      Cancel
    </button>
  </div>
)}



          <p style={{ fontSize: "0.8em", color: "lightgray", margin: "5px 0 0", textAlign: "right" }}>
            {formatTime(activity.timestamp)}
          </p>
        </div>
      )}



  </div>
</React.Fragment> */}
