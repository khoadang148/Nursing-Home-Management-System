import apiClient from '../config/axiosConfig';
import { apiService } from '../apiService';
import { delay } from '../../utils/helpers';
import { carePlans, roomTypes, residents, carePlanAssignments } from '../mockData';

/**
 * Care Plan Service - Quản lý gói chăm sóc
 */
const carePlanService = {
  // ==================== API ENDPOINTS (REAL API) ====================
  
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
  },

  /**
   * Lấy gói chăm sóc assignment theo residentId (API thật)
   * @param {string} residentId
   * @returns {Promise<Object>} Assignment đầu tiên (nếu có)
   */
  getCarePlanAssignmentByResidentId: async (residentId) => {
    try {
      const response = await apiClient.get(`/care-plan-assignments/by-resident/${residentId}`);
      if (Array.isArray(response.data) && response.data.length > 0) {
        return { success: true, data: response.data[0] };
      }
      return { success: false, data: null, error: 'Không có gói chăm sóc' };
    } catch (error) {
      return { success: false, data: null, error: error.response?.data || error.message || 'Không thể lấy gói chăm sóc' };
    }
  },

  // ==================== MOCK DATA FUNCTIONS (DEVELOPMENT) ====================

  /**
   * Lấy danh sách tất cả gói dịch vụ chăm sóc (Mock Data)
   * @returns {Promise<Array>} Danh sách gói dịch vụ
   */
  getCarePlans: async () => {
    try {
      await delay(300); // Simulate API delay
      // Sử dụng mock data cho development
      return carePlans;
      
      // Uncomment khi có API thật
      // const response = await apiService.get('/care-plans');
      // return response.data;
    } catch (error) {
      console.error('Error fetching care plans:', error);
      throw error;
    }
  },

  /**
   * Lấy gói dịch vụ theo loại (main hoặc supplementary) (Mock Data)
   * @param {string} category - Loại gói dịch vụ ('main' hoặc 'supplementary')
   * @returns {Promise<Array>} Danh sách gói dịch vụ theo loại
   */
  getCarePlansByCategory: async (category) => {
    try {
      await delay(300);
      const response = await apiService.get(`/care-plans?category=${category}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching care plans by category:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách phòng có sẵn (Mock Data)
   * @returns {Promise<Array>} Danh sách phòng có sẵn
   */
  getAvailableRooms: async () => {
    try {
      await delay(300);
      const response = await apiService.get('/rooms?status=available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách giường có sẵn (Mock Data)
   * @returns {Promise<Array>} Danh sách giường có sẵn
   */
  getAvailableBeds: async () => {
    try {
      await delay(300);
      const response = await apiService.get('/beds?status=available');
      return response.data;
    } catch (error) {
      console.error('Error fetching available beds:', error);
      throw error;
    }
  },

  /**
   * Lấy thông tin loại phòng và giá (Mock Data)
   * @returns {Promise<Array>} Danh sách loại phòng
   */
  getRoomTypes: async () => {
    try {
      await delay(300);
      // Sử dụng mock data cho development
      return roomTypes;
      
      // Uncomment khi có API thật
      // const response = await apiService.get('/room-types');
      // return response.data;
    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách cư dân (residents) (Mock Data)
   * @returns {Promise<Array>} Danh sách cư dân
   */
  getResidents: async () => {
    try {
      await delay(300);
      // Sử dụng mock data cho development
      return residents;
      
      // Uncomment khi có API thật
      // const response = await apiService.get('/residents');
      // return response.data;
    } catch (error) {
      console.error('Error fetching residents:', error);
      throw error;
    }
  },

  /**
   * Tạo đăng ký gói dịch vụ mới (Mock Data)
   * @param {Object} assignmentData - Dữ liệu đăng ký gói dịch vụ
   * @returns {Promise<Object>} Thông tin đăng ký mới
   */
  createCarePlanAssignment: async (assignmentData) => {
    try {
      await delay(500);
      // Sử dụng mock data cho development
      const newAssignment = {
        _id: `assignment_${Date.now()}`,
        ...assignmentData,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Trong thực tế, đây sẽ được lưu vào database
      console.log('Created care plan assignment:', newAssignment);
      return newAssignment;
      
      // Uncomment khi có API thật
      // const response = await apiService.post('/care-plan-assignments', assignmentData);
      // return response.data;
    } catch (error) {
      console.error('Error creating care plan assignment:', error);
      throw error;
    }
  },

  /**
   * Cập nhật đăng ký gói dịch vụ (Mock Data)
   * @param {string} assignmentId - ID đăng ký
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Thông tin đăng ký đã cập nhật
   */
  updateCarePlanAssignment: async (assignmentId, updateData) => {
    try {
      await delay(300);
      const response = await apiService.put(`/care-plan-assignments/${assignmentId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating care plan assignment:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách đăng ký gói dịch vụ (Mock Data)
   * @returns {Promise<Array>} Danh sách đăng ký gói dịch vụ
   */
  getCarePlanAssignments: async () => {
    try {
      await delay(300);
      // Sử dụng mock data cho development
      return carePlanAssignments;
      
      // Uncomment khi có API thật
      // const response = await apiService.get('/care-plan-assignments');
      // return response.data;
    } catch (error) {
      console.error('Error fetching care plan assignments:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết đăng ký gói dịch vụ (Mock Data)
   * @param {string} assignmentId - ID đăng ký
   * @returns {Promise<Object>} Chi tiết đăng ký gói dịch vụ
   */
  getCarePlanAssignmentById: async (assignmentId) => {
    try {
      await delay(200);
      const response = await apiService.get(`/care-plan-assignments/${assignmentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching care plan assignment:', error);
      throw error;
    }
  },

  /**
   * Tính toán giá tiền dựa trên gói dịch vụ và loại phòng
   * @param {Array} selectedCarePlans - Danh sách gói dịch vụ đã chọn
   * @param {string} selectedRoomType - Loại phòng đã chọn
   * @param {Array} roomTypes - Danh sách loại phòng
   * @returns {Object} Thông tin chi phí
   */
  calculateTotalCost: (selectedCarePlans, selectedRoomType, roomTypes) => {
    let carePlansCost = 0;
    let roomCost = 0;

    // Tính tổng chi phí gói dịch vụ
    if (selectedCarePlans && selectedCarePlans.length > 0) {
      carePlansCost = selectedCarePlans.filter(Boolean).reduce((total, plan) => {
        return total + (plan?.monthly_price || 0);
      }, 0);
    }

    // Tính chi phí phòng
    if (selectedRoomType && roomTypes) {
      const roomType = roomTypes.filter(Boolean).find(rt => rt.room_type === selectedRoomType);
      if (roomType) {
        roomCost = roomType?.monthly_price || 0;
      }
    }

    return {
      carePlansCost,
      roomCost,
      totalCost: carePlansCost + roomCost
    };
  },

  // ==================== LEGACY SUPPORT ====================

  /**
   * LEGACY SUPPORT: Export individual functions for backward compatibility
   */
  getCarePlansLegacy: async () => {
    return await carePlanService.getCarePlans();
  },

  getCarePlansByCategoryLegacy: async (category) => {
    return await carePlanService.getCarePlansByCategory(category);
  },

  getAvailableRoomsLegacy: async () => {
    return await carePlanService.getAvailableRooms();
  },

  getAvailableBedsLegacy: async () => {
    return await carePlanService.getAvailableBeds();
  },

  getRoomTypesLegacy: async () => {
    return await carePlanService.getRoomTypes();
  },

  getResidentsLegacy: async () => {
    return await carePlanService.getResidents();
  },

  createCarePlanAssignmentLegacy: async (assignmentData) => {
    return await carePlanService.createCarePlanAssignment(assignmentData);
  },

  updateCarePlanAssignmentLegacy: async (assignmentId, updateData) => {
    return await carePlanService.updateCarePlanAssignment(assignmentId, updateData);
  },

  getCarePlanAssignmentsLegacy: async () => {
    return await carePlanService.getCarePlanAssignments();
  },

  getCarePlanAssignmentByIdLegacy: async (assignmentId) => {
    return await carePlanService.getCarePlanAssignmentById(assignmentId);
  },

  calculateTotalCostLegacy: (selectedCarePlans, selectedRoomType, roomTypes) => {
    return carePlanService.calculateTotalCost(selectedCarePlans, selectedRoomType, roomTypes);
  }
};

// API endpoints - sẽ được sử dụng khi có API thực tế
const API_ENDPOINTS = {
  CARE_PLANS: '/care-plans',
  ROOM_TYPES: '/room-types',
  RESIDENTS: '/residents',
  ROOMS: '/rooms',
  BEDS: '/beds',
  CARE_PLAN_ASSIGNMENTS: '/care-plan-assignments',
};

export default carePlanService; 