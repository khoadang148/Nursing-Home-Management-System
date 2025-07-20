import apiClient from '../config/axiosConfig';

/**
 * Vital Signs Service - Quản lý dấu hiệu sinh tồn
 */
const vitalSignsService = {
  /**
   * Tạo dấu hiệu sinh tồn mới
   * @param {Object} vitalSignsData - Dữ liệu dấu hiệu sinh tồn
   * @param {string} vitalSignsData.resident_id - ID cư dân
   * @param {number} vitalSignsData.temperature - Nhiệt độ
   * @param {number} vitalSignsData.blood_pressure_systolic - Huyết áp tâm thu
   * @param {number} vitalSignsData.blood_pressure_diastolic - Huyết áp tâm trương
   * @param {number} vitalSignsData.heart_rate - Nhịp tim
   * @param {number} vitalSignsData.respiratory_rate - Nhịp thở
   * @param {number} vitalSignsData.oxygen_saturation - Độ bão hòa oxy
   * @param {string} vitalSignsData.notes - Ghi chú
   * @param {string} vitalSignsData.recorded_by - ID người ghi
   * @returns {Promise} - Promise với response data
   */
  createVitalSigns: async (vitalSignsData) => {
    try {
      const response = await apiClient.post('/vital-signs', vitalSignsData);
      return {
        success: true,
        data: response.data,
        message: 'Ghi dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Create vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Ghi dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Lấy tất cả dấu hiệu sinh tồn
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllVitalSigns: async (params = {}) => {
    try {
      const response = await apiClient.get('/vital-signs', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Get all vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Lấy dấu hiệu sinh tồn theo ID
   * @param {string} vitalSignsId - ID dấu hiệu sinh tồn
   * @returns {Promise} - Promise với response data
   */
  getVitalSignsById: async (vitalSignsId) => {
    try {
      const response = await apiClient.get(`/vital-signs/${vitalSignsId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Get vital signs by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Lấy dấu hiệu sinh tồn theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getVitalSignsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/vital-signs/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy dấu hiệu sinh tồn theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get vital signs by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy dấu hiệu sinh tồn theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật dấu hiệu sinh tồn
   * @param {string} vitalSignsId - ID dấu hiệu sinh tồn
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateVitalSigns: async (vitalSignsId, updateData) => {
    try {
      const response = await apiClient.patch(`/vital-signs/${vitalSignsId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Update vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Xóa dấu hiệu sinh tồn
   * @param {string} vitalSignsId - ID dấu hiệu sinh tồn
   * @returns {Promise} - Promise với response data
   */
  deleteVitalSigns: async (vitalSignsId) => {
    try {
      const response = await apiClient.delete(`/vital-signs/${vitalSignsId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Delete vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Lấy dấu hiệu sinh tồn mới nhất của cư dân
   * @param {string} residentId - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getLatestVitalSigns: async (residentId) => {
    try {
      const response = await apiClient.get(`/vital-signs/resident/${residentId}/latest`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy dấu hiệu sinh tồn mới nhất thành công'
      };
    } catch (error) {
      console.log('Get latest vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy dấu hiệu sinh tồn mới nhất thất bại'
      };
    }
  },

  /**
   * Lấy thống kê dấu hiệu sinh tồn
   * @param {Object} params - Tham số thống kê
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getVitalSignsStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/vital-signs/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Get vital signs statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê dấu hiệu sinh tồn thất bại'
      };
    }
  },

  /**
   * Tìm kiếm dấu hiệu sinh tồn
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @param {string} searchParams.recorded_by - ID người ghi
   * @returns {Promise} - Promise với response data
   */
  searchVitalSigns: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/vital-signs/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm dấu hiệu sinh tồn thành công'
      };
    } catch (error) {
      console.log('Search vital signs error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm dấu hiệu sinh tồn thất bại'
      };
    }
  }
};

export default vitalSignsService; 