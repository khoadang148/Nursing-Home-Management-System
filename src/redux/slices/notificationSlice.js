import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { notifications } from '../../api/mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Fetch all notifications
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async () => {
    await simulateNetworkDelay();
    return notifications;
  }
);

// Mark notification as read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async (id) => {
    await simulateNetworkDelay();
    return id;
  }
);

// Delete notification
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (id) => {
    await simulateNetworkDelay();
    return id;
  }
);

// Add new notification (for simulating real-time notifications)
export const addNotification = createAsyncThunk(
  'notifications/add',
  async (notificationData) => {
    await simulateNetworkDelay();
    const newNotification = {
      id: (notifications.length + 1).toString(),
// Add new notification (for simulating real-time notifications)
      isRead: false,
      ...notificationData,
    };
    return newNotification;
  }
);

// Initial state
const initialState = {
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,
};

// Calculate unread count
const calculateUnreadCount = (notifications) => {
  return notifications.filter(notification => !notification.isRead).length;
};

// Notification slice
const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotifications: (state) => {
      state.notifications = [];
      state.unreadCount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all notifications
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
        state.unreadCount = calculateUnreadCount(action.payload);
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to fetch notifications';
      })
      
      // Mark notification as read
      .addCase(markAsRead.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Find and mark notification as read
        const notification = state.notifications.find(n => n.id === action.payload);
        if (notification && !notification.isRead) {
          notification.isRead = true;
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Delete notification
      .addCase(deleteNotification.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove notification from list
        const deletedNotification = state.notifications.find(n => n.id === action.payload);
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        
        // Update unread count if necessary
        if (deletedNotification && !deletedNotification.isRead) {
          state.unreadCount = Math.max(0, state.unreadCount - 1);
        }
      })
      
      // Add new notification
      .addCase(addNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        state.unreadCount += 1;
      });
  },
});

export const { clearNotifications } = notificationSlice.actions;

export default notificationSlice.reducer; 