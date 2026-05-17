import React, { useEffect, useState } from 'react';
import './../../style/deposits/profile.css';
import { useParams } from "react-router-dom";
import axios from 'axios';


const CustomerProfile = () => {
      const { customerId } = useParams()
  const [customerData, setCustomerData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    profileImage:''
  });
  
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [tempAddress, setTempAddress] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [denyTransaction, setDenyTransaction] = useState(true);

  const [bgColor, setBgColor] = useState("");
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  

  // Handle address edit
  const handleEditAddress = () => {
    setTempAddress(customerData.address);
    setIsEditingAddress(true);
  };

useEffect(() => {
  const fetchCustomer = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/customers/${customerId}`, {
        method: "GET",
        headers: {
          "x-auth-token": token,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setCustomerData({
        name: data.name || "",
        phone: data.phoneNumber || "",
        email: data.email || "",
        address: data.address || "",
        profileImage: data.profileImage || "",
      });
    } catch (error) {
      console.error("Error fetching customer profile:", error);
    }
  };

  fetchCustomer();
}, [customerId]);

// Update Address
  const handleAddressUpdate = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/customers/${customerId}/address`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": localStorage.getItem("token"),
          },
          body: JSON.stringify({ address: tempAddress }),
        }
      );
      const updated = await res.json();
      setCustomerData(updated);
      alert("Address updated successfully ✅");
    } catch (err) {
      console.error("Error updating address:", err);
    }
  };


  const handleCancelEdit = () => {
    setTempAddress('');
    setIsEditingAddress(false);
  };

  // Handle profile deletion
  const handleDeleteProfile = async () => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await fetch(`${process.env.REACT_APP_API_BASE_URL}/customers/${customerId}`, {
        method: "DELETE",
        headers: { "x-auth-token": localStorage.getItem("token") },
      });
      alert("Profile deleted ❌");
      // redirect user after delete
      window.location.href = "/customers"; 
    } catch (err) {
      console.error("Error deleting profile:", err);
    }
  };

  
    const handleImageChange = (e) => {
      const file = e.target.files[0];
      if (file) {
        setPreview(URL.createObjectURL(file)); // Show preview before upload
        uploadImage(file); // Upload image to Cloudinary
      }
    };
    
    const uploadImage = async (file) => {
      setLoading(true);
      const formData = new FormData();
      formData.append("image", file);
    
      try {
        const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/ac/upload/${customerId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
    
        setImage(response.data.imageUrl); // Store the uploaded image URL
        console.log(response)
      } catch (error) {
        console.error("Error uploading image", error);
      } finally {
        setLoading(false);
      }
    };

  if (isDeleted) {
    return (
      <div className="profile-deleted-container">
        <div className="profile-deleted-message">
          <h2>Profile Deleted</h2>
          <p>The customer profile has been successfully removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-profile-container">
      <div className="profile-header">
        <button className="profile-back-btn" onClick={() => window.history.back()}>←</button>
        <h1 className="profile-title">Profile</h1>
        <button className="profile-help-btn">?</button>
      </div>

      <div className="profile-content">
        <div className="profile-avatar-section">
          {/* <div className="profile-avatar">
            <div className="avatar-placeholder">
              <div className="avatar-icon"></div>
            </div>
            <div className="camera-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 15.2c1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3.5-3.5-3.5 1.6-3.5 3.5 1.6 3.5 3.5 3.5zm4.3-6.8l1.5-1.5c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0L15 6.9C14.1 6.3 13.1 6 12 6s-2.1 0.3-3 0.9L7.6 5.5c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4L7.7 8.4c-1.1 0.9-1.7 2.3-1.7 3.6 0 2.8 2.2 5 5 5s5-2.2 5-5c0-1.3-0.6-2.7-1.7-3.6z"/>
              </svg>
            </div>
          </div> */}
            <div className="profile-avatar">
                <label htmlFor="fileInput" className="image-upload-cdp">
                    {customerData?.profileImage ? (
                        // <div className="avatar-placeholder">
                    <img
                        src={customerData.profileImage}
                        alt="Profile"
                        className="avatar-placeholder"
                        onContextMenu={(e) => e.preventDefault()} // Disable right-click
                        draggable="false"
                    />
                    //   </div>
                    ) : (
                    <div className="profile-placeholder-cdp" style={{ backgroundColor: bgColor }}>
                        {customerData?.name ? customerData?.name.charAt(0).toUpperCase() : "?"}
                    </div>
                    )}
                </label>
                  <div className="camera-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white">
                <path d="M12 15.2c1.9 0 3.5-1.6 3.5-3.5s-1.6-3.5-3.5-3.5-3.5 1.6-3.5 3.5 1.6 3.5 3.5 3.5zm4.3-6.8l1.5-1.5c0.4-0.4 0.4-1 0-1.4s-1-0.4-1.4 0L15 6.9C14.1 6.3 13.1 6 12 6s-2.1 0.3-3 0.9L7.6 5.5c-0.4-0.4-1-0.4-1.4 0s-0.4 1 0 1.4L7.7 8.4c-1.1 0.9-1.7 2.3-1.7 3.6 0 2.8 2.2 5 5 5s5-2.2 5-5c0-1.3-0.6-2.7-1.7-3.6z"/>
              </svg>
            </div>
      <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} hidden />
      {/* {loading && <p className="uploading-text-cdp">Uploading...</p>} */}
</div>
        </div>

        <div className="profile-name-section">
          <div className="profile-name-item">
            <div className="name-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <span className="profile-name">{customerData.name}</span>
            <span className="profile-arrow">›</span>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Contact Information</h2>
          
          <div className="contact-item">
            <div className="contact-icon phone-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
            </div>
            <span className="contact-text">{customerData.phone}</span>
            <span className="contact-arrow">›</span>
          </div>

          <div className="contact-item address-item">
            <div className="contact-icon location-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            {isEditingAddress ? (
              <div className="address-edit-container">
                <input
                  type="text"
                  value={tempAddress}
                  onChange={(e) => setTempAddress(e.target.value)}
                  placeholder="Enter address"
                  className="address-input"
                  disabled={isLoading}
                />
                <div className="address-buttons">
                  <button 
                    onClick={handleAddressUpdate} 
                    className="address-save-btn"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    onClick={handleCancelEdit} 
                    className="address-cancel-btn"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <>
                <span className="contact-text" onClick={handleEditAddress}>
                  {customerData.address || 'Add Address'}
                </span>
                <span className="contact-arrow" onClick={handleEditAddress}>›</span>
              </>
            )}
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Communications</h2>
          
          <div className="contact-item">
            <div className="contact-icon sms-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 11H7V9h2v2zm4 0h-2V9h2v2zm4 0h-2V9h2v2z"/>
              </svg>
            </div>
            <span className="contact-text">Transactions SMS Settings</span>
            <span className="contact-arrow">›</span>
          </div>
        </div>

        <div className="profile-section">
          <h2 className="section-title">Customer Permission</h2>
          
          <div className="permission-item">
            <div className="permission-icon deny-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#28a745">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
              </svg>
            </div>
            <span className="permission-text">Deny to Add Transaction</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                id="deny-toggle"
                checked={denyTransaction}
                onChange={(e) => setDenyTransaction(e.target.checked)}
                className="toggle-input"
              />
              <label htmlFor="deny-toggle" className="toggle-label"></label>
            </div>
          </div>

          {/* <div className="action-item block-item">
            <div className="action-icon block-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#dc3545">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM4 12c0-4.42 3.58-8 8-8 1.85 0 3.55.63 4.9 1.69L5.69 16.9C4.63 15.55 4 13.85 4 12zm8 8c-1.85 0-3.55-.63-4.9-1.69L18.31 7.1C19.37 8.45 20 10.15 20 12c0 4.42-3.58 8-8 8z"/>
              </svg>
            </div>
            <span className="action-text">Block</span> */}
          {/* </div> */}

          <div className="action-item delete-item" onClick={handleDeleteProfile}>
            <div className="action-icon delete-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#dc3545">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
            </div>
            <span className="action-text">
              {isLoading ? 'Deleting...' : 'Delete'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;