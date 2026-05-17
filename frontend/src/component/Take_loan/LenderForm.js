import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/loans/dynamic/LenderForm.css'; // ✅ Import the CSS

const LenderForm = () => {
  const [lender, setLender] = useState({ 
    name: '', 
    phone: '',
    address: ''
  });
  
  const [formStatus, setFormStatus] = useState({
    name: { value: '', isValid: false },
    phone: { value: '', isValid: false },
    address: { value: '', isValid: true }
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  
  const navigate = useNavigate();
  const location = useLocation();

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // useEffect(() => {
  //   const query = new URLSearchParams(location.search);
  //   const name = query.get('name');
  //   const phone = query.get('phone');

  //   if (name || phone) {
  //     setLender(prev => ({
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
  // }, [location.search]);

  useEffect(() => {
  // Check if contact data was passed via navigation state
  if (location.state?.fromContacts) {
    const { lenderName, lenderPhone } = location.state;
    
    setLender(prev => ({
      ...prev,
      name: lenderName || '',
      phone: lenderPhone || ''
    }));
    
    setFormStatus(prev => ({
      ...prev,
      name: { value: lenderName || '', isValid: !!lenderName },
      phone: { value: lenderPhone || '', isValid: !!lenderPhone }
    }));
  }
  
  // Also check URL query parameters for backward compatibility
  const query = new URLSearchParams(location.search);
  const name = query.get('name');
  const phone = query.get('phone');

  if (name || phone) {
    setLender(prev => ({
      ...prev,
      name: name || prev.name,
      phone: phone || prev.phone
    }));
    setFormStatus(prev => ({
      ...prev,
      name: { value: name || prev.name.value, isValid: !!(name || prev.name.value) },
      phone: { value: phone || prev.phone.value, isValid: !!(phone || prev.phone.value) }
    }));
  }
}, [location.search, location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setLender({ ...lender, [name]: value });
    
    setFormStatus({
      ...formStatus,
      [name]: { 
        value: value, 
        isValid: name === 'address' ? true : value.trim().length > 0
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

      const lenderData = {
        lenderName: lender.name,
        lenderPhone: lender.phone,
        lenderAddress: lender.address || ''
      };

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-lender`,
        lenderData,
        { headers: { 'x-auth-token': token } }
      );

      showMessage('success', response.data.message || 'Lender added successfully');

      const { lenderID } = response.data;

      setLender({ name: '', phone: '', address: '' });
      setFormStatus({
        name: { value: '', isValid: false },
        phone: { value: '', isValid: false },
        address: { value: '', isValid: true }
      });
      
      navigate(`/take_loan_form/${lenderID}`);
    } catch (error) {
      console.error('Error adding lender:', error.response?.data || error.message);
      showMessage('error', error.response?.data?.message || 'Failed to add lender.');
    }
  };

  return (
    <div className="lender_form_container">
      <div className="lender_form_header">
        <button 
          className="lender_form_back_button" 
          onClick={() => navigate(-1)}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 11H7.83L13.42 5.41L12 4L4 12L12 20L13.41 18.59L7.83 13H20V11Z" fill="white"/>
          </svg>
        </button>
        <span className="lender_form_title">Add new lender</span>
      </div>

      <div className="lender_form_content">
        <form onSubmit={handleSubmit}>
          <div className="lender_form_field">
            <div className="lender_form_field_wrapper">
              <div className="lender_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Lender name"
                value={lender.name}
                onChange={handleChange}
                className="lender_form_input"
                required
              />
              {formStatus.name.isValid && (
                <div className="lender_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="lender_form_field">
            <div className="lender_form_field_wrapper">
              <div className="lender_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17.6 9.5H16.4C16.1 9.5 15.9 9.3 15.9 9C15.9 8.7 16.1 8.5 16.4 8.5H17.6C17.9 8.5 18.1 8.7 18.1 9C18.1 9.3 17.9 9.5 17.6 9.5ZM13 9.5H7.4C7.1 9.5 6.9 9.3 6.9 9C6.9 8.7 7.1 8.5 7.4 8.5H13C13.3 8.5 13.5 8.7 13.5 9C13.5 9.3 13.3 9.5 13 9.5ZM17.6 12.5H13.7C13.4 12.5 13.2 12.3 13.2 12C13.2 11.7 13.4 11.5 13.7 11.5H17.6C17.9 11.5 18.1 11.7 18.1 12C18.1 12.3 17.9 12.5 17.6 12.5ZM11.4 12.5H7.4C7.1 12.5 6.9 12.3 6.9 12C6.9 11.7 7.1 11.5 7.4 11.5H11.4C11.7 11.5 11.9 11.7 11.9 12C11.9 12.3 11.7 12.5 11.4 12.5ZM17.6 15.5H15.4C15.1 15.5 14.9 15.3 14.9 15C14.9 14.7 15.1 14.5 15.4 14.5H17.6C17.9 14.5 18.1 14.7 18.1 15C18.1 15.3 17.9 15.5 17.6 15.5ZM13.1 15.5H7.4C7.1 15.5 6.9 15.3 6.9 15C6.9 14.7 7.1 14.5 7.4 14.5H13.1C13.4 14.5 13.6 14.7 13.6 15C13.6 15.3 13.4 15.5 13.1 15.5ZM21 4C21.6 4 22 4.4 22 5V19C22 19.6 21.6 20 21 20H3C2.4 20 2 19.6 2 19V5C2 4.4 2.4 4 3 4H21ZM18.2 13.3C18.3 13.3 18.4 13.2 18.4 13.1V7.6C18.4 7.5 18.3 7.4 18.2 7.4H5.8C5.7 7.4 5.6 7.5 5.6 7.6V16.4C5.6 16.5 5.7 16.6 5.8 16.6H18.2C18.3 16.6 18.4 16.5 18.4 16.4V13.9C18.4 13.8 18.3 13.7 18.2 13.7H18.1C18 13.7 17.9 13.8 17.9 13.9V16H6.1V8H17.9V13.1C17.9 13.2 18 13.3 18.1 13.3H18.2Z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="tel"
                id="phone"
                name="phone"
                placeholder="Lender phone"
                value={lender.phone}
                onChange={handleChange}
                className="lender_form_input"
                required
              />
              {formStatus.phone.isValid && (
                <div className="lender_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="lender_form_field">
            <div className="lender_form_field_wrapper">
              <div className="lender_form_icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#333333"/>
                </svg>
              </div>
              <input
                type="text"
                name="address"
                placeholder="Lender address (optional)"
                value={lender.address}
                onChange={handleChange}
                className="lender_form_input"
              />
              {formStatus.address.isValid && lender.address.trim() && (
                <div className="lender_form_check">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="#4CAF50"/>
                  </svg>
                </div>
              )}
            </div>
          </div>

          <div className="lender_form_add_signature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M19 13H13V19H11V13H5V11H11V5H13V11H19V13Z" fill="#FFFFFF"/>
            </svg>
            <span>Add Signature</span>
          </div>

          <button 
            type="submit" 
            className="lender_form_submit_button"
          >
            Continue
          </button>
        </form>
      </div>

      {message.text && (
        <div className={`lender_form_message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
};

export default LenderForm;