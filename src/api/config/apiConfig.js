// API Configuration - Backward compatibility
// Import từ central config để đảm bảo tương thích ngược
import { API_CONFIG, APP_CONFIG, buildUrl, getApiBaseUrl, getImageUri } from '../../config/appConfig';

// Re-export để giữ backward compatibility
export { API_CONFIG, APP_CONFIG, buildUrl, getApiBaseUrl, getImageUri };

// Export default để giữ backward compatibility
export default {
  API_CONFIG,
  APP_CONFIG,
  buildUrl,
  getApiBaseUrl,
  getImageUri,
}; 