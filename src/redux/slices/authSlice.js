import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../api/services/authService';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Check if user is already logged in
export const checkAuthState = createAsyncThunk(
  'auth/checkAuthState',
  async () => {
    const response = await authService.isAuthenticated();
    return response;
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.login(email, password);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.logout();
      if (!response.success) {
        return rejectWithValue(response.error || 'Đăng xuất thất bại');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Đăng xuất thất bại');
    }
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Token refresh failed');
    }
  }
);

// Reset password
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email, { rejectWithValue }) => {
    try {
      const response = await authService.resetPassword(email);
      if (!response.success) {
        return rejectWithValue(response.error);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Password reset failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  message: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    resetAuthError: (state) => {
      state.error = null;
    },
    resetAuthMessage: (state) => {
      state.message = null;
    },
    clearAuthState: (state) => {
      state.error = null;
      state.message = null;
    },
    updateProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Check auth state
      .addCase(checkAuthState.pending, (state) => {
        state.isLoading = true;
        state.message = 'Đang kiểm tra trạng thái đăng nhập...';
      })
      .addCase(checkAuthState.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.message = null;
        if (action.payload.success) {
          state.user = action.payload.data;
          state.isAuthenticated = true;
          state.message = 'Đã đăng nhập thành công';
        } else {
          state.user = null;
          state.accessToken = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(checkAuthState.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.accessToken = null;
        state.isAuthenticated = false;
        state.message = null;
      })
      
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang đăng nhập...';
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.accessToken;
        state.error = null;
        state.message = 'Đăng nhập thành công!';
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        
        // Xử lý lỗi kỹ thuật và chỉ lưu thông báo thân thiện
        let userFriendlyError = 'Đăng nhập thất bại. Vui lòng thử lại.';
        
        if (action.payload) {
          const error = action.payload;
          
          if (typeof error === 'string') {
            if (error.includes('401') || error.includes('Unauthorized')) {
              userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            } else if (error.includes('404') || error.includes('User not found')) {
              userFriendlyError = 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
            } else if (error.includes('network') || error.includes('timeout')) {
              userFriendlyError = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
            } else if (error.includes('password') || error.includes('credentials')) {
              userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            } else {
              // Loại bỏ lỗi kỹ thuật
              userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            }
          } else if (error && typeof error === 'object') {
            if (error.status === 401 || error.statusCode === 401) {
              userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            } else if (error.status === 404 || error.statusCode === 404) {
              userFriendlyError = 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
            } else if (error.status === 500 || error.statusCode === 500) {
              userFriendlyError = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            } else if (error.message) {
              const errorMsg = error.message.toLowerCase();
              if (errorMsg.includes('unauthorized') || errorMsg.includes('invalid credentials')) {
                userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
              } else if (errorMsg.includes('user not found')) {
                userFriendlyError = 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
              } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
                userFriendlyError = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
              } else {
                userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
              }
            } else {
              userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
            }
          }
        }
        
        // Log technical error for debugging (but don't store it)
        console.log('Technical login error (hidden from user):', action.payload);
        
        state.error = userFriendlyError;
        state.message = null;
      })
      
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang đăng ký tài khoản...';
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = 'Đăng ký tài khoản thành công! Vui lòng đăng nhập.';
        // Registration successful, but not logged in yet
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Đăng ký thất bại';
        state.message = null;
      })
      
      // Logout
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
        state.message = 'Đang đăng xuất...';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = null;
        state.message = 'Đã đăng xuất thành công';
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        // Even if logout fails on server, clear local state
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.message = 'Đã đăng xuất';
      })
      
      // Refresh token
      .addCase(refreshToken.pending, (state) => {
        state.message = 'Đang làm mới phiên đăng nhập...';
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        if (state.accessToken) {
          state.accessToken = action.payload.accessToken;
        }
        state.message = null;
      })
      .addCase(refreshToken.rejected, (state) => {
        // Token refresh failed, logout user
        state.isAuthenticated = false;
        state.user = null;
        state.accessToken = null;
        state.error = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        state.message = null;
      })
      
      // Reset password
      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang gửi yêu cầu đặt lại mật khẩu...';
      })
      .addCase(resetPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.message = 'Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư của bạn.';
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Không thể gửi email đặt lại mật khẩu';
        state.message = null;
      });
  },
});

export const { resetAuthError, resetAuthMessage, clearAuthState, updateProfile } = authSlice.actions;

export default authSlice.reducer; 