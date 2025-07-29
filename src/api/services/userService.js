import { apiRequest } from '../config/axiosConfig';

export const userService = {
  // Lấy danh sách users theo role
  getUsersByRole: async (role) => {
    try {
      const response = await apiRequest.get(`/users/by-role?role=${role}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching users by role:', error);
      throw error;
    }
  },

  // Tạo user mới
  createUser: async (userData) => {
    try {
      const response = await apiRequest.post('/users', userData);
      return response.data;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  },

  // Lấy thông tin user theo ID
  getUserById: async (userId) => {
    try {
      const response = await apiRequest.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      throw error;
    }
  },
};

export default userService; 