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
import { Appbar, TextInput, Button, Surface } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import vitalSignsService from '../../api/services/vitalSignsService';
import { validateVitalSigns } from '../../utils/validation';

const EditVitalsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { vitalId, vitalData } = route.params;
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

  // Pre-populate data when component mounts
  useEffect(() => {
    if (vitalData) {
      setVitals({
        bloodPressure: vitalData.blood_pressure || '',
        heartRate: vitalData.heart_rate ? vitalData.heart_rate.toString() : '',
        temperature: vitalData.temperature ? vitalData.temperature.toString() : '',
        respiratoryRate: vitalData.respiratory_rate ? vitalData.respiratory_rate.toString() : '',
        oxygenSaturation: vitalData.oxygen_level ? vitalData.oxygen_level.toString() : '',
        weight: vitalData.weight ? vitalData.weight.toString() : '',
        notes: vitalData.notes || '',
      });
    }
  }, [vitalData]);

  const handleChange = (field, value) => {
    setVitals({ ...vitals, [field]: value });
  };

  const handleUpdate = async () => {
    const { isValid, errors } = validateVitalSigns(vitals);
    if (!isValid) {
      const firstError = Object.values(errors)[0];
      Alert.alert('Lỗi', firstError);
      return;
    }
    
    setLoading(true);
    try {
      // Only include fields that have valid values
      const vitalSignData = {};
      
      if (vitals.temperature && vitals.temperature.trim() !== '') {
        vitalSignData.temperature = parseFloat(vitals.temperature.replace(',', '.'));
      }
      if (vitals.heartRate && vitals.heartRate.trim() !== '') {
        vitalSignData.heart_rate = parseInt(vitals.heartRate.replace(',', '.'));
      }
      if (vitals.bloodPressure && vitals.bloodPressure.trim() !== '') {
        vitalSignData.blood_pressure = vitals.bloodPressure.trim();
      }
      if (vitals.respiratoryRate && vitals.respiratoryRate.trim() !== '') {
        vitalSignData.respiratory_rate = parseInt(vitals.respiratoryRate.replace(',', '.'));
      }
      if (vitals.oxygenSaturation && vitals.oxygenSaturation.trim() !== '') {
        vitalSignData.oxygen_level = parseFloat(vitals.oxygenSaturation.replace(',', '.'));
      }
      if (vitals.weight && vitals.weight.trim() !== '') {
        vitalSignData.weight = parseFloat(vitals.weight.replace(',', '.'));
      }
      if (vitals.notes && vitals.notes.trim() !== '') {
        vitalSignData.notes = vitals.notes.trim();
      }

      console.log('📤 Sending vital sign data to API:', JSON.stringify(vitalSignData, null, 2));

      const response = await vitalSignsService.updateVitalSign(vitalId, vitalSignData);
      
      if (response.success) {
        // Use callback instead of Redux dispatch
        if (route.params?.onGoBack) {
          route.params.onGoBack();
        }
        Alert.alert('Thành công', 'Đã cập nhật sinh hiệu!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật sinh hiệu');
      }
    } catch (error) {
      console.error('Error updating vital signs:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật sinh hiệu. Vui lòng thử lại.');
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
          <Appbar.Content title="Chỉnh sửa chỉ số sinh hiệu" />
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
          onPress={handleUpdate}
          loading={loading}
          style={styles.saveButton}
                labelStyle={styles.saveButtonText}
                contentStyle={{ paddingVertical: 8 }}
        >
          Cập nhật sinh hiệu
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

export default EditVitalsScreen; 