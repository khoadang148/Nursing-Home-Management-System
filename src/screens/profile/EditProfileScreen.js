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
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import { updateProfile } from '../../redux/slices/authSlice';
import userService from '../../api/services/userService';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';
import { getAvatarUri } from '../../utils/avatarUtils';

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
  const [errors, setErrors] = useState({});

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    }
    
    if (!email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    }
    
    if (!phone.trim()) {
      newErrors.phone = 'Số điện thoại không được để trống';
    } else if (!/^[0-9]{10,15}$/.test(phone)) {
      newErrors.phone = 'Số điện thoại không hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      // Chuẩn bị dữ liệu để gửi lên server
      const updateData = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
      };
      
      // Gọi API để cập nhật thông tin user
      console.log('DEBUG - Sending update data:', updateData);
      const response = await userService.updateUser(userData._id, updateData);
      console.log('DEBUG - API response:', response);
      
      if (response.success) {
        // Cập nhật Redux store với thông tin mới
        const updatedUserData = {
          ...reduxUser,
          ...response.data,
          // Giữ nguyên thông tin không thể thay đổi
          position: reduxUser?.position || position,
          join_date: reduxUser?.join_date || joinDate,
          qualification: reduxUser?.qualification || qualification,
          notes: reduxUser?.notes || notes,
        };
        
        console.log('DEBUG - Updating Redux store with:', updatedUserData);
        dispatch(updateProfile(updatedUserData));
        
        Alert.alert('Thành công', 'Đã cập nhật thông tin hồ sơ!');
        navigation.goBack();
      } else {
        console.error('DEBUG - Update failed:', response.error);
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật thông tin');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      
      // Nếu error đã được xử lý bởi userService (có response.success = false)
      if (error && typeof error === 'object' && 'success' in error) {
        console.log('DEBUG - Error already handled by service:', error);
        return;
      }
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = 'Không thể cập nhật thông tin. Vui lòng thử lại.';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
            break;
          case 404:
            errorMessage = 'Không tìm thấy thông tin người dùng.';
            break;
          case 409:
            errorMessage = 'Email đã được sử dụng bởi người dùng khác.';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            break;
          default:
            errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const pickImage = async () => {
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
      
      if (!result.canceled && result.assets && result.assets[0]?.uri) {
        await uploadAvatarToServer(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const uploadAvatarToServer = async (imageUri) => {
    try {
      setSaving(true);
      
      // Gọi API để upload avatar
      console.log('DEBUG - Uploading avatar from URI:', imageUri);
      const response = await userService.updateAvatar(userData._id, imageUri);
      console.log('DEBUG - Avatar upload response:', response);
      
      if (response.success) {
        // Cập nhật local state và Redux store với avatar mới
        const newAvatar = response.data.avatar;
        console.log('DEBUG - New avatar path:', newAvatar);
        setAvatar(newAvatar);
        
        const updatedUserData = { ...reduxUser, avatar: newAvatar };
        console.log('DEBUG - Updating Redux store with new avatar:', updatedUserData);
        dispatch(updateProfile(updatedUserData));
        
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
      } else {
        console.error('DEBUG - Avatar update failed:', response.error);
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật ảnh đại diện');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
      // Nếu error đã được xử lý bởi userService (có response.success = false)
      if (error && typeof error === 'object' && 'success' in error) {
        console.log('DEBUG - Avatar error already handled by service:', error);
        return;
      }
      
      // Xử lý các loại lỗi cụ thể
      let errorMessage = 'Không thể cập nhật ảnh đại diện. Vui lòng thử lại.';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
            break;
          case 401:
            errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
            break;
          case 403:
            errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
            break;
          case 404:
            errorMessage = 'Không tìm thấy thông tin người dùng.';
            break;
          case 413:
            errorMessage = 'Kích thước ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.';
            break;
          case 500:
            errorMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
            break;
          default:
            errorMessage = data?.message || errorMessage;
        }
      } else if (error.request) {
        errorMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setSaving(false);
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
            source={{ uri: getAvatarUri(avatar) }}
            style={styles.profileImage}
          />
        </View>
        <TouchableOpacity 
          style={styles.changePhotoButton} 
          onPress={pickImage}
          disabled={saving}
        >
          <Text style={[styles.changePhotoText, saving && { opacity: 0.6 }]}>
            {saving ? 'Đang cập nhật...' : 'Thay đổi ảnh'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Họ và tên *</Text>
          <TextInput
            style={[styles.input, errors.fullName && styles.inputError]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors({ ...errors, fullName: null });
              }
            }}
            placeholder="Nhập họ và tên của bạn"
          />
          {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (errors.email) {
                setErrors({ ...errors, email: null });
              }
            }}
            placeholder="Nhập địa chỉ email của bạn"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Số điện thoại *</Text>
          <TextInput
            style={[styles.input, errors.phone && styles.inputError]}
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (errors.phone) {
                setErrors({ ...errors, phone: null });
              }
            }}
            placeholder="Nhập số điện thoại của bạn"
            keyboardType="phone-pad"
          />
          {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}
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
  inputError: {
    borderColor: '#ff6b6b',
    borderWidth: 2,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
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