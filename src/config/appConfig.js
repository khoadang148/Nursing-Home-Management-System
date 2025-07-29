// App Configuration - Central config file
// Tất cả cấu hình ứng dụng sẽ được quản lý từ đây

// API Configuration
export const API_CONFIG = {
  // Base URL cho backend thực tế
  // Thay đổi URL và port theo backend của bạn
  // Sử dụng IP thay vì localhost cho React Native
  
  // IP thực tế từ log - WiFi network
  BASE_URL: 'http://192.168.2.5:8000', // IP WiFi thực tế từ log
  
  // Các IP khác cho các môi trường khác nhau (uncomment để sử dụng)
  // BASE_URL: 'http://192.168.56.1:8000', // IP VirtualBox/Hyper-V
  // BASE_URL: 'http://192.168.1.15:8000', // IP WiFi cũ
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
      LIST: '/residents',
      DETAIL: '/residents/:id',
      CREATE: '/residents',
      UPDATE: '/residents/:id',
      DELETE: '/residents/:id',
      BY_FAMILY_MEMBER: '/residents/family-member/:familyMemberId',
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

// App Configuration
export const APP_CONFIG = {
  // App Info
  APP_NAME: 'Nursing Home Management System',
  APP_VERSION: '1.0.0',
  
  // Default Values
  DEFAULT_AVATAR: 'https://randomuser.me/api/portraits/men/1.jpg',
  DEFAULT_IMAGE: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  
  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  
  // File Upload
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Cache
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
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

// Helper function để lấy API Base URL với fallback
export const getApiBaseUrl = () => {
  if (typeof API_CONFIG?.BASE_URL === 'string' && API_CONFIG.BASE_URL.startsWith('http')) {
    return API_CONFIG.BASE_URL;
  }
  console.warn('[AppConfig] API_BASE_URL is undefined, fallback to default');
  return 'http://192.168.2.5:8000'; // Fallback URL - cập nhật theo IP thực tế
};

// Helper function để format avatar/image URL
export const getImageUri = (imagePath, type = 'avatar') => {
  if (!imagePath) {
    // Trả về default avatar khi không có imagePath
    return APP_CONFIG.DEFAULT_AVATAR;
  }
  
  if (imagePath.startsWith('http') || imagePath.startsWith('https')) {
    return imagePath;
  }
  
  // Chuyển toàn bộ \\ hoặc \ thành /
  const cleanPath = imagePath.replace(/\\/g, '/').replace(/\\/g, '/').replace(/\//g, '/').replace(/^\/+|^\/+/, '');
  const baseUrl = getApiBaseUrl();
  const uri = `${baseUrl}/${cleanPath}`;
  
  console.log(`[AppConfig] ${type} URI:`, baseUrl, 'imagePath:', imagePath, 'cleanPath:', cleanPath, 'uri:', uri);
  return uri;
};

// Export default config
export default {
  API_CONFIG,
  APP_CONFIG,
  buildUrl,
  getApiBaseUrl,
  getImageUri,
}; 