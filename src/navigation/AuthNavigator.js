import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import OtpLoginScreen from '../screens/auth/OtpLoginScreen';

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
        name="Register" 
        component={RegisterScreen} 
        options={{title: 'Đăng Ký'}} 
      />
      <Stack.Screen 
        name="QuenMatKhau" 
        component={ForgotPasswordScreen} 
        options={{title: 'Quên Mật Khẩu'}} 
      />
      <Stack.Screen 
        name="OtpLogin" 
        component={OtpLoginScreen} 
        options={{title: 'Đăng Nhập OTP'}} 
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator; 