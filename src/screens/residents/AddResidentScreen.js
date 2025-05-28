import React, { useState } from 'react';
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
  List
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';

const AddResidentScreen = ({ navigation }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [roomNumber, setRoomNumber] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState(new Date(1950, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [careLevel, setCareLevel] = useState('Trung Bình');
  const [careLevelMenuVisible, setCareLevelMenuVisible] = useState(false);
  const [medicalConditions, setMedicalConditions] = useState([]);
  const [currentCondition, setCurrentCondition] = useState('');
  const [allergies, setAllergies] = useState([]);
  const [currentAllergy, setCurrentAllergy] = useState('');
  const [doctor, setDoctor] = useState('');
  const [dietaryRestrictions, setDietaryRestrictions] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactRelation, setEmergencyContactRelation] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [emergencyContactEmail, setEmergencyContactEmail] = useState('');
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  
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

  const handleSubmit = () => {
    // Here you would typically dispatch an action to add the resident to the store
    // For this example, we'll just navigate back
    navigation.goBack();
  };

  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setDiscardDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const hasUnsavedChanges = () => {
    return firstName !== '' || 
           lastName !== '' || 
           roomNumber !== '' || 
           medicalConditions.length > 0 || 
           allergies.length > 0 ||
           doctor !== '' ||
           dietaryRestrictions !== '' ||
           emergencyContactName !== '';
  };

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
            <Avatar.Icon
              size={100}
              icon="account"
              style={styles.avatar}
              color={COLORS.surface}
            />
            <Button
              mode="contained"
              onPress={() => console.log('Upload photo')}
              style={styles.uploadButton}
            >
              Tải Ảnh Lên
            </Button>
          </View>

          <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              label="Họ *"
              value={firstName}
              onChangeText={setFirstName}
              style={styles.inputHalf}
              mode="outlined"
            />
            <TextInput
              label="Tên *"
              value={lastName}
              onChangeText={setLastName}
              style={styles.inputHalf}
              mode="outlined"
            />
          </View>

          <TextInput
            label="Số Phòng *"
            value={roomNumber}
            onChangeText={setRoomNumber}
            style={styles.input}
            mode="outlined"
            keyboardType="numeric"
          />

          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
            <TextInput
              label="Ngày Sinh *"
              value={format(dateOfBirth, 'dd/MM/yyyy')}
              editable={false}
              mode="outlined"
              right={<TextInput.Icon icon="calendar" />}
              style={styles.input}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={onChangeDateOfBirth}
              maximumDate={new Date()}
            />
          )}

          <TouchableOpacity 
            onPress={() => setCareLevelMenuVisible(true)}
            style={styles.careLevelContainer}
          >
            <Text style={styles.inputLabel}>Mức Độ Chăm Sóc *</Text>
            <View style={styles.careLevelSelector}>
              <Text style={styles.careLevelText}>{careLevel}</Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={COLORS.textPrimary} />
            </View>
            <Menu
              visible={careLevelMenuVisible}
              onDismiss={() => setCareLevelMenuVisible(false)}
              anchor={<View />}
              style={styles.careLevelMenu}
            >
              <Menu.Item 
                onPress={() => {
                  setCareLevel('Thấp');
                  setCareLevelMenuVisible(false);
                }}
                title="Thấp"
              />
              <Menu.Item 
                onPress={() => {
                  setCareLevel('Trung Bình');
                  setCareLevelMenuVisible(false);
                }}
                title="Trung Bình"
              />
              <Menu.Item 
                onPress={() => {
                  setCareLevel('Cao');
                  setCareLevelMenuVisible(false);
                }}
                title="Cao" 
              />
            </Menu>
          </TouchableOpacity>

          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Thông Tin Y Tế</Text>

          <TextInput
            label="Bác Sĩ Chính"
            value={doctor}
            onChangeText={setDoctor}
            style={styles.input}
            mode="outlined"
          />

          <Text style={styles.inputLabel}>Tình Trạng Bệnh Lý</Text>
          <View style={styles.chipsContainer}>
            {medicalConditions.map((condition, index) => (
              <Chip 
                key={index}
                style={styles.chip}
                onClose={() => removeMedicalCondition(index)}
              >
                {condition}
              </Chip>
            ))}
          </View>
          <View style={styles.addItemContainer}>
            <TextInput
              label="Thêm Tình Trạng Bệnh Lý"
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

          <Text style={styles.inputLabel}>Dị Ứng</Text>
          <View style={styles.chipsContainer}>
            {allergies.map((allergy, index) => (
              <Chip 
                key={index}
                style={styles.chip}
                onClose={() => removeAllergy(index)}
              >
                {allergy}
              </Chip>
            ))}
          </View>
          <View style={styles.addItemContainer}>
            <TextInput
              label="Thêm Dị Ứng"
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

          <TextInput
            label="Hạn Chế Chế Độ Ăn"
            value={dietaryRestrictions}
            onChangeText={setDietaryRestrictions}
            style={styles.input}
            mode="outlined"
            multiline
          />

          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>

          <TextInput
            label="Họ Tên"
            value={emergencyContactName}
            onChangeText={setEmergencyContactName}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Mối Quan Hệ"
            value={emergencyContactRelation}
            onChangeText={setEmergencyContactRelation}
            style={styles.input}
            mode="outlined"
          />

          <TextInput
            label="Số Điện Thoại"
            value={emergencyContactPhone}
            onChangeText={setEmergencyContactPhone}
            style={styles.input}
            mode="outlined"
            keyboardType="phone-pad"
          />

          <TextInput
            label="Email"
            value={emergencyContactEmail}
            onChangeText={setEmergencyContactEmail}
            style={styles.input}
            mode="outlined"
            keyboardType="email-address"
          />

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
              disabled={!firstName || !lastName || !roomNumber}
            >
              Lưu Cư Dân
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Portal>
        <Dialog
          visible={discardDialogVisible}
          onDismiss={() => setDiscardDialogVisible(false)}
          style={styles.dialog}
        >
          <Dialog.Title>Hủy Thay Đổi?</Dialog.Title>
          <Dialog.Content>
            <Text>Bạn có những thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy bỏ chúng không?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDiscardDialogVisible(false)}>Hủy</Button>
            <Button onPress={() => {
              setDiscardDialogVisible(false);
              navigation.goBack();
            }}>Bỏ Qua</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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