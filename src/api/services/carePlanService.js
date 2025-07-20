import apiClient from '../config/axiosConfig';

/**
 * Care Plan Service - Quản lý gói chăm sóc
 */
const carePlanService = {
  createCarePlan: async (carePlanData) => {
    try {
      const response = await apiClient.post('/care-plans', carePlanData);
      return { success: true, data: response.data, message: 'Tạo gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tạo gói chăm sóc thất bại' };
    }
  },
  getAllCarePlans: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plans', { params });
      return { success: true, data: response.data, message: 'Lấy danh sách gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy danh sách gói chăm sóc thất bại' };
    }
  },
  getCarePlanById: async (carePlanId) => {
    try {
      const response = await apiClient.get(`/care-plans/${carePlanId}`);
      return { success: true, data: response.data, message: 'Lấy thông tin gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy thông tin gói chăm sóc thất bại' };
    }
  },
  updateCarePlan: async (carePlanId, updateData) => {
    try {
      const response = await apiClient.patch(`/care-plans/${carePlanId}`, updateData);
      return { success: true, data: response.data, message: 'Cập nhật gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Cập nhật gói chăm sóc thất bại' };
    }
  },
  deleteCarePlan: async (carePlanId) => {
    try {
      const response = await apiClient.delete(`/care-plans/${carePlanId}`);
      return { success: true, data: response.data, message: 'Xóa gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Xóa gói chăm sóc thất bại' };
    }
  },
  searchCarePlans: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/care-plans/search', { params: searchParams });
      return { success: true, data: response.data, message: 'Tìm kiếm gói chăm sóc thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Tìm kiếm gói chăm sóc thất bại' };
    }
  },
  getActiveCarePlans: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plans/active', { params });
      return { success: true, data: response.data, message: 'Lấy gói chăm sóc đang hoạt động thành công' };
    } catch (error) {
      return { success: false, error: error.response?.data || error.message || 'Lấy gói chăm sóc đang hoạt động thất bại' };
    }
  }
};

export default carePlanService; 