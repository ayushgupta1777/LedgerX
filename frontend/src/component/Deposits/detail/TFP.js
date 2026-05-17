import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; 
import dayjs from 'dayjs';

const CustomerTransaction = ({ customers }) => {
  const { supplierID } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null); // Store the customer data
  const [transactions, setTransactions] = useState([ ]);
  const [loading, setLoading] = useState(true); // Manage loading state
  const [transactionType, setTransactionType] = useState(''); 
  const [amount, setAmount] = useState('');
  const transactionsEndRef = useRef(null);
  const [transactionKey, setTransactionKey] = useState(0); // Added key to force re-render
  const [balance, setBalance] = useState(0); 
  const [balanceType, setBalanceType] = useState('Advance');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const token = localStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/supplier/${supplierID}`,
          { headers: { 'x-auth-token': token } });
        setCustomer(response.data);

        // Fetch transaction data 
        const transactionResponse = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/transactions_s/${supplierID}`, { 
          headers: { 'x-auth-token': token }, });
          console.log('Transaction Response Data:', transactionResponse.data); // Log the transaction data 
          // setTransactions(Array.isArray(transactionResponse.data) ? transactionResponse.data : [transactionResponse.data]);
          const transactionsData = Array.isArray(transactionResponse.data) ? transactionResponse.data : [transactionResponse.data]; setTransactions(transactionsData);
        // Calculate initial balance 
        let initialBalance = 0; 
        transactionsData.forEach(txn => { 
          initialBalance += txn.transactionType === 'receive' ? txn.amount : -txn.amount; }); 
          setBalance(Math.abs(initialBalance)); 
          setBalanceType(initialBalance >= 0 ? 'Advance' : 'Due');


          //  const chatResponse = await axios.get(
          //             `${process.env.REACT_APP_API_BASE_URL}/chat/${supplierID}`,
          //             { headers: { 'x-auth-token': token } }
          //           );
          //           setChatMessages(chatResponse.data);
        } catch (error) {
        console.error('Failed to fetch customer:', error.response?.data || error.message);
      } finally {
        setLoading(false);
        scrollToBottom();
      }
    };
    fetchCustomer();
  
  }, [supplierID, transactionKey]);

    // const handleSendMessage = async () => {
    //   if (!chatInput.trim()) {
    //     alert('Message cannot be empty!');
    //     return;
    //   }
    
    //   try {
    //     const token = localStorage.getItem('token');
    //     const newMessage = {
    //       customerID:supplierID,
    //       message: chatInput.trim(),
    //       receiver:customer.phoneNumber,
    //       senderYou: 'You',  //Replace with actual sender if applicable
    //       timestamp: new Date(),
    //     };
    
    //     // Save message to server
    //     const response = await axios.post(
    //       `${process.env.REACT_APP_API_BASE_URL}/chat`,
    //       newMessage,
    //       { headers: { 'x-auth-token': token } }
    //     );
    
    //     // Update chat messages
    //     setChatMessages((prevMessages) => [...prevMessages, response.data]);
    //     setChatInput('');
    //     scrollToBottom();
    //   } catch (error) {
    //     console.error('Failed to send message:', error.response?.data || error.message);
    //   }
    // };

  const handleTransaction = async () => {
    if (amount && transactionType) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/transactions`, {
          supplierID,
          transactionType,
          amount: parseFloat(amount),
          receiver:customer.phoneNumber,
        }
        ,{ headers: { 'x-auth-token': token } });
        setTransactions((prevTransactions) => [...prevTransactions, response.data]);
        setTransactionKey(transactionKey + 1); // Update key to force re-render
        alert(`${transactionType} transaction of ₹${amount} added!`);

        setAmount('');
        setTransactionType('');
        // navigate(`/customer/${customerID}`);
        scrollToBottom();
      } catch (error) {
        console.error('Transaction failed:', error.response.data);
        alert('Failed to add transaction.');
      }
    } else {
      alert('Please select transaction type and enter an amount.');
    }
  };
  const scrollToBottom = () => { transactionsEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };
  const formatDate = (date) => { const today = dayjs().startOf('day'); const yesterday = dayjs().subtract(1, 'day').startOf('day'); const transactionDate = dayjs(date).startOf('day'); if (transactionDate.isSame(today)) { return 'Today'; } else if (transactionDate.isSame(yesterday)) { return 'Yesterday'; } else { return dayjs(date).format('DD MMM YYYY'); } }; 
    const checkNewDay = (txn, prevTxn) => { 
      return dayjs(txn.date).format('DD MMM YYYY') !== dayjs(prevTxn.date).format('DD MMM YYYY'); };
      const formatTime = (date) => { return dayjs(date).format('h:mm A'); };
  if (loading) {
    return <p>Loading customer...</p>;
  }

  if (!customer) {
    return <p>Customer not found!</p>;
  }

  return (
    <div>
      {/* <h1>{customer.name} - {customer.phoneNumber}</h1> */}
      {customer.name && customer.phoneNumber ? (
        <div style={{ position: 'fixed', top: 0, width: '100%', backgroundColor: 'white', padding: '10px 0', zIndex: 1000 }}> <h1>{customer.name} - {customer.phoneNumber}</h1> </div>
                  ) : (
                     <p>No postal code available</p>
                   )}
                     {transactionType && ( 
                      <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', backgroundColor: 'white', padding: '20px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', zIndex: 1001, borderRadius: '10px' }}> 
                      <h3>
                        {transactionType === 'receive' ? 'Enter Amount to Receive' : 'Enter Amount to Give'}</h3> 
                        <input type="number" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} style={{ padding: '10px', margin: '10px 0', width: '100%' }} /> 
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                           <button onClick={handleTransaction} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white' }}> 
                            Confirm </button> 
                            <button onClick={() => { setTransactionType(''); setAmount(''); }} style={{ padding: '10px 20px', backgroundColor: 'red', color: 'white' }}> Cancel </button> 
                            </div> 
                            </div> 
                          )}
                   
   <div style={{ marginTop: '20px' }}> 
   <h3>Transactions</h3> 
   <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>   
    
   {transactions.map((txn, index) => (
  <React.Fragment key={index}>
    {index === 0 || checkNewDay(txn, transactions[index - 1]) ? (
      <div style={{ textAlign: 'center', margin: '10px 0', color: 'grey' }}>
        {formatDate(txn.date)}
      </div>
    ) : null}
    <div
      style={{
        alignSelf: txn.transactionType === 'receive' ? 'flex-start' : 'flex-end',
        backgroundColor: txn.transactionType === 'receive' ? 'lightgreen' : 'lightcoral',
        padding: '10px',
        borderRadius: '10px',
        maxWidth: '60%',
        marginLeft: '30px',
        marginRight: '30px'
      }}
    >
      <p>{txn.transactionType === 'receive' ? 'Received' : 'Given'}: ₹{txn.amount}</p>
      <p style={{ fontSize: '0.8em', color: 'gray' }}>{formatTime(txn.date)}</p>
    </div>
  </React.Fragment>
))}

    <div ref={transactionsEndRef} />
   </div> 
   </div>  

      <div style={{ display: 'fix', justifyContent: 'space-around', margin: '20px  0px',  }}>
        <button 
          style={{
            backgroundColor: transactionType === 'receive' ? 'green' : 'lightgray',
            color: 'white',
            padding: '10px 20px',
          }}
          onClick={() => setTransactionType('receive')}
        >
          Receive
        </button>
        <button
          style={{
            backgroundColor: transactionType === 'give' ? 'red' : 'lightgray',
            color: 'white',
            padding: '10px 20px',
          }}
          onClick={() => setTransactionType('give')}
        >
          Give
        </button>
      </div>
      <div style={{ position: 'flex', bottom: 0, width: '100%', backgroundColor: 'white', padding: '10px 0', zIndex: 1000, borderTop: '1px solid #ddd', textAlign: 'center' }}> <h3>{balanceType} Balance: ₹{balance}</h3> </div>

<div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #ddd', padding: '10px' }}>
  {/* {chatMessages.map((msg, index) => (
    <div key={index} style={{ textAlign: msg.senderYou === 'You' ? 'right' : 'left' }}>
      <p
        style={{
          display: 'inline-block',
          padding: '10px',
          backgroundColor: msg.sender === 'You' ? 'lightblue' : 'lightgray',
          borderRadius: '10px',
          marginBottom: '5px',
        }}
      >
        {msg.message}
      </p>
      <div style={{ fontSize: '0.8em', color: 'gray' }}>{dayjs(msg.timestamp).format('h:mm A')}</div>
    </div>
  ))}
  <div ref={transactionsEndRef} />
</div>


      <div style={{ display: 'flex', marginTop: '10px' }}>
  <input
    type="text"
    value={chatInput}
    onChange={(e) => setChatInput(e.target.value)}
    placeholder="Type a message..."
    style={{ flex: 1, padding: '10px', marginRight: '10px' }}
  />
  <button onClick={handleSendMessage} style={{ padding: '10px 20px', backgroundColor: 'blue', color: 'white' }}>
    Send
  </button>*/}
</div> 


   </div> 
   ); }; 
   
   export default CustomerTransaction;



