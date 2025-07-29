import apiClient from './config/axiosConfig';
import { STAFF_ENDPOINTS } from '../constants/api';

// Staff service functions
const staffService = {
  // Get all staff
  getAllStaff: async () => {
    try {
      const response = await apiClient.get(STAFF_ENDPOINTS.getAllStaff);
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Get all staff error:', error);
      return { data: [], success: false, error: error.response?.data?.message || 'Không thể lấy danh sách nhân viên' };
    }
  },
  
  // Get staff details by ID
  getStaffDetails: async (id) => {
    try {
      const response = await apiClient.get(STAFF_ENDPOINTS.getStaffDetails(id));
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Get staff details error:', error);
      return { data: null, success: false, error: error.response?.data?.message || 'Không thể lấy thông tin nhân viên' };
    }
  },
  
  // Create new staff member
  createStaff: async (staffData) => {
    try {
      const response = await apiClient.post(STAFF_ENDPOINTS.createStaff, staffData);
      return { data: response.data, success: true, message: 'Tạo nhân viên thành công' };
    } catch (error) {
      console.error('Create staff error:', error);
      return { data: null, success: false, error: error.response?.data?.message || 'Không thể tạo nhân viên' };
    }
  },
  
  // Update staff information
  updateStaff: async (id, staffData) => {
    try {
      const response = await apiClient.put(STAFF_ENDPOINTS.updateStaff(id), staffData);
      return { data: response.data, success: true, message: 'Cập nhật nhân viên thành công' };
    } catch (error) {
      console.error('Update staff error:', error);
      return { data: null, success: false, error: error.response?.data?.message || 'Không thể cập nhật nhân viên' };
    }
  },
  
  // Delete staff (set status to inactive)
  deleteStaff: async (id) => {
    try {
      const response = await apiClient.delete(STAFF_ENDPOINTS.deleteStaff(id));
      return { data: response.data, success: true, message: 'Xóa nhân viên thành công' };
    } catch (error) {
      console.error('Delete staff error:', error);
      return { data: null, success: false, error: error.response?.data?.message || 'Không thể xóa nhân viên' };
    }
  },
  
  // Get staff schedule
  getStaffSchedule: async (id) => {
    try {
      const response = await apiClient.get(STAFF_ENDPOINTS.getStaffSchedule(id));
      return { data: response.data, success: true };
    } catch (error) {
      console.error('Get staff schedule error:', error);
      return { data: null, success: false, error: error.response?.data?.message || 'Không thể lấy lịch làm việc' };
    }
  },
};

export default staffService; 