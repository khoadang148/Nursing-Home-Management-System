import apiClient from '../config/axiosConfig';

/**
 * Room Service - Quản lý phòng
 */
const roomService = {
  createRoom: async (roomData) => {
    try {
      const response = await apiClient.post('/rooms', roomData);
      return { success: true, data: response.data, message: 'Tạo phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tạo phòng thất bại' };
    }
  },
  getAllRooms: async (params = {}) => {
    try {
      const response = await apiClient.get('/rooms', { params });
      return { success: true, data: response.data, message: 'Lấy danh sách phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy danh sách phòng thất bại' };
    }
  },
  getRoomById: async (roomId) => {
    try {
      const response = await apiClient.get(`/rooms/${roomId}`);
      return { success: true, data: response.data, message: 'Lấy thông tin phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy thông tin phòng thất bại' };
    }
  },
  updateRoom: async (roomId, updateData) => {
    try {
      const response = await apiClient.patch(`/rooms/${roomId}`, updateData);
      return { success: true, data: response.data, message: 'Cập nhật phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Cập nhật phòng thất bại' };
    }
  },
  deleteRoom: async (roomId) => {
    try {
      const response = await apiClient.delete(`/rooms/${roomId}`);
      return { success: true, data: response.data, message: 'Xóa phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Xóa phòng thất bại' };
    }
  },
  searchRooms: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/rooms/search', { params: searchParams });
      return { success: true, data: response.data, message: 'Tìm kiếm phòng thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tìm kiếm phòng thất bại' };
    }
  },
  getRoomsByType: async (typeId, params = {}) => {
    try {
      const response = await apiClient.get(`/rooms/type/${typeId}`, { params });
      return { success: true, data: response.data, message: 'Lấy phòng theo loại thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy phòng theo loại thất bại' };
    }
  },
  getAvailableRooms: async (params = {}) => {
    try {
      const response = await apiClient.get('/rooms/available', { params });
      return { success: true, data: response.data, message: 'Lấy phòng trống thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy phòng trống thất bại' };
    }
  }
};

export default roomService; 