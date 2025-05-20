// Base API URL
export const API_BASE_URL = 'https://api.nhms.example.com';

// Resident endpoints
export const RESIDENT_ENDPOINTS = {
  getAllResidents: `${API_BASE_URL}/residents`,
  getResidentDetails: (id) => `${API_BASE_URL}/residents/${id}`,
  createResident: `${API_BASE_URL}/residents`,
  updateResident: (id) => `${API_BASE_URL}/residents/${id}`,
  deleteResident: (id) => `${API_BASE_URL}/residents/${id}`,
  getMedications: (id) => `${API_BASE_URL}/residents/${id}/medications`,
  getCarePlans: (id) => `${API_BASE_URL}/residents/${id}/careplans`,
  getVitals: (id) => `${API_BASE_URL}/residents/${id}/vitals`,
};

// Staff endpoints
export const STAFF_ENDPOINTS = {
  getAllStaff: `${API_BASE_URL}/staff`,
  getStaffDetails: (id) => `${API_BASE_URL}/staff/${id}`,
  getStaffSchedule: (id) => `${API_BASE_URL}/staff/${id}/schedule`,
  createStaff: `${API_BASE_URL}/staff`,
  updateStaff: (id) => `${API_BASE_URL}/staff/${id}`,
  deleteStaff: (id) => `${API_BASE_URL}/staff/${id}`,
};

// Schedule endpoints
export const SCHEDULE_ENDPOINTS = {
  getSchedule: `${API_BASE_URL}/schedules`,
  createShift: `${API_BASE_URL}/schedules`,
  updateShift: (id) => `${API_BASE_URL}/schedules/${id}`,
  deleteShift: (id) => `${API_BASE_URL}/schedules/${id}`,
};

// Activity endpoints
export const ACTIVITY_ENDPOINTS = {
  getAllActivities: `${API_BASE_URL}/activities`,
  getActivityDetails: (id) => `${API_BASE_URL}/activities/${id}`,
  createActivity: `${API_BASE_URL}/activities`,
  updateActivity: (id) => `${API_BASE_URL}/activities/${id}`,
  deleteActivity: (id) => `${API_BASE_URL}/activities/${id}`,
  getResidentActivities: (residentId) => `${API_BASE_URL}/residents/${residentId}/activities`,
  getRecommendedActivities: (residentId) => `${API_BASE_URL}/residents/${residentId}/recommended-activities`,
};

// Inventory endpoints
export const INVENTORY_ENDPOINTS = {
  getAllItems: `${API_BASE_URL}/inventory`,
  getItemDetails: (id) => `${API_BASE_URL}/inventory/${id}`,
  createItem: `${API_BASE_URL}/inventory`,
  updateItem: (id) => `${API_BASE_URL}/inventory/${id}`,
  deleteItem: (id) => `${API_BASE_URL}/inventory/${id}`,
};

// Room management endpoints
export const ROOM_ENDPOINTS = {
  getAllRooms: `${API_BASE_URL}/rooms`,
  getRoomDetails: (id) => `${API_BASE_URL}/rooms/${id}`,
  createRoom: `${API_BASE_URL}/rooms`,
  updateRoom: (id) => `${API_BASE_URL}/rooms/${id}`,
  deleteRoom: (id) => `${API_BASE_URL}/rooms/${id}`,
};

// Authentication endpoints
export const AUTH_ENDPOINTS = {
  login: `${API_BASE_URL}/auth/login`,
  logout: `${API_BASE_URL}/auth/logout`,
  register: `${API_BASE_URL}/auth/register`,
  refreshToken: `${API_BASE_URL}/auth/refresh-token`,
  forgotPassword: `${API_BASE_URL}/auth/forgot-password`,
  resetPassword: `${API_BASE_URL}/auth/reset-password`,
};

// Notification endpoints
export const NOTIFICATION_ENDPOINTS = {
  getAllNotifications: `${API_BASE_URL}/notifications`,
  markAsRead: (id) => `${API_BASE_URL}/notifications/${id}/read`,
  deleteNotification: (id) => `${API_BASE_URL}/notifications/${id}`,
};

// Report endpoints
export const REPORT_ENDPOINTS = {
  getResidentReports: `${API_BASE_URL}/reports/residents`,
  getStaffReports: `${API_BASE_URL}/reports/staff`,
  getActivityReports: `${API_BASE_URL}/reports/activities`,
  getInventoryReports: `${API_BASE_URL}/reports/inventory`,
  getComplianceReports: `${API_BASE_URL}/reports/compliance`,
};

// Family portal endpoints
export const FAMILY_ENDPOINTS = {
  getFamilyMembers: (residentId) => `${API_BASE_URL}/residents/${residentId}/family`,
  getUpdates: (residentId) => `${API_BASE_URL}/residents/${residentId}/updates`,
  scheduleVisit: (residentId) => `${API_BASE_URL}/residents/${residentId}/visits`,
  sendMessage: `${API_BASE_URL}/messages`,
};

// Export all endpoints
const API = {
  BASE_URL: API_BASE_URL,
  RESIDENT: RESIDENT_ENDPOINTS,
  STAFF: STAFF_ENDPOINTS,
  SCHEDULE: SCHEDULE_ENDPOINTS,
  ACTIVITY: ACTIVITY_ENDPOINTS,
  INVENTORY: INVENTORY_ENDPOINTS,
  ROOM: ROOM_ENDPOINTS,
  AUTH: AUTH_ENDPOINTS,
  NOTIFICATION: NOTIFICATION_ENDPOINTS,
  REPORT: REPORT_ENDPOINTS,
  FAMILY: FAMILY_ENDPOINTS,
};

export default API; 