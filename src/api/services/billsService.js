import apiClient from '../config/axiosConfig';

/**
 * Bills Service - Quản lý hóa đơn
 */
const billsService = {
  /**
   * Tạo hóa đơn mới
   * @param {Object} billData - Dữ liệu hóa đơn
   * @param {string} billData.resident_id - ID cư dân
   * @param {string} billData.bill_type - Loại hóa đơn
   * @param {number} billData.amount - Số tiền
   * @param {string} billData.currency - Đơn vị tiền tệ
   * @param {string} billData.due_date - Ngày đến hạn
   * @param {string} billData.description - Mô tả
   * @param {string} billData.status - Trạng thái
   * @param {string} billData.created_by - ID người tạo
   * @returns {Promise} - Promise với response data
   */
  createBill: async (billData) => {
    try {
      const response = await apiClient.post('/bills', billData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo hóa đơn thành công'
      };
    } catch (error) {
      console.log('Create bill error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo hóa đơn thất bại'
      };
    }
  },

  /**
   * Lấy tất cả hóa đơn
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.resident_id - Lọc theo ID cư dân
   * @param {string} params.bill_type - Lọc theo loại hóa đơn
   * @param {string} params.status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllBills: async (params = {}) => {
    try {
      const response = await apiClient.get('/bills', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách hóa đơn thành công'
      };
    } catch (error) {
      console.log('Get all bills error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hóa đơn thất bại'
      };
    }
  },

  /**
   * Lấy hóa đơn theo ID
   * @param {string} billId - ID hóa đơn
   * @returns {Promise} - Promise với response data
   */
  getBillById: async (billId) => {
    try {
      const response = await apiClient.get(`/bills/${billId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin hóa đơn thành công'
      };
    } catch (error) {
      console.log('Get bill by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin hóa đơn thất bại'
      };
    }
  },

  /**
   * Lấy hóa đơn theo cư dân
   * @param {string} residentId - ID cư dân
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái hóa đơn
   * @param {string} params.bill_type - Loại hóa đơn
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getBillsByResidentId: async (residentId, params = {}) => {
    try {
      const response = await apiClient.get(`/bills/resident/${residentId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hóa đơn theo cư dân thành công'
      };
    } catch (error) {
      console.log('Get bills by resident ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hóa đơn theo cư dân thất bại'
      };
    }
  },

  /**
   * Cập nhật hóa đơn
   * @param {string} billId - ID hóa đơn
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updateBill: async (billId, updateData) => {
    try {
      const response = await apiClient.patch(`/bills/${billId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật hóa đơn thành công'
      };
    } catch (error) {
      console.log('Update bill error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật hóa đơn thất bại'
      };
    }
  },

  /**
   * Xóa hóa đơn
   * @param {string} billId - ID hóa đơn
   * @returns {Promise} - Promise với response data
   */
  deleteBill: async (billId) => {
    try {
      const response = await apiClient.delete(`/bills/${billId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa hóa đơn thành công'
      };
    } catch (error) {
      console.log('Delete bill error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa hóa đơn thất bại'
      };
    }
  },

  /**
   * Gửi hóa đơn
   * @param {string} billId - ID hóa đơn
   * @param {Object} sendData - Dữ liệu gửi
   * @returns {Promise} - Promise với response data
   */
  sendBill: async (billId, sendData = {}) => {
    try {
      const response = await apiClient.post(`/bills/${billId}/send`, sendData);
      return {
        success: true,
        data: response.data,
        message: 'Gửi hóa đơn thành công'
      };
    } catch (error) {
      console.log('Send bill error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Gửi hóa đơn thất bại'
      };
    }
  },

  /**
   * Lấy hóa đơn chưa thanh toán
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.bill_type - Loại hóa đơn
   * @returns {Promise} - Promise với response data
   */
  getUnpaidBills: async (params = {}) => {
    try {
      const response = await apiClient.get('/bills/unpaid', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hóa đơn chưa thanh toán thành công'
      };
    } catch (error) {
      console.log('Get unpaid bills error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hóa đơn chưa thanh toán thất bại'
      };
    }
  },

  /**
   * Lấy hóa đơn quá hạn
   * @param {Object} params - Tham số lọc
   * @param {string} params.resident_id - ID cư dân
   * @param {string} params.bill_type - Loại hóa đơn
   * @returns {Promise} - Promise với response data
   */
  getOverdueBills: async (params = {}) => {
    try {
      const response = await apiClient.get('/bills/overdue', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy hóa đơn quá hạn thành công'
      };
    } catch (error) {
      console.log('Get overdue bills error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy hóa đơn quá hạn thất bại'
      };
    }
  },

  /**
   * Lấy thống kê hóa đơn
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.resident_id - ID cư dân
   * @returns {Promise} - Promise với response data
   */
  getBillStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/bills/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê hóa đơn thành công'
      };
    } catch (error) {
      console.log('Get bill statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê hóa đơn thất bại'
      };
    }
  },

  /**
   * Tìm kiếm hóa đơn
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.status - Trạng thái hóa đơn
   * @param {string} searchParams.bill_type - Loại hóa đơn
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchBills: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/bills/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm hóa đơn thành công'
      };
    } catch (error) {
      console.log('Search bills error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm hóa đơn thất bại'
      };
    }
  }
};

export default billsService; 