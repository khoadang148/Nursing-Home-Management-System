import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import staffService from '../../api/staffService';

// Fetch all staff
export const fetchAllStaff = createAsyncThunk(
  'staff/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await staffService.getAllStaff();
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch staff');
    }
  }
);

// Fetch staff details
export const fetchStaffDetails = createAsyncThunk(
  'staff/fetchDetails',
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffDetails(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch staff details');
    }
  }
);

// Fetch staff schedule
export const fetchStaffSchedule = createAsyncThunk(
  'staff/fetchSchedule',
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffSchedule(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { staffId: id, schedule: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch staff schedule');
    }
  }
);

// Fetch staff tasks
export const fetchStaffTasks = createAsyncThunk(
  'staff/fetchTasks',
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.getStaffTasks(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { staffId: id, tasks: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch staff tasks');
    }
  }
);

// Create new staff
export const createStaff = createAsyncThunk(
  'staff/create',
  async (staffData, { rejectWithValue }) => {
    try {
      const response = await staffService.createStaff(staffData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create staff');
    }
  }
);

// Update staff
export const updateStaff = createAsyncThunk(
  'staff/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaff(id, data);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update staff');
    }
  }
);

// Delete staff
export const deleteStaff = createAsyncThunk(
  'staff/delete',
  async (id, { rejectWithValue }) => {
    try {
      const response = await staffService.deleteStaff(id);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete staff');
    }
  }
);

// Update staff schedule
export const updateStaffSchedule = createAsyncThunk(
  'staff/updateSchedule',
  async ({ id, scheduleData }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateStaffSchedule(id, scheduleData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { staffId: id, schedule: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update staff schedule');
    }
  }
);

// Assign task to staff
export const assignTask = createAsyncThunk(
  'staff/assignTask',
  async ({ staffId, taskData }, { rejectWithValue }) => {
    try {
      const response = await staffService.assignTask(staffId, taskData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { staffId, task: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to assign task');
    }
  }
);

// Update task status
export const updateTaskStatus = createAsyncThunk(
  'staff/updateTaskStatus',
  async ({ taskId, status, completedAt = null }, { rejectWithValue }) => {
    try {
      const response = await staffService.updateTaskStatus(taskId, status, completedAt);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update task status');
    }
  }
);

// Search staff
export const searchStaff = createAsyncThunk(
  'staff/search',
  async (criteria, { rejectWithValue }) => {
    try {
      const response = await staffService.searchStaff(criteria);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to search staff');
    }
  }
);

// Initial state
const initialState = {
  staff: [],
  currentStaffMember: null,
  schedules: {},
  tasks: {},
  searchResults: [],
  isLoading: false,
  error: null,
};

// Staff slice
const staffSlice = createSlice({
  name: 'staff',
  initialState,
  reducers: {
    resetStaffError: (state) => {
      state.error = null;
    },
    clearCurrentStaffMember: (state) => {
      state.currentStaffMember = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all staff
      .addCase(fetchAllStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff = action.payload;
      })
      .addCase(fetchAllStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch staff';
      })
      
      // Fetch staff details
      .addCase(fetchStaffDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentStaffMember = action.payload;
        
        // Update in staff array if exists
        const index = state.staff.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
      })
      .addCase(fetchStaffDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch staff details';
      })
      
      // Fetch staff schedule
      .addCase(fetchStaffSchedule.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStaffSchedule.fulfilled, (state, action) => {
        state.isLoading = false;
        state.schedules[action.payload.staffId] = action.payload.schedule;
      })
      .addCase(fetchStaffSchedule.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch staff schedule';
      })
      
      // Fetch staff tasks
      .addCase(fetchStaffTasks.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchStaffTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks[action.payload.staffId] = action.payload.tasks;
      })
      .addCase(fetchStaffTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to fetch staff tasks';
      })
      
      // Create new staff
      .addCase(createStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.staff.push(action.payload);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to create staff';
      })
      
      // Update staff
      .addCase(updateStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Update in staff array
        const index = state.staff.findIndex(s => s.id === action.payload.id);
        if (index !== -1) {
          state.staff[index] = action.payload;
        }
        
        // Update current staff member if it's the same one
        if (state.currentStaffMember && state.currentStaffMember.id === action.payload.id) {
          state.currentStaffMember = action.payload;
        }
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to update staff';
      })
      
      // Delete staff
      .addCase(deleteStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Remove from staff array
        state.staff = state.staff.filter(s => s.id !== action.payload);
        
        // Clear current staff member if it's the same one
        if (state.currentStaffMember && state.currentStaffMember.id === action.payload) {
          state.currentStaffMember = null;
        }
        
        // Clear related data
        if (state.schedules[action.payload]) {
          delete state.schedules[action.payload];
        }
        if (state.tasks[action.payload]) {
          delete state.tasks[action.payload];
        }
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to delete staff';
      })
      
      // Update staff schedule
      .addCase(updateStaffSchedule.fulfilled, (state, action) => {
        const { staffId, schedule } = action.payload;
        state.schedules[staffId] = schedule;
        
        // Update schedule in staff member if available
        if (state.currentStaffMember && state.currentStaffMember.id === staffId) {
          state.currentStaffMember.schedule = schedule;
        }
      })
      
      // Assign task to staff
      .addCase(assignTask.fulfilled, (state, action) => {
        const { staffId, task } = action.payload;
        if (state.tasks[staffId]) {
          state.tasks[staffId].push(task);
        } else {
          state.tasks[staffId] = [task];
        }
      })
      
      // Update task status
      .addCase(updateTaskStatus.fulfilled, (state, action) => {
        const updatedTask = action.payload;
        const staffId = updatedTask.assignedTo;
        
        // Update task in staff tasks if available
        if (state.tasks[staffId]) {
          const taskIndex = state.tasks[staffId].findIndex(t => t.id === updatedTask.id);
          if (taskIndex !== -1) {
            state.tasks[staffId][taskIndex] = updatedTask;
          }
        }
      })
      
      // Search staff
      .addCase(searchStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Failed to search staff';
        state.searchResults = [];
      });
  },
});

export const { resetStaffError, clearCurrentStaffMember } = staffSlice.actions;

export default staffSlice.reducer; 