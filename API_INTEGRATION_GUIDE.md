# 🚀 API Integration Guide - Nursing Home Management System

## ✅ **API Configuration đã hoàn thành**

### **1. Base URL & Endpoints**
```javascript
// API Config: src/api/config/apiConfig.js
BASE_URL: 'http://localhost:8000'  // Không có /api prefix
ENDPOINTS: {
  AUTH: {
    LOGIN: '/auth/login',           // ✅ Hoạt động
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    UPDATE_PROFILE: '/auth/profile',
    RESET_PASSWORD: '/auth/reset-password',
    FORGOT_PASSWORD: '/auth/forgot-password',
  },
  // Các endpoint khác...
}
```

### **2. Response Format thực tế**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "68766d6dd97c57c3af8755c9",
    "email": "bao@gmail.com",
    "username": "family1",
    "full_name": "Trần Lê Chi Bảo",
    "role": "family"
  }
}
```

### **3. Test Credentials**
```javascript
const testCredentials = {
  email: 'bao@gmail.com',
  password: '123456'
};
```

## 🔧 **Files đã được cập nhật**

### **API Configuration**
- ✅ `src/api/config/apiConfig.js` - Cấu hình endpoints
- ✅ `src/api/config/axiosConfig.js` - Axios với interceptors
- ✅ `src/api/services/authService.js` - Service cho authentication
- ✅ `src/redux/slices/authSlice.js` - Redux slice với API thực tế

### **Test Files**
- ✅ `test_api_simple.js` - Test API cơ bản
- ✅ `test_api_endpoints.js` - Test tất cả endpoints
- ✅ `test_final_api.js` - Test cuối cùng
- ✅ `test_redux_integration.js` - Test Redux integration

## 🎯 **Kết quả Test**

### **✅ API Login - HOẠT ĐỘNG**
```
🌐 URL: http://localhost:8000/auth/login
📊 Status: 201 (Created)
🎉 Response: Access token + User info
```

### **❌ Các endpoint khác - CẦN KIỂM TRA**
- `/auth/profile` - Cần authentication
- `/activity` - 404 (có thể chưa implement)
- `/resident` - 404 (có thể chưa implement)
- `/staff` - 404 (có thể chưa implement)
- `/family` - 404 (có thể chưa implement)
- `/medication` - 404 (có thể chưa implement)
- `/billing` - 404 (có thể chưa implement)
- `/notification` - 404 (có thể chưa implement)

## 📋 **Bước tiếp theo**

### **1. Test trong App thực tế**
```javascript
// Trong LoginScreen.js
import { useDispatch } from 'react-redux';
import { login } from '../redux/slices/authSlice';

const handleLogin = async () => {
  try {
    const result = await dispatch(login({
      email: 'bao@gmail.com',
      password: '123456'
    }));
    
    if (result.meta.requestStatus === 'fulfilled') {
      // Login thành công
      navigation.navigate('Dashboard');
    }
  } catch (error) {
    // Xử lý lỗi
  }
};
```

### **2. Tạo Services cho các endpoint khác**
```javascript
// src/api/services/activityService.js
// src/api/services/residentService.js
// src/api/services/staffService.js
// src/api/services/familyService.js
// src/api/services/medicationService.js
// src/api/services/billingService.js
// src/api/services/notificationService.js
```

### **3. Cập nhật Redux Slices**
```javascript
// src/redux/slices/activitySlice.js
// src/redux/slices/residentSlice.js
// src/redux/slices/staffSlice.js
// src/redux/slices/familySlice.js
// src/redux/slices/medicationSlice.js
// src/redux/slices/billingSlice.js
// src/redux/slices/notificationSlice.js
```

## 🔍 **Swagger Documentation**
- **URL:** http://localhost:8000/api
- **Status:** ✅ Accessible
- **Content-Type:** text/html; charset=utf-8

## 🛠️ **Troubleshooting**

### **Lỗi thường gặp:**
1. **404 Not Found** - Kiểm tra endpoint path
2. **401 Unauthorized** - Kiểm tra token authentication
3. **Network Error** - Kiểm tra backend server
4. **CORS Error** - Kiểm tra CORS configuration

### **Debug Commands:**
```bash
# Test API connection
node test_api_simple.js

# Test all endpoints
node test_api_endpoints.js

# Test Redux integration
node test_redux_integration.js
```

## 📞 **Support**
- **Backend URL:** http://localhost:8000
- **Swagger:** http://localhost:8000/api
- **Test Credentials:** bao@gmail.com / 123456

---

**🎉 API Integration đã sẵn sàng cho development!** 