import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authService from '../../api/services/authService';
import { clearAllResidents } from './residentSlice';

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
        // Pass full response so reducer can inspect message/error
        return rejectWithValue(response);
      }
      return response.data;
    } catch (error) {
      // When axios throws, try to pass through server response if present
      const serverData = error?.response?.data;
      if (serverData) {
        return rejectWithValue({
          success: false,
          error: serverData.error || 'LOGIN_FAILED',
          message: serverData.message || 'Login failed',
          status: error.response.status,
        });
      }
      return rejectWithValue({ success: false, error: 'LOGIN_FAILED', message: error.message || 'Login failed' });
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
  async (_, { rejectWithValue, dispatch }) => {
    try {
      // Call logout API first (while token is still available)
      const response = await authService.logout();
      
      // Clear tokens and state after successful API call
      dispatch(clearTokens());
      dispatch(clearAllState());
      dispatch(clearAllResidents());
      
      // Always return success for logout (even if API fails with 401)
      return response;
    } catch (error) {
      console.log('Logout API call failed, clearing state anyway:', error.message);
      // If API call fails, still clear tokens and state for security
      dispatch(clearTokens());
      dispatch(clearAllState());
      dispatch(clearAllResidents());
      return {
        success: true,
        message: 'Đã đăng xuất',
      };
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

// Send OTP
export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async ({ phone }, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtp(phone);
      if (!response.success) {
        return rejectWithValue(response.message || 'Failed to send OTP');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to send OTP');
    }
  }
);

// Login with OTP
export const loginWithOtp = createAsyncThunk(
  'auth/loginWithOtp',
  async ({ phone, otp }, { rejectWithValue }) => {
    try {
      const response = await authService.loginWithOtp(phone, otp);
      if (!response.success) {
        return rejectWithValue(response.message || 'Login failed');
      }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
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
    clearTokens: (state) => {
      // Clear tokens from AsyncStorage
      AsyncStorage.multiRemove(['accessToken', 'refreshToken']).catch(console.error);
    },
    clearAllState: (state) => {
      // Clear all auth state
      state.user = null;
      state.accessToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.message = null;
    },
    updateProfile: (state, action) => {
      if (state.user) {
        // Chỉ cập nhật các trường thay đổi, không tạo object mới nếu không cần thiết
        const hasChanges = Object.keys(action.payload).some(key => 
          state.user[key] !== action.payload[key]
        );
        
        if (hasChanges) {
          state.user = { ...state.user, ...action.payload };
        }
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
        
        // Debug log
        console.log('Email Login - User data saved to Redux:', action.payload.user);
        console.log('Email Login - User avatar:', action.payload.user?.avatar);
        console.log('Email Login - User role:', action.payload.user?.role);
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        
        // Inspect payload coming from service to customize message precisely
        const payload = action.payload;
        let userFriendlyError = 'Đăng nhập thất bại. Vui lòng thử lại.';

        // Normalize
        const normalized = typeof payload === 'object' ? payload : { message: String(payload || '') };
        const errorCode = (normalized.error || '').toString().toUpperCase();
        const rawMsg = (normalized.message || '').toString();
        const lowerMsg = rawMsg.toLowerCase();
        const status = normalized.status || normalized.statusCode;

        // Case A: account locked/not activated per BE message
        if (
          lowerMsg.includes('bị khóa') ||
          lowerMsg.includes('chưa được kích hoạt') ||
          errorCode === 'ACCOUNT_INACTIVE' ||
          errorCode === 'ACCOUNT_LOCKED' ||
          errorCode === 'ACCOUNT_BANNED'
        ) {
          userFriendlyError = 'Tài khoản đã bị khóa hoặc chưa được kích hoạt. Vui lòng kiểm tra email hoặc liên hệ quản trị viên.';
        }
        // Case B: wrong credentials
        else if (
          errorCode === 'INVALID_CREDENTIALS' ||
          status === 401 ||
          lowerMsg.includes('invalid credentials') ||
          lowerMsg.includes('unauthorized')
        ) {
          userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
        }
        // Case C: user not found
        else if (status === 404 || lowerMsg.includes('user not found')) {
          userFriendlyError = 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
        }
        // Case D: network/server
        else if (status === 500 || lowerMsg.includes('network') || lowerMsg.includes('timeout')) {
          userFriendlyError = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else {
          userFriendlyError = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
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
      })
      
      // Send OTP
      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang gửi mã OTP...';
      })
      .addCase(sendOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.message = action.payload.message || 'Mã OTP đã được gửi';
      })
      .addCase(sendOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Không thể gửi mã OTP';
        state.message = null;
      })
      
      // Login with OTP
      .addCase(loginWithOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.message = 'Đang đăng nhập...';
      })
      .addCase(loginWithOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.accessToken = action.payload.access_token;
        state.error = null;
        state.message = action.payload.message || 'Đăng nhập thành công!';
        
        // Log để debug
        console.log('OTP Login - User data saved to Redux:', action.payload.user);
        console.log('OTP Login - User role:', action.payload.user?.role);
      })
      .addCase(loginWithOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Đăng nhập thất bại';
        state.message = null;
      });
  },
});

export const { resetAuthError, resetAuthMessage, clearAuthState, updateProfile, clearTokens, clearAllState } = authSlice.actions;

export default authSlice.reducer; 