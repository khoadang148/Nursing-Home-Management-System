import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  RefreshControl
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Title, Paragraph, ActivityIndicator, useTheme, Chip } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
// Removed getImageUri and APP_CONFIG - now using CommonAvatar component
import CommonAvatar from '../../components/CommonAvatar';

// Removed DEFAULT_AVATAR and getAvatarUri - now using CommonAvatar component

// Import Redux actions
import { fetchResidentsByFamilyMember, setCurrentResident } from '../../redux/slices/residentSlice';
import { updateProfile } from '../../redux/slices/authSlice';

// Import services
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import visitsService from '../../api/services/visitsService';
import authService from '../../api/services/authService';
import residentPhotosService from '../../api/services/residentPhotosService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import activityService from '../../api/services/activityService';

const FamilyHomeScreen = ({ navigation }) => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const { familyResidents, loading, error } = useSelector((state) => state.residents);
  
  const [refreshing, setRefreshing] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentBedInfo, setResidentBedInfo] = useState(null);
  const [bedInfoLoading, setBedInfoLoading] = useState(false);
  const [upcomingVisits, setUpcomingVisits] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);
  const [upcomingActivities, setUpcomingActivities] = useState([]);
  
  // Hàm chào theo giờ
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào Buổi Sáng';
    if (hour < 17) return 'Chào Buổi Chiều';
    return 'Chào Buổi Tối';
  };

  // Hàm format ngày + giờ cho cập nhật gần đây
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
  
  // Load data only when user changes or on mount
  useEffect(() => {
    console.log('🔄 FamilyHomeScreen useEffect triggered - user?.id:', user?.id);
    if (user?.id) {
      console.log('📡 Loading data for user:', user?.id);
      loadData();
    }
  }, [user?.id, loadData]); // Add loadData to dependencies

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
  
  // Sắp xếp residents theo admission_date tăng dần
  const sortedFamilyResidents = [...familyResidents].sort((a, b) => new Date(a.admission_date) - new Date(b.admission_date));

  // Set selected resident when familyResidents changes
  useEffect(() => {
    if (sortedFamilyResidents.length > 0 && !selectedResident) {
      const firstResident = sortedFamilyResidents[0];
      console.log('🔄 Setting first resident as selected:', firstResident.full_name, 'Avatar:', firstResident.avatar);
      setSelectedResident(firstResident);
      dispatch(setCurrentResident(firstResident));
    }
  }, [familyResidents.length]); // Only depend on familyResidents length

  // Load bed info when selected resident changes
  useEffect(() => {
    if (selectedResident?._id) {
      console.log('🔄 Loading bed info for resident:', selectedResident.full_name, 'ID:', selectedResident._id);
      loadResidentBedInfo(selectedResident._id);
    }
  }, [selectedResident?._id]); // Only depend on selected resident ID
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    if (selectedResident && selectedResident._id) {
      await loadResidentBedInfo(selectedResident._id);
    }
    setRefreshing(false);
  };
  
  const loadData = useCallback(async () => {
    try {
      // Fetch residents for this family member
      if (userData?.id || userData?._id) {
        const familyMemberId = userData.id || userData._id;
        await dispatch(fetchResidentsByFamilyMember(familyMemberId)).unwrap();
      }
      
      // Load other data (visits, updates, activities)
      await loadAdditionalData();
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [userData?.id, userData?._id, dispatch]);
  
  const loadResidentBedInfo = useCallback(async (residentId) => {
    try {
      setBedInfoLoading(true);
      const result = await bedAssignmentService.getBedAssignmentByResidentId(residentId);
      console.log('Bed assignment result:', JSON.stringify(result, null, 2));
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        // Lấy bed assignment đầu tiên (mới nhất)
        const bedAssignment = result.data[0];
        console.log('Selected bed assignment:', JSON.stringify(bedAssignment, null, 2));
        setResidentBedInfo(bedAssignment);
      } else {
        console.log('No bed assignment found for resident:', residentId);
        setResidentBedInfo(null);
      }
    } catch (error) {
      console.error('Error loading resident bed info:', error);
      setResidentBedInfo(null);
    } finally {
      setBedInfoLoading(false);
    }
  }, []);
  
  const loadAdditionalData = async () => {
    // Lấy lịch thăm từ API
    if (userData?.id || userData?._id) {
      try {
        const familyMemberId = userData.id || userData._id;
        const res = await visitsService.getVisitsByFamilyMemberId(familyMemberId);
        if (res.success && Array.isArray(res.data)) {
          const now = new Date();
          // Convert string date/time to Date object for easier handling
          const visitsData = res.data.map(v => ({
            ...v,
            visit_date: v.visit_date ? new Date(v.visit_date) : undefined,
          }));
          // Chỉ lấy các lịch thăm sắp tới (visit_date + visit_time > hiện tại)
          const upcoming = visitsData.filter(v => {
            if (!v.visit_date) return false;
            const [h, m] = (v.visit_time || '00:00').split(':');
            const visitDateTime = typeof v.visit_date === 'string' ? new Date(v.visit_date) : v.visit_date;
            visitDateTime.setHours(Number(h), Number(m), 0, 0);
            return visitDateTime > now;
          });
          // Sắp xếp tăng dần theo thời gian
          upcoming.sort((a, b) => {
            const [ha, ma] = (a.visit_time || '00:00').split(':');
            const [hb, mb] = (b.visit_time || '00:00').split(':');
            const da = typeof a.visit_date === 'string' ? new Date(a.visit_date) : a.visit_date;
            const db = typeof b.visit_date === 'string' ? new Date(b.visit_date) : b.visit_date;
            da.setHours(Number(ha), Number(ma), 0, 0);
            db.setHours(Number(hb), Number(mb), 0, 0);
            return da - db;
          });
          // Giới hạn hiển thị tối đa 5 lịch thăm gần nhất
          setUpcomingVisits(upcoming.slice(0, 5));
        } else {
          setUpcomingVisits([]);
        }
      } catch (e) {
        setUpcomingVisits([]);
      }
    } else {
      setUpcomingVisits([]);
    }
    
    // Load real recent updates data - chỉ trong ngày
    await loadRecentUpdates();
    
    // Load real upcoming activities data
    await loadUpcomingActivities();
  };

  // Load cập nhật gần đây từ API thực (chỉ trong ngày)
  const loadRecentUpdates = async () => {
    try {
      const realUpdates = [];
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
      
      // Lấy danh sách residents của family
      const residentIds = familyResidents.map(r => r._id);
      
      if (residentIds.length > 0) {
        // 1. Kiểm tra chỉ số sinh hiệu trong ngày
        try {
          for (const residentId of residentIds) {
            const vitalsResponse = await vitalSignsService.getVitalSignsByResidentId(residentId);
            if (vitalsResponse.success && Array.isArray(vitalsResponse.data)) {
              const todayVitals = vitalsResponse.data
                .filter(vital => {
                  const recordedAt = new Date(vital.recorded_at || vital.createdAt);
                  return recordedAt >= todayStart && recordedAt <= todayEnd;
                })
                .slice(0, 2);
              
              todayVitals.forEach(vital => {
                const resident = familyResidents.find(r => r._id === residentId);
                realUpdates.push({
                  id: `vital_${vital._id}`,
                  type: 'vital_signs',
                  title: 'Đo chỉ số sinh hiệu',
                  residentName: resident?.full_name || 'Người cao tuổi',
                  residentId: residentId,
                  message: `Huyết áp: ${vital.blood_pressure || 'N/A'}, Nhịp tim: ${vital.heart_rate || 'N/A'} BPM, Nhiệt độ: ${vital.temperature || 'N/A'}°C`,
                  date: vital.recorded_at || vital.createdAt || new Date().toISOString(),
                  time: new Date(vital.recorded_at || vital.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  read: false,
                  staffName: vital.recorded_by?.full_name || 'Y tá'
                });
              });
            }
          }
        } catch (error) {
          console.error('Error fetching vitals for updates:', error);
        }
        
        // 2. Kiểm tra đánh giá sức khỏe trong ngày
        try {
          for (const residentId of residentIds) {
            const assessmentsResponse = await assessmentService.getAssessmentsByResidentId(residentId);
            if (assessmentsResponse.success && Array.isArray(assessmentsResponse.data)) {
              const todayAssessments = assessmentsResponse.data
                .filter(assessment => {
                  const createdAt = new Date(assessment.created_at || assessment.createdAt);
                  return createdAt >= todayStart && createdAt <= todayEnd;
                })
                .slice(0, 2);
              
              todayAssessments.forEach(assessment => {
                const resident = familyResidents.find(r => r._id === residentId);
                realUpdates.push({
                  id: `assessment_${assessment._id}`,
                  type: 'assessment',
                  title: 'Đánh giá sức khỏe',
                  residentName: resident?.full_name || 'Người cao tuổi',
                  residentId: residentId,
                  message: assessment.notes || assessment.general_notes || 'Đã hoàn thành đánh giá tình trạng sức khỏe',
                  date: assessment.created_at || assessment.createdAt || new Date().toISOString(),
                  time: new Date(assessment.created_at || assessment.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  read: false,
                  staffName: assessment.conducted_by?.full_name || 'Bác sĩ'
                });
              });
            }
          }
        } catch (error) {
          console.error('Error fetching assessments for updates:', error);
        }
        
        // 3. Kiểm tra tham gia hoạt động trong ngày
        try {
          for (const residentId of residentIds) {
            const participationsResponse = await activityParticipationService.getParticipationsByResidentId(residentId);
            if (participationsResponse.success && Array.isArray(participationsResponse.data)) {
              const todayParticipations = participationsResponse.data
                .filter(participation => {
                  const createdAt = new Date(participation.created_at || participation.createdAt);
                  return createdAt >= todayStart && createdAt <= todayEnd;
                })
                .slice(0, 2);
              
              todayParticipations.forEach(participation => {
                const resident = familyResidents.find(r => r._id === residentId);
                realUpdates.push({
                  id: `activity_${participation._id}`,
                  type: 'activity',
                  title: 'Tham gia hoạt động',
                  residentName: resident?.full_name || 'Người cao tuổi',
                  residentId: residentId,
                  message: `Tham gia hoạt động: ${participation.activity_id?.activity_name || 'Không rõ'}. Mức độ tham gia: ${participation.participation_level || 'Tích cực'}`,
                  date: participation.created_at || participation.createdAt || new Date().toISOString(),
                  time: new Date(participation.created_at || participation.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
                  read: false,
                  staffName: 'Nhân viên chăm sóc'
                });
              });
            }
          }
        } catch (error) {
          console.error('Error fetching activity participations for updates:', error);
        }
      }
      
      // Sắp xếp theo thời gian mới nhất
      realUpdates.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setLatestUpdates(realUpdates.slice(0, 5)); // Chỉ lấy 5 cập nhật gần nhất
    } catch (error) {
      console.error('Error loading recent updates:', error);
      setLatestUpdates([]);
    }
  };

  // Load hoạt động sắp tới từ API thực
  const loadUpcomingActivities = async () => {
    try {
      const realActivities = [];
      const now = new Date();
      
      // Lấy danh sách residents của family
      const residentIds = familyResidents.map(r => r._id);
      
      if (residentIds.length > 0) {
        // Lấy hoạt động sắp tới từ activity participations
        try {
          for (const residentId of residentIds) {
            const participationsResponse = await activityParticipationService.getParticipationsByResidentId(residentId);
            if (participationsResponse.success && Array.isArray(participationsResponse.data)) {
              // Lọc các hoạt động sắp tới (chưa diễn ra)
              const upcomingParticipations = participationsResponse.data
                .filter(participation => {
                  if (!participation.activity_id?.date || !participation.activity_id?.time) return false;
                  
                  const activityDate = new Date(participation.activity_id.date);
                  const [hours, minutes] = participation.activity_id.time.split(':');
                  activityDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                  
                  return activityDate > now;
                })
                .slice(0, 5);
              
              upcomingParticipations.forEach(participation => {
                const resident = familyResidents.find(r => r._id === residentId);
                const activity = participation.activity_id;
                
                realActivities.push({
                  id: `upcoming_${participation._id}`,
                  title: activity.activity_name || 'Hoạt động',
                  residentName: resident?.full_name || 'Người cao tuổi',
                  date: activity.date,
                  time: activity.time,
                  location: activity.location || 'Chưa xác định',
                  residentId: residentId
                });
              });
            }
          }
        } catch (error) {
          console.error('Error fetching upcoming activities:', error);
        }
      }
      
      // Sắp xếp theo thời gian gần nhất
      realActivities.sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA - dateB;
      });
      
      setUpcomingActivities(realActivities.slice(0, 5)); // Chỉ lấy 5 hoạt động sắp tới
    } catch (error) {
      console.error('Error loading upcoming activities:', error);
      setUpcomingActivities([]);
    }
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

  // Handle when user taps on an update item
  const handleUpdatePress = (update) => {
    // Navigate to resident detail screen
    if (update.residentId) {
      navigation.navigate('FamilyResidentDetail', {
        residentId: update.residentId,
        residentName: update.residentName,
        initialTab: update.type === 'vital_signs' ? 'vitals' : 
                   update.type === 'assessment' ? 'assessments' : 
                   update.type === 'activity' ? 'activities' : 'overview'
      });
    }
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <CommonAvatar 
              key={`user-${userData.id || userData._id}-${userData.avatar}`}
              source={userData.avatar}
              size={48}
              name={userData.full_name}
              style={styles.avatar}
            />
          </TouchableOpacity>
        </View>
        
        {/* Resident Selection & Info Section */}
        {sortedFamilyResidents.length > 0 ? (
          <Card style={styles.residentSectionCard} mode="elevated">
            <Card.Content>
              <Title style={styles.sectionTitle}>Thông Tin Người Thân</Title>
              
              {/* Resident Selection Chips (if multiple residents) */}
              {sortedFamilyResidents.length > 1 && (
                <View style={styles.residentChipsContainer}>
                  <Text style={styles.chipLabel}>Chọn người thân:</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScrollView}>
                    {sortedFamilyResidents.map((resident) => (
                      <Chip
                        key={resident._id}
                        mode={selectedResident?._id === resident._id ? 'flat' : 'outlined'}
                        selected={selectedResident?._id === resident._id}
                        onPress={() => {
                          console.log('🔄 Selecting resident:', resident.full_name, 'Avatar:', resident.avatar);
                          setSelectedResident(resident);
                        }}
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
              <CommonAvatar 
                      key={`resident-${selectedResident._id}-${selectedResident.avatar}`}
                      source={selectedResident.avatar}
                      size={80}
                      name={selectedResident.full_name}
                      style={styles.residentPhoto}
              />
              <View style={styles.residentInfo}>
                      <Text style={styles.residentName}>
                        {selectedResident.full_name || 'Không có tên'}
                      </Text>
                      <View style={styles.residentDetailRow}>
                        <MaterialIcons name="room" size={16} color={COLORS.textSecondary} />
                        {bedInfoLoading ? (
                          <View style={styles.loadingContainer}>
                            <ActivityIndicator size="small" color={COLORS.primary} />
                            <Text style={[styles.residentDetails, { marginLeft: 8 }]}>Đang tải...</Text>
                      </View>
                        ) : (
                          <Text style={styles.residentDetails}>
                            {(() => {
                              if (!residentBedInfo) return 'Chưa phân công phòng';
                              
                              const bed = residentBedInfo.bed_id;
                              if (!bed) return 'Chưa phân công phòng';
                              
                              const room = bed.room_id;
                              if (!room) return 'Chưa phân công phòng';
                              
                              return `Phòng ${room.room_number} - Giường ${bed.bed_number}`;
                            })()}
                          </Text>
                        )}
                      </View>
                      {selectedResident.admission_date && (
                      <View style={styles.residentDetailRow}>
                          <MaterialIcons name="event" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.residentDetails}>
                            Ngày vào viện: {(() => {
                  const date = new Date(selectedResident.admission_date);
                  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
                  return vietnamTime.toLocaleDateString('vi-VN');
                })()}
                        </Text>
                      </View>
                      )}
                      <View style={styles.residentDetailRow}>
                        <MaterialIcons name="cake" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.residentDetails}>
                          Sinh ngày: {selectedResident.date_of_birth ? (() => {
                  const date = new Date(selectedResident.date_of_birth);
                  const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
                  return vietnamTime.toLocaleDateString('vi-VN');
                })() : 'Chưa có thông tin'} - {selectedResident.age || residentService.calculateAge(selectedResident.date_of_birth) || 75} tuổi
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
              <Text style={styles.quickActionText}>Gói Dịch Vụ Và Phòng</Text>
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
            
            <View style={styles.quickActionButton}>
              {/* Empty space to maintain 3-column layout */}
            </View>
          </View>
        </View>
        
        {/* Upcoming Visits */}
        {upcomingVisits.length > 0 ? (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons name="event" size={24} color={COLORS.primary} />
                <Title style={styles.cardTitle}>Lịch Thăm Sắp Tới</Title>
              </View>
              {upcomingVisits.map((visit) => (
                <View key={visit._id} style={styles.visitInfo}>
                <View style={styles.visitDetail}>
                  <Text style={styles.visitLabel}>Ngày:</Text>
                    <Text style={styles.visitValue}>{(() => {
                      const dateObj = typeof visit.visit_date === 'string' ? new Date(visit.visit_date) : visit.visit_date;
                      return dateObj ? (() => {
                      const vietnamTime = new Date(dateObj.getTime() + (7 * 60 * 60 * 1000));
                      return vietnamTime.toLocaleDateString('vi-VN');
                    })() : 'Không rõ';
                    })()}</Text>
                </View>
                <View style={styles.visitDetail}>
                  <Text style={styles.visitLabel}>Giờ:</Text>
                  <Text style={styles.visitValue}>{visit.visit_time || 'Không rõ'}</Text>
                </View>
                  <View style={styles.visitDetail}>
                    <Text style={styles.visitLabel}>Mục đích:</Text>
                    <Text style={styles.visitValue}>{visit.purpose || 'Chưa có'}</Text>
              </View>
                  {visit.notes && (
                    <View style={styles.visitDetail}>
                      <Text style={styles.visitLabel}>Ghi chú:</Text>
                      <Text style={styles.visitValue}>{visit.notes}</Text>
                    </View>
                  )}
                  <View style={{height: 1, backgroundColor: '#e9ecef', marginVertical: 8}} />
                </View>
              ))}
              <TouchableOpacity 
                style={styles.cardButton}
                onPress={() => navigation.navigate('LichTham')}
              >
                <Text style={styles.cardButtonText}>Quản Lý Lịch Thăm</Text>
              </TouchableOpacity>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.card} mode="elevated">
            <Card.Content>
              <View style={styles.cardHeader}>
                <MaterialIcons name="event" size={24} color={COLORS.primary} />
                <Title style={styles.cardTitle}>Lịch Thăm Sắp Tới</Title>
              </View>
              <View style={styles.noActivitiesContainer}>
                <MaterialIcons name="event-available" size={48} color={COLORS.textSecondary} />
                <Text style={styles.noActivitiesText}>Không có lịch thăm sắp tới</Text>
              </View>
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
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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