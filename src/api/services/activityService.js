import apiClient from '../config/axiosConfig';

/**
 * Activity Service - Quản lý hoạt động
 */
const activityService = {
  /**
   * Tạo hoạt động mới
   * @param {Object} activityData - Dữ liệu hoạt động
   * @returns {Promise} - Promise với response data
   */
  createActivity: async (activityData) => {
    try {
      if (__DEV__) {
        console.log('Creating activity with data:', activityData);
      }
      const response = await apiClient.post('/activities', activityData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo hoạt động thành công'
      };
    } catch (error) {
      // Xử lý lỗi từ backend
      let errorMessage = 'Tạo hoạt động thất bại';
      
      if (error.response?.data) {
        // Nếu backend trả về message cụ thể
        if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else if (error.response.status === 400) {
          // Lỗi validation hoặc business logic
          errorMessage = 'Thông tin không hợp lệ hoặc có xung đột lịch trình. Vui lòng kiểm tra lại.';
        } else if (error.response.status === 500) {
          errorMessage = 'Lỗi hệ thống. Vui lòng thử lại sau.';
        }
      } else if (error.message) {
        // Lọc bỏ các thông tin debug không cần thiết
        if (error.message.includes('Network Error')) {
          errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Kết nối bị timeout. Vui lòng thử lại.';
        } else {
          errorMessage = error.message;
        }
      }
      
      return {
        success: false,
        error: errorMessage
      };
    }
  },

  /**
   * Lấy tất cả hoạt động
   * @param {Object} params - Query parameters (optional)
   * @returns {Promise} - Promise với response data
   */
  getAllActivities: async (params = {}) => {
    try {
      const response = await apiClient.get('/activities', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách hoạt động thành công'
      };
    } catch (error) {
      console.error('Get all activities error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động theo ID
   * @param {string} activityId - ID của hoạt động
   * @returns {Promise} - Promise với response data
   */
  getActivityById: async (activityId) => {
    try {
      const response = await apiClient.get(`/activities/${activityId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin hoạt động thành công'
      };
    } catch (error) {
      console.error('Get activity by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin hoạt động thất bại'
      };
    }
  },

  /**
   * Cập nhật hoạt động
   * @param {string} activityId - ID của hoạt động
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateActivity: async (activityId, updateData) => {
    try {
      const response = await apiClient.patch(`/activities/${activityId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật hoạt động thành công'
      };
    } catch (error) {
      console.error('Update activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật hoạt động thất bại'
      };
    }
  },

  /**
   * Xóa hoạt động
   * @param {string} activityId - ID của hoạt động
   * @returns {Promise} - Promise với response data
   */
  deleteActivity: async (activityId) => {
    try {
      const response = await apiClient.delete(`/activities/${activityId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa hoạt động thành công'
      };
    } catch (error) {
      console.error('Delete activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa hoạt động thất bại'
      };
    }
  },

  /**
   * Đề xuất hoạt động bằng AI
   * @param {Array} residentIds - Danh sách ID cư dân
   * @param {string} scheduleTime - Thời gian lịch trình
   * @returns {Promise} - Promise với response data
   */
  recommendActivityAI: async (residentIds, scheduleTime) => {
    try {
      const response = await apiClient.post('/activities/recommendation/ai', {
        resident_ids: residentIds,
        schedule_time: scheduleTime
      });
      return {
        success: true,
        data: response.data,
        message: 'Đề xuất hoạt động thành công'
      };
    } catch (error) {
      console.error('Recommend activity AI error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Đề xuất hoạt động thất bại'
      };
    }
  }
};

export default activityService; 