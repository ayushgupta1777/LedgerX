import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import LoadingPage from '../global/Loading';
import { io } from 'socket.io-client';
import '../../style/deposits/detail/cdp1.css'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp
} from "@fortawesome/free-solid-svg-icons";

const CustomerTransaction = ({ customerID }) => {
//   const { customerID } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

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
  const activities = [...chatMessages.map(msg => ({ ...msg,})), 
    ...transactions.map(txn => ({ ...txn, type: 'transaction' }))];

  
    const [chatInput, setChatInput] = useState('');
  // const socketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState("message"); // Default to "message" tab
const [transactionInput, setTransactionInput] = useState(""); // Default input value for transactions
const [inputValue, setInputValue] = useState("");

const [activeTab, setActiveTab] = React.useState('Message'); // Default active tab

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

      setChatMessages((prevMessages) => [...prevMessages, response.data]);
      setChatInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Failed to send message:', error.response?.data || error.message);
    }
  };

  const handleTransaction = async () => {
    if (amount && transactionType) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/transactions`,
          {
            customerID,
            transactionType,
            amount: parseFloat(amount),
            receiver: customer.phoneNumber,
          },
          { headers: { 'x-auth-token': token } }
        );
        setTransactions((prevTransactions) => [...prevTransactions, response.data]);
        setTransactionKey(transactionKey + 1);
        alert(`${transactionType} transaction of ₹${amount} added!`);

        setAmount('');
        setTransactionType('');
        scrollToBottom();
      } catch (error) {
        console.error('Transaction failed:', error.response.data);
        alert('Failed to add transaction.');
      }
    } else {
      alert('Please select transaction type and enter an amount.');
    }
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

  // const handleAction = (type) => {
  //   if (!inputValue.trim()) return;

  //   if (type === "receive" || type === "give") {
  //     const amount = parseFloat(inputValue);
  //     if (isNaN(amount) || amount <= 0) {
  //       alert("Please enter a valid amount.");
  //       return;
  //     }

  //     const transaction = {
  //       type,
  //       amount,
  //       date: new Date(),
  //     };

  //     setTransactions([...transactions, transaction]);
  //     setBalance((prev) =>
  //       type === "receive" ? prev + amount : prev - amount
  //     );
  //   } else if (type === "message") {
  //     const message = {
  //       text: inputValue,
  //       sender: "You",
  //       timestamp: new Date(),
  //     };

  //     setChatMessages([...chatMessages, message]);
  //   }

  //   setInputValue(""); 
  // };

  useEffect(() => {
    // Scroll the input section into view when the page loads
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);


  const checkNewDay = (txn, prevTxn) => {
    const txnDate = txn.timestamp ? dayjs(txn.timestamp).format('DD MMM YYYY') : null;
    const prevTxnDate = prevTxn && prevTxn.timestamp ? dayjs(prevTxn.timestamp).format('DD MMM YYYY') : null;
    return txnDate !== prevTxnDate;
  };
  

  const formatTime = (timestamp) => {
    return dayjs(timestamp).format('h:mm A');
  };

  if (loading) {
    return <LoadingPage />;
  }

  if (!customer) {
    return <p>Customer not found!</p>;
  }


  return (
    <div className="customer-transaction">
      {/* Header */}
      <div className="header1">
  <div className="customer-info">
    <h2 className="customer-name">{customer.name}</h2>
    <h2 className="customer-phone">{customer.phoneNumber}</h2>
  </div>
  <div className="balance-section">
    <h3 className="balance">
      Balance: ₹{balance} <span className="balance-type">({balanceType})</span>
    </h3>
  </div>
</div>

      {/* Balance Section */}
     
      {/* Transactions and Chat */}
      <div className="content-frame">

        {/* <div className="transactions">
          <h3>Transactions</h3>
          {transactions.map((txn, index) => (
            <div key={index} className={`transaction-item ${txn.transactionType}`}>
              <p>{txn.transactionType === 'receive' ? 'Received' : 'Given'}: ₹{txn.amount}</p>
              <span>{formatDate(txn.timestamp)} - {formatTime(txn.timestamp)}</span>
            </div>
          ))}
          <div ref={transactionsEndRef}></div>
        </div> */}

        {/* Chat Messages */}
        {/* <div className="chat-messages">
          <h3>Messages</h3>
          {chatMessages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.sender === 'You' ? 'sent' : 'received'}`}>
              <p>{msg.message}</p>
              <span>{formatTime(msg.timestamp)}</span>
            </div>
          ))}
          <div ref={transactionsEndRef}></div>
        </div>*/}
      </div> 
      

      <div className="activity-timeline">
  {activities
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)) // Sort by timestamp
    .map((activity, index) => {
      const isNewDay =
        index === 0 || checkNewDay(activity, activities[index - 1]);

      return (
<React.Fragment key={index}>
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
            ? 'flex-end'
            : 'flex-start'
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
            activity.transactionType === 'receive' ? 'green' : 'red',
          color: activity.transactionType === 'receive' ? 'white' : 'white',
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
        <p style={{ margin: 0 }}>
          <strong>{activity.senderYou}:</strong> {activity.message}
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
    )}
  </div>
</React.Fragment>

      );
    })}
</div>

