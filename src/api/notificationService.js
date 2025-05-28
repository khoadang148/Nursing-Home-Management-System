import apiService from './apiService';
import { NOTIFICATION_ENDPOINTS } from '../constants/api';
import { mockNotifications } from './mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Vietnamese notification message templates
export const VietnameseNotificationTemplates = {
  // Medication notifications
  MEDICATION_TAKEN: {
    title: 'Đã Uống Thuốc',
    getMessage: (medicationName, time) => `Thuốc ${medicationName} đã được dùng lúc ${time}.`,
    type: 'medication',
    priority: 'normal'
  },
  MEDICATION_MISSED: {
    title: 'Quên Uống Thuốc',
    getMessage: (medicationName, time) => `Chưa uống thuốc ${medicationName} vào lúc ${time} như đã định.`,
    type: 'medication',
    priority: 'high'
  },
  MEDICATION_CHANGED: {
    title: 'Thay Đổi Thuốc',
    getMessage: (oldMed, newMed) => `Bác sĩ đã thay đổi từ thuốc ${oldMed} sang ${newMed}.`,
    type: 'medication',
    priority: 'high'
  },
  MEDICATION_REMINDER: {
    title: 'Nhắc Nhở Uống Thuốc',
    getMessage: (medicationName, time) => `Đến giờ uống thuốc ${medicationName} lúc ${time}.`,
    type: 'medication',
    priority: 'high'
  },

  // Health notifications
  HEALTH_CHECKUP_COMPLETED: {
    title: 'Hoàn Thành Kiểm Tra Sức Khỏe',
    getMessage: (checkupType) => `Kiểm tra ${checkupType} đã hoàn thành. Kết quả bình thường.`,
    type: 'health',
    priority: 'normal'
  },
  HEALTH_ISSUE_DETECTED: {
    title: 'Phát Hiện Vấn Đề Sức Khỏe',
    getMessage: (issue) => `Đã phát hiện ${issue}. Vui lòng liên hệ nhân viên y tế ngay.`,
    type: 'health',
    priority: 'urgent'
  },
  VITAL_SIGNS_RECORDED: {
    title: 'Đã Ghi Nhận Dấu Hiệu Sinh Tồn',
    getMessage: (bloodPressure, heartRate, temperature) => `Huyết áp: ${bloodPressure}, Nhịp tim: ${heartRate}, Nhiệt độ: ${temperature}°C`,
    type: 'health',
    priority: 'normal'
  },
  DOCTOR_VISIT_SCHEDULED: {
    title: 'Đã Lên Lịch Khám Bác Sĩ',
    getMessage: (doctorName, date, time) => `Cuộc hẹn với ${doctorName} vào ${date} lúc ${time}.`,
    type: 'appointment',
    priority: 'high'
  },

  // Activity notifications
  ACTIVITY_JOINED: {
    title: 'Tham Gia Hoạt Động',
    getMessage: (activityName) => `Đã tham gia hoạt động ${activityName} và thể hiện sự tích cực.`,
    type: 'activity',
    priority: 'normal'
  },
  ACTIVITY_COMPLETED: {
    title: 'Hoàn Thành Hoạt Động',
    getMessage: (activityName, rating) => `Hoàn thành ${activityName}. Mức độ tham gia: ${rating}/5.`,
    type: 'activity',
    priority: 'normal'
  },
  ACTIVITY_SCHEDULED: {
    title: 'Hoạt Động Được Lên Lịch',
    getMessage: (activityName, date, time) => `${activityName} được lên lịch vào ${date} lúc ${time}.`,
    type: 'activity',
    priority: 'normal'
  },
  ACTIVITY_CANCELLED: {
    title: 'Hủy Hoạt Động',
    getMessage: (activityName, reason) => `${activityName} đã bị hủy. Lý do: ${reason}`,
    type: 'activity',
    priority: 'normal'
  },

  // Visit notifications
  VISIT_CONFIRMED: {
    title: 'Xác Nhận Lịch Thăm',
    getMessage: (visitorName, date, time) => `Lịch thăm của ${visitorName} vào ${date} lúc ${time} đã được xác nhận.`,
    type: 'visit',
    priority: 'high'
  },
  VISIT_CANCELLED: {
    title: 'Hủy Lịch Thăm',
    getMessage: (visitorName, date) => `Lịch thăm của ${visitorName} vào ${date} đã bị hủy.`,
    type: 'visit',
    priority: 'normal'
  },
  VISIT_REMINDER: {
    title: 'Nhắc Nhở Lịch Thăm',
    getMessage: (visitorName, time) => `${visitorName} sẽ đến thăm trong ${time}.`,
    type: 'visit',
    priority: 'normal'
  },
  VISIT_COMPLETED: {
    title: 'Hoàn Thành Lịch Thăm',
    getMessage: (visitorName, duration) => `Cuộc thăm viếng với ${visitorName} đã kết thúc sau ${duration}.`,
    type: 'visit',
    priority: 'normal'
  },

  // Food and dining notifications
  MEAL_SERVED: {
    title: 'Phục Vụ Bữa Ăn',
    getMessage: (mealType, menuItems) => `${mealType} đã được phục vụ: ${menuItems}.`,
    type: 'dining',
    priority: 'normal'
  },
  SPECIAL_DIET_NOTED: {
    title: 'Ghi Chú Chế Độ Ăn Đặc Biệt',
    getMessage: (dietType) => `Đã cập nhật chế độ ăn đặc biệt: ${dietType}.`,
    type: 'dining',
    priority: 'normal'
  },

  // General notifications
  PHOTO_ADDED: {
    title: 'Thêm Ảnh Mới',
    getMessage: (eventName, photoCount) => `${photoCount} ảnh mới từ ${eventName} đã được thêm vào thư viện.`,
    type: 'photo',
    priority: 'normal'
  },
  BIRTHDAY_REMINDER: {
    title: 'Nhắc Nhở Sinh Nhật',
    getMessage: (name, date) => `Sinh nhật của ${name} vào ${date}. Đừng quên chúc mừng!`,
    type: 'general',
    priority: 'normal'
  },
  SYSTEM_UPDATE: {
    title: 'Cập Nhật Hệ Thống',
    getMessage: (updateInfo) => `Hệ thống đã được cập nhật: ${updateInfo}`,
    type: 'system',
    priority: 'low'
  },
  EMERGENCY_ALERT: {
    title: 'Cảnh Báo Khẩn Cấp',
    getMessage: (alertType, location) => `🚨 ${alertType} tại ${location}. Vui lòng thực hiện các biện pháp an toàn ngay lập tức.`,
    type: 'emergency',
    priority: 'urgent'
  },

  // Communication notifications
  MESSAGE_RECEIVED: {
    title: 'Tin Nhắn Mới',
    getMessage: (senderName) => `Bạn có tin nhắn mới từ ${senderName}.`,
    type: 'message',
    priority: 'normal'
  },
  FAMILY_MESSAGE: {
    title: 'Tin Nhắn Gia Đình',
    getMessage: (familyMember, messagePreview) => `${familyMember}: ${messagePreview}`,
    type: 'message',
    priority: 'normal'
  }
};

