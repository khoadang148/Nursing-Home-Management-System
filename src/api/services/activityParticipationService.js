import apiClient from '../config/axiosConfig';

/**
 * Activity Participation Service - Quản lý tham gia hoạt động
 */
const activityParticipationService = {
  /**
   * Đăng ký tham gia hoạt động
   * @param {Object} participationData - Dữ liệu tham gia
   * @param {string} participationData.activity_id - ID hoạt động
   * @param {string} participationData.resident_id - ID cư dân
   * @param {string} participationData.status - Trạng thái tham gia
   * @param {string} participationData.notes - Ghi chú
   * @param {string} participationData.registered_by - ID người đăng ký
   * @returns {Promise} - Promise với response data
   */
  registerParticipation: async (participationData) => {
    try {
      const response = await apiClient.post('/activity-participations', participationData);
      return {
        success: true,
        data: response.data,
        message: 'Đăng ký tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Register participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Đăng ký tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy tất cả tham gia hoạt động
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.activity_id - Lọc theo ID hoạt động
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllParticipations: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity-participations', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Get all participations error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy tham gia hoạt động theo ID
   * @param {string} participationId - ID tham gia
   * @returns {Promise} - Promise với response data
   */
  getParticipationById: async (participationId) => {
    try {
      const response = await apiClient.get(`/activity-participations/${participationId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Get participation by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy tham gia hoạt động theo hoạt động
   * @param {string} activityId - ID hoạt động
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái tham gia
   * @returns {Promise} - Promise với response data
   */
  getParticipationsByActivityId: async (activityId, params = {}) => {
    try {
      const response = await apiClient.get(`/activity-participations/activity/${activityId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy tham gia hoạt động theo hoạt động thành công'
      };
    } catch (error) {
      console.log('Get participations by activity ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy tham gia hoạt động theo hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy tham gia hoạt động theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái tham gia
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getParticipationsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/activity-participations/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy tham gia hoạt động theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get participations by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy tham gia hoạt động theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật tham gia hoạt động
   * @param {string} participationId - ID tham gia
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateParticipation: async (participationId, updateData) => {
    try {
      const response = await apiClient.patch(`/activity-participations/${participationId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Update participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Xóa tham gia hoạt động
   * @param {string} participationId - ID tham gia
   * @returns {Promise} - Promise với response data
   */
  deleteParticipation: async (participationId) => {
    try {
      const response = await apiClient.delete(`/activity-participations/${participationId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Delete participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Xác nhận tham gia
   * @param {string} participationId - ID tham gia
   * @param {Object} confirmData - Dữ liệu xác nhận
   * @returns {Promise} - Promise với response data
   */
  confirmParticipation: async (participationId, confirmData = {}) => {
    try {
      const response = await apiClient.patch(`/activity-participations/${participationId}/confirm`, confirmData);
      return {
        success: true,
        data: response.data,
        message: 'Xác nhận tham gia thành công'
      };
    } catch (error) {
      console.log('Confirm participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xác nhận tham gia thất bại'
      };
    }
  },

  /**
   * Hủy tham gia
   * @param {string} participationId - ID tham gia
   * @param {Object} cancelData - Dữ liệu hủy
   * @returns {Promise} - Promise với response data
   */
  cancelParticipation: async (participationId, cancelData = {}) => {
    try {
      const response = await apiClient.patch(`/activity-participations/${participationId}/cancel`, cancelData);
      return {
        success: true,
        data: response.data,
        message: 'Hủy tham gia thành công'
      };
    } catch (error) {
      console.log('Cancel participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Hủy tham gia thất bại'
      };
    }
  },

  /**
   * Điểm danh tham gia
   * @param {string} participationId - ID tham gia
   * @param {Object} attendanceData - Dữ liệu điểm danh
   * @returns {Promise} - Promise với response data
   */
  markAttendance: async (participationId, attendanceData = {}) => {
    try {
      const response = await apiClient.patch(`/activity-participations/${participationId}/attendance`, attendanceData);
      return {
        success: true,
        data: response.data,
        message: 'Điểm danh thành công'
      };
    } catch (error) {
      console.log('Mark attendance error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Điểm danh thất bại'
      };
    }
  },

  /**
   * Lấy danh sách tham gia theo hoạt động
   * @param {string} activityId - ID hoạt động
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái tham gia
   * @returns {Promise} - Promise với response data
   */
  getActivityParticipants: async (activityId, params = {}) => {
    try {
      const response = await apiClient.get(`/activity-participations/activity/${activityId}/participants`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tham gia theo hoạt động thành công'
      };
    } catch (error) {
      console.log('Get activity participants error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách tham gia theo hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy thống kê tham gia hoạt động
   * @param {Object} params - Tham số thống kê
   * @param {string} params.activity_id - ID hoạt động
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getParticipationStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity-participations/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Get participation statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Tìm kiếm tham gia hoạt động
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.activity_id - ID hoạt động
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.status - Trạng thái tham gia
   * @returns {Promise} - Promise với response data
   */
  searchParticipations: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/activity-participations/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm tham gia hoạt động thành công'
      };
    } catch (error) {
      console.log('Search participations error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm tham gia hoạt động thất bại'
      };
    }
  }
};

export default activityParticipationService; 