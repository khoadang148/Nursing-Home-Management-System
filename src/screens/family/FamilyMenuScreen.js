import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, FontAwesome, Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { logout } from '../../redux/slices/authSlice';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../../api/config/apiConfig';

// Fallback nếu API_BASE_URL bị undefined
const DEFAULT_API_BASE_URL = 'http://192.168.2.5:8000';
const getApiBaseUrl = () => {
  if (typeof CONFIG_API_BASE_URL === 'string' && CONFIG_API_BASE_URL.startsWith('http')) {
    return CONFIG_API_BASE_URL;
  }
  console.warn('[FamilyMenuScreen] API_BASE_URL is undefined, fallback to default:', DEFAULT_API_BASE_URL);
  return DEFAULT_API_BASE_URL;
};

// Helper để đồng bộ logic avatar
const getAvatarUri = (avatar) => {
  if (!avatar) return 'https://randomuser.me/api/portraits/men/20.jpg';
  if (avatar.startsWith('http') || avatar.startsWith('https')) return avatar;
  // Chuyển toàn bộ \\ hoặc \ thành /
  const cleanPath = avatar.replace(/\\/g, '/').replace(/\\/g, '/').replace(/\//g, '/').replace(/^\/+|^\/+/, '');
  const baseUrl = getApiBaseUrl();
  const uri = `${baseUrl}/${cleanPath}`;
  console.log('[FamilyMenuScreen] API_BASE_URL:', baseUrl, 'avatar:', avatar, 'cleanPath:', cleanPath, 'uri:', uri);
  return uri;
};

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
            source={{ uri: getAvatarUri(user?.avatar || user?.photo) }}
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

const styles = StyleSheet.create({
  menuContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  menuScrollView: {
    flex: 1,
  },
  userProfileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  menuItemsContainer: {
    paddingTop: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  destructiveMenuItem: {
    backgroundColor: COLORS.error + '10',
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
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  destructiveIconContainer: {
    backgroundColor: COLORS.error + '20',
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  destructiveText: {
    color: COLORS.error,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 10,
  },
});

export default FamilyMenuScreen; 