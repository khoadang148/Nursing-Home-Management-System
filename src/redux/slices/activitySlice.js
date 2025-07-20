import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import activityService from '../../api/services/activityService';

// Async thunks
export const fetchActivities = createAsyncThunk(
  'activity/fetchActivities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await activityService.getAllActivities();
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchActivityById = createAsyncThunk(
  'activity/fetchActivityById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await activityService.getActivityById(id);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createActivity = createAsyncThunk(
  'activity/createActivity',
  async (activityData, { rejectWithValue }) => {
    try {
      const formattedData = activityService.formatActivityData(activityData);
      const response = await activityService.createActivity(formattedData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateActivity = createAsyncThunk(
  'activity/updateActivity',
  async ({ id, updateData }, { rejectWithValue }) => {
    try {
      const formattedData = activityService.formatActivityData(updateData);
      const response = await activityService.updateActivity(id, formattedData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const deleteActivity = createAsyncThunk(
  'activity/deleteActivity',
  async (id, { rejectWithValue }) => {
    try {
      const response = await activityService.deleteActivity(id);
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
  activities: [],
  currentActivity: null,
  loading: false,
  error: null,
  success: false,
};

const activitySlice = createSlice({
  name: 'activity',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    },
    setCurrentActivity: (state, action) => {
      state.currentActivity = action.payload;
    },
    clearCurrentActivity: (state) => {
      state.currentActivity = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch activities
      .addCase(fetchActivities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivities.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = action.payload;
        state.success = true;
      })
      .addCase(fetchActivities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Fetch activity by ID
      .addCase(fetchActivityById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActivityById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentActivity = action.payload;
        state.success = true;
      })
      .addCase(fetchActivityById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Create activity
      .addCase(createActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities.push(action.payload);
        state.success = true;
      })
      .addCase(createActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Update activity
      .addCase(updateActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateActivity.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.activities.findIndex(activity => activity._id === action.payload._id);
        if (index !== -1) {
          state.activities[index] = action.payload;
        }
        if (state.currentActivity && state.currentActivity._id === action.payload._id) {
          state.currentActivity = action.payload;
        }
        state.success = true;
      })
      .addCase(updateActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Delete activity
      .addCase(deleteActivity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteActivity.fulfilled, (state, action) => {
        state.loading = false;
        state.activities = state.activities.filter(activity => activity._id !== action.payload);
        if (state.currentActivity && state.currentActivity._id === action.payload) {
          state.currentActivity = null;
        }
        state.success = true;
      })
      .addCase(deleteActivity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSuccess, setCurrentActivity, clearCurrentActivity } = activitySlice.actions;
export default activitySlice.reducer; 