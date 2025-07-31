import apiClient from '../config/axiosConfig';
import { delay } from '../../utils/helpers';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Vital Signs Service - Quản lý chỉ số sinh hiệu
 */
const vitalSignsService = {
  // ==================== API ENDPOINTS (REAL API) ====================

  /**
   * Lấy tất cả vital signs
   * @param {Object} params - Query parameters (optional)
   * @returns {Promise} - Promise với response data
   */
  getAllVitalSigns: async (params = {}) => {
    try {
      const response = await apiClient.get('/vital-signs', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.log('Get all vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách chỉ số sinh hiệu thất bại'
      };
    }
  },

  /**
   * Lấy vital signs theo resident ID
   * @param {string} residentId - ID của resident
   * @returns {Promise} - Promise với response data
   */
  getVitalSignsByResidentId: async (residentId) => {
    try {
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('No access token found, skipping API call');
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const response = await apiClient.get(`/vital-signs/resident/${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy chỉ số sinh hiệu theo resident thành công'
      };
    } catch (error) {
      console.log('Get vital signs by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy chỉ số sinh hiệu theo resident thất bại'
      };
    }
  },

  /**
   * Lấy vital signs theo ID
   * @param {string} vitalSignId - ID của vital sign
   * @returns {Promise} - Promise với response data
   */
  getVitalSignById: async (vitalSignId) => {
    try {
      const response = await apiClient.get(`/vital-signs/${vitalSignId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.log('Get vital sign by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin chỉ số sinh hiệu thất bại'
      };
    }
  },

  /**
   * Tạo vital sign mới
   * @param {Object} vitalSignData - Dữ liệu vital sign
   * @returns {Promise} - Promise với response data
   */
  createVitalSign: async (vitalSignData) => {
    try {
      const response = await apiClient.post('/vital-signs', vitalSignData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.log('Create vital sign error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo chỉ số sinh hiệu thất bại'
      };
    }
  },

  /**
   * Cập nhật vital sign
   * @param {string} vitalSignId - ID của vital sign
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateVitalSign: async (vitalSignId, updateData) => {
    try {
      const response = await apiClient.patch(`/vital-signs/${vitalSignId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.log('Update vital sign error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật chỉ số sinh hiệu thất bại'
      };
    }
  },

  /**
   * Xóa vital sign
   * @param {string} vitalSignId - ID của vital sign
   * @returns {Promise} - Promise với response data
   */
  deleteVitalSign: async (vitalSignId) => {
    try {
      console.log('Attempting to delete vital sign:', vitalSignId);
      const response = await apiClient.delete(`/vital-signs/${vitalSignId}`);
      console.log('Delete vital sign response:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Xóa chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.log('Delete vital sign error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa chỉ số sinh hiệu thất bại'
      };
    }
  },

  /**
   * Test DELETE endpoint
   * @param {string} testId - Test ID
   * @returns {Promise} - Promise với response data
   */
  testDeleteEndpoint: async (testId) => {
    try {
      console.log('Testing DELETE endpoint with ID:', testId);
      const response = await apiClient.delete(`/vital-signs/debug/test-delete/${testId}`);
      console.log('Test DELETE response:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Test DELETE endpoint thành công'
      };
    } catch (error) {
      console.log('Test DELETE error:', error);
      console.log('Error response:', error.response?.data);
      console.log('Error status:', error.response?.status);
      return {
        success: false,
        error: error.response?.data || error.message || 'Test DELETE endpoint thất bại'
      };
    }
  },

  // ==================== MOCK DATA FUNCTIONS (DEVELOPMENT) ====================

  /**
   * Lấy chỉ số sinh hiệu gần nhất theo resident ID (Mock Data)
   * @param {string} residentId - ID của resident
   * @returns {Promise<Object>} Chỉ số sinh hiệu gần nhất
   */
  getLatestVitalSigns: async (residentId) => {
    await delay(300); // Simulate API delay
    
    try {
      // Mock data dựa trên API response structure
      const mockVitalSigns = {
        '6876a174bf6a67b00112017e': [ // Nguyễn Văn Nam
          {
            "_id": "vital_001",
            "resident_id": "6876a174bf6a67b00112017e",
            "date_time": "2024-03-01T08:00:00.000Z",
            "temperature": 36.5,
            "heart_rate": 75,
            "blood_pressure": "130/80",
            "respiratory_rate": 18,
            "oxygen_level": 98.5,
            "weight": 65.5,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          },
          {
            "_id": "vital_002",
            "resident_id": "6876a174bf6a67b00112017e",
            "date_time": "2024-02-29T08:00:00.000Z",
            "temperature": 36.7,
            "heart_rate": 72,
            "blood_pressure": "125/82",
            "respiratory_rate": 16,
            "oxygen_level": 99.0,
            "weight": 65.2,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          }
        ],
        '6876a174bf6a67b00112017f': [ // Nguyễn Văn An
          {
            "_id": "vital_003",
            "resident_id": "6876a174bf6a67b00112017f",
            "date_time": "2024-03-01T08:30:00.000Z",
            "temperature": 36.8,
            "heart_rate": 82,
            "blood_pressure": "140/85",
            "respiratory_rate": 20,
            "oxygen_level": 97.8,
            "weight": 58.2,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          },
          {
            "_id": "vital_004",
            "resident_id": "6876a174bf6a67b00112017f",
            "date_time": "2024-02-29T08:30:00.000Z",
            "temperature": 37.0,
            "heart_rate": 85,
            "blood_pressure": "145/88",
            "respiratory_rate": 22,
            "oxygen_level": 97.5,
            "weight": 58.0,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          }
        ],
        '6876a174bf6a67b001120180': [ // Trần Thị Lan
          {
            "_id": "vital_005",
            "resident_id": "6876a174bf6a67b001120180",
            "date_time": "2024-03-01T09:00:00.000Z",
            "temperature": 36.6,
            "heart_rate": 70,
            "blood_pressure": "120/75",
            "respiratory_rate": 16,
            "oxygen_level": 99.2,
            "weight": 72.3,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          }
        ]
      };

      const vitalSigns = mockVitalSigns[residentId];
      
      if (!vitalSigns || vitalSigns.length === 0) {
        return {
          success: false,
          error: 'Không tìm thấy chỉ số sinh hiệu cho resident này'
        };
      }

      // Tìm chỉ số gần nhất (mới nhất)
      const latestVitalSign = vitalSigns.reduce((latest, current) => {
        return new Date(current.date_time) > new Date(latest.date_time) ? current : latest;
      });

      return {
        success: true,
        data: {
          temperature: latestVitalSign.temperature,
          heartRate: latestVitalSign.heart_rate,
          bloodPressure: latestVitalSign.blood_pressure,
          respiratoryRate: latestVitalSign.respiratory_rate,
          oxygenLevel: latestVitalSign.oxygen_level,
          weight: latestVitalSign.weight,
          recordedAt: latestVitalSign.date_time,
          recordedBy: latestVitalSign.recorded_by.full_name
        },
        message: 'Lấy chỉ số sinh hiệu gần nhất thành công'
      };
    } catch (error) {
      console.error('Error fetching latest vital signs:', error);
      return {
        success: false,
        error: 'Không thể tải chỉ số sinh hiệu'
      };
    }
  },

  /**
   * Lấy tất cả vital signs theo resident ID (Mock Data)
   * @param {string} residentId - ID của resident
   * @returns {Promise<Array>} Danh sách chỉ số sinh hiệu
   */
  getVitalSignsByResidentIdMock: async (residentId) => {
    await delay(300);
    
    try {
      const mockVitalSigns = {
        '6876a174bf6a67b00112017e': [
          {
            "_id": "vital_001",
            "resident_id": "6876a174bf6a67b00112017e",
            "date_time": "2024-03-01T08:00:00.000Z",
            "temperature": 36.5,
            "heart_rate": 75,
            "blood_pressure": "130/80",
            "respiratory_rate": 18,
            "oxygen_level": 98.5,
            "weight": 65.5,
            "recorded_by": {
              "_id": "staff_001",
              "full_name": "Lê Văn Nurse"
            }
          }
        ]
      };

      const vitalSigns = mockVitalSigns[residentId] || [];
      
      return {
        success: true,
        data: vitalSigns,
        message: 'Lấy danh sách chỉ số sinh hiệu thành công'
      };
    } catch (error) {
      console.error('Error fetching vital signs:', error);
      return {
        success: false,
        error: 'Không thể tải danh sách chỉ số sinh hiệu'
      };
    }
  }
};

// API endpoints - sẽ được sử dụng khi có API thực tế
const API_ENDPOINTS = {
  VITAL_SIGNS: '/vital-signs',
  BY_RESIDENT: '/vital-signs/by-resident',
};

export default vitalSignsService; 