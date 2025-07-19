import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useResponsive from '../hooks/useResponsive';
import { COLORS } from '../constants/theme';
import { scale, normalize } from '../constants/dimensions';


// Import family screens
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import FamilyResidentScreen from '../screens/family/FamilyResidentScreen';
import FamilyResidentDetailScreen from '../screens/family/FamilyResidentDetailScreen';
import FamilyPhotoGalleryScreen from '../screens/family/FamilyPhotoGalleryScreen';
import FamilyNotificationsScreen from '../screens/family/FamilyNotificationsScreen';
import FamilyCommunicationScreen from '../screens/family/FamilyCommunicationScreen';
import FamilyVisitScreen from '../screens/family/FamilyVisitScreen';
import FamilyProfileScreen from '../screens/family/FamilyProfileScreen';
import BillingScreen from '../screens/family/BillingScreen';
import BillDetailScreen from '../screens/family/BillDetailScreen';
import PaymentHistoryScreen from '../screens/family/PaymentHistoryScreen';
import ServicePackageScreen from '../screens/family/ServicePackageScreen';
import ServicePackageDetailScreen from '../screens/family/ServicePackageDetailScreen';
import SupportScreen from '../screens/family/SupportScreen';
import ChangePasswordScreen from '../screens/family/ChangePasswordScreen';
import TermsOfServiceScreen from '../screens/family/TermsOfServiceScreen';
import FamilyMenuScreen from '../screens/family/FamilyMenuScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Family Menu Screen Component - Now imported from separate file

// Family Stack Navigator
const FamilyStackNavigator = () => {
  return (
    <Stack.Navigator 
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyleInterpolator: ({ current, layouts }) => {
          return {
            cardStyle: {
              transform: [
                {
                  translateX: current.progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [layouts.screen.width, 0],
                  }),
                },
              ],
            },
          };
        },
        transitionSpec: {
          open: {
            animation: 'timing',
            config: {
              duration: 300,
            },
          },
          close: {
            animation: 'timing',
            config: {
              duration: 250,
            },
          },
        },
      }}
    >
      <Stack.Screen 
        name="TabsChính"
        component={FamilyTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LichTham"
        component={FamilyVisitScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HinhAnh"
        component={FamilyPhotoGalleryScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GoiDichVu"
        component={ServicePackageScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServicePackageDetail"
        component={ServicePackageDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FamilyResidentDetail"
        component={FamilyResidentDetailScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoTro"
        component={SupportScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoSo"
        component={FamilyProfileScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoaDon" 
        component={FamilyBillingStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DoiMatKhau" 
        component={ChangePasswordScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DieuKhoanDichVu" 
        component={TermsOfServiceScreen}
        options={{ headerShown: false }}
      />
  </Stack.Navigator>
);
};

// Family Home Stack
const FamilyHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyHome" component={FamilyHomeScreen} />
    <Stack.Screen name="FamilyResidentDetail" component={FamilyResidentDetailScreen} />
    <Stack.Screen name="FamilyPhotoGallery" component={FamilyPhotoGalleryScreen} />
    <Stack.Screen name="HinhAnh" component={FamilyPhotoGalleryScreen} />
    <Stack.Screen name="TaiAnh" component={FamilyPhotoGalleryScreen} />
    <Stack.Screen name="LichTham" component={FamilyVisitScreen} />
    <Stack.Screen name="DatLich" component={FamilyVisitScreen} />
    <Stack.Screen name="TaoHoatDong" component={FamilyHomeScreen} />
    <Stack.Screen name="ServicePackage" component={ServicePackageScreen} />
    <Stack.Screen name="ServicePackageDetail" component={ServicePackageDetailScreen} />
  </Stack.Navigator>
);

// Family Residents Stack
const FamilyResidentsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyResidents" component={FamilyResidentScreen} />
    <Stack.Screen name="CuDan" component={FamilyResidentScreen} />
    <Stack.Screen name="ThemCuDan" component={FamilyResidentScreen} />
    <Stack.Screen name="FamilyResidentDetail" component={FamilyResidentDetailScreen} />
    <Stack.Screen name="FamilyPhotoGallery" component={FamilyPhotoGalleryScreen} />
  </Stack.Navigator>
);

// Family Communication Stack
const FamilyCommunicationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyCommunication" component={FamilyCommunicationScreen} />
    <Stack.Screen name="SoanTin" component={FamilyCommunicationScreen} />
    <Stack.Screen name="NhiemVu" component={FamilyCommunicationScreen} />
    <Stack.Screen name="CreateTask" component={FamilyCommunicationScreen} />
  </Stack.Navigator>
);

// Family Billing Stack
const FamilyBillingStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyBilling" component={BillingScreen} />
    <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
  </Stack.Navigator>
);

// Family Notifications Stack
const FamilyNotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyNotifications" component={FamilyNotificationsScreen} />
  </Stack.Navigator>
);

// Family Tab Navigator
const FamilyTabNavigator = () => {
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
        name="TrangChu"
        component={FamilyHomeStack}
        options={{
          tabBarLabel: 'Trang Chủ',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="NguoiThan"
        component={FamilyResidentsStack}
        options={{
          tabBarLabel: 'Người Thân',
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="TinNhanTab"
        component={FamilyCommunicationStack}
        options={{
          tabBarLabel: 'Tin Nhắn',
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="ThongBao"
        component={FamilyNotificationsStack}
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
        component={FamilyMenuScreen}
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



export default FamilyStackNavigator; 