<header className="app-header2">
  <div className="tab-container2" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <button
      className={`tap-button ${activeTab === 'Message' ? 'active' : ''}`}
      onClick={() => setActiveTab('Message')}
      style={{
        // padding: '10px',
        // background: activeTab === 'Message' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Message' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Message
    </button>
    <button
      className={`tap-button ${activeTab === 'Receive' ? 'active' : ''}`}
      onClick={() => {
        setTransactionType('receive');
        setActiveTab('Receive');
      }}
      style={{
        // padding: '10px',
        // background: activeTab === 'Receive' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Receive' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Receive
    </button>
    <button
      className={`tap-button ${activeTab === 'Give' ? 'active' : ''}`}
      onClick={() => {
        setTransactionType('give');
        setActiveTab('Give');
      }}
      style={{
        // padding: '10px',
        // background: activeTab === 'Give' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Give' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Give
    </button>
    <div
      className="active-indicator"
      style={{
        transform:
        activeTab === "Message"
          ? "translateX(0)"
          : activeTab === "Receive"
          ? "translateX(100%)"
          : activeTab === "Give"
          ? "translateX(200%)":  "translateX(0)",    }}
    />
  </div>
  </header>



<div className="input-section" style={{ 
  display: 'flex', 
  alignItems: 'center', 
  gap: '10px', 
  width: '100%', 
  margin:'5px 0px 5px 0px',
   }}>
  {/* Input Field */}
  {/* Separate Inputs for Each Tab */}
  {activeTab === 'Message' && (
    <div className="message-input" ref={inputRef} >
      <input
       
        type="text"
        value={chatInput}
        onChange={(e) => setChatInput(e.target.value)}
        placeholder="Enter your message..."
        style={{
          width: '100%',
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      {/* <button className="btn send" onClick={handleSendMessage}>
        SendM
      </button> */}
    </div>
  )}

  {activeTab === 'Receive' && (
    <div className="transaction-input">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to receive..."
        style={{
          width: '100%',
          // flex: 1,
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      {/* <button className="btn confirm" onClick={handleTransaction}>
        Confirm
      </button> */}
    </div>
  )}

  {activeTab === 'Give' && (
    <div className="transaction-input">
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Enter amount to give..."
        style={{
          width: '100%',
          flex: 1,
          padding: '10px',
          border: '1px solid #ccc',
          borderRadius: '5px',
        }}
      />
      {/* <button className="btn confirm" onClick={handleTransaction}>
        Confirm
      </button> */}
    </div>
  )}



  {/* Tab Buttons */}
  
  {/* <header className="app-header2">
  <div className="tab-container2" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
    <button
      className={`tap-button ${activeTab === 'Message' ? 'active' : ''}`}
      onClick={() => setActiveTab('Message')}
      style={{
        // padding: '10px',
        // background: activeTab === 'Message' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Message' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Message
    </button>
    <button
      className={`tap-button ${activeTab === 'Receive' ? 'active' : ''}`}
      onClick={() => {
        setTransactionType('receive');
        setActiveTab('Receive');
      }}
      style={{
        // padding: '10px',
        // background: activeTab === 'Receive' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Receive' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Receive
    </button>
    <button
      className={`tap-button ${activeTab === 'Give' ? 'active' : ''}`}
      onClick={() => {
        setTransactionType('give');
        setActiveTab('Give');
      }}
      style={{
        // padding: '10px',
        // background: activeTab === 'Give' ? '#007bff' : '#f1f1f1',
        // color: activeTab === 'Give' ? 'white' : '#333',
        // border: '1px solid #ccc',
        // borderRadius: '5px',
        cursor: 'pointer',
      }}
    >
      Give
    </button>
    <div
      className="active-indicator"
      style={{
        transform:
        activeTab === "Message"
          ? "translateX(0)"
          : activeTab === "Receive"
          ? "translateX(100%)"
          : activeTab === "Give"
          ? "translateX(200%)":  "translateX(0)",    }}
    />
  </div>
  </header> */}

  {/* Send Button */}
  {/* <button
    className="send-button"
    onClick={handleSend}
    style={{
      padding: '10px 15px',
      background: '#28a745',
      color: 'white',
      border: 'none',
      borderRadius: '5px',
      cursor: 'pointer',
    }}
  >
    Send
  </button> */}


  {activeTab === 'Message' && (
    <div className="send-button" style={{width: '20%',}}>
      <button className="btn send" onClick={handleSendMessage}
      style={{
        
        padding: '18px 21px',

        background: 'black',
        color: 'white',
        border: 'none',
        borderRadius: '100%',
        cursor: 'pointer',
      }}
      >
        <FontAwesomeIcon icon={faArrowUp} />
      </button>
    </div>
  )}

  {activeTab === 'Receive' && (
    <div  className="send-button" style={{width: '20%',}}>
      <button className="btn confirm" onClick={handleTransaction}
      style={{
        padding: '10px 15px',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      >
        Confirm
      </button>
    </div>
  )}

  {activeTab === 'Give' && (
    <div className="send-button" style={{width: '20%',}}>
      <button className="btn confirm" onClick={handleTransaction}
      style={{
        padding: '10px 15px',
        background: '#28a745',
        color: 'white',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
      }}
      >
        Confirm
      </button>
    </div>
  )}

</div>
{/* Input Section */}

{/* <div className="input-section">
        <div className="transaction-inputs">
          <button className="btn receive" onClick={() => setTransactionType('receive')}>Receive</button>
          <button className="btn give" onClick={() => setTransactionType('give')}>Give</button>
          {transactionType && (
            <div className="transaction-modal">
              <h4>{transactionType === 'receive' ? 'Enter Amount to Receive' : 'Enter Amount to Give'}</h4>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
              />
              <button className="btn confirm" onClick={handleTransaction}>Confirm</button>
              <button className="btn cancel" onClick={() => setTransactionType('')}>Cancel</button>
            </div>
          )}
        </div>

  
        <div className="chat-input">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Enter your message"
          />
          <button className="btn send" onClick={handleSendMessage}>Send</button>
        </div>


      </div> */}
        <div ref={transactionsEndRef} />
    </div>
  );
};

export default CustomerTransaction;
