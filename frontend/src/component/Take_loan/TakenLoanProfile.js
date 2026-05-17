import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../../style/loans/dynamic/taken-loan-profile.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPencil, faCircleUser, faArrowLeft, faPen } from '@fortawesome/free-solid-svg-icons';
import Message from '../global/alert';

const TakenLoanProfile = () => {
  const [takenLoanDetails, setTakenLoanDetails] = useState(null);
  const [lenderProfile, setLenderProfile] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpen2, setIsModalOpen2] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const [amount1, setAmount1] = useState('');
  const [method, setMethod] = useState('Cash');
  const [additionalInterestRate, setAdditionalInterestRate] = useState('');
  const [amount2, setAmount2] = useState('');
  const [amount3, setAmount3] = useState('');
  const [amount4, setAmount4] = useState('');
  const [interestAmount4, setInterestAmount4] = useState('');
  const [date, setDate] = useState('');

  const [isModalOpen3, setIsModalOpen3] = useState(false);
  const [isModalOpen4, setIsModalOpen4] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bgColor, setBgColor] = useState('');

  const menuRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { lenderID } = useParams();

  const [savedRemark, setSavedRemark] = useState('');
  const [note, setNote] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);
    return () => clearTimeout(timer);
  }, [message]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateRandomColor = () => {
    const colors = ['#FF5733', '#33FF57', '#3357FF', '#FF33A8', '#FFBB33', '#8E44AD', '#2E86C1'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const createRipple = (event) => {
    const button = event.currentTarget;

    const ripple = button.querySelector('.taken-loan-ripple');
    if (ripple) {
      ripple.remove();
    }

    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - button.getBoundingClientRect().left - radius}px`;
    circle.style.top = `${event.clientY - button.getBoundingClientRect().top - radius}px`;
    circle.classList.add('taken-loan-ripple');

    button.appendChild(circle);
    setTimeout(() => circle.remove(), 600);
  };

  const handleSmoothModalClose = (modalNumber) => {
    const modal = document.querySelector('.taken-loan-topup-container');

    if (modal) {
      modal.style.transform = 'translateY(100%)';
      setTimeout(() => {
        if (modalNumber === 1) {
          setIsModalOpen(false);
        } else if (modalNumber === 2) {
          setIsModalOpen2(false);
        } else if (modalNumber === 3) {
          setIsModalOpen3(false);
        } else if (modalNumber === 4) {
          setIsModalOpen4(false);
        }
      }, 400);
    } else {
      if (modalNumber === 1) {
        setIsModalOpen(false);
      } else if (modalNumber === 2) {
        setIsModalOpen2(false);
      } else if (modalNumber === 3) {
        setIsModalOpen3(false);
      } else if (modalNumber === 4) {
        setIsModalOpen4(false);
      }
    }
  };

  const fetchTakenLoanDetails = async () => {
    setBgColor(generateRandomColor());

    try {
      const token = localStorage.getItem('token');

      const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-profile/${lenderID}`, {
        headers: { 'x-auth-token': token }
      });
      setTakenLoanDetails(data);
      setLoading(false);
    } catch (err) {
      setError('Error fetching taken loan details. Please try again.');
      setLoading(false);
      showMessage('error', 'Unauthorized: You do not have access to this loan');
    }
  };

  useEffect(() => {
    fetchTakenLoanDetails();
  }, [lenderID]);

  useEffect(() => {
    const fetchLenderProfile = async () => {
      try {
        const token = localStorage.getItem('token');

        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/lender-profile/${lenderID}`, {
          headers: { 'x-auth-token': token }
        });
        setLenderProfile(data);
        setLoading(false);
      } catch (err) {
        setError('Error fetching lender details. Please try again.');
        setLoading(false);
        showMessage('error', 'Unauthorized: You do not have access to this lender');
      }
    };

    fetchLenderProfile();
  }, [lenderID]);

  useEffect(() => {
    const updateTakenLoanInterest = async () => {
      try {
        await axios.put(`${process.env.REACT_APP_API_BASE_URL}/update-taken-loan-interest/${lenderID}`);
      } catch (err) {
        console.error('Error updating taken loan interest:', err);
      }
    };

    const fetchTakenLoanDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const { data } = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-profile/${lenderID}`, {
          headers: { 'x-auth-token': token }
        });
        setTakenLoanDetails(data);
      } catch (err) {
        setError('Error fetching taken loan details.');
      }
    };

    fetchTakenLoanDetails();
    const interval = setInterval(() => {
      updateTakenLoanInterest();
      fetchTakenLoanDetails();
    }, 6000);

    return () => clearInterval(interval);
  }, [lenderID]);

  const handleAdditionalLoan = async () => {
    if (!amount1 || amount1 <= 0 || !date) {
      showMessage('error', 'Enter a valid amount and date.');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/additional-loan/${lenderID}`, {
        amount: parseFloat(amount1),
        date,
        method,
        interestRate: additionalInterestRate || takenLoanDetails?.loanDetails?.interestRate,
      }, {
        headers: {
          'x-auth-token': localStorage.getItem('token')
        }
      });

      showMessage('success', 'Additional loan amount added successfully!');
      setAmount1('');
      setDate('');
      setAdditionalInterestRate('');
      setIsModalOpen(false);
    } catch (error) {
      showMessage('error', error.response?.data?.message || error.response?.data?.error || 'Error adding additional loan amount');
    } finally {
      setLoading(false);
    }
  };

  const handleRepayment = async () => {
    if (!amount2 || !date) {
      showMessage('error', 'Please enter amount and date.');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/make-repayment/${lenderID}`, {
        amount: parseFloat(amount2),
        date,
        method
      });

      showMessage('success', 'Repayment recorded successfully!');
      setAmount2('');
      setDate('');
      setIsModalOpen2(false);
      fetchTakenLoanDetails();
    } catch (err) {
      console.error('Error processing repayment:', err);
      showMessage('error', 'Failed to process repayment. Try again.');
    }
  };

  const handleInterestPayment = async () => {
    if (!amount3 || !date) {
      showMessage('error', 'Please enter interest amount and date.');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-interest-payment/${lenderID}`, {
        amount: parseFloat(amount3),
        date,
        method
      });

      showMessage('success', 'Interest payment recorded successfully!');
      setAmount3('');
      setDate('');
      setIsModalOpen3(false);
      fetchTakenLoanDetails();
    } catch (err) {
      console.error('Error processing interest payment:', err);
      showMessage('error', 'Failed to process interest payment. Try again.');
    }
  };

  const handleCombinedPayment = async () => {
    if (!amount4 || !interestAmount4 || !date) {
      showMessage('error', 'Please enter both principal and interest amounts and date.');
      return;
    }

    try {
      const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-combined-payment/${lenderID}`, {
        principalAmount: parseFloat(amount4),
        interestAmount: parseFloat(interestAmount4),
        date,
        method
      });

      showMessage('success', 'Combined payment recorded successfully!');
      setAmount4('');
      setInterestAmount4('');
      setDate('');
      setIsModalOpen4(false);
      fetchTakenLoanDetails();
    } catch (err) {
      console.error('Error processing combined payment:', err);
      showMessage('error', 'Failed to process combined payment. Try again.');
    }
  };

  const handleUpdateBillNumber = async () => {
    const newBillNumber = prompt('Enter new bill number:');
    if (newBillNumber) {
      try {
        const response = await axios.put(`${process.env.REACT_APP_API_BASE_URL}/taken-loan-bill/${lenderID}`, {
          billNumber: newBillNumber
        });

        setTakenLoanDetails(response.data);
        showMessage('success', 'Bill number updated successfully!');
      } catch (error) {
        console.error('Error updating bill number:', error);
        showMessage('error', 'Failed to update bill number. Please try again.');
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  const uploadImage = async (file) => {
    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/lender-images/upload/${lenderID}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setImage(response.data.imageUrl);
      showMessage('success', 'Profile image updated successfully!');
    } catch (error) {
      console.error('Error uploading image', error);
      showMessage('error', 'Error uploading image');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/taken-loan/${lenderID}/remark`);
        setNote(response.data.remark || 'Write your note here...');
      } catch (error) {
        console.error('Error fetching note:', error);
      }
    };

    fetchNote();
  }, [lenderID]);

  const handleSave = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_API_BASE_URL}/taken-loan/${lenderID}/remark`, { remarks: note });
      setIsEditing(false);
      showMessage('success', 'Note saved successfully!');
    } catch (error) {
      console.error('Error updating note:', error);
      showMessage('error', 'Error updating note');
    }
  };

  const handleHome = () => {
    navigate('/home');
  };
  const handleHistory = () => {
    navigate(`/taken-loan-history/${lenderID}`);
  };
  const handleDetailPage = () => {
    navigate(`/taken-loan-details/${lenderID}`);
  };

  const handleReceipt = () => {
    navigate(`/taken-loan-receipt/${lenderID}`);
  };

  const formatToIndianCurrency = (number) => {
    if (number === null || number === undefined) return '';
    const numStr = number.toString();
    const [integerPart, decimalPart] = numStr.split('.');
    const formattedInteger = integerPart.replace(/(\d)(?=(\d\d)+\d$)/g, '$1,');
    return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
  };

  if (loading) {
    return (
      <div className="taken-loan-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="taken-loan-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        width: '100%',
      }}>
        <div>Error: {error}</div>
      </div>
    );
  }

  const { loanType, amount, interestRate, startDate, compoundInterest, interestFrequency, remarks, billNo } = takenLoanDetails?.loanDetails || {};
  const { accruedInterest, totalAmount, topUpTotal, repaymentTotal, remainingPrincipal } = takenLoanDetails?.loanDetails || {};
  const { updatedAt, profileImage } = takenLoanDetails || {};
  const { FirstName, LastName } = lenderProfile || {};

  const totalLoanAmount = amount + (topUpTotal || 0);
  const totalInterest = accruedInterest || 0;
  const totalRepaid = repaymentTotal || 0;
  const remainingAmount = totalAmount || 0;

  return (
    <div Name="taken-loan-profile">
      {/* Header Section */}
      <div className="taken-loan-header">
        <span onClick={handleHome}>
          <FontAwesomeIcon icon={faArrowLeft} size="lg" />
        </span>
        <div className="taken-loan-customer-info">
          <div className="taken-loan-profile-container">
            <label htmlFor="fileInput" className="image-upload">
              {profileImage ? (
                <img src={profileImage} alt="Profile" width={150} height={150}
                  style={{ borderRadius: '50%' }} className="taken-loan-profile-image"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false" />
              ) : (
                <div className="taken-loan-profile-placeholder" style={{ backgroundColor: bgColor }}>
                  {FirstName ? FirstName.charAt(0).toUpperCase() : '?'}
                </div>
              )}
            </label>
            <input id="fileInput" type="file" accept="image/*" onChange={handleImageChange} hidden />
          </div>
          <div>
            <h2>{FirstName} {LastName}</h2>
            <p className="taken-loan-lender-label">Lender</p>
          </div>
        </div>

      </div>

      {/* Dashboard Cards */}
      <div className="taken-loan-dashboard-container">
        <div className="taken-loan-dashboard-grid">
          <div className="taken-loan-card taken-loan-card-white">
            <div className="taken-loan-card-content">
              <h2 className="taken-loan-card-title">Total Borrowed</h2>
              <p className="taken-loan-card-amount">₹ <span className="taken-loan-value">{formatToIndianCurrency(Math.floor(totalLoanAmount || 0))}</span></p>
              <div className="taken-loan-card-percentage taken-loan-positive">
                Start: {startDate ? new Date(startDate).toLocaleDateString('en-GB') : 'N/A'}
              </div>
              <p className="taken-loan-card-comparison">Starting Date</p>
            </div>
          </div>

          <div className="taken-loan-card taken-loan-card-red">
            <div className="taken-loan-card-content">
              <h2 className="taken-loan-card-title">Total Interest Owed</h2>
              <p className="taken-loan-card-amount">₹ <span className="taken-loan-value">{formatToIndianCurrency(Math.floor(totalInterest || 0))}</span></p>
              <div className="taken-loan-card-percentage taken-loan-positive"></div>
              <p className="taken-loan-card-comparison"></p>
            </div>
          </div>

          <div className="taken-loan-card taken-loan-card-white">
            <div className="taken-loan-card-content">
              <h2 className="taken-loan-card-title">Total Repaid</h2>
              <p className="taken-loan-card-amount">₹ <span className="taken-loan-value">{formatToIndianCurrency(Math.floor(totalRepaid || 0))}</span></p>
              <div className="taken-loan-card-percentage taken-loan-negative"></div>
              <p className="taken-loan-card-comparison"></p>
            </div>
          </div>

          <div className="taken-loan-card taken-loan-card-white">
            <div className="taken-loan-card-content">
              <h2 className="taken-loan-card-title">Remaining Amount</h2>
              <p className="taken-loan-card-amount">₹ <span className="taken-loan-value">{formatToIndianCurrency(Math.floor(remainingAmount || 0))}</span></p>
              <div className="taken-loan-card-date">{new Date(updatedAt).toLocaleDateString('en-GB')}</div>
              <p className="taken-loan-card-update-text">last updated</p>
            </div>
          </div>
        </div>
      </div>

      <button className="taken-loan-read-more-btn" onClick={(e) => {
        createRipple(e);
        handleHistory();
      }}>
        <span className="taken-loan-text">View History</span>
        <span className="taken-loan-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div className="taken-loan-circular-animation"></div>
      </button>

      {/* Progress Section for Interest Rate */}
      <div className="taken-loan-progress-container">
        <div className="taken-loan-progress-bar-container">
          <div className="taken-loan-progress-label">{interestRate}%</div>
          <div className="taken-loan-progress-bar">
            <div className="taken-loan-progress-fill" style={{ width: `${interestRate}%` }}></div>
          </div>
          <div className="taken-loan-progress-label">Interest Rate</div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="taken-loan-note-container">
        {isEditing ? (
          <textarea
            className="taken-loan-note-input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleSave}
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        ) : (
          <div className="taken-loan-note-display">
            <p>{note}</p>
            <FontAwesomeIcon icon={faPen} onClick={() => setIsEditing(true)} />
          </div>
        )}
      </div>


      {/* Footer */}
      <footer className="taken-loan-footer">
        <div className="taken-loan-footer-container">
          <div className="taken-loan-footer-center">
            <h2 className="taken-loan-footer-logo">
              <div className="taken-loan-bill-info" onClick={handleUpdateBillNumber}>
                <p>Bill #: {billNo}</p>
                <span className="taken-loan-update-btn">
                  <FontAwesomeIcon icon={faPencil} />
                </span>
              </div>
            </h2>
            <ul className="taken-loan-footer-nav">
              <li><a href="#">Home</a></li>
              <li><a href="#">About</a></li>
              <li><a href="#">Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
            <div className="taken-loan-footer-social">
              <span className="taken-loan-social-icon" onClick={(e) => {
                createRipple(e);
              }}>ADD SIGNATURE</span>
              <span className="taken-loan-social-icon" onClick={(e) => {
                createRipple(e);
                handleDetailPage();
              }}>DETAILS</span>
              <span className="taken-loan-social-icon">Ig</span>
              <span className="taken-loan-social-icon">Tw</span>
            </div>
          </div>
        </div>
        <div className="taken-loan-footer-divider"></div>
        <p className="taken-loan-footer-copyright">Copyright Ayush Studio</p>
      </footer>

      {/* Dropdown Options */}
      <div className="taken-loan-dropdown-container" ref={menuRef}>
        <button
          className={`taken-loan-dropdown-btn ${isOpen ? 'taken-loan-active' : ''}`}
          onClick={(e) => {
            createRipple(e);
            setIsOpen(!isOpen);
          }}
        >
          Options <span className={`taken-loan-arrow ${isOpen ? 'taken-loan-rotate' : ''}`}>▼</span>
        </button>

        <div className={`taken-loan-dropdown-menu ${isOpen ? 'taken-loan-show' : ''}`}>
          <div className="taken-loan-dropdown-item" onClick={() => {
            setIsModalOpen(true);
            setIsOpen(false);
          }}>
            <span className="taken-loan-dropdown-icon">⬆️</span> ADDITIONAL LOAN
          </div>
          <div className="taken-loan-dropdown-item" onClick={() => {
            setIsModalOpen2(true);
            setIsOpen(false);
          }}>
            <span className="taken-loan-dropdown-icon">💵</span> PAY PRINCIPAL
          </div>
          <div className="taken-loan-dropdown-item" onClick={() => {
            setIsModalOpen3(true);
            setIsOpen(false);
          }}>
            <span className="taken-loan-dropdown-icon">💰</span> PAY INTEREST
          </div>
          {/* <div className="taken-loan-dropdown-item" onClick={() => {
            setIsModalOpen4(true);
            setIsOpen(false);
          }}>
            <span className="taken-loan-dropdown-icon">💎</span> PRINCIPLE AND PAY INTEREST
          </div> */}
        </div>
      </div>

      {/* Additional Loan Modal */}
      {isModalOpen && (
        <div className="taken-loan-modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('taken-loan-modal-overlay')) {
            handleSmoothModalClose(1);
          }
        }}>
          <div className="taken-loan-topup-container">
            <button className="taken-loan-close-button" onClick={(e) => {
              e.stopPropagation();
              handleSmoothModalClose(1);
            }}>✖</button>
            <h2 className="taken-loan-topup-title">Additional Loan</h2>
            <div className="taken-loan-topup-box">
              <label className="taken-loan-topup-label">Additional Amount</label>
              <input
                type="number"
                value={amount1}
                onChange={(e) => setAmount1(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="₹ 150"
                min="0"
              />
              <input
                type="number"
                value={additionalInterestRate}
                onChange={(e) => setAdditionalInterestRate(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="Interest Rate %"
                min="0"
              />
              <button onClick={(e) => {
                createRipple(e);
                handleAdditionalLoan();
              }} className="taken-loan-topup-button" disabled={loading}>
                {loading ? 'Processing...' : 'Apply'}
              </button>
              <div className="taken-loan-input-group">
                <label className="taken-loan-topup-label">Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="taken-loan-date-input" />
              </div>
            </div>
            <label className="taken-loan-topup-label">Payment Method:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="taken-loan-topup-select">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
      )}

      {/* Repayment Modal */}
      {isModalOpen2 && (
        <div className="taken-loan-modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('taken-loan-modal-overlay')) {
            handleSmoothModalClose(2);
          }
        }}>
          <div className="taken-loan-topup-container">
            <button className="taken-loan-close-button" onClick={(e) => {
              e.stopPropagation();
              handleSmoothModalClose(2);
            }}>✖</button>
            <h2 className="taken-loan-topup-title">Pay Principal</h2>
            <div className="taken-loan-topup-box">
              <label className="taken-loan-topup-label">Principal Amount</label>
              <input
                type="number"
                value={amount2}
                onChange={(e) => setAmount2(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="₹ 150"
                min="0"
              />
              <button onClick={(e) => {
                createRipple(e);
                handleRepayment();
              }} className="taken-loan-topup-button" disabled={loading}>
                {loading ? 'Processing...' : 'Apply'}
              </button>
              <div className="taken-loan-input-group">
                <label className="taken-loan-topup-label">Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="taken-loan-date-input" />
              </div>
            </div>
            <label className="taken-loan-topup-label">Payment Method:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="taken-loan-topup-select">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
      )}

      {/* Pay Interest Modal */}
      {isModalOpen3 && (
        <div className="taken-loan-modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('taken-loan-modal-overlay')) {
            handleSmoothModalClose(3);
          }
        }}>
          <div className="taken-loan-topup-container">
            <button className="taken-loan-close-button" onClick={(e) => {
              e.stopPropagation();
              handleSmoothModalClose(3);
            }}>✖</button>
            <h2 className="taken-loan-topup-title">Pay Interest</h2>
            <div className="taken-loan-topup-box">
              <p className="taken-loan-info-text" style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                Available Interest: ₹{formatToIndianCurrency(Math.floor(totalInterest || 0))}
              </p>
              <label className="taken-loan-topup-label">Interest Amount</label>
              <input
                type="number"
                value={amount3}
                onChange={(e) => setAmount3(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="₹ 0"
                min="0"
                max={totalInterest}
              />
              <button onClick={(e) => {
                createRipple(e);
                handleInterestPayment();
              }} className="taken-loan-topup-button" disabled={loading || !totalInterest || totalInterest <= 0}>
                {loading ? 'Processing...' : 'Pay Interest'}
              </button>
              <div className="taken-loan-input-group">
                <label className="taken-loan-topup-label">Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="taken-loan-date-input" />
              </div>
            </div>
            <label className="taken-loan-topup-label">Payment Method:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="taken-loan-topup-select">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
            </select>
            {(!totalInterest || totalInterest <= 0) && (
              <p className="taken-loan-warning-text" style={{ color: 'red', marginTop: '10px', fontSize: '0.8rem' }}>
                ⚠️ No interest available to pay
              </p>
            )}
          </div>
        </div>
      )}

      {/* Principle & Pay Interest Modal */}
      {isModalOpen4 && (
        <div className="taken-loan-modal-overlay" onClick={(e) => {
          if (e.target.classList.contains('taken-loan-modal-overlay')) {
            handleSmoothModalClose(4);
          }
        }}>
          <div className="taken-loan-topup-container">
            <button className="taken-loan-close-button" onClick={(e) => {
              e.stopPropagation();
              handleSmoothModalClose(4);
            }}>✖</button>
            <h2 className="taken-loan-topup-title">Principal & Interest</h2>
            <div className="taken-loan-topup-box">
              <p className="taken-loan-info-text" style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#666' }}>
                Available Interest: ₹{formatToIndianCurrency(Math.floor(totalInterest || 0))}
              </p>
              <label className="taken-loan-topup-label">Principal Amount</label>
              <input
                type="number"
                value={amount4}
                onChange={(e) => setAmount4(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="₹ 0"
                min="0"
              />
              <label className="taken-loan-topup-label">Interest Amount</label>
              <input
                type="number"
                value={interestAmount4}
                onChange={(e) => setInterestAmount4(Math.max(0, e.target.value))}
                className="taken-loan-topup-input"
                placeholder="₹ 0"
                min="0"
                max={totalInterest}
              />
              <button onClick={(e) => {
                createRipple(e);
                handleCombinedPayment();
              }} className="taken-loan-topup-button" disabled={loading}>
                {loading ? 'Processing...' : 'Apply Both'}
              </button>
              <div className="taken-loan-input-group">
                <label className="taken-loan-topup-label">Date:</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="taken-loan-date-input" />
              </div>
            </div>
            <label className="taken-loan-topup-label">Payment Method:</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className="taken-loan-topup-select">
              <option value="Cash">Cash</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Credit Card">Credit Card</option>
              <option value="UPI">UPI</option>
            </select>
          </div>
        </div>
      )}

      <Message type={message.type} text={message.text} />
    </div>
  );
};

export default TakenLoanProfile;