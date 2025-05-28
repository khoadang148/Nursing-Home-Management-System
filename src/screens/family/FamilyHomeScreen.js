import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Card, Title, Paragraph, ActivityIndicator, useTheme } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import mock data (for now)
import { residents, medications, activities, familyMembers } from '../../api/mockData';

const FamilyHomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [upcomingVisit, setUpcomingVisit] = useState(null);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find the family member's assigned resident
    if (user?.residentId) {
      const residentData = residents.find(r => r.id === user.residentId);
      setResident(residentData);
      
      // Mock upcoming visit
      setUpcomingVisit({
        id: '1',
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 3 days from now
        time: '15:00',
        duration: 60, // minutes
        status: 'Confirmed'
      });
      
      // Mock latest updates
      setLatestUpdates([
        { 
          id: '1', 
          type: 'health', 
          title: 'Cập Nhật Sức Khỏe', 
          message: `${residentData?.firstName} có một ngày tuyệt vời hôm nay. Huyết áp bình thường ở mức 120/80.`,
          date: new Date().toISOString(),
          read: false
        },
        { 
          id: '2', 
          type: 'activity', 
          title: 'Hoạt Động Đã Hoàn Thành', 
          message: `${residentData?.firstName} đã tham gia vào liệu pháp âm nhạc nhóm và thích thú hát theo.`,
          date: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          read: true
        },
        { 
          id: '3', 
          type: 'medication', 
          title: 'Cập Nhật Thuốc', 
          message: 'Tất cả thuốc đã được dùng theo lịch trình hôm nay.',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true
        },
      ]);
      
      // Mock upcoming activities
      setUpcomingActivities([
        { 
          id: '1', 
          title: 'Liệu Pháp Âm Nhạc', 
          date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '10:00 AM',
          location: 'Phòng Giải Trí'
        },
        { 
          id: '2', 
          title: 'Đi Dạo Vườn', 
          date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '2:30 PM',
          location: 'Sân Vườn'
        },
      ]);
    }
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào Buổi Sáng';
    if (hour < 17) return 'Chào Buổi Chiều';
    return 'Chào Buổi Tối';
  };
  
  // Format date to friendly format (Today, Yesterday, or actual date)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Hôm qua';
    } else {
      return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()},</Text>
            <Text style={styles.name}>{user?.firstName || 'User'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('HoSo')}>
            <Image 
              source={{ uri: user?.photo || 'https://randomuser.me/api/portraits/women/11.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        
        {/* Resident Card */}
        {resident && (
          <Card style={styles.residentCard} mode="elevated">
            <Card.Content style={styles.residentCardContent}>
              <Image 
                source={{ uri: resident.photo || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={styles.residentPhoto}
              />
              <View style={styles.residentInfo}>
                <Title style={styles.residentName}>{`${resident.firstName} ${resident.lastName}`}</Title>
                <Paragraph style={styles.residentDetails}>Phòng {resident.roomNumber}</Paragraph>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => navigation.navigate('NguoiThan')}
                >
                  <Text style={styles.viewDetailsText}>Xem Chi Tiết</Text>
                </TouchableOpacity>
              </View>
            </Card.Content>
          </Card>
        )}
        
        {/* Quick Actions */}
        <View style={styles.quickActionContainer}>
          <Text style={styles.sectionTitle}>Tiện Ích Gia Đình</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('TinNhan')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="chatbubble-ellipses" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Nhắn Tin Nhân Viên</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('LichTham')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.accent }]}>
                <MaterialIcons name="event" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Đặt Lịch Thăm</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('HinhAnh')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.secondary }]}>
                <MaterialIcons name="photo-library" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Xem Hình Ảnh</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Upcoming Visit */}
        {upcomingVisit && (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons name="event" size={24} color={COLORS.primary} />
                <Title style={styles.cardTitle}>Lịch Thăm Sắp Tới</Title>
              </View>
              <View style={styles.visitInfo}>
                <View style={styles.visitDetail}>
                  <Text style={styles.visitLabel}>Ngày:</Text>
                  <Text style={styles.visitValue}>{upcomingVisit.date}</Text>
                </View>
                <View style={styles.visitDetail}>
                  <Text style={styles.visitLabel}>Giờ:</Text>
                  <Text style={styles.visitValue}>{upcomingVisit.time}</Text>
                </View>
                <View style={styles.visitDetail}>
                  <Text style={styles.visitLabel}>Trạng thái:</Text>
                  <Text style={[styles.visitValue, { color: COLORS.success }]}>{upcomingVisit.status === 'Confirmed' ? 'Đã xác nhận' : upcomingVisit.status}</Text>
                </View>
              </View>
              <TouchableOpacity 
                style={styles.cardButton}
                onPress={() => navigation.navigate('LichTham')}
              >
                <Text style={styles.cardButtonText}>Quản Lý Lịch Thăm</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        )}
        
        {/* Latest Updates */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Cập Nhật Gần Đây</Title>
            </View>
            {latestUpdates.map((update) => (
              <View key={update.id} style={styles.updateItem}>
                <View style={styles.updateIconContainer}>
                  {update.type === 'health' && (
                    <FontAwesome5 name="heartbeat" size={16} color={COLORS.error} />
                  )}
                  {update.type === 'activity' && (
                    <MaterialIcons name="directions-run" size={18} color={COLORS.accent} />
                  )}
                  {update.type === 'medication' && (
                    <FontAwesome5 name="pills" size={16} color={COLORS.secondary} />
                  )}
                </View>
                <View style={styles.updateContent}>
                  <View style={styles.updateHeader}>
                    <Text style={styles.updateTitle}>
                      {update.type === 'health' ? 'Cập Nhật Sức Khỏe' : 
                       update.type === 'activity' ? 'Hoạt Động Đã Hoàn Thành' :
                       update.type === 'medication' ? 'Cập Nhật Thuốc' : update.title}
                    </Text>
                    <Text style={styles.updateDate}>{formatDate(update.date)}</Text>
                  </View>
                  <Text style={styles.updateMessage}>{update.message}</Text>
                </View>
                {!update.read && <View style={styles.unreadIndicator} />}
              </View>
            ))}
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => navigation.navigate('ThongBao')}
            >
              <Text style={styles.cardButtonText}>Xem Tất Cả Cập Nhật</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        {/* Upcoming Activities */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="event" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Hoạt Động Sắp Tới</Title>
            </View>
            {upcomingActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDateContainer}>
                  <Text style={styles.activityDay}>{new Date(activity.date).getDate()}</Text>
                  <Text style={styles.activityMonth}>
                    {new Date(activity.date).toLocaleString('default', { month: 'short' })}
                  </Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <View style={styles.activityInfo}>
                    <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.activityInfoText}>{activity.time}</Text>
                  </View>
                  <View style={styles.activityInfo}>
                    <MaterialIcons name="place" size={14} color={COLORS.textSecondary} />
                    <Text style={styles.activityInfoText}>{activity.location}</Text>
                  </View>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
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
    padding: 16,
    paddingBottom: 100, // Tăng padding cho thanh tab bar cao hơn
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greeting: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  name: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.border,
  },
  residentCard: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
  },
  residentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.border,
    marginRight: 16,
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  residentDetails: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewDetailsText: {
    color: COLORS.surface,
    fontWeight: '500',
    fontSize: 12,
  },
  quickActionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionButton: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 4,
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
    textAlign: 'center',
    fontSize: 12,
    color: COLORS.text,
  },
  card: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    ...FONTS.h4,
    marginLeft: 8,
  },
  visitInfo: {
    marginBottom: 16,
  },
  visitDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  visitLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  visitValue: {
    ...FONTS.body3,
    fontWeight: '500',
    color: COLORS.text,
  },
  cardButton: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
  },
  cardButtonText: {
    color: COLORS.primary,
    fontWeight: '500',
    fontSize: 14,
  },
  updateItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  updateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  updateContent: {
    flex: 1,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  updateTitle: {
    ...FONTS.body3,
    fontWeight: '500',
    color: COLORS.text,
  },
  updateDate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  updateMessage: {
    ...FONTS.body3,
    color: COLORS.text,
  },
  unreadIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  activityDateContainer: {
    width: 45,
    height: 45,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityDay: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
  activityMonth: {
    color: COLORS.surface,
    fontSize: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    ...FONTS.body2,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityInfoText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
});

export default FamilyHomeScreen; 