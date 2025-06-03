import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CreateTaskScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo Nhiệm Vụ Mới</Text>
      {/* Thêm form tạo nhiệm vụ ở đây */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default CreateTaskScreen; 