import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import residentReducer from './slices/residentSlice';
import staffReducer from './slices/staffSlice';
import activityReducer from './slices/activitySlice';
import notificationReducer from './slices/notificationSlice';
import inventoryReducer from './slices/inventorySlice';
import medicationReducer from './slices/medicationSlice';

// Configure redux store
export const store = configureStore({
  reducer: {
    auth: authReducer,
    residents: residentReducer,
    staff: staffReducer,
    activities: activityReducer,
    notifications: notificationReducer,
    inventory: inventoryReducer,
    medications: medicationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store; 