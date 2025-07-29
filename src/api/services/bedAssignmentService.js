import apiClient from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
// import { delay } from '../../utils/helpers';

/**
 * Bed Assignment Service - Quản lý phân công giường
 */
const bedAssignmentService = {
  /**
   * Lấy phân công giường theo resident ID
   * @param {string} residentId - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getBedAssignmentByResidentId: async (residentId) => {
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

      const response = await apiClient.get(`/bed-assignments/by-resident?resident_id=${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phân công giường thành công'
      };
    } catch (error) {
      console.log('Get bed assignment by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin phân công giường thất bại'
      };
    }
  },

  /**
   * Lấy tất cả phân công giường
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.bed_id - Lọc theo ID giường
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getAllBedAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/bed-assignments', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách phân công giường thành công'
      };
    } catch (error) {
      console.log('Get all bed assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách phân công giường thất bại'
      };
    }
  },

  /**
   * Tạo phân công giường mới
   * @param {Object} assignmentData - Dữ liệu phân công
   * @returns {Promise} - Promise với response data
   */
  createBedAssignment: async (assignmentData) => {
    try {
      const response = await apiClient.post('/bed-assignments', assignmentData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo phân công giường thành công'
      };
    } catch (error) {
      console.log('Create bed assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo phân công giường thất bại'
      };
    }
  },

  /**
   * Hủy phân công giường
   * @param {string} assignmentId - ID phân công
   * @returns {Promise} - Promise với response data
   */
  unassignBed: async (assignmentId) => {
    try {
      const response = await apiClient.patch(`/bed-assignments/${assignmentId}/unassign`);
      return {
        success: true,
        data: response.data,
        message: 'Hủy phân công giường thành công'
      };
    } catch (error) {
      console.log('Unassign bed error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Hủy phân công giường thất bại'
      };
    }
  }
};

export default bedAssignmentService; 