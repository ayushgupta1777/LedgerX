import React, { useState, useEffect } from 'react';
import '../../style/user_auth/profile.css';
import axios from 'axios';
import LoadingPage from '../global/Loading';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faPhone, 
  faIdCard, 
  faEdit,
  faSignOutAlt,
  faTimes,
  faCheck,
  faUserCircle
} from '@fortawesome/free-solid-svg-icons';
import Bottom_manu from '../global/bottom_manu';
import Message from '../global/alert';

const LedgerXProfile = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobileNumber: ''
  });

  const isMobile = window.innerWidth < 768;

  const showMessage = (type, text) => {
    setMessage({ type, text });
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/user-profile`, {
            headers: { 'x-auth-token': token },
          });
          setUser(response.data);
          setFormData({
            firstName: response.data.firstName || '',
            lastName: response.data.lastName || '',
            email: response.data.email || '',
            mobileNumber: response.data.mobileNumber || ''
          });
          setIsLoading(false);
        }
      } catch (error) {
        showMessage('error', 'Failed to load user data');
        console.error('User data fetch failed:', error);
        setIsLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditToggle = () => {
    if (isEditMode) {
      // Reset form data if canceling
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || ''
      });
    }
    setIsEditMode(!isEditMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const response = await axios.put(
          `${process.env.REACT_APP_API_BASE_URL}/user/update`,
          formData,
          { headers: { 'x-auth-token': token } }
        );
        setUser(response.data);
        setIsEditMode(false);
        showMessage('success', 'Profile updated successfully');
      }
    } catch (error) {
      showMessage('error', 'Failed to update profile');
      console.error('Update failed:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    showMessage('success', 'Logged out successfully');
    setTimeout(() => {
      window.location.href = '/login';
    }, 1000);
  };

  if (isLoading) {
    return <LoadingPage />;
  }

  if (!user) {
    return <div className="lx-profile-error">Unable to load profile</div>;
  }

  return (
    <>
      <div className="lx-profile-container">
        <div className="lx-profile-wrapper">
          {/* Profile Header */}
          <div className="lx-profile-header">
            <div className="lx-profile-avatar-section">
              <div className="lx-profile-avatar">
                <FontAwesomeIcon icon={faUserCircle} className="lx-avatar-icon" />
              </div>
              <div className="lx-profile-name-section">
                <h1 className="lx-profile-name">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="lx-profile-id">ID: {user.userId}</p>
              </div>
            </div>
            <div className="lx-profile-actions">
              <button 
                className="lx-btn-edit" 
                onClick={handleEditToggle}
                title={isEditMode ? 'Cancel' : 'Edit Profile'}
              >
                <FontAwesomeIcon icon={isEditMode ? faTimes : faEdit} />
                {!isMobile && <span>{isEditMode ? 'Cancel' : 'Edit'}</span>}
              </button>
              <button 
                className="lx-btn-logout" 
                onClick={() => setShowLogoutModal(true)}
                title="Logout"
              >
                <FontAwesomeIcon icon={faSignOutAlt} />
                {!isMobile && <span>Logout</span>}
              </button>
            </div>
          </div>

          {/* Profile Content */}
          <div className="lx-profile-content">
            {!isEditMode ? (
              // View Mode
              <div className="lx-profile-info-grid">
                <div className="lx-info-card">
                  <div className="lx-info-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="lx-info-details">
                    <label className="lx-info-label">First Name</label>
                    <p className="lx-info-value">{user.firstName}</p>
                  </div>
                </div>

                <div className="lx-info-card">
                  <div className="lx-info-icon">
                    <FontAwesomeIcon icon={faUser} />
                  </div>
                  <div className="lx-info-details">
                    <label className="lx-info-label">Last Name</label>
                    <p className="lx-info-value">{user.lastName}</p>
                  </div>
                </div>

                <div className="lx-info-card">
                  <div className="lx-info-icon">
                    <FontAwesomeIcon icon={faEnvelope} />
                  </div>
                  <div className="lx-info-details">
                    <label className="lx-info-label">Email</label>
                    <p className="lx-info-value">{user.email}</p>
                  </div>
                </div>

                <div className="lx-info-card">
                  <div className="lx-info-icon">
                    <FontAwesomeIcon icon={faPhone} />
                  </div>
                  <div className="lx-info-details">
                    <label className="lx-info-label">Mobile Number</label>
                    <p className="lx-info-value">{user.mobileNumber}</p>
                  </div>
                </div>

                <div className="lx-info-card">
                  <div className="lx-info-icon">
                    <FontAwesomeIcon icon={faIdCard} />
                  </div>
                  <div className="lx-info-details">
                    <label className="lx-info-label">User ID</label>
                    <p className="lx-info-value">{user.userId}</p>
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit} className="lx-profile-edit-form">
                <div className="lx-form-group">
                  <label className="lx-form-label">
                    <FontAwesomeIcon icon={faUser} className="lx-label-icon" />
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="lx-form-input"
                    required
                  />
                </div>

                <div className="lx-form-group">
                  <label className="lx-form-label">
                    <FontAwesomeIcon icon={faUser} className="lx-label-icon" />
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="lx-form-input"
                    required
                  />
                </div>

                <div className="lx-form-group">
                  <label className="lx-form-label">
                    <FontAwesomeIcon icon={faEnvelope} className="lx-label-icon" />
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="lx-form-input"
                    required
                  />
                </div>

                <div className="lx-form-group">
                  <label className="lx-form-label">
                    <FontAwesomeIcon icon={faPhone} className="lx-label-icon" />
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={formData.mobileNumber}
                    onChange={handleInputChange}
                    className="lx-form-input"
                    required
                  />
                </div>

                <button type="submit" className="lx-btn-save">
                  <FontAwesomeIcon icon={faCheck} />
                  Save Changes
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="lx-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="lx-modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="lx-modal-title">Confirm Logout</h3>
            <p className="lx-modal-text">Are you sure you want to log out?</p>
            <div className="lx-modal-actions">
              <button className="lx-btn-confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button className="lx-btn-cancel" onClick={() => setShowLogoutModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isMobile && <Bottom_manu />}
      <Message type={message.type} text={message.text} />
    </>
  );
};

export default LedgerXProfile;