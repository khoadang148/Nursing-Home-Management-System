import apiClient from '../config/axiosConfig';

/**
 * Payment Service - Quản lý thanh toán
 */
const paymentService = {
  /**
   * Tạo thanh toán mới
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @param {string} paymentData.bill_id - ID hóa đơn
   * @param {number} paymentData.amount - Số tiền
   * @param {string} paymentData.payment_method - Phương thức thanh toán
   * @param {string} paymentData.payment_status - Trạng thái thanh toán
   * @param {string} paymentData.notes - Ghi chú
   * @param {string} paymentData.paid_by - ID người thanh toán
   * @returns {Promise} - Promise với response data
   */
  createPayment: async (paymentData) => {
    try {
      const response = await apiClient.post('/payment', paymentData);
      return {
        success: true,
        data: response.data,
        message: 'Tạo thanh toán thành công'
      };
    } catch (error) {
      console.log('Create payment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tạo thanh toán thất bại'
      };
    }
  },

  /**
   * Lấy tất cả thanh toán
   * @param {Object} params - Query parameters (optional)
   * @param {string} params.bill_id - Lọc theo ID hóa đơn
   * @param {string} params.payment_status - Lọc theo trạng thái
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {number} params.limit - Giới hạn số lượng
   * @param {number} params.page - Trang
   * @returns {Promise} - Promise với response data
   */
  getAllPayments: async (params = {}) => {
    try {
      const response = await apiClient.get('/payment', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách thanh toán thành công'
      };
    } catch (error) {
      console.log('Get all payments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách thanh toán thất bại'
      };
    }
  },

  /**
   * Lấy thanh toán theo ID
   * @param {string} paymentId - ID thanh toán
   * @returns {Promise} - Promise với response data
   */
  getPaymentById: async (paymentId) => {
    try {
      const response = await apiClient.get(`/payment/${paymentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thông tin thanh toán thành công'
      };
    } catch (error) {
      console.log('Get payment by ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thông tin thanh toán thất bại'
      };
    }
  },

  /**
   * Lấy thanh toán theo hóa đơn
   * @param {string} billId - ID hóa đơn
   * @returns {Promise} - Promise với response data
   */
  getPaymentsByBillId: async (billId) => {
    try {
      const response = await apiClient.get(`/payment/bill/${billId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy thanh toán theo hóa đơn thành công'
      };
    } catch (error) {
      console.log('Get payments by bill ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thanh toán theo hóa đơn thất bại'
      };
    }
  },

  /**
   * Cập nhật thanh toán
   * @param {string} paymentId - ID thanh toán
   * @param {Object} updateData - Dữ liệu cập nhật
   * @returns {Promise} - Promise với response data
   */
  updatePayment: async (paymentId, updateData) => {
    try {
      const response = await apiClient.patch(`/payment/${paymentId}`, updateData);
      return {
        success: true,
        data: response.data,
        message: 'Cập nhật thanh toán thành công'
      };
    } catch (error) {
      console.log('Update payment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Cập nhật thanh toán thất bại'
      };
    }
  },

  /**
   * Xóa thanh toán
   * @param {string} paymentId - ID thanh toán
   * @returns {Promise} - Promise với response data
   */
  deletePayment: async (paymentId) => {
    try {
      const response = await apiClient.delete(`/payment/${paymentId}`);
      return {
        success: true,
        data: response.data,
        message: 'Xóa thanh toán thành công'
      };
    } catch (error) {
      console.log('Delete payment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xóa thanh toán thất bại'
      };
    }
  },

  /**
   * Xác nhận thanh toán
   * @param {string} paymentId - ID thanh toán
   * @param {Object} confirmData - Dữ liệu xác nhận
   * @returns {Promise} - Promise với response data
   */
  confirmPayment: async (paymentId, confirmData = {}) => {
    try {
      const response = await apiClient.patch(`/payment/${paymentId}/confirm`, confirmData);
      return {
        success: true,
        data: response.data,
        message: 'Xác nhận thanh toán thành công'
      };
    } catch (error) {
      console.log('Confirm payment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xác nhận thanh toán thất bại'
      };
    }
  },

  /**
   * Hoàn tiền
   * @param {string} paymentId - ID thanh toán
   * @param {Object} refundData - Dữ liệu hoàn tiền
   * @returns {Promise} - Promise với response data
   */
  refundPayment: async (paymentId, refundData) => {
    try {
      const response = await apiClient.post(`/payment/${paymentId}/refund`, refundData);
      return {
        success: true,
        data: response.data,
        message: 'Hoàn tiền thành công'
      };
    } catch (error) {
      console.log('Refund payment error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Hoàn tiền thất bại'
      };
    }
  },

  /**
   * Lấy thống kê thanh toán
   * @param {Object} params - Tham số thống kê
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @param {string} params.payment_method - Phương thức thanh toán
   * @returns {Promise} - Promise với response data
   */
  getPaymentStatistics: async (params = {}) => {
    try {
      const response = await apiClient.get('/payment/statistics', { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy thống kê thanh toán thành công'
      };
    } catch (error) {
      console.log('Get payment statistics error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy thống kê thanh toán thất bại'
      };
    }
  },

  /**
   * Tìm kiếm thanh toán
   * @param {Object} searchParams - Tham số tìm kiếm
   * @param {string} searchParams.query - Từ khóa tìm kiếm
   * @param {string} searchParams.payment_status - Trạng thái thanh toán
   * @param {string} searchParams.payment_method - Phương thức thanh toán
   * @param {string} searchParams.start_date - Ngày bắt đầu
   * @param {string} searchParams.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  searchPayments: async (searchParams = {}) => {
    try {
      const response = await apiClient.get('/payment/search', { params: searchParams });
      return {
        success: true,
        data: response.data,
        message: 'Tìm kiếm thanh toán thành công'
      };
    } catch (error) {
      console.log('Search payments error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Tìm kiếm thanh toán thất bại'
      };
    }
  }
};

export default paymentService; 