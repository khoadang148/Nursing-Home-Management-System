import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  FlatList,
  Dimensions,
  ScrollView as RNScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Surface, Button, Chip, Divider, Menu, Appbar } from 'react-native-paper';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';

// Import services
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import residentPhotosService from '../../api/services/residentPhotosService';
import assessmentService from '../../api/services/assessmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';

const DEFAULT_AVATAR = APP_CONFIG.DEFAULT_AVATAR;

// Fallback nếu API_BASE_URL bị undefined
const DEFAULT_API_BASE_URL = 'http://192.168.1.15:8000';
const getApiBaseUrl = () => {
  return DEFAULT_API_BASE_URL;
};

// Helper để format avatar
const getAvatarUri = (avatar) => {
  return getImageUri(avatar, 'avatar');
};

// Helper để format hình ảnh
const getImageUriHelper = (imagePath) => {
  return getImageUri(imagePath, 'image');
};

// Mock data for medications (để test giao diện khi chưa có API)
const MOCK_MEDICATIONS = [
  {
    id: 'med1',
    medication_name: 'Metformin 500mg',
    dosage: '1 viên',
    frequency: '2 lần/ngày',
    time: 'Sáng và tối',
    purpose: 'Điều trị tiểu đường',
    side_effects: 'Có thể gây buồn nôn nhẹ',
    start_date: '2024-01-15',
    end_date: null,
    status: 'active'
  },
  {
    id: 'med2',
    medication_name: 'Amlodipine 5mg',
    dosage: '1 viên',
    frequency: '1 lần/ngày',
    time: 'Sáng',
    purpose: 'Điều trị cao huyết áp',
    side_effects: 'Có thể gây phù chân',
    start_date: '2024-01-10',
    end_date: null,
    status: 'active'
  },
  {
    id: 'med3',
    medication_name: 'Aspirin 81mg',
    dosage: '1 viên',
    frequency: '1 lần/ngày',
    time: 'Sáng',
    purpose: 'Phòng ngừa đột quỵ',
    side_effects: 'Có thể gây chảy máu dạ dày',
    start_date: '2024-01-05',
    end_date: null,
    status: 'active'
  }
];


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
  // Tab mới: overview, activity, meds, vitals, images, assessment
  const [activeTab, setActiveTab] = useState(initialTab);

  const fetchData = async () => {
    try {
      setLoading(true);
      
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
      const assessmentResponse = await assessmentService.getAssessmentsByResidentId(residentId);
      if (assessmentResponse.success) {
        setResident(prev => ({ ...prev, assessments: assessmentResponse.data }));
      }

      // Fetch vital signs
      const vitalResponse = await vitalSignsService.getVitalSignsByResidentId(residentId);
      if (vitalResponse.success) {
        setResident(prev => ({ ...prev, vital_signs: vitalResponse.data }));
      }

    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải dữ liệu cư dân. Vui lòng thử lại sau.');
      console.error('Error fetching resident data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load data when component mounts
  useEffect(() => {
    fetchData();
  }, [residentId]);

  // Chỉ reload khi có thay đổi từ Redux store (khi có dữ liệu mới)
  const residentChanges = useSelector((state) => state.residents?.lastUpdated);
  
  useEffect(() => {
    // Chỉ reload khi có thay đổi thực sự từ Redux
    if (residentChanges && resident) {
      console.log('Redux detected changes, reloading resident data...');
      fetchData();
    }
  }, [residentChanges, residentId]);

  // Update active tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (loading || !resident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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

  const renderOverviewTab = () => {
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
              {activeAssignment?.bed_id?.room_id?.room_number ? `Phòng ${activeAssignment.bed_id.room_id.room_number}` : 'Chưa phân công'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giường:</Text>
            <Text style={styles.infoValue}>
              {activeAssignment?.bed_id?.bed_number ? `Giường ${activeAssignment.bed_id.bed_number}` : 'Chưa phân công'}
            </Text>
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
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: cardMargin }}
          renderItem={({ item, index }) => {
            const imgSrc = getImageUriHelper(item.file_path);
            // Hiển thị tối đa 2 tag, còn lại dùng '...'
            const tags = item.tags || [];
            const displayTags = tags.slice(0, 2);
            const hasMoreTags = tags.length > 2;
            return (
              <Surface style={[styles.photoCard, { width: cardWidth, marginBottom: cardMargin }] }>
                <Image
                  source={{ uri: imgSrc }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
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
  const renderAssessmentTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Đánh Giá Sức Khỏe</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('AddAssessment', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Ghi Nhận
          </Button>
        </View>
        {resident.assessments && resident.assessments.length > 0 ? (
          resident.assessments.map(as => (
            <Surface key={as._id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.assessmentHeader}>
                <View style={styles.assessmentTitleContainer}>
                  <Text style={styles.assessmentType}>{as.assessment_type || 'Không có loại'}</Text>
                </View>
                {/* Temporarily removed edit functionality */}
                <View style={styles.editButton}>
                  <MaterialIcons name="edit" size={18} color={COLORS.disabled} />
                </View>
              </View>
              <Text style={styles.assessmentDate}>Ngày: {as.date ? new Date(as.date).toLocaleDateString('vi-VN') : 'N/A'}</Text>
              {as.notes && (
                <Text style={styles.assessmentNotes}>Ghi chú: {as.notes}</Text>
              )}
              {as.recommendations && (
                <Text style={styles.assessmentRecommendations}>Khuyến nghị: {as.recommendations}</Text>
              )}
              <Text style={styles.assessmentConductedBy}>Thực hiện bởi: {as.conducted_by?.full_name || 'N/A'}</Text>
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderMedicationsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Thuốc Chi Tiết</Text>
        </View>
        
        {resident.current_medications && resident.current_medications.length > 0 ? (
          resident.current_medications.map((med, index) => (
            <Surface key={med._id || med.id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
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
                    <Text style={styles.medicationValue}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medicationDetail}>
                    <Text style={styles.medicationLabel}>Tần Suất:</Text>
                    <Text style={styles.medicationValue}>{med.frequency}</Text>
                  </View>
                </View>
            </Surface>
          ))
        ) : (
          // Sử dụng mock data khi không có dữ liệu thực
          MOCK_MEDICATIONS.map((med, index) => (
            <Surface key={med.id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
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
                    <Text style={styles.medicationValue}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medicationDetail}>
                    <Text style={styles.medicationLabel}>Tần Suất:</Text>
                    <Text style={styles.medicationValue}>{med.frequency}</Text>
                  </View>
                </View>
            </Surface>
          ))
        )}
      </View>
    </>
  );

  const renderVitalsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Dấu Hiệu Sinh Tồn</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('RecordVitals', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Ghi Nhận
          </Button>
        </View>
        
        {resident.vital_signs && resident.vital_signs.length > 0 ? (
          resident.vital_signs.map(vital => (
            <Surface key={vital._id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.vitalHeader}>
                <View style={styles.vitalDateContainer}>
                  <Text style={styles.vitalDate}>
                    Ngày: {vital.date_time ? new Date(vital.date_time).toLocaleDateString('vi-VN') : 'N/A'}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => navigation.navigate('EditVitals', { vitalId: vital._id, vitalData: vital })}
                  style={styles.editButton}
                >
                  <MaterialIcons name="edit" size={18} color={COLORS.primary} />
                </TouchableOpacity>
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
          ))
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
              navigation.navigate('EditResident', { residentId });
            }}
            title="Chỉnh Sửa Thông Tin"
            icon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentNotes', { residentId });
            }}
            title="Ghi Chú"
            icon="notebook"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentFamily', { residentId });
            }}
            title="Liên Hệ Gia Đình"
            icon="account-group"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: getAvatarUri(resident.photo || resident.avatar) || DEFAULT_AVATAR }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{resident.full_name || 'Không có tên'}</Text>
            </View>
            <View style={styles.roomBadge}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomText}>
                {activeAssignment?.bed_id?.room_id?.room_number ? 
                  `Phòng ${activeAssignment.bed_id.room_id.room_number}` : 
                  'Chưa phân công phòng'
                }
              </Text>
              {activeAssignment?.bed_id?.bed_number && (
                <Text style={styles.bedText}> - Giường {activeAssignment.bed_id.bed_number}</Text>
              )}
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
    height: 28,
    borderRadius: 14,
  },
  vitalDate: { 
    ...FONTS.h4, 
    color: COLORS.primary, 
    marginBottom: 12,
    fontWeight: 'bold',
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
  editButton: {
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '10',
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
    minWidth: 0,
    maxWidth: '100%',
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
    height: 22,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
    minHeight: 20,
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
});

export default ResidentDetailScreen; 