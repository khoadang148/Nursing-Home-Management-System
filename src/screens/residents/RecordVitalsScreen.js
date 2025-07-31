import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Appbar, TextInput, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import vitalSignsService from '../../api/services/vitalSignsService';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

const RecordVitalsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { residentId } = route.params;
  const user = useSelector(state => state.auth.user);
  const [loading, setLoading] = useState(false);

  const [vitals, setVitals] = useState({
    bloodPressure: '',
    heartRate: '',
    temperature: '',
    respiratoryRate: '',
    oxygenSaturation: '',
    weight: '',
    notes: '',
  });



  const handleChange = (field, value) => {
    setVitals({ ...vitals, [field]: value });
  };

  const handleSave = async () => {
    // Validate that at least one vital sign is recorded
    const hasVitalSigns = vitals.temperature || vitals.heartRate || vitals.bloodPressure || 
                         vitals.respiratoryRate || vitals.oxygenSaturation || vitals.weight;
    
    if (!hasVitalSigns) {
      Alert.alert('Lỗi', 'Vui lòng nhập ít nhất một chỉ số sinh hiệu');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare data with proper type conversion and validation
      const vitalSignData = {
        resident_id: residentId,
      };

      // Only add fields that have values and convert to proper types
      if (vitals.temperature && vitals.temperature.trim()) {
        const temp = parseFloat(vitals.temperature.replace(',', '.'));
        if (!isNaN(temp) && temp >= 30 && temp <= 45) {
          vitalSignData.temperature = temp;
        }
      }

      if (vitals.heartRate && vitals.heartRate.trim()) {
        const hr = parseInt(vitals.heartRate.replace(',', '.'));
        if (!isNaN(hr) && hr >= 30 && hr <= 200) {
          vitalSignData.heart_rate = hr;
        }
      }

      if (vitals.bloodPressure && vitals.bloodPressure.trim()) {
        vitalSignData.blood_pressure = vitals.bloodPressure.trim();
      }

      if (vitals.respiratoryRate && vitals.respiratoryRate.trim()) {
        const rr = parseInt(vitals.respiratoryRate.replace(',', '.'));
        if (!isNaN(rr) && rr >= 5 && rr <= 50) {
          vitalSignData.respiratory_rate = rr;
        }
      }

      if (vitals.oxygenSaturation && vitals.oxygenSaturation.trim()) {
        const o2 = parseFloat(vitals.oxygenSaturation.replace(',', '.'));
        if (!isNaN(o2) && o2 >= 70 && o2 <= 100) {
          vitalSignData.oxygen_level = o2;
        }
      }

      if (vitals.weight && vitals.weight.trim()) {
        const weight = parseFloat(vitals.weight.replace(',', '.'));
        if (!isNaN(weight) && weight >= 20 && weight <= 200) {
          vitalSignData.weight = weight;
        }
      }

      if (vitals.notes && vitals.notes.trim()) {
        vitalSignData.notes = vitals.notes.trim();
      }

      console.log('Sending vital sign data:', vitalSignData);

      const response = await vitalSignsService.createVitalSign(vitalSignData);
      
      if (response.success) {
        Alert.alert('Thành công', 'Đã ghi nhận sinh hiệu!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể ghi nhận sinh hiệu');
      }
    } catch (error) {
      console.error('Error creating vital signs:', error);
      Alert.alert('Lỗi', 'Không thể ghi nhận sinh hiệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Ghi nhận chỉ số sinh hiệu" />
      </Appbar.Header>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 0 }}>
          <Surface style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="stethoscope" size={28} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={styles.sectionTitle}>Chỉ số chính</Text>
            </View>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="water" size={28} color={COLORS.primary} />
        <TextInput
          label="Huyết áp (SYS/DIA)"
          value={vitals.bloodPressure}
          onChangeText={text => handleChange('bloodPressure', text)}
                style={styles.inputSmall}
                keyboardType="default"
                placeholder="120/80"
        />
            </View>
            <Text style={styles.inputDesc}>Ví dụ: 120/80 mmHg</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color={COLORS.error} />
        <TextInput
          label="Nhịp tim (bpm)"
          value={vitals.heartRate}
          onChangeText={text => handleChange('heartRate', text)}
                style={styles.inputSmall}
          keyboardType="numeric"
                placeholder="75"
        />
            </View>
            <Text style={styles.inputDesc}>Bình thường: 60-100 bpm</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="thermometer" size={28} color={COLORS.warning} />
        <TextInput
          label="Nhiệt độ (°C)"
          value={vitals.temperature}
          onChangeText={text => handleChange('temperature', text)}
                style={styles.inputSmall}
          keyboardType="numeric"
                placeholder="36.5"
        />
            </View>
            <Text style={styles.inputDesc}>Bình thường: 36.5-37.5°C</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="lungs" size={28} color={COLORS.success} />
        <TextInput
          label="Nhịp thở (lần/phút)"
          value={vitals.respiratoryRate}
          onChangeText={text => handleChange('respiratoryRate', text)}
                style={styles.inputSmall}
          keyboardType="numeric"
                placeholder="18"
        />
            </View>
            <Text style={styles.inputDesc}>Bình thường: 12-20 lần/phút</Text>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="water-percent" size={28} color={COLORS.info} />
        <TextInput
          label="SpO2 (%)"
          value={vitals.oxygenSaturation}
          onChangeText={text => handleChange('oxygenSaturation', text)}
                style={styles.inputSmall}
          keyboardType="numeric"
                placeholder="98"
              />
            </View>
            <Text style={styles.inputDesc}>Bình thường: 95-100%</Text>
          </Surface>

          <Surface style={styles.card}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="weight-kilogram" size={28} color={COLORS.primary} style={{ marginRight: 8 }} />
              <Text style={[styles.sectionTitle, { color: COLORS.primary }]}>Chỉ số phụ</Text>
            </View>
            <View style={styles.inputRow}>
              <MaterialCommunityIcons name="weight-kilogram" size={28} color={COLORS.primary} />
        <TextInput
          label="Cân nặng (kg)"
          value={vitals.weight}
          onChangeText={text => handleChange('weight', text)}
                style={styles.inputSmall}
          keyboardType="numeric"
                placeholder="65"
        />
            </View>
            <Text style={styles.inputDesc}>Ví dụ: 65.5 kg</Text>
        <TextInput
          label="Ghi chú"
          value={vitals.notes}
          onChangeText={text => handleChange('notes', text)}
          style={styles.input}
          multiline
              placeholder="Ghi chú thêm về tình trạng sinh hiệu..."
        />
          </Surface>

          <View style={styles.buttonContainer}>
        <Button
          mode="contained"
          onPress={handleSave}
          loading={loading}
          style={styles.saveButton}
                labelStyle={styles.saveButtonText}
                contentStyle={{ paddingVertical: 8 }}
        >
          Lưu sinh hiệu
        </Button>
          </View>
      </ScrollView>
    </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  appbar: { backgroundColor: COLORS.primary },

  scrollView: {
    flex: 1,
  },
  content: { padding: 16 },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 20,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.primary,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    width: '100%',
    marginBottom: 12,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
  },
  inputDesc: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 12,
    marginLeft: 0,
  },
  buttonContainer: {
    padding: SIZES.padding,
    marginBottom: 20,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  saveButtonText: {
    ...FONTS.body1,
    color: COLORS.surface,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  inputSmall: {
    width: '75%',
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
  },
});

export default RecordVitalsScreen; 