import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from './apiConfig';

// Tạo axios instance
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 15000, // Tăng timeout lên 15 seconds cho iPhone
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor - thêm token vào header
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      // Log request for debugging (chỉ trong development)
      if (__DEV__) {
        console.log('🌐 API Request:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data
        });
      }
      
    } catch (error) {
      if (__DEV__) {
        console.error('Error getting token from storage:', error);
      }
    }
    return config;
  },
  (error) => {
    if (__DEV__) {
      console.error('❌ Request interceptor error:', error);
    }
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý token refresh và error handling
apiClient.interceptors.response.use(
  (response) => {
    // Log successful response (chỉ trong development)
    if (__DEV__) {
      console.log('✅ API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data
      });
    }
    return response;
  },
  async (error) => {
    // Không log lỗi API để tránh hiển thị cho user

    // Xử lý timeout error cho iPhone (chỉ log trong development)
    if (error.code === 'ECONNABORTED' && __DEV__) {
      console.log('⏰ Timeout Error - Có thể do:');
      console.log('1. iPhone không thể truy cập IP của máy host');
      console.log('2. Không cùng mạng WiFi');
      console.log('3. Firewall chặn kết nối');
      console.log('4. Backend server không chạy');
    }

    const originalRequest = error.config;

    // Nếu lỗi 401 và chưa thử refresh token
    // Không xử lý refresh token cho logout request
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/logout')) {
      originalRequest._retry = true;

      try {
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await axios.post(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN}`,
            { refreshToken }
          );

          const { accessToken, refreshToken: newRefreshToken } = response.data;
          
          // Lưu token mới
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('refreshToken', newRefreshToken);
          
          // Thử lại request ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          // Không có refresh token, clear all tokens và return error
          if (__DEV__) {
            console.log('No refresh token found, clearing all tokens');
          }
          await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        }
      } catch (refreshError) {
        if (__DEV__) {
          console.error('Token refresh failed:', refreshError);
        }
        // Xóa token cũ và redirect về login
        await AsyncStorage.multiRemove(['accessToken', 'refreshToken']);
        // Không dispatch logout action ở đây vì có thể gây infinite loop
        // Thay vào đó, return error để component xử lý
      }
    }

    return Promise.reject(error);
  }
);

// Helper functions
export const apiRequest = {
  // GET request
  get: (url, config = {}) => apiClient.get(url, config),
  
  // POST request
  post: (url, data = {}, config = {}) => apiClient.post(url, data, config),
  
  // PUT request
  put: (url, data = {}, config = {}) => apiClient.put(url, data, config),
  
  // PATCH request
  patch: (url, data = {}, config = {}) => apiClient.patch(url, data, config),
  
  // DELETE request
  delete: (url, config = {}) => apiClient.delete(url, config),
  
  // Upload file
  upload: (url, formData, config = {}) => {
    return apiClient.post(url, formData, {
      ...config,
      headers: {
        ...config.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

export default apiClient; 