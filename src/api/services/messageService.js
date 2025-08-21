import apiClient from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

const messageService = {
  // Lấy danh sách cuộc trò chuyện của user
  getUserConversations: async () => {
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

      const response = await apiClient.get('/messages/conversations');
      
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
      console.error('Error getting user conversations:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách cuộc trò chuyện',
      };
    }
  },

  // Lấy tin nhắn giữa 2 user
  getConversation: async (partnerId, residentId = null) => {
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

      let url = `/messages/conversation/${partnerId}`;
      if (residentId) {
        url += `?residentId=${residentId}`;
      }
      let response = await apiClient.get(url);
      
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
      console.error('Error getting conversation:', error);
      // Fallback: if residentId filter causes issues, retry without residentId
      try {
        if (residentId) {
          const fallbackResp = await apiClient.get(`/messages/conversation/${partnerId}`);
          if (fallbackResp.data && Array.isArray(fallbackResp.data)) {
            return { success: true, data: fallbackResp.data };
          }
        }
      } catch (fallbackErr) {
        console.error('Fallback conversation fetch failed:', fallbackErr);
      }
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy tin nhắn',
      };
    }
  },

  // Gửi tin nhắn mới
  sendMessage: async (messageData) => {
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

      // Validate required fields
      if (!messageData.content || !messageData.receiver_id || !messageData.resident_id) {
        return {
          success: false,
          error: 'Thiếu thông tin bắt buộc: nội dung, người nhận hoặc cư dân',
        };
      }

      console.log('Sending message to API:', messageData);
      const response = await apiClient.post('/messages', messageData);
      
      console.log('API response:', response.data);
      
      if (response.data) {
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
      console.error('Error sending message:', error);
      console.error('Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || 'Không thể gửi tin nhắn',
      };
    }
  },

  // Lấy số tin nhắn chưa đọc
  getUnreadCount: async () => {
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

      const response = await apiClient.get('/messages/unread-count');
      
      if (response.data) {
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
      console.error('Error getting unread count:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy số tin nhắn chưa đọc',
      };
    }
  },

  // Đánh dấu tin nhắn đã đọc
  markAsRead: async (messageId) => {
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

      const response = await apiClient.post(`/messages/${messageId}/read`);
      
      if (response.data) {
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
      console.error('Error marking message as read:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể đánh dấu tin nhắn đã đọc',
      };
    }
  },
};

export default messageService;

