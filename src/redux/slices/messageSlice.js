import { createSlice } from '@reduxjs/toolkit';

const messageSlice = createSlice({
  name: 'messages',
  initialState: {
    unreadMessageCount: 0,
    unreadNotificationCount: 0,
    lastUpdated: null,
  },
  reducers: {
    setUnreadMessageCount: (state, action) => {
      state.unreadMessageCount = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    setUnreadNotificationCount: (state, action) => {
      state.unreadNotificationCount = action.payload;
      state.lastUpdated = new Date().toISOString();
    },
    incrementUnreadMessages: (state) => {
      state.unreadMessageCount += 1;
    },
    decrementUnreadMessages: (state, action) => {
      const count = action.payload || 1;
      state.unreadMessageCount = Math.max(0, state.unreadMessageCount - count);
    },
    incrementUnreadNotifications: (state) => {
      state.unreadNotificationCount += 1;
    },
    decrementUnreadNotifications: (state, action) => {
      const count = action.payload || 1;
      state.unreadNotificationCount = Math.max(0, state.unreadNotificationCount - count);
    },
    clearAllUnreadCounts: (state) => {
      state.unreadMessageCount = 0;
      state.unreadNotificationCount = 0;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const {
  setUnreadMessageCount,
  setUnreadNotificationCount,
  incrementUnreadMessages,
  decrementUnreadMessages,
  incrementUnreadNotifications,
  decrementUnreadNotifications,
  clearAllUnreadCounts,
} = messageSlice.actions;

export default messageSlice.reducer;

