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
  faEllipsisVertical,
  faUserPlus,
  faGear,
  faCheckCircle,
  faCircleExclamation,
  faEnvelope,
  faPhone
} from "@fortawesome/free-solid-svg-icons";
import Message from '../global/alert';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from "jwt-decode";
import "../../style/user_auth/Login.css";
import "../../style/user_auth/Google_login.css";
import CompanyWatermark from '../global/water-mark/CompanyWatermark';

const Login = () => {
  const navigate = useNavigate();
  const [loginIdentifier, setLoginIdentifier] = useState(""); // Can be email or phone
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [loginType, setLoginType] = useState('phone'); // 'phone' or 'email'
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef(null);
  const threeDotRef = useRef(null);

  // Detect if input is email or phone
  useEffect(() => {
    if (loginIdentifier.includes('@')) {
      setLoginType('email');
    } else {
      setLoginType('phone');
    }
  }, [loginIdentifier]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          threeDotRef.current && !threeDotRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // Handle Login with Phone/Email
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Determine if login is with email or phone
    const isEmail = loginIdentifier.includes('@');
    
    const loginData = isEmail 
      ? { email: loginIdentifier, password }
      : { mobileNumber: loginIdentifier, password };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
      });
      
      const responseData = await response.json();
      
      if (response.ok) {
        const token = responseData.token;
        
        if (token) {
          localStorage.setItem('token', token);
          showMessage('success', 'Login successful!');
          setTimeout(() => {
            navigate('/');
          }, 1000);
        } else {
          showMessage('error', 'Token not found in response');
        }
      } else {
        showMessage('error', responseData.message || 'Login failed');
      }
      
    } catch (error) {
      console.error('Error during login:', error);
      showMessage('error', 'Error during login: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Google Login (Only for existing users)
  const handleGoogleLogin = async (credential) => {
    try {
      setIsLoading(true);
      const userInfo = jwtDecode(credential);
      console.log("Decoded Google User:", userInfo);
      
      // Send to backend - backend will check if email exists
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token: credential,
          email: userInfo.email
        }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('token', data.token);
        showMessage('success', 'Login successful');
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        showMessage('error', data.error || "Google login failed. Please ensure you have an account.");
      }
    } catch (err) {
      showMessage('error', 'Google login error');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
          <p className="login__subtitle">Login with Email or Phone Number</p>
        </div>
        
        <form className="login__form" onSubmit={handleSubmit}>
          <div className="login__field">
            <FontAwesomeIcon 
              icon={loginType === 'email' ? faEnvelope : faPhone} 
              className="login__input-icon" 
            />
            <input
              className="login__input"
              type="text"
              placeholder="Email or Mobile Number"
              value={loginIdentifier}
              onChange={(e) => setLoginIdentifier(e.target.value)}
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
          
          <button type="submit" className="login__button" disabled={isLoading}>
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        
        <div className="login__divider">
          <div className="login__divider-line"></div>
          <span className="login__divider-text">Or Sign In With</span>
          <div className="login__divider-line"></div>
        </div>
        
        {/* <div className="login__social">
          <button className="login__social-btn">
            <FontAwesomeIcon icon={faFacebook} className="login__social-icon facebook" />
          </button>
          <button className="login__social-btn">
            <FontAwesomeIcon icon={faTwitter} className="login__social-icon twitter" />
          </button>
          <button className="login__social-btn">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                handleGoogleLogin(credentialResponse.credential);
              }}
              onError={() => {
                showMessage('error', 'Google login failed');
              }}
              size="large"
              type="icon"
              shape="circle"
              text="signin_with"
            />
          </button>
        </div> */}
        
        <div className="login__signup">
          Don't have an account? <a href="/signup" className="login__signup-link">Sign Up</a>
        </div>
      </div>
      
      {/* Custom Alert */}
      <div className={`login__alert ${message.type} ${message.text ? 'active' : ''}`}>
        <FontAwesomeIcon 
          icon={message.type === 'success' ? faCheckCircle : faCircleExclamation} 
          className="login__alert-icon" 
        />
        <span className="login__alert-message">{message.text}</span>
      </div>
      <Message type={message.type} text={message.text} />

            {/* ADD WATERMARK HERE - At the bottom of login container */}
    <CompanyWatermark companyName="Adsngrow" companyUrl="https://adsngrow.in" />

    </div>
  );
};

export default Login;