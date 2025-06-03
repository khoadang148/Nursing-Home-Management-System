import { delay } from '../utils/helpers';

// Mock data
const mockBills = [
  {
    id: '1',
    title: 'Phí chăm sóc tháng 3/2024',
    amount: 5000000,
    dueDate: '2024-03-31',
    status: 'pending',
    type: 'monthly',
    description: 'Phí chăm sóc cơ bản hàng tháng',
    createdAt: '2024-03-01',
    items: [
      { name: 'Phí chăm sóc cơ bản', amount: 3000000 },
      { name: 'Phí ăn uống', amount: 1500000 },
      { name: 'Phí cơ sở vật chất', amount: 500000 },
    ],
  },
  {
    id: '2',
    title: 'Phí thuốc tháng 3/2024',
    amount: 1500000,
    dueDate: '2024-03-31',
    status: 'paid',
    type: 'medicine',
    description: 'Phí thuốc và vật tư y tế',
    createdAt: '2024-03-01',
    paymentDate: '2024-03-15',
    paymentMethod: 'card',
    items: [
      { name: 'Thuốc huyết áp', amount: 800000 },
      { name: 'Thuốc tim mạch', amount: 500000 },
      { name: 'Vật tư y tế', amount: 200000 },
    ],
  },
  {
    id: '3',
    title: 'Phí chăm sóc tháng 2/2024',
    amount: 4800000,
    dueDate: '2024-02-29',
    status: 'paid',
    type: 'monthly',
    description: 'Phí chăm sóc cơ bản hàng tháng',
    createdAt: '2024-02-01',
    paymentDate: '2024-02-28',
    paymentMethod: 'wallet',
    items: [
      { name: 'Phí chăm sóc cơ bản', amount: 3000000 },
      { name: 'Phí ăn uống', amount: 1500000 },
      { name: 'Phí cơ sở vật chất', amount: 300000 },
    ],
  },
];

const mockPaymentMethods = [
  {
    id: 'card',
    name: 'Thẻ ngân hàng',
    icon: 'card-outline',
    banks: [
      { id: 'vcb', name: 'Vietcombank' },
      { id: 'tcb', name: 'Techcombank' },
      { id: 'mb', name: 'MB Bank' },
    ],
  },
  {
    id: 'wallet',
    name: 'Ví điện tử',
    icon: 'wallet-outline',
    providers: [
      { id: 'momo', name: 'MoMo' },
      { id: 'zalopay', name: 'ZaloPay' },
      { id: 'vnpay', name: 'VNPay' },
    ],
  },
  {
    id: 'transfer',
    name: 'Chuyển khoản',
    icon: 'swap-horizontal-outline',
    banks: [
      { id: 'vcb', name: 'Vietcombank', accountNumber: '1234567890' },
      { id: 'tcb', name: 'Techcombank', accountNumber: '0987654321' },
    ],
  },
];

// API functions
export const billingService = {
  // Lấy danh sách hóa đơn
  getBills: async (filters = {}) => {
    await delay(1000); // Giả lập độ trễ mạng

    let filteredBills = [...mockBills];

    // Áp dụng các bộ lọc
    if (filters.status) {
      filteredBills = filteredBills.filter(bill => bill.status === filters.status);
    }
    if (filters.type) {
      filteredBills = filteredBills.filter(bill => bill.type === filters.type);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBills = filteredBills.filter(bill =>
        bill.title.toLowerCase().includes(searchLower) ||
        bill.description.toLowerCase().includes(searchLower)
      );
    }
    if (filters.startDate && filters.endDate) {
      filteredBills = filteredBills.filter(bill => {
        const billDate = new Date(bill.createdAt);
        return billDate >= new Date(filters.startDate) && billDate <= new Date(filters.endDate);
      });
    }

    return {
      data: filteredBills,
      total: filteredBills.length,
    };
  },

  // Lấy chi tiết hóa đơn
  getBillDetail: async (billId) => {
    await delay(500);
    const bill = mockBills.find(b => b.id === billId);
    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }
    return bill;
  },

  // Lấy danh sách phương thức thanh toán
  getPaymentMethods: async () => {
    await delay(500);
    return mockPaymentMethods;
  },

  // Thực hiện thanh toán
  processPayment: async (billId, paymentMethod, paymentDetails) => {
    await delay(2000); // Giả lập thời gian xử lý thanh toán

    const bill = mockBills.find(b => b.id === billId);
    if (!bill) {
      throw new Error('Không tìm thấy hóa đơn');
    }

    if (bill.status === 'paid') {
      throw new Error('Hóa đơn đã được thanh toán');
    }

    // Giả lập kết quả thanh toán
    const success = Math.random() > 0.1; // 90% tỷ lệ thành công
    if (!success) {
      throw new Error('Thanh toán thất bại. Vui lòng thử lại sau.');
    }

    // Cập nhật trạng thái hóa đơn
    bill.status = 'paid';
    bill.paymentDate = new Date().toISOString().split('T')[0];
    bill.paymentMethod = paymentMethod;
    bill.paymentDetails = paymentDetails;

    return {
      success: true,
      message: 'Thanh toán thành công',
      paymentId: `PAY-${Date.now()}`,
    };
  },

  // Xuất hóa đơn PDF
  exportBillPDF: async (billId) => {
    await delay(1500);
    const bill = mockBills.find(b => b.id === billId);
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