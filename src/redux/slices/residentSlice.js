import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import residentService from '../../api/residentService';

// Fetch all residents
export const fetchAllResidents = createAsyncThunk(
  'residents/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await residentService.getAllResidents();
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch residents');
    }
  }
);

// Fetch resident details
export const fetchResidentDetails = createAsyncThunk(
  'residents/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.getResidentDetails(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch resident details');
    }
  }
);

// Fetch resident medications
export const fetchResidentMedications = createAsyncThunk(
  'residents/fetchMedications',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.getMedications(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId: id, medications: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch medications');
    }
  }
);

// Fetch resident care plans
export const fetchResidentCarePlans = createAsyncThunk(
  'residents/fetchCarePlans',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.getCarePlans(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId: id, carePlans: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch care plans');
    }
  }
);

// Fetch resident vital signs
export const fetchResidentVitals = createAsyncThunk(
  'residents/fetchVitals',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.getVitals(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId: id, vitals: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch vitals');
    }
  }
);

// Create new resident
export const createResident = createAsyncThunk(
  'residents/create',
  async (residentData, { rejectWithValue }) => {
    try {
      const response = await residentService.createResident(residentData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create resident');
    }
  }
);

// Update resident
export const updateResident = createAsyncThunk(
  'residents/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await residentService.updateResident(id, data);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update resident');
    }
  }
);

// Delete resident
export const deleteResident = createAsyncThunk(
  'residents/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await residentService.deleteResident(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete resident');
    }
  }
);

// Search residents
export const searchResidents = createAsyncThunk(
  'residents/search',
  async (criteria, { rejectWithValue }) => {
    try {
      const response = await residentService.searchResidents(criteria);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search residents');
    }
  }
);

// Add medication for resident
export const addMedication = createAsyncThunk(
  'residents/addMedication',
  async ({ residentId, medicationData }, { rejectWithValue }) => {
    try {
      const response = await residentService.addMedication(residentId, medicationData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId, medication: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add medication');
    }
  }
);

// Add care plan for resident
export const addCarePlan = createAsyncThunk(
  'residents/addCarePlan',
  async ({ residentId, carePlanData }, { rejectWithValue }) => {
    try {
      const response = await residentService.addCarePlan(residentId, carePlanData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId, carePlan: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to add care plan');
    }
  }
);

// Record vital signs for resident
export const recordVitals = createAsyncThunk(
  'residents/recordVitals',
  async ({ residentId, vitalsData }, { rejectWithValue }) => {
    try {
      const response = await residentService.recordVitals(residentId, vitalsData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { residentId, vitals: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to record vitals');
    }
  }
);

// Initial state
const initialState = {
  residents: [],
  currentResident: null,
  medications: {},
  carePlans: {},
  vitals: {},
  searchResults: [],
  isLoading: false,
  error: null,
};

// Resident slice
const residentSlice = createSlice({
  name: 'residents',
  initialState,
  reducers: {
    resetResidentError: (state) => {
      state.error = null;
    },
    clearCurrentResident: (state) => {
      state.currentResident = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all residents
      .addCase(fetchAllResidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllResidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.residents = action.payload;
      })
      .addCase(fetchAllResidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch residents';
      })
      
      // Fetch resident details
      .addCase(fetchResidentDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchResidentDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentResident = action.payload;
        
        // Update in residents array if exists
        const index = state.residents.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.residents[index] = action.payload;
        }
      })
      .addCase(fetchResidentDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch resident details';
      })
      
      // Fetch resident medications
      .addCase(fetchResidentMedications.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResidentMedications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medications[action.payload.residentId] = action.payload.medications;
      })
      .addCase(fetchResidentMedications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch medications';
      })
      
      // Fetch resident care plans
      .addCase(fetchResidentCarePlans.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResidentCarePlans.fulfilled, (state, action) => {
        state.isLoading = false;
        state.carePlans[action.payload.residentId] = action.payload.carePlans;
      })
      .addCase(fetchResidentCarePlans.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch care plans';
      })
      
      // Fetch resident vitals
      .addCase(fetchResidentVitals.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchResidentVitals.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vitals[action.payload.residentId] = action.payload.vitals;
      })
      .addCase(fetchResidentVitals.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch vitals';
      })
      
      // Create new resident
      .addCase(createResident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createResident.fulfilled, (state, action) => {
        state.isLoading = false;
        state.residents.push(action.payload);
      })
      .addCase(createResident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create resident';
      })
      
      // Update resident
      .addCase(updateResident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateResident.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update in residents array
        const index = state.residents.findIndex(r => r.id === action.payload.id);
        if (index !== -1) {
          state.residents[index] = action.payload;
        }
        
        // Update current resident if it's the same one
        if (state.currentResident && state.currentResident.id === action.payload.id) {
          state.currentResident = action.payload;
        }
      })
      .addCase(updateResident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update resident';
      })
      
      // Delete resident
      .addCase(deleteResident.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteResident.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from residents array
        state.residents = state.residents.filter(r => r.id !== action.payload);
        
        // Clear current resident if it's the same one
        if (state.currentResident && state.currentResident.id === action.payload) {
          state.currentResident = null;
        }
        
        // Clear related data
        if (state.medications[action.payload]) {
          delete state.medications[action.payload];
        }
        if (state.carePlans[action.payload]) {
          delete state.carePlans[action.payload];
        }
        if (state.vitals[action.payload]) {
          delete state.vitals[action.payload];
        }
      })
      .addCase(deleteResident.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete resident';
      })
      
      // Search residents
      .addCase(searchResidents.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchResidents.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchResidents.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to search residents';
        state.searchResults = [];
      })
      
      // Add medication
      .addCase(addMedication.fulfilled, (state, action) => {
        const { residentId, medication } = action.payload;
        if (state.medications[residentId]) {
          state.medications[residentId].push(medication);
        } else {
          state.medications[residentId] = [medication];
        }
      })
      
      // Add care plan
      .addCase(addCarePlan.fulfilled, (state, action) => {
        const { residentId, carePlan } = action.payload;
        if (state.carePlans[residentId]) {
          state.carePlans[residentId].push(carePlan);
        } else {
          state.carePlans[residentId] = [carePlan];
        }
      })
      
      // Record vitals
      .addCase(recordVitals.fulfilled, (state, action) => {
        const { residentId, vitals } = action.payload;
        if (state.vitals[residentId]) {
          state.vitals[residentId].push(vitals);
        } else {
          state.vitals[residentId] = [vitals];
        }
      });
  },
});

export const { resetResidentError, clearCurrentResident } = residentSlice.actions;

export default residentSlice.reducer; 