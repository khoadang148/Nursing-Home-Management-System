import { apiRequest } from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  // Login
  async login(email, password) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN, {
        email,
        password,
      });

      // Response format thực tế: { access_token, user }
      if (response.data.access_token) {
        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem('accessToken', response.data.access_token);
        
        return {
          success: true,
          data: {
            accessToken: response.data.access_token,
            user: response.data.user,
          },
          message: 'Đăng nhập thành công',
        };
      } else {
        return {
          success: false,
          error: 'Đăng nhập thất bại',
        };
      }
    } catch (error) {
      // Log minimal error info for debugging (without exposing technical details)
      console.log('Login failed:', {
        status: error.response?.status,
        hasResponse: !!error.response,
        hasRequest: !!error.request,
        message: error.message ? 'Error occurred' : 'Unknown error'
      });
      
      // Xử lý các loại lỗi cụ thể
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            return {
              success: false,
              error: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.',
            };
          case 404:
            return {
              success: false,
              error: 'Tài khoản không tồn tại. Vui lòng kiểm tra email.',
            };
          case 422:
            return {
              success: false,
              error: data?.message || 'Dữ liệu đăng nhập không hợp lệ.',
            };
          case 500:
            return {
              success: false,
              error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            };
          default:
            return {
              success: false,
              error: data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
            };
        }
      } else if (error.request) {
        // Network error
        return {
          success: false,
          error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        };
      } else {
        // Other errors
        return {
          success: false,
          error: 'Đăng nhập thất bại. Vui lòng thử lại.',
        };
      }
    }
  }

  // Register
  async register(userData) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData);

      // Response format có thể khác nhau, kiểm tra cả 2 format
      if (response.data.success || response.data.access_token) {
        const data = response.data.data || response.data;
        return {
          success: true,
          data: data,
          message: response.data.message || 'Đăng ký thành công',
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Đăng ký thất bại',
        };
      }
    } catch (error) {
      console.error('Register error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng ký thất bại',
      };
    }
  }

  // Logout
  async logout() {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      // Xóa token khỏi AsyncStorage
      await AsyncStorage.removeItem('accessToken');
      
      return {
        success: true,
        message: response.data.message || 'Đăng xuất thành công',
      };
    } catch (error) {
      console.error('Logout error:', error);
      // Vẫn xóa token ngay cả khi API call thất bại
      await AsyncStorage.removeItem('accessToken');
      
      return {
        success: true,
        message: 'Đã đăng xuất',
      };
    }
  }

  // Get Profile
  async getProfile() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      // Response format có thể khác nhau
      if (response.data.success || response.data.id) {
        const data = response.data.data || response.data;
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Không thể lấy thông tin hồ sơ',
        };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin hồ sơ',
      };
    }
  }

  // Update Profile
  async updateProfile(profileData) {
    try {
      const response = await apiRequest.put(API_CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, profileData);
      
      // Response format có thể khác nhau
      if (response.data.success || response.data.id) {
        const data = response.data.data || response.data;
        return {
          success: true,
          data: data,
          message: response.data.message || 'Cập nhật hồ sơ thành công',
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Cập nhật hồ sơ thất bại',
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Cập nhật hồ sơ thất bại',
      };
    }
  }

  // Change Password (User self change)
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await apiRequest.patch(API_CONFIG.ENDPOINTS.AUTH.CHANGE_PASSWORD, {
        currentPassword,
        newPassword,
        confirmPassword: newPassword, // Backend yêu cầu confirmPassword
      });

      if (response.data.success || response.data.message) {
        return {
          success: true,
          message: response.data.message || 'Đổi mật khẩu thành công',
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Đổi mật khẩu thất bại',
        };
      }
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Đổi mật khẩu thất bại',
      };
    }
  }

  // Check if user is authenticated
  async isAuthenticated() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return {
          success: false,
          message: 'Không có token',
        };
      }

      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.AUTH.PROFILE);
      
      // Response format có thể khác nhau
      if (response.data.success || response.data.id) {
        const data = response.data.data || response.data;
        return {
          success: true,
          data: data,
        };
      } else {
        return {
          success: false,
          message: 'Token không hợp lệ',
        };
      }
    } catch (error) {
      console.error('Check auth error:', error);
      return {
        success: false,
        message: 'Token không hợp lệ',
      };
    }
  }
}

export default new AuthService(); 