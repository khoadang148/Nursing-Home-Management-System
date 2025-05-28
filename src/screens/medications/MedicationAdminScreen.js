import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MedicationAdminScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicationId } = route.params || { medicationId: '1' };
  
  // State for form fields
  const [notes, setNotes] = useState('');
  const [wasRefused, setWasRefused] = useState(false);
  const [adminDateTime, setAdminDateTime] = useState(new Date().toLocaleString());

  // Mock data for the medication
  const medication = {
    id: medicationId,
    name: 'Paracetamol',
    dosage: '500mg',
    schedule: 'Morning, Evening',
  };

  const handleAdminister = () => {
    // Here would be logic to record the administration
    Alert.alert(
      'Đã cung cấp thuốc',
      `Đã ghi nhận thành công việc cung cấp ${medication.name}`,
      [
        { 
          text: 'OK', 
          onPress: () => navigation.navigate('MedicationDetails', { medicationId }) 
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cung cấp thuốc</Text>
        <View style={{ width: 30 }} />
      </View>

      <View style={styles.medicationInfo}>
        <Text style={styles.medicationName}>{medication.name}</Text>
        <Text style={styles.medicationDetails}>{medication.dosage} - {medication.schedule}</Text>
        <Text style={styles.adminTime}>Thời gian hiện tại: {adminDateTime}</Text>
      </View>

      <View style={styles.formContainer}>
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Bệnh nhân từ chối thuốc</Text>
          <Switch
            value={wasRefused}
            onValueChange={setWasRefused}
            trackColor={{ false: '#d9d9d9', true: '#e74c3c' }}
            thumbColor={wasRefused ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú bổ sung về việc cung cấp thuốc này"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.confirmationContainer}>
          <Text style={styles.confirmationText}>
Tôi xác nhận rằng tôi đã cung cấp thuốc theo đúng đơn.
          </Text>
        </View>

        <TouchableOpacity 
          style={[styles.adminButton, wasRefused && styles.refusedButton]}
          onPress={handleAdminister}
        >
          <Icon name={wasRefused ? "close-circle" : "check-circle"} size={20} color="#fff" />
          <Text style={styles.buttonText}>
            {wasRefused ? 'Ghi nhận từ chối' : 'Xác nhận cung cấp'}
          </Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 5,
  },
  adminTime: {
    fontSize: 14,
    color: '#3498db',
    fontWeight: '500',
  },
  formContainer: {
    padding: 15,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  confirmationContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  confirmationText: {
    fontSize: 14,
    color: '#555',
    fontStyle: 'italic',
  },
  adminButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 8,
    marginTop: 10,
  },
  refusedButton: {
    backgroundColor: '#e74c3c',
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default MedicationAdminScreen; 