import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ProfileScreen from '../screens/profile/ProfileScreen.js';
import EditProfileScreen from '../screens/profile/EditProfileScreen.js';
import SettingsScreen from '../screens/profile/SettingsScreen.js';
import StaffDirectoryScreen from '../screens/profile/StaffDirectoryScreen.js';
import StaffDetailsScreen from '../screens/profile/StaffDetailsScreen.js';

const Stack = createStackNavigator();

const ProfileNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="HoSoChinh" component={ProfileScreen} />
      <Stack.Screen name="ChinhSuaHoSo" component={EditProfileScreen} />
      <Stack.Screen name="CaiDat" component={SettingsScreen} />
      <Stack.Screen name="DanhBaNhanVien" component={StaffDirectoryScreen} />
      <Stack.Screen name="ChiTietNhanVien" component={StaffDetailsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator; 