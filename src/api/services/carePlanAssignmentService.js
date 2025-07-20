import apiClient from '../config/axiosConfig';

/**
 * Care Plan Assignment Service - Quản lý phân công gói chăm sóc
 */
const carePlanAssignmentService = {
  /**
   * Tạo phân công gói chăm sóc mới
   * @param {Object} assignmentData - Dữ liệu phân công
   * @param {string} assignmentData.resident_id - ID cư dân
   * @param {string} assignmentData.care_plan_id - ID gói chăm sóc
   * @param {string} assignmentData.room_id - ID phòng
   * @param {string} assignmentData.bed_id - ID giường
   * @param {string} assignmentData.start_date - Ngày bắt đầu
   * @param {string} assignmentData.end_date - Ngày kết thúc
   * @param {string} assignmentData.status - Trạng thái
   * @param {string} assignmentData.assigned_by - ID người phân công
   * @param {string} assignmentData.notes - Ghi chú
   * @returns {Promise} - Promise với response data
   */
  createCarePlanAssignment: async (assignmentData) => {
    try {
      const response = await apiClient.post('/care-plan-assignments', assignmentData);
      return {
        success: true,
        data: response.data,
        message: 'Phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Create care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy tất cả phân công gói chăm sóc
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.care_plan_id - Lọc theo ID gói chăm sóc
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllCarePlanAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get all care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc theo ID
   * @param {string} assignmentId - ID phân công
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentById: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/care-plan-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái phân công
   * @param {string} params.active - Chỉ lấy phân công đang hoạt động
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/care-plan-assignments/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công gói chăm sóc theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get care plan assignments by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công gói chăm sóc theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateCarePlanAssignment: async (assignmentId, updateData) => {
    try {
      const response = await apiClient.patch(`/care-plan-assignments/${assignmentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Update care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Xóa phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @returns {Promise} - Promise với response data
   */
  deleteCarePlanAssignment: async (assignmentId) => {
    try {
      const response = await apiClient.delete(`/care-plan-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Delete care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Kết thúc phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @param {Object} endData - Dữ liệu kết thúc
   * @returns {Promise} - Promise với response data
   */
  endCarePlanAssignment: async (assignmentId, endData = {}) => {
    try {
      const response = await apiClient.patch(`/care-plan-assignments/${assignmentId}/end`, endData);
      return {
        success: true,
        data: response.data,
        message: 'Kết thúc phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('End care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Kết thúc phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc đang hoạt động
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @returns {Promise} - Promise với response data
   */
  getActiveCarePlanAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/active', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công gói chăm sóc đang hoạt động thành công'
      };
    } catch (error) {
      console.log('Get active care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công gói chăm sóc đang hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy lịch sử phân công gói chăm sóc
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/history', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch sử phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment history error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch sử phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy thống kê phân công gói chăm sóc
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Tìm kiếm phân công gói chăm sóc
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.status - Trạng thái phân công
   * @param {string} searchParams.care_plan_id - ID gói chăm sóc
   * @param {string} searchParams.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  searchCarePlanAssignments: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Search care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm phân công gói chăm sóc thất bại'
      };
    }
  }
};

export default carePlanAssignmentService; 