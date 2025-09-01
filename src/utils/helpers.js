// Hàm delay để giả lập độ trễ mạng
export const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Hàm format tiền tệ
export const formatCurrency = (amount) => {
  const formattedAmount = (amount * 1000).toLocaleString('vi-VN');
  return `${formattedAmount} VNĐ`;
};

// Hàm format ngày tháng
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN');
};

// Hàm tạo ID ngẫu nhiên
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Hàm kiểm tra hết hạn
export const isExpired = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  return today > due;
};

// Hàm tính số ngày còn lại
export const getDaysRemaining = (dueDate) => {
  const today = new Date();
  const due = new Date(dueDate);
  
  // Reset times to compare dates only
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  
  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}; 