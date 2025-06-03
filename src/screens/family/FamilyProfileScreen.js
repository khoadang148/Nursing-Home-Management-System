import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { 
  ActivityIndicator, 
  Divider, 
  List, 
  Button,
  IconButton,
  Dialog,
  Portal,
  TextInput,
  Avatar,
  Card,
  Title,
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

// Import actions
import { logout } from '../../redux/slices/authSlice';

// Import notification system
import { useNotification } from '../../components/NotificationSystem';

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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    healthUpdates: true,
    activityUpdates: true,
    medicationChanges: true,
    visitReminders: true,
    messages: true,
    systemUpdates: false,
  });
  
  // Dialog states
  const [passwordDialogVisible, setPasswordDialogVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [user]);
  
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
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !phone.trim()) {
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
          firstName,
          lastName,
          email,
          phone
        }
      });
      
      setSaving(false);
      setEditMode(false);
      hideLoading();
      
      showSuccess('Cập nhật hồ sơ thành công');
    }, 1000);
  };
  
  const handleChangePassword = async () => {
    // Validate passwords
    if (!currentPassword || !newPassword || !confirmPassword) {
      showError('Tất cả các trường mật khẩu đều bắt buộc');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      showError('Mật khẩu mới không khớp');
      return;
    }
    
    if (newPassword.length < 6) {
      showError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }
    
    setSaving(true);
    showLoading('Đang đổi mật khẩu...');
    
    // In a real app, this would call an API to change the password
    setTimeout(() => {
      setSaving(false);
      setPasswordDialogVisible(false);
      hideLoading();
      
      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      
      showSuccess('Đổi mật khẩu thành công');
    }, 1000);
  };
  
  const handleToggleNotification = (setting) => {
    setNotificationSettings({
      ...notificationSettings,
      [setting]: !notificationSettings[setting]
    });
    
    // In a real app, this would save the settings to the server
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
      <ScrollView 
        style={styles.scrollContent}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              source={{ uri: user?.photo || 'https://randomuser.me/api/portraits/women/11.jpg' }}
              size={100}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <MaterialIcons name="edit" size={20} color={COLORS.surface} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{`${user?.firstName} ${user?.lastName}`}</Text>
            <Text style={styles.profileRole}>Thành viên gia đình</Text>
            <Text style={styles.profileRelationship}>
              {user?.relationship || 'Mối quan hệ'} của {user?.residentName || 'Cư dân'}
            </Text>
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
                  value={firstName}
                  onChangeText={setFirstName}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              ) : (
                <Text style={styles.value}>{firstName}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Họ</Text>
              {editMode ? (
                <TextInput
                  value={lastName}
                  onChangeText={setLastName}
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
              ) : (
                <Text style={styles.value}>{lastName}</Text>
              )}
            </View>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              {editMode ? (
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  style={styles.input}
                  mode="outlined"
                  outlineColor={COLORS.border}
                  activeOutlineColor={COLORS.primary}
                />
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
        
        {/* Account Settings Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Cài đặt tài khoản</Title>
            
            <TouchableOpacity 
              style={styles.settingItem}
              onPress={() => setPasswordDialogVisible(true)}
            >
              <View style={styles.settingInfo}>
                <MaterialIcons name="lock" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Đổi mật khẩu</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="help-outline" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Trợ giúp & Hỗ trợ</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="privacy-tip" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Chính sách bảo mật</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
            
            <Divider style={styles.divider} />
            
            <TouchableOpacity style={styles.settingItem} onPress={() => {}}>
              <View style={styles.settingInfo}>
                <MaterialIcons name="description" size={24} color={COLORS.primary} />
                <Text style={styles.settingText}>Điều khoản dịch vụ</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        {/* Logout Button */}
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          icon="logout"
          loading={authLoading}
          disabled={authLoading}
        >
          Đăng xuất
        </Button>
        
        <Text style={styles.versionText}>Phiên bản 1.0.0</Text>
      </ScrollView>
      
      {/* Password Change Dialog */}
      <Portal>
        <Dialog
          visible={passwordDialogVisible}
          onDismiss={() => setPasswordDialogVisible(false)}
        >
          <Dialog.Title>Đổi mật khẩu</Dialog.Title>
          <Dialog.Content>
            <TextInput
              label="Mật khẩu hiện tại"
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
              style={styles.dialogInput}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
            
            <TextInput
              label="Mật khẩu mới"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              style={styles.dialogInput}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
            
            <TextInput
              label="Xác nhận mật khẩu mới"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              style={styles.dialogInput}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setPasswordDialogVisible(false)}>Hủy</Button>
            <Button onPress={handleChangePassword} loading={saving}>Lưu</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
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
  profileRelationship: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
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
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingText: {
    ...FONTS.body2,
    marginLeft: 16,
  },
  logoutButton: {
    marginTop: 8,
    borderColor: COLORS.error,
    borderWidth: 1,
  },
  versionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
  },
  dialogInput: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
});

export default FamilyProfileScreen; 