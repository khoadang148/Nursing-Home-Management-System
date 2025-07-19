import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Alert,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
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
import { logout } from '../../redux/slices/authSlice';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = React.useState(false);

  // Fallback nếu thiếu thông tin user
  const getUserData = () => {
    if (user && user.full_name) return user;
    return {
      full_name: 'Nguyễn Văn A',
      role: 'staff',
      email: 'staff@example.com',
      phone: '0123456789',
      join_date: '2022-01-01',
      avatar: DEFAULT_AVATAR,
      position: 'Điều dưỡng',
      qualification: 'Cử nhân Điều dưỡng',
      notes: 'Nhân viên có kinh nghiệm chăm sóc người cao tuổi'
    };
  };
  const userData = getUserData();

  // Hiển thị ngày vào làm dạng string đẹp
  const joinDateString = useMemo(() => {
    if (!userData.join_date) return 'Chưa cập nhật';
    // Nếu là dạng yyyy-mm-dd thì chuyển sang dd/mm/yyyy
    if (/^\d{4}-\d{2}-\d{2}/.test(userData.join_date)) {
      const [y, m, d] = userData.join_date.split('-');
      return `${d}/${m}/${y}`;
    }
    return userData.join_date;
  }, [userData.join_date]);

  // Hiển thị role dễ hiểu hơn
  const getDisplayRole = (role) => {
    switch (role) {
      case 'staff': return 'Nhân Viên';
      case 'admin': return 'Quản Trị Viên';
      case 'family': return 'Gia Đình';
      default: return role;
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
        { text: 'Chụp ảnh', onPress: () => console.log('Camera') },
        { text: 'Chọn từ thư viện', onPress: () => console.log('Gallery') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
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
            refreshing={loading}
            onRefresh={() => setLoading(true)}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              source={{ uri: userData.avatar || DEFAULT_AVATAR }}
              size={100}
              style={styles.avatar}
            />
        <TouchableOpacity 
              style={styles.editAvatarButton}
              onPress={handleChangeAvatar}
        >
              <MaterialIcons name="edit" size={20} color={COLORS.surface} />
        </TouchableOpacity>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.full_name || 'Chưa có tên'}</Text>
            <Text style={styles.profileRole}>{getDisplayRole(userData.role) || 'Chưa có vai trò'}</Text>
            <Text style={styles.profilePosition}>{userData.position || 'Chưa cập nhật'}</Text>
          </View>
        </View>
        
        {/* Personal Information Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Thông tin cá nhân</Title>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{userData.email || 'Chưa có email'}</Text>
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.infoLabel}>Số điện thoại</Text>
                <Text style={styles.infoValue}>{userData.phone || 'Chưa có số điện thoại'}</Text>
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
                <Text style={styles.infoValue}>{userData.qualification || 'Chưa cập nhật'}</Text>
              </View>
            </View>
            
            {userData.notes && (
              <>
                <Divider style={styles.divider} />
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Ghi chú</Text>
                    <Text style={styles.infoValue}>{userData.notes}</Text>
                  </View>
                </View>
              </>
            )}
          </Card.Content>
        </Card>
        
        {/* Quick Actions Card */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Truy cập nhanh</Title>
            
            <List.Item
              title="Đổi mật khẩu"
              description="Thay đổi mật khẩu đăng nhập"
              left={(props) => <List.Icon {...props} icon="lock" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('DoiMatKhau')}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Danh bạ nhân viên"
              description="Xem danh sách nhân viên"
              left={(props) => <List.Icon {...props} icon="account-group" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => navigation.navigate('DanhBaNhanVien')}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Liên hệ người nhà"
              description="Quản lý thông tin liên hệ"
              left={(props) => <List.Icon {...props} icon="phone" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('LienHeNguoiNha')}
              style={styles.listItem}
            />
            
            <Divider />
            
            <List.Item
              title="Hoạt động"
              description="Xem lịch hoạt động"
              left={(props) => <List.Icon {...props} icon="calendar" color={COLORS.primary} />}
              right={(props) => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => navigation.navigate('HoatDong')}
              style={styles.listItem}
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