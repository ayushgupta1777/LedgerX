import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Link, Switch } from 'react-router-dom';
import Customer from './Customer_form';
import Supplier from './Supplier_form';
import CDP1 from './detail/CDP1';
import Message from '../global/alert';
import BottomMenu from '../global/bottom_manu';
import '../../style/deposits/ac.css'
import '../../style/deposits/ac-main.css'
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUserPlus, faChevronDown, faMinus, faPlus, faArrowLeftLong, faSearch, faFilter,faXmark
} from "@fortawesome/free-solid-svg-icons";
import RemiderItem from '../Deposits/detail/ReminderItem';

import CompanyWatermark from '../global/water-mark/CompanyWatermark';

const App = () => {
  const [view, setView] = useState('Customer');
  const [customers, setCustomers] = useState([]);
  const [customers11, setCustomers11] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [customers1, setCustomers1] = useState([]);
  const [addedMeAsCustomer, setCustomers2] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);

  const navigate = useNavigate();
  const [selectedPhoneNumber, setSelectedPhoneNumber] = useState(''); // To capture the clicked number
  const [message, setMessage] = useState({ type: '', text: '' });

  const [unreadCounts, setUnreadCounts] = useState({});
  const [unreadCounts2, setUnreadCounts2] = useState({});
  const [loading, setLoading] = useState(false);

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [bgColor, setBgColor] = useState("");

  const [searchQuery, setSearchQuery] = useState('');


  const [isOpenCDP1, setIsOpenCDP1] = useState(true); // Toggle state (default: open)

  const [ownerSummary, setOwnerSummary] = useState({
    accountsCount: 0,
    totalAdvance: 0,
    totalDue: 0,
    net: { amount: 0, type: 'Advance' }
  });
  const [showManualForm, setShowManualForm] = useState(false);

    const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeFilterCategory, setActiveFilterCategory] = useState('Sort By');
  const [tempSortBy, setTempSortBy] = useState('Latest');
  const [appliedSortBy, setAppliedSortBy] = useState('Latest');

  // Customer form state
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    address: ''
  });

  const [formStatus, setFormStatus] = useState({
    name: { value: '', isValid: false },
    phone: { value: '', isValid: false },
    address: { value: '', isValid: false }
  });

  const [showCustomerModal, setShowCustomerModal] = useState(false);




  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const toggleCustomerModal = () => {
    setShowCustomerModal(!showCustomerModal);
  };

  const closeCustomerModal = (e) => {
    // Only close if clicking on the overlay and not the modal content
    if (e.target.className === 'borrowed_accounts_modal_overlay') {
      setShowCustomerModal(false);
    }
  };

  const openManualForm = () => {
    setShowCustomerModal(false);
    setShowManualForm(true);
  };

  const closeManualForm = () => {
    setShowManualForm(false);
  };

  useEffect(() => {
    // Set timeout to remove the message after 5 seconds
    const timer = setTimeout(() => {
      setMessage({ type: '', text: '' });
    }, 3000);

    // Clear the timeout when the component unmounts or when message changes
    return () => clearTimeout(timer);
  }, [message]);

  const [isOpen, setIsOpen] = useState(true);

  const toggleOptions = () => {
    setIsOpen(!isOpen);
  };
  const handleCustomerClick = (customer) => {
    if (isMobile) {
      navigate(`/customer/${customer.customerID}`, {
        state: {
          name: customer.name,
          phone: customer.phoneNumber,
        },
      });
    } else {
      setSelectedChat({
        id: customer.customerID,

      });
    }
  };

  const filteredCustomers = customers11.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
   (customer.phoneNumber && customer.phoneNumber.includes(searchQuery))
  );

  const toggleFilterModal = () => {
    setShowFilterModal(!showFilterModal);
    if (!showFilterModal) {
      setTempSortBy(appliedSortBy);
    }
  };

  const handleApplyFilter = () => {
    setAppliedSortBy(tempSortBy);
    setShowFilterModal(false);
  };

  const handleClearFilter = () => {
    setTempSortBy('Latest');
    setAppliedSortBy('Latest');
    setShowFilterModal(false);
  };

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/customers`,
          { headers: { 'x-auth-token': token } });
        setCustomers11(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error.message);
      }
    };

    fetchCustomers();
  }, []);

  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/supplier`,
          { headers: { 'x-auth-token': token } });
        setSuppliers(response.data);
      } catch (error) {
        console.error('Error fetching customers:', error.message);
      }
    };

    fetchSuppliers();
  }, []);

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/customer_who_added_me`,
          { headers: { 'x-auth-token': token } });
        setCustomers2(response.data);
        setMessage({ type: 'success', text: 'successful customer_who_added_me' });


      } catch (error) {
        console.error('Error fetching customers:', error.message);
        setMessage({ type: 'error', text: 'Error during customer_who_added_me' });

      }
    };

    fetchCustomers();
  }, []);

  const handleClick = async (ByPhoneNumber, adderuserId) => {
    setSelectedPhoneNumber(ByPhoneNumber); // Store the selected phone number in state

    try {
      const token = localStorage.getItem('token');
      console.log('Token from localStorage:', token);

      // Make the POST request with proper structure
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/generate-access`,

        {
          adderPhoneNumber: ByPhoneNumber,
          adderuserId,
        },
        {
          headers: { 'x-auth-token': token }, // Move headers here
        }
      );

      console.log('Response:', response.data);
      if (response.status === 200) {
        const { token: generatedToken } = response.data;
        localStorage.setItem('token2', generatedToken); // Save to local storage
        console.log('Token received and stored:', generatedToken);
        setMessage({ type: 'success', text: 'Access token generated successfully.' });
      } else {
        console.error('Failed to generate access token:', response.status);
        setMessage({ type: 'error', text: 'Failed to generate access token.' });
      }

    } catch (error) {
      console.error('Error generating access:', error.response?.data || error.message);
      setMessage({ type: 'error', text: 'An error occurred while generating access.' });
    }
  };




  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/unread-messages`,
          { customerPhones: customers.map((c) => c.phoneNumber) }, // Ensure this is an array
          { headers: { 'x-auth-token': token } }
        );

        setUnreadCounts(response.data.unreadCounts); // Store unread counts
      } catch (error) {
        console.error('Error fetching unread message counts:', error.message);
      }
    };

    fetchUnreadCounts();
  }, [customers]);



  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem('token');

        // Iterate over customers to fetch unread count for each sender
        const promises = customers.map(async (customer) => {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/unread-messages/${customer.phoneNumber}`, // Use customer as sender
            { headers: { 'x-auth-token': token } }
          );

          return { customerID: customer.customerID, unreadCount: response.data.unreadCount };
        });

        // Resolve all promises and map to a readable object
        const results = await Promise.all(promises);
        const counts = results.reduce((acc, { customerID, unreadCount }) => {
          acc[customerID] = unreadCount || 0;
          return acc;
        }, {});

        setUnreadCounts(counts); // Update unreadCounts state
        console.log('Successfully fetched unread counts:', counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error.message);
      }
    };

    if (customers.length > 0) {
      fetchUnreadCounts();
    }
  }, [customers]); // Re-run whenever the `customers` list updates

  useEffect(() => {
    const fetchUnreadCounts = async () => {
      try {
        const token = localStorage.getItem('token');

        // Iterate over customers to fetch unread count for each sender
        const promises = addedMeAsCustomer.map(async (addedMeAsCustomer) => {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/unread-messages/two/${addedMeAsCustomer.ByPhoneNumber}`, // Use customer as sender
            { headers: { 'x-auth-token': token } }
          );

          return { customerID: addedMeAsCustomer.customerID, unreadCount: response.data.unreadCount };
        });

        // Resolve all promises and map to a readable object
        const results = await Promise.all(promises);
        const counts = results.reduce((acc, { customerID, unreadCount }) => {
          acc[customerID] = unreadCount || 0;
          return acc;
        }, {});

        setUnreadCounts2(counts); // Update unreadCounts state
        console.log('Successfully fetched unread counts:', counts);
      } catch (error) {
        console.error('Error fetching unread counts:', error.message);
      }
    };

    if (customers.length > 0) {
      fetchUnreadCounts();
    }
  }, [customers]); // Re-run whenever the `customers` list updates


  useEffect(() => {
    const handleMessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === 'contact-picker-result') {
          console.log('[Web] Contact picker result:', data);

          if (data.success && data.contact) {
            // Close modal
            setShowCustomerModal(false);

            // Auto-save the contact
            saveContactAndRedirect(data.contact.name, data.contact.phone);
          } else {
            // Show error
            alert(data.message || 'Could not access contacts. Please try adding manually.');
          }
        }
      } catch (e) {
        // Not a JSON message, ignore
      }
    };

    // Listen for messages from React Native WebView
    window.addEventListener('message', handleMessage);
    document.addEventListener('message', handleMessage); // For iOS

    return () => {
      window.removeEventListener('message', handleMessage);
      document.removeEventListener('message', handleMessage);
    };
  }, [navigate]);


  const markMessagesAsRead = async (senderId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/mark-messages-read/${senderId}`,
        {},
        { headers: { 'x-auth-token': token } }
      );

      // Update unread counts locally
      setUnreadCounts((prevCounts) => ({
        ...prevCounts,
        [senderId]: 0, // Set unread count for this sender to 0
      }));

      console.log(`Messages from sender ${senderId} marked as read.`);
    } catch (error) {
      console.error('Error marking messages as read:', error.message);
    }
  };




  useEffect(() => {
    const eventSource = new EventSource(`${process.env.REACT_APP_API_BASE_URL}/events`);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Real-time update received:', data);

      const { customerID, sender } = data; // Extract both customerID and sender

      // Determine the identifier for unreadCounts (e.g., use sender or customerID)
      const key = customerID || sender; // Prefer customerID if available, fallback to sender

      if (key) {
        setUnreadCounts((prevCounts) => ({
          ...prevCounts,
          [key]: (prevCounts[key] || 0) + 1, // Increment unread count for the key
        }));
      } else {
        console.warn('Invalid data received, missing customerID or sender:', data);
      }
    };

    eventSource.onerror = (error) => {
      console.error('EventSource error:', error);
      eventSource.close(); // Close the connection if an error occurs
    };

    // Cleanup on component unmount
    return () => {
      eventSource.close();
    };
  }, []);

  // console.log('Current unreadCounts:', unreadCounts);

  const PING_BACKENDS = [
    { name: "Render Server", url: `${process.env.REACT_APP_API_BASE_URL}/ping` },
    { name: "Second Server", url: `${process.env.REACT_APP_API_BASE_URL}/ping` },
  ];

  const preloadBackend = async () => {
    try {
      const responses = await Promise.all(
        PING_BACKENDS.map(async (server) => {
          const response = await axios.get(server.url);
          console.log(`${server.name} responded with status:`, response.status);
          return { name: server.name, status: response.status };
        })
      );
      console.log("All servers warmed up:", responses);
    } catch (error) {
      console.error("Backend ping failed:", error);
    }
  };

  // Call it when the app starts
  preloadBackend();


  const generateRandomColor = () => {
    const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33A8", "#FFBB33", "#8E44AD", "#2E86C1"];
    return colors[Math.floor(Math.random() * colors.length)];
  };


  const addCustomer = (customer) => {
    setCustomers([...customers, customer]);
  };

  const addSupplier = (supplier) => {
    setSuppliers([...suppliers, supplier]);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  const fetchOwnerSummary = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/me/summary`, {
        headers: { 'x-auth-token': token }
      });
      setOwnerSummary(res.data);
    } catch (err) {
      console.error('Failed to fetch owner summary:', err.response?.data || err.message);
    }
  };

  // Fetch on mount and whenever transactions change
  useEffect(() => {
    fetchOwnerSummary();
  }, []);

  const CheckIcon = () => (
    <svg
      className="ac-check-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      fill="none"
      viewBox="0 0 24 24"
      stroke="#4CAF50"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );



  // const handleContactSelect = async () => {
  //   // Check if the Contact Picker API is available
  //   if (!('contacts' in navigator) || !navigator.contacts.select) {
  //     alert('Contact selection is not supported on this device/browser. Please add manually.');
  //     setShowCustomerModal(false);
  //     navigate('/add-customer');
  //     return;
  //   }

  //   try {
  //     // Request contacts permission and access device contacts
  //     const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });

  //     if (contacts && contacts.length > 0) {
  //       const contact = contacts[0];
  //       console.log('Selected contact:', contact);

  //       // Extract contact data safely
  //       const contactName = contact.name && contact.name.length > 0 ? contact.name[0] : '';
  //       const contactPhone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : '';

  //       // Validate extracted data
  //       if (!contactName || !contactPhone) {
  //         alert('Contact must have both name and phone number. Please add manually.');
  //         setShowCustomerModal(false);
  //         navigate('/add-customer');
  //         return;
  //       }

  //       // Show loading state
  //       setShowCustomerModal(false);
  //       showMessage('info', 'Saving contact...');

  //       // **AUTO-SAVE THE CONTACT TO DATABASE**
  //       await saveContactAndRedirect(contactName, contactPhone);

  //     } else {
  //       showMessage('info', 'No contact selected.');
  //     }
  //   } catch (error) {
  //     console.error('Error accessing contacts:', error);

  //     if (error.name === 'NotSupportedError') {
  //       alert('Contact selection is not supported on this device. Please add manually.');
  //     } else if (error.name === 'NotAllowedError') {
  //       alert('Contact access was denied. Please allow contact permissions or add manually.');
  //     } else if (error.name === 'AbortError') {
  //       showMessage('info', 'Contact selection was cancelled.');
  //       return; // Don't redirect if user cancelled
  //     } else {
  //       alert('Could not access contacts. Please try adding manually.');
  //     }

  //     setShowCustomerModal(false);
  //     navigate('/add-customer');
  //   }
  // };

  // **NEW FUNCTION: Save contact and redirect**


  const handleContactSelect = async () => {
    try {
      console.log('[Web] 📞 Requesting contact picker...');

      // Check if running in WebView (React Native bridge available)
      const isWebView = window.ReactNativeWebView !== undefined;

      if (isWebView) {
        console.log('[Web] Running in WebView - using native bridge');
        // The navigator.contacts.select is overridden in the WebView injected JS
        // It will automatically communicate with React Native
      } else {
        console.log('[Web] Running in browser - using web API');
        // Check if Contact Picker API is available
        if (!('contacts' in navigator) || !navigator.contacts.select) {
          alert('Contact selection is not supported on this device/browser. Please add manually.');
          setShowCustomerModal(false);
          navigate('/add-customer');
          return;
        }
      }

      // Request contacts permission and access device contacts
      const contacts = await navigator.contacts.select(['name', 'tel'], { multiple: false });

      // This code only runs in regular browsers (not WebView)
      if (contacts && contacts.length > 0) {
        const contact = contacts[0];
        console.log('[Web] Selected contact:', contact);

        // Extract contact data safely
        const contactName = contact.name && contact.name.length > 0 ? contact.name[0] : '';
        const contactPhone = contact.tel && contact.tel.length > 0 ? contact.tel[0] : '';

        // Validate extracted data
        if (!contactName || !contactPhone) {
          alert('Contact must have both name and phone number. Please add manually.');
          setShowCustomerModal(false);
          navigate('/add-customer');
          return;
        }

        // Show loading state
        setShowCustomerModal(false);
        showMessage('info', 'Saving contact...');

        // **AUTO-SAVE THE CONTACT TO DATABASE**
        await saveContactAndRedirect(contactName, contactPhone);
      }
    } catch (error) {
      console.error('[Web] Error accessing contacts:', error);

      if (error.name === 'NotSupportedError') {
        alert('Contact selection is not supported on this device. Please add manually.');
      } else if (error.name === 'NotAllowedError') {
        alert('Contact access was denied. Please allow contact permissions or add manually.');
      } else if (error.name === 'AbortError') {
        showMessage('info', 'Contact selection was cancelled.');
        return; // Don't redirect if user cancelled
      } else {
        alert('Could not access contacts. Please try adding manually.');
      }

      setShowCustomerModal(false);
      navigate('/add-customer');
    }
  };

  const saveContactAndRedirect = async (name, phone) => {
    try {
      const token = localStorage.getItem('token');

      if (!token) {
        showMessage('error', 'You are not logged in. Please log in to continue.');
        return;
      }

      // Format data to match backend expectations
      const newCustomer = {
        name: name.trim(),
        phoneNumber: phone.trim(),
      };

      console.log('Saving customer:', newCustomer);

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/addCustomer`,
        newCustomer,
        { headers: { 'x-auth-token': token } }
      );

      if (response.status === 200 || response.status === 201) {
        const { customerID } = response.data;

        showMessage('success', 'Contact saved successfully!');

        // **REFRESH CUSTOMER LIST**
        await fetchCustomers(); // Refresh the customer list

        // **REDIRECT TO CUSTOMER PAGE**
        navigate(`/customer/${customerID}`, {
          state: {
            name: name,
            phone: phone
          }
        });

      } else {
        throw new Error('Failed to save customer');
      }

    } catch (error) {
      console.error('Error saving customer:', error);

      const errorMessage = error.response?.data?.error || error.message || 'Failed to save customer.';

      if (errorMessage.includes('already exists') || errorMessage.includes('duplicate')) {
        // Customer already exists, try to find their ID
        showMessage('info', 'Customer already exists. Opening existing record...');
        await findExistingCustomerAndRedirect(phone);
      } else {
        showMessage('error', `Error: ${errorMessage}`);
        // Still redirect to manual form with pre-filled data as fallback
        setCustomer({
          name: name,
          phone: phone,
          address: ''
        });
        setShowManualForm(true);
      }
    }
  };

  // **NEW FUNCTION: Find existing customer and redirect**
  const findExistingCustomerAndRedirect = async (phone) => {
    try {
      // Find the customer in the existing list
      const existingCustomer = customers11.find(customer =>
        customer.phoneNumber === phone || customer.phoneNumber === phone.replace(/\D/g, '')
      );

      if (existingCustomer) {
        navigate(`/customer/${existingCustomer.customerID}`, {
          state: {
            name: existingCustomer.name,
            phone: existingCustomer.phoneNumber
          }
        });
      } else {
        // If not found in current list, refresh and try again
        await fetchCustomers();
        const updatedCustomer = customers11.find(customer =>
          customer.phoneNumber === phone
        );

        if (updatedCustomer) {
          navigate(`/customer/${updatedCustomer.customerID}`, {
            state: {
              name: updatedCustomer.name,
              phone: updatedCustomer.phoneNumber
            }
          });
        } else {
          showMessage('error', 'Could not find customer record.');
        }
      }
    } catch (error) {
      console.error('Error finding existing customer:', error);
      showMessage('error', 'Could not find customer record.');
    }
  };

  // **ALSO UPDATE YOUR fetchCustomers FUNCTION TO RETURN A PROMISE**
  const fetchCustomers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/customers`, {
        headers: { 'x-auth-token': token }
      });
      setCustomers11(response.data);
      return response.data; // Return the data for immediate use
    } catch (error) {
      console.error('Error fetching customers:', error.message);
      throw error; // Re-throw so calling function knows it failed
    }
  };

  return (
    <>
      <div className="app-container">

        <div className="search-container-AC">
          {/* ✅ Search Wrapper (with Icon + Input) */}
          <div className="search-icon-wrapper-AC">
            <button onClick={() => navigate(-1)} className="back-button-AC">
              <FontAwesomeIcon icon={faArrowLeftLong} className="arrow-icon-AC" />
            </button>
          </div>

          <div className="search-wrapper-AC">
            <FontAwesomeIcon icon={faSearch} className="search-icon-AC" />
            <input
              type="text"
              placeholder="Type something..."
              className="search-input-AC"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

           <button className="filter-button-AC" onClick={toggleFilterModal}>
            <FontAwesomeIcon icon={faFilter} className="filter-icon-AC" />
          </button>
        </div>

        <section
          className="ac-net-balance-card"
          aria-labelledby="net-balance-title"
        >
          <div className="ac-net-balance-info">
            <h2
              className="ac-net-balance-label"
              id="net-balance-title"
              tabIndex={-1}
              aria-live="polite"
            >
              Net Balance
            </h2>
            <div className="ac-net-balance-sub">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#2e6040cc"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                focusable="false"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M18 21v-2a4 4 0 00-3-3.87" />
              </svg>
              {ownerSummary.accountsCount}
            </div>
          </div>
          <div>
            <div className="ac-net-balance-amount" tabIndex={0} aria-label="You get 1,500 rupees">
              ₹{ownerSummary.net.amount}
            </div>
            <div className="ac-net-balance-youget">You Get</div>
          </div>
        </section>

        <header className="app-header">
          <div className="tab-container">
            <button
              className={`app-header-button ${view === 'Customer' ? 'active' : ''}`}
              onClick={() => setView('Customer')}
            >
              Customer
            </button>
            <button
              className={`app-header-button ${view === 'Supplier' ? 'active' : ''}`}
              onClick={() => setView('Supplier')}
            >
              Reminder
            </button>
            <div
              className="active-indicator"
              style={{
                transform: view === 'Customer' ? 'translateX(0)' : 'translateX(100%)',
              }}
            />
          </div>
        </header>

        <main className="app-main">
          <div className="chat-container">
            <aside className="chat-sidebar">
              {view === 'Customer' ? (
                <>
                  {/* <h2 className="chat-sidebar-title">Customers</h2> */}
                  {loading ? (
                    <p>Loading...</p>
                  ) : (
                    <div className="faq-container">

                      {isOpen && ( // Only render when open
                        <div className="faq-answer">

                          <ul className="chat-list">
                            {[...filteredCustomers] // Create a copy of the array to avoid mutating state
                              .sort((a, b) => {
         // First priority: Unread messages if any
                                if ((b.unreadCount || 0) !== (a.unreadCount || 0)) {
                                  return (b.unreadCount || 0) - (a.unreadCount || 0);
                                }

                                // Second priority: Applied Sort By
                                switch (appliedSortBy) {
                                  case 'Name':
                                    return a.name.localeCompare(b.name);
                                  case 'Amount Due':
                                    // Assuming balance is a number and balanceType defines direction
                                    const getRealBalance = (c) => c.balanceType === 'Due' ? c.balance : -c.balance;
                                    return getRealBalance(b) - getRealBalance(a);
                                  case 'Last Payment':
                                    // Assuming there's a lastPaymentDate or similar. Falling back to lastMessageTimestamp if not available
                                    const dateA = new Date(a.lastPaymentDate || a.lastMessageTimestamp || 0);
                                    const dateB = new Date(b.lastPaymentDate || b.lastMessageTimestamp || 0);
                                    return dateB - dateA;
                                  case 'Latest':
                                  default:
                                    return new Date(b.lastMessageTimestamp || 0) - new Date(a.lastMessageTimestamp || 0);
                                }
                              })



                              .map((customer) => (
                                 <li
                                   key={customer.customerID}
                                   className={`ac-customer-list-item ${selectedChat && selectedChat.id === customer.customerID ? 'selected' : ''}`}
                                 >
                                   <article
                                     className="ac-customer"
                                    key={customer.id}
                                    aria-label={`${customer.name} ${customer.type === "Advance" ? "Advance" : "Due"
                                      }`}
                                    tabIndex={0}
                                    role="listitem"
                                  >

                                    <div className="loan-profile-container-AC"
                                      onClick={() => navigate(`/profile/${customer.customerID}`)}
                                    >

                                      <label htmlFor="fileInput" className="image-upload">
                                        {customer?.profileImage ? (
                                          <img
                                            src={customer?.profileImage}
                                            alt="Profile"
                                            width={150}
                                            height={150}
                                            style={{ borderRadius: "50%" }}
                                            className="ac-avatar"
                                            onContextMenu={(e) => e.preventDefault()} // Disable right-click
                                            draggable="false"
                                          />
                                        ) : (
                                          <div
                                            className="ac-avatar-sub"
                                            style={{ backgroundColor: generateRandomColor() }}
                                          >
                                            {customer?.name ? customer?.name.charAt(0).toUpperCase() : "?"}
                                          </div>
                                        )}
                                      </label>
                                    </div>


                                    <div className="ac-customer-info" onClick={() => {
                                      markMessagesAsRead(customer.phoneNumber);
                                      handleCustomerClick(customer);
                                    }}>
                                      <span className="ac-customer-name">{customer.name}</span>
                                      <span className="ac-customer-credit">
                                      </span>
                                    </div>

                                    <div className="ac-customer-balance" onClick={() => {
                                      markMessagesAsRead(customer.phoneNumber);
                                      handleCustomerClick(customer);
                                    }} >
                                      <span
                                        className={`ac-amount ${customer.balanceType === "Advance" ? "advance" : "due"
                                          }`}
                                        aria-label={
                                          customer.balanceType === "Advance" ? "Advance amount" : "Due amount"
                                        }
                                      >
                                        ₹{customer.balance.toLocaleString()}
                                      </span>
                                      <span className="ac-balance-type">{customer.balanceType}</span>
                                    </div>

                                  </article>

                                </li>
                              ))}

                          </ul>

                        </div>
                      )}
                    </div>
                  )}
                  <div className="fab-container">
                    {/* <button
                        className="fab-floating-button"
                        onClick={() => navigate('/add-customer')}
                      >
                        <FontAwesomeIcon icon={faUserPlus} />
                      </button> */}
                    <button
                      className="ac-add-customer-btn"
                      aria-label="Add new customer"
                      type="button"
                      onClick={toggleCustomerModal}
                    >
                      <FontAwesomeIcon icon={faPlus} />
                    </button>
                  </div>

                  {showCustomerModal && (
                    <div className="borrowed_accounts_modal_overlay" onClick={closeCustomerModal}>
                      <div className="borrowed_accounts_customer_modal">
                        <div className="borrowed_accounts_modal_header">
                          Choose customer
                        </div>
                        <div className="borrowed_accounts_modal_options">
                          <div className="borrowed_accounts_modal_option" onClick={handleContactSelect}>
                            <div className="borrowed_accounts_modal_icon borrowed_accounts_contacts_icon">
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M36 4H12C9.79 4 8 5.79 8 8V40C8 42.21 9.79 44 12 44H36C38.21 44 40 42.21 40 40V8C40 5.79 38.21 4 36 4ZM12 8H22V24L17 21.5L12 24V8Z" fill="white" />
                              </svg>
                            </div>
                            <div className="borrowed_accounts_modal_option_text">FROM CONTACTS</div>
                          </div>
                          <div className="borrowed_accounts_modal_option" onClick={() => navigate('/add-customer')}>
                            <div className="borrowed_accounts_modal_icon borrowed_accounts_manual_icon">
                              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                                <path d="M38 14H10V10H38V14ZM38 22H10V18H38V22ZM38 30H10V26H38V30ZM10 38H26V34H10V38Z" fill="white" />
                                {/* <path d="M36 24L30 18V22H18V26H30V30L36 24Z" fill="white" /> */}
                              </svg>
                            </div>
                            <div className="borrowed_accounts_modal_option_text">ENTER MANUALLY</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                                    {showFilterModal && (
                    <div className="ac-filter-modal-overlay" onClick={toggleFilterModal}>
                      <div className="ac-filter-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="ac-filter-modal-header">
                          <span className="ac-filter-modal-title">Filter</span>
                          <button className="ac-filter-close-btn" onClick={toggleFilterModal}>
                            <FontAwesomeIcon icon={faXmark} />
                          </button>
                        </div>

                        <div className="ac-filter-modal-body">
                          <div className="ac-filter-sidebar">
                            <div
                              className={`ac-filter-category ${activeFilterCategory === 'Sort By' ? 'active' : ''}`}
                              onClick={() => setActiveFilterCategory('Sort By')}
                            >
                              Sort By
                            </div>
                            <div
                              className={`ac-filter-category ${activeFilterCategory === 'Reminder date' ? 'active' : ''}`}
                              onClick={() => setActiveFilterCategory('Reminder date')}
                            >
                              Reminder date
                            </div>
                          </div>

                          <div className="ac-filter-options">
                            {activeFilterCategory === 'Sort By' ? (
                              <div className="ac-sort-options">
                                {['Latest', 'Last Payment', 'Amount Due', 'Name'].map((option) => (
                                  <div
                                    key={option}
                                    className="ac-filter-option-row"
                                    onClick={() => setTempSortBy(option)}
                                  >
                                    <span>{option}</span>
                                    <div className={`ac-radio-circle ${tempSortBy === option ? 'selected' : ''}`}>
                                      <div className="ac-radio-dot"></div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="ac-date-options">
                                <p className="ac-coming-soon">Reminder date filters coming soon...</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="ac-filter-modal-footer">
                          <button className="ac-filter-clear-btn" onClick={handleClearFilter}>Clear</button>
                          <button className="ac-filter-apply-btn" onClick={handleApplyFilter}>Apply</button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>

                  <RemiderItem />
                </>
              )}
            </aside>

            {!isMobile && (
              <section className="desktop-detail-panel">
                {selectedChat ? (
                  <CDP1 customerID={selectedChat.id} inline={true} />
                ) : (
                  <div className="desktop-empty-state glass-panel">
                    <div className="empty-state-icon">💳</div>
                    <h3>No Customer Selected</h3>
                    <p>Select a customer from the left list to view their transaction ledger, chats, and send payment reminders.</p>
                  </div>
                )}
              </section>
            )}
          </div>
        </main>

        <CompanyWatermark companyName="Adsngrow" companyUrl="https://adsngrow.in" />

        {isMobile && <BottomMenu />}
        {message.text && <Message type={message.type} text={message.text} />}
      </div>
    </>
  );
};


export default App;