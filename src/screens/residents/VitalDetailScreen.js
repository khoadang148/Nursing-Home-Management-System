import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { COLORS } from '../../constants/theme';

const VitalDetailScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chi Tiết Sinh Hiệu" />
      </Appbar.Header>
      <View style={styles.content}>
        <Text>Màn Hình Chi Tiết Sinh Hiệu (tạm thời)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default VitalDetailScreen; 