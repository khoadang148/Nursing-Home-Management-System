# Central Configuration System

## Tổng quan
Hệ thống cấu hình trung tâm giúp quản lý tất cả cấu hình ứng dụng từ một nơi duy nhất, tránh phải cập nhật nhiều file khi thay đổi cấu hình.

## Cấu trúc

### 1. `appConfig.js` - File cấu hình chính
Chứa tất cả cấu hình ứng dụng:
- **API_CONFIG**: Cấu hình API endpoints, base URL, timeout
- **APP_CONFIG**: Cấu hình ứng dụng, default values, pagination
- **Helper functions**: Các hàm tiện ích

### 2. `apiConfig.js` - File tương thích ngược
Import và re-export từ `appConfig.js` để đảm bảo tương thích với code cũ.

## Cách sử dụng

### Import cấu hình
```javascript
// Import toàn bộ config
import { API_CONFIG, APP_CONFIG, getImageUri, getApiBaseUrl } from '../../config/appConfig';

// Hoặc import từ file cũ (backward compatibility)
import { API_CONFIG } from '../../api/config/apiConfig';
```

### Sử dụng API Base URL
```javascript
import { getApiBaseUrl } from '../../config/appConfig';

const baseUrl = getApiBaseUrl(); // Tự động lấy từ config với fallback
```

### Sử dụng Image/Avatar helper
```javascript
import { getImageUri } from '../../config/appConfig';

// Format avatar
const avatarUri = getImageUri(user.avatar, 'avatar');

// Format image
const imageUri = getImageUri(photo.file_path, 'image');
```

### Sử dụng default values
```javascript
import { APP_CONFIG } from '../../config/appConfig';

const defaultAvatar = APP_CONFIG.DEFAULT_AVATAR;
const defaultImage = APP_CONFIG.DEFAULT_IMAGE;
```

## Thay đổi cấu hình

### Thay đổi API Base URL
Chỉ cần sửa trong file `appConfig.js`:
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://your-new-ip:8000', // Thay đổi ở đây
  // ... other config
};
```

### Thay đổi default values
```javascript
export const APP_CONFIG = {
  DEFAULT_AVATAR: 'https://your-new-avatar-url.jpg',
  DEFAULT_IMAGE: 'https://your-new-image-url.jpg',
  // ... other config
};
```

## Lợi ích

1. **Quản lý tập trung**: Tất cả cấu hình ở một nơi
2. **Dễ bảo trì**: Chỉ cần sửa một file khi thay đổi cấu hình
3. **Tương thích ngược**: Code cũ vẫn hoạt động bình thường
4. **Type safety**: Có thể thêm TypeScript để type checking
5. **Environment support**: Dễ dàng mở rộng cho nhiều môi trường

## Mở rộng

### Thêm environment variables
```javascript
// Có thể thêm support cho .env file
const API_BASE_URL = process.env.API_BASE_URL || 'http://192.168.1.15:8000';

export const API_CONFIG = {
  BASE_URL: API_BASE_URL,
  // ...
};
```

### Thêm Redux integration
```javascript
// Có thể lưu config trong Redux store
import { useSelector } from 'react-redux';

export const getApiBaseUrl = () => {
  const config = useSelector(state => state.config);
  return config?.apiBaseUrl || 'http://192.168.1.15:8000';
};
``` 