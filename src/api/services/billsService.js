import apiClient from '../config/axiosConfig';
import { delay } from '../../utils/helpers';



/**
 * Bills Service - Quản lý hóa đơn
 */
const billsService = {
  // ==================== API ENDPOINTS (REAL API) ====================
  
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
   * Lấy hóa đơn theo staff_id
   * @param {string} staffId - ID của staff
   * @param {Object} params - Tham số lọc
   * @param {string} params.status - Trạng thái hóa đơn
   * @param {string} params.start_date - Ngày bắt đầu
   * @param {string} params.end_date - Ngày kết thúc
   * @returns {Promise} - Promise với response data
   */
  getBillsByStaffId: async (staffId, params = {}) => {
    try {
      const response = await apiClient.get(`/bills/staff/${staffId}`, { params });
      return {
        success: true,
        data: response.data,
        message: 'Lấy danh sách hóa đơn theo staff thành công'
      };
    } catch (error) {
      console.log('Get bills by staff ID error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Lấy danh sách hóa đơn theo staff thất bại'
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
   * Lấy chi tiết hóa đơn (alias cho getBillById)
   * @param {string} billId - ID hóa đơn
   * @returns {Promise} - Promise với response data
   */
  getBillDetail: async (billId) => {
    return await billsService.getBillById(billId);
  },

  /**
   * Xuất PDF hóa đơn
   * @param {string} billId - ID hóa đơn  
   * @returns {Promise<Object>} { success: boolean, data: { url }, error?: string }
   */
  exportBillPDF: async (billId) => {
    try {
      const response = await apiClient.get(`/bills/${billId}/export-pdf`);
      return {
        success: true,
        data: response.data,
        message: 'Xuất PDF thành công'
      };
    } catch (error) {
      console.error('Export PDF error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Xuất PDF thất bại'
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
  },



  // ==================== BILL CALCULATION ====================

  /**
   * Tính toán số tiền hóa đơn
   * @param {Object} carePlanAssignment - Thông tin gói dịch vụ
   * @param {Object} bedAssignment - Thông tin phòng/giường
   * @param {Array} roomTypes - Danh sách loại phòng
   * @returns {number} Tổng số tiền
   */
  calculateBillAmount: (carePlanAssignment, bedAssignment, roomTypes) => {
    try {
      let totalAmount = 0;

      // Handle carePlanAssignment as array (take first item)
      const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;
      const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;

      console.log('DEBUG - Processing care plan:', carePlan);
      console.log('DEBUG - Processing bed assignment:', bedAssign);

      // Add care plans cost from care plan assignment
      if (carePlan && carePlan.care_plans_monthly_cost) {
        totalAmount += carePlan.care_plans_monthly_cost;
        console.log('DEBUG - Added care plans cost:', carePlan.care_plans_monthly_cost);
      }

      // Add room cost from care plan assignment (this already includes room cost)
      if (carePlan && carePlan.room_monthly_cost) {
        totalAmount += carePlan.room_monthly_cost;
        console.log('DEBUG - Added room cost from care plan assignment:', carePlan.room_monthly_cost);
      }

      // Alternative: If room cost is not in care plan assignment, try to get from bed assignment
      if (totalAmount === 0 && bedAssign && bedAssign.room_id) {
        if (bedAssign.room_id.monthly_price) {
          totalAmount += bedAssign.room_id.monthly_price;
          console.log('DEBUG - Added room cost from bed assignment:', bedAssign.room_id.monthly_price);
        } else if (bedAssign.room_id.room_type_id) {
          const roomType = roomTypes.find(rt => rt._id === bedAssign.room_id.room_type_id);
          if (roomType && roomType.monthly_price) {
            totalAmount += roomType.monthly_price;
            console.log('DEBUG - Added room cost from room type:', roomType.monthly_price);
          }
        }
      }

      console.log('DEBUG - Final calculated bill amount:', totalAmount);
      return totalAmount;
    } catch (error) {
      console.error('Error calculating bill amount:', error);
      return 0;
    }
  },

  // ==================== LEGACY SUPPORT ====================

  /**
   * LEGACY SUPPORT: billingService object for backward compatibility
   * Các màn hình cũ sẽ vẫn hoạt động thông qua object này
   */
  billingService: {
    /**
     * Lấy danh sách hóa đơn với filters
     * @param {Object} filters - Bộ lọc (status, residentId, search, etc.)
     * @returns {Promise<Object>} { data: bills[], total: number }
     */
    getBills: async (filters = {}) => {
      const params = {};
      if (filters.status) params.status = filters.status;
      if (filters.resident_id) params.resident_id = filters.resident_id;
      else if (filters.residentId) params.resident_id = filters.residentId;
      if (filters.search) params.search = filters.search;
      if (filters.type) params.type = filters.type;
      if (filters.period) params.period = filters.period;
      try {
        const response = await apiClient.get('/bills/by-resident', { params });
        return {
          data: response.data,
          total: response.data.length
        };
      } catch (error) {
        console.error('Error fetching bills from API:', error);
        return { data: [], total: 0 };
      }
    },

    /**
     * Lấy chi tiết hóa đơn
     * @param {string} billId - ID hóa đơn
     * @returns {Promise<Object>} Chi tiết hóa đơn
     */
    getBillDetail: async (billId) => {
      const result = await billsService.getBillById(billId);
      if (result.success) {
        return result.data;
      } else {
        throw new Error(result.error || 'Không thể tải thông tin hóa đơn');
      }
    },

    /**
     * Lấy danh sách residents
     * @returns {Promise<Array>} Danh sách residents
     */
    getResidents: async () => {
      try {
        const response = await apiClient.get('/residents');
        return response.data;
      } catch (error) {
        console.error('Error fetching residents:', error);
        return [];
      }
    },

    /**
     * Lấy phương thức thanh toán
     * @returns {Promise<Array>} Danh sách phương thức thanh toán
     */
    getPaymentMethods: async () => {
      try {
        // Trả về danh sách payment methods cố định
        return [
          { id: 'qr_payment', name: 'QR Code', description: 'Thanh toán qua QR Code' },
          { id: 'bank_transfer', name: 'Chuyển khoản', description: 'Chuyển khoản ngân hàng' },
          { id: 'cash', name: 'Tiền mặt', description: 'Thanh toán bằng tiền mặt' },
          { id: 'card', name: 'Thẻ ngân hàng', description: 'Thanh toán bằng thẻ ngân hàng' }
        ];
      } catch (error) {
        console.error('Error fetching payment methods:', error);
        return [];
      }
    },

    /**
     * Xử lý thanh toán hóa đơn
     * @param {string} billId - ID hóa đơn
     * @param {string} paymentMethod - Phương thức thanh toán
     * @param {Object} paymentDetails - Chi tiết thanh toán
     * @returns {Promise<Object>} Kết quả thanh toán
     */
    processPayment: async (billId, paymentMethod, paymentDetails = {}) => {
      try {
        const response = await apiClient.post(`/bills/${billId}/pay`, {
          payment_method: paymentMethod,
          ...paymentDetails
        });
        return {
          success: true,
          data: response.data,
          message: 'Thanh toán thành công'
        };
      } catch (error) {
        console.error('Process payment error:', error);
        return {
          success: false,
          error: error.response?.data || error.message || 'Thanh toán thất bại'
        };
      }
    },

    /**
     * Xuất PDF hóa đơn
     * @param {string} billId - ID hóa đơn  
     * @returns {Promise<Object>} { url, fileName }
     */
    exportBillPDF: async (billId) => {
      try {
        const response = await apiClient.get(`/bills/${billId}/export-pdf`);
        return {
          success: true,
          data: response.data,
          message: 'Xuất PDF thành công'
        };
      } catch (error) {
        console.error('Export PDF error:', error);
        return {
          success: false,
          error: error.response?.data || error.message || 'Xuất PDF thất bại'
        };
      }
    },

    /**
     * Lấy danh sách hóa đơn theo family member id
     * @param {Object} filters - Bộ lọc (family_member_id, status, type, period, search)
     * @returns {Promise<Object>} { data: bills[], total: number }
     */
    getBillsByFamilyMember: async (filters = {}) => {
      const params = {};
      if (filters.family_member_id) params.family_member_id = filters.family_member_id;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.period) params.period = filters.period;
      if (filters.search) params.search = filters.search;
      try {
        const response = await apiClient.get('/bills/by-family-member', { params });
        return {
          data: response.data,
          total: response.data.length
        };
      } catch (error) {
        console.error('Error fetching bills by family member from API:', error);
        return { data: [], total: 0 };
      }
    },

    /**
     * Lấy thông tin bed assignment theo resident_id
     * @param {string} residentId
     * @returns {Promise<Object>} Thông tin bed assignment
     */
    getBedAssignmentByResident: async (residentId) => {
      try {
        const response = await apiClient.get('/bed-assignments/by-resident', { params: { resident_id: residentId } });
        // API trả về mảng, lấy phần tử đầu tiên nếu có
        return response.data && response.data.length > 0 ? response.data[0] : null;
      } catch (error) {
        console.error('Error fetching bed assignment by resident:', error);
        return null;
      }
    },

    /**
     * Lấy thông tin care plan assignment theo resident_id
     * @param {string} residentId
     * @returns {Promise<Object>} Thông tin care plan assignment
     */
    getCarePlanAssignmentByResident: async (residentId) => {
      try {
        const response = await apiClient.get(`/care-plan-assignments/by-resident/${residentId}`);
        return response.data;
      } catch (error) {
        console.error('Error fetching care plan assignment by resident:', error);
        return null;
      }
    },

    /**
     * Lấy danh sách room types
     * @returns {Promise<Array>} Danh sách room types
     */
    getRoomTypes: async () => {
      try {
        const response = await apiClient.get('/room-types');
        return response.data;
      } catch (error) {
        console.error('Error fetching room types:', error);
        return [];
      }
    },
  },

  /**
   * Lấy tất cả care plan assignments
   * @returns {Promise<Array>} Danh sách assignment
   */
  getAllCarePlanAssignments: async () => {
    try {
      const response = await apiClient.get('/care-plan-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fetching care plan assignments:', error);
      return [];
    }
  },

  /**
   * Thanh toán hóa đơn
   * @param {string} billId - ID hóa đơn
   * @param {Object} paymentData - Dữ liệu thanh toán
   * @returns {Promise<Object>} { success: boolean, data: paymentResult, error?: string }
   */
  payBill: async (billId, paymentData) => {
    try {
      const response = await apiClient.post(`/bills/${billId}/pay`, paymentData);
      return {
        success: true,
        data: response.data,
        message: 'Thanh toán thành công'
      };
    } catch (error) {
      console.error('Pay bill error:', error);
      return {
        success: false,
        error: error.response?.data || error.message || 'Thanh toán thất bại'
      };
    }
  },

  /**
   * Lấy danh sách hóa đơn theo family member id
   * @param {Object} filters - Bộ lọc (family_member_id, status, type, period, search)
   * @returns {Promise<Object>} { success: boolean, data: bills[], error?: string }
   */
  getBillsByFamilyMember: async (filters = {}) => {
    try {
      const params = {};
      if (filters.family_member_id) params.family_member_id = filters.family_member_id;
      if (filters.status) params.status = filters.status;
      if (filters.type) params.type = filters.type;
      if (filters.period) params.period = filters.period;
      if (filters.search) params.search = filters.search;
      if (filters.resident_id) params.resident_id = filters.resident_id;
      
      const response = await apiClient.get('/bills/by-family-member', { params });
      return {
        success: true,
        data: response.data,
        total: response.data.length
      };
    } catch (error) {
      console.error('Error fetching bills by family member from API:', error);
      return { 
        success: false, 
        data: [], 
        total: 0,
        error: error.response?.data || error.message || 'Lấy danh sách hóa đơn thất bại'
      };
    }
  },
};

// API endpoints - sẽ được sử dụng khi có API thực tế  
const API_ENDPOINTS = {
  BILLS: '/billings',
  RESIDENTS: '/residents',
  PAYMENT_METHODS: '/payment-methods',
  PROCESS_PAYMENT: '/billings/payment',
  EXPORT_PDF: '/billings/export-pdf',
  ROOM_TYPES: '/room-types',
  CARE_PLANS: '/care-plans',
  CARE_PLAN_ASSIGNMENTS: '/care-plan-assignments',
};

// Get bills by resident ID
billsService.getBillsByResident = async (residentId) => {
  try {
    console.log('Getting bills for resident:', residentId);
    const response = await apiClient.get('/bills/by-resident', {
      params: { resident_id: residentId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting bills by resident:', error);
    if (error.response?.status === 404) {
      // No bills found - return empty array
      return [];
    }
    throw error;
  }
};

export default billsService; 