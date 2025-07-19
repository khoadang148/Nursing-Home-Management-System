import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl,
  Image,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Title, Paragraph, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import mock data (for now)
import { residents as mockResidents, medications, activities, familyMembers, recentUpdates } from '../../api/mockData';

const FamilyHomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userResidents, setUserResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [upcomingVisit, setUpcomingVisit] = useState(null);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  
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
      id: 'f1',
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
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find all residents assigned to this family member
    if (userData?.residentIds && userData.residentIds.length > 0) {
      const familyResidents = mockResidents.filter(r => userData.residentIds.includes(r._id));
      setUserResidents(familyResidents);
      
      // Select first resident by default
      if (familyResidents.length > 0) {
        setSelectedResident(familyResidents[0]);
      }
      
      // Mock upcoming visit for selected resident
      setUpcomingVisit({
        id: 'visit_001',
          residentId: familyResidents[0]?._id,
          residentName: familyResidents[0]?.full_name || 'Không có tên',
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        time: '15:00',
        duration: 60,
        status: 'Confirmed',
        purpose: 'Thăm viếng định kỳ',
        notes: 'Đã được phê duyệt bởi quản lý'
      });
      
      // Use mock recent updates data with real resident data
      const updatedRecentUpdates = [
        {
          id: 'update_001',
          type: 'assessment',
          title: 'Đánh giá trong ngày',
          residentName: 'Nguyễn Văn Nam',
          residentId: 'res_001',
          message: 'Tình trạng ổn định, cần theo dõi đường huyết. Tinh thần tốt, ăn uống bình thường.',
          date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          time: '14:30',
          read: false,
          staffName: 'Bác sĩ Phạm Thị Doctor'
        },
        {
          id: 'update_002',
          type: 'vital_signs',
          title: 'Đo chỉ số sinh hiệu',
          residentName: 'Lê Thị Hoa',
          residentId: 'res_002',
          message: 'Huyết áp: 140/85 mmHg, Nhịp tim: 78 BPM, Nhiệt độ: 36.7°C. Cần theo dõi huyết áp.',
          date: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          time: '12:15',
          read: false,
          staffName: 'Y tá Lê Văn Nurse'
        },
        {
          id: 'update_003',
          type: 'activity',
          title: 'Tham gia hoạt động',
          residentName: 'Trần Văn Bình',
          residentId: 'res_003',
          message: 'Tham gia tập thể dục buổi sáng rất tích cực. Thời gian: 30 phút.',
          date: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          time: '09:00',
          read: false,
          staffName: 'Nhân viên Hoàng Văn Caregiver'
        },
        {
          id: 'update_004',
          type: 'medication',
          title: 'Uống thuốc theo lịch',
          residentName: 'Nguyễn Văn Nam',
          residentId: 'res_001',
          message: 'Đã uống đầy đủ thuốc theo chỉ định: Metformin 500mg, Amlodipine 5mg.',
          date: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
          time: '08:00',
          read: true,
          staffName: 'Y tá Lê Văn Nurse'
        },
        {
          id: 'update_005',
          type: 'assessment',
          title: 'Đánh giá tình trạng giấc ngủ',
          residentName: 'Lê Thị Hoa',
          residentId: 'res_002',
          message: 'Ngủ được 6 tiếng, thức giấc 2 lần trong đêm. Cần theo dõi thêm.',
          date: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          time: '07:30',
          read: true,
          staffName: 'Y tá Lê Văn Nurse'
        }
      ];
      
      setLatestUpdates(updatedRecentUpdates);
      
      // Mock upcoming activities for today (not yet completed)
      const currentTime = new Date();
      const todayStr = currentTime.toISOString().split('T')[0];
      const tomorrowStr = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      setUpcomingActivities([
        { 
          id: 'act_001', 
          title: 'Liệu pháp âm nhạc nhóm', 
          residentName: 'Nguyễn Văn Nam',
          date: todayStr,
          time: '15:30',
          location: 'Phòng Giải Trí',
          residentId: 'res_001'
        },
        { 
          id: 'act_002', 
          title: 'Khám sức khỏe định kỳ', 
          residentName: 'Lê Thị Hoa',
          date: todayStr,
          time: '16:30',
          location: 'Phòng Y Tế',
          residentId: 'res_002'
        },
        { 
          id: 'act_003', 
          title: 'Tập thể dục buổi sáng', 
          residentName: 'Trần Văn Bình',
          date: tomorrowStr,
          time: '07:30',
          location: 'Sân Tập',
          residentId: 'res_003'
        },
        { 
          id: 'act_004', 
          title: 'Đi dạo vườn', 
          residentName: 'Nguyễn Văn Nam & Lê Thị Hoa',
          date: tomorrowStr,
          time: '09:00',
          location: 'Sân Vườn',
          residentId: 'multiple'
        },
        { 
          id: 'act_005', 
          title: 'Hoạt động vẽ tranh', 
          residentName: 'Trần Văn Bình',
          date: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString().split('T')[0],
          time: '14:00',
          location: 'Phòng Nghệ Thuật',
          residentId: 'res_003'
        },
      ]);
    } else if (userData?.residentId) {
      // Fallback for single resident (backward compatibility)
      const residentData = mockResidents.find(r => r._id === userData.residentId);
      if (residentData) {
        setUserResidents([residentData]);
        setSelectedResident(residentData);
      }
    } else {
      // No residents assigned - show empty state
      setUserResidents([]);
      setSelectedResident(null);
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
  
  // Format date to friendly format with time
  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateStr;
    if (date.toDateString() === today.toDateString()) {
      dateStr = 'Hôm nay';
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = 'Hôm qua';
    } else {
      dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    }
    
    return `${timeString} ${dateStr}`;
  };

  // Navigate to detailed view based on update type
  const handleUpdatePress = (update) => {
    const tabMapping = {
      'vital_signs': 'vitals',
      'assessment': 'assessments', 
      'activity': 'activities',
      'medication': 'medications',
      'meal': 'overview'
    };
    
    const targetTab = tabMapping[update.type] || 'overview';
    
    // Navigate directly to FamilyResidentDetail (not nested)
    navigation.navigate('FamilyResidentDetail', {
      residentId: update.residentId,
      residentName: update.residentName,
      initialTab: targetTab
    });
  };

  // Get icon for update type
  const getUpdateIcon = (type) => {
    switch (type) {
      case 'vital_signs':
        return <FontAwesome5 name="heartbeat" size={16} color={COLORS.error} />;
      case 'assessment':
        return <MaterialIcons name="assignment" size={18} color={COLORS.primary} />;
      case 'activity':
        return <MaterialIcons name="directions-run" size={18} color={COLORS.accent} />;
      case 'medication':
        return <FontAwesome5 name="pills" size={16} color={COLORS.secondary} />;
      case 'meal':
        return <MaterialIcons name="restaurant" size={18} color={COLORS.success} />;
      default:
        return <MaterialIcons name="info" size={18} color={COLORS.info} />;
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
            <Text style={styles.name}>{userData.full_name || 'Trần Lê Chi Bảo'}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('HoSo')}>
            <Image 
              source={{ uri: userData.photo || 'https://randomuser.me/api/portraits/men/20.jpg' }}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        
        {/* Resident Selection & Info Section */}
        {userResidents.length > 0 ? (
          <Card style={styles.residentSectionCard} mode="elevated">
            <Card.Content>
              <Title style={styles.sectionTitle}>Thông Tin Người Thân</Title>
              
              {/* Resident Selection Chips (if multiple residents) */}
              {userResidents.length > 1 && (
                <View style={styles.residentChipsContainer}>
                  <Text style={styles.chipLabel}>Chọn người thân:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
                    {userResidents.map((resident) => (
                      <Chip
                        key={resident._id}
                        mode={selectedResident?._id === resident._id ? 'flat' : 'outlined'}
                        selected={selectedResident?._id === resident._id}
                        onPress={() => setSelectedResident(resident)}
                        style={[
                          styles.residentChip,
                          selectedResident?._id === resident._id && styles.selectedChip
                        ]}
                        textStyle={[
                          styles.chipText,
                          selectedResident?._id === resident._id && styles.selectedChipText
                        ]}
                      >
                        {resident.full_name || 'Không có tên'}
                      </Chip>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {/* Selected Resident Info */}
              {selectedResident && (
                <View style={styles.selectedResidentInfo}>
                  <View style={styles.residentCardContent}>
              <Image 
                      source={{ uri: selectedResident.photo || 'https://randomuser.me/api/portraits/men/1.jpg' }}
                style={styles.residentPhoto}
              />
              <View style={styles.residentInfo}>
                      <Text style={styles.residentName}>
                        {selectedResident.full_name || 'Không có tên'}
                      </Text>
                      <View style={styles.residentDetailRow}>
                        <MaterialIcons name="room" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.residentDetails}>Phòng {selectedResident.roomNumber}</Text>
                      </View>
                      <View style={styles.residentDetailRow}>
                        <MaterialIcons name="cake" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.residentDetails}>
                          {selectedResident.age || 75} tuổi
                        </Text>
                      </View>
                      <View style={styles.residentDetailRow}>
                        <MaterialIcons name="favorite" size={16} color={COLORS.error} />
                        <Text style={[styles.residentDetails, { color: COLORS.success }]}>
                          Tình trạng: Ổn định
                        </Text>
                      </View>
                    </View>
                  </View>
                <TouchableOpacity 
                  style={styles.viewDetailsButton}
                  onPress={() => navigation.navigate('FamilyResidentDetail', {
                    residentId: selectedResident._id,
                    residentName: selectedResident.full_name || 'Không có tên',
                    initialTab: 'overview'
                  })}
                >
                    <Text style={styles.viewDetailsText}>Xem Chi Tiết Đầy Đủ</Text>
                    <MaterialIcons name="arrow-forward" size={16} color="white" />
                </TouchableOpacity>
              </View>
              )}
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.residentSectionCard} mode="elevated">
            <Card.Content>
              <View style={styles.noResidentsContainer}>
                <MaterialIcons name="family-restroom" size={64} color={COLORS.textSecondary} />
                <Text style={styles.noResidentsTitle}>Chưa có thông tin người thân</Text>
                <Text style={styles.noResidentsText}>
                  Hiện tại chưa có người cao tuổi nào được gán cho tài khoản của bạn. 
                  Vui lòng liên hệ với ban quản lý để được hỗ trợ.
                </Text>
                <TouchableOpacity 
                  style={styles.contactButton}
                  onPress={() => navigation.navigate('HoTro')}
                >
                  <Text style={styles.contactButtonText}>Liên Hệ Hỗ Trợ</Text>
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
                              onPress={() => navigation.navigate('TinNhanTab')}
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
                  <Text style={[styles.visitValue, { color: COLORS.success }]}>
                    {upcomingVisit.status === 'Confirmed' ? 'Đã xác nhận' : upcomingVisit.status}
                  </Text>
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
        
        {/* Enhanced Latest Updates */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Cập Nhật Gần Đây</Title>
            </View>
            {latestUpdates.slice(0, 5).map((update) => (
              <TouchableOpacity 
                key={update.id} 
                style={styles.updateItem}
                onPress={() => handleUpdatePress(update)}
                activeOpacity={0.7}
              >
                <View style={styles.updateIconContainer}>
                  {getUpdateIcon(update.type)}
                </View>
                <View style={styles.updateContent}>
                  <View style={styles.updateHeader}>
                    <Text style={styles.updateTitle}>
                      {update.title} cho {update.residentName}
                    </Text>
                    <Text style={styles.updateDateTime}>
                      {formatDateTime(update.date, update.time)}
                    </Text>
                  </View>
                  <Text style={styles.updateMessage} numberOfLines={2}>
                    {update.message}
                  </Text>
                </View>
                {!update.read && <View style={styles.unreadIndicator} />}
                <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            ))}
            <TouchableOpacity 
              style={styles.cardButton}
              onPress={() => navigation.navigate('ThongBao')}
            >
              <Text style={styles.cardButtonText}>Xem Tất Cả Cập Nhật</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
        
        {/* Enhanced Upcoming Activities */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="schedule" size={24} color={COLORS.accent} />
              <Title style={styles.cardTitle}>Hoạt Động Sắp Tới</Title>
            </View>
            {upcomingActivities.filter(activity => {
              // Only show activities that haven't happened yet
              const activityDateTime = new Date(`${activity.date} ${activity.time}`);
              return activityDateTime > new Date();
            }).slice(0, 3).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityDateContainer}>
                  <Text style={styles.activityDay}>{new Date(activity.date).getDate()}</Text>
                  <Text style={styles.activityMonth}>
                    Th{new Date(activity.date).getMonth() + 1}
                  </Text>
                </View>
                <View style={styles.activityDetails}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityResident}>{activity.residentName}</Text>
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
            {upcomingActivities.filter(activity => {
              const activityDateTime = new Date(`${activity.date} ${activity.time}`);
              return activityDateTime > new Date();
            }).length === 0 && (
              <View style={styles.noActivitiesContainer}>
                <MaterialIcons name="event-available" size={48} color={COLORS.textSecondary} />
                <Text style={styles.noActivitiesText}>Không có hoạt động nào sắp tới</Text>
              </View>
            )}
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
  
  // New Resident Section Styles
  residentSectionCard: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  residentChipsContainer: {
    marginBottom: 16,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  chipsScrollView: {
    flexDirection: 'row',
  },
  residentChip: {
    marginRight: 8,
    backgroundColor: '#f8f9fa',
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  selectedChipText: {
    color: 'white',
    fontWeight: '600',
  },
  selectedResidentInfo: {
    marginTop: 8,
  },
  residentCardContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
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
    marginBottom: 8,
    color: '#212529',
  },
  residentDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  residentDetails: {
    fontSize: 13,
    color: '#6c757d',
    marginLeft: 4,
  },
  viewDetailsButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewDetailsText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
    marginRight: 8,
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
    marginBottom: 8,
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
    color: '#212529',
    lineHeight: 16,
  },
  card: {
    marginBottom: 20,
    backgroundColor: 'white',
    borderRadius: 12,
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
  cardButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginTop: 8,
  },
  cardButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  
  // Enhanced Update Item Styles
  updateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    position: 'relative',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  updateIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  updateContent: {
    flex: 1,
    marginRight: 8,
  },
  updateHeader: {
    marginBottom: 4,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  updateDateTime: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '500',
  },
  updateMessage: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 16,
  },
  unreadIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
  },
  
  // Enhanced Activity Styles
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 8,
    backgroundColor: '#fafafa',
  },
  activityDateContainer: {
    width: 45,
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 6,
  },
  activityDay: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  activityMonth: {
    fontSize: 10,
    color: 'white',
    fontWeight: '500',
  },
  activityDetails: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  activityResident: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
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
  noActivitiesContainer: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  noActivitiesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  
  // Empty State Styles
  noResidentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResidentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  noResidentsText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  contactButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default FamilyHomeScreen; 