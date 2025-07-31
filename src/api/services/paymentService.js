import apiClient from '../config/axiosConfig';

class PaymentService {
  // Tạo payment link cho bill
  async createPaymentLink(billId, platform = 'mobile') {
    try {
      const response = await apiClient.post('/payment', {
        bill_id: billId,
        platform: platform // 'mobile', 'webview', hoặc 'web'
      });
      return {
        success: true,
        data: response.data,
        message: 'Tạo link thanh toán thành công'
      };
    } catch (error) {
      console.error('Error creating payment link:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo link thanh toán',
        data: null
      };
    }
  }

  // Kiểm tra trạng thái thanh toán
  async checkPaymentStatus(billId) {
    try {
      const response = await apiClient.get(`/bills/${billId}`);
      return {
        success: true,
        data: response.data,
        message: 'Kiểm tra trạng thái thanh toán thành công'
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể kiểm tra trạng thái thanh toán',
        data: null
      };
    }
  }

  // Lấy lịch sử thanh toán
  async getPaymentHistory(billId) {
    try {
      const response = await apiClient.get(`/payment/history/${billId}`);
      return {
        success: true,
        data: response.data,
        message: 'Lấy lịch sử thanh toán thành công'
      };
    } catch (error) {
      console.error('Error getting payment history:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy lịch sử thanh toán',
        data: null
      };
    }
  }
}

export default new PaymentService(); 