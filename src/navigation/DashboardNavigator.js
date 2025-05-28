import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';

const Stack = createStackNavigator();

const DashboardNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ManHinhTongQuan"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ManHinhTongQuan" component={DashboardScreen} />
      <Stack.Screen name="ChiTietThongBao" component={NotificationDetailScreen} />
    </Stack.Navigator>
  );
};

export default DashboardNavigator; 