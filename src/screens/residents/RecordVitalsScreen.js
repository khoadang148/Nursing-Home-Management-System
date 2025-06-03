import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Appbar, TextInput, Button, Text, ActivityIndicator } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { useRoute, useNavigation } from '@react-navigation/native';
import { recordVitals } from '../../redux/slices/residentSlice';
import { validateVitalSigns } from '../../utils/validation';
import { COLORS } from '../../constants/theme';

const RecordVitalsScreen = () => {
  const dispatch = useDispatch();
  const route = useRoute();
  const navigation = useNavigation();
  const { residentId } = route.params;

  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    setVitals({ ...vitals, [field]: value });
  };

  const handleSave = async () => {
    const { isValid, errors } = validateVitalSigns(vitals);
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      Alert.alert('Lỗi', firstError);
      return;
    }
    setLoading(true);
    try {
      await dispatch(recordVitals({ residentId, vitalsData: vitals })).unwrap();
      Alert.alert('Thành công', 'Đã ghi nhận sinh hiệu!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Lỗi', error || 'Không thể ghi nhận sinh hiệu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Ghi nhận chỉ số sống" />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <TextInput
          label="Huyết áp (SYS/DIA)"
          value={vitals.bloodPressure}
          onChangeText={text => handleChange('bloodPressure', text)}
          style={styles.input}
        />
        <TextInput
          label="Nhịp tim (bpm)"
          value={vitals.heartRate}
          onChangeText={text => handleChange('heartRate', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="Nhiệt độ (°C)"
          value={vitals.temperature}
          onChangeText={text => handleChange('temperature', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="Nhịp thở (lần/phút)"
          value={vitals.respiratoryRate}
          onChangeText={text => handleChange('respiratoryRate', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="SpO2 (%)"
          value={vitals.oxygenSaturation}
          onChangeText={text => handleChange('oxygenSaturation', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="Cân nặng (kg)"
          value={vitals.weight}
          onChangeText={text => handleChange('weight', text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="Ghi chú"
          value={vitals.notes}
          onChangeText={text => handleChange('notes', text)}
          style={styles.input}
          multiline
        />
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
        >
          Lưu sinh hiệu
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  appbar: { backgroundColor: COLORS.primary },
  content: { padding: 16 },
  input: { marginBottom: 16, backgroundColor: COLORS.white },
  saveButton: { marginTop: 16, backgroundColor: COLORS.primary },
});

export default RecordVitalsScreen; 