import apiService from './apiService';
import { AUTH_ENDPOINTS } from '../constants/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { staff } from './mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Mock user database for authentication
const mockUsers = staff.map(staffMember => ({
  id: staffMember.id,
  email: staffMember.email,
  password: 'password123', // In a real app, this would be hashed
  firstName: staffMember.firstName,
  lastName: staffMember.lastName,
  role: staffMember.role,
  photo: staffMember.photo,
}));

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
        error: 'Invalid email or password' 
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
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      photo: user.photo,
    }));
    
    return {
      data: {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          photo: user.photo,
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
        error: 'Email already in use' 
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
    await simulateNetworkDelay();
    
    // Remove tokens from AsyncStorage
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('refreshToken');
    await AsyncStorage.removeItem('userData');
    
    return { data: null, success: true };
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
        error: 'No refresh token available' 
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
        error: 'User not found' 
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
        error: 'Invalid current password' 
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