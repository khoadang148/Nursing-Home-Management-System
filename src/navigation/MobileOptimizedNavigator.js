import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useResponsive from '../hooks/useResponsive';
import { COLORS } from '../constants/theme';
import { scale, normalize } from '../constants/dimensions';

// Import screens and navigators
import DashboardNavigator from './DashboardNavigator';
import ResidentNavigator from './ResidentNavigator';
import TasksNavigator from './TasksNavigator';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';
import StaffMenuScreen from '../screens/profile/StaffMenuScreen';
import CarePlanSelectionScreen from '../screens/residents/CarePlanSelectionScreen';
import CarePlanAssignmentsScreen from '../screens/residents/CarePlanAssignmentsScreen';
import FamilyContactScreen from '../screens/profile/FamilyContactScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import SettingsScreen from '../screens/profile/SettingsScreen';
import StaffDirectoryScreen from '../screens/profile/StaffDirectoryScreen';
import StaffDetailsScreen from '../screens/profile/StaffDetailsScreen';
import ActivityNavigator from './ActivityNavigator';
import FamilyStackNavigator from './FamilyNavigator';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Notifications stack
const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManHinhThongBao" component={NotificationsScreen} />
    <Stack.Screen name="ChiTietThongBao" component={NotificationDetailScreen} />
  </Stack.Navigator>
);

// Staff Tab Navigator
const MobileStaffTabs = () => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const insets = useSafeAreaInsets();
  const { isTablet } = useResponsive();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingTop: scale(8),
          paddingBottom: Math.max(insets.bottom, scale(8)),
          height: (isTablet ? scale(70) : scale(60)) + Math.max(insets.bottom, scale(8)),
          elevation: 8,
          shadowOpacity: 0.1,
          shadowRadius: scale(4),
          shadowOffset: { height: scale(-2), width: 0 },
        },
        tabBarLabelStyle: {
          fontSize: normalize(isTablet ? 12 : 11),
          fontWeight: '600',
          marginTop: scale(4),
        },
        tabBarIconStyle: {
          marginBottom: scale(2),
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
        name="Menu"
        component={StaffMenuScreen}
        options={{
          tabBarLabel: 'Menu',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="menu" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Staff Main Stack
const StaffMainStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="MainTabs" component={MobileStaffTabs} />
    <Stack.Screen name="ChonGoiDichVu" component={CarePlanSelectionScreen} />
    <Stack.Screen name="GoiDichVuDaDangKy" component={CarePlanAssignmentsScreen} />
    <Stack.Screen name="LienHeNguoiNha" component={FamilyContactScreen} />
    <Stack.Screen name="HoSo" component={ProfileScreen} />
    <Stack.Screen name="ChinhSuaHoSo" component={EditProfileScreen} />
    <Stack.Screen name="CaiDat" component={SettingsScreen} />
    <Stack.Screen name="DanhBaNhanVien" component={StaffDirectoryScreen} />
    <Stack.Screen name="ChiTietNhanVien" component={StaffDetailsScreen} />
    <Stack.Screen name="HoatDong" component={ActivityNavigator} />
  </Stack.Navigator>
);

// Family Main Stack - Use the new FamilyStackNavigator directly
const FamilyMainStack = () => <FamilyStackNavigator />;

const MobileOptimizedNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Check user role and return appropriate navigator
  if (user && user.role === 'family') {
    return <FamilyMainStack />;
  }
  
  // Default to staff navigator
  return <StaffMainStack />;
};

export default MobileOptimizedNavigator; 