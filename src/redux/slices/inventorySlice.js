import { createSlice } from '@reduxjs/toolkit';
import { inventory } from '../../api/mockData';

// Initial state
const initialState = {
  inventoryItems: inventory,
  currentItem: null,
  isLoading: false,
  error: null,
};

// Inventory slice
const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    // Simple inventory operations for now
    setInventoryItems: (state, action) => {
      state.inventoryItems = action.payload;
    },
    setCurrentItem: (state, action) => {
      state.currentItem = action.payload;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    addInventoryItem: (state, action) => {
      state.inventoryItems.push(action.payload);
    },
    updateInventoryItem: (state, action) => {
      const index = state.inventoryItems.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.inventoryItems[index] = action.payload;
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      }
    },
    deleteInventoryItem: (state, action) => {
      state.inventoryItems = state.inventoryItems.filter(item => item.id !== action.payload);
      if (state.currentItem?.id === action.payload) {
        state.currentItem = null;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetError: (state) => {
      state.error = null;
    },
  },
});

export const {
  setInventoryItems,
  setCurrentItem,
  clearCurrentItem,
  addInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  setLoading,
  setError,
  resetError,
} = inventorySlice.actions;

export default inventorySlice.reducer; 