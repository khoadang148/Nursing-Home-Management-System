import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, FontAwesome5, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { View, TouchableOpacity, Text, StyleSheet, ScrollView, Image, Alert, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';

// Import logout action
import { logout } from '../redux/slices/authSlice';

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
import FamilyBillStack from './FamilyBillStack';
import NotificationsScreen from '../screens/notifications/NotificationsScreen';
import NotificationDetailScreen from '../screens/notifications/NotificationDetailScreen';

const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Menu Screen Component for Family Users
const FamilyMenuScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  
  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đăng Xuất', 
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      id: 'billing',
      title: 'Hóa Đơn & Thanh Toán',
      icon: 'receipt',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('HoaDon'),
      showArrow: true
    },
    {
      id: 'visit',
              title: 'Lịch Thăm',
      icon: 'event',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('LichTham'),
      showArrow: true
    },
    {
      id: 'photos',
      title: 'Thư Viện Ảnh',
      icon: 'photo-library',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('HinhAnh'),
      showArrow: true
    },
    {
      id: 'services',
      title: 'Gói Dịch Vụ',
      icon: 'card-membership',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('GoiDichVu'),
      showArrow: true
    },
    {
      id: 'support',
      title: 'Hỗ Trợ',
      icon: 'help-outline',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('HoTro'),
      showArrow: true
    },
    {
      id: 'divider1',
      type: 'divider'
    },
    {
      id: 'change-password',
      title: 'Đổi Mật Khẩu',
      icon: 'lock',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('DoiMatKhau'),
      showArrow: true
    },
    {
      id: 'terms',
      title: 'Điều Khoản Dịch Vụ',
      icon: 'description',
      iconType: 'MaterialIcons',
      onPress: () => navigation.navigate('DieuKhoanDichVu'),
      showArrow: true
    },
    {
      id: 'divider2',
      type: 'divider'
    },
    {
      id: 'logout',
      title: 'Đăng Xuất',
      icon: 'logout',
      iconType: 'MaterialIcons',
      onPress: handleLogout,
      showArrow: false,
      isDestructive: true
    }
  ];

  const renderIcon = (icon, iconType, color = COLORS.textSecondary, size = 24) => {
    switch (iconType) {
      case 'FontAwesome':
        return <FontAwesome name={icon} size={size} color={color} />;
      case 'MaterialIcons':
        return <MaterialIcons name={icon} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={icon} size={size} color={color} />;
      default:
        return <MaterialIcons name={icon} size={size} color={color} />;
    }
  };

  return (
    <SafeAreaView style={styles.menuContainer}>
      <ScrollView style={styles.menuScrollView}>
        {/* User Profile Header */}
        <TouchableOpacity 
          style={styles.userProfileHeader}
          onPress={() => navigation.navigate('HoSo')}
        >
          <Image 
            source={{ uri: user?.photo || 'https://randomuser.me/api/portraits/women/11.jpg' }}
            style={styles.userAvatar}
          />
          <View style={styles.userInfo}>
            <Text style={styles.userName}>{user?.full_name || user?.fullName || 'User'}</Text>
            <Text style={styles.userEmail}>{user?.email || 'user@example.com'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuItemsContainer}>
          {menuItems.map((item) => {
            if (item.type === 'divider') {
              return <View key={item.id} style={styles.divider} />;
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.menuItem,
                  item.isDestructive && styles.destructiveMenuItem
                ]}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.menuItemLeft}>
                  <View style={[
                    styles.menuItemIconContainer,
                    item.isDestructive && styles.destructiveIconContainer
                  ]}>
                    {renderIcon(
                      item.icon, 
                      item.iconType, 
                      item.isDestructive ? COLORS.error : COLORS.textSecondary,
                      20
                    )}
                  </View>
                  <Text style={[
                    styles.menuItemText,
                    item.isDestructive && styles.destructiveText
                  ]}>
                    {item.title}
                  </Text>
                </View>
                {item.showArrow && (
                  <MaterialIcons 
                    name="chevron-right" 
                    size={20} 
                    color={COLORS.textSecondary} 
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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

// Mobile-optimized Family Navigator với 5 tabs: Trang chủ - Người Thân - Tin Nhắn - Thông báo - Menu
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

// Family Stack Navigator without drawer
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
        // Smooth horizontal slide animation
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
        component={MobileFamilyTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="LichTham"
        component={require('../screens/family/FamilyVisitScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HinhAnh"
        component={require('../screens/family/FamilyPhotoGalleryScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="GoiDichVu"
        component={require('../screens/family/ServicePackageScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="ServicePackageDetail"
        component={require('../screens/family/ServicePackageDetailScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="FamilyResidentDetail"
        component={require('../screens/family/FamilyResidentDetailScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoTro"
        component={require('../screens/family/SupportScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoSo"
        component={require('../screens/family/FamilyProfileScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="HoaDon" 
        component={FamilyBillStack}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DoiMatKhau" 
        component={require('../screens/family/ChangePasswordScreen').default}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="DieuKhoanDichVu" 
        component={require('../screens/family/TermsOfServiceScreen').default}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};

const MobileOptimizedNavigator = () => {
  const { user } = useSelector((state) => state.auth);
  
  // Choose navigator based on user role
  if (user?.role === 'family') {
    return <FamilyStackNavigator />;
  }
  
  // Default to staff navigator for all other roles
  return <StaffDrawerNavigator />;
};

// Styles for the Menu Screen
const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  menuScrollView: {
    flex: 1,
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#dee2e6',
    marginRight: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#6c757d',
  },
  menuItemsContainer: {
    backgroundColor: 'white',
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f8f9fa',
  },
  destructiveMenuItem: {
    backgroundColor: '#fff5f5',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  destructiveIconContainer: {
    backgroundColor: '#fee2e2',
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212529',
  },
  destructiveText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: '#e9ecef',
    marginVertical: 8,
    marginHorizontal: 20,
  },
});

export default MobileOptimizedNavigator; 