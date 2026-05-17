const BASE_URL = 'https://serverczone.vercel.app/api';

// Token management
const getToken = () => localStorage.getItem('token');
const setToken = (token) => localStorage.setItem('token', token);
const removeToken = () => localStorage.removeItem('token');

// Create headers with authentication
const createHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

// Generic API call handler
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: createHeaders(),
      ...options
    });

    // Handle unauthorized responses
    if (response.status === 401) {
      removeToken();
      // Redirect to login or handle unauthorized
      window.location.href = '/login';
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// API methods that replace your mock API
const api = {
  // Get reminders with filtering
  getReminders: async (filters = {}) => {
    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'all') {
        params.append('status', filters.status);
      }
      if (filters.priority && filters.priority !== 'all') {
        params.append('priority', filters.priority);
      }

      const queryString = params.toString();
      const endpoint = `/reminders${queryString ? `?${queryString}` : ''}`;
      
      const data = await apiCall(endpoint);
      
      // Transform backend data to match your frontend structure
      return {
        reminders: data.reminders || [],
        counts: data.counts || {
          total: 0,
          active: 0,
          unseen: 0,
          dismissed: 0
        }
      };
    } catch (error) {
      console.error('Error fetching reminders:', error);
      // Return empty data structure on error
      return {
        reminders: [],
        counts: { total: 0, active: 0, unseen: 0, dismissed: 0 }
      };
    }
  },

  // Mark reminder as seen
  markAsSeen: async (id) => {
    try {
      return await apiCall(`/reminders/${id}/seen`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error marking reminder as seen:', error);
      throw error;
    }
  },

  // Dismiss a reminder
  dismissReminder: async (id) => {
    try {
      return await apiCall(`/reminders/${id}/dismiss`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error dismissing reminder:', error);
      throw error;
    }
  },

  // Restore a dismissed reminder
  restoreReminder: async (id) => {
    try {
      return await apiCall(`/reminders/${id}/restore`, {
        method: 'PATCH'
      });
    } catch (error) {
      console.error('Error restoring reminder:', error);
      throw error;
    }
  },

  // Get stats dashboard
  getStats: async () => {
    try {
      return await apiCall('/reminders/stats');
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Return default stats on error
      return {
        total: 0,
        active: 0,
        unseen: 0,
        dueToday: 0,
        overdue: 0,
        thisWeek: 0,
        byPriority: {
          high: 0,
          medium: 0,
          low: 0
        }
      };
    }
  },

  // Create new reminder
  createReminder: async (reminderData) => {
    try {
      return await apiCall('/reminders', {
        method: 'POST',
        body: JSON.stringify(reminderData)
      });
    } catch (error) {
      console.error('Error creating reminder:', error);
      throw error;
    }
  },

  // Delete reminder permanently
  deleteReminder: async (id) => {
    try {
      return await apiCall(`/reminders/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.error('Error deleting reminder:', error);
      throw error;
    }
  }
};

// Auth helpers (you might need these)
export const authAPI = {
  login: async (credentials) => {
    try {
      const response = await apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      });
      
      if (response.token) {
        setToken(response.token);
      }
      
      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },

  logout: () => {
    removeToken();
    window.location.href = '/login';
  },

  isAuthenticated: () => {
    return !!getToken();
  }
};

export default api;