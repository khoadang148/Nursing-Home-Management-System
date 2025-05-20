import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getAllActivities, getActivityById, createNewActivity, updateActivityById, deleteActivityById } from '../../api/activityService';

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activities/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllActivities();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActivityDetails = createAsyncThunk(
  'activities/fetchActivityDetails',
  async (activityId, { rejectWithValue }) => {
    try {
      const data = await getActivityById(activityId);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createActivity = createAsyncThunk(
  'activities/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const data = await createNewActivity(activityData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activities/updateActivity',
  async ({ activityId, activityData }, { rejectWithValue }) => {
    try {
      const data = await updateActivityById(activityId, activityData);
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activities/deleteActivity',
  async (activityId, { rejectWithValue }) => {
    try {
      await deleteActivityById(activityId);
      return activityId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  activities: [],
  selectedActivity: null,
  loading: false,
  error: null,
  activeFilters: {
    type: 'all',
    date: 'upcoming',
    search: '',
  }
};

const activitySlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    clearSelectedActivity: (state) => {
      state.selectedActivity = null;
    },
    setActiveFilters: (state, action) => {
      state.activeFilters = { ...state.activeFilters, ...action.payload };
    },
    resetFilters: (state) => {
      state.activeFilters = {
        type: 'all',
        date: 'upcoming',
        search: '',
      };
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch Activity Details
      .addCase(fetchActivityDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedActivity = action.payload;
      })
      .addCase(fetchActivityDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create Activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities.push(action.payload);
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update Activity
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity.id === action.payload.id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.selectedActivity && state.selectedActivity.id === action.payload.id) {
          state.selectedActivity = action.payload;
        }
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete Activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = state.activities.filter(activity => activity.id !== action.payload);
        if (state.selectedActivity && state.selectedActivity.id === action.payload) {
          state.selectedActivity = null;
        }
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSelectedActivity, setActiveFilters, resetFilters } = activitySlice.actions;
export default activitySlice.reducer; 