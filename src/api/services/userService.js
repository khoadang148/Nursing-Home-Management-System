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

  // Cập nhật avatar cho user
  updateAvatar: async (userId, imageUri) => {
    try {
      // Tạo FormData để upload file
      const formData = new FormData();
      
      // Detect file type từ extension
      const getFileType = (uri) => {
        if (uri.includes('.jpg') || uri.includes('.jpeg')) return 'image/jpeg';
        if (uri.includes('.png')) return 'image/png';
        if (uri.includes('.gif')) return 'image/gif';
        if (uri.includes('.webp')) return 'image/webp';
        return 'image/jpeg'; // default
      };
      
      const getFileName = (uri) => {
        const timestamp = Date.now();
        const extension = uri.includes('.png') ? '.png' : 
                         uri.includes('.gif') ? '.gif' : 
                         uri.includes('.webp') ? '.webp' : '.jpg';
        return `avatar_${timestamp}${extension}`;
      };
      
      // Tạo file object từ URI
      const file = {
        uri: imageUri,
        type: getFileType(imageUri),
        name: getFileName(imageUri)
      };
      
      formData.append('avatar', file);
      
      const response = await apiRequest.patch(`/users/${userId}/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật ảnh đại diện thành công'
      };
    } catch (error) {
      console.error('Error updating avatar:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật ảnh đại diện thất bại'
      };
    }
  },

  // Cập nhật thông tin user
  updateUser: async (userId, userData) => {
    try {
      const response = await apiRequest.patch(`/users/${userId}`, userData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thông tin thành công'
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật thông tin thất bại'
      };
    }
  },

  // Check if phone number exists
  checkPhoneExists: async (phone) => {
    try {
      const response = await apiRequest.get(`/users/check-phone/${phone}`);
      return response.data;
    } catch (error) {
      console.error('Error checking phone exists:', error);
      throw error;
    }
  },

  // Check if email exists
  checkEmailExists: async (email) => {
    try {
      const response = await apiRequest.get(`/users/check-email/${email}`);
      return response.data;
    } catch (error) {
      console.error('Error checking email exists:', error);
      throw error;
    }
  },
};

export default userService; 