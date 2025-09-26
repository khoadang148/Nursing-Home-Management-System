import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
import { logout } from '../../redux/slices/authSlice';
import { COLORS } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';
import { getAvatarUri } from '../../utils/avatarUtils';
import CommonAvatar from '../../components/CommonAvatar';

const StaffMenuScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Sử dụng thông tin user thật từ Redux
  const userData = user || {};

  // Hiển thị role dễ hiểu hơn
  const getDisplayRole = (role) => {
    switch (role) {
      case 'staff': return 'Nhân Viên';
      case 'admin': return 'Quản Trị Viên';
      case 'family': return 'Gia Đình';
      default: return role;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng Xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng Xuất', onPress: () => dispatch(logout()) },
      ]
    );
  };

  const handleProfilePress = () => {
    navigation.navigate('HoSo');
  };

  // Menu items for staff only (family-related items removed)
  const menuItems = [
    {
      id: 'family-contact',
      title: 'Liên hệ người nhà',
      icon: <MaterialIcons name="people" size={24} color={COLORS.primary} />,
      onPress: () => navigation.navigate('LienHeNguoiNha'),
    },
    {
      id: 'activities',
      title: 'Hoạt động',
      icon: <MaterialIcons name="event" size={24} color={COLORS.primary} />,
      onPress: () => navigation.navigate('HoatDong'),
    },
    {
      id: 'visits-management',
      title: 'Quản lý lịch thăm',
      icon: <MaterialIcons name="event-available" size={24} color={COLORS.primary} />,
      onPress: () => navigation.navigate('QuanLyLichTham'),
    },
    {
      id: 'notifications',
      title: 'Thông báo',
      icon: <MaterialIcons name="notifications" size={24} color={COLORS.primary} />,
      onPress: () => navigation.navigate('ThongBao'),
    },
    {
      id: 'change-password',
      title: 'Đổi mật khẩu',
      icon: <MaterialIcons name="lock" size={24} color={COLORS.primary} />,
      onPress: () => navigation.navigate('DoiMatKhau'),
    },
    {
      id: 'logout',
      title: 'Đăng xuất',
      icon: <MaterialIcons name="logout" size={24} color={COLORS.error} />,
      onPress: handleLogout,
      isLogout: true,
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top']}>
      <ScrollView style={styles.container}>
        {/* Profile Header */}
        <TouchableOpacity style={styles.profileHeader} onPress={handleProfilePress}>
          <View style={styles.profileImageContainer}>
            <CommonAvatar
              source={userData.avatar || userData.profile_picture}
              size={60}
              name={userData.full_name || userData.name}
              style={styles.profileImage}
            />
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{userData.full_name || userData.name || 'Chưa có tên'}</Text>
            <Text style={styles.userEmail}>{userData.email || 'Chưa có email'}</Text>
            <Text style={styles.userRole}>{getDisplayRole(userData.role) || 'Chưa có vai trò'}</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </TouchableOpacity>
        {/* Menu Items giữ nguyên, mọi text đã nằm trong <Text> */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.menuItem,
                index === menuItems.length - 1 && styles.lastMenuItem,
                item.isLogout && styles.logoutItem
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[
                  styles.menuItemText,
                  item.isLogout && styles.logoutText
                ]}>
                  {item.title}
                </Text>
              </View>
              <MaterialIcons 
                name="chevron-right" 
                size={20} 
                color={item.isLogout ? COLORS.error : COLORS.textSecondary} 
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileHeader: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginHorizontal: 15,
    marginTop: 15,
    marginBottom: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#e1e1e1',
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 15,
    fontWeight: '500',
  },
  logoutText: {
    color: COLORS.error,
  },
});

export default StaffMenuScreen; 