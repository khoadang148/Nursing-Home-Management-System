import apiClient from '../config/axiosConfig';

/**
 * Bed Assignment Service - Quản lý phân công giường
 */
const bedAssignmentService = {
  /**
   * Tạo phân công giường mới
   * @param {Object} assignmentData - Dữ liệu phân công
   * @param {string} assignmentData.resident_id - ID cư dân
   * @param {string} assignmentData.bed_id - ID giường
   * @param {string} assignmentData.assigned_by - ID người phân công
   * @returns {Promise} - Promise với response data
   */
  createBedAssignment: async (assignmentData) => {
    try {
      const response = await apiClient.post('/bed-assignments', assignmentData);
      return {
        success: true,
        data: response.data,
        message: 'Phân công giường thành công'
      };
    } catch (error) {
      console.log('Create bed assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Phân công giường thất bại'
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
   * Lấy phân công giường theo ID cư dân
   * @param {string} residentId - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getBedAssignmentsByResidentId: async (residentId) => {
    try {
      const response = await apiClient.get(`/bed-assignments/by-resident?resident_id=${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công giường theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get bed assignments by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công giường theo cư dân thất bại'
      };
    }
  },

  /**
   * Lấy phân công giường theo ID
   * @param {string} assignmentId - ID phân công
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
   * Cập nhật phân công giường
   * @param {string} assignmentId - ID phân công
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
   * Xóa phân công giường
   * @param {string} assignmentId - ID phân công
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
   * Hủy phân công giường (unassign)
   * @param {string} assignmentId - ID phân công
   * @param {Object} unassignData - Dữ liệu hủy phân công
   * @returns {Promise} - Promise với response data
   */
  unassignBed: async (assignmentId, unassignData = {}) => {
    try {
      const response = await apiClient.patch(`/bed-assignments/${assignmentId}/unassign`, unassignData);
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
  },

  /**
   * Lấy lịch sử phân công giường
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.bed_id - ID giường
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getBedAssignmentHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/bed-assignments/history', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch sử phân công giường thành công'
      };
    } catch (error) {
      console.log('Get bed assignment history error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch sử phân công giường thất bại'
      };
    }
  }
};

export default bedAssignmentService; 