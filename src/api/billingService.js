import { delay } from '../utils/helpers';
import { residents as MAIN_RESIDENTS } from './mockData';
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
} from './mockData/billingMockDataDB';

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

// ==================== BILLING SERVICE FUNCTIONS ====================

/**
 * Lấy danh sách hóa đơn cho family member
 * @param {string} familyId - ID của thành viên gia đình
 * @param {string} status - Lọc theo trạng thái (optional)
 * @returns {Promise<Array>} Danh sách hóa đơn
 */
export const getBills = async (familyId, status = null) => {
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
};

/**
 * Lấy chi tiết hóa đơn
 * @param {string} billId - ID của hóa đơn
 * @returns {Promise<Object>} Chi tiết hóa đơn
 */
export const getBillDetail = async (billId) => {
  await delay(200);
  
  try {
    const bill = MOCK_BILLINGS.find(b => b._id === billId);
    
    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    
    return enhanceBillData(bill);
  } catch (error) {
    console.error('Error fetching bill detail:', error);
    throw error;
  }
};

/**
 * Thanh toán hóa đơn
 * @param {string} billId - ID của hóa đơn
 * @param {Object} paymentData - Thông tin thanh toán
 * @returns {Promise<Object>} Kết quả thanh toán
 */
export const payBill = async (billId, paymentData) => {
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
};

/**
 * Lấy thống kê tổng quan về hóa đơn
 * @param {string} familyId - ID của thành viên gia đình
 * @returns {Promise<Object>} Thống kê hóa đơn
 */
export const getBillStatistics = async (familyId) => {
  await delay(300);
  
  try {
    const bills = await getBills(familyId);
    
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
};

/**
 * Lấy danh sách residents
 * @returns {Promise<Array>} Danh sách residents
 */
export const getResidents = async () => {
  await delay(300);
  
  // Sử dụng data từ file chính mockData.js để đảm bảo consistency
  return MAIN_RESIDENTS.map(resident => ({
    id: resident.id,
    name: `${resident.firstName} ${resident.lastName}`,
    room: resident.roomNumber, // Sử dụng roomNumber từ file chính
    status: resident.status
  }));
};

/**
 * Lấy danh sách phương thức thanh toán
 * @returns {Promise<Array>} Danh sách phương thức thanh toán
 */
export const getPaymentMethods = async () => {
  await delay(300);
  return MOCK_PAYMENT_METHODS;
};

/**
 * Tìm kiếm hóa đơn theo từ khóa
 * @param {string} familyId - ID của thành viên gia đình
 * @param {string} searchTerm - Từ khóa tìm kiếm
 * @returns {Promise<Array>} Danh sách hóa đơn tìm được
 */
export const searchBills = async (familyId, searchTerm) => {
  await delay(500);
  
  try {
    const allBills = await getBills(familyId);
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

/**
 * LEGACY SUPPORT: billingService object for backward compatibility
 * Các màn hình cũ sẽ vẫn hoạt động thông qua object này
 */
export const billingService = {
  /**
   * Lấy danh sách hóa đơn với filters
   * @param {Object} filters - Bộ lọc (status, residentId, search, etc.)
   * @returns {Promise<Object>} { data: bills[], total: number }
   */
  getBills: async (filters = {}) => {
    // Chuyển filters mới sang format cũ để tương thích
    const familyId = filters.familyId || 'family_001'; // Default family ID
    
    // Lấy bills trực tiếp từ mock data thay vì gọi recursive
    let bills = MOCK_BILLINGS
      .filter(bill => bill.family_member_id === familyId)
      .map(enhanceBillData)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Apply additional filters
    if (filters.status) {
      bills = bills.filter(bill => bill.status === filters.status);
    }
    
    if (filters.residentId) {
      bills = bills.filter(bill => bill.resident.id === filters.residentId);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      bills = bills.filter(bill =>
        bill.resident.name.toLowerCase().includes(searchLower) ||
        bill.resident.room.toLowerCase().includes(searchLower) ||
        bill.items.some(item => 
          item.name.toLowerCase().includes(searchLower) ||
          item.description.toLowerCase().includes(searchLower)
        )
      );
    }
    
    return {
      data: bills,
      total: bills.length
    };
  },

  /**
   * Lấy chi tiết hóa đơn
   * @param {string} billId - ID hóa đơn
   * @returns {Promise<Object>} Chi tiết hóa đơn
   */
  getBillDetail: async (billId) => {
    return await getBillDetail(billId);
  },

  /**
   * Lấy danh sách residents
   * @returns {Promise<Array>} Danh sách residents
   */
  getResidents: async () => {
    return await getResidents();
  },

  /**
   * Lấy phương thức thanh toán
   * @returns {Promise<Array>} Danh sách phương thức thanh toán
   */
  getPaymentMethods: async () => {
    return await getPaymentMethods();
  },

  /**
   * Xử lý thanh toán hóa đơn
   * @param {string} billId - ID hóa đơn
   * @param {string} paymentMethod - Phương thức thanh toán
   * @param {Object} paymentDetails - Chi tiết thanh toán
   * @returns {Promise<Object>} Kết quả thanh toán
   */
  processPayment: async (billId, paymentMethod, paymentDetails = {}) => {
    return await payBill(billId, { method: paymentMethod, ...paymentDetails });
  },

  /**
   * Xuất PDF hóa đơn
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
};