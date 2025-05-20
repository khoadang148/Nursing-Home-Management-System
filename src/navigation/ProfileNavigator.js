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
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="StaffDirectory" component={StaffDirectoryScreen} />
      <Stack.Screen name="StaffDetails" component={StaffDetailsScreen} />
    </Stack.Navigator>
  );
};

export default ProfileNavigator; 