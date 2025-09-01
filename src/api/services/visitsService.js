import apiClient from '../config/axiosConfig';

/**
 * Visits Service - Quản lý lịch thăm
 */
const visitsService = {
  /**
   * Tạo lịch thăm mới
   * @param {Object} visitData - Dữ liệu lịch thăm
   * @param {string} visitData.resident_id - ID cư dân
   * @param {string} visitData.visitor_name - Tên người thăm
   * @param {string} visitData.visitor_phone - Số điện thoại người thăm
   * @param {string} visitData.visitor_relationship - Mối quan hệ
   * @param {string} visitData.visit_date - Ngày thăm
   * @param {string} visitData.visit_time - Thời gian thăm
   * @param {string} visitData.duration - Thời lượng thăm
   * @param {string} visitData.purpose - Mục đích thăm
   * @param {string} visitData.status - Trạng thái
   * @param {string} visitData.requested_by - ID người yêu cầu
   * @returns {Promise} - Promise với response data
   */
  createVisit: async (visitData) => {
    try {
      console.log('VisitsService.createVisit - Sending data:', visitData);
      const response = await apiClient.post('/visits', visitData);
      console.log('VisitsService.createVisit - Response:', response.data);
      return {
        success: true,
        data: response.data,
        message: 'Tạo lịch thăm thành công'
      };
    } catch (error) {
      console.log('Create visit error:', error);
      console.log('Create visit error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo lịch thăm thất bại'
      };
    }
  },

  /**
   * Lấy tất cả lịch thăm
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllVisits: async (params = {}) => {
    try {
      const response = await apiClient.get('/visits', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách lịch thăm thành công'
      };
    } catch (error) {
      console.log('Get all visits error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách lịch thăm thất bại'
      };
    }
  },

  /**
   * Lấy lịch thăm theo ID
   * @param {string} visitId - ID lịch thăm
   * @returns {Promise} - Promise với response data
   */
  getVisitById: async (visitId) => {
    try {
      const response = await apiClient.get(`/visits/${visitId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin lịch thăm thành công'
      };
    } catch (error) {
      console.log('Get visit by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin lịch thăm thất bại'
      };
    }
  },

  /**
   * Lấy lịch thăm theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái lịch thăm
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getVisitsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/visits/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch thăm theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get visits by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch thăm theo cư dân thất bại'
      };
    }
  },

  /**
   * Lấy lịch thăm theo family member id
   * @param {string} familyMemberId - ID thành viên gia đình
   * @returns {Promise} - Promise với response data
   */
  getVisitsByFamilyMemberId: async (familyMemberId) => {
    try {
      const response = await apiClient.get('/visits/family', { params: { family_member_id: familyMemberId } });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch thăm theo thành viên gia đình thành công'
      };
    } catch (error) {
      console.log('Get visits by family member ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch thăm theo thành viên gia đình thất bại'
      };
    }
  },

  /**
   * Cập nhật lịch thăm
   * @param {string} visitId - ID lịch thăm
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateVisit: async (visitId, updateData) => {
    try {
      const response = await apiClient.patch(`/visits/${visitId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật lịch thăm thành công'
      };
    } catch (error) {
      console.log('Update visit error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật lịch thăm thất bại'
      };
    }
  },

  /**
   * Xóa lịch thăm
   * @param {string} visitId - ID lịch thăm
   * @returns {Promise} - Promise với response data
   */
  deleteVisit: async (visitId) => {
    try {
      const response = await apiClient.delete(`/visits/${visitId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa lịch thăm thành công'
      };
    } catch (error) {
      console.log('Delete visit error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa lịch thăm thất bại'
      };
    }
  },

  /**
   * Phê duyệt lịch thăm
   * @param {string} visitId - ID lịch thăm
   * @param {Object} approvalData - Dữ liệu phê duyệt
   * @returns {Promise} - Promise với response data
   */
  approveVisit: async (visitId, approvalData = {}) => {
    try {
      const response = await apiClient.patch(`/visits/${visitId}/approve`, approvalData);
      return {
        success: true,
        data: response.data,
        message: 'Phê duyệt lịch thăm thành công'
      };
    } catch (error) {
      console.log('Approve visit error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Phê duyệt lịch thăm thất bại'
      };
    }
  },

  /**
   * Từ chối lịch thăm
   * @param {string} visitId - ID lịch thăm
   * @param {Object} rejectionData - Dữ liệu từ chối
   * @returns {Promise} - Promise với response data
   */
  rejectVisit: async (visitId, rejectionData = {}) => {
    try {
      const response = await apiClient.patch(`/visits/${visitId}/reject`, rejectionData);
      return {
        success: true,
        data: response.data,
        message: 'Từ chối lịch thăm thành công'
      };
    } catch (error) {
      console.log('Reject visit error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Từ chối lịch thăm thất bại'
      };
    }
  },

  /**
   * Hoàn thành lịch thăm
   * @param {string} visitId - ID lịch thăm
   * @param {Object} completionData - Dữ liệu hoàn thành
   * @returns {Promise} - Promise với response data
   */
  completeVisit: async (visitId, completionData = {}) => {
    try {
      const response = await apiClient.patch(`/visits/${visitId}/complete`, completionData);
      return {
        success: true,
        data: response.data,
        message: 'Hoàn thành lịch thăm thành công'
      };
    } catch (error) {
      console.log('Complete visit error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Hoàn thành lịch thăm thất bại'
      };
    }
  },

  /**
   * Lấy lịch thăm chờ phê duyệt
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getPendingVisits: async (params = {}) => {
    try {
      const response = await apiClient.get('/visits/pending', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch thăm chờ phê duyệt thành công'
      };
    } catch (error) {
      console.log('Get pending visits error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch thăm chờ phê duyệt thất bại'
      };
    }
  },

  /**
   * Lấy lịch thăm hôm nay
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getTodayVisits: async (params = {}) => {
    try {
      const response = await apiClient.get('/visits/today', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch thăm hôm nay thành công'
      };
    } catch (error) {
      console.log('Get today visits error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy lịch thăm hôm nay thất bại'
      };
    }
  },

  /**
   * Lấy thống kê lịch thăm
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getVisitStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/visits/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê lịch thăm thành công'
      };
    } catch (error) {
      console.log('Get visit statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê lịch thăm thất bại'
      };
    }
  },

  /**
   * Tìm kiếm lịch thăm
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.status - Trạng thái lịch thăm
   * @param {string} searchParams.resident_id - ID cư dân
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchVisits: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/visits/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm lịch thăm thành công'
      };
    } catch (error) {
      console.log('Search visits error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm lịch thăm thất bại'
      };
    }
  }
};

export default visitsService; 