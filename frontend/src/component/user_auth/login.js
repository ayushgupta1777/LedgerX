import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faFacebook, 
  faTwitter, 
  faGoogle 
} from "@fortawesome/free-brands-svg-icons";
import { 
  faUser, 
  faLock, 
  faPlus, 
  faEllipsisVertical,
  faUserPlus,
  faGear,
  faMagnifyingGlass,
  faUserTie,
  faCheckCircle,
  faCircleExclamation,
  faXmark
} from "@fortawesome/free-solid-svg-icons";

import "../../style/user_auth/Login.css";

const Login = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isPlusMenuOpen, setIsPlusMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCustomerSelectOpen, setIsCustomerSelectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const dropdownRef = useRef(null);
  const plusMenuRef = useRef(null);
  const threeDotRef = useRef(null);
  const plusBtnRef = useRef(null);

  // Sample customer data
  const customers = [
    // { id: 1, name: "John Doe", email: "john.doe@example.com" },
    // { id: 2, name: "Sarah Smith", email: "sarah.smith@example.com" },
    // { id: 3, name: "Michael Johnson", email: "michael@example.com" },
    // { id: 4, name: "Emily Davis", email: "emily@example.com" },
    // { id: 5, name: "Robert Wilson", email: "robert@example.com" },
    // { id: 6, name: "Jennifer Brown", email: "jennifer@example.com" },
    // { id: 7, name: "David Miller", email: "david@example.com" },
    // { id: 8, name: "Lisa Taylor", email: "lisa@example.com" }
  ];

  // Filter customers based on search term
  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          !threeDotRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
      
      if (plusMenuRef.current && !plusMenuRef.current.contains(event.target) && 
          !plusBtnRef.current.contains(event.target)) {
        setIsPlusMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Message timer
  useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare login data
    const loginData = {
      mobileNumber,
      password
    };

    try {
      // For demo purposes, simulate a successful login
      // In production, you would make an actual API call
      
      if (mobileNumber && password.length >= 6) {
        // Simulate successful login
        localStorage.setItem('token', 'demo-token-xyz');
        showMessage('success', 'Login successful!');
        setTimeout(() => {
          setIsLoggedIn(true);
          navigate('/');
        }, 1000);
      } else {
        // Simulate failed login
        showMessage('error', 'Invalid mobile number or password');
      }
      
      /* Uncomment for actual API integration */
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      if (response.ok) {
        const responseData = await response.json();
        const token = responseData.token;
        if (token) {
          localStorage.setItem('token', token);
          showMessage('success', 'Login successful!');
          setTimeout(() => {
            setIsLoggedIn(true);
            navigate('/');
          }, 1000);
        } else {
          showMessage('error', 'Token not found in response');
        }
      } else {
        const responseData = await response.json();
        showMessage('error', responseData.message || 'Login failed');
      }
     
      
    } catch (error) {
      console.error('Error during login:', error);
      showMessage('error', 'Error during login');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    showMessage('success', 'Logged out successfully');
  };

  const togglePlusMenu = () => {
    setIsPlusMenuOpen(!isPlusMenuOpen);
    if (isDropdownOpen) setIsDropdownOpen(false);
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (isPlusMenuOpen) setIsPlusMenuOpen(false);
  };

  const openCustomerSelect = () => {
    setIsCustomerSelectOpen(true);
    setIsPlusMenuOpen(false);
  };

  const closeCustomerSelect = () => {
    setIsCustomerSelectOpen(false);
  };

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer);
    setTimeout(() => {
      setIsCustomerSelectOpen(false);
      showMessage('success', `Selected customer: ${customer.name}`);
    }, 300);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="login__container">
      <div className="login__card">
        {/* Three Dot Menu */}
        <div className="login__three-dots" onClick={toggleDropdown} ref={threeDotRef}>
          <FontAwesomeIcon icon={faEllipsisVertical} className="login__dots-icon" />
        </div>
        
        {/* Dropdown Menu */}
        <div className={`login__dropdown ${isDropdownOpen ? 'active' : ''}`} ref={dropdownRef}>
        <a href="/signup" className="login__signup-link">
          <div className="login__dropdown-item">
            <FontAwesomeIcon icon={faUserPlus} className="login__dropdown-icon" />
            Register
          </div>
        </a>
          <div className="login__dropdown-item">
            <FontAwesomeIcon icon={faGear} className="login__dropdown-icon" />
            Settings
          </div>
        </div>

        <div className="login__header">
          <h1 className="login__title">Welcome Back</h1>
          <p className="login__subtitle">Please enter your login details below</p>
        </div>
        
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <FontAwesomeIcon icon={faUser} className="login__input-icon" />
            <input
              className="login__input"
              type="text"
              placeholder="Mobile Number"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>
          
          <div className="login__field">
            <FontAwesomeIcon icon={faLock} className="login__input-icon" />
            <input
              className="login__input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="login__forgot">
            <a href="/forgot-password" className="login__forgot-link">Forgot Password?</a>
          </div>
          
          <button type="submit" className="login__button">
            Login
          </button>
        </form>
        
        <div className="login__divider">
          <div className="login__divider-line"></div>
          <span className="login__divider-text">Or Sign In With</span>
          <div className="login__divider-line"></div>
        </div>
        
        <div className="login__social">
          <button className="login__social-btn">
            <FontAwesomeIcon icon={faFacebook} className="login__social-icon facebook" />
          </button>
          <button className="login__social-btn">
            <FontAwesomeIcon icon={faTwitter} className="login__social-icon twitter" />
          </button>
          <button className="login__social-btn">
            <FontAwesomeIcon icon={faGoogle} className="login__social-icon google" />
          </button>
        </div>
        
        <div className="login__signup">
          Don't have an account? <a href="/signup" className="login__signup-link">Sign Up</a>
        </div>
      </div>
      
      {/* Plus Button */}
      <div className="login__plus-btn" onClick={togglePlusMenu} ref={plusBtnRef}>
        <FontAwesomeIcon icon={faPlus} className="login__plus-icon" />
      </div>
      
      {/* Plus Menu Options */}
      <div className={`login__plus-menu ${isPlusMenuOpen ? 'active' : ''}`} ref={plusMenuRef}>
        <div className="login__plus-option" onClick={openCustomerSelect}>
          <span className="login__plus-option-text">Select Customer</span>
          <FontAwesomeIcon icon={faUserTie} className="login__plus-option-icon" />
        </div>
        <div className="login__plus-option">
          <span className="login__plus-option-text">Settings</span>
          <FontAwesomeIcon icon={faGear} className="login__plus-option-icon" />
        </div>
      </div>
      
      {/* Customer Selection Modal */}
      <div className={`login__customer-select ${isCustomerSelectOpen ? 'active' : ''}`}>
        <div className="login__customer-card">
          <div className="login__customer-header">
            <div className="login__customer-title">Select Customer</div>
            <div className="login__customer-close" onClick={closeCustomerSelect}>
              <FontAwesomeIcon icon={faXmark} />
            </div>
          </div>
          
          <div className="login__customer-search">
            <FontAwesomeIcon icon={faMagnifyingGlass} className="login__search-icon" />
            <input
              type="text"
              className="login__search-input"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="login__customer-list">
            {filteredCustomers.map(customer => (
              <div 
                key={customer.id} 
                className="login__customer-item"
                onClick={() => selectCustomer(customer)}
              >
                <div className="login__customer-avatar">
                  {getInitials(customer.name)}
                </div>
                <div className="login__customer-info">
                  <div className="login__customer-name">{customer.name}</div>
                  <div className="login__customer-email">{customer.email}</div>
                </div>
                {selectedCustomer && selectedCustomer.id === customer.id && (
                  <FontAwesomeIcon icon={faCheckCircle} className="login__customer-selected" />
                )}
              </div>
            ))}
            
            {filteredCustomers.length === 0 && (
              <div style={{ padding: "20px", textAlign: "center", color: "#777" }}>
                No customers found
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Custom Alert */}
      <div className={`login__alert ${message.type} ${message.text ? 'active' : ''}`}>
        <FontAwesomeIcon 
          icon={message.type === 'success' ? faCheckCircle : faCircleExclamation} 
          className={`login__alert-icon ${message.success}`} 
        />
        <span className={`login__alert-message ${message.type}`}>{message.text}</span>
      </div>
    </div>
  );
};

export default Login;