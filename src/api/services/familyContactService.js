import apiClient from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const familyContactService = {
  // Lấy danh sách tất cả users có role family
  getFamilyContacts: async () => {
    try {
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('No access token found, skipping API call');
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const response = await apiClient.get('/users/by-role?role=family');
      
      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Error getting family contacts:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách người nhà',
      };
    }
  },

  // Lấy thông tin chi tiết của một family contact
  getFamilyContactById: async (contactId) => {
    try {
      // Check if user is authenticated
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.log('No access token found, skipping API call');
        return {
          success: false,
          error: 'User not authenticated',
        };
      }

      const url = buildUrl('/users/family-contacts/{contactId}', { contactId });
      const response = await apiClient.get(url);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Contact not found',
        };
      }
    } catch (error) {
      console.error('Error getting family contact:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin liên hệ',
      };
    }
  },
};

export default familyContactService;
