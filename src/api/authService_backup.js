import apiService from './apiService';
import { AUTH_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { staff, familyMembers } from './mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Mock user database for authentication
const mockUsers = [
  ...staff.map(staffMember => ({
    id: staffMember._id, // dùng _id cho thống nhất với DB
    email: staffMember.email,
    password: staffMember.password, // lấy đúng password từ mockData.js
    full_name: staffMember.full_name,
    role: staffMember.role,
    photo: staffMember.avatar,
    phone: staffMember.phone,
    position: staffMember.position,
    qualification: staffMember.qualification,
    join_date: staffMember.join_date,
    status: staffMember.status,
    notes: staffMember.notes,
    username: staffMember.username,
    // Có thể bổ sung các trường khác nếu cần
  })),
  ...familyMembers.map(familyMember => ({
    id: familyMember.id,
    email: familyMember.email,
    password: familyMember.password,
    full_name: familyMember.full_name,
    firstName: familyMember.full_name.split(' ').slice(-1)[0], // Last name
    lastName: familyMember.full_name.split(' ').slice(0, -1).join(' '), // First and middle names
    role: 'family',
    photo: familyMember.photo,
    relationship: familyMember.relationship,
    residentId: familyMember.residentIds?.[0], // For backward compatibility
    residentIds: familyMember.residentIds,
    phone: familyMember.phone,
    address: familyMember.address,
    username: familyMember.username,
    notes: familyMember.notes,
  }))
];

// Authentication service functions
const authService = {
  // Login user
  login: async (email, password) => {
    await simulateNetworkDelay();
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user || user.password !== password) {
      return { 
        data: null, 
        success: false, 
        error: 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.' 
      };
    }
    
    // Generate mock tokens
    const authToken = `mock-auth-token-${user.id}`;
    const refreshToken = `mock-refresh-token-${user.id}`;
    
    // Store tokens in AsyncStorage
    await AsyncStorage.setItem('authToken', authToken);
    await AsyncStorage.setItem('refreshToken', refreshToken);
    await AsyncStorage.setItem('userData', JSON.stringify({
      id: user.id,
      full_name: user.full_name,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      avatar: user.photo, // đồng bộ cho UI
      phone: user.phone,
      // Staff-specific fields
      position: user.position,
      qualification: user.qualification,
      join_date: user.join_date,
      status: user.status,
      notes: user.notes,
      username: user.username,
      // Family-specific fields
      relationship: user.relationship,
      residentId: user.residentId,
      residentIds: user.residentIds,
      address: user.address,
      // Admin-specific fields
      is_super_admin: user.is_super_admin,
    }));
    
    return {
      data: {
        user: {
          id: user.id,
          full_name: user.full_name,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          avatar: user.photo, // đồng bộ cho UI
          phone: user.phone,
          // Staff-specific fields
          position: user.position,
          qualification: user.qualification,
          join_date: user.join_date,
          status: user.status,
          notes: user.notes,
          username: user.username,
          // Family-specific fields
          relationship: user.relationship,
          residentId: user.residentId,
          residentIds: user.residentIds,
          address: user.address,
          // Admin-specific fields
          is_super_admin: user.is_super_admin,
        },
        tokens: {
          authToken,
          refreshToken,
        },
      },
      success: true,
    };
  },
  
  // Register user (simplified)
  register: async (userData) => {
    await simulateNetworkDelay();
    
    // Check if email already exists
    const existingUser = mockUsers.find(u => u.email === userData.email);
    if (existingUser) {
      return { 
        data: null, 
        success: false, 
        error: 'Email này đã được sử dụng. Vui lòng chọn email khác.' 
      };
    }
    
    // Create new user
    const newUser = {
      id: (mockUsers.length + 1).toString(),
      ...userData,
    };
    
    return {
      data: {
        user: {
          id: newUser.id,
          full_name: newUser.full_name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          role: newUser.role,
        },
      },
      success: true,
    };
  },
  
  // Logout user
  logout: async () => {
    try {
      await simulateNetworkDelay();
      
      // Remove tokens from AsyncStorage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('userData');
      
      return { data: null, success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { 
        data: null, 
        success: false, 
        error: 'Không thể đăng xuất. Vui lòng thử lại sau.' 
      };
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: async () => {
    const authToken = await AsyncStorage.getItem('authToken');
    const userData = await AsyncStorage.getItem('userData');
    
    if (authToken && userData) {
      return { data: JSON.parse(userData), success: true };
    }
    
    return { data: null, success: false };
  },
  
  // Refresh token
  refreshToken: async () => {
    await simulateNetworkDelay();
    
    const refreshToken = await AsyncStorage.getItem('refreshToken');
    const userData = await AsyncStorage.getItem('userData');
    
    if (!refreshToken || !userData) {
      return { 
        data: null, 
        success: false, 
        error: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' 
      };
    }
    
    // Generate new auth token
    const parsedUserData = JSON.parse(userData);
    const newAuthToken = `mock-auth-token-${parsedUserData.id}-${Date.now()}`;
    
    // Store new token
    await AsyncStorage.setItem('authToken', newAuthToken);
    
    return {
      data: {
        authToken: newAuthToken,
      },
      success: true,
    };
  },
  
  // Reset password (simplified)
  resetPassword: async (email) => {
    await simulateNetworkDelay();
    
    const user = mockUsers.find(u => u.email === email);
    
    if (!user) {
      return { 
        data: null, 
        success: false, 
        error: 'Không tìm thấy người dùng với email này.' 
      };
    }
    
    // In a real app, this would send an email with reset instructions
    
    return {
      data: { message: 'Password reset link sent to email' },
      success: true,
    };
  },
  
  // Update password (simplified)
  updatePassword: async (userId, currentPassword, newPassword) => {
    await simulateNetworkDelay();
    
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    
    if (userIndex === -1 || mockUsers[userIndex].password !== currentPassword) {
      return { 
        data: null, 
        success: false, 
        error: 'Mật khẩu hiện tại không đúng.' 
      };
    }
    
    // Update password (in a real app, this would hash the password)
    mockUsers[userIndex].password = newPassword;
    
    return {
      data: { message: 'Password updated successfully' },
      success: true,
    };
  },
};

// For real API implementation (when backend is ready)
const realAuthService = {
  login: (email, password) => apiService.post(AUTH_ENDPOINTS.login, { email, password }),
  register: (userData) => apiService.post(AUTH_ENDPOINTS.register, userData),
  logout: () => apiService.post(AUTH_ENDPOINTS.logout),
  refreshToken: (token) => apiService.post(AUTH_ENDPOINTS.refreshToken, { token }),
  resetPassword: (email) => apiService.post(AUTH_ENDPOINTS.forgotPassword, { email }),
  updatePassword: (data) => apiService.post(AUTH_ENDPOINTS.resetPassword, data),
};

// Export the mock service for now
export default authService; 