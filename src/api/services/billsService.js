import apiClient from '../config/axiosConfig';
import { delay } from '../../utils/helpers';
import { residents as MAIN_RESIDENTS } from '../mockData';
import { 
  MOCK_BILLINGS, 
  MOCK_RESIDENTS, 
  MOCK_PAYMENT_METHODS,
  MOCK_CARE_PLANS,
  MOCK_CARE_PLAN_ASSIGNMENTS,
  MOCK_ROOM_TYPES,
  getCarePlanById,
  getResidentById,
  getAssignmentById,
  getRoomTypeByType
} from '../mockData/billingMockDataDB';

/**
 * STATUS CALCULATION LOGIC - Đồng bộ với BillingScreen
 * Thay vì dựa vào status field trực tiếp, tính toán dựa vào:
 * - pending + due_date < today = overdue  
 * - paid_date != null = paid
 * - còn lại = pending
 */
const calculateBillStatus = (bill) => {
  if (bill.paid_date) {
    return 'paid';
  }
  
  const today = new Date();
  const dueDate = new Date(bill.due_date);
  
  // Reset times to compare dates only
  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);
  
  // Bill is only overdue if the due date is BEFORE today (not including today)
  // User has until the end of the due date to pay
  if (dueDate < today) {
    return 'overdue';
  }
  
  return 'pending';
};

/**
 * ENHANCED BILL DATA với đầy đủ thông tin từ DB schema
 */
