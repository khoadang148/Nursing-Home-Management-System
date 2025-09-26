import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, IconButton, Avatar, Badge } from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector, useDispatch } from 'react-redux';
import residentService from '../../api/services/residentService';
import activityService from '../../api/services/activityService';
import activityParticipationService from '../../api/services/activityParticipationService';
import { getApiBaseUrl, getImageUri, APP_CONFIG } from '../../config/appConfig';
import { getAvatarUri } from '../../utils/avatarUtils';
import { updateProfile } from '../../redux/slices/authSlice';
import authService from '../../api/services/authService';
import CommonAvatar from '../../components/CommonAvatar';

// Import services for real data
import staffAssignmentService from '../../api/services/staffAssignmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';
import { fetchNotifications } from '../../redux/slices/notificationSlice';

const DashboardScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [residentCount, setResidentCount] = useState(0);
  const [activityCount, setActivityCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);
  const [todayTasks, setTodayTasks] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState([]);
  const user = useSelector((state) => state.auth.user);

  const fetchDashboardData = async () => {
    try {
      setRefreshing(true);
      
      // Fetch residents count
      // Kiểm tra role của user để sử dụng API phù hợp
      let residentsResponse;
      if (user?.role === 'family') {
        // Family member chỉ có thể xem residents của mình
        residentsResponse = await residentService.getResidentsByFamilyMember(user._id || user.id);
      } else {
        // Staff có thể xem tất cả residents
        residentsResponse = await residentService.getAllResidents();
      }
      if (residentsResponse.success) {
        setResidentCount(residentsResponse.data.length);
      }

      // Fetch activity participations count for current staff
      if (user?.id) {
        const activityResponse = await activityParticipationService.getUniqueActivitiesByStaffId(user.id);
        if (activityResponse.success) {
          setActivityCount(activityResponse.data.length);
        }
      }

      // Fetch today's tasks for staff
      if (user?.role === 'staff' && user?.id) {
        await fetchTodayTasks();
      }

      // Fetch unread notifications
      if (user?.role === 'staff') {
        await fetchUnreadNotifications();
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchTodayTasks = async () => {
    try {
      // Get residents in rooms assigned to this staff
      const residentsRes = await staffAssignmentService.getMyResidents();
      if (!residentsRes.success) {
        setTodayTasks([]);
        return;
      }

      // Flatten residents from all rooms
      const allResidents = [];
      if (Array.isArray(residentsRes.data)) {
        residentsRes.data.forEach(roomData => {
          if (roomData && roomData.residents && Array.isArray(roomData.residents)) {
            // Filter out null/undefined residents
            const validResidents = roomData.residents.filter(resident => resident != null);
            allResidents.push(...validResidents);
          }
        });
      }

      if (allResidents.length === 0) {
        setTodayTasks([]);
        return;
      }

      const taskPromises = allResidents.map(async (resident) => {
        // Skip if resident is null/undefined
        if (!resident) {
          console.log('⚠️ Skipping null/undefined resident');
          return null;
        }

        const residentId = resident._id;
        const residentName = resident.full_name || 'Không rõ tên';

        // Skip if residentId is invalid
        if (!residentId) {
          console.log('⚠️ Skipping task for resident with invalid ID:', resident);
          return null;
        }

        // Check today's vitals
        const vitalsRes = await vitalSignsService.getVitalSignsByResidentId(residentId);
        const hasTodayVitals = vitalsRes.success && Array.isArray(vitalsRes.data)
          ? vitalsRes.data.some(v => {
              const recordedAt = new Date(v.date_time || v.created_at || v.date);
              const today = new Date();
              return recordedAt.toDateString() === today.toDateString();
            })
          : false;

        // Check today's assessments
        const assessRes = await assessmentService.getAssessmentsByResidentId(residentId);
        const hasTodayAssessment = assessRes.success && Array.isArray(assessRes.data)
          ? assessRes.data.some(a => {
              const createdAt = new Date(a.created_at || a.assessment_date || a.date);
              const today = new Date();
              return createdAt.toDateString() === today.toDateString();
            })
          : false;

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 0, 0);

        return [
          {
            id: `vitals_${residentId}`,
            type: 'vitals',
            residentId,
            residentName,
            title: 'Ghi nhận chỉ số sinh hiệu',
            description: `Ghi nhận sinh hiệu hôm nay cho ${residentName}`,
            dueDate: endOfDay.toISOString(),
            status: hasTodayVitals ? 'Hoàn thành' : 'Chờ xử lý',
            category: 'Sinh hiệu',
          },
          {
            id: `assessment_${residentId}`,
            type: 'assessment',
            residentId,
            residentName,
            title: 'Thực hiện đánh giá',
            description: `Đánh giá tình trạng hôm nay cho ${residentName}`,
            dueDate: endOfDay.toISOString(),
            status: hasTodayAssessment ? 'Hoàn thành' : 'Chờ xử lý',
            category: 'Đánh giá',
          },
        ];
      });

      const tasksNested = await Promise.all(taskPromises);
      const builtTasks = tasksNested.flat().filter(task => task && task.status === 'Chờ xử lý').slice(0, 3);
      setTodayTasks(builtTasks);
    } catch (error) {
      console.error('Error fetching today tasks:', error);
      setTodayTasks([]);
    }
  };

  const fetchUnreadNotifications = async () => {
    try {
      // Fetch notifications from Redux store
      const notifications = await dispatch(fetchNotifications());
      const unread = notifications.payload?.filter(notif => !notif.isRead) || [];
      setUnreadNotifications(unread.slice(0, 3));
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      setUnreadNotifications([]);
    }
  };

  // Chỉ reload lần đầu khi component mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Reload khi user thay đổi (đăng nhập/đăng xuất)
  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
    }
  }, [user?.id]);

  // Fetch profile after login to get complete user data including avatar
  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      if (user?.id && !user.avatar) {
        try {
          console.log('Fetching profile for user:', user.id);
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.data) {
            console.log('Profile fetched successfully:', profileRes.data);
            // Update user data in Redux
            dispatch(updateProfile(profileRes.data));
            // Force re-render avatar
            setAvatarKey(prev => prev + 1);
          }
        } catch (error) {
          console.log('Error fetching profile:', error);
        }
      }
    };
    
    fetchProfileIfNeeded();
  }, [user?.id]); // Remove user?.avatar dependency to prevent loop

  // Force re-render avatar when user avatar changes
  useEffect(() => {
    if (user?.avatar || user?.profile_picture) {
      console.log('Avatar changed, forcing re-render');
      setAvatarKey(prev => prev + 1);
    }
  }, [user?.avatar, user?.profile_picture]);

  // Lấy thông tin user
  const getUserData = () => {
    return user || { full_name: 'Đang tải...' };
  };
    const userData = getUserData();

  // Debug user data
  console.log('Dashboard - User data:', user);
  console.log('Dashboard - User role:', user?.role);
  console.log('Dashboard - User avatar:', user?.avatar);
  console.log('Dashboard - User profile_picture:', user?.profile_picture);
  console.log('Dashboard - Final avatar URI:', getAvatarUri(user?.avatar || user?.profile_picture));
  console.log('Dashboard - Avatar source:', { uri: getAvatarUri(user?.avatar || user?.profile_picture) });

  // Chào hỏi theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchDashboardData().finally(() => {
      setRefreshing(false);
    });
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{userData.full_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('HoSo')}
          style={styles.profileButton}
        >
          <CommonAvatar
            source={user?.avatar || user?.profile_picture}
            size={40}
            name={user?.full_name}
            style={styles.avatar}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('CuDan')}
          >
            <View style={styles.cardIconContainer}>
              <FontAwesome5 name="user-injured" size={24} color={COLORS.surface} />
            </View>
            <Text style={styles.cardTitle}>Cư Dân</Text>
            <Text style={styles.cardValue}>{residentCount}</Text>
            {/* Có thể thêm thông tin phụ nếu muốn */}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: COLORS.info }]}
            onPress={() => navigation.navigate('HoatDong')}
          >
            <View style={styles.cardIconContainer}>
              <MaterialIcons name="event" size={24} color={COLORS.surface} />
            </View>
            <Text style={styles.cardTitle}>Hoạt Động</Text>
            <Text style={styles.cardValue}>{activityCount}</Text>
            {/* Có thể thêm thông tin phụ nếu muốn */}
          </TouchableOpacity>
        </View>

        {/* Quick Actions for Staff */}
        <View style={styles.quickActionContainer}>
          <Text style={styles.sectionTitle}>Tiện Ích Nhân Viên</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('QuanLyLichTham')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.accent }]}>
                <MaterialIcons name="event-available" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Quản Lý Lịch Thăm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('LienHeNguoiNha')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.info }]}>
                <MaterialIcons name="people" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Liên Hệ Gia Đình</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('ThongBao')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.warning }]}>
                <MaterialIcons name="notifications" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Thông Báo</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Ẩn các card nhiệm vụ và thuốc */}
        {/* Today's Tasks */}
        <Card style={styles.shiftCard}>
          <Card.Title
            title="Nhiệm Vụ Hôm Nay"
            titleStyle={styles.cardSectionTitle}
            right={(props) => (
              <IconButton
                {...props}
                icon="calendar"
                color={COLORS.primary}
                size={24}
                onPress={() => navigation.navigate('NhiemVu')}
              />
            )}
          />
          <Card.Content>
            {todayTasks.length > 0 ? (
              todayTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskItem}
                  onPress={() => {
                    if (task.type === 'vitals') {
                      // Navigate to CuDan tab first, then to RecordVitals
                      navigation.navigate('CuDan', {
                        screen: 'RecordVitals',
                        params: { residentId: task.residentId }
                      });
                    } else if (task.type === 'assessment') {
                      // Navigate to CuDan tab first, then to AddAssessment
                      navigation.navigate('CuDan', {
                        screen: 'AddAssessment',
                        params: { residentId: task.residentId }
                      });
                    }
                  }}
                >
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    <Text style={styles.taskResident}>{task.residentName}</Text>
                  </View>
                  <View style={styles.taskActions}>
                    <MaterialIcons name="play-circle" size={24} color={COLORS.primary} />
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có nhiệm vụ nào cần thực hiện</Text>
            )}
            {todayTasks.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('NhiemVu')}
              >
                <Text style={styles.viewAllText}>Xem tất cả nhiệm vụ</Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>

        {/* Unread Notifications */}
        <Card style={styles.alertsCard}>
          <Card.Title
            title="Thông Báo Chưa Đọc"
            titleStyle={styles.cardSectionTitle}
            right={(props) => (
              <IconButton
                {...props}
                icon="bell"
                color={COLORS.primary}
                size={24}
                onPress={() => navigation.navigate('ThongBao')}
              />
            )}
          />
          <Card.Content>
            {unreadNotifications.length > 0 ? (
              unreadNotifications.map((notification) => (
                <TouchableOpacity
                  key={notification.id}
                  style={styles.alertItem}
                  onPress={() => navigation.navigate('ThongBao')}
                >
                  <View
                    style={[
                      styles.alertIconContainer,
                      {
                        backgroundColor:
                          notification.type === 'urgent'
                            ? COLORS.error
                            : notification.type === 'warning'
                            ? COLORS.warning
                            : COLORS.info,
                      },
                    ]}
                  >
                    <MaterialIcons
                      name={
                        notification.type === 'urgent'
                          ? 'priority-high'
                          : notification.type === 'warning'
                          ? 'warning'
                          : 'info'
                      }
                      size={20}
                      color={COLORS.surface}
                    />
                  </View>
                  <View style={styles.alertContent}>
                    <View style={styles.alertHeader}>
                      <Text style={styles.alertTitle}>
                        {notification.title}
                      </Text>
                      <Badge size={8} style={styles.unreadBadge} />
                    </View>
                    <Text style={styles.alertMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.alertTime}>
                      {new Date(notification.timestamp).toLocaleString('vi-VN')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có thông báo mới</Text>
            )}
            {unreadNotifications.length > 0 && (
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('ThongBao')}
              >
                <Text style={styles.viewAllText}>Xem tất cả thông báo</Text>
              </TouchableOpacity>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  welcomeText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  nameText: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  profileButton: {
    borderRadius: 25,
    ...SHADOWS.small,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#dee2e6',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    ...FONTS.body3,
    color: COLORS.surface,
    opacity: 0.9,
  },
  cardValue: {
    ...FONTS.h1,
    color: COLORS.surface,
    marginVertical: 5,
  },
  cardFooter: {
    marginTop: 5,
  },
  cardFooterText: {
    ...FONTS.body3,
    color: COLORS.surface,
    opacity: 0.8,
  },
  shiftCard: {
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  cardSectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  taskItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  taskInfo: {
    flex: 1,
  },
  taskTitle: {
    ...FONTS.h5,
    color: COLORS.text,
  },
  taskResident: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  taskActions: {
    marginLeft: 12,
  },
  viewAllButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  viewAllText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  noDataText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  alertsCard: {
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitle: {
    ...FONTS.h5,
    color: COLORS.text,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  alertMessage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
  quickActionContainer: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
    paddingVertical: 12,
  },
  iconBackground: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionText: {
    ...FONTS.body3,
    color: COLORS.text,
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 16,
  },
});

export default DashboardScreen; 