// Priority levels in Vietnamese
export const PriorityLevels = {
  urgent: { text: 'Khẩn Cấp', color: '#FF0000' },
  high: { text: 'Cao', color: '#FF6B00' },
  normal: { text: 'Bình Thường', color: '#2196F3' },
  low: { text: 'Thấp', color: '#4CAF50' }
};

// Notification type labels in Vietnamese
export const NotificationTypeLabels = {
  medication: 'Thuốc',
  health: 'Sức Khỏe',
  activity: 'Hoạt Động',
  visit: 'Thăm Viếng',
  appointment: 'Cuộc Hẹn',
  dining: 'Ăn Uống',
  photo: 'Hình Ảnh',
  general: 'Chung',
  system: 'Hệ Thống',
  emergency: 'Khẩn Cấp',
  message: 'Tin Nhắn'
};

// Utility functions for Vietnamese notifications
export const NotificationUtils = {
  // Create notification using template
  createNotification: (templateKey, params = {}, additionalData = {}) => {
    const template = VietnameseNotificationTemplates[templateKey];
    if (!template) {
      throw new Error(`Template ${templateKey} không tồn tại`);
    }

    return {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      title: template.title,
      message: typeof template.getMessage === 'function' 
        ? template.getMessage(...Object.values(params))
        : template.message,
      type: template.type,
      priority: template.priority,
      timestamp: new Date().toISOString(),
      isRead: false,
      ...additionalData
    };
  },

  // Format Vietnamese date for notifications
  formatVietnameseDate: (dateString) => {
    const date = new Date(dateString);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const months = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();

    return `${dayName}, ${day} ${month} ${year}`;
  },

  // Format time in Vietnamese format
  formatVietnameseTime: (dateString) => {
    const date = new Date(dateString);
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  },

  // Get relative time in Vietnamese
  getRelativeTime: (dateString) => {
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
      return NotificationUtils.formatVietnameseDate(dateString);
    }
  },

  // Filter notifications by type with Vietnamese labels
  filterByType: (notifications, type) => {
    if (type === 'all') return notifications;
    if (type === 'unread') return notifications.filter(n => !n.isRead);
    return notifications.filter(n => n.type === type);
  },

  // Sort notifications by priority and date
  sortNotifications: (notifications) => {
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    return [...notifications].sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.timestamp) - new Date(a.timestamp);
    });
  }
};

