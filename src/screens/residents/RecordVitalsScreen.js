import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { COLORS } from '../../constants/theme';

const RecordVitalsScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ghi nhận chỉ số sống" />
        <Appbar.Action icon="content-save" onPress={() => navigation.goBack()} />
      </Appbar.Header>
      <View style={styles.content}>
        <Text>Màn hình ghi nhận chỉ số sống (đang phát triển)</Text>
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

export default RecordVitalsScreen; 