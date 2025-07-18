import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView,
  Image,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { updateProfile } from '../../redux/slices/authSlice';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const reduxUser = useSelector((state) => state.auth.user);
  const userData = route.params?.userData || reduxUser || {
    full_name: '',
    email: '',
    phone: '',
    position: '',
    join_date: '',
    avatar: DEFAULT_AVATAR,
  };

  const [avatar, setAvatar] = useState(userData.avatar || DEFAULT_AVATAR);
  const [fullName, setFullName] = useState(userData.full_name || '');
  const [email, setEmail] = useState(userData.email || '');
  const [phone, setPhone] = useState(userData.phone || '');
  const [position, setPosition] = useState(userData.position || '');
  const [joinDate, setJoinDate] = useState(userData.join_date || '');
  const [qualification, setQualification] = useState(userData.qualification || '');
  const [notes, setNotes] = useState(userData.notes || '');
  const [saving, setSaving] = useState(false);

  const handleSave = () => {
    setSaving(true);
    // Dispatch cập nhật profile lên Redux
    dispatch(updateProfile({
      ...reduxUser,
      full_name: fullName,
      email,
      phone,
      position,
      join_date: joinDate,
      avatar,
      qualification,
      notes,
    }));
    setTimeout(() => {
      setSaving(false);
    navigation.goBack();
    }, 500);
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets && result.assets[0]?.uri) {
      setAvatar(result.assets[0].uri);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Chỉnh Sửa Hồ Sơ</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >

      <View style={styles.profileImageSection}>
        <View style={styles.profileImageContainer}>
          <Image 
            source={{ uri: avatar || DEFAULT_AVATAR }}
            style={styles.profileImage}
          />
        </View>
        <TouchableOpacity style={styles.changePhotoButton} onPress={pickImage}>
          <Text style={styles.changePhotoText}>Thay đổi ảnh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="Nhập họ và tên của bạn"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Nhập địa chỉ email của bạn"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Nhập số điện thoại của bạn"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Vị trí công việc</Text>
          <TextInput
            style={styles.input}
            value={position}
            onChangeText={setPosition}
            placeholder="Nhập vị trí công việc"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ngày vào làm</Text>
          <TextInput
            style={styles.input}
            value={joinDate}
            onChangeText={setJoinDate}
            placeholder="dd/mm/yyyy hoặc yyyy-mm-dd"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Bằng cấp</Text>
          <TextInput
            style={styles.input}
            value={qualification}
            onChangeText={setQualification}
            placeholder="Nhập bằng cấp chuyên môn"
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Ghi chú</Text>
          <TextInput
            style={[styles.input, {height: 60}]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Ghi chú thêm về nhân viên (nếu có)"
            multiline
          />
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, saving && { opacity: 0.7 }]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: COLORS.border,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  changePhotoButton: {
    marginBottom: 10,
  },
  changePhotoText: {
    color: COLORS.primary,
    fontSize: 16,
  },
  formSection: {
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    ...FONTS.body3,
    marginBottom: 8,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.text,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default EditProfileScreen; 