// Main notification service
const notificationService = {
  // Get all notifications
  getAllNotifications: async () => {
    await simulateNetworkDelay();
    const sortedNotifications = NotificationUtils.sortNotifications(mockNotifications);
    return { data: sortedNotifications, success: true };
  },

  // Get notification by ID
  getNotificationById: async (id) => {
    await simulateNetworkDelay();
    const notification = mockNotifications.find(n => n.id === id);
    if (!notification) {
      return { data: null, success: false, error: 'Không tìm thấy thông báo' };
    }
    return { data: notification, success: true };
  },

  // Mark notification as read
  markAsRead: async (id) => {
    await simulateNetworkDelay();
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return { data: null, success: false, error: 'Không tìm thấy thông báo' };
    }
    mockNotifications[notificationIndex].isRead = true;
    return { data: { id, isRead: true }, success: true };
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    await simulateNetworkDelay();
    mockNotifications.forEach(notification => {
      notification.isRead = true;
    });
    return { data: { message: 'Đã đánh dấu tất cả thông báo là đã đọc' }, success: true };
  },

  // Delete notification
  deleteNotification: async (id) => {
    await simulateNetworkDelay();
    const notificationIndex = mockNotifications.findIndex(n => n.id === id);
    if (notificationIndex === -1) {
      return { data: null, success: false, error: 'Không tìm thấy thông báo' };
    }
    mockNotifications.splice(notificationIndex, 1);
    return { data: { id }, success: true };
  },

  // Create new notification using template
  createNotification: async (templateKey, params, additionalData) => {
    await simulateNetworkDelay();
    try {
      const newNotification = NotificationUtils.createNotification(templateKey, params, additionalData);
      mockNotifications.unshift(newNotification);
      return { data: newNotification, success: true };
    } catch (error) {
      return { data: null, success: false, error: error.message };
    }
  },

  // Send bulk notifications
  sendBulkNotifications: async (notifications) => {
    await simulateNetworkDelay();
    const createdNotifications = notifications.map(notif => {
      if (notif.templateKey) {
        return NotificationUtils.createNotification(notif.templateKey, notif.params, notif.additionalData);
      }
      return {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        timestamp: new Date().toISOString(),
        isRead: false,
        priority: 'normal',
        ...notif
      };
    });
    
    mockNotifications.unshift(...createdNotifications);
    return { data: createdNotifications, success: true };
  },

  // Get notifications by type
  getNotificationsByType: async (type) => {
    await simulateNetworkDelay();
    const filteredNotifications = NotificationUtils.filterByType(mockNotifications, type);
    const sortedNotifications = NotificationUtils.sortNotifications(filteredNotifications);
    return { data: sortedNotifications, success: true };
  },

  // Get unread count
  getUnreadCount: async () => {
    await simulateNetworkDelay();
    const unreadCount = mockNotifications.filter(n => !n.isRead).length;
    return { data: { count: unreadCount }, success: true };
  },

  // Search notifications
  searchNotifications: async (query) => {
    await simulateNetworkDelay();
    const lowerQuery = query.toLowerCase();
    const filteredNotifications = mockNotifications.filter(n => 
      n.title.toLowerCase().includes(lowerQuery) || 
      n.message.toLowerCase().includes(lowerQuery)
    );
    const sortedNotifications = NotificationUtils.sortNotifications(filteredNotifications);
    return { data: sortedNotifications, success: true };
  }
};

// For real API implementation (when backend is ready)
const realNotificationService = {
  getAllNotifications: () => apiService.get(NOTIFICATION_ENDPOINTS.getAllNotifications),
  markAsRead: (id) => apiService.put(NOTIFICATION_ENDPOINTS.markAsRead(id)),
  deleteNotification: (id) => apiService.delete(NOTIFICATION_ENDPOINTS.deleteNotification(id)),
};

// Export the mock service for now
export default notificationService; 