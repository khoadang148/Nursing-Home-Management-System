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
          
          {/* Second row of quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('GoiDichVu')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.success }]}>
                <MaterialIcons name="card-membership" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Gói Dịch Vụ</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('HoaDon')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.warning }]}>
                <MaterialIcons name="receipt" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Hóa Đơn</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('HoTro')}
            >
              <View style={[styles.iconBackground, { backgroundColor: COLORS.info }]}>
                <MaterialIcons name="help-outline" size={24} color="white" />
              </View>
              <Text style={styles.quickActionText}>Hỗ Trợ</Text>
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
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    color: '#6c757d',
    fontSize: 16,
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 8,
  },
  greeting: {
    fontSize: 14,
    color: '#6c757d',
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#dee2e6',
  },
  residentCard: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  residentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentPhoto: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#dee2e6',
    marginRight: 16,
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
    color: '#212529',
  },
  residentDetails: {
    fontSize: 13,
    color: '#6c757d',
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
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
  },
  quickActionContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
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
    fontSize: 13,
    color: '#212529',
  },
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#212529',
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
    fontSize: 13,
    color: '#6c757d',
  },
  visitValue: {
    fontSize: 13,
    fontWeight: '500',
    color: '#212529',
  },
  visitNote: {
    fontSize: 12,
    color: '#dc3545',
    fontStyle: 'italic',
    marginTop: 2,
  },
  cardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  cardButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 13,
  },
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    position: 'relative',
  },
  updateIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
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
    alignItems: 'center',
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    flex: 1,
  },
  updateDate: {
    fontSize: 11,
    color: '#6c757d',
  },
  updateMessage: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityDateContainer: {
    width: 45,
    alignItems: 'center',
    marginRight: 12,
  },
  activityDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  activityMonth: {
    fontSize: 11,
    color: '#6c757d',
    textTransform: 'uppercase',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 4,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  activityInfoText: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 4,
  },
});

export default FamilyHomeScreen; 