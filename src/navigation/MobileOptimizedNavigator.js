import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import theme and responsive utilities
import { COLORS } from '../constants/theme';
import { scale, normalize, TAB_BAR_HEIGHT } from '../constants/dimensions';
import useResponsive from '../hooks/useResponsive';

// Import screens and navigators
import DashboardNavigator from './DashboardNavigator';
import ResidentNavigator from './ResidentNavigator';
import ActivityNavigator from './ActivityNavigator';
import TasksNavigator from './TasksNavigator';
import ProfileNavigator from './ProfileNavigator';
import MedicationNavigator from './MedicationNavigator';
import FamilyNavigator from './FamilyNavigator';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';
import FamilyBillStack from './FamilyBillStack';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Notifications stack
const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="ManHinhThongBao" component={NotificationsScreen} />
    <Stack.Screen name="ChiTietThongBao" component={NotificationDetailScreen} />
  </Stack.Navigator>
);

// Mobile-optimized Staff Navigator với chỉ 4 tabs chính
const MobileStaffTabs = () => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  const insets = useSafeAreaInsets();
  const { isTablet, isLandscape } = useResponsive();
  
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
    </Tab.Navigator>
  );
};

// Drawer Navigator cho các chức năng phụ
const StaffDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: 280,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen
        name="TabsChính"
        component={MobileStaffTabs}
        options={{
          title: 'Trang Chủ',
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="HoatDong"
        component={ActivityNavigator}
        options={{
          title: 'Hoạt Động',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Thuoc"
        component={MedicationNavigator}
        options={{
          title: 'Quản Lý Thuốc',
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="pill" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="HoSo"
        component={ProfileNavigator}
        options={{
          title: 'Hồ Sơ Cá Nhân',
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

// Mobile-optimized Family Navigator với 4 tabs chính
const MobileFamilyTabs = () => {
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
          fontSize: 11,
          fontWeight: '600',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginBottom: 2,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TrangChu"
        component={require('../screens/family/FamilyHomeScreen').default}
        options={{
          tabBarLabel: 'Trang Chủ',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NguoiThan"
        component={require('../screens/family/FamilyResidentScreen').default}
        options={{
          tabBarLabel: 'Người Thân',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TinNhan"
        component={require('../screens/family/FamilyCommunicationScreen').default}
        options={{
          tabBarLabel: 'Tin Nhắn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HoaDon"
        component={FamilyBillStack}
        options={{
          tabBarLabel: 'Hóa Đơn',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ThongBao"
        component={require('../screens/family/FamilyNotificationsScreen').default}
        options={{
          tabBarLabel: 'Thông Báo',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: COLORS.error },
        }}
      />
    </Tab.Navigator>
  );
};

// Family Drawer Navigator
const FamilyDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        drawerStyle: {
          backgroundColor: COLORS.surface,
          width: 280,
        },
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textSecondary,
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
      }}
    >
      <Drawer.Screen
        name="TabsChính"
        component={MobileFamilyTabs}
        options={{
          title: 'Trang Chủ',
          headerShown: false,
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="LichTham"
        component={require('../screens/family/FamilyVisitScreen').default}
        options={{
          title: 'Lịch Thăm Viếng',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="HinhAnh"
        component={require('../screens/family/FamilyPhotoGalleryScreen').default}
        options={{
          title: 'Thư Viện Ảnh',
          drawerIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="HoSo"
        component={require('../screens/family/FamilyProfileScreen').default}
        options={{
          title: 'Hồ Sơ Cá Nhân',
          drawerIcon: ({ color, size }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
};

const MobileOptimizedNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Choose navigator based on user role
  if (user?.role === 'family') {
    return <FamilyDrawerNavigator />;
  }
  
  // Default to staff navigator for all other roles
  return <StaffDrawerNavigator />;
};

export default MobileOptimizedNavigator; 