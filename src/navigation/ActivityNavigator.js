import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ActivityListScreen from '../screens/activities/ActivityListScreen';
import ActivityDetailsScreen from '../screens/activities/ActivityDetailsScreen';
import CreateActivityScreen from '../screens/activities/CreateActivityScreen';
import ActivityCalendarScreen from '../screens/activities/ActivityCalendarScreen';
import RecommendActivityScreen from '../screens/activities/RecommendActivityScreen';

const Stack = createStackNavigator();

const ActivityNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="DanhSachHoatDong" component={ActivityListScreen} />
      <Stack.Screen name="ChiTietHoatDong" component={ActivityDetailsScreen} />
      <Stack.Screen name="TaoHoatDong" component={CreateActivityScreen} />
      <Stack.Screen name="LichHoatDong" component={ActivityCalendarScreen} />
      <Stack.Screen name="DeXuatHoatDong" component={RecommendActivityScreen} />
    </Stack.Navigator>
  );
};

export default ActivityNavigator; 