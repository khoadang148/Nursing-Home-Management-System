import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { Card, Title, Paragraph, Divider, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import mock data
import { residents as mockResidents, familyMembers, carePlans, carePlanAssignments } from '../../api/mockData';

const { width } = Dimensions.get('window');

// Mock recent updates tích hợp từ MongoDB collections
const mockRecentUpdates = [
  {
    id: '1',
    type: 'assessment',
    title: 'Đánh giá trong ngày cho Nguyễn Văn Nam',
    subtitle: 'Tình trạng ổn định, cần theo dõi đường huyết',
    time: '2 giờ trước',
    resident_id: 'res_001',
    icon: 'assignment',
    color: COLORS.primary
  },
  {
    id: '2',
    type: 'vital_signs',
    title: 'Đo chỉ số sinh hiệu cho Lê Thị Hoa',
    subtitle: 'Huyết áp 140/85, cần theo dõi',
    time: '4 giờ trước',
    resident_id: 'res_002',
    icon: 'favorite',
    color: COLORS.error
  },
  {
    id: '3',
    type: 'activity',
    title: 'Hoạt động mới cho Trần Văn Bình',
    subtitle: 'Tham gia tập thể dục buổi sáng',
    time: '6 giờ trước',
    resident_id: 'res_003',
    icon: 'directions-run',
    color: COLORS.success
  }
];

const FamilyResidentScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  
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
    return {
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

  useEffect(() => {
    filterResidents();
  }, [searchQuery, residents]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Load residents for current family member based on imported mock data
    const userResidentIds = userData?.residentIds || [];
    const familyResidents = mockResidents.filter(r => userResidentIds.includes(r._id));
    
    // Transform data to match new schema expectations
    const transformedResidents = familyResidents.map(resident => {
      // Find care plan assignment for this resident
      const assignment = carePlanAssignments.find(ca => ca.resident_id === resident._id);
      const carePlan = assignment ? carePlans.find(cp => cp._id === assignment.care_plan_id) : null;
      
      return {
        _id: resident._id,
        full_name: resident.full_name,
        date_of_birth: resident.date_of_birth,
        gender: resident.gender,
        avatar: resident.avatar || resident.photo,
        admission_date: resident.admission_date,
        family_member_id: resident.family_member_id,
        medical_history: resident.medical_history,
        allergies: resident.allergies,
        emergency_contact: resident.emergency_contact,
        care_level: resident.care_level,
        status: resident.status,
        room: { 
          room_number: resident.room_number,
          bed_number: `${resident.room_number}-${resident.bed_number}` 
        },
        care_plan: carePlan ? {
          plan_name: carePlan.plan_name,
          total_monthly_cost: assignment?.total_monthly_cost || carePlan.monthly_price,
          status: assignment?.status || 'active'
        } : {
          plan_name: 'Gói Chăm Sóc Tiêu Chuẩn',
          total_monthly_cost: 15000000,
          status: 'active'
        },
        latest_vital: {
          temperature: 36.5 + Math.random() * 1,
          heart_rate: 70 + Math.floor(Math.random() * 20),
          blood_pressure: '130/80',
          date: new Date()
        },
        recent_activities: ['Tập thể dục buổi sáng', 'Bữa ăn tối'],
        payment_status: assignment?.payment_status || 'paid'
      };
    });
    
    setResidents(transformedResidents);
      
          // Update recent updates with actual resident names
      const updatedRecentUpdates = mockRecentUpdates.map(update => {
        const resident = mockResidents.find(r => r._id === update.resident_id);
      return {
        ...update,
        title: `${update.title.split(' cho ')[0]} cho ${resident?.full_name || 'Không tìm thấy'}`
      };
    });
    
    setRecentUpdates(updatedRecentUpdates);
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterResidents = () => {
    if (!searchQuery.trim()) {
      setFilteredResidents(residents);
      return;
    }

    const filtered = residents.filter(resident =>
      resident.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.room.room_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.care_plan.plan_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredResidents(filtered);
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    });
  };
  
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const handleResidentPress = (resident) => {
    navigation.navigate('FamilyResidentDetail', { 
      residentId: resident._id,
      residentName: resident.full_name 
    });
  };

  const handleRecentUpdatePress = (update) => {
    // Navigate to specific section of resident detail
    const residentName = mockResidents.find(r => r.id === update.resident_id)?.full_name || 'Không tìm thấy';
    
    const tabMapping = {
      'assessment': 'assessments',
      'vital_signs': 'vitals', 
      'activity': 'activities'
    };
    
    const initialTab = tabMapping[update.type] || 'overview';
    
    navigation.navigate('FamilyResidentDetail', { 
      residentId: update.resident_id,
      residentName: residentName,
      initialTab: initialTab
    });
  };

  const renderResidentCard = ({ item: resident }) => (
    <TouchableOpacity
      style={styles.residentCard}
      onPress={() => handleResidentPress(resident)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: resident.avatar }}
          style={styles.residentPhoto}
        />
        <View style={styles.residentInfo}>
          <Text style={styles.residentName}>{resident.full_name}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="room" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>
              Phòng {resident.room.room_number} • Giường {resident.room.bed_number}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <MaterialIcons name="cake" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {calculateAge(resident.date_of_birth)} tuổi
            </Text>
          </View>
        </View>
        <View style={styles.cardActions}>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.cardContent}>
        {/* Status chips */}
        <View style={styles.statusContainer}>
          <Chip 
            icon={() => <MaterialIcons name="check-circle" size={14} color={COLORS.success} />} 
            style={[styles.statusChip, {backgroundColor: COLORS.success + '20'}]}
            textStyle={{color: COLORS.success, fontSize: 11}}
          >
            {resident.status === 'active' ? 'Đang chăm sóc' : resident.status}
          </Chip>
          <Chip 
            style={[styles.statusChip, {backgroundColor: 
              resident.payment_status === 'paid' ? COLORS.success + '20' : COLORS.warning + '20'
            }]}
            textStyle={{color: 
              resident.payment_status === 'paid' ? COLORS.success : COLORS.warning, 
              fontSize: 11
            }}
          >
            {resident.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </Chip>
        </View>

        {/* Care plan info */}
        <View style={styles.carePlanInfo}>
          <Text style={styles.carePlanName}>{resident.care_plan.plan_name}</Text>
          <Text style={styles.carePlanCost}>
            {formatCurrency(resident.care_plan.total_monthly_cost)}/tháng
          </Text>
        </View>

        {/* Latest vital signs */}
        {resident.latest_vital && (
          <View style={styles.vitalPreview}>
            <Text style={styles.vitalTitle}>Chỉ số gần nhất:</Text>
            <View style={styles.vitalRow}>
              <Text style={styles.vitalText}>
                🌡️ {resident.latest_vital.temperature || '--'}°C
              </Text>
              <Text style={styles.vitalText}>
                ❤️ {resident.latest_vital.heart_rate || '--'} bpm
              </Text>
              <Text style={styles.vitalText}>
                🩸 {resident.latest_vital.blood_pressure || '--'} mmHg
              </Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderRecentUpdateCard = ({ item: update }) => (
    <TouchableOpacity
      style={styles.updateCard}
      onPress={() => handleRecentUpdatePress(update)}
      activeOpacity={0.7}
    >
      <View style={styles.updateHeader}>
        <View style={[styles.updateIcon, { backgroundColor: update.color + '20' }]}>
          <MaterialIcons name={update.icon} size={20} color={update.color} />
        </View>
        <View style={styles.updateInfo}>
          <Text style={styles.updateTitle}>{update.title}</Text>
          <Text style={styles.updateSubtitle}>{update.subtitle}</Text>
          <Text style={styles.updateTime}>{update.time}</Text>
        </View>
        <MaterialIcons name="chevron-right" size={20} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <Text style={styles.sectionTitle}>Cập nhật gần đây</Text>
      <FlatList
        data={recentUpdates}
        renderItem={renderRecentUpdateCard}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />
    </View>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải thông tin người thân...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Người Thân</Text>
        <Text style={styles.headerSubtitle}>
          {residents.length} người đang được chăm sóc
        </Text>
        
        {/* Search bar */}
        <Searchbar
          placeholder="Tìm kiếm người thân, phòng, gói dịch vụ..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Recent Updates Header */}
        <View style={styles.headerSection}>
          <Text style={styles.sectionTitle}>Cập nhật gần đây</Text>
          {recentUpdates.map((update, index) => (
            <View key={update.id}>
              {renderRecentUpdateCard({ item: update })}
              {index < recentUpdates.length - 1 && <View style={{ height: 8 }} />}
            </View>
          ))}
        </View>
        
        {/* Residents List */}
        {filteredResidents.length > 0 ? (
          filteredResidents.map((resident, index) => (
            <View key={resident._id}>
              {renderResidentCard({ item: resident })}
              {index < filteredResidents.length - 1 && <View style={{ height: 16 }} />}
                </View>
              ))
            ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy người thân nào' : 'Chưa có người thân nào được đăng ký'}
                    </Text>
                  </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  updateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
  },
  updateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  updateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  updateInfo: {
    flex: 1,
  },
  updateTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  updateSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  updateTime: {
    fontSize: 11,
    color: COLORS.primary,
  },
  residentCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentPhoto: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  cardActions: {
    padding: 4,
  },
  divider: {
    marginVertical: 12,
  },
  cardContent: {
    gap: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  statusChip: {
    height: 33,
  },
  carePlanInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  carePlanName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  carePlanCost: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '500',
  },
  vitalPreview: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
  },
  vitalTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1976d2',
    marginBottom: 6,
  },
  vitalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vitalText: {
    fontSize: 11,
    color: '#1976d2',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    textAlign: 'center',
  },
});

export default FamilyResidentScreen; 