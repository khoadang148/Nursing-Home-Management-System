import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform, KeyboardAvoidingView, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { TextInput, Button, Chip, Divider } from 'react-native-paper';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import residentService from '../../api/services/residentService';
import * as ImagePicker from 'expo-image-picker';
import CommonAvatar from '../../components/CommonAvatar';

const FamilyAddResidentScreen = ({ navigation }) => {
  // Feature flag: toggle CCCD (citizen ID) handling from FE without deleting code
  const ENABLE_CCCD = false;
  const currentUser = useSelector((state) => state.auth.user);
  
  // Basic resident info
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(new Date().getFullYear() - 70, 0, 1));
  const [admissionDate, setAdmissionDate] = useState(new Date());
  const [showDobPicker, setShowDobPicker] = useState(false);
  const [showAdmissionPicker, setShowAdmissionPicker] = useState(false);
  
  // CCCD fields
  const [cccdId, setCccdId] = useState('');
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  
  // Avatar
  const [avatarUri, setAvatarUri] = useState(null);
  
  // Medical info
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [currentCondition, setCurrentCondition] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [currentAllergy, setCurrentAllergy] = useState('');
  
  // Relationship between current family member and resident
  const RELATIONSHIP_OPTIONS = [
    { label: 'Con trai', value: 'con trai' },
    { label: 'Con gái', value: 'con gái' },
    { label: 'Cháu trai', value: 'cháu trai' },
    { label: 'Cháu gái', value: 'cháu gái' },
    { label: 'Anh em', value: 'anh em' },
    { label: 'Vợ/chồng', value: 'vợ/chồng' },
    { label: 'Khác', value: 'khác' },
  ];
  const [relationshipOption, setRelationshipOption] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [relationshipDropdownOpen, setRelationshipDropdownOpen] = useState(false);

  // Emergency contact
  const [useMyInfo, setUseMyInfo] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationshipOption, setEmergencyRelationshipOption] = useState('');
  const [emergencyCustomRelationship, setEmergencyCustomRelationship] = useState('');
  const [emergencyRelationshipDropdownOpen, setEmergencyRelationshipDropdownOpen] = useState(false);
  
  const [submitting, setSubmitting] = useState(false);
  
  // Image preview states
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);

  // Helper functions
  const addMedicalCondition = () => {
    if (currentCondition.trim() !== '') {
      setMedicalConditions([...medicalConditions, currentCondition.trim()]);
      setCurrentCondition('');
    }
  };

  const removeMedicalCondition = (index) => {
    const updatedConditions = [...medicalConditions];
    updatedConditions.splice(index, 1);
    setMedicalConditions(updatedConditions);
  };

  const addAllergy = () => {
    if (currentAllergy.trim() !== '') {
      setAllergies([...allergies, currentAllergy.trim()]);
      setCurrentAllergy('');
    }
  };

  const removeAllergy = (index) => {
    const updatedAllergies = [...allergies];
    updatedAllergies.splice(index, 1);
    setAllergies(updatedAllergies);
  };

  const pickImage = async (type) => {
    try {
      Alert.alert(
        'Chọn ảnh',
        'Chọn cách lấy ảnh',
        [
          {
            text: 'Chụp ảnh',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Quyền truy cập camera', 'Bạn cần cấp quyền truy cập camera để chụp ảnh.');
                  return;
                }
                
                let result = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  if (type === 'avatar') {
                    setAvatarUri(result.assets[0].uri);
                  } else if (type === 'cccd_front') {
                    setCccdFront(result.assets[0].uri);
                  } else if (type === 'cccd_back') {
                    setCccdBack(result.assets[0].uri);
                  }
                }
              } catch (error) {
                console.error('Camera error:', error);
                Alert.alert('Lỗi', 'Không thể mở camera. Vui lòng thử lại!');
              }
            }
          },
          {
            text: 'Chọn từ thư viện',
            onPress: async () => {
              try {
                const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
                if (status !== 'granted') {
                  Alert.alert('Quyền truy cập ảnh', 'Bạn cần cấp quyền truy cập ảnh để chọn ảnh từ thư viện.');
                  return;
                }
                
                let result = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });
                
                if (!result.canceled && result.assets && result.assets.length > 0) {
                  if (type === 'avatar') {
                    setAvatarUri(result.assets[0].uri);
                  } else if (type === 'cccd_front') {
                    setCccdFront(result.assets[0].uri);
                  } else if (type === 'cccd_back') {
                    setCccdBack(result.assets[0].uri);
                  }
                }
              } catch (error) {
                console.error('Gallery error:', error);
                Alert.alert('Lỗi', 'Không thể mở thư viện ảnh. Vui lòng thử lại!');
              }
            }
          },
          { text: 'Hủy', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Lỗi', 'Không thể mở image picker. Vui lòng thử lại!');
    }
  };

  const onCreate = async () => {
    // Validation
    if (!fullName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ và tên.');
      return;
    }
    if (ENABLE_CCCD) {
      if (!cccdId.trim() || cccdId.length !== 12) {
        Alert.alert('Lỗi', 'Vui lòng nhập đúng số CCCD (12 chữ số).');
        return;
      }
      if (!cccdFront) {
        Alert.alert('Lỗi', 'Vui lòng upload ảnh CCCD mặt trước.');
        return;
      }
      if (!cccdBack) {
        Alert.alert('Lỗi', 'Vui lòng upload ảnh CCCD mặt sau.');
        return;
      }
    }
    // Age validation before submit
    if (!validateAge(dateOfBirth)) {
      return;
    }
    if (!relationshipOption && customRelationship.trim() === '') {
      Alert.alert('Lỗi', 'Vui lòng chọn mối quan hệ với người cao tuổi.');
      return;
    }
    if (!useMyInfo && (!emergencyName.trim() || !emergencyPhone.trim() || (!emergencyRelationshipOption && emergencyCustomRelationship.trim() === ''))) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin liên hệ khẩn cấp.');
      return;
    }
    
    try {
      setSubmitting(true);
      
      // Prepare emergency contact
      const selectedRelationship = relationshipOption === 'khác' ? customRelationship.trim() : relationshipOption;
      const emergencySelectedRelationship = useMyInfo
        ? selectedRelationship
        : (emergencyRelationshipOption === 'khác' ? emergencyCustomRelationship.trim() : emergencyRelationshipOption);

      const emergencyContact = useMyInfo ? {
        name: currentUser?.full_name || '',
        phone: currentUser?.phone || '',
        relationship: emergencySelectedRelationship || selectedRelationship || ''
      } : {
        name: emergencyName.trim(),
        phone: emergencyPhone.trim(),
        relationship: emergencySelectedRelationship || ''
      };
      
      // Helper to format date as local YYYY-MM-DD (avoid timezone shift)
      const formatLocalYMD = (d) => {
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
      };

      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add basic fields
      formData.append('full_name', fullName.trim());
      formData.append('gender', gender);
      // Use local date components to avoid UTC conversion changing the day
      formData.append('date_of_birth', formatLocalYMD(dateOfBirth));
      // Use local date components to avoid timezone shift like DOB
      formData.append('admission_date', formatLocalYMD(admissionDate));
      formData.append('relationship', selectedRelationship || '');
      if (ENABLE_CCCD && cccdId.trim()) {
        formData.append('cccd_id', cccdId.trim());
      }
      formData.append('medical_history', medicalConditions.length > 0 ? medicalConditions.join(', ') : '');
      formData.append('current_medications', JSON.stringify([]));
      formData.append('allergies', JSON.stringify(allergies));
      formData.append('emergency_contact', JSON.stringify(emergencyContact));
      
      // Add avatar if exists
      if (avatarUri) {
        const avatarFile = {
          uri: avatarUri,
          type: 'image/jpeg',
          name: 'avatar.jpg',
        };
        formData.append('avatar', avatarFile, 'avatar.jpg');
      }
      
      // Add CCCD images
      if (ENABLE_CCCD && cccdFront) {
        const frontFile = {
          uri: cccdFront,
          type: 'image/jpeg',
          name: 'cccd_front.jpg',
        };
        formData.append('cccd_front', frontFile, 'cccd_front.jpg');
      }
      
      if (ENABLE_CCCD && cccdBack) {
        const backFile = {
          uri: cccdBack,
          type: 'image/jpeg',
          name: 'cccd_back.jpg',
        };
        formData.append('cccd_back', backFile, 'cccd_back.jpg');
      }
      
      console.log('FormData created for resident creation');
      const res = await residentService.createResident(formData);
      console.log('Create resident response:', res);
      
      if (res && res.success && res.data && (res.data._id || res.data.id)) {
        navigation.replace('FamilyCarePlanSelection', {
          resident: res.data,
          admissionDateISO: admissionDate.toISOString(),
        });
      } else {
        console.log('Resident creation failed:', res);
        Alert.alert('Lỗi', res?.error || 'Không thể tạo cư dân.');
      }
    } catch (e) {
      console.error('Create resident error', e);
      Alert.alert('Lỗi', 'Không thể tạo cư dân, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatVN = (d) => new Date(d).toLocaleDateString('vi-VN');

  const showImagePreview = (imageUri, type) => {
    setPreviewImage({ uri: imageUri, type });
    setShowImageModal(true);
  };
  const validateAge = (selectedDate) => {
    const today = new Date();
    let age = today.getFullYear() - selectedDate.getFullYear();
    const monthDiff = today.getMonth() - selectedDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate())) {
      age--;
    }
    if (age < 60) {
      Alert.alert('Lỗi', 'Người cao tuổi phải từ 60 tuổi trở lên.');
      return false;
    }
    if (age > 130) {
      Alert.alert('Lỗi', 'Tuổi không hợp lệ. Vui lòng kiểm tra lại ngày sinh.');
      return false;
    }
    return true;
  };

  // Progress indicator component
  const ProgressIndicator = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, styles.progressCircleActive]}>
          <Text style={[styles.progressNumber, styles.progressNumberActive]}>1</Text>
        </View>
        <Text style={[styles.progressLabel, styles.progressLabelActive]}>Thông tin người cao tuổi</Text>
      </View>
      <View style={[styles.progressLine, styles.progressLineActive]} />
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, styles.progressCircleInactive]}>
          <Text style={[styles.progressNumber, styles.progressNumberInactive]}>2</Text>
        </View>
        <Text style={[styles.progressLabel, styles.progressLabelInactive]}>Đăng ký gói dịch vụ</Text>
      </View>
      <View style={[styles.progressLine, styles.progressLineInactive]} />
      <View style={styles.progressStep}>
        <View style={[styles.progressCircle, styles.progressCircleInactive]}>
          <Text style={[styles.progressNumber, styles.progressNumberInactive]}>3</Text>
        </View>
        <Text style={[styles.progressLabel, styles.progressLabelInactive]}>Xác nhận và thanh toán</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông tin người cao tuổi</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ProgressIndicator />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
        {/* Avatar Section */}
        <View style={styles.avatarSection}>
          <CommonAvatar 
            size={100} 
            source={avatarUri}
            name={fullName}
            style={styles.avatar}
          />
          <Button
            mode="contained"
            onPress={() => pickImage('avatar')}
            style={styles.avatarUploadButton}
          >
            Tải Ảnh Lên
          </Button>
        </View>

        {/* Basic Information */}
        <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
        <TextInput
          mode="outlined"
          label="Họ và tên *"
          value={fullName}
          onChangeText={setFullName}
          style={styles.input}
        />
        
        <View style={styles.row}>
          <TouchableOpacity onPress={() => setGender('male')} style={[styles.pill, gender === 'male' && styles.pillActive]}>
            <Text style={[styles.pillText, gender === 'male' && styles.pillTextActive]}>Nam</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setGender('female')} style={[styles.pill, gender === 'female' && styles.pillActive]}>
            <Text style={[styles.pillText, gender === 'female' && styles.pillTextActive]}>Nữ</Text>
          </TouchableOpacity>
        </View>

        {/* Relationship to resident */}
        <Text style={styles.inputLabel}>Mối quan hệ với người cao tuổi *</Text>
        <View style={[styles.dropdownWrapper, relationshipDropdownOpen && styles.dropdownSpacer]}>
          <DropDownPicker
            open={relationshipDropdownOpen}
            value={relationshipOption}
            items={RELATIONSHIP_OPTIONS}
            setOpen={setRelationshipDropdownOpen}
            setValue={setRelationshipOption}
            setItems={() => {}}
            placeholder="Chọn mối quan hệ..."
            listMode="SCROLLVIEW"
            maxHeight={200}
            dropDownDirection="BOTTOM"
            zIndex={5000}
            zIndexInverse={2000}
            style={styles.dropdown}
            dropDownContainerStyle={styles.dropdownContainer}
            closeAfterSelecting={true}
            closeOnBackPressed={true}
            onChangeValue={(value) => {
              if (value !== 'khác') setCustomRelationship('');
            }}
          />
        </View>
        {relationshipOption === 'khác' && (
          <TextInput
            mode="outlined"
            label="Nhập mối quan hệ"
            value={customRelationship}
            onChangeText={setCustomRelationship}
            style={styles.input}
          />
        )}
        
        <TouchableOpacity onPress={() => setShowDobPicker(true)} activeOpacity={0.7}>
          <View pointerEvents="none">
            <TextInput mode="outlined" label="Ngày sinh *" value={formatVN(dateOfBirth)} style={styles.input} right={<TextInput.Icon icon="calendar" />} />
          </View>
        </TouchableOpacity>
        {showDobPicker && (
          <DateTimePicker
            value={dateOfBirth}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            minimumDate={new Date(new Date().getFullYear() - 130, 0, 1)}
            onChange={(e, d) => {
              setShowDobPicker(false);
              if (d) {
                if (validateAge(d)) {
                  setDateOfBirth(d);
                }
              }
            }}
          />
        )}
        
        <TouchableOpacity onPress={() => setShowAdmissionPicker(true)} activeOpacity={0.7}>
          <View pointerEvents="none">
            <TextInput mode="outlined" label="Ngày nhập viện (dự kiến) *" value={formatVN(admissionDate)} style={styles.input} right={<TextInput.Icon icon="calendar" />} />
          </View>
        </TouchableOpacity>
        {showAdmissionPicker && (
          <DateTimePicker
            value={admissionDate}
            mode="date"
            display="spinner"
            minimumDate={new Date()}
            onChange={(e, d) => { setShowAdmissionPicker(false); if (d) setAdmissionDate(d); }}
          />
        )}

        {/* CCCD Information */}
        {ENABLE_CCCD && (
        <>
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Thông Tin CCCD</Text>
        <TextInput
          mode="outlined"
          label="Số CCCD *"
          value={cccdId}
          onChangeText={setCccdId}
          style={styles.input}
          keyboardType="numeric"
          maxLength={12}
        />
        
        {/* CCCD Front Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Ảnh CCCD mặt trước *</Text>
          
          {cccdFront ? (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity
                style={styles.imagePreview}
                onPress={() => showImagePreview(cccdFront, 'front')}
              >
                <Image 
                  source={{ uri: cccdFront }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Ionicons name="eye" size={24} color="white" />
                  <Text style={styles.previewText}>Xem ảnh</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.imageInfo}>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => pickImage('cccd_front')}
                >
                  <Ionicons name="camera" size={16} color="#00A551" />
                  <Text style={styles.changeImageText}>Đổi ảnh</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('cccd_front')}
            >
              <Ionicons name="camera" size={24} color="#00A551" />
              <Text style={styles.uploadButtonText}>Chọn ảnh CCCD mặt trước</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* CCCD Back Upload */}
        <View style={styles.uploadSection}>
          <Text style={styles.uploadLabel}>Ảnh CCCD mặt sau *</Text>
          
          {cccdBack ? (
            <View style={styles.imagePreviewContainer}>
              <TouchableOpacity
                style={styles.imagePreview}
                onPress={() => showImagePreview(cccdBack, 'back')}
              >
                <Image 
                  source={{ uri: cccdBack }} 
                  style={styles.previewImage}
                  resizeMode="cover"
                />
                <View style={styles.imageOverlay}>
                  <Ionicons name="eye" size={24} color="white" />
                  <Text style={styles.previewText}>Xem ảnh</Text>
                </View>
              </TouchableOpacity>
              
              <View style={styles.imageInfo}>
                <TouchableOpacity
                  style={styles.changeImageButton}
                  onPress={() => pickImage('cccd_back')}
                >
                  <Ionicons name="camera" size={16} color="#00A551" />
                  <Text style={styles.changeImageText}>Đổi ảnh</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.uploadButton}
              onPress={() => pickImage('cccd_back')}
            >
              <Ionicons name="camera" size={24} color="#00A551" />
              <Text style={styles.uploadButtonText}>Chọn ảnh CCCD mặt sau</Text>
            </TouchableOpacity>
          )}
        </View>
        </>
        )}

        {/* Medical Information */}
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Thông Tin Y Tế</Text>
        
        <Text style={styles.inputLabel}>Tiền sử bệnh án</Text>
        <View style={styles.chipsContainer}>
          {medicalConditions.map((condition, index) => (
            <Chip key={index} style={styles.chip} onClose={() => removeMedicalCondition(index)}>
              {condition}
            </Chip>
          ))}
        </View>
        <View style={styles.addItemContainer}>
          <TextInput
            label="Thêm tiền sử bệnh án"
            value={currentCondition}
            onChangeText={setCurrentCondition}
            style={styles.addItemInput}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={addMedicalCondition}
            disabled={currentCondition.trim() === ''}
            style={styles.addButton}
          >
            Thêm
          </Button>
        </View>
        
        <Text style={styles.inputLabel}>Dị ứng</Text>
        <View style={styles.chipsContainer}>
          {allergies.map((allergy, index) => (
            <Chip key={index} style={styles.chip} onClose={() => removeAllergy(index)}>
              {allergy}
            </Chip>
          ))}
        </View>
        <View style={styles.addItemContainer}>
          <TextInput
            label="Thêm dị ứng"
            value={currentAllergy}
            onChangeText={setCurrentAllergy}
            style={styles.addItemInput}
            mode="outlined"
          />
          <Button
            mode="contained"
            onPress={addAllergy}
            disabled={currentAllergy.trim() === ''}
            style={styles.addButton}
          >
            Thêm
          </Button>
        </View>

        {/* Emergency Contact */}
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
        
        <TouchableOpacity 
          style={styles.checkboxRow} 
          onPress={() => setUseMyInfo(!useMyInfo)}
          activeOpacity={0.7}
        >
          <View style={[styles.checkbox, useMyInfo && styles.checkboxChecked]}>
            {useMyInfo && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxLabel}>
            Dùng thông tin của bạn ({currentUser?.full_name})
          </Text>
        </TouchableOpacity>

        {!useMyInfo && (
          <>
            <TextInput
              mode="outlined"
              label="Họ tên liên hệ khẩn cấp *"
              value={emergencyName}
              onChangeText={setEmergencyName}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Số điện thoại liên hệ khẩn cấp *"
              value={emergencyPhone}
              onChangeText={setEmergencyPhone}
              style={styles.input}
              keyboardType="phone-pad"
            />
            <Text style={styles.inputLabel}>Mối quan hệ *</Text>
            <View style={[styles.dropdownWrapper, emergencyRelationshipDropdownOpen && styles.dropdownSpacer]}>
              <DropDownPicker
                open={emergencyRelationshipDropdownOpen}
                value={emergencyRelationshipOption}
                items={RELATIONSHIP_OPTIONS}
                setOpen={setEmergencyRelationshipDropdownOpen}
                setValue={setEmergencyRelationshipOption}
                setItems={() => {}}
                placeholder="Chọn mối quan hệ..."
                listMode="SCROLLVIEW"
                maxHeight={200}
                dropDownDirection="BOTTOM"
                zIndex={4000}
                zIndexInverse={3000}
                style={styles.dropdown}
                dropDownContainerStyle={styles.dropdownContainer}
                closeAfterSelecting={true}
                closeOnBackPressed={true}
                onChangeValue={(value) => {
                  if (value !== 'khác') setEmergencyCustomRelationship('');
                }}
              />
            </View>
            {emergencyRelationshipOption === 'khác' && (
              <TextInput
                mode="outlined"
                label="Nhập mối quan hệ"
                value={emergencyCustomRelationship}
                onChangeText={setEmergencyCustomRelationship}
                style={styles.input}
              />
            )}
          </>
        )}

        <Button mode="contained" onPress={onCreate} loading={submitting} disabled={submitting} style={styles.submitButton} contentStyle={{ paddingVertical: 4 }}>
          Tiếp tục: Đăng ký gói dịch vụ
        </Button>
      </ScrollView>
      </KeyboardAvoidingView>

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {previewImage?.type === 'front' ? 'CCCD Mặt Trước' : 'CCCD Mặt Sau'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Instructions */}
            <View style={styles.modalInstructionsContainer}>
              <Text style={styles.modalInstructions}>
                Kiểm tra xem thông tin trên CCCD có rõ ràng và đầy đủ không
              </Text>
            </View>
            
            {/* Scrollable content for larger images */}
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Container */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: previewImage?.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            </ScrollView>
            
            {/* Footer with action button */}
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setShowImageModal(false)}
                style={styles.modalCloseButton}
                labelStyle={styles.modalCloseButtonLabel}
              >
                Đóng
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#212529', flex: 1, textAlign: 'center', marginRight: 40 },
  
  // Progress indicator styles - compact blue theme
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressCircleActive: {
    backgroundColor: COLORS.primary,
  },
  progressCircleInactive: {
    backgroundColor: '#E0E0E0',
  },
  progressNumber: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  progressNumberActive: {
    color: 'white',
  },
  progressNumberInactive: {
    color: '#9E9E9E',
  },
  progressLabel: {
    fontSize: 10,
    textAlign: 'center',
    fontWeight: '500',
  },
  progressLabelActive: {
    color: COLORS.primary,
  },
  progressLabelInactive: {
    color: '#9E9E9E',
  },
  progressLine: {
    height: 2,
    flex: 1,
    marginHorizontal: 6,
    marginBottom: 14,
  },
  progressLineActive: {
    backgroundColor: COLORS.primary,
  },
  progressLineInactive: {
    backgroundColor: '#E0E0E0',
  },
  
  content: { flex: 1, padding: 16 },
  
  // Avatar section
  avatarSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatar: {
    backgroundColor: COLORS.primary,
    marginBottom: 10,
  },
  uploadButton: {
    marginTop: 10,
  },
  avatarUploadButton: {
    marginTop: 10,
  },
  
  // Section titles
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginVertical: 15,
    marginBottom: 12,
  },
  
  input: { marginBottom: 16, backgroundColor: 'white' },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  
  row: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  pill: { flex: 1, borderWidth: 1, borderColor: COLORS.primary, borderRadius: 8, paddingVertical: 10, alignItems: 'center', backgroundColor: 'white' },
  pillActive: { backgroundColor: COLORS.primary },
  pillText: { color: COLORS.primary, fontWeight: '600' },
  pillTextActive: { color: 'white' },
  
  
  // Medical info styles
  divider: {
    marginVertical: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  chip: {
    margin: 4,
  },
  addItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  addItemInput: {
    flex: 1,
    marginRight: 10,
  },
  addButton: {
    paddingHorizontal: 10,
  },
  
  // Emergency contact styles
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ddd',
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxChecked: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  checkmark: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  
  submitButton: { marginTop: 8, backgroundColor: COLORS.primary, borderRadius: 10 },
  dropdown: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  dropdownContainer: {
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 6,
  },
  dropdownWrapper: {
    zIndex: 5000,
    marginBottom: 15,
  },
  dropdownSpacer: {
    paddingBottom: 220,
  },
  
  // Upload section styles
  uploadSection: {
    marginBottom: 16,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00A551',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#00A551',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8,
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 120,
    backgroundColor: '#f5f5f5',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00A551',
  },
  changeImageText: {
    fontSize: 12,
    color: '#00A551',
    fontWeight: '500',
    marginLeft: 4,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  modalInstructionsContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 500,
  },
  modalImage: {
    width: '100%',
    height: Math.min(500, 600),
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCloseButton: {
    backgroundColor: '#00A551',
    borderRadius: 8,
    paddingVertical: 4,
  },
  modalCloseButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilyAddResidentScreen;
