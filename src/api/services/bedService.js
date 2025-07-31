import apiClient from '../config/axiosConfig';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Bed Service - Quản lý giường bệnh
 */
const bedService = {
  /**
   * Tạo giường mới
   * @param {Object} bedData - Dữ liệu giường
   * @param {string} bedData.bed_number - Số giường
   * @param {string} bedData.room_id - ID phòng
   * @param {string} bedData.bed_type - Loại giường (standard, premium, etc.)
   * @param {string} bedData.status - Trạng thái (available, occupied, maintenance)
   * @returns {Promise} - Promise với response data
   */
  createBed: async (bedData) => {
    try {
      const response = await apiClient.post('/beds', bedData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo giường thành công'
      };
    } catch (error) {
      console.log('Create bed error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo giường thất bại'
      };
    }
  },

  /**
   * Lấy tất cả giường
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.bed_type - Lọc theo loại giường
   * @param {string} params.room_id - Lọc theo phòng
   * @returns {Promise} - Promise với response data
   */
  getAllBeds: async (params = {}) => {
    try {
      const response = await apiClient.get('/beds', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giường thành công'
      };
    } catch (error) {
      console.log('Get all beds error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách giường thất bại'
      };
    }
  },

  /**
   * Lấy giường theo ID
   * @param {string} bedId - ID giường
   * @returns {Promise} - Promise với response data
   */
  getBedById: async (bedId) => {
    try {
      const response = await apiClient.get(`/beds/${bedId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin giường thành công'
      };
    } catch (error) {
      console.log('Get bed by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin giường thất bại'
      };
    }
  },

  /**
   * Lấy giường theo room ID
   * @param {string} roomId - ID phòng
   * @returns {Promise} - Promise với response data
   */
  getBedsByRoomId: async (roomId) => {
    try {
      const response = await apiClient.get(`/beds/by-room/${roomId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giường theo phòng thành công'
      };
    } catch (error) {
      console.log('Get beds by room ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách giường theo phòng thất bại'
      };
    }
  },

  /**
   * Cập nhật giường theo ID
   * @param {string} bedId - ID giường
   * @param {Object} updateData - Dữ liệu cập nhật
   * @param {string} updateData.bed_number - Số giường (optional)
   * @param {string} updateData.room_id - ID phòng (optional)
   * @param {string} updateData.bed_type - Loại giường (optional)
   * @param {string} updateData.status - Trạng thái (optional)
   * @returns {Promise} - Promise với response data
   */
  updateBed: async (bedId, updateData) => {
    try {
      const response = await apiClient.patch(`/beds/${bedId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật giường thành công'
      };
    } catch (error) {
      console.log('Update bed error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật giường thất bại'
      };
    }
  },

  /**
   * Xóa giường theo ID
   * @param {string} bedId - ID giường
   * @returns {Promise} - Promise với response data
   */
  deleteBed: async (bedId) => {
    try {
      const response = await apiClient.delete(`/beds/${bedId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa giường thành công'
      };
    } catch (error) {
      console.log('Delete bed error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa giường thất bại'
      };
    }
  },

  /**
   * Tìm kiếm giường
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.status - Trạng thái
   * @param {string} searchParams.bed_type - Loại giường
   * @param {string} searchParams.room_id - ID phòng
   * @returns {Promise} - Promise với response data
   */
  searchBeds: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/beds/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm giường thành công'
      };
    } catch (error) {
      console.log('Search beds error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm giường thất bại'
      };
    }
  },

  /**
   * Lấy thống kê giường
   * @returns {Promise} - Promise với response data
   */
  getBedStatistics: async () => {
    try {
      const response = await apiClient.get('/beds/statistics');
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê giường thành công'
      };
    } catch (error) {
      console.log('Get bed statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê giường thất bại'
      };
    }
  },

  /**
   * Lấy giường có sẵn
   * @param {Object} params - Tham số lọc
   * @param {string} params.bed_type - Loại giường
   * @param {string} params.room_id - ID phòng
   * @returns {Promise} - Promise với response data
   */
  getAvailableBeds: async (params = {}) => {
    try {
      const response = await apiClient.get('/beds/available', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giường có sẵn thành công'
      };
    } catch (error) {
      console.log('Get available beds error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách giường có sẵn thất bại'
      };
    }
  },

  /**
   * Lấy tất cả giường theo trạng thái
   * @param {string} status - Trạng thái (available, occupied, hoặc undefined để lấy tất cả)
   * @returns {Promise} - Promise với response data
   */
  getAllBedsByStatus: async (status) => {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get('/beds', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách giường theo trạng thái thành công'
      };
    } catch (error) {
      console.log('Get beds by status error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách giường theo trạng thái thất bại'
      };
    }
  }
};

export default bedService; 