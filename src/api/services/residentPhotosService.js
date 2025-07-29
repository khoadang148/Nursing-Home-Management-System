import apiClient from '../config/axiosConfig';

/**
 * Resident Photos Service - Quản lý ảnh cư dân
 */
const residentPhotosService = {
  /**
   * Tải lên ảnh cư dân
   * @param {string} residentId - ID cư dân
   * @param {FormData} formData - Dữ liệu ảnh (FormData)
   * @param {Function} onProgress - Callback cho progress upload
   * @returns {Promise} - Promise với response data
   */
  uploadResidentPhoto: async (residentId, formData, onProgress = () => {}) => {
    try {
      const response = await apiClient.post(`/resident-photos/${residentId}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        },
      });
      return {
        success: true,
        data: response.data,
        message: 'Tải lên ảnh thành công'
      };
    } catch (error) {
      console.log('Upload resident photo error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tải lên ảnh thất bại'
      };
    }
  },

  /**
   * Lấy tất cả ảnh cư dân
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.category - Lọc theo danh mục
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllResidentPhotos: async (params = {}) => {
    try {
      const response = await apiClient.get('/resident-photos', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách ảnh cư dân thành công'
      };
    } catch (error) {
      console.log('Get all resident photos error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách ảnh cư dân thất bại'
      };
    }
  },

  /**
   * Lấy ảnh cư dân theo ID
   * @param {string} photoId - ID ảnh
   * @returns {Promise} - Promise với response data
   */
  getResidentPhotoById: async (photoId) => {
    try {
      const response = await apiClient.get(`/resident-photos/${photoId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin ảnh thành công'
      };
    } catch (error) {
      console.log('Get resident photo by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin ảnh thất bại'
      };
    }
  },

  /**
   * Lấy ảnh theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.category - Danh mục ảnh
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getResidentPhotosByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/resident-photos/by-resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ảnh theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get resident photos by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ảnh theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật thông tin ảnh
   * @param {string} photoId - ID ảnh
   * @param {Object} updateData - Dữ liệu cập nhật
   * @param {string} updateData.title - Tiêu đề ảnh
   * @param {string} updateData.description - Mô tả
   * @param {string} updateData.category - Danh mục
   * @param {string} updateData.tags - Tags
   * @returns {Promise} - Promise với response data
   */
  updateResidentPhoto: async (photoId, updateData) => {
    try {
      const response = await apiClient.patch(`/resident-photos/${photoId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thông tin ảnh thành công'
      };
    } catch (error) {
      console.log('Update resident photo error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật thông tin ảnh thất bại'
      };
    }
  },

  /**
   * Xóa ảnh cư dân
   * @param {string} photoId - ID ảnh
   * @returns {Promise} - Promise với response data
   */
  deleteResidentPhoto: async (photoId) => {
    try {
      const response = await apiClient.delete(`/resident-photos/${photoId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa ảnh thành công'
      };
    } catch (error) {
      console.log('Delete resident photo error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa ảnh thất bại'
      };
    }
  },

  /**
   * Tải xuống ảnh
   * @param {string} photoId - ID ảnh
   * @returns {Promise} - Promise với response data
   */
  downloadResidentPhoto: async (photoId) => {
    try {
      const response = await apiClient.get(`/resident-photos/${photoId}/download`, {
        responseType: 'blob'
      });
      return {
        success: true,
        data: response.data,
        message: 'Tải xuống ảnh thành công'
      };
    } catch (error) {
      console.log('Download resident photo error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tải xuống ảnh thất bại'
      };
    }
  },

  /**
   * Lấy ảnh theo danh mục
   * @param {string} residentId - ID cư dân
   * @param {string} category - Danh mục ảnh
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getResidentPhotosByCategory: async (residentId, category, params = {}) => {
    try {
      const response = await apiClient.get(`/resident-photos/resident/${residentId}/category/${category}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ảnh theo danh mục thành công'
      };
    } catch (error) {
      console.log('Get resident photos by category error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ảnh theo danh mục thất bại'
      };
    }
  },

  /**
   * Lấy ảnh gần đây
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {number} params.limit - Giới hạn số lượng
   * @returns {Promise} - Promise với response data
   */
  getRecentResidentPhotos: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/resident-photos/resident/${residentId}/recent`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy ảnh gần đây thành công'
      };
    } catch (error) {
      console.log('Get recent resident photos error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy ảnh gần đây thất bại'
      };
    }
  },

  /**
   * Tìm kiếm ảnh cư dân
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.category - Danh mục ảnh
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchResidentPhotos: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/resident-photos/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm ảnh cư dân thành công'
      };
    } catch (error) {
      console.log('Search resident photos error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm ảnh cư dân thất bại'
      };
    }
  },

  /**
   * Lấy thống kê ảnh cư dân
   * @param {Object} params - Tham số thống kê
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getResidentPhotoStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/resident-photos/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê ảnh cư dân thành công'
      };
    } catch (error) {
      console.log('Get resident photo statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê ảnh cư dân thất bại'
      };
    }
  }
};

export default residentPhotosService; 