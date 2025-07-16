import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Native components
import NativeCard from '../../components/NativeCard';
import NativeButton from '../../components/NativeButton';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Mock notifications data - filtered for family members only
const mockNotifications = [
  {
    id: '1',
    title: 'Thay Đổi Liều Thuốc',
    message: 'Bác sĩ đã điều chỉnh liều thuốc tiểu đường từ 5mg xuống 2.5mg theo chỉ định mới. Gia đình cần lưu ý theo dõi.',
    type: 'medication',
    date: '2023-11-11T15:20:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '2',
    title: 'Nhắc Nhở Thanh Toán',
    message: 'Hóa đơn tháng 11 sẽ đến hạn thanh toán vào ngày 25/11. Tổng số tiền: 17.500.000 VND.',
    type: 'payment',
    date: '2023-11-12T09:15:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '3',
    title: 'Đề Xuất Thay Đổi Gói Dịch Vụ',
    message: 'Dựa trên tình trạng sức khỏe hiện tại, chúng tôi đề xuất nâng cấp lên gói chăm sóc đặc biệt.',
    type: 'service_recommendation',
    date: '2023-11-10T14:30:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: '4',
    title: 'Báo Cáo Sức Khỏe Hàng Tuần',
    message: 'Báo cáo sức khỏe tuần này: Các chỉ số sinh hiệu ổn định. Huyết áp: 120/80, Nhịp tim: 72 bpm. Người thân yên tâm.',
    type: 'health',
    date: '2023-11-11T14:30:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '5',
    title: 'Kết Quả Xét Nghiệm',
    message: 'Kết quả xét nghiệm máu định kỳ đã có. Các chỉ số đều trong giới hạn bình thường. Gia đình có thể xem chi tiết trong hồ sơ.',
    type: 'health',
    date: '2023-11-10T16:00:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: '6',
    title: 'Cảnh Báo Sức Khỏe',
    message: 'Huyết áp buổi sáng hơi cao: 145/90 mmHg. Đã thông báo bác sĩ và điều chỉnh thuốc. Gia đình lưu ý theo dõi.',
    type: 'health',
    date: '2023-11-09T08:30:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '7',
    title: 'Ảnh Mới Được Tải Lên',
    message: 'Có 5 ảnh mới của hoạt động tập thể dục buổi sáng. Hãy xem trong thư viện ảnh.',
    type: 'photo_upload',
    date: '2023-11-12T10:15:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: '8',
    title: 'Tham Gia Hoạt Động Tích Cực',
    message: 'Người thân của bạn đã tham gia liệu pháp âm nhạc nhóm và thể hiện sự tham gia rất tích cực. Thời gian: 10:00-11:30.',
    type: 'activity',
    date: '2023-11-10T11:45:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '9',
    title: 'Hoạt Động Thể Dục Buổi Sáng',
    message: 'Tham gia tập thể dục nhẹ buổi sáng với sự nhiệt tình cao. Điều này rất tốt cho sức khỏe. Thời gian: 30 phút.',
    type: 'activity',
    date: '2023-11-09T09:00:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: '10',
    title: 'Thành Tích Nghệ Thuật',
    message: 'Hoàn thành bức tranh phong cảnh đầu tiên trong lớp học nghệ thuật. Gia đình có thể yêu cầu xem ảnh tác phẩm.',
    type: 'activity',
    date: '2023-11-08T14:00:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '11',
    title: 'Lịch Thăm Đã Xác Nhận',
    message: 'Yêu cầu thăm của bạn vào ngày 15 tháng 11 lúc 14:00 đã được xác nhận. Vui lòng đến đúng giờ và mang theo giấy tờ tùy thân.',
    type: 'visit',
    date: '2023-11-09T16:20:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '12',
    title: 'Lịch Khám Định Kỳ',
    message: 'Lịch khám định kỳ với bác sĩ Tim mạch vào thứ 5 tuần tới đã được sắp xếp. Gia đình có thể tham dự nếu muốn.',
    type: 'appointment',
    date: '2023-11-08T10:00:00Z',
    read: false,
    priority: 'high'
  }
];

