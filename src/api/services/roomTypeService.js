import apiClient from '../config/axiosConfig';

/**
 * Room Type Service - Quản lý loại phòng
 */
const roomTypeService = {
  createRoomType: async (roomTypeData) => {
    try {
      const response = await apiClient.post('/room-types', roomTypeData);
      return { success: true, data: response.data, message: 'Tạo loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tạo loại phòng thất bại' };
    }
  },
  getAllRoomTypes: async (params = {}) => {
    try {
      const response = await apiClient.get('/room-types', { params });
      return { success: true, data: response.data, message: 'Lấy danh sách loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy danh sách loại phòng thất bại' };
    }
  },
  getRoomTypeById: async (roomTypeId) => {
    try {
      const response = await apiClient.get(`/room-types/${roomTypeId}`);
      return { success: true, data: response.data, message: 'Lấy thông tin loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy thông tin loại phòng thất bại' };
    }
  },
  updateRoomType: async (roomTypeId, updateData) => {
    try {
      const response = await apiClient.patch(`/room-types/${roomTypeId}`, updateData);
      return { success: true, data: response.data, message: 'Cập nhật loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Cập nhật loại phòng thất bại' };
    }
  },
  deleteRoomType: async (roomTypeId) => {
    try {
      const response = await apiClient.delete(`/room-types/${roomTypeId}`);
      return { success: true, data: response.data, message: 'Xóa loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Xóa loại phòng thất bại' };
    }
  },
  searchRoomTypes: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/room-types/search', { params: searchParams });
      return { success: true, data: response.data, message: 'Tìm kiếm loại phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tìm kiếm loại phòng thất bại' };
    }
  }
};

export default roomTypeService; 