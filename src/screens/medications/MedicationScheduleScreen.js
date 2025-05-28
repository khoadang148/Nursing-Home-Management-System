import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MedicationScheduleScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicationId } = route.params || { medicationId: '1' };
  
  // Mock data - in a real app, fetch from API or database
  const [scheduleData, setScheduleData] = useState([
    { id: '1', date: '2023-12-01', time: '08:00', status: 'completed', adminBy: 'Y tá Smith' },
    { id: '2', date: '2023-12-01', time: '20:00', status: 'completed', adminBy: 'Y tá Johnson' },
    { id: '3', date: '2023-12-02', time: '08:00', status: 'completed', adminBy: 'Y tá Williams' },
    { id: '4', date: '2023-12-02', time: '20:00', status: 'missed', adminBy: '' },
    { id: '5', date: '2023-12-03', time: '08:00', status: 'upcoming', adminBy: '' },
    { id: '6', date: '2023-12-03', time: '20:00', status: 'upcoming', adminBy: '' },
  ]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <Icon name="check-circle" size={24} color="#27ae60" />;
      case 'missed':
        return <Icon name="close-circle" size={24} color="#e74c3c" />;
      case 'upcoming':
        return <Icon name="clock-outline" size={24} color="#3498db" />;
      default:
        return <Icon name="help-circle" size={24} color="#95a5a6" />;
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã hoàn thành';
      case 'missed':
        return 'Đã bỏ lỡ';
      case 'upcoming':
        return 'Sắp tới';
      default:
        return 'Không rõ';
    }
  };

  const renderScheduleItem = ({ item }) => (
    <View style={styles.scheduleItem}>
      <View style={styles.scheduleInfo}>
        <Text style={styles.scheduleDate}>{item.date}</Text>
        <Text style={styles.scheduleTime}>{item.time}</Text>
        <Text style={styles.scheduleStatus}>{getStatusLabel(item.status)}</Text>
        {item.adminBy ? <Text style={styles.adminBy}>Bởi: {item.adminBy}</Text> : null}
      </View>
      <View style={styles.statusIconContainer}>
        {getStatusIcon(item.status)}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lịch trình thuốc</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>Paracetamol</Text>
        <Text style={styles.medicationDetails}>500mg - Sáng và Tối</Text>
      </View>

      <View style={styles.scheduleContainer}>
        <View style={styles.scheduleHeader}>
          <Text style={styles.scheduleHeaderTitle}>Lịch sử lịch trình</Text>
        </View>
        
        <FlatList
          data={scheduleData}
          renderItem={renderScheduleItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.scheduleList}
        />
      </View>

      <TouchableOpacity 
        style={styles.adminButton}
        onPress={() => navigation.navigate('MedicationAdmin', { medicationId })}
      >
        <Icon name="pill" size={20} color="#fff" />
        <Text style={styles.buttonText}>Cung cấp ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  medicationInfo: {
    backgroundColor: '#fff',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  medicationDetails: {
    fontSize: 14,
    color: '#7f8c8d',
  },
  scheduleContainer: {
    flex: 1,
    marginVertical: 10,
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: '#ecf0f1',
  },
  scheduleHeaderTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#34495e',
  },
  scheduleList: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  scheduleItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  scheduleInfo: {
    flex: 1,
  },
  scheduleDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 2,
  },
  scheduleTime: {
    fontSize: 14,
    color: '#34495e',
    marginBottom: 2,
  },
  scheduleStatus: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  adminBy: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  statusIconContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  adminButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    margin: 15,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MedicationScheduleScreen; 