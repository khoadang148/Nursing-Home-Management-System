import apiClient from '../config/axiosConfig';

const familyService = {
  // Lấy danh sách residents của family member hiện tại
  getFamilyResidents: async (familyMemberId) => {
    try {
      // Sử dụng API có sẵn từ residents controller với family member ID
      const response = await apiClient.get(`/residents/family-member/${familyMemberId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching family residents:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách người thân',
      };
    }
  },

  // Lấy danh sách staff trong hệ thống
  getAllStaff: async () => {
    try {
      console.log('🔄 Fetching all users...');
      // Thử endpoint khác nếu endpoint cũ bị forbidden
      const response = await apiClient.get('/users');
      console.log('📊 All users response:', response.data);
      const allUsers = response.data || [];
      
      // Filter chỉ lấy staff users
      const staffUsers = allUsers.filter(user => user.role === 'staff' || user.role === 'STAFF');
      console.log('👥 Filtered staff users:', staffUsers);
      
      return {
        success: true,
        data: staffUsers,
      };
    } catch (error) {
      console.error('❌ Error fetching staff:', error);
      console.error('❌ Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách nhân viên',
      };
    }
  },

  // Lấy danh sách tất cả residents (cho staff)
  getAllResidents: async () => {
    try {
      const response = await apiClient.get('/residents');
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error fetching all residents:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tải danh sách cư dân',
      };
    }
  },
};

export default familyService;
