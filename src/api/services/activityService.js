import { apiRequest } from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';

class ActivityService {
  // Get all activities
  async getAllActivities() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST);
      
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
      console.error('Get activities error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách hoạt động',
      };
    }
  }

  // Get activity by ID
  async getActivityById(id) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ACTIVITY.DETAIL, { id });
      const response = await apiRequest.get(url);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Activity not found',
        };
      }
    } catch (error) {
      console.error('Get activity by ID error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin hoạt động',
      };
    }
  }

  // Create new activity
  async createActivity(activityData) {
    try {
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.ACTIVITY.CREATE, activityData);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo hoạt động thành công',
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Create activity error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo hoạt động',
      };
    }
  }

  // Update activity
  async updateActivity(id, updateData) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ACTIVITY.UPDATE, { id });
      const response = await apiRequest.patch(url, updateData);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật hoạt động thành công',
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Update activity error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật hoạt động',
      };
    }
  }

  // Delete activity
  async deleteActivity(id) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.ACTIVITY.DELETE, { id });
      const response = await apiRequest.delete(url);
      
      if (response.status === 200) {
        return {
          success: true,
          message: 'Xóa hoạt động thành công',
        };
      } else {
        return {
          success: false,
          error: 'Delete failed',
        };
      }
    } catch (error) {
      console.error('Delete activity error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa hoạt động',
      };
    }
  }

  // Search activities by criteria
  async searchActivities(criteria) {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST, {
        params: criteria
      });
      
      if (response.data && Array.isArray(response.data)) {
        let filteredActivities = response.data;
        
        // Client-side filtering for additional criteria
        if (criteria.searchTerm) {
          const searchTerm = criteria.searchTerm.toLowerCase();
          filteredActivities = filteredActivities.filter(activity => 
            activity.activity_name.toLowerCase().includes(searchTerm) ||
            activity.description.toLowerCase().includes(searchTerm) ||
            activity.location.toLowerCase().includes(searchTerm)
          );
        }
        
        return {
          success: true,
          data: filteredActivities,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Search activities error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tìm kiếm hoạt động',
      };
    }
  }

  // Get activities by date
  async getActivitiesByDate(date) {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST);
      
      if (response.data && Array.isArray(response.data)) {
        const targetDate = new Date(date).toISOString().split('T')[0];
        
        const filteredActivities = response.data.filter(activity => {
          const activityDate = new Date(activity.schedule_time).toISOString().split('T')[0];
          return activityDate === targetDate;
        });
        
        return {
          success: true,
          data: filteredActivities,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Get activities by date error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy hoạt động theo ngày',
      };
    }
  }

  // Get activities by type
  async getActivitiesByType(type) {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST);
      
      if (response.data && Array.isArray(response.data)) {
        const filteredActivities = response.data.filter(
          activity => activity.activity_type.toLowerCase() === type.toLowerCase()
        );
        
        return {
          success: true,
          data: filteredActivities,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Get activities by type error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy hoạt động theo loại',
      };
    }
  }

  // Get upcoming activities
  async getUpcomingActivities() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST);
      
      if (response.data && Array.isArray(response.data)) {
        const now = new Date();
        
        const upcomingActivities = response.data.filter(activity => {
          const activityDate = new Date(activity.schedule_time);
          return activityDate >= now;
        }).sort((a, b) => {
          return new Date(a.schedule_time) - new Date(b.schedule_time);
        });
        
        return {
          success: true,
          data: upcomingActivities,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Get upcoming activities error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy hoạt động sắp tới',
      };
    }
  }

  // Get past activities
  async getPastActivities() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.ACTIVITY.LIST);
      
      if (response.data && Array.isArray(response.data)) {
        const now = new Date();
        
        const pastActivities = response.data.filter(activity => {
          const activityDate = new Date(activity.schedule_time);
          return activityDate < now;
        }).sort((a, b) => {
          return new Date(b.schedule_time) - new Date(a.schedule_time);
        });
        
        return {
          success: true,
          data: pastActivities,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Get past activities error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy hoạt động đã qua',
      };
    }
  }

  // Helper method to format activity data for backend
  formatActivityData(data) {
    return {
      activity_name: data.activity_name,
      description: data.description,
      activity_type: data.activity_type,
      duration: parseInt(data.duration),
      schedule_time: data.schedule_time,
      location: data.location,
      capacity: parseInt(data.capacity),
    };
  }
}

export default new ActivityService(); 