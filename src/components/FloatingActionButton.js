import React, { useState } from 'react';
import { View, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { FAB, Portal, Provider } from 'react-native-paper';
import { COLORS } from '../constants/theme';
import { FontAwesome, MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const FloatingActionButton = ({ navigation, userRole = 'staff' }) => {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const staffActions = [
    {
      icon: 'plus',
      label: 'Thêm Cư Dân',
      onPress: () => navigation.navigate('CuDan', { screen: 'ThemCuDan' }),
    },
    {
      icon: 'assignment',
      label: 'Tạo Nhiệm Vụ',
      onPress: () => navigation.navigate('NhiemVu', { screen: 'TaoNhiemVu' }),
    },
    {
      icon: 'event',
      label: 'Lập Lịch',
      onPress: () => navigation.navigate('HoatDong', { screen: 'TaoHoatDong' }),
    },
  ];

  const familyActions = [
    {
      icon: 'message',
      label: 'Tin Nhắn Mới',
      onPress: () => navigation.navigate('TinNhan', { screen: 'SoanTin' }),
    },
    {
      icon: 'calendar',
      label: 'Đặt Lịch Thăm',
      onPress: () => navigation.navigate('LichTham', { screen: 'DatLich' }),
    },
    {
      icon: 'camera',
      label: 'Tải Ảnh',
      onPress: () => navigation.navigate('HinhAnh', { screen: 'TaiAnh' }),
    },
  ];

  const actions = userRole === 'family' ? familyActions : staffActions;

  return (
    <Portal>
      <FAB.Group
        open={open}
        visible={true}
        icon={open ? 'close' : 'plus'}
        actions={actions.map(action => ({
          ...action,
          icon: () => <MaterialIcons name={action.icon} size={20} color={COLORS.surface} />,
          style: { backgroundColor: COLORS.primary },
        }))}
        onStateChange={({ open }) => setOpen(open)}
        onPress={() => {
          if (open) {
            // do something if the speed dial is open
          }
        }}
        fabStyle={{
          backgroundColor: COLORS.primary,
        }}
        style={[styles.fab, { bottom: 70 + Math.max(insets.bottom, 8) }]}
      />
    </Portal>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
  },
});

export default FloatingActionButton; 