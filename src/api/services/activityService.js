import apiClient from '../config/axiosConfig';

/**
 * Activity Service - Quản lý hoạt động
 */
const activityService = {
  /**
   * Lấy tất cả hoạt động
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.type - Lọc theo loại hoạt động
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách hoạt động thành công'
      };
    } catch (error) {
      console.log('Get all activities error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động theo ID
   * @param {string} activityId - ID hoạt động
   * @returns {Promise} - Promise với response data
   */
  getActivityById: async (activityId) => {
    try {
      const response = await apiClient.get(`/activity/${activityId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin hoạt động thành công'
      };
    } catch (error) {
      console.log('Get activity by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin hoạt động thất bại'
      };
    }
  },

  /**
   * Tạo hoạt động mới
   * @param {Object} activityData - Dữ liệu hoạt động
   * @param {string} activityData.title - Tiêu đề hoạt động
   * @param {string} activityData.description - Mô tả
   * @param {string} activityData.type - Loại hoạt động
   * @param {string} activityData.date - Ngày hoạt động
   * @param {string} activityData.start_time - Thời gian bắt đầu
   * @param {string} activityData.end_time - Thời gian kết thúc
   * @param {string} activityData.location - Địa điểm
   * @param {number} activityData.max_participants - Số người tham gia tối đa
   * @param {string} activityData.status - Trạng thái
   * @param {string} activityData.created_by - ID người tạo
   * @returns {Promise} - Promise với response data
   */
  createActivity: async (activityData) => {
    try {
      const response = await apiClient.post('/activity', activityData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo hoạt động thành công'
      };
    } catch (error) {
      console.log('Create activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo hoạt động thất bại'
      };
    }
  },

  /**
   * Cập nhật hoạt động
   * @param {string} activityId - ID hoạt động
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateActivity: async (activityId, updateData) => {
    try {
      const response = await apiClient.patch(`/activity/${activityId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật hoạt động thành công'
      };
    } catch (error) {
      console.log('Update activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật hoạt động thất bại'
      };
    }
  },

  /**
   * Xóa hoạt động
   * @param {string} activityId - ID hoạt động
   * @returns {Promise} - Promise với response data
   */
  deleteActivity: async (activityId) => {
    try {
      const response = await apiClient.delete(`/activity/${activityId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa hoạt động thành công'
      };
    } catch (error) {
      console.log('Delete activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa hoạt động thất bại'
      };
    }
  },

  /**
   * Tìm kiếm hoạt động
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.type - Loại hoạt động
   * @param {string} searchParams.status - Trạng thái
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchActivities: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/activity/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm hoạt động thành công'
      };
    } catch (error) {
      console.log('Search activities error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động theo ngày
   * @param {string} date - Ngày (YYYY-MM-DD)
   * @param {Object} params - Tham số lọc
   * @param {string} params.type - Loại hoạt động
   * @returns {Promise} - Promise với response data
   */
  getActivitiesByDate: async (date, params = {}) => {
    try {
      const response = await apiClient.get(`/activity/date/${date}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hoạt động theo ngày thành công'
      };
    } catch (error) {
      console.log('Get activities by date error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hoạt động theo ngày thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động theo loại
   * @param {string} type - Loại hoạt động
   * @param {Object} params - Tham số lọc
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getActivitiesByType: async (type, params = {}) => {
    try {
      const response = await apiClient.get(`/activity/type/${type}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hoạt động theo loại thành công'
      };
    } catch (error) {
      console.log('Get activities by type error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hoạt động theo loại thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động sắp tới
   * @param {Object} params - Tham số lọc
   * @param {string} params.type - Loại hoạt động
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getUpcomingActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity/upcoming', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hoạt động sắp tới thành công'
      };
    } catch (error) {
      console.log('Get upcoming activities error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hoạt động sắp tới thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động đã qua
   * @param {Object} params - Tham số lọc
   * @param {string} params.type - Loại hoạt động
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getPastActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity/past', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hoạt động đã qua thành công'
      };
    } catch (error) {
      console.log('Get past activities error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hoạt động đã qua thất bại'
      };
    }
  },

  /**
   * Lấy thống kê hoạt động
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.type - Loại hoạt động
   * @returns {Promise} - Promise với response data
   */
  getActivityStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê hoạt động thành công'
      };
    } catch (error) {
      console.log('Get activity statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê hoạt động thất bại'
      };
    }
  }
};

export default activityService; 