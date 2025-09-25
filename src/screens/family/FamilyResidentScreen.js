import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Title, Paragraph, Divider, ActivityIndicator, Chip, Searchbar } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import Redux actions
import { fetchResidentsByFamilyMember, setCurrentResident, triggerResidentDataReload } from '../../redux/slices/residentSlice';
import { updateProfile } from '../../redux/slices/authSlice';

// Import services
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';
import authService from '../../api/services/authService';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';
import CommonAvatar from '../../components/CommonAvatar';

// Removed DEFAULT_AVATAR and getAvatarUri - now using CommonAvatar component

const { width } = Dimensions.get('window');

// Real recent updates will be loaded from API
const getRecentUpdates = (residentsWithDetails) => {
  const updates = [];
  
  residentsWithDetails.forEach(resident => {
    // Add vital signs update if available
    if (resident.vitalSigns) {
      const vitalTime = new Date(resident.vitalSigns.date_time || resident.vitalSigns.created_at);
      const timeDiff = Date.now() - vitalTime.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      // Chỉ hiển thị nếu có dữ liệu thật
      const bloodPressure = resident.vitalSigns.blood_pressure;
      const heartRate = resident.vitalSigns.heart_rate;
      
      if (bloodPressure || heartRate) {
        let subtitle = '';
        if (bloodPressure && heartRate) {
          subtitle = `Huyết áp ${bloodPressure}, Nhịp tim ${heartRate} BPM`;
        } else if (bloodPressure) {
          subtitle = `Huyết áp ${bloodPressure}`;
        } else if (heartRate) {
          subtitle = `Nhịp tim ${heartRate} BPM`;
        }
        
        let timeText = '';
        if (minutesAgo < 60) {
          timeText = `${minutesAgo} phút trước`;
        } else {
          timeText = `${hoursAgo} giờ trước`;
        }
        
        updates.push({
          id: `vital_${resident._id}`,
          type: 'vital_signs',
          title: 'Đo chỉ số sinh hiệu',
          subtitle: subtitle,
          time: timeText,
          resident_id: resident._id,
          resident_name: resident.full_name,
          icon: 'favorite',
          color: COLORS.error,
          timestamp: vitalTime
        });
      }
    }
    
    // Add assessment update if available
    if (resident.assessments && resident.assessments.length > 0) {
      const latestAssessment = resident.assessments[0]; // Assuming sorted by date desc
      const assessmentTime = new Date(latestAssessment.date || latestAssessment.created_at);
      const timeDiff = Date.now() - assessmentTime.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      // Chỉ hiển thị nếu có dữ liệu thật
      const assessmentNotes = latestAssessment.notes || latestAssessment.general_notes;
      
      if (assessmentNotes && assessmentNotes.trim() !== '') {
        let timeText = '';
        if (minutesAgo < 60) {
          timeText = `${minutesAgo} phút trước`;
        } else {
          timeText = `${hoursAgo} giờ trước`;
        }
        
        updates.push({
          id: `assessment_${resident._id}`,
          type: 'assessment',
          title: 'Đánh giá sức khỏe',
          subtitle: assessmentNotes,
          time: timeText,
          resident_id: resident._id,
          resident_name: resident.full_name,
          icon: 'assignment',
          color: COLORS.primary,
          timestamp: assessmentTime
        });
      }
    }
    
    // Add activity update if available
    if (resident.activities && resident.activities.length > 0) {
      const latestActivity = resident.activities[0]; // Assuming sorted by date desc
      const activityTime = new Date(latestActivity.created_at || latestActivity.date);
      const timeDiff = Date.now() - activityTime.getTime();
      const minutesAgo = Math.floor(timeDiff / (1000 * 60));
      const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60));
      
      // Chỉ hiển thị nếu có dữ liệu thật
      const activityName = latestActivity.activity_id?.activity_name;
      const attendanceStatus = latestActivity.attendance_status;
      const participationLevel = latestActivity.participation_level;
      
      if (activityName && attendanceStatus) {
        let statusText = '';
        let color = COLORS.success;
        
        switch (attendanceStatus) {
          case 'attended':
            statusText = participationLevel || 'Đã tham gia';
            color = COLORS.success;
            break;
          case 'excused':
            statusText = 'Xin nghỉ';
            color = COLORS.warning;
            break;
          case 'absent':
            statusText = 'Vắng mặt';
            color = COLORS.error;
            break;
          default:
            statusText = 'Chưa xác định';
            color = COLORS.textSecondary;
        }
        
        let timeText = '';
        if (minutesAgo < 60) {
          timeText = `${minutesAgo} phút trước`;
        } else {
          timeText = `${hoursAgo} giờ trước`;
        }
        
        updates.push({
          id: `activity_${resident._id}`,
          type: 'activity',
          title: 'Hoạt động',
          subtitle: `${activityName} - ${statusText}`,
          time: timeText,
          resident_id: resident._id,
          resident_name: resident.full_name,
          icon: 'directions-run',
          color: color,
          timestamp: activityTime
        });
      }
    }
  });
  
  // Sort by timestamp and take top 3
  return updates
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 3);
};

const FamilyResidentScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { familyResidents, loading, error } = useSelector((state) => state.residents);
  
  const [refreshing, setRefreshing] = useState(false);
  const [recentUpdates, setRecentUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [residentsWithDetails, setResidentsWithDetails] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);
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
  
  // Load data only when user changes or on mount, and only if not already loaded
  useEffect(() => {
    console.log('🔄 FamilyResidentScreen useEffect triggered - user?.id:', user?.id);
    if (user?.id && !dataLoaded) {
      console.log('📡 Loading data for user:', user?.id);
      loadData();
      setDataLoaded(true);
    }
  }, [user?.id, dataLoaded]); // Only load once per user session

  // Load resident details when familyResidents changes
  useEffect(() => {
    if (familyResidents.length > 0) {
      loadResidentDetails();
    }
  }, [familyResidents]); // Depend on the actual array, not just length

  // Fetch profile after login to get complete user data including avatar
  useEffect(() => {
    const fetchProfileIfNeeded = async () => {
      if (user?.id && !user.avatar) {
        try {
          const profileRes = await authService.getProfile();
          if (profileRes.success && profileRes.data) {
            // Update user data in Redux
            dispatch(updateProfile(profileRes.data));
          }
        } catch (error) {
          console.log('Error fetching profile:', error);
        }
      }
    };
    
    fetchProfileIfNeeded();
  }, [user?.id]); // Remove user?.avatar dependency to prevent loop

  useEffect(() => {
    filterResidents();
  }, [searchQuery, residentsWithDetails.length]); // Only depend on searchQuery and residentsWithDetails length

  // Update recent updates when residentsWithDetails changes
  useEffect(() => {
    if (residentsWithDetails.length > 0) {
      console.log('[FamilyResidentScreen] Generating recent updates from residents:', residentsWithDetails.map(r => ({
        name: r.full_name,
        hasVitals: !!r.vitalSigns,
        hasAssessments: r.assessments?.length > 0,
        hasActivities: r.activities?.length > 0
      })));
      
      const updates = getRecentUpdates(residentsWithDetails);
      console.log('[FamilyResidentScreen] Generated updates:', updates);
      setRecentUpdates(updates);
    }
  }, [residentsWithDetails]);
  
  const loadData = async () => {
    try {
      // Fetch residents for this family member
      if (user?.id || user?._id) {
        const familyMemberId = user.id || user._id;
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
          let bedInfo = null;
          try {
            const bedInfoResult = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
            console.log(`[FamilyResidentScreen] Bed info result for resident ${resident._id}:`, bedInfoResult);
            if (bedInfoResult.success && Array.isArray(bedInfoResult.data) && bedInfoResult.data.length > 0) {
              // Lấy bed assignment đầu tiên (mới nhất)
              bedInfo = bedInfoResult.data[0];
              console.log(`[FamilyResidentScreen] Selected bed info for resident ${resident._id}:`, bedInfo);
            }
          } catch (error) {
            console.log('Error loading bed info for resident:', resident._id, error.message);
            bedInfo = null;
          }
          // Lấy chỉ số sinh hiệu gần nhất
          let latestVital = null;
          try {
            const vitalSignsResult = await vitalSignsService.getVitalSignsByResidentId(resident._id);
            if (vitalSignsResult.success && Array.isArray(vitalSignsResult.data) && vitalSignsResult.data.length > 0) {
              latestVital = vitalSignsResult.data.reduce((latest, curr) => {
                return (!latest || new Date(curr.date_time) > new Date(latest.date_time)) ? curr : latest;
              }, null);
            }
          } catch (error) {
            console.log('Error loading vital signs for resident:', resident._id, error.message);
            latestVital = null;
          }
          // Lấy gói dịch vụ
          let carePlanName = 'Chưa có';
          let carePlanCost = '';
          try {
            const carePlanRes = await carePlanAssignmentService.getCarePlanAssignmentsByResidentId(resident._id);
            if (carePlanRes.success && carePlanRes.data && carePlanRes.data.length > 0) {
              // Lấy assignment đầu tiên (mới nhất)
              const assignment = carePlanRes.data[0];
              if (assignment.care_plan_ids && assignment.care_plan_ids.length > 0) {
                // Lấy care plan đầu tiên
                const carePlan = assignment.care_plan_ids[0];
                carePlanName = carePlan.plan_name || 'Chưa có';
                if (carePlan.monthly_price) {
                  carePlanCost = formatCurrency(carePlan.monthly_price) + '/tháng';
                }
              }
            }
          } catch (error) {
            console.log('Error loading care plan for resident:', resident._id, error.message);
            carePlanName = 'Chưa có';
            carePlanCost = '';
          }
          
          // Lấy đánh giá sức khỏe gần nhất
          let assessments = [];
          try {
            const assessmentRes = await assessmentService.getAssessmentsByResidentId(resident._id);
            if (assessmentRes.success && Array.isArray(assessmentRes.data)) {
              assessments = assessmentRes.data
                .sort((a, b) => new Date(b.date || b.created_at) - new Date(a.date || a.created_at))
                .slice(0, 3); // Lấy 3 đánh giá gần nhất
            }
          } catch (error) {
            console.log('Error loading assessments for resident:', resident._id, error.message);
            assessments = [];
          }
          
          // Lấy hoạt động gần nhất
          let activities = [];
          try {
            const activityRes = await activityParticipationService.getParticipationsByResidentId(resident._id);
            if (activityRes.success && Array.isArray(activityRes.data)) {
              activities = activityRes.data
                .sort((a, b) => new Date(b.created_at || b.date) - new Date(a.created_at || a.date))
                .slice(0, 3); // Lấy 3 hoạt động gần nhất
            }
          } catch (error) {
            console.log('Error loading activities for resident:', resident._id, error.message);
            activities = [];
          }
          
          return {
            ...resident,
            bedInfo,
            vitalSigns: latestVital,
            carePlanName,
            carePlanCost,
            assessments,
            activities
          };
        })
      );
      setResidentsWithDetails(residentsWithFullDetails);
    } catch (error) {
      console.error('Error loading resident details:', error);
    }
  };
  
  const loadAdditionalData = async () => {
    // Recent updates will be generated from residentsWithDetails
    // This function is now handled by useEffect that depends on residentsWithDetails
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    // Reset cache to force reload
    setDataLoaded(false);
    setResidentsWithDetails([]);
    setRecentUpdates([]);
    // Trigger Redux reload
    dispatch(triggerResidentDataReload());
    await loadData();
    setDataLoaded(true);
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
    const formattedAmount = new Intl.NumberFormat('vi-VN').format((amount || 0) * 10000);
    return `${formattedAmount} VNĐ`;
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
        <CommonAvatar 
                        source={resident.avatar}
                        size={60}
                        name={resident.full_name}
                        style={styles.residentPhoto}
        />
        <View style={styles.residentInfo}>
          <Text style={styles.residentName}>{resident.full_name || 'Không có tên'}</Text>
          <View style={styles.infoRow}>
            <MaterialIcons name="room" size={14} color={COLORS.primary} />
            <Text style={styles.infoText}>
                {(() => {
                  if (!resident.bedInfo) return 'Chưa phân phòng';
                  
                  const bed = resident.bedInfo.bed_id;
                  if (!bed) return 'Chưa phân phòng';
                  
                  const room = bed.room_id;
                  if (!room) return 'Chưa phân phòng';
                  
                  return `Phòng ${room.room_number} - Giường ${bed.bed_number}`;
                })()}
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
    return (
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
          <Text style={styles.updateSubtitle}>
            {update.resident_name ? `${update.resident_name}: ${update.subtitle}` : update.subtitle}
          </Text>
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
          {recentUpdates.length > 0 ? (
            recentUpdates.map((update, index) => (
              <View key={update.id}>
                {renderRecentUpdateCard({ item: update })}
                {index < recentUpdates.length - 1 && <View style={{ height: 8 }} />}
              </View>
            ))
          ) : (
            <View style={styles.emptyUpdatesContainer}>
              <Text style={styles.emptyUpdatesText}>Chưa có cập nhật gần đây</Text>
            </View>
          )}
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
      {/* FAB: Add resident then continue flow */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => navigation.navigate('FamilyAddResident')}
        style={styles.fab}
      >
        <MaterialIcons name="person-add" size={28} color="#fff" />
      </TouchableOpacity>
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
    paddingTop: 50,
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
    paddingTop: 20,
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
    paddingTop: 36,
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
  emptyUpdatesContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyUpdatesText: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
});

export default FamilyResidentScreen; 