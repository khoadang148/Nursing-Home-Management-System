import React, { useMemo, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDispatch, useSelector } from 'react-redux';
import { 
  ActivityIndicator, 
  Divider, 
  List, 
  Button,
  IconButton,
  Avatar,
  Card,
  Title,
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { logout, updateProfile } from '../../redux/slices/authSlice';
import * as ImagePicker from 'expo-image-picker';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';
import { getAvatarUri } from '../../utils/avatarUtils';
import CommonAvatar from '../../components/CommonAvatar';
import dateUtils, { formatDateFromBackend } from '../../utils/dateUtils';
import authService from '../../api/services/authService';
import userService from '../../api/services/userService';

const DEFAULT_AVATAR = APP_CONFIG.DEFAULT_AVATAR;

// Helper để format ngày thành dd/mm/yyyy
const formatDateToDDMMYYYY = (dateValue) => {
  if (!dateValue) return 'Chưa cập nhật';
  
  try {
    let date;
    
    // Nếu là string, thử parse
    if (typeof dateValue === 'string') {
      // Xử lý các format string khác nhau
      if (dateValue.includes('T') || dateValue.includes('Z')) {
        // ISO date string
        date = new Date(dateValue);
      } else if (/^\d{4}-\d{2}-\d{2}/.test(dateValue)) {
        // yyyy-mm-dd format
        const [year, month, day] = dateValue.split('-');
        return `${day}/${month}/${year}`;
      } else if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateValue)) {
        // Đã là dd/mm/yyyy
        return dateValue;
      } else if (/^\d{2}-\d{2}-\d{4}$/.test(dateValue)) {
        // dd-mm-yyyy format
        return dateValue.replace(/-/g, '/');
      } else {
        // Thử parse với Date constructor
        date = new Date(dateValue);
      }
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'number') {
      date = new Date(dateValue);
    } else {
      return 'Chưa cập nhật';
    }
    
    // Kiểm tra date hợp lệ
    if (date && !isNaN(date.getTime())) {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    
    return 'Chưa cập nhật';
  } catch (error) {
    console.error('Error formatting date:', error, 'Input:', dateValue);
    return 'Chưa cập nhật';
  }
};

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  // Sử dụng thông tin user thật từ Redux
  const userData = user || {};

  // Load profile từ API khi component mount
  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await authService.getProfile();
      
      if (response.success) {
        // Debug log để xem dữ liệu join_date
        console.log('Profile data from API:', response.data);
        console.log('Join date raw value:', response.data.join_date);
        console.log('Join date type:', typeof response.data.join_date);
        
        // Cập nhật user data vào Redux store
        dispatch(updateProfile(response.data));
      } else {
        console.log('Failed to load profile:', response.error);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProfile();
    setRefreshing(false);
  };

  // Hiển thị ngày vào làm dạng string đẹp với format dd/mm/yyyy
  const joinDateString = useMemo(() => {
    return formatDateFromBackend(userData.join_date);
  }, [userData.join_date]);

  // Hiển thị role dễ hiểu hơn
  const getDisplayRole = (role) => {
    switch (role) {
      case 'staff': return 'Nhân Viên';
      case 'admin': return 'Quản Trị Viên';
      case 'family': return 'Gia Đình';
      default: return role || 'Chưa xác định';
    }
  };

  const handleEditProfile = () => {
    navigation.navigate('ChinhSuaHoSo', { userData });
  };

  const handleChangeAvatar = () => {
    Alert.alert(
      'Thay đổi ảnh đại diện',
      'Chọn cách thay đổi ảnh',
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

              if (!result.canceled && result.assets[0]) {
                console.log('Camera photo:', result.assets[0].uri);
                await uploadAvatarToServer(result.assets[0].uri);
              }
            } catch (error) {
              console.error('Error taking photo:', error);
              Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
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

              if (!result.canceled && result.assets[0]) {
                console.log('Gallery photo:', result.assets[0].uri);
                await uploadAvatarToServer(result.assets[0].uri);
              }
            } catch (error) {
              console.error('Error selecting photo:', error);
              Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
            }
          }
        },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const uploadAvatarToServer = async (imageUri) => {
    try {
      setLoading(true);
      
      // Gọi API để upload avatar
      const response = await userService.updateAvatar(userData._id, imageUri);
      
      if (response.success) {
        // Cập nhật Redux store với avatar mới
        dispatch(updateProfile({ avatar: response.data.avatar }));
        Alert.alert('Thành công', 'Đã cập nhật ảnh đại diện!');
        
        // Reload profile để lấy thông tin mới nhất
        await loadProfile();
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật ảnh đại diện');
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      
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
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải hồ sơ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        {/* Nút back */}
        {navigation.canGoBack() && (
          <TouchableOpacity style={{ padding: 8, marginRight: 8 }} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        )}
        <Text style={styles.customHeaderTitle}>Hồ Sơ Cá Nhân</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <MaterialIcons name="edit" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <CommonAvatar
              source={userData.avatar || userData.profile_picture}
              size={100}
              name={userData.full_name || userData.name || userData.username}
              style={styles.avatar}
            />
        <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleChangeAvatar}
              disabled={loading}
        >
              {loading ? (
                <ActivityIndicator size="small" color={COLORS.surface} />
              ) : (
                <MaterialIcons name="edit" size={20} color={COLORS.surface} />
              )}
        </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>
              {userData.full_name || userData.name || userData.username || 'Chưa có tên'}
            </Text>
            <Text style={styles.profileRole}>
              {getDisplayRole(userData.role)}
            </Text>
            <Text style={styles.profilePosition}>
              {userData.position || userData.job_title || userData.department || 'Chưa cập nhật'}
            </Text>
          </View>
        </View>
        
        {/* Personal Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Thông tin cá nhân</Title>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>
                  {userData.email || userData.email_address || 'Chưa có email'}
                </Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>
                  {userData.phone || userData.phone_number || userData.mobile || 'Chưa có số điện thoại'}
                </Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Ngày vào làm</Text>
                <Text style={styles.infoValue}>{joinDateString}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Bằng cấp</Text>
                <Text style={styles.infoValue}>
                  {userData.qualification || userData.education || userData.degree || 'Chưa cập nhật'}
                </Text>
              </View>
            </View>
            
            {(userData.notes || userData.description || userData.bio) && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ghi chú</Text>
                    <Text style={styles.infoValue}>
                      {userData.notes || userData.description || userData.bio}
                    </Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
        
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
    </ScrollView>
    </SafeAreaView>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  scrollContent: {
    flex: 1,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  editButton: {
    padding: 8,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    backgroundColor: COLORS.border,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  profileRole: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginBottom: 4,
  },
  profilePosition: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    ...FONTS.h4,
    marginBottom: 16,
  },
  infoRow: {
    marginBottom: 8,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    width: 100,
    fontWeight: '500',
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
    flex: 1,
    textAlign: 'right',
  },
  divider: {
    marginVertical: 8,
  },
  listItem: {
    paddingVertical: 4,
  },
  versionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default ProfileScreen; 