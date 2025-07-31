import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Appbar,
  TextInput,
  Button,
  Surface,
  Divider,
  Chip,
  HelperText,
  Menu,
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import residentService from '../../api/services/residentService';

const EditResidentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { residentId, residentData, onGoBack } = route.params;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resident, setResident] = useState(null);

  // Form fields
  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [gender, setGender] = useState('');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [newAllergy, setNewAllergy] = useState('');
  
  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyRelationshipMenuVisible, setEmergencyRelationshipMenuVisible] = useState(false);
  const [customRelationship, setCustomRelationship] = useState('');

  // Error states
  const [errors, setErrors] = useState({});

  const relationshipOptions = [
    'con trai',
    'con gái', 
    'cháu trai',
    'cháu gái',
    'anh em',
    'vợ/chồng',
    'khác'
  ];

  // Function to capitalize first letter of each word
  const capitalizeWords = (text) => {
    if (!text) return '';
    return text.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Function to format date as dd-mm-yyyy
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Function to convert dd-mm-yyyy to Date object
  const parseDate = (dateString) => {
    if (!dateString) return null;
    const [day, month, year] = dateString.split('-');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  useEffect(() => {
    if (residentData) {
      setResident(residentData);
      setFullName(residentData.full_name || '');
      if (residentData.date_of_birth) {
        const date = new Date(residentData.date_of_birth);
        setSelectedDate(date);
        setDateOfBirth(formatDate(date));
      }
      setGender(residentData.gender || '');
      setMedicalHistory(residentData.medical_history || '');
      setAllergies(residentData.allergies || []);
      
      // Emergency contact
      if (residentData.emergency_contact) {
        setEmergencyName(residentData.emergency_contact.name || '');
        setEmergencyPhone(residentData.emergency_contact.phone || '');
        const relationship = residentData.emergency_contact.relationship || '';
        setEmergencyRelationship(relationship);
        // If relationship is not in predefined options, set as custom
        if (relationship && !relationshipOptions.includes(relationship)) {
          setCustomRelationship(relationship);
          setEmergencyRelationship('khác');
        }
      }
    }
  }, [residentData]);

  const validateForm = () => {
    const newErrors = {};

    if (!fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Ngày sinh không được để trống';
    } else {
      // Validate date format
      const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateRegex.test(dateOfBirth)) {
        newErrors.dateOfBirth = 'Ngày sinh không đúng định dạng (dd-mm-yyyy)';
      }
    }

    if (!gender) {
      newErrors.gender = 'Giới tính không được để trống';
    }

    // Emergency contact validation (optional but if provided, validate)
    if (emergencyName.trim() || emergencyPhone.trim() || emergencyRelationship) {
      if (!emergencyName.trim()) {
        newErrors.emergencyName = 'Tên người liên hệ khẩn cấp không được để trống';
      }
      if (!emergencyPhone.trim()) {
        newErrors.emergencyPhone = 'Số điện thoại liên hệ khẩn cấp không được để trống';
      } else if (!/^[0-9]{10,15}$/.test(emergencyPhone.trim())) {
        newErrors.emergencyPhone = 'Số điện thoại không hợp lệ';
      }
      if (!emergencyRelationship) {
        newErrors.emergencyRelationship = 'Mối quan hệ không được để trống';
      } else if (emergencyRelationship === 'khác' && !customRelationship.trim()) {
        newErrors.customRelationship = 'Vui lòng nhập mối quan hệ';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAllergy = () => {
    if (newAllergy.trim() && !allergies.includes(newAllergy.trim())) {
      setAllergies([...allergies, newAllergy.trim()]);
      setNewAllergy('');
    }
  };

  const handleRemoveAllergy = (index) => {
    setAllergies(allergies.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    try {
      setSaving(true);

      const updateData = {
        full_name: fullName.trim(),
        date_of_birth: parseDate(dateOfBirth)?.toISOString(),
        gender,
        medical_history: medicalHistory.trim() || undefined,
        allergies: allergies.length > 0 ? allergies : undefined,
      };

      // Add emergency contact if provided
      if (emergencyName.trim() || emergencyPhone.trim() || emergencyRelationship) {
        updateData.emergency_contact = {
          name: emergencyName.trim(),
          phone: emergencyPhone.trim(),
          relationship: emergencyRelationship === 'khác' ? customRelationship.trim() : emergencyRelationship,
        };
      }

      const response = await residentService.updateResident(residentId, updateData);

      if (response.success) {
        Alert.alert(
          'Thành công',
          'Thông tin cư dân đã được cập nhật',
          [
            {
              text: 'OK',
              onPress: () => {
                if (onGoBack) {
                  onGoBack();
                }
                navigation.goBack();
              },
            },
          ]
        );
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật thông tin cư dân');
      }
    } catch (error) {
      console.error('Error updating resident:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin cư dân. Vui lòng thử lại.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chỉnh sửa thông tin cư dân" />
        <Appbar.Action 
          icon="content-save" 
          onPress={handleSave}
          disabled={saving}
        />
      </Appbar.Header>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <Surface style={styles.surface}>
            <Text style={styles.sectionTitle}>Thông Tin Cơ Bản</Text>
            
            <TextInput
              label="Họ và tên *"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
              error={!!errors.fullName}
            />
            <HelperText type="error" visible={!!errors.fullName}>
              {errors.fullName}
            </HelperText>

            <TouchableOpacity
              style={[styles.dropdownInput, !!errors.dateOfBirth && styles.errorInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <View style={styles.dropdownContent}>
                <Text style={[
                  styles.dropdownText,
                  !dateOfBirth && styles.placeholderText
                ]}>
                  {dateOfBirth || 'Chọn ngày sinh *'}
                </Text>
                <MaterialIcons name="calendar-today" size={24} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.dateOfBirth}>
              {errors.dateOfBirth}
            </HelperText>

            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display="default"
                onChange={(event, date) => {
                  setShowDatePicker(false);
                  if (date) {
                    setSelectedDate(date);
                    setDateOfBirth(formatDate(date));
                  }
                }}
                maximumDate={new Date()}
              />
            )}

            <TouchableOpacity
              style={[styles.dropdownInput, !!errors.gender && styles.errorInput]}
              onPress={() => {
                Alert.alert(
                  'Chọn giới tính',
                  '',
                  [
                    { text: 'Nam', onPress: () => setGender('male') },
                    { text: 'Nữ', onPress: () => setGender('female') },
                    { text: 'Hủy', style: 'cancel' }
                  ]
                );
              }}
            >
              <View style={styles.dropdownContent}>
                <Text style={[
                  styles.dropdownText,
                  !gender && styles.placeholderText
                ]}>
                  {gender === 'male' ? 'Nam' : gender === 'female' ? 'Nữ' : 'Chọn giới tính *'}
                </Text>
                <MaterialIcons name="keyboard-arrow-down" size={24} color={COLORS.textSecondary} />
              </View>
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.gender}>
              {errors.gender}
            </HelperText>
          </Surface>

          <Surface style={styles.surface}>
            <Text style={styles.sectionTitle}>Tiền Sử Bệnh</Text>
            
            <TextInput
              label="Tiền sử bệnh"
              value={medicalHistory}
              onChangeText={setMedicalHistory}
              mode="outlined"
              style={styles.input}
              multiline
              numberOfLines={3}
              placeholder="Nhập tiền sử bệnh của cư dân..."
            />
          </Surface>

          <Surface style={styles.surface}>
            <Text style={styles.sectionTitle}>Dị Ứng</Text>
            
            <View style={styles.allergyInputContainer}>
              <TextInput
                label="Thêm dị ứng"
                value={newAllergy}
                onChangeText={setNewAllergy}
                mode="outlined"
                style={styles.allergyInput}
                placeholder="Nhập dị ứng..."
              />
              <Button
                mode="contained"
                onPress={handleAddAllergy}
                style={styles.addAllergyButton}
                disabled={!newAllergy.trim()}
              >
                Thêm
              </Button>
            </View>

            {allergies.length > 0 && (
              <View style={styles.allergiesContainer}>
                {allergies.map((allergy, index) => (
                  <Chip
                    key={index}
                    style={styles.allergyChip}
                    textStyle={styles.allergyText}
                    onClose={() => handleRemoveAllergy(index)}
                  >
                    {allergy}
                  </Chip>
                ))}
              </View>
            )}
          </Surface>

          <Surface style={styles.surface}>
            <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
            <Text style={styles.sectionSubtitle}>
              Thông tin người thân không thể thay đổi. Chỉ có thể cập nhật thông tin liên hệ khẩn cấp.
            </Text>
            
            <TextInput
              label="Tên người liên hệ khẩn cấp"
              value={emergencyName}
              onChangeText={setEmergencyName}
              mode="outlined"
              style={styles.input}
              error={!!errors.emergencyName}
            />
            <HelperText type="error" visible={!!errors.emergencyName}>
              {errors.emergencyName}
            </HelperText>

            <TextInput
              label="Số điện thoại"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              mode="outlined"
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.emergencyPhone}
            />
            <HelperText type="error" visible={!!errors.emergencyPhone}>
              {errors.emergencyPhone}
            </HelperText>

            <Menu
              visible={emergencyRelationshipMenuVisible}
              onDismiss={() => setEmergencyRelationshipMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={[styles.dropdownInput, !!errors.emergencyRelationship && styles.errorInput]}
                  onPress={() => setEmergencyRelationshipMenuVisible(true)}
                >
                  <View style={styles.dropdownContent}>
                    <Text style={[
                      styles.dropdownText,
                      !emergencyRelationship && styles.placeholderText
                    ]}>
                      {emergencyRelationship 
                        ? (emergencyRelationship === 'khác' && customRelationship 
                            ? capitalizeWords(customRelationship) 
                            : capitalizeWords(emergencyRelationship))
                        : 'Chọn mối quan hệ'
                      }
                    </Text>
                    <MaterialIcons name="keyboard-arrow-down" size={24} color={COLORS.textSecondary} />
                  </View>
                </TouchableOpacity>
              }
            >
              {relationshipOptions.map((option) => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setEmergencyRelationship(option);
                    setEmergencyRelationshipMenuVisible(false);
                  }}
                  title={capitalizeWords(option)}
                />
              ))}
            </Menu>
            <HelperText type="error" visible={!!errors.emergencyRelationship}>
              {errors.emergencyRelationship}
            </HelperText>

            {/* Custom relationship input - only show when "khác" is selected */}
            {emergencyRelationship === 'khác' && (
              <>
                <TextInput
                  label="Nhập mối quan hệ"
                  value={customRelationship}
                  onChangeText={setCustomRelationship}
                  mode="outlined"
                  style={styles.input}
                  placeholder="Nhập mối quan hệ..."
                  error={!!errors.customRelationship}
                />
                <HelperText type="error" visible={!!errors.customRelationship}>
                  {errors.customRelationship}
                </HelperText>
              </>
            )}
          </Surface>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSave}
              style={styles.saveButton}
              loading={saving}
              disabled={saving}
            >
              Lưu thay đổi
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  appbar: {
    backgroundColor: COLORS.primary,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  surface: {
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.padding,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: SIZES.padding,
    fontStyle: 'italic',
  },
  input: {
    marginBottom: 8,
    backgroundColor: COLORS.surface,
  },
  allergyInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: SIZES.padding,
  },
  allergyInput: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.surface,
  },
  addAllergyButton: {
    backgroundColor: COLORS.primary,
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyChip: {
    backgroundColor: COLORS.error + '15',
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    color: COLORS.error,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingVertical: SIZES.padding,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
  dropdownInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 8,
  },
  errorInput: {
    borderColor: COLORS.error,
  },
  dropdownContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  placeholderText: {
    color: COLORS.textSecondary,
  },
});

export default EditResidentScreen; 