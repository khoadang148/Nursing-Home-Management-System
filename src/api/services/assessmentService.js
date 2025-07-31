import apiClient from '../config/axiosConfig';

/**
 * Assessment Service - Quản lý đánh giá cư dân
 */
const assessmentService = {
  /**
   * Lấy tất cả đánh giá của resident theo ID
   * @param {string} residentId - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getAssessmentsByResidentId: async (residentId) => {
    try {
      const response = await apiClient.get(`/assessments?resident_id=${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách đánh giá thành công'
      };
    } catch (error) {
      console.log('Get assessments by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách đánh giá thất bại'
      };
    }
  },

  /**
   * Lấy tất cả đánh giá
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.assessment_type - Lọc theo loại đánh giá
   * @param {string} params.conducted_by - Lọc theo người thực hiện
   * @returns {Promise} - Promise với response data
   */
  getAllAssessments: async (params = {}) => {
    try {
      const response = await apiClient.get('/assessments', { params });
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
      const response = await apiClient.get(`/assessments/${assessmentId}`);
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
   * Tạo đánh giá mới
   * @param {Object} assessmentData - Dữ liệu đánh giá
   * @returns {Promise} - Promise với response data
   */
  createAssessment: async (assessmentData) => {
    try {
      console.log('Creating assessment with data:', assessmentData);
      
      // Validate required fields
      if (!assessmentData.resident_id) {
        return {
          success: false,
          error: 'Resident ID là bắt buộc'
        };
      }

      const response = await apiClient.post('/assessments', assessmentData);
      console.log('Assessment created successfully:', response.data);
      
      return {
        success: true,
        data: response.data,
        message: 'Tạo đánh giá thành công'
      };
    } catch (error) {
      console.log('Create assessment error:', error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        return {
          success: false,
          error: error.response?.data?.message || 'Dữ liệu không hợp lệ'
        };
      }
      
      if (error.response?.status === 401) {
        return {
          success: false,
          error: 'Không có quyền tạo đánh giá'
        };
      }
      
      if (error.response?.status === 500) {
        return {
          success: false,
          error: 'Lỗi server, vui lòng thử lại sau'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Tạo đánh giá thất bại'
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
      const response = await apiClient.patch(`/assessments/${assessmentId}`, updateData);
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
      const response = await apiClient.delete(`/assessments/${assessmentId}`);
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
  }
};

export default assessmentService; 