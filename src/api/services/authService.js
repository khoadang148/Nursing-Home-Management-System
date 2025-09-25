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
        // If BE returns 201 with { success: false, error, message }
        return {
          success: false,
          error: response.data.error || 'Đăng nhập thất bại',
          message: response.data.message,
          status: 201,
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
              error: data?.error || 'LOGIN_FAILED',
              message: data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.',
              status,
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
      console.log('AuthService: Sending register request with data:', userData);
      
      // Check if userData is FormData
      const isFormData = userData instanceof FormData;
      console.log('AuthService: Is FormData:', isFormData);
      
      // Set appropriate headers
      const config = {
        headers: isFormData ? { /* let axios set boundary automatically */ } : {
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      };
      
      let response;
      try {
        response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData, config);
      } catch (err) {
        // simple one-time retry on timeout/network errors
        if (err.code === 'ECONNABORTED' || !err.response) {
          console.log('Register request retrying once due to timeout/network...');
          response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.REGISTER, userData, config);
        } else {
          throw err;
        }
      }
      console.log('AuthService: Register response:', response.data);

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
      console.error('Register error response:', error.response?.data);
      console.error('Register error status:', error.response?.status);
      
      // Return more detailed error information
      const errorMessage = error.response?.data?.message || error.message || 'Đăng ký thất bại';
      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  // Logout
  async logout() {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
      
      return {
        success: true,
        message: response.data.message || 'Đăng xuất thành công',
      };
    } catch (error) {
      console.error('Logout error:', error);
      
      // Xử lý lỗi 401 (token expired/invalid) - coi như logout thành công
      if (error.response?.status === 401) {
        console.log('Token expired during logout, treating as successful logout');
        return {
          success: true,
          message: 'Đã đăng xuất',
        };
      }
      
      // Xử lý các lỗi khác
      return {
        success: false,
        error: error.response?.data?.message || 'Đăng xuất thất bại',
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
        currentPassword: currentPassword,
        newPassword: newPassword,
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

  // Send OTP
  async sendOtp(phone) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.SEND_OTP, {
        phone,
      });

      return {
        success: true,
        data: response.data,
        message: response.data.message || 'Mã OTP đã được gửi',
      };
    } catch (error) {
      console.log('Send OTP failed:', error.response?.status);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 404:
            return {
              success: false,
              error: 'Số điện thoại chưa được đăng ký trong hệ thống.',
            };
          case 422:
            return {
              success: false,
              error: data?.message || 'Số điện thoại không hợp lệ.',
            };
          case 500:
            return {
              success: false,
              error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            };
          default:
            return {
              success: false,
              error: data?.message || 'Không thể gửi mã OTP.',
            };
        }
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        };
      } else {
        return {
          success: false,
          error: 'Không thể gửi mã OTP.',
        };
      }
    }
  }

  // Login with OTP
  async loginWithOtp(phone, otp) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.LOGIN_OTP, {
        phone,
        otp,
      });

      // Response format: { access_token, user }
      if (response.data.access_token) {
        // Lưu token vào AsyncStorage
        await AsyncStorage.setItem('accessToken', response.data.access_token);
        
        return {
          success: true,
          access_token: response.data.access_token,
          user: response.data.user,
          message: response.data.message || 'Đăng nhập thành công',
        };
      } else {
        return {
          success: false,
          error: 'Đăng nhập thất bại',
        };
      }
    } catch (error) {
      console.log('Login with OTP failed:', error.response?.status);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return {
              success: false,
              error: data?.message || 'Mã OTP không đúng hoặc đã hết hạn.',
            };
          case 404:
            return {
              success: false,
              error: 'Số điện thoại không tồn tại trong hệ thống.',
            };
          case 422:
            return {
              success: false,
              error: data?.message || 'Dữ liệu không hợp lệ.',
            };
          case 500:
            return {
              success: false,
              error: 'Lỗi máy chủ. Vui lòng thử lại sau.',
            };
          default:
            return {
              success: false,
              error: data?.message || 'Đăng nhập thất bại.',
            };
        }
      } else if (error.request) {
        return {
          success: false,
          error: 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.',
        };
      } else {
        return {
          success: false,
          error: 'Đăng nhập thất bại.',
        };
      }
    }
  }

  // Forgot Password
  async forgotPassword(emailData) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.AUTH.FORGOT_PASSWORD, emailData);

      if (response.data.success) {
        return {
          success: true,
          message: response.data.message || 'Mật khẩu mới đã được gửi về email của bạn',
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          message: response.data.message || 'Đặt lại mật khẩu thất bại',
        };
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 400:
            return {
              success: false,
              message: data?.message || 'Email không hợp lệ',
            };
          case 404:
            return {
              success: false,
              message: data?.message || 'Email không tồn tại trong hệ thống',
            };
          case 422:
            return {
              success: false,
              message: data?.message || 'Dữ liệu không hợp lệ',
            };
          default:
            return {
              success: false,
              message: data?.message || 'Đặt lại mật khẩu thất bại',
            };
        }
      } else {
        return {
          success: false,
          message: 'Không thể kết nối đến máy chủ. Vui lòng thử lại sau.',
        };
      }
    }
  }
}

export default new AuthService(); 