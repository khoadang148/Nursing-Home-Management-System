import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MobileBottomSheet = ({ visible, onClose, navigation, userRole = 'staff' }) => {
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const staffMenuItems = [
    { icon: 'event', title: 'Hoạt Động', subtitle: 'Quản lý hoạt động hàng ngày', route: 'HoatDong' },
    { icon: 'medical-services', title: 'Thuốc', subtitle: 'Quản lý thuốc và đơn thuốc', route: 'Thuoc' },
    { icon: 'assessment', title: 'Báo Cáo', subtitle: 'Xem báo cáo và thống kê', route: 'BaoCao' },
    { icon: 'settings', title: 'Cài Đặt', subtitle: 'Cấu hình ứng dụng', route: 'CaiDat' },
  ];

  const familyMenuItems = [
    { icon: 'event', title: 'Lịch Thăm', subtitle: 'Đặt lịch thăm viếng', route: 'LichTham' },
    { icon: 'photo-library', title: 'Thư Viện Ảnh', subtitle: 'Xem ảnh của người thân', route: 'HinhAnh' },
    { icon: 'history', title: 'Lịch Sử', subtitle: 'Xem lịch sử chăm sóc', route: 'LichSu' },
    { icon: 'help', title: 'Hỗ Trợ', subtitle: 'Liên hệ hỗ trợ', route: 'HoTro' },
  ];

  const menuItems = userRole === 'family' ? familyMenuItems : staffMenuItems;

  const handleItemPress = (route) => {
    onClose();
    if (navigation && route) {
      navigation.navigate(route);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} onPress={onClose} />
        <Animated.View
          style={[
            styles.bottomSheet,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <View style={styles.handle} />
          <Text style={styles.title}>Menu</Text>
          
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={() => handleItemPress(item.route)}
            >
              <View style={styles.iconContainer}>
                <MaterialIcons name={item.icon} size={24} color={COLORS.primary} />
              </View>
              <View style={styles.textContainer}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
            </TouchableOpacity>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  bottomSheet: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    paddingBottom: 30,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: COLORS.textSecondary,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${COLORS.primary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default MobileBottomSheet; 