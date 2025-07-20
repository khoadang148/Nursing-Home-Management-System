import apiClient from '../config/axiosConfig';

/**
 * Assessment Service - Quản lý đánh giá chăm sóc
 */
const assessmentService = {
  /**
   * Tạo đánh giá mới
   * @param {Object} assessmentData - Dữ liệu đánh giá
   * @param {string} assessmentData.resident_id - ID cư dân
   * @param {string} assessmentData.title - Tiêu đề đánh giá
   * @param {string} assessmentData.content - Nội dung đánh giá
   * @param {string} assessmentData.category - Danh mục đánh giá
   * @param {string} assessmentData.priority - Mức độ ưu tiên
   * @param {string} assessmentData.status - Trạng thái
   * @param {string} assessmentData.created_by - ID người tạo
   * @param {Array} assessmentData.tags - Tags
   * @param {Object} assessmentData.scores - Điểm số các tiêu chí
   * @param {string} assessmentData.assessment_date - Ngày đánh giá
   * @returns {Promise} - Promise với response data
   */
  createAssessment: async (assessmentData) => {
    try {
      const response = await apiClient.post('/care-notes', assessmentData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo đánh giá thành công'
      };
    } catch (error) {
      console.log('Create assessment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy tất cả đánh giá
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.category - Lọc theo danh mục
   * @param {string} params.priority - Lọc theo mức độ ưu tiên
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllAssessments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách đánh giá thành công'
      };
    } catch (error) {
      console.log('Get all assessments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá theo ID
   * @param {string} assessmentId - ID đánh giá
   * @returns {Promise} - Promise với response data
   */
  getAssessmentById: async (assessmentId) => {
    try {
      const response = await apiClient.get(`/care-notes/${assessmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin đánh giá thành công'
      };
    } catch (error) {
      console.log('Get assessment by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.category - Danh mục đánh giá
   * @param {string} params.priority - Mức độ ưu tiên
   * @param {string} params.status - Trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getAssessmentsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get assessments by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật đánh giá
   * @param {string} assessmentId - ID đánh giá
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateAssessment: async (assessmentId, updateData) => {
    try {
      const response = await apiClient.patch(`/care-notes/${assessmentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật đánh giá thành công'
      };
    } catch (error) {
      console.log('Update assessment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật đánh giá thất bại'
      };
    }
  },

  /**
   * Xóa đánh giá
   * @param {string} assessmentId - ID đánh giá
   * @returns {Promise} - Promise với response data
   */
  deleteAssessment: async (assessmentId) => {
    try {
      const response = await apiClient.delete(`/care-notes/${assessmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa đánh giá thành công'
      };
    } catch (error) {
      console.log('Delete assessment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa đánh giá thất bại'
      };
    }
  },

  /**
   * Thay đổi trạng thái đánh giá
   * @param {string} assessmentId - ID đánh giá
   * @param {string} status - Trạng thái mới
   * @param {Object} statusData - Dữ liệu thay đổi trạng thái
   * @returns {Promise} - Promise với response data
   */
  changeAssessmentStatus: async (assessmentId, status, statusData = {}) => {
    try {
      const response = await apiClient.patch(`/care-notes/${assessmentId}/status`, {
        status,
        ...statusData
      });
      return {
        success: true,
        data: response.data,
        message: 'Thay đổi trạng thái đánh giá thành công'
      };
    } catch (error) {
      console.log('Change assessment status error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Thay đổi trạng thái đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá theo danh mục
   * @param {string} residentId - ID cư dân
   * @param {string} category - Danh mục đánh giá
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAssessmentsByCategory: async (residentId, category, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}/category/${category}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá theo danh mục thành công'
      };
    } catch (error) {
      console.log('Get assessments by category error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá theo danh mục thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá gần đây
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getRecentAssessments: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}/recent`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá gần đây thành công'
      };
    } catch (error) {
      console.log('Get recent assessments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá gần đây thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá ưu tiên cao
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.priority - Mức độ ưu tiên
   * @returns {Promise} - Promise với response data
   */
  getHighPriorityAssessments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes/high-priority', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá ưu tiên cao thành công'
      };
    } catch (error) {
      console.log('Get high priority assessments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá ưu tiên cao thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá theo ngày
   * @param {string} date - Ngày đánh giá (YYYY-MM-DD)
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.category - Danh mục đánh giá
   * @returns {Promise} - Promise với response data
   */
  getAssessmentsByDate: async (date, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/date/${date}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá theo ngày thành công'
      };
    } catch (error) {
      console.log('Get assessments by date error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá theo ngày thất bại'
      };
    }
  },

  /**
   * Lấy đánh giá theo loại
   * @param {string} assessmentType - Loại đánh giá
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getAssessmentsByType: async (assessmentType, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/type/${assessmentType}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy đánh giá theo loại thành công'
      };
    } catch (error) {
      console.log('Get assessments by type error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy đánh giá theo loại thất bại'
      };
    }
  },

  /**
   * Tìm kiếm đánh giá
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.category - Danh mục đánh giá
   * @param {string} searchParams.priority - Mức độ ưu tiên
   * @param {string} searchParams.status - Trạng thái
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchAssessments: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/care-notes/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm đánh giá thành công'
      };
    } catch (error) {
      console.log('Search assessments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy thống kê đánh giá
   * @param {Object} params - Tham số thống kê
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.category - Danh mục đánh giá
   * @returns {Promise} - Promise với response data
   */
  getAssessmentStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê đánh giá thành công'
      };
    } catch (error) {
      console.log('Get assessment statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê đánh giá thất bại'
      };
    }
  },

  /**
   * Xuất báo cáo đánh giá
   * @param {Object} params - Tham số xuất báo cáo
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.format - Định dạng xuất (pdf, excel)
   * @returns {Promise} - Promise với response data
   */
  exportAssessmentReport: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes/export', { 
        params,
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
        message: 'Xuất báo cáo đánh giá thành công'
      };
    } catch (error) {
      console.log('Export assessment report error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xuất báo cáo đánh giá thất bại'
      };
    }
  }
};

export default assessmentService; 