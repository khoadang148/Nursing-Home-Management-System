import apiClient from '../config/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Activity Participation Service - Quản lý tham gia hoạt động
 */
const activityParticipationService = {
  /**
   * Lấy tất cả activity participations theo resident ID
   * @param {string} residentId - ID của resident
   * @returns {Promise} - Promise với response data
   */
  getParticipationsByResidentId: async (residentId) => {
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

      const response = await apiClient.get(`/activity-participations/by-resident?resident_id=${residentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tham gia hoạt động theo resident thành công'
      };
    } catch (error) {
      console.log('Get participations by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách tham gia hoạt động theo resident thất bại'
      };
    }
  },

  /**
   * Lấy tất cả activity participations theo staff ID
   * @param {string} staffId - ID của staff
   * @returns {Promise} - Promise với response data
   */
  getParticipationsByStaffId: async (staffId) => {
    try {
      const response = await apiClient.get(`/activity-participations/by-staff/${staffId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tham gia hoạt động theo staff thành công'
      };
    } catch (error) {
      console.log('Get participations by staff ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách tham gia hoạt động theo staff thất bại'
      };
    }
  },

  /**
   * Lấy danh sách hoạt động duy nhất theo staff ID (không trùng lặp activity_id)
   * @param {string} staffId - ID của staff
   * @returns {Promise} - Promise với response data
   */
  getUniqueActivitiesByStaffId: async (staffId) => {
    try {
      const response = await apiClient.get(`/activity-participations/by-staff/${staffId}`);
      if (response.data) {
        // Lọc ra các hoạt động duy nhất
        const uniqueActivities = new Map();
        response.data.forEach(participation => {
          if (participation.activity_id && participation.activity_id._id) {
            const activityId = participation.activity_id._id;
            if (!uniqueActivities.has(activityId)) {
              uniqueActivities.set(activityId, participation);
            }
          }
        });
        
        const uniqueActivitiesList = Array.from(uniqueActivities.values());
        return {
          success: true,
          data: uniqueActivitiesList,
          message: 'Lấy danh sách hoạt động duy nhất theo staff thành công'
        };
      }
      return {
        success: true,
        data: [],
        message: 'Không có hoạt động nào'
      };
    } catch (error) {
      console.log('Get unique activities by staff ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hoạt động duy nhất theo staff thất bại'
      };
    }
  },

  /**
   * Lấy tất cả hoạt động tham gia
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.activity_id - Lọc theo ID hoạt động
   * @param {string} params.attendance_status - Lọc theo trạng thái tham gia
   * @returns {Promise} - Promise với response data
   */
  getAllParticipations: async (params = {}) => {
    try {
      const response = await apiClient.get('/activity-participations', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách hoạt động tham gia thành công'
      };
    } catch (error) {
      console.log('Get all activity participations error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hoạt động tham gia thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động tham gia theo activity ID và date
   * @param {string} activityId - ID của hoạt động
   * @param {string} date - Ngày tham gia (YYYY-MM-DD format)
   * @returns {Promise} - Promise với response data
   */
  getParticipationsByActivity: async (activityId, date) => {
    try {
      const response = await apiClient.get(`/activity-participations/by-activity?activity_id=${activityId}&date=${date}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách tham gia hoạt động theo activity và date thành công'
      };
    } catch (error) {
      console.log('Get participations by activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách tham gia hoạt động theo activity thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động tham gia theo resident ID và activity ID
   * @param {string} residentId - ID của cư dân
   * @param {string} activityId - ID của hoạt động
   * @returns {Promise} - Promise với response data
   */
  getParticipationByResidentAndActivity: async (residentId, activityId) => {
    try {
      const response = await apiClient.get(`/activity-participations/by-resident-activity?resident_id=${residentId}&activity_id=${activityId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin tham gia hoạt động theo resident và activity thành công'
      };
    } catch (error) {
      console.log('Get participation by resident and activity error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin tham gia hoạt động theo resident và activity thất bại'
      };
    }
  },

  /**
   * Lấy hoạt động tham gia theo ID
   * @param {string} participationId - ID tham gia hoạt động
   * @returns {Promise} - Promise với response data
   */
  getParticipationById: async (participationId) => {
    try {
      const response = await apiClient.get(`/activity-participations/${participationId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin hoạt động tham gia thành công'
      };
    } catch (error) {
      console.log('Get activity participation by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin hoạt động tham gia thất bại'
      };
    }
  },

  /**
   * Tạo hoạt động tham gia mới
   * @param {Object} participationData - Dữ liệu tham gia hoạt động
   * @returns {Promise} - Promise với response data
   */
  createParticipation: async (participationData) => {
    try {
      const response = await apiClient.post('/activity-participations', participationData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo hoạt động tham gia thành công'
      };
    } catch (error) {
      console.log('Create activity participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo hoạt động tham gia thất bại'
      };
    }
  },

  /**
   * Tạo activity participation mới
   * @param {Object} participationData - Dữ liệu tham gia hoạt động
   * @returns {Promise} - Promise với response data
   */
  createActivityParticipation: async (participationData) => {
    try {
      console.log('Creating activity participation with data:', participationData);
      const response = await apiClient.post('/activity-participations', participationData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo bản ghi tham gia hoạt động thành công'
      };
    } catch (error) {
      console.error('Create activity participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo bản ghi tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Tạo nhiều activity participation cùng lúc
   * @param {Array} participationDataList - Danh sách dữ liệu tham gia hoạt động
   * @returns {Promise} - Promise với response data
   */
  createMultipleActivityParticipations: async (participationDataList) => {
    try {
      console.log('Creating multiple activity participations:', participationDataList.length);
      
      // Tạo tất cả các participation records
      const promises = participationDataList.map(data => 
        apiClient.post('/activity-participations', data)
      );
      
      const responses = await Promise.all(promises);
      const results = responses.map(response => response.data);
      
      return {
        success: true,
        data: results,
        message: `Tạo thành công ${results.length} bản ghi tham gia hoạt động`
      };
    } catch (error) {
      console.error('Create multiple activity participations error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo bản ghi tham gia hoạt động thất bại'
      };
    }
  },

  /**
   * Cập nhật hoạt động tham gia
   * @param {string} participationId - ID tham gia hoạt động
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateParticipation: async (participationId, updateData) => {
    try {
      const response = await apiClient.patch(`/activity-participations/${participationId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật hoạt động tham gia thành công'
      };
    } catch (error) {
      console.log('Update activity participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật hoạt động tham gia thất bại'
      };
    }
  },

  /**
   * Xóa hoạt động tham gia
   * @param {string} participationId - ID tham gia hoạt động
   * @returns {Promise} - Promise với response data
   */
  deleteParticipation: async (participationId) => {
    try {
      const response = await apiClient.delete(`/activity-participations/${participationId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa hoạt động tham gia thành công'
      };
    } catch (error) {
      console.log('Delete activity participation error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa hoạt động tham gia thất bại'
      };
    }
  }
};

export default activityParticipationService; 