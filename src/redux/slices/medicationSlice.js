import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { medicationService } from '../../api/medicationService';

// Async thunks
export const fetchMedications = createAsyncThunk(
  'medications/fetchMedications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await medicationService.getMedications();
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMedicationById = createAsyncThunk(
  'medications/fetchMedicationById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await medicationService.getMedicationById(id);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createMedication = createAsyncThunk(
  'medications/createMedication',
  async (medicationData, { rejectWithValue }) => {
    try {
      const response = await medicationService.createMedication(medicationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateMedication = createAsyncThunk(
  'medications/updateMedication',
  async ({ id, medicationData }, { rejectWithValue }) => {
    try {
      const response = await medicationService.updateMedication(id, medicationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteMedication = createAsyncThunk(
  'medications/deleteMedication',
  async (id, { rejectWithValue }) => {
    try {
      await medicationService.deleteMedication(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const recordMedicationAdministration = createAsyncThunk(
  'medications/recordAdministration',
  async ({ medicationId, administrationData }, { rejectWithValue }) => {
    try {
      const response = await medicationService.recordAdministration(medicationId, administrationData);
      return response;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  medications: [],
  currentMedication: null,
  loading: false,
  error: null,
  success: false,
};

const medicationSlice = createSlice({
  name: 'medications',
  initialState,
  reducers: {
    resetMedicationState: (state) => {
      state.success = false;
      state.error = null;
    },
    clearCurrentMedication: (state) => {
      state.currentMedication = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all medications
      .addCase(fetchMedications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedications.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = action.payload;
      })
      .addCase(fetchMedications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch medication by ID
      .addCase(fetchMedicationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMedicationById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentMedication = action.payload;
      })
      .addCase(fetchMedicationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create medication
      .addCase(createMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(createMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medications.push(action.payload);
        state.success = true;
      })
      .addCase(createMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Update medication
      .addCase(updateMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = state.medications.map(medication => 
          medication.id === action.payload.id ? action.payload : medication
        );
        if (state.currentMedication && state.currentMedication.id === action.payload.id) {
          state.currentMedication = action.payload;
        }
        state.success = true;
      })
      .addCase(updateMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.success = false;
      })
      
      // Delete medication
      .addCase(deleteMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.medications = state.medications.filter(medication => medication.id !== action.payload);
        if (state.currentMedication && state.currentMedication.id === action.payload) {
          state.currentMedication = null;
        }
        state.success = true;
      })
      .addCase(deleteMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Record medication administration
      .addCase(recordMedicationAdministration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordMedicationAdministration.fulfilled, (state, action) => {
        state.loading = false;
        // Update the medication in the state with the new administration record
        const { medicationId, administration } = action.payload;
        state.medications = state.medications.map(medication => {
          if (medication.id === medicationId) {
            return {
              ...medication,
              administrationHistory: [...(medication.administrationHistory || []), administration]
            };
          }
          return medication;
        });
        
        // Also update currentMedication if it's the one being administered
        if (state.currentMedication && state.currentMedication.id === medicationId) {
          state.currentMedication = {
            ...state.currentMedication,
            administrationHistory: [...(state.currentMedication.administrationHistory || []), administration]
          };
        }
        state.success = true;
      })
      .addCase(recordMedicationAdministration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetMedicationState, clearCurrentMedication } = medicationSlice.actions;
export default medicationSlice.reducer; 