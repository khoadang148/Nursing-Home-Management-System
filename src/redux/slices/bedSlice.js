import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import bedService from '../../api/services/bedService';

// Async thunks
export const createBed = createAsyncThunk(
  'bed/createBed',
  async (bedData, { rejectWithValue }) => {
    try {
      const response = await bedService.createBed(bedData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Tạo giường thất bại');
    }
  }
);

export const getAllBeds = createAsyncThunk(
  'bed/getAllBeds',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bedService.getAllBeds(params);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lấy danh sách giường thất bại');
    }
  }
);

export const getBedById = createAsyncThunk(
  'bed/getBedById',
  async (bedId, { rejectWithValue }) => {
    try {
      const response = await bedService.getBedById(bedId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lấy thông tin giường thất bại');
    }
  }
);

export const getBedsByRoomId = createAsyncThunk(
  'bed/getBedsByRoomId',
  async (roomId, { rejectWithValue }) => {
    try {
      const response = await bedService.getBedsByRoomId(roomId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lấy danh sách giường theo phòng thất bại');
    }
  }
);

export const updateBed = createAsyncThunk(
  'bed/updateBed',
  async ({ bedId, updateData }, { rejectWithValue }) => {
    try {
      const response = await bedService.updateBed(bedId, updateData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return { bedId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.message || 'Cập nhật giường thất bại');
    }
  }
);

export const deleteBed = createAsyncThunk(
  'bed/deleteBed',
  async (bedId, { rejectWithValue }) => {
    try {
      const response = await bedService.deleteBed(bedId);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return bedId;
    } catch (error) {
      return rejectWithValue(error.message || 'Xóa giường thất bại');
    }
  }
);

export const searchBeds = createAsyncThunk(
  'bed/searchBeds',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await bedService.searchBeds(searchParams);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Tìm kiếm giường thất bại');
    }
  }
);

export const getAvailableBeds = createAsyncThunk(
  'bed/getAvailableBeds',
  async (params, { rejectWithValue }) => {
    try {
      const response = await bedService.getAvailableBeds(params);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Lấy danh sách giường có sẵn thất bại');
    }
  }
);

// Initial state
const initialState = {
  beds: [],
  currentBed: null,
  availableBeds: [],
  searchResults: [],
  isLoading: false,
  error: null,
  message: null,
  filters: {
    status: '',
    bed_type: '',
    room_id: ''
  }
};

// Bed slice
const bedSlice = createSlice({
  name: 'bed',
  initialState,
  reducers: {
    resetBedError: (state) => {
      state.error = null;
    },
    resetBedMessage: (state) => {
      state.message = null;
    },
    clearBedState: (state) => {
      state.error = null;
      state.message = null;
    },
    setBedFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearBedFilters: (state) => {
      state.filters = {
        status: '',
        bed_type: '',
        room_id: ''
      };
    },
    clearCurrentBed: (state) => {
      state.currentBed = null;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
    }
  },
  extraReducers: (builder) => {
    builder
      // Create bed
      .addCase(createBed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tạo giường...';
      })
      .addCase(createBed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.beds.unshift(action.payload);
        state.error = null;
        state.message = 'Tạo giường thành công!';
      })
      .addCase(createBed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Tạo giường thất bại';
        state.message = null;
      })
      
      // Get all beds
      .addCase(getAllBeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tải danh sách giường...';
      })
      .addCase(getAllBeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.beds = action.payload;
        state.error = null;
        state.message = 'Lấy danh sách giường thành công!';
      })
      .addCase(getAllBeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Lấy danh sách giường thất bại';
        state.message = null;
      })
      
      // Get bed by ID
      .addCase(getBedById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tải thông tin giường...';
      })
      .addCase(getBedById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentBed = action.payload;
        state.error = null;
        state.message = 'Lấy thông tin giường thành công!';
      })
      .addCase(getBedById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Lấy thông tin giường thất bại';
        state.message = null;
      })
      
      // Get beds by room ID
      .addCase(getBedsByRoomId.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tải danh sách giường theo phòng...';
      })
      .addCase(getBedsByRoomId.fulfilled, (state, action) => {
        state.isLoading = false;
        state.beds = action.payload;
        state.error = null;
        state.message = 'Lấy danh sách giường theo phòng thành công!';
      })
      .addCase(getBedsByRoomId.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Lấy danh sách giường theo phòng thất bại';
        state.message = null;
      })
      
      // Update bed
      .addCase(updateBed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang cập nhật giường...';
      })
      .addCase(updateBed.fulfilled, (state, action) => {
        state.isLoading = false;
        const { bedId, data } = action.payload;
        const index = state.beds.findIndex(bed => bed._id === bedId);
        if (index !== -1) {
          state.beds[index] = data;
        }
        if (state.currentBed && state.currentBed._id === bedId) {
          state.currentBed = data;
        }
        state.error = null;
        state.message = 'Cập nhật giường thành công!';
      })
      .addCase(updateBed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Cập nhật giường thất bại';
        state.message = null;
      })
      
      // Delete bed
      .addCase(deleteBed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang xóa giường...';
      })
      .addCase(deleteBed.fulfilled, (state, action) => {
        state.isLoading = false;
        const bedId = action.payload;
        state.beds = state.beds.filter(bed => bed._id !== bedId);
        if (state.currentBed && state.currentBed._id === bedId) {
          state.currentBed = null;
        }
        state.error = null;
        state.message = 'Xóa giường thành công!';
      })
      .addCase(deleteBed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Xóa giường thất bại';
        state.message = null;
      })
      
      // Search beds
      .addCase(searchBeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tìm kiếm giường...';
      })
      .addCase(searchBeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
        state.error = null;
        state.message = 'Tìm kiếm giường thành công!';
      })
      .addCase(searchBeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Tìm kiếm giường thất bại';
        state.message = null;
      })
      
      // Get available beds
      .addCase(getAvailableBeds.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang tải danh sách giường có sẵn...';
      })
      .addCase(getAvailableBeds.fulfilled, (state, action) => {
        state.isLoading = false;
        state.availableBeds = action.payload;
        state.error = null;
        state.message = 'Lấy danh sách giường có sẵn thành công!';
      })
      .addCase(getAvailableBeds.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Lấy danh sách giường có sẵn thất bại';
        state.message = null;
      });
  }
});

export const {
  resetBedError,
  resetBedMessage,
  clearBedState,
  setBedFilters,
  clearBedFilters,
  clearCurrentBed,
  clearSearchResults
} = bedSlice.actions;

export default bedSlice.reducer; 