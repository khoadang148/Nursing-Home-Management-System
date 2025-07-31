import apiClient from '../config/axiosConfig';

/**
 * Care Plan Assignment Service - Quản lý phân công gói chăm sóc
 */
const carePlanAssignmentService = {
  /**
   * Tạo phân công gói chăm sóc mới
   * @param {Object} assignmentData - Dữ liệu phân công
   * @param {string} assignmentData.resident_id - ID cư dân
   * @param {string} assignmentData.care_plan_id - ID gói chăm sóc
   * @param {string} assignmentData.room_id - ID phòng
   * @param {string} assignmentData.bed_id - ID giường
   * @param {string} assignmentData.start_date - Ngày bắt đầu
   * @param {string} assignmentData.end_date - Ngày kết thúc
   * @param {string} assignmentData.status - Trạng thái
   * @param {string} assignmentData.assigned_by - ID người phân công
   * @param {string} assignmentData.notes - Ghi chú
   * @returns {Promise} - Promise với response data
   */
  createCarePlanAssignment: async (assignmentData) => {
    try {
      const response = await apiClient.post('/care-plan-assignments', assignmentData);
      return {
        success: true,
        data: response.data,
        message: 'Phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Create care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy tất cả phân công gói chăm sóc
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.care_plan_id - Lọc theo ID gói chăm sóc
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllCarePlanAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get all care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc theo ID
   * @param {string} assignmentId - ID phân công
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentById: async (assignmentId) => {
    try {
      const response = await apiClient.get(`/care-plan-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái phân công
   * @param {string} params.active - Chỉ lấy phân công đang hoạt động
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentsByResidentId: async (residentId, params = {}) => {
    try {
      console.log(`[carePlanAssignmentService] Calling API: /care-plan-assignments/by-resident/${residentId}`);
      const response = await apiClient.get(`/care-plan-assignments/by-resident/${residentId}`, { params });
      console.log(`[carePlanAssignmentService] API Response:`, response.data);
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công gói chăm sóc theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get care plan assignments by resident ID error:', error);
      console.log(`[carePlanAssignmentService] Error details:`, {
        status: error.response?.status,
        data: error.response?.data,
        url: error.config?.url
      });
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công gói chăm sóc theo cư dân thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc theo family member id
   * @param {string} familyMemberId - ID thành viên gia đình
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentsByFamilyMemberId: async (familyMemberId) => {
    try {
      const response = await apiClient.get(`/care-plan-assignments/by-family-member/${familyMemberId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công gói chăm sóc theo family member thành công'
      };
    } catch (error) {
      console.log('Get care plan assignments by family member ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công gói chăm sóc theo family member thất bại'
      };
    }
  },

  /**
   * Cập nhật phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateCarePlanAssignment: async (assignmentId, updateData) => {
    try {
      const response = await apiClient.patch(`/care-plan-assignments/${assignmentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Update care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Xóa phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @returns {Promise} - Promise với response data
   */
  deleteCarePlanAssignment: async (assignmentId) => {
    try {
      const response = await apiClient.delete(`/care-plan-assignments/${assignmentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Delete care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Kết thúc phân công gói chăm sóc
   * @param {string} assignmentId - ID phân công
   * @param {Object} endData - Dữ liệu kết thúc
   * @returns {Promise} - Promise với response data
   */
  endCarePlanAssignment: async (assignmentId, endData = {}) => {
    try {
      const response = await apiClient.patch(`/care-plan-assignments/${assignmentId}/end`, endData);
      return {
        success: true,
        data: response.data,
        message: 'Kết thúc phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('End care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Kết thúc phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy phân công gói chăm sóc đang hoạt động
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @returns {Promise} - Promise với response data
   */
  getActiveCarePlanAssignments: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/active', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy phân công gói chăm sóc đang hoạt động thành công'
      };
    } catch (error) {
      console.log('Get active care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy phân công gói chăm sóc đang hoạt động thất bại'
      };
    }
  },

  /**
   * Lấy lịch sử phân công gói chăm sóc
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentHistory: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/history', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch sử phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment history error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch sử phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy thống kê phân công gói chăm sóc
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.care_plan_id - ID gói chăm sóc
   * @returns {Promise} - Promise với response data
   */
  getCarePlanAssignmentStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Get care plan assignment statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Tìm kiếm phân công gói chăm sóc
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.status - Trạng thái phân công
   * @param {string} searchParams.care_plan_id - ID gói chăm sóc
   * @param {string} searchParams.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  searchCarePlanAssignments: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/care-plan-assignments/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm phân công gói chăm sóc thành công'
      };
    } catch (error) {
      console.log('Search care plan assignments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm phân công gói chăm sóc thất bại'
      };
    }
  },

  /**
   * Lấy danh sách cư dân có thể đăng ký gói dịch vụ
   * @param {Object} packageData - Thông tin gói dịch vụ
   * @returns {Promise} - Promise với response data
   */
  getAvailableResidents: async (packageData) => {
    try {
      // Tạm thời sử dụng mock data cho đến khi có API thật
      const mockResidents = [
        {
          _id: 'res_001',
          full_name: 'Nguyễn Văn A',
          room_number: '101',
          bed_number: '1',
          date_of_birth: '1940-05-15'
        },
        {
          _id: 'res_002',
          full_name: 'Trần Thị B',
          room_number: '102',
          bed_number: '2',
          date_of_birth: '1938-12-20'
        }
      ];
      
      return {
        success: true,
        data: mockResidents,
        message: 'Lấy danh sách cư dân có thể đăng ký thành công'
      };
    } catch (error) {
      console.log('Get available residents error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách cư dân có thể đăng ký thất bại'
      };
    }
  },

  /**
   * Đăng ký gói dịch vụ cho cư dân
   * @param {Object} registrationData - Dữ liệu đăng ký
   * @param {string} registrationData.care_plan_id - ID gói dịch vụ
   * @param {string} registrationData.family_member_id - ID thành viên gia đình
   * @param {string} registrationData.notes - Ghi chú
   * @returns {Promise} - Promise với response data
   */
  registerCarePlanAssignment: async (registrationData) => {
    try {
      // Tạm thời sử dụng mock response cho đến khi có API thật
      const mockResponse = {
        _id: 'assignment_' + Date.now(),
        care_plan_id: registrationData.care_plan_id,
        family_member_id: registrationData.family_member_id,
        status: 'active',
        start_date: new Date().toISOString(),
        notes: registrationData.notes
      };
      
      return {
        success: true,
        data: mockResponse,
        message: 'Đăng ký gói dịch vụ thành công'
      };
    } catch (error) {
      console.log('Register care plan assignment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Đăng ký gói dịch vụ thất bại'
      };
    }
  }
};

export default carePlanAssignmentService; 