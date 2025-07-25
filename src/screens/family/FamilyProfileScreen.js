import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
  RefreshControl,
  SafeAreaView,
  Switch,
  TextInput,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
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
import * as ImagePicker from 'expo-image-picker';
import userService from '../../api/services/userService';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../../api/config/apiConfig';

// Fallback nếu API_BASE_URL bị undefined
const DEFAULT_API_BASE_URL = 'http://192.168.2.5:8000';
const getApiBaseUrl = () => {
  if (typeof CONFIG_API_BASE_URL === 'string' && CONFIG_API_BASE_URL.startsWith('http')) {
    return CONFIG_API_BASE_URL;
  }
  console.warn('[FamilyProfileScreen] API_BASE_URL is undefined, fallback to default:', DEFAULT_API_BASE_URL);
  return DEFAULT_API_BASE_URL;
};

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

// Import actions
import { logout } from '../../redux/slices/authSlice';

// Import notification system
import { useNotification } from '../../components/NotificationSystem';

// Import mock data for fallback
import { familyMembers, residents } from '../../api/mockData';

const FamilyProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const authLoading = useSelector((state) => state.auth.isLoading);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Notification system
  const { showSuccess, showError, confirmAction, showLoading, hideLoading } = useNotification();
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    healthUpdates: true,
    activityUpdates: true,
    medicationChanges: true,
    visitReminders: true,
    messages: true,
    systemUpdates: false,
  });
  
  // Get user data with fallback to mock data
  const getUserData = () => {
    if (user) {
      // If user has full_name (from mock data structure)
      if (user.full_name) {
        return user;
      }
      // If user has firstName/lastName (from auth service structure)
      if (user.firstName && user.lastName) {
        return {
          ...user,
          full_name: `${user.firstName} ${user.lastName}`,
          phone: user.phone || 'Chưa cập nhật',
          address: user.address || 'Chưa cập nhật',
          relationship: user.relationship || 'Chưa cập nhật'
        };
      }
    }
    
    // Fallback to mock data
    const mockUser = familyMembers.find(fm => fm.id === 'f1');
    return mockUser || {
      full_name: 'Trần Lê Chi Bảo',
      email: 'bao@gmail.com',
      phone: '0764634650',
      address: '123 Đường Lê Lợi, Quận 1, TP.HCM',
      relationship: 'Con trai',
      photo: 'https://randomuser.me/api/portraits/men/20.jpg'
    };
  };

  const userData = getUserData();
  
  useEffect(() => {
    setFullName(userData.full_name || '');
    setEmail(userData.email || '');
    setPhone(userData.phone || '');
    setAddress(userData.address || '');
  }, [userData]);
  
  const handleLogout = () => {
    Alert.alert(
      'Xác nhận đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            dispatch(logout());
          },
        },
      ],
      { cancelable: false }
    );
  };
  
  const handleSaveProfile = async () => {
    // Validate inputs
    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      showError('Tất cả các trường đều bắt buộc');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }
    
    setSaving(true);
    showLoading('Đang cập nhật hồ sơ...');
    
    // In a real app, this would call an API to update the user profile
    setTimeout(() => {
      // Update the Redux store with new user info
      dispatch({ 
        type: 'UPDATE_USER', 
        payload: {
          ...user,
          full_name: fullName,
          email,
          phone,
          address
        }
      });
      
      setSaving(false);
      setEditMode(false);
      hideLoading();
      
      showSuccess('Cập nhật hồ sơ thành công');
    }, 1000);
  };

  const handleToggleNotification = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
    
    // In a real app, this would save the settings to the server
  };

  // Đổi avatar
  const handleChangeAvatar = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Bạn cần cấp quyền truy cập ảnh để đổi avatar!');
        return;
      }
      const pickerResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (pickerResult.cancelled) return;
      setLoading(true);
      const res = await userService.updateAvatar(userData.id || userData._id, pickerResult.assets ? pickerResult.assets[0].uri : pickerResult.uri);
      setLoading(false);
      if (res.success) {
        // Cập nhật lại avatar cho user trong Redux
        dispatch({ type: 'UPDATE_USER', payload: { ...user, avatar: res.data.avatar } });
        showSuccess('Đổi avatar thành công!');
      } else {
        showError(res.error || 'Đổi avatar thất bại!');
      }
    } catch (e) {
      setLoading(false);
      showError('Có lỗi khi đổi avatar!');
    }
  };

  const getAvatarUri = (avatar) => {
    if (!avatar) return 'https://randomuser.me/api/portraits/men/20.jpg';
    if (avatar.startsWith('http') || avatar.startsWith('https')) return avatar;
    // Chuyển toàn bộ \\ hoặc \ thành /
    const cleanPath = avatar.replace(/\\/g, '/').replace(/\\/g, '/').replace(/\//g, '/').replace(/^\/+|^\/+/, '');
    const baseUrl = getApiBaseUrl();
    const uri = `${baseUrl}/${cleanPath}`;
    console.log('[FamilyProfileScreen] API_BASE_URL:', baseUrl, 'avatar:', avatar, 'cleanPath:', cleanPath, 'uri:', uri);
    return uri;
  };

  // Get resident names for relationship display
  const getResidentNames = () => {
    if (userData.residentIds) {
      return userData.residentIds.map(id => {
        const resident = residents.find(r => r.id === id);
        return resident ? resident.full_name : 'Không xác định';
      }).join(', ');
    }
    return 'Chưa có thông tin';
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
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Hồ Sơ Cá Nhân</Text>
      </View>
      
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              source={{ uri: getAvatarUri(userData.avatar) }}
              size={100}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton} onPress={handleChangeAvatar}>
              <MaterialIcons name="edit" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.full_name || 'Chưa có tên'}</Text>
            <Text style={styles.profileRole}>Thành viên gia đình</Text>
            {/* <Text style={styles.profileRelationship}>
              {userData.relationship || 'Mối quan hệ'} của {getResidentNames()}
            </Text> */}
          </View>
        </View>
        
        {/* Profile Details Card */}
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.cardHeader}>
              <Title style={styles.cardTitle}>Thông tin cá nhân</Title>
              {!editMode ? (
                <Button
                  mode="text"
                  onPress={() => setEditMode(true)}
                  icon="pencil"
                >
                  Chỉnh sửa
                </Button>
              ) : (
                <Button
                  mode="text"
                  onPress={() => setEditMode(false)}
                  icon="close"
                >
                  Hủy
                </Button>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Tên</Text>
              {editMode ? (
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              ) : (
                <Text style={styles.value}>{fullName}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              {editMode ? (
                <Text style={[styles.value, { color: COLORS.textSecondary }]}>
                  {email} (Không thể thay đổi)
                </Text>
              ) : (
                <Text style={styles.value}>{email}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Số điện thoại</Text>
              {editMode ? (
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              ) : (
                <Text style={styles.value}>{phone}</Text>
              )}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Địa chỉ</Text>
              {editMode ? (
                <TextInput
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              ) : (
                <Text style={styles.value}>{address}</Text>
              )}
            </View>
            
            {editMode && (
              <Button
                mode="contained"
                onPress={handleSaveProfile}
                style={styles.saveButton}
                loading={saving}
              >
                Lưu thay đổi
              </Button>
            )}
          </Card.Content>
        </Card>
        
        {/* Notification Settings Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Cài đặt thông báo</Title>
            
            <List.Item
              title="Cập nhật sức khỏe"
              description="Nhận thông báo về thay đổi tình trạng sức khỏe"
              right={() => (
                <Switch
                  value={notificationSettings.healthUpdates}
                  onValueChange={() => handleToggleNotification('healthUpdates')}
                  color={COLORS.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Cập nhật hoạt động"
              description="Nhận thông báo về việc tham gia hoạt động"
              right={() => (
                <Switch
                  value={notificationSettings.activityUpdates}
                  onValueChange={() => handleToggleNotification('activityUpdates')}
                  color={COLORS.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Thay đổi thuốc"
              description="Nhận thông báo về thay đổi thuốc"
              right={() => (
                <Switch
                  value={notificationSettings.medicationChanges}
                  onValueChange={() => handleToggleNotification('medicationChanges')}
                  color={COLORS.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Nhắc nhở thăm viếng"
              description="Nhận nhắc nhở về các cuộc thăm viếng đã lên lịch"
              right={() => (
                <Switch
                  value={notificationSettings.visitReminders}
                  onValueChange={() => handleToggleNotification('visitReminders')}
                  color={COLORS.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Tin nhắn"
              description="Nhận thông báo về tin nhắn mới"
              right={() => (
                <Switch
                  value={notificationSettings.messages}
                  onValueChange={() => handleToggleNotification('messages')}
                  color={COLORS.primary}
                />
              )}
            />
            
            <Divider />
            
            <List.Item
              title="Cập nhật hệ thống"
              description="Nhận thông báo về cập nhật hệ thống"
              right={() => (
                <Switch
                  value={notificationSettings.systemUpdates}
                  onValueChange={() => handleToggleNotification('systemUpdates')}
                  color={COLORS.primary}
                />
              )}
            />
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
  // profileRelationship: {
  //   ...FONTS.body3,
  //   color: COLORS.textSecondary,
  // },
  card: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...FONTS.h4,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  value: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  saveButton: {
    marginTop: 16,
  },
  divider: {
    marginVertical: 8,
  },
  versionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
});

export default FamilyProfileScreen; 