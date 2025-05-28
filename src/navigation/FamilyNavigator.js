import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Import theme
import { COLORS } from '../constants/theme';

// Import screens
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import FamilyResidentScreen from '../screens/family/FamilyResidentScreen';
import FamilyCommunicationScreen from '../screens/family/FamilyCommunicationScreen';
import FamilyVisitScreen from '../screens/family/FamilyVisitScreen';
import FamilyPhotoGalleryScreen from '../screens/family/FamilyPhotoGalleryScreen';
import FamilyNotificationsScreen from '../screens/family/FamilyNotificationsScreen';
import FamilyProfileScreen from '../screens/family/FamilyProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each section
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyHomeScreen" component={FamilyHomeScreen} />
  </Stack.Navigator>
);

const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyResidentScreen" component={FamilyResidentScreen} />
  </Stack.Navigator>
);

const CommunicationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyCommunicationScreen" component={FamilyCommunicationScreen} />
  </Stack.Navigator>
);

const VisitStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyVisitScreen" component={FamilyVisitScreen} />
  </Stack.Navigator>
);

const GalleryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyPhotoGalleryScreen" component={FamilyPhotoGalleryScreen} />
  </Stack.Navigator>
);

const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyNotificationsScreen" component={FamilyNotificationsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyProfileScreen" component={FamilyProfileScreen} />
  </Stack.Navigator>
);

const FamilyNavigator = () => {
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
        name="TrangChu"
        component={HomeStack}
        options={{
          tabBarLabel: 'Trang Chủ',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NguoiThan"
        component={ResidentStack}
        options={{
          tabBarLabel: 'Người Thân',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TinNhan"
        component={CommunicationStack}
        options={{
          tabBarLabel: 'Tin Nhắn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="LichTham"
        component={VisitStack}
        options={{
          tabBarLabel: 'Lịch Thăm',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="HinhAnh"
        component={GalleryStack}
        options={{
          tabBarLabel: 'Hình Ảnh',
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
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
        component={ProfileStack}
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

export default FamilyNavigator; 