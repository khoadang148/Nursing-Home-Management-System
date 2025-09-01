import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView as RNScrollView,
  RefreshControl,
  Modal,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Button, Chip, Divider, Menu, Appbar } from 'react-native-paper';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Import services
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import residentPhotosService from '../../api/services/residentPhotosService';
import assessmentService from '../../api/services/assessmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';
import carePlanService from '../../api/services/carePlanService';
import roomService from '../../api/services/roomService';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';
import { getAvatarUri, getImageUriHelper } from '../../utils/avatarUtils';
import CommonAvatar from '../../components/CommonAvatar';

const DEFAULT_AVATAR = APP_CONFIG.DEFAULT_AVATAR;

// Fallback nếu API_BASE_URL bị undefined
const DEFAULT_API_BASE_URL = 'http://192.168.1.15:8000';
const getApiBaseUrl = () => {
  return DEFAULT_API_BASE_URL;
};






// Định nghĩa hàm capitalizeWords (nên đặt gần đầu file hoặc ngay trên component)
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Hàm capitalizeFirst cho từng bệnh lý
const capitalizeFirst = (str) => str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const ResidentDetailScreen = ({ route, navigation }) => {
  const { residentId, initialTab = 'overview' } = route.params;
  const [resident, setResident] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous calls
  const [carePlanAssignments, setCarePlanAssignments] = useState([]);
  // Tab mới: overview, activity, meds, vitals, images, assessment
  const [activeTab, setActiveTab] = useState(initialTab);
  // Filters for Vitals and Assessments
  const [vitalsFilterMode, setVitalsFilterMode] = useState('all'); // all | day | month | year
  const [vitalsPeriod, setVitalsPeriod] = useState(new Date());
  const [assessmentFilterMode, setAssessmentFilterMode] = useState('all'); // all | day | month | year
  const [assessmentPeriod, setAssessmentPeriod] = useState(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerTarget, setDatePickerTarget] = useState('vitals'); // 'vitals' | 'assessment'
  const [dateInputDay, setDateInputDay] = useState('');
  const [dateInputMonth, setDateInputMonth] = useState('');
  const [dateInputYear, setDateInputYear] = useState('');
  // Image viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerUri, setImageViewerUri] = useState('');
  const [imageViewerIndex, setImageViewerIndex] = useState(0);
  const [imageViewerPhotos, setImageViewerPhotos] = useState([]);
  
  // Bed assignment modal states
  const [bedAssignmentModalVisible, setBedAssignmentModalVisible] = useState(false);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [selectedBed, setSelectedBed] = useState(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  
  const fetchData = useCallback(async (isRefreshing = false) => {
    console.log('🔄 fetchData called - isRefreshing:', isRefreshing, 'residentId:', residentId);
    
    // Prevent multiple simultaneous API calls
    if (isFetching && !isRefreshing) {
      console.log('Already fetching data, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      if (!isRefreshing) {
        setLoading(true);
      }
      
      // Fetch resident data
      const residentResponse = await residentService.getResidentById(residentId);
      if (residentResponse.success) {
        setResident(residentResponse.data);
      } else {
        throw new Error('Failed to fetch resident data');
      }

      // Fetch bed assignment info
      const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(residentId);
      if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
        setResident(prev => ({ ...prev, bed_info: bedResponse.data[0] }));
      }

      // Fetch activity participations
      const activityResponse = await activityParticipationService.getParticipationsByResidentId(residentId);
      if (activityResponse.success) {
        setResident(prev => ({ ...prev, activity_participations: activityResponse.data }));
      }

      // Fetch photos
      const photoResponse = await residentPhotosService.getResidentPhotosByResidentId(residentId);
      if (photoResponse.success) {
        setResident(prev => ({ ...prev, resident_photos: photoResponse.data }));
      }

      // Fetch assessments
      console.log('🔄 Fetching assessments for resident:', residentId);
      const assessmentResponse = await assessmentService.getAssessmentsByResidentId(residentId);
      console.log('📊 Assessment response:', assessmentResponse);
      if (assessmentResponse.success) {
        console.log('✅ Assessments fetched successfully:', assessmentResponse.data);
        console.log('📋 Assessments count:', assessmentResponse.data?.length || 0);
        setResident(prev => ({ ...prev, assessments: assessmentResponse.data }));
      } else {
        console.log('❌ Failed to fetch assessments:', assessmentResponse.error);
      }

      // Fetch vital signs
      const vitalResponse = await vitalSignsService.getVitalSignsByResidentId(residentId);
      if (vitalResponse.success) {
        setResident(prev => ({ ...prev, vital_signs: vitalResponse.data }));
      }

      // Fetch care plan assignments
      const carePlanResponse = await carePlanAssignmentService.getCarePlanAssignmentsByResidentId(residentId);
      if (carePlanResponse.success) {
        setCarePlanAssignments(carePlanResponse.data);
      }

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu cư dân. Vui lòng thử lại sau.');
      console.error('Error fetching resident data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setIsFetching(false);
    }
  }, [residentId]);

  // Handle pull-to-refresh
  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await fetchData(true);
    } catch (error) {
      console.error('Error during refresh:', error);
      Alert.alert('Lỗi', 'Không thể làm mới dữ liệu. Vui lòng thử lại.');
    } finally {
      setRefreshing(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, [residentId]);

  // Reload data when screen comes into focus (e.g., returning from edit screens)
  useFocusEffect(
    useCallback(() => {
      if (resident && !loading && !isFetching) {
        console.log('Screen focused, reloading resident data...');
        fetchData();
      }
    }, [residentId, fetchData])
  );

  // Load room types for display
  const loadRoomTypes = useCallback(async () => {
    try {
      console.log('DEBUG - Loading room types...');
      const response = await carePlanService.getRoomTypes();
      console.log('DEBUG - Room types response:', response);
      
      if (response && Array.isArray(response)) {
        setRoomTypes(response);
        console.log('DEBUG - Room types loaded successfully:', response.length);
        console.log('DEBUG - Room types data:', response.map(rt => ({
          room_type: rt.room_type,
          type_name: rt.type_name,
          monthly_price: rt.monthly_price
        })));
      } else {
        console.log('DEBUG - Room types response is not an array:', response);
        setRoomTypes([]);
      }
    } catch (error) {
      console.error('Error loading room types:', error);
      setRoomTypes([]);
    }
  }, []);

  // Add callback for edit screens to trigger reload
  const handleEditCallback = useCallback(() => {
    console.log('Edit callback triggered, reloading data...');
    fetchData();
  }, [fetchData]);

  // Update active tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Load room types when component mounts
  useEffect(() => {
    loadRoomTypes();
  }, [loadRoomTypes]);

  // ===== Helpers for date filtering =====
  const toDate = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  };

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const isSameMonth = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  const isSameYear = (a, b) => a.getFullYear() === b.getFullYear();

  const adjustPeriod = (date, mode, delta) => {
    const d = new Date(date);
    if (mode === 'day') {
      d.setDate(d.getDate() + delta);
    } else if (mode === 'month') {
      d.setMonth(d.getMonth() + delta);
    } else if (mode === 'year') {
      d.setFullYear(d.getFullYear() + delta);
    }
    return d;
  };

  const getPeriodLabel = (date, mode) => {
    if (mode === 'day') {
      return new Date(date).toLocaleDateString('vi-VN');
    }
    if (mode === 'month') {
      const d = new Date(date);
      return `Tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
    }
    if (mode === 'year') {
      return `${new Date(date).getFullYear()}`;
    }
    return 'Tất cả';
  };

  // ===== Format date/time exactly as stored (avoid timezone shift) =====
  const pad2 = (n) => (n < 10 ? `0${n}` : String(n));
  const formatDateFromDB = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/A';
    // Use UTC parts to avoid client TZ shifting
    return `${pad2(d.getUTCDate())}/${pad2(d.getUTCMonth() + 1)}/${d.getUTCFullYear()}`;
  };
  const formatTimeFromDB = (value) => {
    if (!value) return 'N/A';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'N/A';
    return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}`;
  };

  const openDatePicker = (target) => {
    setDatePickerTarget(target);
    const base = target === 'vitals' ? vitalsPeriod : assessmentPeriod;
    setDateInputDay(String(base.getDate()));
    setDateInputMonth(String(base.getMonth() + 1));
    setDateInputYear(String(base.getFullYear()));
    setDatePickerVisible(true);
  };

  const applyDatePicker = () => {
    const d = parseInt(dateInputDay || '1', 10);
    const m = parseInt(dateInputMonth || '1', 10) - 1;
    const y = parseInt(dateInputYear || '1970', 10);
    const candidate = new Date(y, m, d);
    if (isNaN(candidate.getTime())) {
      Alert.alert('Ngày không hợp lệ', 'Vui lòng nhập ngày/tháng/năm hợp lệ.');
      return;
    }
    if (datePickerTarget === 'vitals') {
      setVitalsPeriod(candidate);
      setVitalsFilterMode('day');
    } else {
      setAssessmentPeriod(candidate);
      setAssessmentFilterMode('day');
    }
    setDatePickerVisible(false);
  };

  // ===== Filtered data =====
  const filteredVitals = React.useMemo(() => {
    const list = resident?.vital_signs || [];
    if (vitalsFilterMode === 'all') {
      return [...list].sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
    }
    const period = vitalsPeriod;
    return list
      .filter((v) => {
        const d = toDate(v.date_time);
        if (!d) return false;
        if (vitalsFilterMode === 'day') return isSameDay(d, period);
        if (vitalsFilterMode === 'month') return isSameMonth(d, period);
        if (vitalsFilterMode === 'year') return isSameYear(d, period);
        return true;
      })
      .sort((a, b) => new Date(b.date_time) - new Date(a.date_time));
  }, [resident?.vital_signs, vitalsFilterMode, vitalsPeriod]);

  const filteredAssessments = React.useMemo(() => {
    const list = resident?.assessments || [];
    if (assessmentFilterMode === 'all') {
      return [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    }
    const period = assessmentPeriod;
    return list
      .filter((as) => {
        const d = toDate(as.date);
        if (!d) return false;
        if (assessmentFilterMode === 'day') return isSameDay(d, period);
        if (assessmentFilterMode === 'month') return isSameMonth(d, period);
        if (assessmentFilterMode === 'year') return isSameYear(d, period);
        return true;
      })
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [resident?.assessments, assessmentFilterMode, assessmentPeriod]);

  if (loading || !resident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin cư dân...</Text>
      </View>
    );
  }

  // For now, we'll show empty lists since the IDs don't match between residents and medications/vitals
  // In a real app, this would be properly linked
  const residentCarePlans = [];
  const residentMedications = [];
  const residentVitals = [];

  // Tìm assignment active của resident
  const activeAssignment = resident.bed_info;
  const mainCarePlan = activeAssignment?.main_care_plan;
  const supplementaryPlans = activeAssignment?.supplementary_plans || [];

  const handleRegisterCarePlan = () => {
    navigation.navigate('CarePlanSelection', { residentId: resident._id, residentName: resident.full_name });
  };

  const handleDeleteAssessment = async (assessmentId, assessmentType) => {
    Alert.alert(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa đánh giá "${assessmentType || 'này'}" không?\n\nHành động này không thể hoàn tác.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await assessmentService.deleteAssessment(assessmentId);
              if (response.success) {
                Alert.alert('Thành công', 'Đánh giá đã được xóa thành công.');
                fetchData(); // Reload data after deletion
              } else {
                Alert.alert('Lỗi', response.error || 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
                console.error('Error deleting assessment:', response.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa đánh giá. Vui lòng thử lại sau.');
              console.error('Error deleting assessment:', error);
            }
          },
        },
      ],
    );
  };

  const handleDeleteVitals = async (vitalId) => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc chắn muốn xóa dấu hiệu sinh tồn này không?\n\nHành động này không thể hoàn tác.',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await vitalSignsService.deleteVitalSign(vitalId);
              if (response.success) {
                Alert.alert('Thành công', 'Dấu hiệu sinh tồn đã được xóa thành công.');
                fetchData(); // Reload data after deletion
              } else {
                Alert.alert('Lỗi', response.error || 'Không thể xóa dấu hiệu sinh tồn. Vui lòng thử lại sau.');
                console.error('Error deleting vital signs:', response.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa dấu hiệu sinh tồn. Vui lòng thử lại sau.');
              console.error('Error deleting vital signs:', error);
            }
          },
        },
      ],
    );
  };

  // Bed assignment functions
  const openBedAssignmentModal = async () => {
    setBedAssignmentModalVisible(true);
    setSelectedRoom(null);
    setSelectedBed(null);
    setAvailableBeds([]);
    await Promise.all([loadRoomTypes(), loadAvailableRooms()]);
  };

  const loadAvailableRooms = async () => {
    setLoadingRooms(true);
    try {
      // Kiểm tra xem resident có gói dịch vụ còn hạn không
      const now = new Date();
      let activeCarePlanAssignment = null;
      
      if (carePlanAssignments && carePlanAssignments.length > 0) {
        activeCarePlanAssignment = carePlanAssignments.find(assignment => {
          const startDate = new Date(assignment.start_date);
          const endDate = new Date(assignment.end_date);
          return assignment.status === 'active' && now >= startDate && now <= endDate;
        });
      }
      
      if (!activeCarePlanAssignment) {
        console.log('DEBUG - No active care plan assignment found');
        Alert.alert('Lỗi', 'Cư dân này không có gói dịch vụ còn hạn. Vui lòng đăng ký gói dịch vụ trước.');
        setAvailableRooms([]);
        return;
      }
      
      // Lấy main care plan ID (không phải plan_type)
      let mainCarePlanId = null;
      if (activeCarePlanAssignment.care_plan_ids && activeCarePlanAssignment.care_plan_ids.length > 0) {
        mainCarePlanId = activeCarePlanAssignment.care_plan_ids[0]._id;
        console.log('DEBUG - Found active care plan ID:', mainCarePlanId);
      }
      
      if (!mainCarePlanId) {
        console.log('DEBUG - No main care plan ID found');
        Alert.alert('Lỗi', 'Không tìm thấy thông tin gói dịch vụ chính.');
        setAvailableRooms([]);
        return;
      }
      
      console.log('DEBUG - Care plan assignments:', carePlanAssignments);
      console.log('DEBUG - Active care plan assignment:', activeCarePlanAssignment);
      console.log('DEBUG - Main care plan ID:', mainCarePlanId);

      // Kiểm tra xem resident đã có phòng giường chưa
      const hasCurrentBedAssignment = resident.bed_info && 
        resident.bed_info.bed_id && 
        resident.bed_info.bed_id.room_id && 
        !resident.bed_info.unassigned_date;
      
      let currentRoomType = null;
      if (hasCurrentBedAssignment) {
        currentRoomType = resident.bed_info.bed_id.room_id.room_type;
        console.log('DEBUG - Resident has current bed assignment, room type:', currentRoomType);
      } else {
        console.log('DEBUG - Resident has no current bed assignment');
      }

      // Lấy phòng trống phù hợp với giới tính và gói dịch vụ
      const params = {
        gender: resident.gender,
        main_care_plan_id: mainCarePlanId,
        status: 'available'
      };

      // Nếu resident đang có phòng, chỉ hiển thị phòng cùng loại để đổi
      if (hasCurrentBedAssignment && currentRoomType) {
        params.room_type = currentRoomType;
        console.log('DEBUG - Filtering by current room type for room change:', currentRoomType);
      } else {
        console.log('DEBUG - Showing all available room types for new assignment');
      }

      console.log('DEBUG - Loading rooms with params:', params);

      // Sử dụng carePlanService.getRoomsByFilter như CarePlanSelectionScreen
      const response = await carePlanService.getRoomsByFilter(params);
      console.log('DEBUG - Care plan service response:', response);
      
      if (response && Array.isArray(response)) {
        setAvailableRooms(response);
        console.log('DEBUG - Available rooms set:', response.length);
      } else {
        console.error('Failed to load available rooms:', response);
        setAvailableRooms([]);
        Alert.alert('Lỗi', 'Không thể tải danh sách phòng trống');
      }
    } catch (error) {
      console.error('Error loading available rooms:', error);
      setAvailableRooms([]);
      Alert.alert('Lỗi', 'Không thể tải danh sách phòng trống');
    } finally {
      setLoadingRooms(false);
    }
  };

  const handleRoomSelection = async (room) => {
    setSelectedRoom(room);
    setSelectedBed(null);
    await loadAvailableBeds(room._id);
  };

  const loadAvailableBeds = async (roomId) => {
    setLoadingBeds(true);
    try {
      console.log('DEBUG - Loading beds for room:', roomId);
      
      // Sử dụng carePlanService.getAvailableBedsByRoom như CarePlanSelectionScreen
      const response = await carePlanService.getAvailableBedsByRoom(roomId);
      console.log('DEBUG - Beds service response:', response);
      
      if (response && Array.isArray(response)) {
        setAvailableBeds(response);
        console.log('DEBUG - Available beds set:', response.length);
      } else {
        console.error('Failed to load available beds:', response);
        setAvailableBeds([]);
      }
    } catch (error) {
      console.error('Error loading available beds:', error);
      setAvailableBeds([]);
    } finally {
      setLoadingBeds(false);
    }
  };

  const handleBedSelection = (bed) => {
    setSelectedBed(bed);
  };

  const handleAssignBed = async () => {
    if (!selectedRoom || !selectedBed) {
      Alert.alert('Lỗi', 'Vui lòng chọn phòng và giường');
      return;
    }

    setIsAssigning(true);
    try {
      // Nếu cư dân đã có giường, hủy phân công cũ trước
      if (resident.bed_info) {
        const unassignResponse = await bedAssignmentService.unassignBed(resident.bed_info._id);
        if (!unassignResponse.success) {
          Alert.alert('Lỗi', 'Không thể hủy phân công giường cũ');
          return;
        }
      }

      // Tạo phân công giường mới
      const assignmentData = {
        resident_id: resident._id,
        bed_id: selectedBed._id,
        assigned_date: new Date().toISOString(),
        assigned_by: 'staff', // Sẽ cập nhật sau khi có user context
        notes: 'Phân công giường mới'
      };

      const response = await bedAssignmentService.createBedAssignment(assignmentData);
      if (response.success) {
        Alert.alert('Thành công', 'Đã phân công giường thành công');
        setBedAssignmentModalVisible(false);
        fetchData(); // Reload data
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể phân công giường');
      }
    } catch (error) {
      console.error('Error assigning bed:', error);
      Alert.alert('Lỗi', 'Không thể phân công giường');
    } finally {
      setIsAssigning(false);
    }
  };

  const renderOverviewTab = () => {
    // Debug logs để kiểm tra dữ liệu
    console.log('DEBUG - renderOverviewTab - roomTypes:', roomTypes?.length || 0);
    console.log('DEBUG - renderOverviewTab - resident.bed_info:', resident.bed_info);
    
    // Kiểm tra xem thông tin người thân và liên hệ khẩn cấp có giống nhau không
    const isEmergencyContactSameAsFamily = 
      resident.family_member_id && 
      resident.emergency_contact &&
      resident.family_member_id.full_name === resident.emergency_contact.name &&
      resident.family_member_id.phone === resident.emergency_contact.phone;

    return (
      <View>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông Tin Cơ Bản</Text>
        <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{resident.full_name}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>
              {resident.gender === 'male' ? 'Nam' : resident.gender === 'female' ? 'Nữ' : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày nhập viện:</Text>
            <Text style={styles.infoValue}>
              {resident.admission_date ? new Date(resident.admission_date).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                
                console.log('DEBUG - Room info check:', {
                  hasCurrentBedAssignment,
                  roomNumber: hasCurrentBedAssignment ? resident.bed_info.bed_id.room_id.room_number : null,
                  roomType: hasCurrentBedAssignment ? resident.bed_info.bed_id.room_id.room_type : null
                });
                
                if (hasCurrentBedAssignment) {
                  return `Phòng ${resident.bed_info.bed_id.room_id.room_number}`;
                } else {
                  return 'Chưa phân công';
                }
              })()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Loại phòng:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                
                if (hasCurrentBedAssignment && resident.bed_info.bed_id.room_id.room_type) {
                  console.log('DEBUG - Looking for room type:', resident.bed_info.bed_id.room_id.room_type);
                  console.log('DEBUG - Available room types:', roomTypes.map(rt => rt.room_type));
                  
                  const roomTypeObj = roomTypes.find(rt => rt.room_type === resident.bed_info.bed_id.room_id.room_type);
                  if (roomTypeObj) {
                    console.log('DEBUG - Room type found:', roomTypeObj);
                    return roomTypeObj.type_name;
                  } else {
                    console.log('DEBUG - Room type not found for:', resident.bed_info.bed_id.room_id.room_type);
                    return resident.bed_info.bed_id.room_id.room_type;
                  }
                } else {
                  return 'Chưa phân công';
                }
              })()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giường:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                
                if (hasCurrentBedAssignment && resident.bed_info.bed_id.bed_number) {
                  return `Giường ${resident.bed_info.bed_id.bed_number}`;
                } else {
                  return 'Chưa phân công';
                }
              })()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giá phòng:</Text>
            <Text style={styles.infoValue}>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                
                if (hasCurrentBedAssignment && resident.bed_info.bed_id.room_id.room_type) {
                  const roomTypeObj = roomTypes.find(rt => rt.room_type === resident.bed_info.bed_id.room_id.room_type);
                  if (roomTypeObj && roomTypeObj.monthly_price) {
                    console.log('DEBUG - Room type found:', roomTypeObj.type_name, 'Price:', roomTypeObj.monthly_price);
                    return `${new Intl.NumberFormat('vi-VN').format(roomTypeObj.monthly_price * 10000)}/tháng`;
                  } else {
                    console.log('DEBUG - Room type found but no price:', roomTypeObj?.type_name);
                    return 'Giá liên hệ';
                  }
                } else {
                  return 'Chưa phân công';
                }
              })()}
            </Text>
          </View>
          
          {/* Bed Assignment Button */}
          <View style={styles.bedAssignmentContainer}>
            {(() => {
              const hasCurrentBedAssignment = resident.bed_info && 
                resident.bed_info.bed_id && 
                resident.bed_info.bed_id.room_id && 
                !resident.bed_info.unassigned_date;
              
              return hasCurrentBedAssignment ? (
                <Button
                  mode="outlined"
                  icon="swap-horizontal"
                  onPress={openBedAssignmentModal}
                  style={styles.bedAssignmentButton}
                  labelStyle={styles.bedAssignmentButtonText}
                >
                  Đổi Giường
                </Button>
              ) : (
                <Button
                  mode="contained"
                  icon="bed"
                  onPress={openBedAssignmentModal}
                  style={styles.bedAssignmentButton}
                  labelStyle={styles.bedAssignmentButtonText}
                >
                  Phân Bổ Phòng Giường
                </Button>
              );
            })()}
          </View>
        </Surface>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tiền Sử Bệnh</Text>
        <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
          <Text style={styles.medicalHistoryText}>
            {resident.medical_history || 'Chưa có thông tin tiền sử bệnh'}
          </Text>
        </Surface>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Gói Dịch Vụ Chăm Sóc</Text>
        <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
          {carePlanAssignments && carePlanAssignments.length > 0 ? (
            carePlanAssignments.map((assignment, index) => (
              <View key={assignment._id || index} style={styles.carePlanItem}>
                <View style={styles.carePlanHeader}>
                  <Text style={styles.carePlanName}>
                    {assignment.care_plan_ids?.[0]?.plan_name || 'Gói chăm sóc'}
                  </Text>
                  <Chip
                    style={[
                      styles.statusChip,
                      {
                        backgroundColor: assignment.status === 'active' ? COLORS.success + '20' : COLORS.warning + '20',
                      },
                    ]}
                    textStyle={{
                      color: assignment.status === 'active' ? COLORS.success : COLORS.warning,
                    }}
                  >
                    {assignment.status === 'active' ? 'Đang hoạt động' : 'Đã kết thúc'}
                  </Chip>
                </View>
                
                <View style={styles.carePlanDetails}>
                  <View style={styles.carePlanDetail}>
                    <Text style={styles.carePlanLabel}>Ngày bắt đầu:</Text>
                    <Text style={styles.carePlanValue}>
                      {assignment.start_date ? new Date(assignment.start_date).toLocaleDateString('vi-VN') : 'N/A'}
                    </Text>
                  </View>
                  
                  <View style={styles.carePlanDetail}>
                    <Text style={styles.carePlanLabel}>Ngày kết thúc:</Text>
                    <Text style={styles.carePlanValue}>
                      {assignment.end_date ? new Date(assignment.end_date).toLocaleDateString('vi-VN') : 'Chưa có'}
                    </Text>
                  </View>
                  
                  <View style={styles.carePlanDetail}>
                    <Text style={styles.carePlanLabel}>Chi phí:</Text>
                    <Text style={styles.carePlanValue}>
                      {assignment.care_plan_ids?.[0]?.monthly_price 
                        ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(assignment.care_plan_ids[0].monthly_price) + '/tháng'
                        : 'N/A'
                      }
                    </Text>
                  </View>
                  
                  {assignment.notes && (
                    <View style={styles.carePlanDetail}>
                      <Text style={styles.carePlanLabel}>Ghi chú:</Text>
                      <Text style={styles.carePlanValue}>{assignment.notes}</Text>
                    </View>
                  )}
                </View>
                
                {index < carePlanAssignments.length - 1 && <Divider style={styles.carePlanDivider} />}
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>Chưa có gói dịch vụ chăm sóc nào</Text>
          )}
        </Surface>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Dị Ứng</Text>
        <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
          {resident.allergies && resident.allergies.length > 0 ? (
            <View style={styles.allergiesContainer}>
              {resident.allergies.map((allergy, index) => (
                <Chip key={index} style={styles.allergyChip} textStyle={styles.allergyText}>
                  {allergy}
                </Chip>
              ))}
            </View>
          ) : (
            <Text style={styles.noDataText}>Không có dị ứng nào được ghi nhận</Text>
          )}
        </Surface>
      </View>

      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông Tin Người Thân</Text>
        <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
          {resident.family_member_id ? (
            <View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Họ và tên:</Text>
                <Text style={styles.infoValue}>{resident.family_member_id.full_name || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Email:</Text>
                <Text style={styles.infoValue}>{resident.family_member_id.email || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số điện thoại:</Text>
                <Text style={styles.infoValue}>{resident.family_member_id.phone || 'N/A'}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mối quan hệ với người cao tuổi:</Text>
                <Text style={styles.infoValue}>{resident.relationship ? capitalizeFirst(resident.relationship) : 'N/A'}</Text>
              </View>
              {isEmergencyContactSameAsFamily && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Liên hệ khẩn cấp:</Text>
                  <Text style={styles.infoValue}>Cùng người thân</Text>
                </View>
              )}
            </View>
          ) : (
            <Text style={styles.noDataText}>Chưa có thông tin người thân</Text>
          )}
        </Surface>
      </View>

      {!isEmergencyContactSameAsFamily && (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
          <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
            {resident.emergency_contact ? (
              <View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Họ và tên:</Text>
                  <Text style={styles.infoValue}>{resident.emergency_contact.name || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Số điện thoại:</Text>
                  <Text style={styles.infoValue}>{resident.emergency_contact.phone || 'N/A'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Mối quan hệ với người cao tuổi:</Text>
                  <Text style={styles.infoValue}>{resident.emergency_contact.relationship ? capitalizeFirst(resident.emergency_contact.relationship) : 'N/A'}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>Chưa có thông tin liên hệ khẩn cấp</Text>
            )}
          </Surface>
        </View>
      )}
    </View>
    );
  };

  // Tab Hoạt Động
  const renderActivityTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hoạt Động Đã Tham Gia</Text>
        {resident.activity_participations && resident.activity_participations.length > 0 ? (
          resident.activity_participations.map(act => (
            <Surface key={act._id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <Text style={styles.activityName}>{act.activity_id?.activity_name || 'Không có tên'}</Text>
              <Text style={styles.activityDate}>Ngày: {act.date ? new Date(act.date).toLocaleDateString('vi-VN') : 'N/A'}</Text>
              <Text style={styles.activityStatus}>Trạng thái: {act.attendance_status === 'attended' ? 'Đã tham gia' : 'Chưa tham gia'}</Text>
              {act.performance_notes && (
                <Text style={styles.activityNotes}>Ghi chú: {act.performance_notes}</Text>
              )}
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
          </View>
        )}
      </View>
    </>
  );

  // Tab Hình Ảnh
  const renderImagesTab = () => {
    const photos = resident.resident_photos || [];
    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 10;
    const cardWidth = (screenWidth - cardMargin * 3 - 32) * 0.46; // 46% width, margin lớn hơn

    if (photos.length === 0) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hình Ảnh Của Cư Dân</Text>
          <View style={styles.emptyContainer}>
            <MaterialIcons name="photo-library" size={60} color={COLORS.textSecondary} />
            <Text style={styles.emptyText}>Chưa có hình ảnh nào</Text>
            <Text style={styles.emptySubText}>Hình ảnh sẽ được hiển thị khi có dữ liệu</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hình Ảnh Của Cư Dân</Text>
        <FlatList
          data={photos}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={{ gap: cardMargin, marginBottom: cardMargin }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
          renderItem={({ item, index }) => {
            const imgSrc = getImageUriHelper(item.file_path);
            // Hiển thị tối đa 2 tag, còn lại dùng '...'
            const tags = item.tags || [];
            const displayTags = tags.slice(0, 2);
            const hasMoreTags = tags.length > 2;
            return (
              <Surface style={[styles.photoCard, { flex: 1, marginBottom: cardMargin }] }>
                <TouchableOpacity activeOpacity={0.7} onPress={() => { 
                  setImageViewerPhotos(photos); 
                  setImageViewerIndex(index); 
                  setImageViewerVisible(true); 
                }}>
                  <Image
                    source={{ uri: imgSrc }}
                    style={styles.photoImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
                <Text style={styles.photoCaption} numberOfLines={2}>{item.caption}</Text>
                <Text style={styles.photoDate}>Ngày: {item.taken_date ? new Date(item.taken_date).toLocaleDateString('vi-VN') : ''}</Text>
                <View style={styles.photoTagsRow}>
                  {displayTags.map((tag, idx) => (
                  <Chip
                      key={idx}
                      style={styles.photoTagChip}
                      textStyle={styles.photoTagText}
                      compact
                    >
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.photoTagText}>{tag}</Text>
                  </Chip>
                  ))}
                  {hasMoreTags && (
                    <Chip style={[styles.photoTagChip, { backgroundColor: '#ccc' }]} textStyle={styles.photoTagText} compact>...</Chip>
                  )}
                </View>
            </Surface>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
        />
      </View>
    );
  };

  // Tab Đánh Giá Chung (Assessment)
  const renderAssessmentTab = () => {
    console.log('🎯 Rendering assessment tab');
    console.log('📋 Resident assessments:', resident.assessments);
    console.log('📋 Assessments length:', resident.assessments?.length);
    console.log('📋 Resident ID:', resident._id);
    console.log('📋 Resident name:', resident.full_name);
    
    return (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Đánh Giá Sức Khỏe</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('AddAssessment', { 
              residentId,
              onGoBack: () => {
                console.log('Returning from AddAssessment, reloading data...');
                fetchData();
              }
            })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Ghi Nhận
          </Button>
        </View>

        {/* Filter controls */}
        <View style={styles.filterRow}>
          {['all','day','month','year'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.filterChip, assessmentFilterMode === mode && styles.filterChipActive]}
              onPress={() => setAssessmentFilterMode(mode)}
            >
              <Text style={[styles.filterLabel, assessmentFilterMode === mode && { color: COLORS.primary }]}>
                {mode === 'all' ? 'Tất cả' : mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
              </Text>
            </TouchableOpacity>
          ))}
          {assessmentFilterMode !== 'all' && (
            <View style={styles.periodNav}>
              <TouchableOpacity onPress={() => setAssessmentPeriod(prev => adjustPeriod(prev, assessmentFilterMode, -1))}>
                <MaterialIcons name="chevron-left" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.periodText}>{getPeriodLabel(assessmentPeriod, assessmentFilterMode)}</Text>
              <TouchableOpacity onPress={() => setAssessmentPeriod(prev => adjustPeriod(prev, assessmentFilterMode, 1))}>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openDatePicker('assessment')}>
                <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>

        {filteredAssessments && filteredAssessments.length > 0 ? (
          <FlatList
            data={filteredAssessments}
            keyExtractor={(as) => as._id}
            renderItem={({ item: as }) => (
            <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.assessmentHeader}>
                <View style={styles.assessmentTitleContainer}>
                  <Text style={styles.assessmentType}>{as.assessment_type || 'Không có loại'}</Text>
                </View>
                <View style={styles.assessmentActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditAssessment', { 
                      assessmentId: as._id, 
                      assessmentData: as,
                      residentId: residentId,
                      onGoBack: () => {
                        console.log('Returning from EditAssessment, reloading data...');
                        fetchData();
                      }
                    })}
                    style={styles.editButton}
                  >
                    <MaterialIcons name="edit" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteAssessment(as._id, as.assessment_type)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.assessmentDate}>Ngày: {formatDateFromDB(as.date)} • {formatTimeFromDB(as.date)}</Text>
              {as.notes && (
                <Text style={styles.assessmentNotes}>Ghi chú: {as.notes}</Text>
              )}
              {as.recommendations && (
                <Text style={styles.assessmentRecommendations}>Khuyến nghị: {as.recommendations}</Text>
              )}
              <Text style={styles.assessmentConductedBy}>Thực hiện bởi: {as.conducted_by?.full_name || 'N/A'}</Text>
            </Surface>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
            initialNumToRender={8}
            windowSize={7}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
          </View>
        )}
      </View>
    </>
    );
  };

    const renderMedicationsTab = () => {
    // Chỉ hiển thị dữ liệu thật, không có fallback
    const hasRealMedications = resident.current_medications && 
      Array.isArray(resident.current_medications) && 
      resident.current_medications.length > 0 &&
      resident.current_medications.some(med => med && med.medication_name);
    
    if (!hasRealMedications) {
      return (
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Thuốc Chi Tiết</Text>
          </View>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có thông tin thuốc</Text>
          </View>
        </View>
      );
    }
    
    return (
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Thuốc Chi Tiết</Text>
        </View>
        
        {resident.current_medications
          .filter(med => med && med.medication_name) // Chỉ lấy thuốc có tên thật
          .map((med, index) => (
            <Surface key={med._id || med.id || `med-${index}`} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{med.medication_name}</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: COLORS.success + '20',
                    },
                  ]}
                  textStyle={{
                    color: COLORS.success,
                  }}
                >
                  Đang Sử Dụng
                </Chip>
              </View>
              
              <View style={styles.medicationDetails}>
                <View style={styles.medicationDetail}>
                  <Text style={styles.medicationLabel}>Liều Lượng:</Text>
                  <Text style={styles.medicationValue}>{med.dosage || 'N/A'}</Text>
                </View>
                <View style={styles.medicationDetail}>
                  <Text style={styles.medicationLabel}>Tần Suất:</Text>
                  <Text style={styles.medicationValue}>{med.frequency || 'N/A'}</Text>
                </View>
              </View>
            </Surface>
          ))}
      </View>
    );
  };

  const renderVitalsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Chỉ Số Sinh Hiệu</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('RecordVitals', { 
              residentId,
              onGoBack: () => {
                console.log('Returning from RecordVitals, reloading data...');
                fetchData();
              }
            })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Ghi Nhận
          </Button>
        </View>

        {/* Filter controls */}
        <View style={styles.filterRow}>
          {['all','day','month','year'].map((mode) => (
            <TouchableOpacity
              key={mode}
              style={[styles.filterChip, vitalsFilterMode === mode && styles.filterChipActive]}
              onPress={() => setVitalsFilterMode(mode)}
            >
              <Text style={[styles.filterLabel, vitalsFilterMode === mode && { color: COLORS.primary }]}>
                {mode === 'all' ? 'Tất cả' : mode === 'day' ? 'Ngày' : mode === 'month' ? 'Tháng' : 'Năm'}
              </Text>
            </TouchableOpacity>
          ))}
          {vitalsFilterMode !== 'all' && (
            <View style={styles.periodNav}>
              <TouchableOpacity onPress={() => setVitalsPeriod(prev => adjustPeriod(prev, vitalsFilterMode, -1))}>
                <MaterialIcons name="chevron-left" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Text style={styles.periodText}>{getPeriodLabel(vitalsPeriod, vitalsFilterMode)}</Text>
              <TouchableOpacity onPress={() => setVitalsPeriod(prev => adjustPeriod(prev, vitalsFilterMode, 1))}>
                <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openDatePicker('vitals')}>
                <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} style={{ marginLeft: 8 }} />
              </TouchableOpacity>
            </View>
          )}
        </View>
        
        {filteredVitals && filteredVitals.length > 0 ? (
          <FlatList
            data={filteredVitals}
            keyExtractor={(vital) => vital._id}
            renderItem={({ item: vital }) => (
            <Surface style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.vitalHeader}>
                <View style={styles.vitalDateContainer}>
                  <Text style={styles.vitalDate}>
                    Ngày: {formatDateFromDB(vital.date_time)}
                  </Text>
                  <Text style={styles.vitalTime}>
                    Giờ: {formatTimeFromDB(vital.date_time)}
                  </Text>
                </View>
                <View style={styles.vitalActions}>
                  <TouchableOpacity
                    onPress={() => navigation.navigate('EditVitals', { 
                      vitalId: vital._id, 
                      vitalData: vital,
                      onGoBack: () => {
                        console.log('Returning from EditVitals, reloading data...');
                        fetchData();
                      }
                    })}
                    style={styles.editButton}
                  >
                    <MaterialIcons name="edit" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteVitals(vital._id)}
                    style={styles.deleteButton}
                  >
                    <MaterialIcons name="delete" size={18} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={styles.vitalGrid}>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Nhiệt độ</Text>
                  <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Huyết áp</Text>
                  <Text style={styles.vitalValue}>{vital.blood_pressure}</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Nhịp tim</Text>
                  <Text style={styles.vitalValue}>{vital.heart_rate} BPM</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Nhịp thở</Text>
                  <Text style={styles.vitalValue}>{vital.respiratory_rate}/phút</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Oxy</Text>
                  <Text style={styles.vitalValue}>{vital.oxygen_level}%</Text>
                </View>
                <View style={styles.vitalItem}>
                  <Text style={styles.vitalLabel}>Cân nặng</Text>
                  <Text style={styles.vitalValue}>{vital.weight} kg</Text>
                </View>
              </View>
              {vital.notes && (
                <Text style={styles.vitalNotes}>Ghi chú: {vital.notes}</Text>
              )}
              <Text style={styles.vitalRecordedBy}>Ghi nhận bởi: {vital.recorded_by?.full_name || 'N/A'}</Text>
            </Surface>
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
            initialNumToRender={8}
            windowSize={7}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có dấu hiệu sinh tồn được ghi nhận</Text>
            <Text style={styles.emptyText}>Dữ liệu sẽ được hiển thị khi có thông tin</Text>
          </View>
        )}
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thông tin cư dân" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('EditResident', { 
                residentId,
                residentData: resident,
                onGoBack: () => {
                  console.log('Returning from EditResident, reloading data...');
                  fetchData();
                }
              });
            }}
            title="Chỉnh Sửa Thông Tin"
            icon="pencil"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
            title="Kéo xuống để làm mới"
            titleColor={COLORS.textSecondary}
          />
        }
      >
        <View style={styles.profileContainer}>
          <CommonAvatar 
            source={resident.photo || resident.avatar}
            size={120}
            name={resident.full_name}
            style={styles.profileImage}
          />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{resident.full_name || 'Không có tên'}</Text>
              {refreshing && (
                <View style={styles.refreshingIndicator}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.refreshingText}>Đang cập nhật...</Text>
                </View>
              )}
            </View>
            <View style={styles.roomBadge}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomText}>
                {(() => {
                  const hasCurrentBedAssignment = resident.bed_info && 
                    resident.bed_info.bed_id && 
                    resident.bed_info.bed_id.room_id && 
                    !resident.bed_info.unassigned_date;
                  
                  if (hasCurrentBedAssignment) {
                    return `Phòng ${resident.bed_info.bed_id.room_id.room_number}`;
                  } else {
                    return 'Chưa phân công phòng';
                  }
                })()}
              </Text>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                
                if (hasCurrentBedAssignment && resident.bed_info.bed_id.bed_number) {
                  return <Text style={styles.bedText}> - Giường {resident.bed_info.bed_id.bed_number}</Text>;
                }
                return null;
              })()}
            </View>
          </View>
        </View>

        <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={activeTab === 'overview' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Tổng Quan
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'activity' && styles.activeTabButton]}
            onPress={() => setActiveTab('activity')}
          >
            <MaterialIcons
              name="event"
              size={24}
              color={activeTab === 'activity' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'activity' && styles.activeTabText,
              ]}
            >
              Hoạt Động
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'meds' && styles.activeTabButton]}
            onPress={() => setActiveTab('meds')}
          >
            <FontAwesome5
              name="pills"
              size={24}
              color={activeTab === 'meds' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'meds' && styles.activeTabText,
              ]}
            >
              Thuốc
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vitals' && styles.activeTabButton]}
            onPress={() => setActiveTab('vitals')}
          >
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color={activeTab === 'vitals' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'vitals' && styles.activeTabText,
              ]}
            >
              Sinh Hiệu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'images' && styles.activeTabButton]}
            onPress={() => setActiveTab('images')}
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color={activeTab === 'images' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'images' && styles.activeTabText,
              ]}
            >
              Hình Ảnh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'assessment' && styles.activeTabButton]}
            onPress={() => setActiveTab('assessment')}
          >
            <MaterialIcons
              name="assignment-turned-in"
              size={24}
              color={activeTab === 'assessment' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'assessment' && styles.activeTabText,
              ]}
            >
              Đánh Giá
            </Text>
          </TouchableOpacity>
        </RNScrollView>

        <Divider />

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'meds' && renderMedicationsTab()}
        {activeTab === 'vitals' && renderVitalsTab()}
        {activeTab === 'images' && renderImagesTab()}
        {activeTab === 'assessment' && renderAssessmentTab()}
      </ScrollView>
      {/* Date Picker Modal (simple Y/M/D inputs for broad device support without extra deps) */}
      <Modal
        visible={datePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' }}>
          <View style={{ width: '86%', backgroundColor: '#fff', borderRadius: 12, padding: 16 }}>
            <Text style={{ ...FONTS.h4, marginBottom: 12, color: COLORS.text, fontWeight: 'bold' }}>
              Chọn ngày cụ thể
            </Text>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={{ ...FONTS.body3, color: COLORS.textSecondary, marginBottom: 6 }}>Ngày</Text>
                <TextInput
                  value={dateInputDay}
                  onChangeText={setDateInputDay}
                  placeholder="DD"
                  keyboardType="number-pad"
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }}
                />
              </View>
              <View style={{ flex: 1, marginHorizontal: 4 }}>
                <Text style={{ ...FONTS.body3, color: COLORS.textSecondary, marginBottom: 6 }}>Tháng</Text>
                <TextInput
                  value={dateInputMonth}
                  onChangeText={setDateInputMonth}
                  placeholder="MM"
                  keyboardType="number-pad"
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={{ ...FONTS.body3, color: COLORS.textSecondary, marginBottom: 6 }}>Năm</Text>
                <TextInput
                  value={dateInputYear}
                  onChangeText={setDateInputYear}
                  placeholder="YYYY"
                  keyboardType="number-pad"
                  style={{ borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 10, height: 40 }}
                />
              </View>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 }}>
              <TouchableOpacity onPress={() => setDatePickerVisible(false)} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ ...FONTS.body3, color: COLORS.textSecondary }}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={applyDatePicker} style={{ paddingHorizontal: 12, paddingVertical: 8 }}>
                <Text style={{ ...FONTS.body3, color: COLORS.primary, fontWeight: 'bold' }}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {/* Fullscreen Image Viewer with Swipe Navigation */}
      <Modal
        visible={imageViewerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setImageViewerVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.9)' }}>
          {/* Header with close button and image counter */}
          <View style={{ 
            position: 'absolute', 
            top: 40, 
            left: 20, 
            right: 20, 
            zIndex: 2, 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center' 
          }}>
            <TouchableOpacity onPress={() => setImageViewerVisible(false)}>
              <MaterialIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '500' }}>
              {imageViewerIndex + 1} / {imageViewerPhotos.length}
            </Text>
            <View style={{ width: 28 }} />
          </View>

          {/* Navigation arrows */}
          {imageViewerIndex > 0 && (
            <TouchableOpacity 
              style={{ 
                position: 'absolute', 
                left: 20, 
                top: '50%', 
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }} 
              onPress={() => setImageViewerIndex(prev => Math.max(0, prev - 1))}
            >
              <MaterialIcons name="chevron-left" size={30} color="#fff" />
            </TouchableOpacity>
          )}
          
          {imageViewerIndex < imageViewerPhotos.length - 1 && (
            <TouchableOpacity 
              style={{ 
                position: 'absolute', 
                right: 20, 
                top: '50%', 
                zIndex: 2,
                backgroundColor: 'rgba(0,0,0,0.5)',
                borderRadius: 25,
                width: 50,
                height: 50,
                justifyContent: 'center',
                alignItems: 'center'
              }} 
              onPress={() => setImageViewerIndex(prev => Math.min(imageViewerPhotos.length - 1, prev + 1))}
            >
              <MaterialIcons name="chevron-right" size={30} color="#fff" />
            </TouchableOpacity>
          )}

          {/* Main image */}
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            {imageViewerPhotos.length > 0 && imageViewerPhotos[imageViewerIndex] && (
              <Image
                source={{ uri: getImageUriHelper(imageViewerPhotos[imageViewerIndex].file_path) }}
                style={{ width: '100%', height: '80%' }}
                resizeMode="contain"
              />
            )}
          </View>

          {/* Image info panel (caption + metadata) */}
          {imageViewerPhotos.length > 0 && imageViewerPhotos[imageViewerIndex] && (
            <View style={styles.imageInfoContainer}>
              {!!imageViewerPhotos[imageViewerIndex].caption && (
                <Text style={[styles.imageInfoText, { fontWeight: '600' }]} numberOfLines={2}>
                  {imageViewerPhotos[imageViewerIndex].caption}
                </Text>
              )}
              <Text style={styles.imageInfoText}>
                Người đăng: {imageViewerPhotos[imageViewerIndex].uploaded_by?.full_name || imageViewerPhotos[imageViewerIndex].uploaded_by?.username || 'Không xác định'}
              </Text>
              <Text style={styles.imageInfoText}>
                Thời gian: {imageViewerPhotos[imageViewerIndex].taken_date ? new Date(imageViewerPhotos[imageViewerIndex].taken_date).toLocaleString('vi-VN') : 'Không xác định'}
              </Text>
              <Text style={styles.imageInfoText}>
                Địa điểm: {imageViewerPhotos[imageViewerIndex].related_activity_id?.location || 'Không xác định'}
              </Text>
              <Text style={styles.imageInfoText}>
                Hoạt động: {imageViewerPhotos[imageViewerIndex].related_activity_id?.activity_name || 'Không xác định'}
              </Text>
              {!!imageViewerPhotos[imageViewerIndex].related_activity_id?.description && (
                <Text style={styles.imageInfoText} numberOfLines={3}>
                  Mô tả: {imageViewerPhotos[imageViewerIndex].related_activity_id?.description}
                </Text>
              )}
              {!!(imageViewerPhotos[imageViewerIndex].tags && imageViewerPhotos[imageViewerIndex].tags.length) && (
                <View style={styles.imageTagsRow}>
                  {imageViewerPhotos[imageViewerIndex].tags.slice(0, 3).map((tag, idx) => (
                    <View key={idx} style={styles.imageTagChip}>
                      <Text style={styles.imageTagText} numberOfLines={1}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </View>
      </Modal>

      {/* Bed Assignment Modal */}
      <Modal
        visible={bedAssignmentModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setBedAssignmentModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackButton}
              onPress={() => setBedAssignmentModalVisible(false)}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {(() => {
                const hasCurrentBedAssignment = resident.bed_info && 
                  resident.bed_info.bed_id && 
                  resident.bed_info.bed_id.room_id && 
                  !resident.bed_info.unassigned_date;
                return hasCurrentBedAssignment ? 'Đổi Giường' : 'Phân Bổ Phòng Giường';
              })()}
            </Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            {/* Room Selection */}
            <View style={styles.selectionSection}>
              <Text style={styles.selectionTitle}>Chọn Phòng</Text>
              <Text style={styles.selectionSubtitle}>
                Phòng phù hợp với giới tính: {resident.gender === 'male' ? 'Nam' : 'Nữ'}
                {(() => {
                  const now = new Date();
                  const activeAssignment = carePlanAssignments?.find(assignment => {
                    const startDate = new Date(assignment.start_date);
                    const endDate = new Date(assignment.end_date);
                    return assignment.status === 'active' && now >= startDate && now <= endDate;
                  });
                  return activeAssignment?.care_plan_ids?.[0]?.plan_name ? 
                    ` • Gói dịch vụ: ${activeAssignment.care_plan_ids[0].plan_name}` : 
                    ' • Gói dịch vụ: Chưa có';
                })()}
              </Text>
              
              {loadingRooms ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
                </View>
              ) : availableRooms.length > 0 ? (
                availableRooms.map((room) => (
                  <TouchableOpacity
                    key={room._id}
                    style={[
                      styles.roomItem,
                      selectedRoom?._id === room._id && styles.selectedRoomItem
                    ]}
                    onPress={() => handleRoomSelection(room)}
                  >
                    <View style={styles.roomInfo}>
                      <Text style={styles.roomName}>Phòng {room.room_number}</Text>
                      <Text style={styles.roomType}>
                        {(() => {
                          const roomTypeObj = roomTypes.find(rt => rt.room_type === room.room_type);
                          return roomTypeObj ? roomTypeObj.type_name : (room.room_type || 'Phòng chuẩn');
                        })()}
                      </Text>
                      <Text style={styles.roomCapacity}>
                        Tầng {room.floor || 'N/A'} • {room.gender === 'male' ? 'Nam' : 'Nữ'}
                      </Text>
                      <Text style={styles.roomPrice}>
                        {(() => {
                          const roomTypeObj = roomTypes.find(rt => rt.room_type === room.room_type);
                          if (roomTypeObj && roomTypeObj.monthly_price) {
                            return `${new Intl.NumberFormat('vi-VN').format(roomTypeObj.monthly_price * 10000)}/tháng`;
                          }
                          return 'Giá liên hệ';
                        })()}
                      </Text>
                    </View>
                    {selectedRoom?._id === room._id && (
                      <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <Text style={styles.emptyStateText}>Không có phòng phù hợp</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Vui lòng kiểm tra lại thông tin cư dân hoặc gói dịch vụ
                  </Text>
                </View>
              )}
            </View>

            {/* Bed Selection */}
            {selectedRoom && (
              <View style={styles.selectionSection}>
                <Text style={styles.selectionTitle}>Chọn Giường</Text>
                <Text style={styles.selectionSubtitle}>
                  Phòng {selectedRoom.room_number} - {(() => {
                    const roomTypeObj = roomTypes.find(rt => rt.room_type === selectedRoom.room_type);
                    return roomTypeObj ? roomTypeObj.type_name : (selectedRoom.room_type || 'Phòng chuẩn');
                  })()}
                </Text>
                
                {loadingBeds ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                    <Text style={styles.loadingText}>Đang tải danh sách giường...</Text>
                  </View>
                ) : availableBeds.length > 0 ? (
                  availableBeds.map((bed) => (
                    <TouchableOpacity
                      key={bed._id}
                      style={[
                        styles.bedItem,
                        selectedBed?._id === bed._id && styles.selectedBedItem
                      ]}
                      onPress={() => handleBedSelection(bed)}
                    >
                      <View style={styles.bedInfo}>
                        <Text style={styles.bedName}>Giường {bed.bed_number}</Text>
                        <Text style={styles.bedType}>{bed.bed_type || 'Chuẩn'}</Text>
                        <Text style={styles.bedStatus}>Trống</Text>
                        {bed.monthly_price && (
                          <Text style={styles.bedPrice}>
                            {new Intl.NumberFormat('vi-VN').format(bed.monthly_price * 10000)}/tháng
                          </Text>
                        )}
                      </View>
                      {selectedBed?._id === bed._id && (
                        <MaterialIcons name="check-circle" size={24} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyStateText}>Không có giường trống</Text>
                    <Text style={styles.emptyStateSubtext}>Vui lòng chọn phòng khác</Text>
                  </View>
                )}
              </View>
            )}

            {/* Assignment Summary */}
            {selectedRoom && selectedBed && (
              <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Tóm Tắt Phân Bổ</Text>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Cư dân:</Text>
                  <Text style={styles.summaryValue}>{resident.full_name}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Phòng:</Text>
                  <Text style={styles.summaryValue}>Phòng {selectedRoom.room_number}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Giường:</Text>
                  <Text style={styles.summaryValue}>Giường {selectedBed.bed_number}</Text>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.modalFooter}>
            <Button
              mode="outlined"
              onPress={() => setBedAssignmentModalVisible(false)}
              style={styles.cancelButton}
              labelStyle={styles.cancelButtonText}
            >
              Hủy
            </Button>
            <Button
              mode="contained"
              onPress={handleAssignBed}
              disabled={!selectedRoom || !selectedBed || isAssigning}
              style={styles.assignButton}
              labelStyle={styles.assignButtonText}
              loading={isAssigning}
            >
              {isAssigning ? 'Đang phân bổ...' : 'Xác nhận phân bổ'}
            </Button>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
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
  },
  loadingText: {
    marginTop: 10,
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  profileContainer: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 8,
  },
  name: {
    ...FONTS.h3,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  roomText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  bedText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
    fontWeight: '500',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
  },
  tabText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    marginTop: 8, // Thêm khoảng cách từ tab navigation
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  filterChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: COLORS.background,
    borderRadius: 16,
    marginRight: 8,
    marginTop: 4,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary + '20',
  },
  filterLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  periodNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
  },
  periodText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    marginHorizontal: 8,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  addButtonText: {
    ...FONTS.body3,
    color: COLORS.surface,
    fontWeight: '500',
  },
  cardContainer: {
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  medicalHistoryText: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 20,
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  allergyChip: {
    backgroundColor: COLORS.error + '15',
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    color: COLORS.error,
    fontWeight: '500',
  },
  noDataText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 8,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    opacity: 0.7,
  },
  activityName: { 
    ...FONTS.h4, 
    color: COLORS.primary, 
    marginBottom: 8,
    fontWeight: 'bold',
  },
  activityDate: { 
    ...FONTS.body3, 
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  activityStatus: { 
    ...FONTS.body3, 
    color: COLORS.success, 
    marginBottom: 8,
    fontWeight: '500',
  },
  activityNotes: { 
    ...FONTS.body2, 
    color: COLORS.text,
    lineHeight: 18,
  },
  assessmentType: { 
    ...FONTS.h4, 
    color: COLORS.primary, 
    marginBottom: 8,
    fontWeight: 'bold',
  },
  assessmentDate: { 
    ...FONTS.body3, 
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  assessmentTime: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: -6,
    marginBottom: 8,
  },
  assessmentNotes: { 
    ...FONTS.body2, 
    color: COLORS.text,
    marginBottom: 8,
    lineHeight: 18,
  },
  assessmentRecommendations: { 
    ...FONTS.body2, 
    color: COLORS.success,
    marginBottom: 8,
    fontWeight: '500',
  },
  assessmentConductedBy: { 
    ...FONTS.body3, 
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: 'bold',
    flex: 1,
  },
  medicationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  medicationDetail: {
    marginRight: 16,
    marginBottom: 8,
    flex: 1,
    minWidth: '45%',
  },
  medicationLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  medicationValue: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '500',
  },
  statusChip: {
    height: 32,
    borderRadius: 16,
  },
  vitalDate: { 
    ...FONTS.h4, 
    color: COLORS.primary, 
    marginBottom: 12,
    fontWeight: 'bold',
  },
  vitalTime: {
    ...FONTS.caption,
    color: COLORS.textSecondary,
    marginTop: -8,
    marginBottom: 8,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vitalItem: {
    width: '48%',
    marginBottom: 12,
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  vitalLabel: { 
    ...FONTS.body3, 
    color: COLORS.textSecondary, 
    marginBottom: 4,
  },
  vitalValue: { 
    ...FONTS.body2, 
    color: COLORS.text, 
    fontWeight: '600',
  },
  vitalNotes: { 
    ...FONTS.body2, 
    color: COLORS.text, 
    marginTop: 12,
    lineHeight: 18,
  },
  vitalRecordedBy: { 
    ...FONTS.body3, 
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  vitalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  vitalDateContainer: {
    flex: 1,
    marginRight: 12,
  },
  vitalActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  assessmentTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  assessmentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '10',
    alignSelf: 'flex-start',
    marginTop: 2,
    marginRight: 4,
  },
  deleteButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.error + '10',
    alignSelf: 'flex-start',
    marginTop: 2,
  },
  photoCaption: { 
    ...FONTS.body4, 
    fontWeight: '500', 
    marginBottom: 4, 
    textAlign: 'center', 
    color: COLORS.text, 
    fontSize: 13,
    lineHeight: 16,
  },
  photoDate: { 
    ...FONTS.caption, 
    color: COLORS.gray, 
    marginBottom: 6, 
    textAlign: 'center', 
    fontSize: 12,
  },
  photoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  photoImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  photoTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  photoTagChip: {
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: COLORS.primary + '15',
    height: 28,
    alignItems: 'center',
    paddingHorizontal: 8,
    maxWidth: 130,
  },
  photoTagText: {
    fontSize: 11,
    paddingHorizontal: 0,
    paddingVertical: 0,
    lineHeight: 15,
    color: COLORS.primary,
    fontWeight: '500',
  },
  tabScrollContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  refreshingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  refreshingText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  carePlanItem: {
    marginBottom: 16,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carePlanName: {
    ...FONTS.h4,
    color: COLORS.primary,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  carePlanDetails: {
    backgroundColor: COLORS.background,
    padding: 12,
    borderRadius: 8,
  },
  carePlanDetail: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carePlanLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  carePlanValue: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  carePlanDivider: {
    marginVertical: 16,
  },
  imageInfoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
    borderRadius: 8,
  },
  imageInfoText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
  imageTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  imageTagChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  imageTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  // Bed assignment styles
  bedAssignmentContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  bedAssignmentButton: {
    borderRadius: 8,
    minWidth: 200,
  },
  bedAssignmentButtonText: {
    ...FONTS.body3,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingTop: 45,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    flex: 1,
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  selectionSection: {
    marginBottom: 24,
  },
  selectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  roomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedRoomItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  roomType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  roomCapacity: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
  },
  roomPrice: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 2,
  },
  bedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedBedItem: {
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '15',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  bedInfo: {
    flex: 1,
  },
  bedName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  bedStatus: {
    fontSize: 14,
    color: COLORS.success,
    fontWeight: '500',
  },
  bedType: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bedPrice: {
    fontSize: 12,
    color: COLORS.success,
    fontWeight: '500',
    marginTop: 2,
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '600',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
    borderColor: '#ccc',
  },
  cancelButtonText: {
    color: '#666',
    fontWeight: '500',
  },
  assignButton: {
    flex: 1,
    marginLeft: 8,
    backgroundColor: COLORS.primary,
  },
  assignButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ResidentDetailScreen; 