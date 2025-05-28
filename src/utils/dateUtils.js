// Vietnamese date formatting utilities
export const dateUtils = {
  // Format date to Vietnamese locale
  formatDate: (dateString, options = {}) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const defaultOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      ...options 
    };
    return date.toLocaleDateString('vi-VN', defaultOptions);
  },

  // Format time to Vietnamese locale
  formatTime: (dateString, options = {}) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const defaultOptions = { 
      hour: '2-digit', 
      minute: '2-digit',
      ...options 
    };
    return date.toLocaleTimeString('vi-VN', defaultOptions);
  },

  // Format date and time together
  formatDateTime: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return `${dateUtils.formatDate(dateString)} ${dateUtils.formatTime(dateString)}`;
  },

  // Get friendly date string (Today, Yesterday, or actual date)
  getFriendlyDate: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Ngày mai';
    } else {
      return dateUtils.formatDate(dateString);
    }
  },

  // Get weekday in Vietnamese
  getVietnameseWeekday: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const weekdays = [
      'Chủ nhật',
      'Thứ hai',
      'Thứ ba',
      'Thứ tư',
      'Thứ năm',
      'Thứ sáu',
      'Thứ bảy'
    ];
    return weekdays[date.getDay()];
  },

  // Get month name in Vietnamese
  getVietnameseMonth: (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const months = [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12'
    ];
    return months[date.getMonth()];
  },

  // Calculate age in Vietnamese
  calculateAge: (dateOfBirth) => {
    if (!dateOfBirth) return '';
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return `${age} tuổi`;
  },

  // Get time ago in Vietnamese
  getTimeAgo: (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffSecs < 60) {
      return 'Vừa xong';
    } else if (diffMins < 60) {
      return `${diffMins} phút trước`;
    } else if (diffHours < 24) {
      return `${diffHours} giờ trước`;
    } else if (diffDays === 1) {
      return 'Hôm qua';
    } else if (diffDays < 7) {
      return `${diffDays} ngày trước`;
    } else {
      return dateUtils.formatDate(dateString);
    }
  },

  // Format time for message timestamps
  formatMessageTime: (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    
    // If the message is from today, only show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the message is from yesterday, show "Yesterday"
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    
    // If the message is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // Check if date is today
  isToday: (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if date is yesterday
  isYesterday: (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  },

  // Check if date is tomorrow
  isTomorrow: (dateString) => {
    if (!dateString) return false;
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return date.toDateString() === tomorrow.toDateString();
  },

  // Format for activity schedules
  formatActivityTime: (dateString) => {
    if (!dateString) return '';
    
    const activityDate = new Date(dateString);
    const formattedTime = activityDate.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const formattedDate = activityDate.toLocaleDateString('vi-VN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });

    return `${formattedDate} • ${formattedTime}`;
  }
};

export default dateUtils; 