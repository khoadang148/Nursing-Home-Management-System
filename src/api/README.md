# API Configuration Guide

## 📋 **Cấu hình Backend**

### **1. Cập nhật BASE_URL**
Trong file `src/api/config/apiConfig.js`, cập nhật `BASE_URL`:

```javascript
BASE_URL: 'http://localhost:3000/api', // Thay đổi theo backend của bạn
```

### **2. Các URL phổ biến:**
- **Local development:** `http://localhost:3000/api`
- **Local network:** `http://192.168.1.100:3000/api`
- **Production:** `https://your-domain.com/api`

## 🔧 **Cấu trúc API**

### **Services đã tạo:**
- ✅ **authService** - Authentication (login, register, logout)
- ✅ **activityService** - Activities management
- 🔄 **residentService** - Residents management (sẽ tạo)
- 🔄 **userService** - Users management (sẽ tạo)
- 🔄 **visitService** - Visits management (sẽ tạo)

### **Response Format:**
```javascript
{
  success: true/false,
  data: {...}, // Dữ liệu trả về
  message: "Thông báo", // Thông báo thành công
  error: "Lỗi" // Thông báo lỗi (khi success = false)
}
```

## 🚀 **Cách sử dụng**

### **Trong Component:**
```javascript
import { authService, activityService } from '../../api/services';

// Login
const loginResult = await authService.login(email, password);
if (loginResult.success) {
  // Xử lý thành công
} else {
  // Xử lý lỗi
  console.error(loginResult.error);
}
```

### **Trong Redux Slice:**
```javascript
import { authService } from '../../api/services';

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    const response = await authService.login(email, password);
    if (!response.success) {
      return rejectWithValue(response.error);
    }
    return response.data;
  }
);
```

## 🔐 **Authentication**

### **Token Management:**
- **Access Token:** Tự động thêm vào header
- **Refresh Token:** Tự động refresh khi token hết hạn
- **Storage:** AsyncStorage cho persistence

### **Headers:**
```javascript
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 📱 **Testing**

### **1. Kiểm tra kết nối:**
```javascript
// Test API connection
const response = await authService.isAuthenticated();
console.log('API Status:', response);
```

### **2. Test login:**
```javascript
// Test login với credentials thực
const loginResult = await authService.login('test@example.com', 'password');
console.log('Login Result:', loginResult);
```

## 🛠 **Troubleshooting**

### **Lỗi thường gặp:**
1. **CORS Error:** Kiểm tra backend có cho phép mobile app không
2. **Network Error:** Kiểm tra BASE_URL và kết nối mạng
3. **401 Unauthorized:** Kiểm tra token và authentication
4. **404 Not Found:** Kiểm tra endpoint URL

### **Debug:**
```javascript
// Bật debug mode trong axiosConfig.js
console.log('API Request:', config);
console.log('API Response:', response);
```

## 📝 **Next Steps**

1. **Cập nhật BASE_URL** theo backend của bạn
2. **Test API connection** với endpoint đầu tiên
3. **Tạo services tiếp theo** (resident, user, visit, etc.)
4. **Cập nhật Redux slices** để sử dụng real API
5. **Test toàn bộ flow** từ login đến logout

## 🔄 **Migration từ Mock Data**

### **Đã hoàn thành:**
- ✅ **authService** - Chuyển từ mock sang real API
- ✅ **activityService** - Sẵn sàng cho real API

### **Cần làm:**
- 🔄 **Cập nhật Redux slices** khác
- 🔄 **Tạo services** cho các module khác
- 🔄 **Test integration** với backend thực tế 