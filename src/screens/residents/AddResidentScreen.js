import React, { useState, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Text, 
  Button, 
  Avatar, 
  Chip,
  HelperText,
  Divider,
  Menu,
  Portal,
  Dialog,
  List,
  RadioButton
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { familyMembers as mockFamilyMembers } from '../../api/mockData';

const AddResidentScreen = ({ navigation }) => {
  // Resident states
  // Replace firstName, lastName with fullName
  const [fullName, setFullName] = useState('');
  // Gender state
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1950, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [currentCondition, setCurrentCondition] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [currentAllergy, setCurrentAllergy] = useState('');
  // Remove roomNumber, doctor, dietaryRestrictions
  const [avatarUri, setAvatarUri] = useState(null);

  // Family/Emergency contact states
  const [familyList, setFamilyList] = useState(mockFamilyMembers);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [isCreatingNewFamily, setIsCreatingNewFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyRelationship, setFamilyRelationship] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyMenuVisible, setFamilyMenuVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  
  // Thay input mối quan hệ với cư dân này thành dropdown + input nếu chọn 'khác'
  const RELATIONSHIP_OPTIONS = [
    { label: 'Con trai', value: 'con trai' },
    { label: 'Con gái', value: 'con gái' },
    { label: 'Cháu trai', value: 'cháu trai' },
    { label: 'Cháu gái', value: 'cháu gái' },
    { label: 'Anh em', value: 'anh em' },
    { label: 'Chị em', value: 'chị em' },
    { label: 'Vợ/chồng', value: 'vợ/chồng' },
    { label: 'Khác', value: 'khác' },
  ];
  // State cho dropdown và input khác
  const [relationshipOption, setRelationshipOption] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [relationshipMenuVisible, setRelationshipMenuVisible] = useState(false);

  const onChangeDateOfBirth = (event, selectedDate) => {
    const currentDate = selectedDate || dateOfBirth;
    setShowDatePicker(Platform.OS === 'ios');
    setDateOfBirth(currentDate);
  };

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

  // Image picker logic
  const pickAvatar = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  // Mock API for adding family member
  const addFamilyMember = async (family) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        const newId = 'f' + (familyList.length + 1);
        const newFamily = {
          id: newId,
          full_name: family.name,
          phone: family.phone,
          email: family.email,
          relationship: family.relationship,
          address: family.address,
          photo: '',
          role: 'family',
          status: 'active',
          residentIds: [],
          created_at: new Date(),
          updated_at: new Date(),
        };
        setFamilyList([...familyList, newFamily]);
        resolve(newFamily);
      }, 500);
    });
  };

  // Mock API for adding resident
  const addResident = async (resident) => {
    // Simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...resident, _id: 'res_' + Math.floor(Math.random() * 10000) });
      }, 500);
    });
  };

  const handleSubmit = async () => {
    let familyId = selectedFamilyId;
    let familyObj = null;
    if (isCreatingNewFamily) {
      // Validate required fields
      if (!familyName || !familyPhone || !familyRelationship) {
        alert('Vui lòng nhập đầy đủ thông tin liên hệ khẩn cấp!');
        return;
      }
      // Add new family member
      const newFamily = await addFamilyMember({
        name: familyName,
        phone: familyPhone,
        email: familyEmail,
        relationship: familyRelationship,
        address: familyAddress,
      });
      familyId = newFamily.id;
      familyObj = newFamily;
    } else {
      familyObj = familyList.find(f => f.id === selectedFamilyId);
      if (!familyObj) {
        alert('Vui lòng chọn liên hệ khẩn cấp!');
        return;
      }
    }
    // Khi chọn family member có sẵn hoặc tạo mới, thay input mối quan hệ:
    const relationshipToSave = relationshipOption === 'khác' ? customRelationship : relationshipOption;
    // Build resident object
    const resident = {
      full_name: fullName, // Use fullName
      date_of_birth: dateOfBirth,
      gender: gender, // Use gender
      avatar: avatarUri || '',
      admission_date: new Date(),
      family_member_id: familyId,
      relationship: relationshipToSave,
      medical_history: medicalConditions.join(', '),
      current_medications: [], // TODO: add medication input if needed
      allergies: allergies,
      // Remove room_number, doctor, dietary_restrictions
      created_at: new Date(),
      updated_at: new Date(),
    };
    await addResident(resident);
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const hasUnsavedChanges = () => {
    return fullName !== '' || 
           gender !== 'male' || // Changed from firstName/lastName
           dateOfBirth !== new Date(1950, 0, 1) || // Changed from firstName/lastName
           medicalConditions.length > 0 || 
           allergies.length > 0;
  };

  const familyInputRef = useRef();

  // --- UI ---
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Thêm Cư Dân Mới" />
      </Appbar.Header>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.photoContainer}>
            {avatarUri ? (
              <Avatar.Image size={100} source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <Avatar.Icon size={100} icon="account" style={styles.avatar} color={COLORS.surface} />
            )}
            <Button
              mode="contained"
              onPress={pickAvatar}
              style={styles.uploadButton}
            >
              Tải Ảnh Lên
            </Button>
          </View>

          <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
          <TextInput
            label="Họ và tên *"
            value={fullName}
            onChangeText={setFullName}
            style={styles.input}
            mode="outlined"
          />
          <Text style={styles.inputLabel}>Giới tính *</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
            {[{ label: 'Nam', value: 'male' }, { label: 'Nữ', value: 'female' }].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                onPress={() => setGender(opt.value)}
                activeOpacity={0.7}
              >
                <RadioButton value={opt.value} status={gender === opt.value ? 'checked' : 'unchecked'} onPress={() => setGender(opt.value)} />
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={{ marginBottom: 15 }}>
            <Text style={styles.inputLabel}>Ngày sinh *</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <View pointerEvents="none">
                <TextInput
                  label="Ngày sinh *"
                  value={format(dateOfBirth, 'dd/MM/yyyy')}
                  editable={false}
                  mode="outlined"
                  right={<TextInput.Icon icon="calendar" />}
                  style={styles.input}
                />
              </View>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={dateOfBirth}
                mode="date"
                display="spinner"
                onChange={(event, selectedDate) => {
                  setShowDatePicker(false);
                  if (selectedDate) setDateOfBirth(selectedDate);
                }}
                maximumDate={new Date()}
              />
            )}
          </View>

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

          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            {[{ label: 'Chọn từ danh sách có sẵn', value: 'select' }, { label: 'Tạo mới liên hệ', value: 'new' }].map(opt => (
              <TouchableOpacity
                key={opt.value}
                style={{ flexDirection: 'row', alignItems: 'center', marginRight: 24 }}
                onPress={() => setIsCreatingNewFamily(opt.value === 'new')}
                activeOpacity={0.7}
              >
                <RadioButton value={opt.value} status={isCreatingNewFamily === (opt.value === 'new') ? 'checked' : 'unchecked'} onPress={() => setIsCreatingNewFamily(opt.value === 'new')} />
                <Text>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {!isCreatingNewFamily ? (
            <>
              <View style={{ marginBottom: 10 }}>
                <Menu
                  visible={familyMenuVisible}
                  onDismiss={() => setFamilyMenuVisible(false)}
                  anchor={
                    <TouchableOpacity
                      style={styles.input}
                      onPress={() => setFamilyMenuVisible(true)}
                      activeOpacity={0.7}
                    >
                      <TextInput
                        label="Chọn liên hệ khẩn cấp *"
                        value={
                          selectedFamilyId
                            ? `${familyList.find(f => f.id === selectedFamilyId)?.full_name || ''} - ${familyList.find(f => f.id === selectedFamilyId)?.phone || ''}`
                            : ''
                        }
                        editable={false}
                        mode="outlined"
                        right={<TextInput.Icon icon="account-group" />}
                        pointerEvents="none"
                      />
                    </TouchableOpacity>
                  }
                  style={{ minWidth: 250, maxWidth: 350 }}
                >
                  {familyList.map(f => (
                    <Menu.Item
                      key={f.id}
                      onPress={() => {
                        setSelectedFamilyId(f.id);
                        setFamilyMenuVisible(false);
                      }}
                      title={
                        <Text style={{ flexWrap: 'wrap', width: '100%' }}>
                          {`${f.full_name} - ${f.phone}`}
                        </Text>
                      }
                    />
                  ))}
                </Menu>
              </View>
              {selectedFamilyId && (
                <>
                  <Text style={styles.inputLabel}>Mối quan hệ với cư dân này *</Text>
                  <Menu
                    visible={relationshipMenuVisible}
                    onDismiss={() => setRelationshipMenuVisible(false)}
                    anchor={
                      <TouchableOpacity
                        style={styles.input}
                        onPress={() => setRelationshipMenuVisible(true)}
                        activeOpacity={0.7}
                      >
                        <TextInput
                          label="Chọn mối quan hệ *"
                          value={
                            relationshipOption
                              ? RELATIONSHIP_OPTIONS.find(opt => opt.value === relationshipOption)?.label || relationshipOption
                              : ''
                          }
                          editable={false}
                          mode="outlined"
                          right={<TextInput.Icon icon="chevron-down" />}
                          pointerEvents="none"
                        />
                      </TouchableOpacity>
                    }
                    style={{ minWidth: 200, maxWidth: 300 }}
                  >
                    {RELATIONSHIP_OPTIONS.map(opt => (
                      <Menu.Item
                        key={opt.value}
                        onPress={() => {
                          setRelationshipOption(opt.value);
                          setRelationshipMenuVisible(false);
                          if (opt.value !== 'khác') setCustomRelationship('');
                        }}
                        title={opt.label}
                      />
                    ))}
                  </Menu>
                  {relationshipOption === 'khác' && (
                    <TextInput
                      label="Nhập mối quan hệ"
                      value={customRelationship}
                      onChangeText={setCustomRelationship}
                      style={styles.input}
                      mode="outlined"
                    />
                  )}
                  <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text style={{ color: COLORS.textSecondary }}>
                      Email: {familyList.find(f => f.id === selectedFamilyId)?.email || ''}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary }}>
                      Địa chỉ: {familyList.find(f => f.id === selectedFamilyId)?.address || ''}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <TextInput
                label="Họ tên *"
                value={familyName}
                onChangeText={setFamilyName}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Số điện thoại *"
                value={familyPhone}
                onChangeText={setFamilyPhone}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              <TextInput
                label="Email"
                value={familyEmail}
                onChangeText={setFamilyEmail}
                style={styles.input}
                mode="outlined"
                keyboardType="email-address"
              />
              <TextInput
                label="Mối quan hệ *"
                value={familyRelationship}
                onChangeText={setFamilyRelationship}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Địa chỉ"
                value={familyAddress}
                onChangeText={setFamilyAddress}
                style={styles.input}
                mode="outlined"
              />
            </>
          )}
          <View style={styles.buttonContainer}>
            <Button
              mode="outlined"
              onPress={handleBack}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
              disabled={!fullName}
            >
              Lưu Cư Dân
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
  appbar: {
    backgroundColor: COLORS.primary,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    padding: SIZES.padding,
    paddingBottom: 40,
  },
  photoContainer: {
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
  sectionTitle: {
    ...FONTS.h3,
    marginVertical: 10,
    color: COLORS.primary,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputHalf: {
    width: '48%',
    marginBottom: 15,
  },
  input: {
    marginBottom: 15,
  },
  inputLabel: {
    ...FONTS.body3,
    marginBottom: 8,
    color: COLORS.textSecondary,
  },
  datePickerButton: {
    marginBottom: 15,
  },
  careLevelContainer: {
    marginBottom: 15,
  },
  careLevelSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    padding: 15,
    backgroundColor: COLORS.surface,
  },
  careLevelText: {
    ...FONTS.body2,
  },
  careLevelMenu: {
    width: '80%',
    alignSelf: 'center',
  },
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
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.primary,
  },
  submitButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
  },
  submitButtonText: {
    color: COLORS.surface,
  },
  dialog: {
    borderRadius: SIZES.radius,
  },
});

export default AddResidentScreen; 