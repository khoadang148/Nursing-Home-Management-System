import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import theme
import { COLORS } from '../constants/theme';

// Import screens and navigators
import DashboardNavigator from './DashboardNavigator';
import ResidentNavigator from './ResidentNavigator';
import ActivityNavigator from './ActivityNavigator';
import TasksNavigator from './TasksNavigator';
import ProfileNavigator from './ProfileNavigator';
import MedicationNavigator from './MedicationNavigator';
import MobileOptimizedNavigator from './MobileOptimizedNavigator';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Notifications stack
const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManHinhThongBao" component={NotificationsScreen} />
    <Stack.Screen name="ChiTietThongBao" component={NotificationDetailScreen} />
  </Stack.Navigator>
);

// Staff Navigator - original navigation for staff roles
const StaffNavigator = () => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const insets = useSafeAreaInsets();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { height: -2, width: 0 },
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TongQuan"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Tổng Quan',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="dashboard" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="CuDan"
        component={ResidentNavigator}
        options={{
          tabBarLabel: 'Cư Dân',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome5 name="user-injured" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NhiemVu"
        component={TasksNavigator}
        options={{
          tabBarLabel: 'Nhiệm Vụ',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="assignment" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HoatDong"
        component={ActivityNavigator}
        options={{
          tabBarLabel: 'Hoạt Động',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Thuoc"
        component={MedicationNavigator}
        options={{
          tabBarLabel: 'Thuốc',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ThongBao"
        component={NotificationsStack}
        options={{
          tabBarLabel: 'Thông Báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: COLORS.error },
        }}
      />
      <Tab.Screen
        name="HoSo"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Hồ Sơ',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const MainNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Use MobileOptimizedNavigator for all users
  return <MobileOptimizedNavigator />;
};

export default MainNavigator; 