const enhanceBillData = (bill) => {
  const resident = getResidentById(bill.resident_id);
  const assignment = getAssignmentById(bill.care_plan_assignment_id);
  
  // Tìm resident từ file chính để lấy đúng room number
  const mainResident = MAIN_RESIDENTS.find(r => r.id === bill.resident_id);
  
  let enhancedItems = [];
  
  if (assignment && assignment.care_plan_ids) {
    // Main care plan (category = "main")
    const mainPlanId = assignment.care_plan_ids.find(planId => {
      const plan = getCarePlanById(planId);
      return plan && plan.category === 'main';
    });
    
    if (mainPlanId) {
      const mainPlan = getCarePlanById(mainPlanId);
      if (mainPlan) {
        enhancedItems.push({
          id: `main_${mainPlanId}`, // Add unique id for key
          name: mainPlan.plan_name,
          amount: mainPlan.monthly_price,
          category: 'main', // ← QUAN TRỌNG: category = main 
          description: mainPlan.description
        });
      }
    }
    
    // Supplementary care plans (category = "supplementary")
    const suppPlanIds = assignment.care_plan_ids.filter(planId => {
      const plan = getCarePlanById(planId);
      return plan && plan.category === 'supplementary';
    });
    
    suppPlanIds.forEach(planId => {
      const suppPlan = getCarePlanById(planId);
      if (suppPlan) {
        enhancedItems.push({
          id: `supp_${planId}`, // Add unique id for key
          name: suppPlan.plan_name,
          amount: suppPlan.monthly_price,
          category: 'supplementary', // ← QUAN TRỌNG: category = supplementary
          description: suppPlan.description
        });
      }
    });
    
    // Room cost
    if (assignment.selected_room_type) {
      const roomType = getRoomTypeByType(assignment.selected_room_type);
      if (roomType) {
        enhancedItems.push({
          id: `room_${assignment.selected_room_type}`, // Add unique id for key
          name: roomType.type_name,
          amount: roomType.monthly_price,
          category: 'room',
          description: `Chi phí phòng ở ${bill.period || 'tháng này'}`
        });
      }
    }
  }
  
  // Nếu không có enhanced items, sử dụng items sẵn có và thêm id
  if (enhancedItems.length === 0 && bill.items) {
    enhancedItems = bill.items.map((item, index) => ({
      ...item,
      id: item.id || `item_${index}` // Add id if missing
    }));
  }
  
  return {
    ...bill,
    id: bill._id, // Map _id to id for compatibility
    dueDate: bill.due_date,
    createdAt: bill.created_at,
    paymentDate: bill.paid_date,
    paymentMethod: bill.payment_method,
    status: calculateBillStatus(bill), // ← Tính toán status thay vì dùng trực tiếp
    resident: {
      id: bill.resident_id,
      name: mainResident ? `${mainResident.firstName} ${mainResident.lastName}` : 
            (resident ? resident.full_name : bill.resident?.name || 'Unknown'),
      room: mainResident ? mainResident.roomNumber : 
            (bill.resident?.room || (resident ? `Room ${resident._id.slice(-3)}` : 'Unknown'))
    },
    items: enhancedItems
  };
};

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
  },

  // ==================== MOCK DATA FUNCTIONS (DEVELOPMENT) ====================

  /**
   * Lấy danh sách hóa đơn cho family member (Mock Data)
   * @param {string} familyId - ID của thành viên gia đình
   * @param {string} status - Lọc theo trạng thái (optional)
   * @returns {Promise<Array>} Danh sách hóa đơn
   */
  getBills: async (familyId, status = null) => {
    await delay(300); // Simulate API delay
    
    try {
      let bills = MOCK_BILLINGS
        .filter(bill => bill.family_member_id === familyId)
        .map(enhanceBillData)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      if (status) {
        bills = bills.filter(bill => bill.status === status);
      }
      
      return bills;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw new Error('Không thể tải danh sách hóa đơn');
    }
  },

  /**
   * Lấy chi tiết hóa đơn (Mock Data)
   * @param {string} billId - ID của hóa đơn
   * @returns {Promise<Object>} Chi tiết hóa đơn
   */
  getBillDetail: async (billId) => {
    try {
      const response = await apiClient.get(`/bills/${billId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bill detail:', error);
      throw error;
    }
  },

  /**
   * Thanh toán hóa đơn (Mock Data)
   * @param {string} billId - ID của hóa đơn
   * @param {Object} paymentData - Thông tin thanh toán
   * @returns {Promise<Object>} Kết quả thanh toán
   */
  payBill: async (billId, paymentData) => {
    await delay(2000); // Simulate payment processing
    
    try {
      const billIndex = MOCK_BILLINGS.findIndex(b => b._id === billId);
      
      if (billIndex === -1) {
        throw new Error('Không tìm thấy hóa đơn');
      }
      
      // Update bill status to paid
      MOCK_BILLINGS[billIndex] = {
        ...MOCK_BILLINGS[billIndex],
        paid_date: new Date(),
        payment_method: paymentData.method || 'qr_payment',
        status: 'paid',
        updated_at: new Date()
      };
      
      return {
        success: true,
        message: 'Thanh toán thành công',
        bill: enhanceBillData(MOCK_BILLINGS[billIndex]),
        transactionId: `TXN_${Date.now()}`
      };
    } catch (error) {
      console.error('Error processing payment:', error);
      return {
        success: false,
        message: error.message || 'Có lỗi xảy ra khi thanh toán'
      };
    }
  },

  /**
   * Lấy thống kê tổng quan về hóa đơn (Mock Data)
   * @param {string} familyId - ID của thành viên gia đình
   * @returns {Promise<Object>} Thống kê hóa đơn
   */
  getBillStatisticsForFamily: async (familyId) => {
    await delay(300);
    
    try {
      const bills = await billsService.getBills(familyId);
      
      const stats = {
        total: bills.length,
        pending: bills.filter(b => b.status === 'pending').length,
        overdue: bills.filter(b => b.status === 'overdue').length,
        paid: bills.filter(b => b.status === 'paid').length,
        totalAmount: bills.reduce((sum, b) => sum + b.amount, 0),
        pendingAmount: bills.filter(b => b.status === 'pending' || b.status === 'overdue')
                            .reduce((sum, b) => sum + b.amount, 0)
      };
      
      return stats;
    } catch (error) {
      console.error('Error fetching bill statistics:', error);
      throw new Error('Không thể tải thống kê hóa đơn');
    }
  },

  /**
   * Lấy danh sách residents (Mock Data)
   * @returns {Promise<Array>} Danh sách residents
   */
  getResidents: async () => {
    await delay(300);
    
    // Sử dụng data từ file chính mockData.js để đảm bảo consistency
    return MAIN_RESIDENTS.map(resident => ({
      _id: resident._id,
      id: resident._id, // For backward compatibility
      name: resident.full_name,
      room: `${resident.room_number}-${resident.bed_number}`,
      status: resident.status
    })).filter(resident => resident && resident._id); // Filter out any null/undefined
  },

  /**
   * Lấy residents theo family member id (API thực tế)
   * @param {string} familyMemberId
   * @returns {Promise<Array>} Danh sách residents
   */
  getResidentsByFamilyMemberId: async (familyMemberId) => {
    try {
      const response = await apiClient.get(`/residents/family-member/${familyMemberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching residents by family member:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách phương thức thanh toán (Mock Data)
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  getPaymentMethods: async () => {
    await delay(300);
    return MOCK_PAYMENT_METHODS;
  },

  /**
   * Tìm kiếm hóa đơn theo từ khóa (Mock Data)
   * @param {string} familyId - ID của thành viên gia đình
   * @param {string} searchTerm - Từ khóa tìm kiếm
   * @returns {Promise<Array>} Danh sách hóa đơn tìm được
   */
  searchBillsByKeyword: async (familyId, searchTerm) => {
    await delay(500);
    
    try {
      const allBills = await billsService.getBills(familyId);
      const searchLower = searchTerm.toLowerCase();
      
      return allBills.filter(bill =>
        bill.resident.name.toLowerCase().includes(searchLower) ||
        bill.resident.room.toLowerCase().includes(searchLower) ||
        bill.items.some(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        )
      );
    } catch (error) {
      console.error('Error searching bills:', error);
      throw new Error('Không thể tìm kiếm hóa đơn');
    }
  },

  /**
   * Xuất PDF hóa đơn (Mock Data)
   * @param {string} billId - ID hóa đơn  
   * @returns {Promise<Object>} { url, fileName }
   */
  exportBillPDF: async (billId) => {
    await delay(1500);
    
    const bill = MOCK_BILLINGS.find(b => b._id === billId);
    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    // Giả lập URL PDF
    return {
      url: `https://example.com/bills/${billId}.pdf`,
      fileName: `HoaDon_${billId}.pdf`,
    };
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
      return await billsService.getBillDetail(billId);
    },

    /**
     * Lấy danh sách residents
     * @returns {Promise<Array>} Danh sách residents
     */
    getResidents: async () => {
      return await billsService.getResidents();
    },

    /**
     * Lấy phương thức thanh toán
     * @returns {Promise<Array>} Danh sách phương thức thanh toán
     */
    getPaymentMethods: async () => {
      return await billsService.getPaymentMethods();
    },

    /**
     * Xử lý thanh toán hóa đơn
     * @param {string} billId - ID hóa đơn
     * @param {string} paymentMethod - Phương thức thanh toán
     * @param {Object} paymentDetails - Chi tiết thanh toán
     * @returns {Promise<Object>} Kết quả thanh toán
     */
    processPayment: async (billId, paymentMethod, paymentDetails = {}) => {
      return await billsService.payBill(billId, { method: paymentMethod, ...paymentDetails });
    },

    /**
     * Xuất PDF hóa đơn
     * @param {string} billId - ID hóa đơn  
     * @returns {Promise<Object>} { url, fileName }
     */
    exportBillPDF: async (billId) => {
      return await billsService.exportBillPDF(billId);
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

export default billsService; 