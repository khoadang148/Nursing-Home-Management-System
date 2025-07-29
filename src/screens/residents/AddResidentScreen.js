import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
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
  RadioButton,
  Checkbox
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import * as ImagePicker from 'expo-image-picker';
import { userService } from '../../api/services/userService';
import residentService from '../../api/services/residentService';
import { useDispatch } from 'react-redux';
import { createResident } from '../../redux/slices/residentSlice';

const AddResidentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  
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
  const [familyList, setFamilyList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedFamilyId, setSelectedFamilyId] = useState(null);
  const [isCreatingNewFamily, setIsCreatingNewFamily] = useState(false);
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyRelationship, setFamilyRelationship] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyMenuVisible, setFamilyMenuVisible] = useState(false);
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  

  
  // Liên hệ khẩn cấp
  const [useSameAsFamilyMember, setUseSameAsFamilyMember] = useState(false);
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  
  // Thay input mối quan hệ với cư dân này thành dropdown + input nếu chọn 'khác'
  const RELATIONSHIP_OPTIONS = [
    { label: 'Con trai', value: 'con trai' },
    { label: 'Con gái', value: 'con gái' },
    { label: 'Cháu trai', value: 'cháu trai' },
    { label: 'Cháu gái', value: 'cháu gái' },
    { label: 'Anh em', value: 'anh em' },
    { label: 'Vợ/chồng', value: 'vợ/chồng' },
    { label: 'Khác', value: 'khác' },
  ];
  // State cho dropdown và input khác
  const [relationshipOption, setRelationshipOption] = useState('');
  const [customRelationship, setCustomRelationship] = useState('');
  const [relationshipMenuVisible, setRelationshipMenuVisible] = useState(false);
  
  // State cho dropdown mối quan hệ khi tạo mới người thân
  const [newFamilyRelationshipOption, setNewFamilyRelationshipOption] = useState('');
  const [newFamilyCustomRelationship, setNewFamilyCustomRelationship] = useState('');
  const [newFamilyRelationshipMenuVisible, setNewFamilyRelationshipMenuVisible] = useState(false);
  
  // State cho dropdown mối quan hệ liên hệ khẩn cấp
  const [emergencyRelationshipOption, setEmergencyRelationshipOption] = useState('');
  const [emergencyCustomRelationship, setEmergencyCustomRelationship] = useState('');
  const [emergencyRelationshipMenuVisible, setEmergencyRelationshipMenuVisible] = useState(false);
  
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
    Alert.alert(
      'Chọn ảnh',
      'Chọn cách lấy ảnh',
      [
        {
          text: 'Chụp ảnh',
          onPress: async () => {
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
              setAvatarUri(result.assets[0].uri);
            }
          }
        },
        {
          text: 'Chọn từ thư viện',
          onPress: async () => {
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
              setAvatarUri(result.assets[0].uri);
            }
          }
        },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };



  const handleSubmit = async () => {
    // Prevent double submit
    if (loading) {
      return;
    }
    
    // Validate required fields
    if (!fullName) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên cư dân!');
      return;
    }
    
    // Validate family member information
    if (!isCreatingNewFamily && !selectedFamilyId) {
      Alert.alert('Lỗi', 'Vui lòng chọn người thân từ danh sách!');
      return;
    }
    
    if (isCreatingNewFamily && (!familyName || !familyPhone || !newFamilyRelationshipOption)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin người thân!');
      return;
    }
    
    if (!isCreatingNewFamily && selectedFamilyId && !relationshipOption) {
      Alert.alert('Lỗi', 'Vui lòng chọn mối quan hệ với cư dân!');
      return;
    }
    
    if (!useSameAsFamilyMember && (!emergencyName || !emergencyPhone || !emergencyRelationshipOption)) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin liên hệ khẩn cấp!');
      return;
    }

    // Validate relationship values
    const validRelationships = ['con trai', 'con gái', 'cháu trai', 'cháu gái', 'anh em', 'vợ/chồng', 'khác'];
    const finalFamilyRelationship = isCreatingNewFamily 
      ? (newFamilyRelationshipOption === 'khác' ? newFamilyCustomRelationship : newFamilyRelationshipOption)
      : (relationshipOption === 'khác' ? customRelationship : relationshipOption);
    
    if (!validRelationships.includes(finalFamilyRelationship)) {
      Alert.alert('Lỗi', 'Mối quan hệ với người thân không hợp lệ!');
      return;
    }

    const finalEmergencyRelationship = useSameAsFamilyMember 
      ? finalFamilyRelationship 
      : (emergencyRelationshipOption === 'khác' ? emergencyCustomRelationship : emergencyRelationshipOption);

    if (!useSameAsFamilyMember && !validRelationships.includes(finalEmergencyRelationship)) {
      Alert.alert('Lỗi', 'Mối quan hệ với liên hệ khẩn cấp không hợp lệ!');
      return;
    }

    try {
      setLoading(true);
      
      let familyMemberId = null;
      
      // Bước 1: Tạo user mới nếu là tạo mới người thân
      if (isCreatingNewFamily) {
        // Tạo username tự động
        const username = await generateUniqueUsername(familyName);
        console.log('Generated username for family member:', username);
        
        const newFamilyUser = {
          full_name: familyName,
          email: familyEmail,
          phone: familyPhone,
          username: username,
          password: '123456', // Password mặc định
          role: 'family',
          address: familyAddress,
          notes: `Người thân của ${fullName}`,
        };
        
        const familyUserResponse = await userService.createUser(newFamilyUser);
        console.log('Family user response:', JSON.stringify(familyUserResponse, null, 2));
        
        if (!familyUserResponse || !familyUserResponse._id) {
          throw new Error('Failed to create family user');
        }
        
        familyMemberId = familyUserResponse._id;
      } else {
        // Nếu chọn từ danh sách có sẵn
        familyMemberId = selectedFamilyId;
      }
      
      // Bước 2: Chuẩn bị dữ liệu resident
      const residentData = {
        full_name: fullName,
        date_of_birth: dateOfBirth.toISOString().split('T')[0], // Format: YYYY-MM-DD
        gender: gender,
        avatar: avatarUri || null,
        family_member_id: familyMemberId,
        relationship: finalFamilyRelationship,
        
        // Thông tin liên hệ khẩn cấp
        emergency_contact: useSameAsFamilyMember ? {
          // Sử dụng thông tin người thân
          name: isCreatingNewFamily ? familyName : familyList.find(f => f._id === selectedFamilyId)?.full_name,
          phone: isCreatingNewFamily ? familyPhone : familyList.find(f => f._id === selectedFamilyId)?.phone,
          relationship: finalFamilyRelationship,
        } : {
          name: emergencyName,
          phone: emergencyPhone,
          relationship: finalEmergencyRelationship,
        },
        
        medical_history: medicalConditions.length > 0 ? medicalConditions.join(', ') : '',
        current_medications: [], // Mảng rỗng vì chưa có thuốc
        allergies: allergies,
      };
      
      // Bước 3: Tạo resident thông qua Redux
      console.log('Sending resident data:', JSON.stringify(residentData, null, 2));
      const result = await dispatch(createResident(residentData));
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      Alert.alert('Thành công', 'Đã thêm cư dân mới thành công!');
      navigation.goBack();
      
    } catch (error) {
      console.error('Error creating resident:', error);
      Alert.alert('Lỗi', 'Không thể thêm cư dân. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
      navigation.goBack();
  };

  const hasUnsavedChanges = () => {
    return fullName !== '' || 
           gender !== 'male' ||
           dateOfBirth !== new Date(1950, 0, 1) ||
           medicalConditions.length > 0 || 
           allergies.length > 0 ||
           selectedFamilyId !== null ||
           isCreatingNewFamily ||
           familyName !== '' ||
           familyPhone !== '' ||
           familyEmail !== '' ||
           newFamilyRelationshipOption !== '' ||
           newFamilyCustomRelationship !== '' ||
           familyAddress !== '' ||
           relationshipOption !== '' ||
           customRelationship !== '' ||
           emergencyName !== '' ||
           emergencyPhone !== '' ||
           emergencyRelationshipOption !== '' ||
           emergencyCustomRelationship !== '';
  };

  const familyInputRef = useRef();

  // Function tạo username tự động từ tên
  const generateUsername = (fullName) => {
    if (!fullName) return '';
    
    // Tách tên thành các phần
    const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
    
    if (nameParts.length === 0) return '';
    
    // Lấy phần cuối (tên) và chuyển thành lowercase, bỏ dấu
    const lastName = nameParts[nameParts.length - 1]
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, ''); // Bỏ dấu tiếng Việt
    
    // Lấy chữ cái đầu của họ và tên đệm
    let initials = '';
    for (let i = 0; i < nameParts.length - 1; i++) {
      const initial = nameParts[i].charAt(0).toLowerCase();
      initials += initial;
    }
    
    // Kết hợp: tên + chữ cái đầu của họ và tên đệm
    return lastName + initials;
  };

  // Function kiểm tra username có tồn tại không
  const checkUsernameExists = async (username) => {
    try {
      // Gọi API để kiểm tra username (cần implement trong backend)
      // Tạm thời return false
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false;
    }
  };

  // Function tạo username unique
  const generateUniqueUsername = async (fullName) => {
    let baseUsername = generateUsername(fullName);
    let username = baseUsername;
    let counter = 1;
    
    // Kiểm tra username có tồn tại không
    while (await checkUsernameExists(username)) {
      username = `${baseUsername}${counter}`;
      counter++;
    }
    
    return username;
  };

  // Test function để kiểm tra username generation
  const testUsernameGeneration = () => {
    const testNames = [
      'Nguyễn Hoàng Nam',
      'Trần Lê Chi Bảo',
      'Lê Thị Mai',
      'Phạm Văn Sơn',
      'Nguyễn Văn A',
      'Trần Văn Minh',
      'Lê Văn Bình'
    ];
    
    console.log('=== Testing Username Generation ===');
    testNames.forEach(name => {
      const username = generateUsername(name);
      console.log(`Name: ${name} -> Username: ${username}`);
    });
    console.log('=== End Testing ===');
  };

  // Load danh sách family users khi component mount
  useEffect(() => {
    loadFamilyUsers();
    // Test username generation
    testUsernameGeneration();
  }, []);

  // Debug log để kiểm tra familyList
  useEffect(() => {
    console.log('FamilyList state updated:', familyList);
  }, [familyList]);

  const loadFamilyUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getUsersByRole('family');
      console.log('Family users loaded:', response);
      setFamilyList(response || []);
    } catch (error) {
      console.error('Error loading family users:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách người thân. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Tự động điền thông tin liên hệ khẩn cấp khi tick checkbox
  useEffect(() => {
    if (useSameAsFamilyMember) {
      if (!isCreatingNewFamily && selectedFamilyId) {
        // Nếu chọn từ danh sách có sẵn
        const selectedFamily = familyList.find(f => f.id === selectedFamilyId);
        if (selectedFamily) {
          setEmergencyName(selectedFamily.full_name || '');
          setEmergencyPhone(selectedFamily.phone || '');
          setEmergencyRelationshipOption(relationshipOption);
          setEmergencyCustomRelationship(customRelationship);
        }
      } else if (isCreatingNewFamily) {
        // Nếu tạo mới người thân
        setEmergencyName(familyName);
        setEmergencyPhone(familyPhone);
        setEmergencyRelationshipOption(newFamilyRelationshipOption);
        setEmergencyCustomRelationship(newFamilyCustomRelationship);
      }
    }
  }, [useSameAsFamilyMember, isCreatingNewFamily, selectedFamilyId, familyList, relationshipOption, customRelationship, familyName, familyPhone, newFamilyRelationshipOption, newFamilyCustomRelationship]);

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
          <Text style={styles.sectionTitle}>Thông Tin Người Thân</Text>
          <Text style={styles.sectionSubtitle}>Thông tin người đăng ký cho cư dân</Text>
          
          <View style={styles.simpleCheckboxContainer}>
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setIsCreatingNewFamily(false)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, !isCreatingNewFamily && styles.checkboxChecked]}>
                {!isCreatingNewFamily && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Chọn từ danh sách có sẵn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.checkboxRow} 
              onPress={() => setIsCreatingNewFamily(true)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, isCreatingNewFamily && styles.checkboxChecked]}>
                {isCreatingNewFamily && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Tạo mới người thân</Text>
            </TouchableOpacity>
          </View>
          {!isCreatingNewFamily ? (
            <>
              <View style={{ marginBottom: 10 }}>
                <Text style={{ color: COLORS.textSecondary, marginBottom: 5 }}>
                  Danh sách người thân ({familyList.length} người) {loading && '(Đang tải...)'}
                </Text>
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
                        label="Chọn người thân *"
                        value={
                          selectedFamilyId
                            ? `${familyList.find(f => f._id === selectedFamilyId)?.full_name || ''} - ${familyList.find(f => f._id === selectedFamilyId)?.phone || ''}`
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
                  {familyList.length > 0 ? (
                    familyList.map(f => (
                      <Menu.Item
                        key={f._id}
                        onPress={() => {
                          setSelectedFamilyId(f._id);
                          setFamilyMenuVisible(false);
                        }}
                        title={
                          <Text style={{ flexWrap: 'wrap', width: '100%' }}>
                            {`${f.full_name} - ${f.phone}`}
                          </Text>
                        }
                      />
                    ))
                  ) : (
                    <Menu.Item
                      title="Không có dữ liệu"
                      disabled
                    />
                  )}
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
                      Email: {familyList.find(f => f._id === selectedFamilyId)?.email || ''}
                    </Text>
                    <Text style={{ color: COLORS.textSecondary }}>
                      Địa chỉ: {familyList.find(f => f._id === selectedFamilyId)?.address || ''}
                    </Text>
                  </View>
                </>
              )}
            </>
          ) : (
            <>
              <TextInput
                label="Họ tên người thân *"
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
              <Text style={styles.inputLabel}>Mối quan hệ với cư dân *</Text>
              <Menu
                visible={newFamilyRelationshipMenuVisible}
                onDismiss={() => setNewFamilyRelationshipMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setNewFamilyRelationshipMenuVisible(true)}
                    activeOpacity={0.7}
                  >
                    <TextInput
                      label="Chọn mối quan hệ *"
                      value={
                        newFamilyRelationshipOption
                          ? RELATIONSHIP_OPTIONS.find(opt => opt.value === newFamilyRelationshipOption)?.label || newFamilyRelationshipOption
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
                      setNewFamilyRelationshipOption(opt.value);
                      setNewFamilyRelationshipMenuVisible(false);
                      if (opt.value !== 'khác') setNewFamilyCustomRelationship('');
                    }}
                    title={opt.label}
                  />
                ))}
              </Menu>
              {newFamilyRelationshipOption === 'khác' && (
                <TextInput
                  label="Nhập mối quan hệ"
                  value={newFamilyCustomRelationship}
                  onChangeText={setNewFamilyCustomRelationship}
                  style={styles.input}
                  mode="outlined"
                />
              )}
              <TextInput
                label="Địa chỉ"
                value={familyAddress}
                onChangeText={setFamilyAddress}
                style={styles.input}
                mode="outlined"
              />
            </>
          )}

          <Divider style={styles.divider} />
          <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
          <Text style={styles.sectionSubtitle}>Thông tin liên hệ khi có tình huống khẩn cấp</Text>

          <TouchableOpacity 
            style={styles.checkboxRow} 
            onPress={() => setUseSameAsFamilyMember(!useSameAsFamilyMember)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, useSameAsFamilyMember && styles.checkboxChecked]}>
              {useSameAsFamilyMember && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.checkboxLabel}>
              Giống thông tin người thân (người đăng ký)
            </Text>
          </TouchableOpacity>

          {!useSameAsFamilyMember && (
            <>
              <TextInput
                label="Họ tên liên hệ khẩn cấp *"
                value={emergencyName}
                onChangeText={setEmergencyName}
                style={styles.input}
                mode="outlined"
              />
              <TextInput
                label="Số điện thoại liên hệ khẩn cấp *"
                value={emergencyPhone}
                onChangeText={setEmergencyPhone}
                style={styles.input}
                mode="outlined"
                keyboardType="phone-pad"
              />
              <Text style={styles.inputLabel}>Mối quan hệ với cư dân *</Text>
              <Menu
                visible={emergencyRelationshipMenuVisible}
                onDismiss={() => setEmergencyRelationshipMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.input}
                    onPress={() => setEmergencyRelationshipMenuVisible(true)}
                    activeOpacity={0.7}
                  >
                    <TextInput
                      label="Chọn mối quan hệ *"
                      value={
                        emergencyRelationshipOption
                          ? RELATIONSHIP_OPTIONS.find(opt => opt.value === emergencyRelationshipOption)?.label || emergencyRelationshipOption
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
                      setEmergencyRelationshipOption(opt.value);
                      setEmergencyRelationshipMenuVisible(false);
                      if (opt.value !== 'khác') setEmergencyCustomRelationship('');
                    }}
                    title={opt.label}
                  />
                ))}
              </Menu>
              {emergencyRelationshipOption === 'khác' && (
                <TextInput
                  label="Nhập mối quan hệ"
                  value={emergencyCustomRelationship}
                  onChangeText={setEmergencyCustomRelationship}
                  style={styles.input}
                  mode="outlined"
                />
              )}
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
              disabled={!fullName || loading}
              loading={loading}
            >
              {loading ? 'Đang lưu...' : 'Lưu Cư Dân'}
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
  sectionSubtitle: {
    ...FONTS.body4,
    marginBottom: 10,
    color: COLORS.textSecondary,
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
  simpleCheckboxContainer: {
    marginBottom: 15,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
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
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  checkboxLabel: {
    ...FONTS.body3,
    color: COLORS.text,
    flex: 1,
  },
});

export default AddResidentScreen; 