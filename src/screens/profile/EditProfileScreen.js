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
  const [saving, setSaving] = useState(false);

  // Thông tin không thể thay đổi (chỉ admin mới có thể)
  const position = userData.position || '';
  const joinDate = userData.join_date || '';
  const qualification = userData.qualification || '';
  const notes = userData.notes || '';

  // Format ngày theo định dạng Việt Nam (dd-mm-yyyy)
  const formatDateToVietnamese = (dateString) => {
    if (!dateString) return 'Chưa cập nhật';
    // Nếu là dạng yyyy-mm-dd thì chuyển sang dd-mm-yyyy
    if (/^\d{4}-\d{2}-\d{2}/.test(dateString)) {
      const [y, m, d] = dateString.split('-');
      return `${d}-${m}-${y}`;
    }
    return dateString;
  };

  const handleSave = () => {
    setSaving(true);
    // Dispatch cập nhật profile lên Redux - chỉ thông tin có thể thay đổi
    dispatch(updateProfile({
      ...reduxUser,
      full_name: fullName,
      email,
      phone,
      avatar,
      // Giữ nguyên thông tin không thể thay đổi
      position: reduxUser?.position || position,
      join_date: reduxUser?.join_date || joinDate,
      qualification: reduxUser?.qualification || qualification,
      notes: reduxUser?.notes || notes,
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

        {/* Thông tin không thể thay đổi - Chỉ admin mới có thể */}
        <View style={styles.readOnlySection}>
          <Text style={styles.readOnlyTitle}>Thông tin quản lý (Chỉ admin mới có thể thay đổi)</Text>
          
          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>Vị trí công việc</Text>
            <View style={styles.readOnlyValueContainer}>
              <Text style={styles.readOnlyValue}>{position || 'Chưa cập nhật'}</Text>
              <MaterialIcons name="lock" size={16} color={COLORS.textSecondary} style={styles.lockIcon} />
            </View>
          </View>

          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>Ngày vào làm</Text>
            <View style={styles.readOnlyValueContainer}>
              <Text style={styles.readOnlyValue}>{formatDateToVietnamese(joinDate)}</Text>
              <MaterialIcons name="lock" size={16} color={COLORS.textSecondary} style={styles.lockIcon} />
            </View>
          </View>

          <View style={styles.readOnlyItem}>
            <Text style={styles.readOnlyLabel}>Bằng cấp</Text>
            <View style={styles.readOnlyValueContainer}>
              <Text style={styles.readOnlyValue}>{qualification || 'Chưa cập nhật'}</Text>
              <MaterialIcons name="lock" size={16} color={COLORS.textSecondary} style={styles.lockIcon} />
            </View>
          </View>

          {notes && (
            <View style={styles.readOnlyItem}>
              <Text style={styles.readOnlyLabel}>Ghi chú</Text>
              <View style={styles.readOnlyValueContainer}>
                <Text style={styles.readOnlyValue}>{notes}</Text>
                <MaterialIcons name="lock" size={16} color={COLORS.textSecondary} style={styles.lockIcon} />
              </View>
            </View>
          )}
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
  readOnlySection: {
    marginTop: 20,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  readOnlyTitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 10,
    fontWeight: '600',
  },
  readOnlyItem: {
    marginBottom: 10,
  },
  readOnlyLabel: {
    ...FONTS.body3,
    marginBottom: 4,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  readOnlyValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
  },
  readOnlyValue: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
  },
  lockIcon: {
    marginLeft: 8,
  },
});

export default EditProfileScreen; 