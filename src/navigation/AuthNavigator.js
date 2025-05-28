import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DangNhap"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="DangNhap" 
        component={LoginScreen} 
        options={{title: 'Đăng Nhập'}} 
      />
      <Stack.Screen 
        name="QuenMatKhau" 
        component={ForgotPasswordScreen} 
        options={{title: 'Quên Mật Khẩu'}} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 