const getNotificationCounts = (notifications) => {
  return {
    all: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    medication: notifications.filter(n => n.type === 'medication').length,
    health: notifications.filter(n => n.type === 'health').length,
    activity: notifications.filter(n => n.type === 'activity').length,
    visit: notifications.filter(n => n.type === 'visit').length,
    appointment: notifications.filter(n => n.type === 'appointment').length,
    payment: notifications.filter(n => n.type === 'payment').length,
    photo_upload: notifications.filter(n => n.type === 'photo_upload').length,
    service_recommendation: notifications.filter(n => n.type === 'service_recommendation').length,
  };
};

const FamilyNotificationsScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setNotifications(mockNotifications);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    setRefreshing(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the notification is from today, only show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // If the notification is from yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    }
    
    // If the notification is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('vi-VN', { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString('vi-VN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'medication':
        return { name: 'pills', library: FontAwesome5, color: COLORS.primary };
      case 'health':
        return { name: 'heartbeat', library: FontAwesome5, color: COLORS.error };
      case 'activity':
        return { name: 'directions-run', library: MaterialIcons, color: COLORS.success };
      case 'visit':
        return { name: 'event', library: MaterialIcons, color: COLORS.secondary };
      case 'appointment':
        return { name: 'event-available', library: MaterialIcons, color: COLORS.info };
      case 'photo_upload':
        return { name: 'photo', library: MaterialIcons, color: COLORS.accent };
      case 'payment':
        return { name: 'payment', library: MaterialIcons, color: COLORS.warning };
      case 'service_recommendation':
        return { name: 'recommend', library: MaterialIcons, color: COLORS.primary };
      default:
        return { name: 'notifications', library: MaterialIcons, color: COLORS.textSecondary };
    }
  };

  const handleNotificationPress = (notification) => {
    // If notification is unread, mark it as read
    if (!notification.read) {
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
    }

    // Navigate based on notification type
    switch (notification.type) {
      case 'visit':
        navigation.navigate('Visits');
        break;
      case 'photo':
        navigation.navigate('Gallery');
        break;
      default:
        // Show detail alert for other types
        Alert.alert(
          notification.title,
          notification.message,
          [{ text: 'OK' }]
        );
        break;
    }
  };

  const handleMarkAllAsRead = () => {
    Alert.alert(
      'Đánh dấu tất cả đã đọc',
      'Bạn có muốn đánh dấu tất cả thông báo là đã đọc?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Đồng ý', 
          onPress: () => {
            const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
            setNotifications(updatedNotifications);
          }
        }
      ]
    );
  };

  const filterNotifications = (notifications) => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => !n.read);
    
    return notifications.filter(n => n.type === activeFilter);
  };

  const renderNotificationItem = ({ item }) => {
    const iconData = getNotificationIcon(item.type);
    const IconComponent = iconData.library;

    return (
      <TouchableOpacity
        style={styles.notificationWrapper}
        onPress={() => handleNotificationPress(item)}
      >
        <NativeCard style={[
          styles.notificationCard,
          !item.read && styles.unreadCard
        ]}>
          <NativeCard.Content style={styles.cardContent}>
            <View style={styles.notificationHeader}>
              <View style={[
                styles.iconContainer,
                { backgroundColor: iconData.color + '15' }
              ]}>
                <IconComponent name={iconData.name} size={20} color={iconData.color} />
                {!item.read && <View style={styles.unreadDot} />}
              </View>
              
              <View style={styles.contentContainer}>
                <View style={styles.titleRow}>
                  <Text style={[
                    styles.notificationTitle,
                    !item.read && styles.unreadText
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {formatDate(item.date)}
                  </Text>
                </View>
                
                <Text 
                  style={[
                    styles.notificationMessage,
                    !item.read && styles.unreadMessage
                  ]}
                  numberOfLines={3}
                >
                  {item.message}
                </Text>
                
                {item.priority === 'high' && (
                  <View style={styles.priorityBadge}>
                    <MaterialIcons name="priority-high" size={14} color={COLORS.error} />
                    <Text style={styles.priorityText}>Ưu tiên cao</Text>
                  </View>
                )}
              </View>
            </View>
          </NativeCard.Content>
        </NativeCard>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialIcons name="notifications" size={60} color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông báo...</Text>
      </SafeAreaView>
    );
  }

  const unreadCount = notifications.filter(n => !n.read).length;
  const filteredNotifications = filterNotifications(notifications);
  const counts = getNotificationCounts(notifications);

  const filters = [
    { id: 'all', label: 'Tất cả', count: counts.all, icon: 'notifications', color: COLORS.primary },
    { id: 'unread', label: 'Chưa đọc', count: counts.unread, icon: 'mark-chat-unread', color: COLORS.error },
    { id: 'health', label: 'Sức khỏe', count: counts.health, icon: 'favorite', color: COLORS.accent },
    { id: 'activity', label: 'Hoạt động', count: counts.activity, icon: 'directions-run', color: COLORS.success },
    { id: 'visit', label: 'Thăm viếng', count: counts.visit, icon: 'event', color: COLORS.info },
    { id: 'appointment', label: 'Hẹn khám', count: counts.appointment, icon: 'event-available', color: COLORS.warning },
    { id: 'payment', label: 'Thanh toán', count: counts.payment, icon: 'payment', color: COLORS.warning },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông Báo</Text>
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{unreadCount}</Text>
          </View>
        )}
      </View>

      {/* Filter Chips - Fixed Position */}
      <View style={styles.filtersWrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      >
        {filters.map((item) => {
          const isActive = activeFilter === item.id;
          
          return (
            <View key={item.id} style={styles.chipWrapper}>
              <TouchableOpacity
                style={[
                  styles.filterChip,
                  isActive && styles.activeFilterChip,
                  isActive && { backgroundColor: item.color, borderColor: item.color }
                ]}
                onPress={() => setActiveFilter(item.id)}
              >
                <MaterialIcons 
                  name={item.icon} 
                  size={16} 
                  color={isActive ? COLORS.surface : item.color}
                  style={styles.chipIcon}
                />
                <Text 
                  style={[
                    styles.filterChipText,
                    isActive && styles.activeFilterChipText
                  ]}
                  numberOfLines={1}
                >
                  {item.label}
                </Text>
                {item.count > 0 && (
                  <View style={[
                    styles.countBadge,
                    isActive && styles.activeCountBadge
                  ]}>
                    <Text style={[
                      styles.countText,
                      isActive && styles.activeCountText
                    ]}>
                      {item.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>
      </View>

      {/* Notifications List - Flex container */}
      <View style={styles.notificationsContainer}>
      <FlatList
        data={filteredNotifications}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationsList}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={[COLORS.primary]} 
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={80} color={COLORS.border} />
            <Text style={styles.emptyTitle}>
              {activeFilter === 'all' ? 'Chưa có thông báo' : 'Không có thông báo'}
            </Text>
            <Text style={styles.emptySubtext}>
              {activeFilter === 'all' 
                ? 'Bạn sẽ nhận được thông báo về tình trạng sức khỏe và hoạt động tại đây' 
                : `Không có thông báo nào trong danh mục "${filters.find(f => f.id === activeFilter)?.label}"`
              }
            </Text>
          </View>
        }
      />
      </View>
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
    marginTop: 16,
    color: COLORS.text,
    fontSize: 16,
    ...FONTS.body2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    fontWeight: '700',
  },
  unreadBadge: {
    backgroundColor: COLORS.error,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  filtersWrapper: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 8,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipWrapper: {
    position: 'relative',
    marginRight: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    marginHorizontal: 2,
    minHeight: 40,
  },
  chipIcon: {
    marginRight: 6,
  },
  activeFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  filterChipText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '500',
    fontSize: 12,
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  activeFilterChipText: {
    color: COLORS.surface,
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: COLORS.background,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  activeCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  countText: {
    ...FONTS.body3,
    color: COLORS.text,
    fontWeight: '600',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },
  activeCountText: {
    color: COLORS.surface,
    fontWeight: '700',
  },
  notificationsContainer: {
    flex: 1,
  },
  notificationsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  notificationWrapper: {
    marginBottom: 12,
  },
  notificationCard: {
    backgroundColor: COLORS.surface,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardContent: {
    padding: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  contentContainer: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  notificationTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  unreadText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  notificationTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  notificationMessage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 6,
  },
  unreadMessage: {
    color: COLORS.text,
    fontWeight: '500',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: COLORS.error + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  priorityText: {
    ...FONTS.body3,
    color: COLORS.error,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginTop: 24,
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

});

export default FamilyNotificationsScreen; 