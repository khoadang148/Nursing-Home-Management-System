import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Component hiển thị placeholder đơn giản với hướng dẫn
const QRPlaceholder = ({ size = 180 }) => {
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.border}>
        <Text style={styles.title}>QR CODE</Text>
        <Text style={styles.subtitle}>BIDV</Text>
        <Text style={styles.account}>1304040403</Text>
        <Text style={styles.note}>
          Thay thế bằng{'\n'}
          hình ảnh QR thật
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  border: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 20,
    alignItems: 'center',
    borderRadius: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  account: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    marginBottom: 12,
  },
  note: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default QRPlaceholder;
