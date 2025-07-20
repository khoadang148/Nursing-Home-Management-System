// API Configuration
export const API_CONFIG = {
  // Base URL cho backend thực tế
  // Thay đổi URL và port theo backend của bạn
  // Sử dụng IP thay vì localhost cho React Native
  BASE_URL: 'http://192.168.1.13:8000', // IP WiFi thực tế từ ipconfig
  // BASE_URL: 'http://192.168.56.1:8000', // IP thực tế của máy user
  // BASE_URL: 'http://10.0.2.2:8000', // Android Emulator
  // BASE_URL: 'http://localhost:8000', // iOS Simulator
  
  // API Endpoints - Đã tối ưu theo nghiệp vụ
  ENDPOINTS: {
    AUTH: {
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      PROFILE: '/auth/profile',
      UPDATE_PROFILE: '/auth/profile',
      CHANGE_PASSWORD: '/auth/change-password', // User tự đổi mật khẩu
    },
    USERS: {
      LIST: '/users',
      DETAIL: '/users/:id',
      CREATE: '/users',
      UPDATE_ROLES: '/users/:id/roles',
      DEACTIVATE: '/users/:id/deactivate',
      ACTIVATE: '/users/:id/activate',
      RESET_PASSWORD: '/users/:id/reset-password', // Admin reset password
    },
    ACTIVITY: {
      LIST: '/activities',
      DETAIL: '/activities/:id',
      CREATE: '/activities',
      UPDATE: '/activities/:id',
      DELETE: '/activities/:id',
    },
    RESIDENT: {
      LIST: '/resident',
      DETAIL: '/resident/:id',
      CREATE: '/resident',
      UPDATE: '/resident/:id',
      DELETE: '/resident/:id',
    },
    STAFF: {
      LIST: '/staff',
      DETAIL: '/staff/:id',
      CREATE: '/staff',
      UPDATE: '/staff/:id',
      DELETE: '/staff/:id',
    },
    FAMILY: {
      LIST: '/family',
      DETAIL: '/family/:id',
      CREATE: '/family',
      UPDATE: '/family/:id',
      DELETE: '/family/:id',
    },
    MEDICATION: {
      LIST: '/medication',
      DETAIL: '/medication/:id',
      CREATE: '/medication',
      UPDATE: '/medication/:id',
      DELETE: '/medication/:id',
    },
    BILLING: {
      LIST: '/billing',
      DETAIL: '/billing/:id',
      CREATE: '/billing',
      UPDATE: '/billing/:id',
      DELETE: '/billing/:id',
    },
    NOTIFICATION: {
      LIST: '/notification',
      DETAIL: '/notification/:id',
      CREATE: '/notification',
      UPDATE: '/notification/:id',
      DELETE: '/notification/:id',
      MARK_READ: '/notification/:id/read',
    },
  },
  
  // HTTP Status Codes
  STATUS_CODES: {
    SUCCESS: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    INTERNAL_SERVER_ERROR: 500,
  },
  
  // Request Timeout (ms)
  TIMEOUT: 10000,
};

// Helper function để build URL với parameters
export const buildUrl = (endpoint, params = {}) => {
  let url = endpoint;
  
  // Replace parameters in URL
  Object.keys(params).forEach(key => {
    url = url.replace(`:${key}`, params[key]);
  });
  
  return url;
}; 