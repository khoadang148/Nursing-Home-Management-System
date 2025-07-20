import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import residentService from '../../api/services/residentService';

// Async thunks
export const fetchAllResidents = createAsyncThunk(
  'resident/fetchAllResidents',
  async (_, { rejectWithValue }) => {
    try {
      const response = await residentService.getAllResidents();
      if (response.success) {
        return response.data.map(resident => residentService.formatResidentForDisplay(resident));
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResidentById = createAsyncThunk(
  'resident/fetchResidentById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.getResidentById(id);
      if (response.success) {
        return residentService.formatResidentForDisplay(response.data);
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchResidentsByFamilyMember = createAsyncThunk(
  'resident/fetchResidentsByFamilyMember',
  async (familyMemberId, { rejectWithValue }) => {
    try {
      const response = await residentService.getResidentsByFamilyMember(familyMemberId);
      if (response.success) {
        return response.data.map(resident => residentService.formatResidentForDisplay(resident));
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createResident = createAsyncThunk(
  'resident/createResident',
  async (residentData, { rejectWithValue }) => {
    try {
      const formattedData = residentService.formatResidentData(residentData);
      const response = await residentService.createResident(formattedData);
      if (response.success) {
        return residentService.formatResidentForDisplay(response.data);
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateResident = createAsyncThunk(
  'resident/updateResident',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const formattedData = residentService.formatResidentData(updateData);
      const response = await residentService.updateResident(id, formattedData);
      if (response.success) {
        return residentService.formatResidentForDisplay(response.data);
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteResident = createAsyncThunk(
  'resident/deleteResident',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.deleteResident(id);
      if (response.success) {
        return id;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  allResidents: [],
  familyResidents: [],
  currentResident: null,
  loading: false,
  error: null,
  success: false,
};

const residentSlice = createSlice({
  name: 'resident',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentResident: (state, action) => {
      state.currentResident = action.payload;
    },
    clearCurrentResident: (state) => {
      state.currentResident = null;
    },
    clearFamilyResidents: (state) => {
      state.familyResidents = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all residents
      .addCase(fetchAllResidents.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllResidents.fulfilled, (state, action) => {
        state.loading = false;
        state.allResidents = action.payload;
        state.success = true;
      })
      .addCase(fetchAllResidents.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch resident by ID
      .addCase(fetchResidentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResidentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentResident = action.payload;
        state.success = true;
      })
      .addCase(fetchResidentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch residents by family member
      .addCase(fetchResidentsByFamilyMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchResidentsByFamilyMember.fulfilled, (state, action) => {
        state.loading = false;
        state.familyResidents = action.payload;
        state.success = true;
      })
      .addCase(fetchResidentsByFamilyMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create resident
      .addCase(createResident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createResident.fulfilled, (state, action) => {
        state.loading = false;
        state.allResidents.push(action.payload);
        state.familyResidents.push(action.payload);
        state.success = true;
      })
      .addCase(createResident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update resident
      .addCase(updateResident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateResident.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.allResidents.findIndex(resident => resident._id === action.payload._id);
        if (index !== -1) {
          state.allResidents[index] = action.payload;
        }
        const familyIndex = state.familyResidents.findIndex(resident => resident._id === action.payload._id);
        if (familyIndex !== -1) {
          state.familyResidents[familyIndex] = action.payload;
        }
        if (state.currentResident && state.currentResident._id === action.payload._id) {
          state.currentResident = action.payload;
        }
        state.success = true;
      })
      .addCase(updateResident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete resident
      .addCase(deleteResident.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteResident.fulfilled, (state, action) => {
        state.loading = false;
        state.allResidents = state.allResidents.filter(resident => resident._id !== action.payload);
        state.familyResidents = state.familyResidents.filter(resident => resident._id !== action.payload);
        if (state.currentResident && state.currentResident._id === action.payload) {
          state.currentResident = null;
        }
        state.success = true;
      })
      .addCase(deleteResident.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { 
  clearError, 
  clearSuccess, 
  setCurrentResident, 
  clearCurrentResident,
  clearFamilyResidents 
} = residentSlice.actions;

export default residentSlice.reducer; 