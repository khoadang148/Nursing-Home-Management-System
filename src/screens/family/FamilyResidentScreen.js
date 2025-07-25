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
import { useSelector, useDispatch } from 'react-redux';
import { Card, Title, Paragraph, Divider, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import Redux actions
import { fetchResidentsByFamilyMember, setCurrentResident } from '../../redux/slices/residentSlice';

// Import services
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import carePlanService from '../../api/services/carePlanService';

const { width } = Dimensions.get('window');

// Mock recent updates - sẽ được cập nhật với dữ liệu thực sau
const mockRecentUpdates = [
  {
    id: '1',
    type: 'assessment',
    title: 'Đánh giá trong ngày',
    subtitle: 'Tình trạng ổn định, cần theo dõi đường huyết',
    time: '2 giờ trước',
    resident_id: 'res_001',
    icon: 'assignment',
    color: COLORS.primary
  },
  {
    id: '2',
    type: 'vital_signs',
    title: 'Đo chỉ số sinh hiệu',
    subtitle: 'Huyết áp 140/85, cần theo dõi',
    time: '4 giờ trước',
    resident_id: 'res_002',
    icon: 'favorite',
    color: COLORS.error
  },
  {
    id: '3',
    type: 'activity',
    title: 'Hoạt động mới',
    subtitle: 'Tham gia tập thể dục buổi sáng',
    time: '6 giờ trước',
    resident_id: 'res_003',
    icon: 'directions-run',
    color: COLORS.success
  }
];

const FamilyResidentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { familyResidents, loading, error } = useSelector((state) => state.residents);
  
  const [refreshing, setRefreshing] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [residentsWithDetails, setResidentsWithDetails] = useState([]);
  const sortedResidentsWithDetails = [...residentsWithDetails].sort((a, b) => new Date(a.admission_date) - new Date(b.admission_date));
  
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
  }, [searchQuery, residentsWithDetails]);
  
  const loadData = async () => {
    try {
      // Fetch residents for this family member
      if (userData?.id || userData?._id) {
        const familyMemberId = userData.id || userData._id;
        await dispatch(fetchResidentsByFamilyMember(familyMemberId)).unwrap();
      }
      
      // Load additional data (updates, etc.)
      await loadAdditionalData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };
  
  const loadResidentDetails = async () => {
    try {
      console.log('[FamilyResidentScreen] familyResidents:', familyResidents.map(r => ({_id: r._id, name: r.full_name})));
      const residentsWithFullDetails = await Promise.all(
        familyResidents.map(async (resident) => {
          // Lấy thông tin phòng và giường
          const bedInfoResult = await bedAssignmentService.getResidentBedInfo(resident._id);
          const bedInfo = bedInfoResult.success ? bedInfoResult.data : null;
          // Lấy chỉ số sinh hiệu gần nhất
          const vitalSignsResult = await vitalSignsService.getVitalSignsByResidentId(resident._id);
          let latestVital = null;
          if (vitalSignsResult.success && Array.isArray(vitalSignsResult.data) && vitalSignsResult.data.length > 0) {
            latestVital = vitalSignsResult.data.reduce((latest, curr) => {
              return (!latest || new Date(curr.date_time) > new Date(latest.date_time)) ? curr : latest;
            }, null);
          }
          // Lấy gói dịch vụ
          let carePlanName = 'Chưa có';
          let carePlanCost = '';
          try {
            const carePlanRes = await carePlanService.getCarePlanAssignmentByResidentId(resident._id);
            if (carePlanRes.success && carePlanRes.data && carePlanRes.data.care_plan_ids?.[0]) {
              carePlanName = carePlanRes.data.care_plan_ids[0].plan_name || 'Chưa có';
              if (carePlanRes.data.care_plan_ids[0].monthly_price) {
                carePlanCost = formatCurrency(carePlanRes.data.care_plan_ids[0].monthly_price) + '/tháng';
              }
            }
          } catch (e) {}
          return {
            ...resident,
            bedInfo,
            vitalSigns: latestVital,
            carePlanName,
            carePlanCost
          };
        })
      );
      setResidentsWithDetails(residentsWithFullDetails);
    } catch (error) {
      console.error('Error loading resident details:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    // Update recent updates with actual resident names (chỉ dùng cho UI demo, không cho phép click nếu id là mock)
    const updatedRecentUpdates = mockRecentUpdates.map(update => {
      const resident = familyResidents.find(r => r._id === update.resident_id);
      return {
        ...update,
        title: `${update.title.split(' cho ')[0]} cho ${resident?.full_name || 'Người cao tuổi'}`
      };
    });
    setRecentUpdates(updatedRecentUpdates);
    await loadResidentDetails();
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const filterResidents = () => {
    if (!searchQuery.trim()) {
      setFilteredResidents(residentsWithDetails);
      return;
    }

    const filtered = residentsWithDetails.filter(resident =>
      resident.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resident.bedInfo?.fullRoomInfo || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      resident.medical_history?.toLowerCase().includes(searchQuery.toLowerCase())
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
    if (!dateOfBirth) return 0;
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
    }).format(amount || 0);
  };

  const handleResidentPress = (resident) => {
    console.log('[FamilyResidentScreen] Pressed residentId:', resident._id);
    dispatch(setCurrentResident(resident));
    navigation.navigate('FamilyResidentDetail', { 
      residentId: resident._id,
      residentName: resident.full_name 
    });
  };

  const handleRecentUpdatePress = (update) => {
    // Navigate to specific section of resident detail
    const resident = familyResidents.find(r => r._id === update.resident_id);
    
    const tabMapping = {
      'assessment': 'assessments',
      'vital_signs': 'vitals', 
      'activity': 'activities'
    };
    
    const initialTab = tabMapping[update.type] || 'overview';
    
    if (resident) {
      dispatch(setCurrentResident(resident));
      navigation.navigate('FamilyResidentDetail', { 
        residentId: update.resident_id,
        residentName: resident.full_name,
        initialTab: initialTab
      });
    }
  };

  const renderResidentCard = ({ item: resident }) => {
    const isMockId = typeof resident._id === 'string' && resident._id.startsWith('res_');
    let statusLabel = '';
    let statusColor = COLORS.success;
    if (resident.status === 'active') {
      statusLabel = 'Đang chăm sóc';
      statusColor = COLORS.success;
    } else if (resident.status === 'discharged') {
      statusLabel = 'Đã xuất viện';
      statusColor = COLORS.info;
    } else if (resident.status === 'deceased') {
      statusLabel = 'Đã qua đời';
      statusColor = COLORS.error;
    } else {
      statusLabel = 'Không xác định';
      statusColor = COLORS.textSecondary;
    }
    return (
    <TouchableOpacity
      style={styles.residentCard}
        onPress={isMockId ? undefined : () => handleResidentPress(resident)}
        activeOpacity={isMockId ? 1 : 0.7}
        disabled={isMockId}
    >
      <View style={styles.cardHeader}>
        <Image 
          source={{ uri: resident.avatar || 'https://randomuser.me/api/portraits/men/1.jpg' }}
          style={styles.residentPhoto}
        />
        <View style={styles.residentInfo}>
          <Text style={styles.residentName}>{resident.full_name || 'Không có tên'}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="room" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>
                Phòng {resident.bedInfo?.fullRoomInfo || 'Chưa phân phòng'}
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
              icon={() => <MaterialIcons name="check-circle" size={14} color={statusColor} />} 
              style={[styles.statusChip, {backgroundColor: statusColor + '20'}]}
              textStyle={{color: statusColor, fontSize: 11}}
          >
              {statusLabel}
          </Chip>
          <Chip 
            style={[styles.statusChip, {backgroundColor: COLORS.primary + '20'}]}
            textStyle={{color: COLORS.primary, fontSize: 11}}
          >
              Đã thanh toán
          </Chip>
          </View>
          {/* Care Plan */}
          <View className="carePlanInfo">
            <Text style={styles.carePlanName}>{resident.carePlanName}</Text>
            <Text style={styles.carePlanCost}>{resident.carePlanCost}</Text>
          </View>
          {/* Latest Vital Signs */}
          {resident.vitalSigns && (
            <View style={styles.vitalPreview}>
              <Text style={styles.vitalTitle}>Chỉ số gần nhất</Text>
              <View style={styles.vitalRow}>
                <View style={styles.vitalItem}>
                  <FontAwesome5 name="thermometer-half" size={12} color={COLORS.error} />
                  <Text style={styles.vitalText}>{resident.vitalSigns.temperature}°C</Text>
                </View>
                <View style={styles.vitalItem}>
                  <FontAwesome5 name="heart" size={12} color={COLORS.error} />
                  <Text style={styles.vitalText}>{resident.vitalSigns.heart_rate} bpm</Text>
                </View>
                <View style={styles.vitalItem}>
                  <FontAwesome5 name="tint" size={12} color={COLORS.error} />
                  <Text style={styles.vitalText}>{resident.vitalSigns.blood_pressure}</Text>
                </View>
          </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  };

  const renderRecentUpdateCard = ({ item: update }) => {
    const isMockId = typeof update.resident_id === 'string' && update.resident_id.startsWith('res_');
    return (
    <TouchableOpacity
      style={styles.updateCard}
        onPress={isMockId ? undefined : () => handleRecentUpdatePress(update)}
        activeOpacity={isMockId ? 1 : 0.7}
        disabled={isMockId}
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
  };

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
          {residentsWithDetails.length} người đang được chăm sóc
        </Text>
        
        {/* Search bar */}
        <Searchbar
          placeholder="Tìm kiếm người thân, phòng, tiền sử bệnh..."
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
          sortedResidentsWithDetails
            .filter(resident => filteredResidents.some(f => f._id === resident._id))
            .map((resident, index, arr) => (
            <View key={resident._id}>
              {renderResidentCard({ item: resident })}
                {index < arr.length - 1 && <View style={{ height: 16 }} />}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="people-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'Không tìm thấy người thân nào' : 'Chưa có người thân nào được đăng ký'}
            </Text>
            {!searchQuery && (
              <Text style={styles.emptySubtext}>
                Vui lòng liên hệ với ban quản lý để được hỗ trợ đăng ký
              </Text>
            )}
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
  vitalItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vitalText: {
    fontSize: 11,
    color: '#1976d2',
    marginLeft: 4,
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
  emptySubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  medicalInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  medicalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicalText: {
    fontSize: 12,
    color: '#666',
  },
  medicationInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  medicationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  medicationText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  allergyInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  allergyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  allergyText: {
    fontSize: 12,
    color: '#666',
  },
  emergencyInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  emergencyText: {
    fontSize: 12,
    color: '#666',
  },
});

export default FamilyResidentScreen; 