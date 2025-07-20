import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { TextInput, Button, Card, HelperText } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNotification } from '../../components/NotificationSystem';
import { createBed, clearBedState } from '../../redux/slices/bedSlice';

const AddBedScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showSuccess, showError } = useNotification();
  
  const { isLoading, error, message } = useSelector((state) => state.beds);

  const [formData, setFormData] = useState({
    bed_number: '',
    room_id: '',
    bed_type: 'standard',
    status: 'available',
  });

  const [errors, setErrors] = useState({});

  // Handle messages
  useEffect(() => {
    if (message) {
      showSuccess(message);
      dispatch(clearBedState());
      navigation.goBack();
    }
  }, [message, showSuccess, dispatch, navigation]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearBedState());
    }
  }, [error, showError, dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.bed_number.trim()) {
      newErrors.bed_number = 'Số giường là bắt buộc';
    }

    if (!formData.room_id.trim()) {
      newErrors.room_id = 'ID phòng là bắt buộc';
    }

    if (!formData.bed_type) {
      newErrors.bed_type = 'Loại giường là bắt buộc';
    }

    if (!formData.status) {
      newErrors.status = 'Trạng thái là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(createBed(formData)).unwrap();
    } catch (error) {
      console.log('Create bed error:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const bedTypeOptions = [
    { label: 'Tiêu chuẩn', value: 'standard' },
    { label: 'Cao cấp', value: 'premium' },
    { label: 'VIP', value: 'vip' },
  ];

  const statusOptions = [
    { label: 'Có sẵn', value: 'available' },
    { label: 'Đã sử dụng', value: 'occupied' },
    { label: 'Bảo trì', value: 'maintenance' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.title}>Thêm Giường Mới</Text>
            
            {/* Bed Number */}
            <TextInput
              label="Số giường *"
              value={formData.bed_number}
              onChangeText={(value) => handleInputChange('bed_number', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.bed_number}
              left={<TextInput.Icon icon="bed" />}
              placeholder="VD: 101-A, 201-B"
            />
            <HelperText type="error" visible={!!errors.bed_number}>
              {errors.bed_number}
            </HelperText>

            {/* Room ID */}
            <TextInput
              label="ID Phòng *"
              value={formData.room_id}
              onChangeText={(value) => handleInputChange('room_id', value)}
              mode="outlined"
              style={styles.input}
              error={!!errors.room_id}
              left={<TextInput.Icon icon="room" />}
              placeholder="Nhập ID phòng"
            />
            <HelperText type="error" visible={!!errors.room_id}>
              {errors.room_id}
            </HelperText>

            {/* Bed Type */}
            <Text style={styles.label}>Loại giường *</Text>
            <View style={styles.optionsContainer}>
              {bedTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  mode={formData.bed_type === option.value ? 'contained' : 'outlined'}
                  onPress={() => handleInputChange('bed_type', option.value)}
                  style={styles.optionButton}
                  labelStyle={styles.optionLabel}
                >
                  {option.label}
                </Button>
              ))}
            </View>
            <HelperText type="error" visible={!!errors.bed_type}>
              {errors.bed_type}
            </HelperText>

            {/* Status */}
            <Text style={styles.label}>Trạng thái *</Text>
            <View style={styles.optionsContainer}>
              {statusOptions.map((option) => (
                <Button
                  key={option.value}
                  mode={formData.status === option.value ? 'contained' : 'outlined'}
                  onPress={() => handleInputChange('status', option.value)}
                  style={styles.optionButton}
                  labelStyle={styles.optionLabel}
                  buttonColor={option.value === 'available' ? '#4CAF50' : 
                              option.value === 'occupied' ? '#F44336' : '#FF9800'}
                >
                  {option.label}
                </Button>
              ))}
            </View>
            <HelperText type="error" visible={!!errors.status}>
              {errors.status}
            </HelperText>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isLoading}
              disabled={isLoading}
              style={styles.submitButton}
              labelStyle={styles.submitLabel}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo giường'}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  optionButton: {
    flex: 1,
    minWidth: '30%',
  },
  optionLabel: {
    fontSize: 12,
  },
  submitButton: {
    marginTop: 32,
    paddingVertical: 8,
  },
  submitLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddBedScreen; 