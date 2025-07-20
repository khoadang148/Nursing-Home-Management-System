import apiClient from '../config/axiosConfig';

/**
 * Care Notes Service - Quản lý ghi chú chăm sóc (Assessments)
 */
const careNotesService = {
  /**
   * Tạo ghi chú chăm sóc mới
   * @param {Object} careNoteData - Dữ liệu ghi chú chăm sóc
   * @param {string} careNoteData.resident_id - ID cư dân
   * @param {string} careNoteData.title - Tiêu đề ghi chú
   * @param {string} careNoteData.content - Nội dung ghi chú
   * @param {string} careNoteData.category - Danh mục ghi chú
   * @param {string} careNoteData.priority - Mức độ ưu tiên
   * @param {string} careNoteData.status - Trạng thái
   * @param {string} careNoteData.created_by - ID người tạo
   * @param {Array} careNoteData.tags - Tags
   * @returns {Promise} - Promise với response data
   */
  createCareNote: async (careNoteData) => {
    try {
      const response = await apiClient.post('/care-notes', careNoteData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Create care note error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy tất cả ghi chú chăm sóc
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
  getAllCareNotes: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get all care notes error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy ghi chú chăm sóc theo ID
   * @param {string} careNoteId - ID ghi chú chăm sóc
   * @returns {Promise} - Promise với response data
   */
  getCareNoteById: async (careNoteId) => {
    try {
      const response = await apiClient.get(`/care-notes/${careNoteId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care note by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy ghi chú chăm sóc theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.category - Danh mục ghi chú
   * @param {string} params.priority - Mức độ ưu tiên
   * @param {string} params.status - Trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getCareNotesByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ghi chú chăm sóc theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get care notes by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ghi chú chăm sóc theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật ghi chú chăm sóc
   * @param {string} careNoteId - ID ghi chú chăm sóc
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateCareNote: async (careNoteId, updateData) => {
    try {
      const response = await apiClient.patch(`/care-notes/${careNoteId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Update care note error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Xóa ghi chú chăm sóc
   * @param {string} careNoteId - ID ghi chú chăm sóc
   * @returns {Promise} - Promise với response data
   */
  deleteCareNote: async (careNoteId) => {
    try {
      const response = await apiClient.delete(`/care-notes/${careNoteId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Delete care note error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Thay đổi trạng thái ghi chú chăm sóc
   * @param {string} careNoteId - ID ghi chú chăm sóc
   * @param {string} status - Trạng thái mới
   * @param {Object} statusData - Dữ liệu thay đổi trạng thái
   * @returns {Promise} - Promise với response data
   */
  changeCareNoteStatus: async (careNoteId, status, statusData = {}) => {
    try {
      const response = await apiClient.patch(`/care-notes/${careNoteId}/status`, {
        status,
        ...statusData
      });
      return {
        success: true,
        data: response.data,
        message: 'Thay đổi trạng thái ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Change care note status error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Thay đổi trạng thái ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy ghi chú chăm sóc theo danh mục
   * @param {string} residentId - ID cư dân
   * @param {string} category - Danh mục ghi chú
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getCareNotesByCategory: async (residentId, category, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}/category/${category}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ghi chú chăm sóc theo danh mục thành công'
      };
    } catch (error) {
      console.log('Get care notes by category error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ghi chú chăm sóc theo danh mục thất bại'
      };
    }
  },

  /**
   * Lấy ghi chú chăm sóc gần đây
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getRecentCareNotes: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/care-notes/resident/${residentId}/recent`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ghi chú chăm sóc gần đây thành công'
      };
    } catch (error) {
      console.log('Get recent care notes error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ghi chú chăm sóc gần đây thất bại'
      };
    }
  },

  /**
   * Lấy ghi chú chăm sóc ưu tiên cao
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.priority - Mức độ ưu tiên
   * @returns {Promise} - Promise với response data
   */
  getHighPriorityCareNotes: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes/high-priority', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ghi chú chăm sóc ưu tiên cao thành công'
      };
    } catch (error) {
      console.log('Get high priority care notes error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ghi chú chăm sóc ưu tiên cao thất bại'
      };
    }
  },

  /**
   * Tìm kiếm ghi chú chăm sóc
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.category - Danh mục ghi chú
   * @param {string} searchParams.priority - Mức độ ưu tiên
   * @param {string} searchParams.status - Trạng thái
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchCareNotes: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/care-notes/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Search care notes error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm ghi chú chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy thống kê ghi chú chăm sóc
   * @param {Object} params - Tham số thống kê
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getCareNoteStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-notes/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê ghi chú chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care note statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê ghi chú chăm sóc thất bại'
      };
    }
  }
};

export default careNotesService; 