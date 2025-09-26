import apiClient from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const staffAssignmentService = {
  // Get current staff's assignments
  getMyAssignments: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, error: 'User not authenticated' };
      }
      const response = await apiClient.get('/staff-assignments/my-assignments');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message || 'Không thể tải danh sách phân công',
      };
    }
  },

  // Get residents in rooms assigned to current staff
  getMyResidents: async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        return { success: false, error: 'User not authenticated' };
      }
      const response = await apiClient.get('/staff-assignments/my-residents');
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message || 'Không thể tải danh sách cư dân',
      };
    }
  },

  // Get bed assignment by resident ID
  getBedAssignmentByResidentId: async (residentId) => {
    try {
      console.log('🛏️ Calling bed assignment API for resident:', residentId);
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ No access token found');
        return { success: false, error: 'User not authenticated' };
      }
      
      // Try different possible endpoints
      const possibleEndpoints = [
        `/bed-assignments/by-resident/${residentId}`,
        `/bed-assignments/resident/${residentId}`,
        `/bed-assignments?resident_id=${residentId}`,
        `/bed-assignments?residentId=${residentId}`,
      ];
      
      for (const endpoint of possibleEndpoints) {
        try {
          console.log('🌐 Trying API endpoint:', endpoint);
          const response = await apiClient.get(endpoint);
          console.log('✅ Bed assignment API response:', response.data);
          
          // If we get here, the endpoint worked
          return { success: true, data: response.data };
        } catch (endpointError) {
          console.log(`❌ Endpoint ${endpoint} failed:`, endpointError.response?.status);
          continue; // Try next endpoint
        }
      }
      
      // If all endpoints failed
      console.log('❌ All bed assignment endpoints failed');
      return { success: false, error: 'Không thể tải thông tin phòng giường' };
      
    } catch (error) {
      console.log('❌ Bed assignment API error:', error);
      console.log('❌ Error response:', error.response?.data);
      console.log('❌ Error status:', error.response?.status);
      
      return {
        success: false,
        error: error.response?.data || error.message || 'Không thể tải thông tin phòng giường',
      };
    }
  },
};

export default staffAssignmentService;
