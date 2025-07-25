import apiClient from '../config/axiosConfig';
// import { delay } from '../../utils/helpers';

/**
 * Bed Assignment Service - Quản lý phân công giường
 */
const bedAssignmentService = {
  // ==================== API ENDPOINTS (REAL API) ====================
  
  /**
   * Lấy tất cả bed assignments
   * @param {Object} params - Query parameters (optional)
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
   * Lấy bed assignments theo resident ID
   * @param {string} residentId - ID của resident
   * @returns {Promise} - Promise với response data
   */
  getBedAssignmentsByResidentId: async (residentId) => {
    try {
      const response = await apiClient.get(`/bed-assignments/by-resident?resident_id=${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phân công giường theo resident thành công'
      };
    } catch (error) {
      console.log('Get bed assignments by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin phân công giường theo resident thất bại'
      };
    }
  },

  /**
   * Lấy bed assignment theo ID
   * @param {string} assignmentId - ID của bed assignment
   * @returns {Promise} - Promise với response data
   */
  getBedAssignmentById: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/bed-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phân công giường thành công'
      };
    } catch (error) {
      console.log('Get bed assignment by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin phân công giường thất bại'
      };
    }
  },

  /**
   * Tạo bed assignment mới
   * @param {Object} assignmentData - Dữ liệu bed assignment
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
   * Cập nhật bed assignment
   * @param {string} assignmentId - ID của bed assignment
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateBedAssignment: async (assignmentId, updateData) => {
    try {
      const response = await apiClient.patch(`/bed-assignments/${assignmentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật phân công giường thành công'
      };
    } catch (error) {
      console.log('Update bed assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật phân công giường thất bại'
      };
    }
  },

  /**
   * Xóa bed assignment
   * @param {string} assignmentId - ID của bed assignment
   * @returns {Promise} - Promise với response data
   */
  deleteBedAssignment: async (assignmentId) => {
    try {
      const response = await apiClient.delete(`/bed-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa phân công giường thành công'
      };
    } catch (error) {
      console.log('Delete bed assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa phân công giường thất bại'
      };
    }
  },

  /**
   * Lấy thông tin phòng và giường theo resident ID (API thật)
   * @param {string} residentId - ID của resident
   * @returns {Promise<Object>} Thông tin phòng và giường
   */
  getResidentBedInfo: async (residentId) => {
    try {
      const response = await apiClient.get(`/bed-assignments/by-resident?resident_id=${residentId}`);
      if (response.data && response.data.length > 0) {
        const assignment = response.data[0];
        if (
          assignment &&
          assignment.bed_id &&
          assignment.bed_id.bed_number &&
          assignment.bed_id.room_id &&
          assignment.bed_id.room_id.room_number
        ) {
      return {
        success: true,
            data: {
              roomNumber: assignment.bed_id.room_id.room_number,
              bedNumber: assignment.bed_id.bed_number,
              fullRoomInfo: `${assignment.bed_id.room_id.room_number}-${assignment.bed_id.bed_number}`,
              assignedDate: assignment.assigned_date,
              assignedBy: assignment.assigned_by.full_name,
              isActive: !assignment.unassigned_date
            }
          };
        }
      }
      return { success: false, error: 'Không tìm thấy thông tin phòng và giường cho resident này' };
    } catch (error) {
      return { success: false, error: 'Không thể tải thông tin phòng và giường' };
    }
  },

  // ==================== MOCK DATA FUNCTIONS (DEVELOPMENT) ====================
  // (Đã comment toàn bộ mock data, chỉ dùng API thật)
};

// API endpoints - sẽ được sử dụng khi có API thực tế
const API_ENDPOINTS = {
  BED_ASSIGNMENTS: '/bed-assignments',
  BY_RESIDENT: '/bed-assignments/by-resident',
};

export default bedAssignmentService; 