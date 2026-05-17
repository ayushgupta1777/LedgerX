import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import '../../style/loans/CustomerForm.css';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
import Message from '../global/alert';

const CustomerForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [customer, setCustomer] = useState({ FirstName: '', LastName: '', phoneNumber: '' });

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

  useEffect(() => {
    // Check if contact data was passed via navigation state
    if (location.state?.fromContacts) {
      const { customerName, customerPhone } = location.state;
      
      // Split name into first and last name
      const nameParts = (customerName || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setCustomer(prev => ({
        ...prev,
        FirstName: firstName,
        LastName: lastName,
        phoneNumber: customerPhone || ''
      }));
    }
    
    // Also check URL query parameters for backward compatibility
    const query = new URLSearchParams(location.search);
    const name = query.get('name');
    const phone = query.get('phone');

    if (name || phone) {
      const nameParts = (name || '').trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      setCustomer(prev => ({
        ...prev,
        FirstName: firstName || prev.FirstName,
        LastName: lastName || prev.LastName,
        phoneNumber: phone || prev.phoneNumber
      }));
    }
  }, [location.search, location.state]);

  const handleChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      console.log('Token:', token);

      if (!token) {
        return alert('You are not logged in. Please log in to continue.');
      }

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-customer-land`,
        customer,
        { headers: { 'x-auth-token': token } }
      );
      
      setMessage({ type: 'success', text: response.message });

      const { customerID } = response.data;

      setCustomer({ FirstName: '', LastName: '', phoneNumber: '' }); // Reset form
      navigate(`/loan_form/${customerID}`);
    } catch (error) {
      console.error('Error adding customer:', error.response?.data || error.message);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add customer.' });
    }
  };

  return (
    <>
      <nav className="nav-t">
        <a onClick={() => navigate(-1)} className="arrow-t">
          <FontAwesomeIcon icon={faArrowLeftLong} className="arrow-icon-t" />
          Back to Home
        </a>
        <div className="heart-view">AC</div>
      </nav>

      <div className="form-container">
        <h2 className="form-title">Add Customer</h2>
        <form onSubmit={handleSubmit} className="form">
          <div className="form-row">
            <label htmlFor="firstName" className="form-label">First Name:</label>
            <input
              type="text"
              id="name"
              name="FirstName"
              value={customer.FirstName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-row">
            <label htmlFor="lastName" className="form-label">Last Name:</label>
            <input
              type="text"
              id="name"
              name="LastName"
              value={customer.LastName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <div className="form-row">
            <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
            <input
              type="text"
              id="phoneNumber"
              name="phoneNumber"
              value={customer.phoneNumber}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
          
          <button type="submit" className="form-button">
            Next
          </button>
        </form>
      </div>
      <Message type={message.type} text={message.text} />
    </>
  );
};

export default CustomerForm;

// import React, { useState, useEffect } from "react";
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import '../../style/loans/CustomerForm.css';
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faArrowLeftLong } from "@fortawesome/free-solid-svg-icons";
// import Message from '../global/alert';
// const CustomerForm = () => {
//   const [customer, setCustomer] = useState({ FirstName: '', LastName: '', phoneNumber: '' });
// const location = useLocation();
// const navigate = useNavigate();

//   const [message, setMessage] = useState({ type: '', text: '' });
//       const showMessage = (type, text) => {
//           setMessage({ type, text });
//           setTimeout(() => setMessage({ type: '', text: '' }), 3000);
//         };
  
//         useEffect(() => {
//           // Set timeout to remove the message after 5 seconds
//           const timer = setTimeout(() => {
//             setMessage({ type: '', text: '' });
//           }, 3000);
      
//           // Clear the timeout when the component unmounts or when message changes
//           return () => clearTimeout(timer);
//         }, [message]);

//         useEffect(() => {
//   // Check if contact data was passed via navigation state
//   if (location.state?.fromContacts) {
//     const { customerName, customerPhone } = location.state;
    
//     // Split name into first and last name
//     const nameParts = (customerName || '').trim().split(' ');
//     const firstName = nameParts[0] || '';
//     const lastName = nameParts.slice(1).join(' ') || '';
    
//     setCustomer(prev => ({
//       ...prev,
//       FirstName: firstName,
//       LastName: lastName,
//       phoneNumber: customerPhone || ''
//     }));
//   }
  
//   // Also check URL query parameters for backward compatibility
//   const query = new URLSearchParams(location.search);
//   const name = query.get('name');
//   const phone = query.get('phone');

//   if (name || phone) {
//     const nameParts = (name || '').trim().split(' ');
//     const firstName = nameParts[0] || '';
//     const lastName = nameParts.slice(1).join(' ') || '';
    
//     setCustomer(prev => ({
//       ...prev,
//       FirstName: firstName || prev.FirstName,
//       LastName: lastName || prev.LastName,
//       phoneNumber: phone || prev.phoneNumber
//     }));
//   }
// }, [location.search, location.state]);

//   // navigate('/loan-form');
//   const handleChange = (e) => {
//     setCustomer({ ...customer, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async(e) => {
//     e.preventDefault();
//     try {
//         const token = localStorage.getItem('token');
//         console.log('Token:', token);
  
//         if (!token) {
//           return alert('You are not logged in. Please log in to continue.');
//         }
  
//         const response = await axios.post(
//           `${process.env.REACT_APP_API_BASE_URL}/add-customer-land',
//           customer,
//           { headers: { 'x-auth-token': token } }
//         );
//         // setMessage({ type: 'success', text: 'Successfully add customer' });
//         setMessage({ type: 'success', text: response.message });

  
//         const { customerID } = response.data;
  
//         setCustomer({ FirstName: '', LastName: '', phoneNumber: '' }); // Reset form
//         navigate(`/loan_form/${customerID}`);
//       } catch (error) {
//         console.error('Error adding customer:', error.response?.data || error.message);
//         // alert(error.response?.data?.error || 'Failed to add customer.');
//         setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to add customer.' });
//       }
//   };

//   return (
//     <>
//     <nav className="nav-t">
//           <a onClick={() => navigate(-1)} className="arrow-t">
//           <FontAwesomeIcon icon={faArrowLeftLong} className="arrow-icon-t" />
//           Back to Home
//           </a>
//           <div className="heart-view">AC</div>
//         </nav>

//     <div className="form-container">
//       <h2 className="form-title">Add Customer</h2>
//       <form onSubmit={handleSubmit} className="form">
//       <div className="form-row">
//           <label htmlFor="firstName" className="form-label">First Name:</label>
//           <input
//             type="text"
//             id="name"
//             name="FirstName"
//             value={customer.FirstName}
//             onChange={handleChange}
//             className="form-input"
//             required
//           />
//         </div>

//         <div className="form-row">
//           <label htmlFor="lastName" className="form-label">Last Name:</label>
//           <input
//             type="text"
//             id="name"
//             name="LastName"
//             value={customer.LastName}
//             onChange={handleChange}
//             className="form-input"
//             required
//           />
//         </div>
//         <div className="form-row">
//           <label htmlFor="phoneNumber" className="form-label">Phone Number:</label>
//           <input
//             type="text"
//             id="phoneNumber"
//             name="phoneNumber"
//             value={customer.phoneNumber}
//             onChange={handleChange}
//             className="form-input"
//             required
//           />
//         </div>
//         <button type="submit" className="form-button">
//           Next
//         </button>
//       </form>
//     </div>
//     <Message type={message.type} text={message.text} />

//     </>
//   );
// };

// export default CustomerForm;