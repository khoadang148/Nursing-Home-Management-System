import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/appConfig';

// Cấu hình API base URL từ appConfig
const API_BASE_URL = `${API_CONFIG.BASE_URL}/api`;

/**
 * Axios instance với cấu hình chung
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Interceptor để thêm token vào header của mỗi request
 */
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Interceptor để xử lý response và error
 */
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    
    // Xử lý token hết hạn (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Thử refresh token
        const refreshToken = await AsyncStorage.getItem('refreshToken');
        if (refreshToken) {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken,
        });
        
        const { token } = response.data;
        await AsyncStorage.setItem('authToken', token);
        
          // Thử lại request với token mới
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
        }
      } catch (refreshError) {
        // Nếu refresh token thất bại, logout user
        await AsyncStorage.multiRemove(['authToken', 'refreshToken', 'user']);
        Alert.alert(
          'Phiên đăng nhập hết hạn',
          'Vui lòng đăng nhập lại để tiếp tục.',
          [{ text: 'OK' }]
        );
      }
    }
    
    // Xử lý lỗi server (500)
    if (error.response?.status === 500) {
      Alert.alert(
        'Lỗi hệ thống',
        'Đã xảy ra lỗi từ phía máy chủ. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    }
    
    return Promise.reject(error);
  }
);

/**
 * API Service với các phương thức cơ bản
 */
export const apiService = {
  /**
   * GET request
   * @param {string} endpoint - Đường dẫn API
   * @param {Object} params - Query params
   * @param {Object} options - Axios options
   * @returns {Promise} - Promise với response data
   */
  get: async (endpoint, params = {}, options = {}) => {
    try {
      const response = await apiClient.get(endpoint, { 
        params,
        ...options,
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * POST request
   * @param {string} endpoint - Đường dẫn API
   * @param {Object} data - Body data
   * @param {Object} options - Axios options
   * @returns {Promise} - Promise với response data
   */
  post: async (endpoint, data = {}, options = {}) => {
    try {
      const response = await apiClient.post(endpoint, data, options);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * PUT request
   * @param {string} endpoint - Đường dẫn API
   * @param {Object} data - Body data
   * @param {Object} options - Axios options
   * @returns {Promise} - Promise với response data
   */
  put: async (endpoint, data = {}, options = {}) => {
    try {
      const response = await apiClient.put(endpoint, data, options);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * DELETE request
   * @param {string} endpoint - Đường dẫn API
   * @param {Object} options - Axios options
   * @returns {Promise} - Promise với response data
   */
  delete: async (endpoint, options = {}) => {
    try {
      const response = await apiClient.delete(endpoint, options);
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
  
  /**
   * Upload file
   * @param {string} endpoint - Đường dẫn API
   * @param {Object} formData - FormData với file
   * @param {Function} onProgress - Callback cho progress
   * @returns {Promise} - Promise với response data
   */
  upload: async (endpoint, formData, onProgress = () => {}) => {
    try {
      const response = await apiClient.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
      throw error;
    }
  },
};

/**
 * Xử lý lỗi API chung
 * @param {Object} error - Error object từ axios
 */
const handleApiError = (error) => {
  // Log minimal error info for debugging (without exposing technical details)
  console.log('API Error occurred:', {
    status: error.response?.status,
    hasResponse: !!error.response,
    hasRequest: !!error.request,
    message: error.message ? 'Error occurred' : 'Unknown error'
  });

  // Xử lý các trường hợp lỗi cụ thể
  if (error.response) {
    // Server trả về response với status code nằm ngoài range 2xx
    console.log('Error status:', error.response.status);
    
    // Hiển thị thông báo lỗi từ server nếu có (trừ 401 để tránh duplicate)
    if (error.response.data?.message && error.response.status !== 401) {
      Alert.alert('Lỗi', error.response.data.message);
    }
  } else if (error.request) {
    // Request đã được gửi nhưng không nhận được response
    console.log('Network error occurred');
    Alert.alert(
      'Lỗi kết nối',
      'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.'
    );
  } else {
    // Có lỗi khi setting up request
    console.log('Request setup error occurred');
    Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại sau.');
  }
};

export default apiService; 