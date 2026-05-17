import React, { useState, useEffect } from "react";
import { useNavigate,useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/home/CustomerForm.css';




const CustomerForm = () => {
  const [customer, setCustomer] = useState({ 
    name: '', 
    phone: '',
    address: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    name: { value: '', isValid: false },
    phone: { value: '', isValid: false },
    address: { value: '',  }
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
const location = useLocation();
  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    // Set timeout to remove the message after 3 seconds
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);

  // useEffect(() => {
  //   const query = new URLSearchParams(location.search);
  //   const name = query.get('name');
  //   const phone = query.get('phone');
  
  //   if (name || phone) {
  //     setCustomer(prev => ({
  //       ...prev,
  //       name: name || '',
  //       phone: phone || ''
  //     }));
  //     setFormStatus(prev => ({
  //       ...prev,
  //       name: { value: name || '', isValid: !!name },
  //       phone: { value: phone || '', isValid: !!phone }
  //     }));
  //   }
  // }, []);
  
  
useEffect(() => {
  // Check if contact data was passed via navigation state
  if (location.state?.fromContacts) {
    const { customerName, customerPhone } = location.state;
    
    setCustomer(prev => ({
      ...prev,
      name: customerName || '',
      phone: customerPhone || ''
    }));
    
    setFormStatus(prev => ({
      ...prev,
      name: { value: customerName || '', isValid: !!customerName },
      phone: { value: customerPhone || '', isValid: !!customerPhone }
    }));
  }
  
  // Also check URL query parameters for backward compatibility
  const query = new URLSearchParams(location.search);
  const name = query.get('name');
  const phone = query.get('phone');

  if (name || phone) {
    setCustomer(prev => ({
      ...prev,
      name: name || prev.name,
      phone: phone || prev.phone
    }));
    
    setFormStatus(prev => ({
      ...prev,
      name: { value: name || prev.name, isValid: !!(name || prev.name) },
      phone: { value: phone || prev.phone, isValid: !!(phone || prev.phone) }
    }));
  }
}, [location.search, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update customer state
    setCustomer({ ...customer, [name]: value });
    
    // Update form status
    setFormStatus({
      ...formStatus,
      [name]: { 
        value: value, 
        isValid: value.trim().length > 0 
      }
    });
  };


  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return showMessage('error', 'You are not logged in. Please log in to continue.');
      }

      

      // Format data to match backend expectations
      const customerData = {
        FirstName: customer.name.split(' ')[0] || '',
        LastName: customer.name.split(' ').slice(1).join(' ') || '',
        phoneNumber: customer.phone,
        address: customer.address
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-customer-land`,
        customerData,
        { headers: { 'x-auth-token': token } }
      );

      showMessage('success', response.data.message || 'Customer added successfully');

      const { customerID } = response.data;

      // Reset form
      setCustomer({ name: '', phone: '', address: '' });
      setFormStatus({
        name: { value: '', isValid: false },
        phone: { value: '', isValid: false },
        address: { value: '', isValid: false }
      });
      
      // Navigate to loan form with customer ID
      navigate(`/loan_form/${customerID}`);
    } catch (error) {
      console.error('Error adding customer:', error.response?.data || error.message);
      showMessage('error', error.response?.data?.message || 'Failed to add customer.');
    }
  };

  return (
    <div className="customer_form_container">
      <div className="customer_form_header">
        <button 
          className="customer_form_back_button" 
          onClick={() => navigate(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="white"/>
          </svg>
        </button>
        <span className="customer_form_title">Add new customer</span>
      </div>

      <div className="customer_form_content">
        <form onSubmit={handleSubmit}>
          <div className="customer_form_field">
            <div className="customer_form_field_wrapper">
              <div className="customer_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Customer name"
                value={customer.name}
                onChange={handleChange}
                className="customer_form_input"
                required
              />
              {formStatus.name.isValid && (
                <div className="customer_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="customer_form_field">
            <div className="customer_form_field_wrapper">
              <div className="customer_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17.6 9.5H16.4C16.1 9.5 15.9 9.3 15.9 9C15.9 8.7 16.1 8.5 16.4 8.5H17.6C17.9 8.5 18.1 8.7 18.1 9C18.1 9.3 17.9 9.5 17.6 9.5ZM13 9.5H7.4C7.1 9.5 6.9 9.3 6.9 9C6.9 8.7 7.1 8.5 7.4 8.5H13C13.3 8.5 13.5 8.7 13.5 9C13.5 9.3 13.3 9.5 13 9.5ZM17.6 12.5H13.7C13.4 12.5 13.2 12.3 13.2 12C13.2 11.7 13.4 11.5 13.7 11.5H17.6C17.9 11.5 18.1 11.7 18.1 12C18.1 12.3 17.9 12.5 17.6 12.5ZM11.4 12.5H7.4C7.1 12.5 6.9 12.3 6.9 12C6.9 11.7 7.1 11.5 7.4 11.5H11.4C11.7 11.5 11.9 11.7 11.9 12C11.9 12.3 11.7 12.5 11.4 12.5ZM17.6 15.5H15.4C15.1 15.5 14.9 15.3 14.9 15C14.9 14.7 15.1 14.5 15.4 14.5H17.6C17.9 14.5 18.1 14.7 18.1 15C18.1 15.3 17.9 15.5 17.6 15.5ZM13.1 15.5H7.4C7.1 15.5 6.9 15.3 6.9 15C6.9 14.7 7.1 14.5 7.4 14.5H13.1C13.4 14.5 13.6 14.7 13.6 15C13.6 15.3 13.4 15.5 13.1 15.5ZM21 4C21.6 4 22 4.4 22 5V19C22 19.6 21.6 20 21 20H3C2.4 20 2 19.6 2 19V5C2 4.4 2.4 4 3 4H21ZM18.2 13.3C18.3 13.3 18.4 13.2 18.4 13.1V7.6C18.4 7.5 18.3 7.4 18.2 7.4H5.8C5.7 7.4 5.6 7.5 5.6 7.6V16.4C5.6 16.5 5.7 16.6 5.8 16.6H18.2C18.3 16.6 18.4 16.5 18.4 16.4V13.9C18.4 13.8 18.3 13.7 18.2 13.7H18.1C18 13.7 17.9 13.8 17.9 13.9V16H6.1V8H17.9V13.1C17.9 13.2 18 13.3 18.1 13.3H18.2Z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Customer phone"
                value={customer.phone}
                onChange={handleChange}
                className="customer_form_input"
                required
              />
              {formStatus.phone.isValid && (
                <div className="customer_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="customer_form_field">
            <div className="customer_form_field_wrapper">
              <div className="customer_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 7V3H2V21H22V7H12ZM6 19H4V17H6V19ZM6 15H4V13H6V15ZM6 11H4V9H6V11ZM6 7H4V5H6V7ZM10 19H8V17H10V19ZM10 15H8V13H10V15ZM10 11H8V9H10V11ZM10 7H8V5H10V7ZM20 19H12V17H14V15H12V13H14V11H12V9H20V19ZM18 11H16V13H18V11ZM18 15H16V17H18V15Z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="text"
                id="address"
                name="address"
                placeholder="Customer address"
                value={customer.address}
                onChange={handleChange}
                className="customer_form_input"
                
              />
              {formStatus.address.isValid && (
                <div className="customer_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="customer_form_add_signature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#5434B0"/>
            </svg>
            <span>Add Signature</span>
          </div>

          <button 
            type="submit" 
            className="customer_form_submit_button"
          >
            Continue
          </button>
        </form>
      </div>

      {message.text && (
        <div className={`customer_form_message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default CustomerForm;