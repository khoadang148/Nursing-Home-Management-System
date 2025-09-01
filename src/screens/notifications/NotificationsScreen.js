import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, RefreshControl, Alert } from 'react-native';
import { Appbar, Text, Card, Divider, ActivityIndicator, IconButton } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { COLORS } from '../../constants/theme';
import { fetchNotifications, markAsRead, deleteNotification } from '../../redux/slices/notificationSlice';
import { setUnreadNotificationCount } from '../../redux/slices/messageSlice';
import visitsService from '../../api/services/visitsService';
import residentPhotosService from '../../api/services/residentPhotosService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import activityService from '../../api/services/activityService';
import residentService from '../../api/services/residentService';

const NotificationItem = ({ item, onRead, onDelete }) => {
  const getIconName = (type) => {
    switch (type) {
      case 'urgent':
        return 'priority-high';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'info';
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'urgent':
        return COLORS.error;
      case 'warning':
        return COLORS.warning;
      case 'info':
      default:
        return COLORS.info;
    }
  };

  return (
    <Card 
      style={[styles.notificationCard, !item.isRead && styles.unreadCard]}
      onPress={() => onRead(item.id)}
    >
      <Card.Content style={styles.cardContent}>
        <View style={styles.iconContainer}>
          <MaterialIcons
            name={getIconName(item.type)}
            size={24}
            color={getIconColor(item.type)}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.message}>{item.message}</Text>
          <Text style={styles.timestamp}>
            {new Date(item.timestamp).toLocaleString()}
          </Text>
        </View>
        <IconButton
          icon="trash-can-outline"
          size={20}
          onPress={() => onDelete(item.id)}
          style={styles.deleteButton}
        />
      </Card.Content>
    </Card>
  );
};

const DELETED_STAFF_NOTIFICATIONS_KEY = 'DELETED_STAFF_NOTIFICATIONS';

const NotificationsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { notifications, isLoading, error } = useSelector((state) => state.notifications);
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [realNotifications, setRealNotifications] = useState([]);
  const [loadingReal, setLoadingReal] = useState(true);
  const [deletedNotificationIds, setDeletedNotificationIds] = useState(new Set());

  useEffect(() => {
    const initializeNotifications = async () => {
      await loadDeletedNotifications();
      dispatch(fetchNotifications());
      loadRealNotifications();
    };
    
    initializeNotifications();
    
    // Thiết lập auto-refresh mỗi 60 giây để cập nhật thông báo
    const interval = setInterval(() => {
      loadRealNotifications();
    }, 60000); // 60 giây
    
    return () => clearInterval(interval);
  }, [dispatch]);

  // Update Redux notification count when realNotifications changes
  useEffect(() => {
    const unreadCount = realNotifications.filter(notif => !notif.isRead).length;
    dispatch(setUnreadNotificationCount(unreadCount));
  }, [realNotifications, dispatch]);

  // Load danh sách thông báo đã xóa từ AsyncStorage
  const loadDeletedNotifications = async () => {
    try {
      const deletedIds = await AsyncStorage.getItem(DELETED_STAFF_NOTIFICATIONS_KEY);
      if (deletedIds) {
        const parsedIds = new Set(JSON.parse(deletedIds));
        setDeletedNotificationIds(parsedIds);
        return parsedIds;
      }
      return new Set();
    } catch (error) {
      console.error('Error loading deleted notifications:', error);
      return new Set();
    }
  };

  // Save danh sách thông báo đã xóa vào AsyncStorage
  const saveDeletedNotifications = async (deletedIds) => {
    try {
      await AsyncStorage.setItem(DELETED_STAFF_NOTIFICATIONS_KEY, JSON.stringify([...deletedIds]));
    } catch (error) {
      console.error('Error saving deleted notifications:', error);
    }
  };

  const loadRealNotifications = async () => {
    try {
      setLoadingReal(true);
      
      // Đảm bảo deletedNotificationIds đã được load
      const currentDeletedIds = deletedNotificationIds.size === 0 
        ? await loadDeletedNotifications() 
        : deletedNotificationIds;
      
      // Tạo notifications dựa trên dữ liệu thực từ hệ thống
      const realStaffNotifications = [];
      
      // 1. Kiểm tra lịch thăm mới được tạo trong 7 ngày qua
      try {
        const visitsResponse = await visitsService.getAllVisits();
        if (visitsResponse.success && Array.isArray(visitsResponse.data)) {
          const recentVisits = visitsResponse.data
            .filter(visit => {
              const createdAt = new Date(visit.created_at || visit.createdAt);
              const now = new Date();
              const daysDiff = (now - createdAt) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7; // Visits created in last 7 days
            })
            .slice(0, 5);
          
          recentVisits.forEach((visit) => {
            const familyMemberName = visit.family_member_id?.full_name || 'Thân nhân';
            realStaffNotifications.push({
              id: `visit_${visit._id}`,
              title: 'Lịch thăm mới',
              message: `${familyMemberName} đã đăng ký lịch thăm vào ${new Date(visit.visit_date).toLocaleDateString('vi-VN')} lúc ${visit.visit_time}. Mục đích: ${visit.purpose || 'Thăm hỏi'}`,
              type: 'info',
              timestamp: visit.created_at || visit.createdAt || new Date().toISOString(),
              isRead: false,
            });
          });
        }
      } catch (error) {
        console.error('Error fetching visits:', error);
      }
      
      // 2. Kiểm tra cư dân cần đo sinh hiệu hôm nay
      try {
        // Kiểm tra role của user để sử dụng API phù hợp
        let residentsResponse;
        if (user?.role === 'family') {
          // Family member chỉ có thể xem residents của mình
          residentsResponse = await residentService.getResidentsByFamilyMember(user._id || user.id);
        } else {
          // Staff có thể xem tất cả residents
          residentsResponse = await residentService.getAllResidents();
        }
        if (residentsResponse.success && Array.isArray(residentsResponse.data)) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          // Kiểm tra các cư dân chưa đo sinh hiệu hôm nay
          let residentsNeedingVitals = 0;
          
          for (const resident of residentsResponse.data.slice(0, 10)) { // Chỉ kiểm tra 10 cư dân đầu
            try {
              const vitalsResponse = await vitalSignsService.getVitalSignsByResidentId(resident._id);
              if (vitalsResponse.success && Array.isArray(vitalsResponse.data)) {
                const todayVitals = vitalsResponse.data.filter(vital => {
                  const recordedAt = new Date(vital.recorded_at || vital.createdAt);
                  return recordedAt.toDateString() === today.toDateString();
                });
                
                if (todayVitals.length === 0) {
                  residentsNeedingVitals++;
                }
              }
            } catch (error) {
              console.error(`Error checking vitals for resident ${resident._id}:`, error);
            }
          }
          
          if (residentsNeedingVitals > 0) {
            realStaffNotifications.push({
              id: `vital_reminder_${todayStr}`,
              title: 'Nhắc nhở đo sinh hiệu',
              message: `Có ${residentsNeedingVitals} cư dân chưa được đo chỉ số sinh hiệu hôm nay. Hãy kiểm tra và thực hiện đo sinh hiệu.`,
              type: 'warning',
              timestamp: new Date(today.setHours(7, 0, 0, 0)).toISOString(),
              isRead: false,
            });
          }
        }
      } catch (error) {
        console.error('Error checking vital signs reminders:', error);
      }
      
      // 3. Kiểm tra đánh giá cần hoàn thành hôm nay
      try {
        // Kiểm tra role của user để sử dụng API phù hợp
        let residentsResponse;
        if (user?.role === 'family') {
          // Family member chỉ có thể xem residents của mình
          residentsResponse = await residentService.getResidentsByFamilyMember(user._id || user.id);
        } else {
          // Staff có thể xem tất cả residents
          residentsResponse = await residentService.getAllResidents();
        }
        if (residentsResponse.success && Array.isArray(residentsResponse.data)) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          let residentsNeedingAssessments = 0;
          
          for (const resident of residentsResponse.data.slice(0, 10)) { // Chỉ kiểm tra 10 cư dân đầu
            try {
              const assessmentsResponse = await assessmentService.getAssessmentsByResidentId(resident._id);
              if (assessmentsResponse.success && Array.isArray(assessmentsResponse.data)) {
                const todayAssessments = assessmentsResponse.data.filter(assessment => {
                  const createdAt = new Date(assessment.created_at || assessment.createdAt);
                  return createdAt.toDateString() === today.toDateString();
                });
                
                if (todayAssessments.length === 0) {
                  residentsNeedingAssessments++;
                }
              }
            } catch (error) {
              console.error(`Error checking assessments for resident ${resident._id}:`, error);
            }
          }
          
          if (residentsNeedingAssessments > 0) {
            realStaffNotifications.push({
              id: `assessment_reminder_${todayStr}`,
              title: 'Nhắc nhở đánh giá',
              message: `Có ${residentsNeedingAssessments} cư dân chưa được đánh giá tình trạng sức khỏe hôm nay. Cần hoàn thành đánh giá hàng ngày.`,
              type: 'info',
              timestamp: new Date(today.setHours(14, 0, 0, 0)).toISOString(),
              isRead: false,
            });
          }
        }
      } catch (error) {
        console.error('Error checking assessment reminders:', error);
      }
      
      // 4. Kiểm tra hoạt động hôm nay
      try {
        const activitiesResponse = await activityService.getAllActivities();
        if (activitiesResponse.success && Array.isArray(activitiesResponse.data)) {
          const today = new Date();
          const todayStr = today.toISOString().split('T')[0];
          
          const todayActivities = activitiesResponse.data.filter(activity => {
            return activity.date === todayStr;
          });
          
          if (todayActivities.length > 0) {
            realStaffNotifications.push({
              id: `activity_reminder_${todayStr}`,
              title: 'Hoạt động hôm nay',
              message: `Có ${todayActivities.length} hoạt động được lên lịch cho hôm nay: ${todayActivities.slice(0, 2).map(a => a.activity_name).join(', ')}${todayActivities.length > 2 ? '...' : ''}. Hãy kiểm tra và chuẩn bị.`,
              type: 'info',
              timestamp: new Date(today.setHours(8, 30, 0, 0)).toISOString(),
              isRead: false,
            });
          }
        }
      } catch (error) {
        console.error('Error checking today activities:', error);
      }
      
      // 5. Kiểm tra hình ảnh mới được upload trong 3 ngày qua
      try {
        const photosResponse = await residentPhotosService.getAllResidentPhotos();
        if (photosResponse.success && Array.isArray(photosResponse.data)) {
          const recentPhotos = photosResponse.data
            .filter(photo => {
              const uploadedAt = new Date(photo.uploaded_at || photo.createdAt);
              const now = new Date();
              const daysDiff = (now - uploadedAt) / (1000 * 60 * 60 * 24);
              return daysDiff <= 3; // Photos uploaded in last 3 days
            })
            .slice(0, 3);
          
          recentPhotos.forEach(photo => {
            realStaffNotifications.push({
              id: `photo_${photo._id}`,
              title: 'Hình ảnh mới',
              message: `Hình ảnh mới của cư dân ${photo.resident_id?.full_name || 'N/A'} đã được tải lên từ hoạt động: ${photo.related_activity_id?.activity_name || 'Không rõ'}`,
              type: 'info',
              timestamp: photo.uploaded_at || photo.createdAt || new Date().toISOString(),
              isRead: false,
            });
          });
        }
      } catch (error) {
        console.error('Error fetching recent photos:', error);
      }
      
      // Sắp xếp theo thời gian mới nhất
      realStaffNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Lọc bỏ các thông báo đã bị xóa local
      const filteredNotifications = realStaffNotifications.filter(notification => 
        !currentDeletedIds.has(notification.id)
      );
      
      setRealNotifications(filteredNotifications);
    } catch (error) {
      console.error('Error loading real notifications:', error);
      // Fallback to basic notifications if API fails
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const fallbackNotifications = [
        {
          id: `fallback_reminder_${todayStr}`,
          title: 'Nhắc nhở công việc',
          message: 'Hãy kiểm tra và hoàn thành các nhiệm vụ chăm sóc cư dân hôm nay.',
          type: 'warning',
          timestamp: new Date().toISOString(),
          isRead: false,
        }
      ];
      setRealNotifications(fallbackNotifications);
    } finally {
      setLoadingReal(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRealNotifications();
    setRefreshing(false);
  };

  const handleMarkAsRead = (id) => {
    // For real notifications
    if (id.startsWith('visit_') || id.startsWith('vital_') || id.startsWith('assessment_') || id.startsWith('activity_') || id.startsWith('photo_') || id.startsWith('fallback_')) {
      setRealNotifications(prev => {
        return prev.map(notif => notif.id === id ? { ...notif, isRead: true } : notif);
      });
    } else {
      // For redux notifications
      dispatch(markAsRead(id));
    }
    // navigation.navigate('ChiTietThongBao', { id });
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Xóa thông báo',
      'Bạn có muốn xóa thông báo này? Thông báo sẽ không hiển thị nữa.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            // For real notifications
            if (id.startsWith('visit_') || id.startsWith('vital_') || id.startsWith('assessment_') || id.startsWith('activity_') || id.startsWith('photo_') || id.startsWith('fallback_')) {
              // Thêm vào danh sách đã xóa
              const newDeletedIds = new Set([...deletedNotificationIds, id]);
              setDeletedNotificationIds(newDeletedIds);
              
              // Lưu vào AsyncStorage
              await saveDeletedNotifications(newDeletedIds);
              
              setRealNotifications(prev => {
                return prev.filter(notif => notif.id !== id);
              });
            } else {
              // For redux notifications
              dispatch(deleteNotification(id));
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Thông Báo" />
      </Appbar.Header>

      {(isLoading || loadingReal) && <ActivityIndicator style={styles.loader} size="large" color={COLORS.primary} />}

      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi: {error}</Text>
        </View>
      )}

      {!loadingReal && realNotifications.length === 0 && (
        <View style={styles.emptyContainer}>
          <MaterialIcons name="notifications-off" size={64} color={COLORS.textSecondary} />
          <Text style={styles.emptyText}>Không có thông báo</Text>
        </View>
      )}

      <FlatList
        data={realNotifications}
        renderItem={({ item }) => (
          <NotificationItem
            item={item}
            onRead={handleMarkAsRead}
            onDelete={handleDelete}
          />
        )}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <Divider />}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.surface,
    elevation: 4,
  },
  list: {
    padding: 16,
  },
  loader: {
    marginTop: 20,
  },
  notificationCard: {
    marginVertical: 8,
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textTertiary,
  },
  deleteButton: {
    margin: 0,
  },
  errorContainer: {
    padding: 16,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.error,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default NotificationsScreen; 