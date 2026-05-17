import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import LoadingPage from '../global/Loading';
import { io } from 'socket.io-client';
import "../../style/deposits/detail/cdp1.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowUp, faPhone, faEllipsisV, faVideo
} from "@fortawesome/free-solid-svg-icons";

const CustomerTransaction = ({ customers }) => {
  const { customerID } = useParams();
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [transactionType, setTransactionType] = useState('');
  const [amount, setAmount] = useState('');
  const transactionsEndRef = useRef(null);
  const [transactionKey, setTransactionKey] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceType, setBalanceType] = useState('Advance');
  const [chatMessages, setChatMessages] = useState([]);
  const activities = [
    ...new Map([...chatMessages, ...transactions.map(txn => ({ ...txn, type: 'transaction' }))].map(item => [item.timestamp, item])).values()
  ];


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
    const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/events`);

    eventSource.onmessage = (event) => {
      const newMessage = JSON.parse(event.data);

      setChatMessages((prevMessages) => {
        // Check if the message already exists based on a unique property like timestamp
        if (!prevMessages.some(msg => msg.timestamp === newMessage.timestamp && msg.message === newMessage.message)) {
          return [...prevMessages, newMessage];
        }
        return prevMessages; // Avoid duplication
      });

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


  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token2');
        if (!token) {
          return alert('You are not logged in. Please log in to continue.');
        }

        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/look_by_customer/customers/${customerID}`, {
          headers: { 'limited_auth': token },
        });
        setCustomer(response.data);

        const transactionResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/look_by_customer/transactions/${customerID}`, {
          headers: { 'limited_auth': token },
        });

        const transactionsData = Array.isArray(transactionResponse.data) ? transactionResponse.data : [transactionResponse.data];
        setTransactions(transactionsData);

        let initialBalance = 0;
        transactionsData.forEach((txn) => {
          initialBalance += txn.transactionType === 'receive' ? txn.amount : -txn.amount;
        });
        setBalance(Math.abs(initialBalance));
        setBalanceType(initialBalance >= 0 ? 'Due' : 'Advance');


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
        receiver: customer.ByPhoneNumber,
        senderYou: '2.0',
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
        const token = localStorage.getItem('token2');
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/look_by_customer/transactions`,
          {
            customerID,
            transactionType,
            amount: parseFloat(amount),
            receiver: customer.phoneNumber,
          },
          { headers: { 'limited_auth': token } }
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
        {/* User Info */}
        <div className="customer-info">
          <img
            src="https://via.placeholder.com/40"
            alt="Customer Avatar"
            className="avatar"
          />
          <div>
            <h2 className="customer-name">{customer?.name || "unknown"}</h2>
            <p className="status">{customer?.ByPhoneNumber}</p>
          </div>
        </div>

        {/* Balance and Menu Icons */}
        <div className="balance-section">
          <h3 className="balance">
            Balance: ₹{balance} <span className="balance-type">({balanceType})</span>
          </h3>

          {/* Menu Icons */}
          <div className="menu-icons">
            <FontAwesomeIcon icon={faPhone} className="icon" />
            {/* <FontAwesomeIcon icon={faVideo} className="icon" /> */}
            <FontAwesomeIcon icon={faEllipsisV} className="icon" />
          </div>
        </div>
      </div>



      {/* <div className="header1">
  <div className="customer-info">
    <h2 className="customer-phone">{customer.ByPhoneNumber}</h2>
  </div>
  <div className="balance-section">
    <h3 className="balance">
      Balance: ₹{balance} <span className="balance-type">({balanceType})</span>
    </h3>
  </div>
</div> */}

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
                          ? 'flex-start'
                          : 'flex-end',
                    marginBottom: '10px',
                  }}
                >
                  {activity.type === 'transaction' ? (
                    <div
                      className="message-bubble"
                      style={{
                        backgroundColor:
                          activity.transactionType === 'receive' ? 'red' : 'green',
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
                          {activity.transactionType === 'receive' ? 'Given' : 'Received'}:
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
                          activity.senderYou === 'You' ? '#007bff' : '#f1f1f1',
                        color: activity.senderYou === 'You' ? 'white' : '#333',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        maxWidth: '60%',
                        textAlign: activity.senderYou === 'You' ? 'left' : 'right',
                        margin: '0 10px',
                      }}
                    >
                      <p style={{ margin: 0 }}>
                        {/* <strong>{activity.sender}:</strong> {activity.message} */}
                        {activity.message}
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
            Receive
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
            Give
          </button>


          <div
            className="active-indicator"
            style={{
              transform:
                activeTab === "Message"
                  ? "translateX(0)"
                  : activeTab === "Give"
                    ? "translateX(100%)"
                    : activeTab === "Receive"
                      ? "translateX(200%)" : "translateX(0)",
            }}
          />
        </div>
      </header>

      {/* Input Section */}

      <div className="input-section" style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#f4f4f8',
        borderRadius: '30px',
        padding: '8px 12px',
        width: '100%',
        gap: '10px',
      }}>

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
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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

        {activeTab === 'Receive' && (
          <div className="transaction-input">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
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
              flexShrink: 0, // Prevents shrinking of the button
            }}
          >
            <FontAwesomeIcon icon={faArrowUp} />
          </button>
        )}


      </div>

      {/* <div className="input-section" style={{ 
  display: 'flex', 
  alignItems: 'center', 
  backgroundColor: '#f4f4f8',
  borderRadius: '30px',
  padding: '8px 12px',
  width: '100%',
  gap: '10px',
}}>
 
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
  
  <button 
    className="send-button" 
    onClick={handleSendMessage}
    style={{
      backgroundColor: '#6c5ce7',
      color: 'white',
      border: 'none',
      borderRadius: '50%',
      width: '40px',
      height: '40px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
    }}
  >
    <FontAwesomeIcon icon={faArrowUp} />
  </button>
</div> */}





      <div ref={transactionsEndRef} />
    </div>
  );
};

export default CustomerTransaction;
