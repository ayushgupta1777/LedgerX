import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Message from '../global/alert';
import '../../style/loans/CustomerForm.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";

const Customer = () => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const navigate = useNavigate();
  const [message, setMessage] = useState({ type: '', text: '' });
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };
  useEffect(() => {
    // Set timeout to remove the message after 5 seconds
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !phoneNumber ) {
      return alert('Name and phone number are required!');
    }

    const newCustomer = { name, phoneNumber  };
// ByPhoneNumber
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/addCustomer`,
        newCustomer,
        { headers: { 'x-auth-token': token } }
      );
      setMessage({ type: 'success', text: 'Successfully add customer' });

      const { customerID } = response.data;

      setName('');
      setPhoneNumber('');
      navigate(`/customer/${customerID}`);
    } catch (error) {
      console.error('Error adding customer:', error.response?.data || error.message);
      alert(error.response?.data?.error || 'Failed to add customer.');
    }
  };

  return (
    <>
    <div className="card-view">
 <nav className="nav-t">
          <a onClick={() => navigate(-1)} className="arrow-t">
          <FontAwesomeIcon icon={faArrowLeftLong} className="arrow-icon-t" />
          Back to Home
          </a>
          <div className="heart-view">chat</div>
        </nav>
</div>
    <div className="form-container">

    <h2 className="form-title">Add Customer</h2>
    <form onSubmit={handleSubmit}>
    <div className="form-row">
    <label htmlFor="name" className="form-label">Name:</label>
      <input
        type="text"
        id="name"
        // placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="form-input"

        required
      />
      </div>
      <div className="form-row">
      <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
      <input
        type="text"
        id="phoneNumber"
        // placeholder="Phone Number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="form-input"

        required
      />
      </div>
      <button type="submit" className="form-button">Add Customer</button>
      <Message type={message.type} text={message.text} />
    </form>
    </div>
</>
  );
};

export default Customer;
