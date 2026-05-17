import React, { useState, useEffect, useRef } from 'react';
import { 
  Bell, BellOff, Calendar, User, AlertTriangle, 
  CheckCircle, Trash2, Eye, EyeOff, ArrowUp, 
  ArrowDown, Filter, X, RotateCcw, ChevronRight,
  Plus, Search
} from 'lucide-react';
import axios from 'axios';
// import "../../style/global/reminder.css";

const styles = `
  .reminder-container {
    max-width: 28rem;
    margin: 0 auto;
    background-color: #f9fafb;
    min-height: 100vh;
  }

  .reminder-header-section {
    background-color: white;
    border-bottom: 1px solid #e5e7eb;
    padding: 1rem;
  }

  .reminder-header-flex {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .reminder-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: #111827;
  }

  .reminder-subtitle {
    font-size: 0.875rem;
    color: #6b7280;
  }

  .reminder-add-btn {
    padding: 0.5rem;
    background-color: #2563eb;
    color: white;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
  }

  .reminder-main-content {
    padding: 1rem;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  @media (min-width: 768px) {
    .stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  .stats-card {
    border-radius: 0.5rem;
    padding: 0.75rem;
  }

  .stats-card-blue {
    background-color: #eff6ff;
  }

  .stats-card-orange {
    background-color: #fff7ed;
  }

  .stats-card-red {
    background-color: #fef2f2;
  }

  .stats-card-green {
    background-color: #f0fdf4;
  }

  .stats-number {
    font-size: 1.5rem;
    font-weight: 700;
  }

  .stats-number-blue {
    color: #2563eb;
  }

  .stats-number-orange {
    color: #ea580c;
  }

  .stats-number-red {
    color: #dc2626;
  }

  .stats-number-green {
    color: #16a34a;
  }

  .stats-label {
    font-size: 0.875rem;
  }

  .stats-label-blue {
    color: #1d4ed8;
  }

  .filter-section {
    margin-bottom: 1rem;
  }

  .filter-main-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .filter-tabs-container {
    display: flex;
    background-color: #f3f4f6;
    border-radius: 0.5rem;
    padding: 0.25rem;
    gap: 0.25rem;
  }

  .filter-tab {
    padding: 0.375rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    border: none;
    cursor: pointer;
    background: none;
  }

  .filter-tab-active {
    background-color: white;
    color: #2563eb;
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  }

  .filter-tab-inactive {
    color: #4b5563;
  }

  .filter-tab-inactive:hover {
    color: #111827;
  }

  .filter-count {
    padding: 0.125rem 0.375rem;
    font-size: 0.75rem;
    border-radius: 9999px;
  }

  .filter-count-active {
    background-color: #dbeafe;
    color: #2563eb;
  }

  .filter-count-inactive {
    background-color: #e5e7eb;
    color: #6b7280;
  }

  .filter-dropdown-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
    color: #4b5563;
    border: 1px solid #d1d5db;
    border-radius: 0.5rem;
    background: white;
    cursor: pointer;
    transition: background-color 0.15s ease;
  }

  .filter-dropdown-btn:hover {
    background-color: #f9fafb;
  }

  .filter-expanded-section {
    background-color: #f9fafb;
    border-radius: 0.5rem;
    padding: 0.75rem;
  }

  .reminder-item {
    position: relative;
    margin-bottom: 0.75rem;
    border-radius: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
  }

  .reminder-item-active {
    background-color: white;
  }

  .reminder-item-active:hover {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }

  .reminder-item-dismissed {
    background-color: #f3f4f6;
    opacity: 0.6;
    cursor: default;
  }

  .reminder-item-unseen {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    border-width: 2px;
  }

  .reminder-item-seen {
    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    border: 1px solid #e5e7eb;
  }

  .swipe-background {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 0 1rem 1rem 0;
    transition: background-color 0.2s ease;
  }

  .swipe-icon {
    color: white;
  }

  .reminder-content {
    padding: 1rem;
  }

  .reminder-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  .reminder-header-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
  }

  .priority-indicator {
    width: 0.25rem;
    height: 2.5rem;
    border-radius: 9999px;
  }

  .customer-info {
    flex: 1;
  }

  .customer-name {
    font-weight: 600;
    color: #111827;
  }

  .customer-name-dismissed {
    text-decoration: line-through;
    color: #6b7280;
  }

  .customer-phone {
    font-size: 0.75rem;
    color: #6b7280;
    display: flex;
    align-items: center;
    gap: 0.25rem;
    margin-top: 0.25rem;
  }

  .reminder-status-indicators {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .unseen-indicator {
    width: 0.5rem;
    height: 0.5rem;
    background-color: #3b82f6;
    border-radius: 9999px;
  }

  .reminder-message-section {
    margin-bottom: 0.75rem;
  }

  .reminder-message {
    font-size: 0.875rem;
    line-height: 1.625;
    color: #374151;
  }

  .reminder-message-dismissed {
    color: #6b7280;
    font-style: italic;
  }

  .reminder-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.75rem;
    color: #6b7280;
  }

  .reminder-footer-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  .reminder-date {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }

  .reminder-date-overdue {
    color: #ef4444;
    font-weight: 600;
  }

  .priority-badge {
    padding: 0.25rem 0.5rem;
    border-radius: 0.375rem;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
  }

  .restore-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.5rem;
    color: #16a34a;
    border: 1px solid #16a34a;
    border-radius: 0.5rem;
    background: none;
    cursor: pointer;
    transition: background-color 0.15s ease;
    font-size: 0.75rem;
  }

  .restore-btn:hover {
    background-color: #f0fdf4;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 0;
  }

  .empty-state-icon {
    margin: 0 auto 1rem auto;
    color: #d1d5db;
  }

  .empty-state-title {
    font-size: 1.125rem;
    font-weight: 500;
    color: #111827;
    margin-bottom: 0.5rem;
  }

  .empty-state-description {
    color: #6b7280;
  }

  .loading-container {
    max-width: 28rem;
    margin: 0 auto;
    background-color: #f9fafb;
    min-height: 100vh;
    padding: 1rem;
  }

  .loading-content {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16rem;
  }

  .loading-spinner {
    animation: spin 1s linear infinite;
    border-radius: 50%;
    height: 2rem;
    width: 2rem;
    border-bottom: 2px solid #2563eb;
    border-top: 2px solid transparent;
    border-left: 2px solid transparent;
    border-right: 2px solid transparent;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  .help-text {
    text-align: center;
    padding: 1.5rem 0;
  }

  .help-text p {
    font-size: 0.75rem;
    color: #9ca3af;
  }

  .select-input {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
    background: white;
  }

  .select-input:focus {
    outline: none;
    box-shadow: 0 0 0 2px #3b82f6;
    border-color: transparent;
  }

  .filter-label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  .filter-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .filter-control-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

// Mock API functions (replace with your actual API calls)
// const api = {
//   getReminders: async (filters = {}) => {
//     // Simulate API delay
//     await new Promise(resolve => setTimeout(resolve, 500));
    
//     // Mock data
//     const mockReminders = [
      // {
      //   _id: '1',
      //   customerName: 'John Doe',
      //   phoneNumber: '+1-555-123-4567',
      //   message: 'Follow up on payment discussion. Customer mentioned they would pay by end of week.',
      //   reminderDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      //   priority: 'high',
      //   reminderType: 'payment',
      //   isSeen: false,
      //   isDismissed: false,
      //   isActive: true,
      //   createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      // },
      // {
      //   _id: '2',
      //   customerName: 'Sarah Wilson',
      //   phoneNumber: '+1-555-987-6543',
      //   message: 'Schedule product demo for next week. Customer interested in premium package.',
      //   reminderDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
      //   priority: 'medium',
      //   reminderType: 'followup',
      //   isSeen: true,
      //   isDismissed: false,
      //   isActive: true,
      //   createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      // },
      // {
      //   _id: '3',
      //   customerName: 'Mike Johnson',
      //   phoneNumber: '+1-555-456-7890',
      //   message: 'Send invoice for completed project. Customer approved final deliverables.',
      //   reminderDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      //   priority: 'low',
      //   reminderType: 'general',
      //   isSeen: false,
      //   isDismissed: false,
      //   isActive: true,
      //   createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      // },
      // {
      //   _id: '4',
      //   customerName: 'Emma Davis',
      //   phoneNumber: '+1-555-321-9876',
      //   message: 'Check on delivery status and confirm receipt with customer.',
      //   reminderDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      //   priority: 'high',
      //   reminderType: 'followup',
      //   isSeen: true,
      //   isDismissed: true,
      //   isActive: true,
      //   dismissedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      //   createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
      // }
//     ];

//     // Apply filters
//     let filtered = mockReminders;
    
//     if (filters.status === 'active') {
//       filtered = filtered.filter(r => !r.isDismissed);
//     } else if (filters.status === 'dismissed') {
//       filtered = filtered.filter(r => r.isDismissed);
//     } else if (filters.status === 'unseen') {
//       filtered = filtered.filter(r => !r.isSeen && !r.isDismissed);
//     } else if (filters.status === 'seen') {
//       filtered = filtered.filter(r => r.isSeen);
//     }
    
//     if (filters.priority && filters.priority !== 'all') {
//       filtered = filtered.filter(r => r.priority === filters.priority);
//     }

//     return {
//       reminders: filtered,
//       counts: {
//         total: mockReminders.length,
//         active: mockReminders.filter(r => !r.isDismissed).length,
//         unseen: mockReminders.filter(r => !r.isSeen && !r.isDismissed).length,
//         dismissed: mockReminders.filter(r => r.isDismissed).length
//       }
//     };
//   },

//   markAsSeen: async (id) => {
//     await new Promise(resolve => setTimeout(resolve, 200));
//     return { success: true };
//   },

//   dismissReminder: async (id) => {
//     await new Promise(resolve => setTimeout(resolve, 300));
//     return { success: true };
//   },

//   restoreReminder: async (id) => {
//     await new Promise(resolve => setTimeout(resolve, 200));
//     return { success: true };
//   },

//   getStats: async () => {
//     await new Promise(resolve => setTimeout(resolve, 300));
//     return {
//       total: 15,
//       active: 12,
//       unseen: 3,
//       dueToday: 2,
//       overdue: 1,
//       thisWeek: 5,
//       byPriority: {
//         high: 4,
//         medium: 6,
//         low: 2
//       }
//     };
//   }
// };

const REMINDER_API = `${process.env.REACT_APP_API_BASE_URL}/reminders`;
const CREATE_REMINDER_API = `${process.env.REACT_APP_API_BASE_URL}/reminders`; // note 'reminders'

// const authHeaders = () => ({
//   headers: { 'x-auth-token': localStorage.getItem('token') }
// });

// const api = {
//   getReminders: async () => {
//     const response = await axios.get(REMINDER_API, authHeaders());
//           const data = response.data;
//       console.log("Fetched Reminders***:", data);
//     return {

//       reminders: Array.isArray(response.data) ? response.data : [response.data],
//       counts: {
//         total: response.data.length,
//         // active: response.data.filter(r => !r.isDismissed).length,
//         // unseen: response.data.filter(r => !r.isSeen && !r.isDismissed).length,
//         // dismissed: response.data.filter(r => r.isDismissed).length,
//       }
//     };
//   },

//   markAsSeen: async (id) => {
//     return await axios.patch(`${REMINDER_API}/${id}/seen`, {}, authHeaders());
//   },

//   dismissReminder: async (id) => {
//     return await axios.patch(`${REMINDER_API}/${id}/dismiss`, {}, authHeaders());
//   },

//   restoreReminder: async (id) => {
//     return await axios.patch(`${REMINDER_API}/${id}/restore`, {}, authHeaders());
//   },

//   getStats: async () => {
//     const response = await axios.get(`${REMINDER_API}/stats`, authHeaders());
//     return response.data;

//   }
// };

// Updated API functions for your ReminderItem.jsx file
// Replace the existing api object with this updated version


const authHeaders = () => ({
  headers: { 'x-auth-token': localStorage.getItem('token') }
});

const api = {
  getReminders: async (filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.status) params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.reminderType && filters.reminderType !== 'all') params.append('reminderType', filters.reminderType);
      if (filters.customerName) params.append('customerName', filters.customerName);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);

      const queryString = params.toString();
      const url = queryString ? `${REMINDER_API}?${queryString}` : REMINDER_API;
      
      const response = await axios.get(url, authHeaders());
      const reminders = Array.isArray(response.data) ? response.data : [response.data];
      
      console.log("Fetched Reminders***:", reminders);
      
      // Calculate counts from the fetched data
      const counts = {
        total: reminders.length,
        active: reminders.filter(r => !r.isDismissed).length,
        unseen: reminders.filter(r => !r.isSeen && !r.isDismissed).length,
        dismissed: reminders.filter(r => r.isDismissed).length
      };

      return {
        reminders,
        counts
      };
    } catch (error) {
      console.error('Error fetching reminders:', error);
      throw error;
    }
  },

  markAsSeen: async (id) => {
    try {
      return await axios.patch(`${REMINDER_API}/${id}/seen`, {}, authHeaders());
    } catch (error) {
      console.error('Error marking as seen:', error);
      throw error;
    }
  },

  dismissReminder: async (id) => {
    try {
      return await axios.patch(`${REMINDER_API}/${id}/dismiss`, {}, authHeaders());
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw error;
    }
  },

  restoreReminder: async (id) => {
    try {
      return await axios.patch(`${REMINDER_API}/${id}/restore`, {}, authHeaders());
    } catch (error) {
      console.error('Error restoring reminder:', error);
      throw error;
    }
  },

  getStats: async () => {
    try {
      const response = await axios.get(`${REMINDER_API}/stats`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  },

  createReminder: async (reminderData) => {
    try {
      const response = await axios.post(REMINDER_API, reminderData, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  updateReminder: async (id, reminderData) => {
    try {
      const response = await axios.put(`${REMINDER_API}/${id}`, reminderData, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error updating reminder:', error);
      throw error;
    }
  },

  // deleteReminder: async (id) => {
  //   try {
  //     const response = await axios.delete(`${REMINDER_API}/${id}`, authHeaders());
  //     return response.data;
  //   } catch (error) {
  //     console.error('Error deleting reminder:', error);
  //     throw error;
  //   }
  // },

  searchReminders: async (query, limit = 10) => {
    try {
      const response = await axios.get(`${REMINDER_API}/search?q=${encodeURIComponent(query)}&limit=${limit}`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error searching reminders:', error);
      throw error;
    }
  },

  getUpcomingReminders: async () => {
    try {
      const response = await axios.get(`${REMINDER_API}/upcoming`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming reminders:', error);
      throw error;
    }
  },

  bulkMarkAsSeen: async (reminderIds) => {
    try {
      const response = await axios.patch(`${REMINDER_API}/bulk/seen`, { reminderIds }, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error bulk marking as seen:', error);
      throw error;
    }
  },

  bulkDismiss: async (reminderIds) => {
    try {
      const response = await axios.patch(`${REMINDER_API}/bulk/dismiss`, { reminderIds }, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error bulk dismissing:', error);
      throw error;
    }
  },  
  
  deleteReminder: async (id) => {
    try {
      const response = await axios.delete(`${REMINDER_API}/${id}`, authHeaders());
      return response.data;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  },
};



// Updated fetchData function for your component

const SwipeableReminderItem = ({ reminder, onDismiss, onSeen, onRestore, onUpdate, onDelete  }) => {
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState(null); // 'left' or 'right'

  const [swipeDistance, setSwipeDistance] = useState(0);
  const [startX, setStartX] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const itemRef = useRef(null);
  const maxSwipeDistance = 200;
  const dismissThreshold = 80;

  const deleteThreshold = 80;

  const handleTouchStart = (e) => {
    if (isAnimating) return;
    setStartX(e.touches[0].clientX);
    setIsSwipeActive(true);
    setSwipeDirection(null);
  };

  const handleTouchMove = (e) => {
    if (!isSwipeActive || isAnimating) return;
    
    const currentX = e.touches[0].clientX;
    const distance = startX - currentX;
    const absDistance = Math.abs(distance);
    
    if (absDistance > 5) { // Minimum threshold to determine direction
      const direction = distance > 0 ? 'left' : 'right';
      setSwipeDirection(direction);
      
      if (absDistance <= maxSwipeDistance) {
        setSwipeDistance(distance);
      }
    }
  };

   const handleTouchEnd = async () => {
    if (!isSwipeActive || isAnimating || !swipeDirection) return;
    
    const absDistance = Math.abs(swipeDistance);
    
    if (swipeDirection === 'left' && absDistance > dismissThreshold) {
      // Left swipe - Dismiss (temporary)
      if (!reminder.isDismissed) {
        setIsAnimating(true);
        setSwipeDistance(maxSwipeDistance);
        
        setTimeout(async () => {
          await onDismiss(reminder._id);
          resetSwipeState();
        }, 300);
      } else {
        resetSwipeState();
      }
    } else if (swipeDirection === 'right' && absDistance > deleteThreshold) {
      // Right swipe - Permanent delete
      setIsAnimating(true);
      setSwipeDistance(-maxSwipeDistance);
      
      // Show confirmation or directly delete
      const confirmDelete = window.confirm('Are you sure you want to permanently delete this reminder?');
      
      if (confirmDelete) {
        setTimeout(async () => {
          await onDelete(reminder._id);
          resetSwipeState();
        }, 300);
      } else {
        resetSwipeState();
      }
    } else {
      resetSwipeState();
    }
    
    setIsSwipeActive(false);
  };

   const resetSwipeState = () => {
    setSwipeDistance(0);
    setSwipeDirection(null);
    setIsAnimating(false);
  };

  const handleMouseDown = (e) => {
    if (isAnimating) return;
    setStartX(e.clientX);
    setIsSwipeActive(true);
    setSwipeDirection(null);
  };

  const handleMouseMove = (e) => {
    if (!isSwipeActive || isAnimating) return;
    
    const currentX = e.clientX;
    const distance = startX - currentX;
    const absDistance = Math.abs(distance);
    
    if (absDistance > 5) {
      const direction = distance > 0 ? 'left' : 'right';
      setSwipeDirection(direction);
      
      if (absDistance <= maxSwipeDistance) {
        setSwipeDistance(distance);
      }
    }
  };

  const handleMouseUp = async () => {
    if (!isSwipeActive || isAnimating || !swipeDirection) return;
    
    const absDistance = Math.abs(swipeDistance);
    
    if (swipeDirection === 'left' && absDistance > dismissThreshold) {
      // Left swipe - Dismiss (temporary)
      if (!reminder.isDismissed) {
        setIsAnimating(true);
        setSwipeDistance(maxSwipeDistance);
        
        setTimeout(async () => {
          await onDismiss(reminder._id);
          resetSwipeState();
        }, 300);
      } else {
        resetSwipeState();
      }
    } else if (swipeDirection === 'right' && absDistance > deleteThreshold) {
      // Right swipe - Permanent delete
      setIsAnimating(true);
      setSwipeDistance(-maxSwipeDistance);
      
      const confirmDelete = window.confirm('Are you sure you want to permanently delete this reminder?');
      
      if (confirmDelete) {
        setTimeout(async () => {
          await onDelete(reminder._id);
          resetSwipeState();
        }, 300);
      } else {
        resetSwipeState();
      }
    } else {
      resetSwipeState();
    }
    
    setIsSwipeActive(false);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      if (isSwipeActive && !isAnimating) {
        handleMouseUp();
      }
    };

    const handleGlobalMouseMove = (e) => {
      if (isSwipeActive && !isAnimating) {
        handleMouseMove(e);
      }
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);

    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
    };
  }, [isSwipeActive, startX, swipeDistance, isAnimating, swipeDirection]);


  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const reminderDate = new Date(date);
    const diffTime = reminderDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const isOverdue = () => {
    return new Date(reminder.reminderDate) < new Date();
  };

  const handleClick = async () => {
    if (!reminder.isSeen && !reminder.isDismissed && !isAnimating && !isSwipeActive) {
      await onSeen(reminder._id);
    }
  };

   const getItemClasses = () => {
    let classes = 'reminder-item ';
    
    if (reminder.isDismissed) {
      classes += 'reminder-item-dismissed ';
    } else {
      classes += 'reminder-item-active ';
    }
    
    if (!reminder.isSeen && !reminder.isDismissed) {
      classes += 'reminder-item-unseen ';
    } else {
      classes += 'reminder-item-seen ';
    }
    
    return classes;
  };

    const getSwipeBackgroundStyle = () => {
    const absDistance = Math.abs(swipeDistance);
    
    if (swipeDirection === 'left') {
      // Left swipe - dismiss action
      const threshold = reminder.isDismissed ? 0 : dismissThreshold;
      return {
        right: 0,
        width: `${Math.min(absDistance, maxSwipeDistance)}px`,
        backgroundColor: absDistance > threshold ? '#ef4444' : '#f59e0b',
        borderRadius: '0 1rem 1rem 0'
      };
    } else if (swipeDirection === 'right') {
      // Right swipe - delete action
      return {
        left: 0,
        width: `${Math.min(absDistance, maxSwipeDistance)}px`,
        backgroundColor: absDistance > deleteThreshold ? '#dc2626' : '#ef4444',
        borderRadius: '1rem 0 0 1rem'
      };
    }
    
    return {};
  };

  const getSwipeIcon = () => {
    const absDistance = Math.abs(swipeDistance);
    
    if (swipeDirection === 'left') {
      if (reminder.isDismissed) {
        return <RotateCcw size={18} />;
      }
      return absDistance > dismissThreshold ? <Trash2 size={18} /> : <ArrowUp size={18} className="rotate-90" />;
    } else if (swipeDirection === 'right') {
      return absDistance > deleteThreshold ? <X size={18} /> : <Trash2 size={18} />;
    }
    
    return null;
  };

 return (
    <div 
      ref={itemRef}
      className={getItemClasses()}
      style={{
        transform: `translateX(-${swipeDistance}px)`,
        transition: isSwipeActive || isAnimating ? 'none' : 'transform 0.3s ease',
        borderColor: !reminder.isSeen && !reminder.isDismissed ? getPriorityColor(reminder.priority) : undefined
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
            {/* Swipe Action Background */}
      {swipeDirection && Math.abs(swipeDistance) > 20 && (
        <div 
          className="swipe-background"
          style={getSwipeBackgroundStyle()}
        >
          <div className="swipe-icon">
            {getSwipeIcon()}
          </div>
        </div>
      )}
      {/* Swipe Action Background */}
      <div 
        className="swipe-background"
        style={{
          width: `${Math.min(swipeDistance, maxSwipeDistance)}px`,
          backgroundColor: swipeDistance > dismissThreshold ? '#ef4444' : '#f59e0b'
        }}
      >
        {swipeDistance > 20 && (
          <div className="swipe-icon">
            {swipeDistance > dismissThreshold ? (
              <Trash2 size={18} />
            ) : (
              <ArrowUp size={18} className="rotate-90" />
            )}
          </div>
        )}
      </div>

      {/* Reminder Content */}
      <div className="reminder-content">
        {/* Header */}
        <div className="reminder-header">
          <div className="reminder-header-left">
            {/* Priority Indicator */}
            <div 
              className="priority-indicator"
              style={{ backgroundColor: getPriorityColor(reminder.priority) }}
            />
            
            {/* Customer Info */}
            <div className="customer-info">
              <h4 className={reminder.isDismissed ? 'customer-name customer-name-dismissed' : 'customer-name'}>
                {reminder.customerName}
              </h4>
              <p className="customer-phone">
                <User size={12} />
                {reminder.phoneNumber}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="reminder-status-indicators">
            {!reminder.isSeen && !reminder.isDismissed && (
              <div className="unseen-indicator" />
            )}
            
            {isOverdue() && !reminder.isDismissed && (
              <AlertTriangle size={16} style={{ color: '#ef4444' }} />
            )}
            
            {reminder.isDismissed && (
              <CheckCircle size={16} style={{ color: '#10b981' }} />
            )}
          </div>
        </div>

        {/* Message */}
        <div className="reminder-message-section">
          <p className={reminder.isDismissed ? 'reminder-message reminder-message-dismissed' : 'reminder-message'}>
            {reminder.message}
          </p>
        </div>

        {/* Footer */}
        <div className="reminder-footer">
          <div className="reminder-footer-left">
            <span className={isOverdue() && !reminder.isDismissed ? 'reminder-date reminder-date-overdue' : 'reminder-date'}>
              <Calendar size={12} />
              {formatDate(reminder.reminderDate)}
            </span>
            
            <span 
              className="priority-badge"
              style={{ backgroundColor: getPriorityColor(reminder.priority) }}
            >
              {reminder.priority}
            </span>
          </div>

          {/* Action buttons for dismissed reminders */}
          {reminder.isDismissed && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRestore(reminder._id);
              }}
              className="restore-btn"
            >
              <RotateCcw size={10} />
              Restore
            </button>
          )}
        </div>
        
      </div>
      
               {!reminder.isDismissed && Math.abs(swipeDistance) > 10 && Math.abs(swipeDistance) < 60 && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '0.5rem 1rem',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {swipeDirection === 'left' ? '← Swipe to dismiss' : '→ Swipe to delete'}
        </div>
      )}

      
    </div>
  );
};

const FilterBar = ({ filter, setFilter, priorityFilter, setPriorityFilter, counts }) => {
  const [showFilters, setShowFilters] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All', count: counts.total },
    { value: 'active', label: 'Active', count: counts.active },
    // { value: 'unseen', label: 'Unseen', count: counts.unseen },
    { value: 'dismissed', label: '✘', count: counts.dismissed },
    { value: 'today', label: 'Due Today', count: counts.dueToday || 0 }

  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'high', label: 'High Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'low', label: 'Low Priority' }
  ];

  

  return (
    <div className="filter-section">
      {/* Main Filter Tabs */}
      <div className="filter-main-row">
        <div className="filter-tabs-container">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={filter === option.value ? 'filter-tab filter-tab-active' : 'filter-tab filter-tab-inactive'}
            >
              {option.label}
              <span className={filter === option.value ? 'filter-count filter-count-active' : 'filter-count filter-count-inactive'}>
                {option.count}
              </span>
            </button>
          ))}
        </div>
     


      </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="filter-dropdown-btn"
        >
          <Filter size={14} />
          Filters
        </button>
      {/* Additional Filters */}
      {showFilters && (
        <div className="filter-expanded-section">
          <div className="filter-controls">
            <div className="filter-control-group">
              <label className="filter-label">Priority:</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="select-input"
              >
                {priorityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const StatsOverview = ({ stats }) => {
  if (!stats) return null;

  return (
    <div className="stats-grid">
      <div className="stats-card stats-card-blue">
        <div className="stats-number stats-number-blue">{stats.unseen}</div>
        <div className="stats-label stats-label-blue">Unseen</div>
      </div>
      <div className="stats-card stats-card-orange">
        <div className="stats-number stats-number-orange">{stats.dueToday}</div>
        <div className="stats-label">Due Today</div>
      </div>
      <div className="stats-card stats-card-red">
        <div className="stats-number stats-number-red">{stats.overdue}</div>
        <div className="stats-label">Overdue</div>
      </div>
      <div className="stats-card stats-card-green">
        <div className="stats-number stats-number-green">{stats.thisWeek}</div>
        <div className="stats-label">This Week</div>
      </div>
    </div>
  );
};

const EnhancedReminderList = () => {
  const [reminders, setReminders] = useState([]);
  const [stats, setStats] = useState({});
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [filter, priorityFilter]);
// ---------------------------------------------------------Fetch Data --------------------------------------
const fetchData = async () => {
  try {
    setLoading(true);
    
    // Build filters object
    const filters = {};
    
    if (filter !== 'all') {
      filters.status = filter;
    }
    
    if (priorityFilter !== 'all') {
      filters.priority = priorityFilter;
    }
    
    // Add any additional filters you want to support
    // filters.reminderType = reminderTypeFilter;
    // filters.customerName = searchQuery;
    
    const [reminderResponse, statsResponse] = await Promise.all([
      api.getReminders(filters),
      api.getStats()
    ]);
    
    setReminders(reminderResponse.reminders);
    setCounts(statsResponse);
    setStats(statsResponse);
  } catch (error) {
    console.error('Error fetching data:', error);
    // You might want to show an error message to the user
  } finally {
    setLoading(false);
  }
};


  const handleDismiss = async (id) => {
    try {
      await api.dismissReminder(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isDismissed: true, dismissedAt: new Date(), isSeen: true }
          : r
      ));
      fetchData();
    } catch (error) {
      console.error('Error dismissing reminder:', error);
    }
  };

  const handleSeen = async (id) => {
    try {
      await api.markAsSeen(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isSeen: true, seenAt: new Date() }
          : r
      ));
      fetchData();
    } catch (error) {
      console.error('Error marking as seen:', error);
    }
  };

  const handleRestore = async (id) => {
    try {
      await api.restoreReminder(id);
      setReminders(reminders.map(r => 
        r._id === id 
          ? { ...r, isDismissed: false, dismissedAt: null }
          : r
      ));
      fetchData();
    } catch (error) {
      console.error('Error restoring reminder:', error);
    }
  };

   // New delete handler
  const handleDelete = async (id) => {
    try {
      await api.deleteReminder(id);
      // Remove the reminder from the local state
      setReminders(reminders.filter(r => r._id !== id));
      // Refresh data to update counts
      fetchData();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      // You might want to show an error message to the user
      alert('Failed to delete reminder. Please try again.');
    }
  };

  

  // if (loading) {

  //   return (
  //     <div className="loading-container">
  //       <style>{styles}</style>
  //       <div className="loading-content">
  //         <div className="loading-spinner"></div>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="reminder-container">
      <style>{styles}</style>
      
      {/* Header */}
      <div className="reminder-header-section">
        <div className="reminder-header-flex">
          <div>
            <h1 className="reminder-title">Reminders</h1>
            <p className="reminder-subtitle">Manage your customer reminders</p>
          </div>
          <button className="reminder-add-btn">
            <Plus size={20} />
          </button>
        </div>
      </div>

      <div className="reminder-main-content">
        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Filter Bar */}
        <FilterBar 
          filter={filter}
          setFilter={setFilter}
          priorityFilter={priorityFilter}
          setPriorityFilter={setPriorityFilter}
          counts={counts}
        />

        {/* Reminders List */}
        <div>
          {reminders.length === 0 ? (
            <div className="empty-state">
              <Bell size={48} className="empty-state-icon" />
              <h3 className="empty-state-title">No reminders found</h3>
              <p className="empty-state-description">
                {filter === 'all' 
                  ? "You don't have any reminders yet."
                  : `No ${filter} reminders found.`
                }
              </p>
            </div>
          ) : (
            <>
              {reminders.map((reminder) => (
                <SwipeableReminderItem
                  key={reminder._id}
                  reminder={reminder}
                  onDismiss={handleDismiss}
                  onSeen={handleSeen}
                  onRestore={handleRestore}
                  onDelete={handleDelete}

                />
              ))}
            </>
          )}
        </div>

        {/* Help Text */}
        {reminders.length > 0 && (
          <div className="help-text">
            <p>💡 Swipe left on reminders to dismiss them</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedReminderList;