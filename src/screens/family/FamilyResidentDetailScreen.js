import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  Button,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

// ======= IMPORT REAL SERVICES =======
import residentService from '../../api/services/residentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';
import activityParticipationService from '../../api/services/activityParticipationService';
import medicationService from '../../api/services/medicationService';
import carePlanService from '../../api/services/carePlanService';
import bedAssignmentService from '../../api/services/bedAssignmentService';

const FamilyResidentDetailScreen = ({ route, navigation }) => {
  const { residentId, initialTab } = route.params;
  console.log('[FamilyResidentDetailScreen] render, residentId:', residentId);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'overview'); // overview, vitals, assessments, activities, medications

  const [residentData, setResidentData] = useState(null);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [medicationAdministrations, setMedicationAdministrations] = useState([]);
  const [carePlanAssignment, setCarePlanAssignment] = useState(null);
  const [bedInfo, setBedInfo] = useState(null);

  useEffect(() => {
    console.log('[FamilyResidentDetailScreen] useEffect residentId:', residentId);
    loadResidentData();
  }, [residentId]);

  useEffect(() => {
    // Set active tab based on initialTab parameter
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // ======= REPLACE loadResidentData WITH REAL API CALLS =======
  const loadResidentData = async () => {
    setLoading(true);
    try {
      // 1. Lấy thông tin cư dân
      const residentRes = await residentService.getResidentById(residentId);
      console.log('[FamilyResidentDetailScreen] residentRes:', residentRes);
      if (residentRes.success && residentRes.data) {
        console.log('[FamilyResidentDetailScreen] setResidentData:', residentRes.data);
        setResidentData(residentRes.data);
      } else {
        setResidentData(null);
        setLoading(false);
        return; // Không cần gọi các API khác nếu không có resident
      }
      // 1a. Lấy thông tin phòng giường
      try {
        const bedRes = await bedAssignmentService.getResidentBedInfo(residentId);
        setBedInfo(bedRes.success && bedRes.data ? bedRes.data : null);
      } catch (e) {
        setBedInfo(null);
      }
      // 1b. Lấy gói chăm sóc assignment
      try {
        const carePlanRes = await carePlanService.getCarePlanAssignmentByResidentId(residentId);
        setCarePlanAssignment(carePlanRes.success && carePlanRes.data ? carePlanRes.data : null);
      } catch (e) {
        setCarePlanAssignment(null);
      }

      // 2. Lấy vital signs
      try {
        const vitalRes = await vitalSignsService.getVitalSignsByResidentId(residentId);
        setVitalSigns(vitalRes.success && vitalRes.data ? vitalRes.data : []);
      } catch (e) {
        setVitalSigns([]);
      }

      // 3. Lấy assessments
      try {
        const assessRes = await assessmentService.getAssessmentsByResidentId(residentId);
        setAssessments(assessRes.success && assessRes.data ? assessRes.data : []);
      } catch (e) {
        setAssessments([]);
      }

      // 4. Lấy activities
      try {
        const actRes = await activityParticipationService.getParticipationsByResident(residentId);
        setActivities(actRes.success && actRes.data ? actRes.data : []);
      } catch (e) {
        setActivities([]);
      }

      // 5. Lấy medication administrations
      try {
        const medRes = await medicationService.getMedicationAdministrationsByResidentId
          ? await medicationService.getMedicationAdministrationsByResidentId(residentId)
          : { success: false, data: [] };
        setMedicationAdministrations(medRes.success && medRes.data ? medRes.data : []);
      } catch (e) {
        setMedicationAdministrations([]);
      }
    } catch (error) {
      setResidentData(null);
    }
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResidentData();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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

  const renderTabBar = () => {
    const tabs = [
      { key: 'overview', title: 'Tổng quan', icon: 'account' },
      { key: 'vitals', title: 'Chỉ số', icon: 'heart-pulse' },
      { key: 'assessments', title: 'Đánh giá', icon: 'clipboard-text' },
      { key: 'activities', title: 'Hoạt động', icon: 'run' },
      { key: 'medications', title: 'Thuốc', icon: 'pill' }
    ];

    return (
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOverview = () => (
    <View>
      {/* Basic Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Thông tin cơ bản</Title>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{residentData.full_name || 'Chưa có'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {residentData.date_of_birth ? `${formatDate(residentData.date_of_birth)} (${calculateAge(residentData.date_of_birth)} tuổi)` : 'Chưa có'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>
              {residentData.gender === 'male' ? 'Nam' : residentData.gender === 'female' ? 'Nữ' : 'Chưa có'}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày nhập viện:</Text>
            <Text style={styles.infoValue}>{residentData.admission_date ? formatDate(residentData.admission_date) : 'Chưa có'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng - Giường:</Text>
            <Text style={styles.infoValue}>
              {bedInfo?.roomNumber && bedInfo?.bedNumber ? `${bedInfo.roomNumber} - ${bedInfo.bedNumber}` : 'Chưa có'}
            </Text>
          </View>
        </Card.Content>
      </Card>
      {/* Medical History */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-hospital" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Tiền sử bệnh</Title>
          </View>
          <Text style={styles.medicalText}>{residentData.medical_history || 'Chưa có'}</Text>
          <Text style={styles.sectionSubtitle}>Dị ứng:</Text>
          <View style={styles.allergiesContainer}>
            {(residentData.allergies && Array.isArray(residentData.allergies) && residentData.allergies.length > 0) ? (
              residentData.allergies.map((allergy, index) => (
              <Chip
                key={index}
                icon={() => <MaterialIcons name="warning" size={16} color={COLORS.error} />}
                style={[styles.allergyChip, { backgroundColor: COLORS.error + '20' }]}
                textStyle={{ color: COLORS.error }}
              >
                {allergy}
              </Chip>
              ))
            ) : (
              <Text style={styles.medicalText}>Chưa có</Text>
            )}
          </View>
        </Card.Content>
      </Card>
      {/* Emergency Contact */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="contact-emergency" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Liên hệ khẩn cấp</Title>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{residentData.emergency_contact?.name || 'Chưa có'}</Text>
            <Text style={styles.contactRelation}>({residentData.emergency_contact?.relationship || 'Chưa có'})</Text>
            {residentData.emergency_contact?.phone ? (
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => Alert.alert('Gọi điện', 'Bạn có muốn gọi ' + residentData.emergency_contact.phone + '?')}
            >
              <MaterialIcons name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.phoneText}>{residentData.emergency_contact.phone}</Text>
            </TouchableOpacity>
            ) : (
              <Text style={styles.phoneText}>Chưa có số điện thoại</Text>
            )}
          </View>
        </Card.Content>
      </Card>
      {/* Care Plan */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="assignment" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Gói chăm sóc</Title>
          </View>
          {carePlanAssignment ? (
            <>
              <Text style={styles.carePlanName}>{carePlanAssignment.care_plan_ids?.[0]?.plan_name || 'Chưa có'}</Text>
          <Text style={styles.carePlanCost}>
                Chi phí: {carePlanAssignment.care_plan_ids?.[0]?.monthly_price ? formatCurrency(carePlanAssignment.care_plan_ids[0].monthly_price) + '/tháng' : 'Chưa có'}
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: COLORS.success + '20' }]}
            textStyle={{ color: COLORS.success }}
          >
                {carePlanAssignment.status === 'active' ? 'Đang hoạt động' : 'Chưa có'}
          </Chip>
            </>
          ) : (
            <Text style={styles.noDataText}>Chưa có gói chăm sóc</Text>
          )}
        </Card.Content>
      </Card>
    </View>
  );

  const renderVitalSigns = () => (
    <View>
      {vitalSigns.length > 0 ? (
        vitalSigns.map((vital, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalDate}>{formatDateTime(vital.date_time)}</Text>
                <Text style={styles.staffInfo}>
                  Ghi nhận bởi: {vital.recorded_by?.full_name || 'Chưa có'}
                  {vital.recorded_by?.position ? ` (${vital.recorded_by.position})` : ''}
                </Text>
              </View>
              
              <View style={styles.vitalGrid}>
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="thermometer" size={20} color={COLORS.error} />
                  <Text style={styles.vitalLabel}>Nhiệt độ</Text>
                  <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.primary} />
                  <Text style={styles.vitalLabel}>Nhịp tim</Text>
                  <Text style={styles.vitalValue}>{vital.heart_rate} bpm</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="blood-bag" size={20} color={COLORS.accent} />
                  <Text style={styles.vitalLabel}>Huyết áp</Text>
                  <Text style={styles.vitalValue}>{vital.blood_pressure}</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="lungs" size={20} color={COLORS.secondary} />
                  <Text style={styles.vitalLabel}>Nhịp thở</Text>
                  <Text style={styles.vitalValue}>{vital.respiratory_rate}/phút</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="water-percent" size={20} color={COLORS.info} />
                  <Text style={styles.vitalLabel}>SpO2</Text>
                  <Text style={styles.vitalValue}>{vital.oxygen_level}%</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={COLORS.warning} />
                  <Text style={styles.vitalLabel}>Cân nặng</Text>
                  <Text style={styles.vitalValue}>{vital.weight} kg</Text>
                </View>
              </View>
              
              {vital.notes && (
                <View style={styles.vitalNotes}>
                  <Text style={styles.vitalNotesText}>{vital.notes}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu chỉ số sinh hiệu</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderAssessments = () => (
    <View>
      {assessments.length > 0 ? (
        assessments.map((assessment, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.assessmentHeader}>
                <Text style={styles.assessmentType}>{assessment.assessment_type}</Text>
                <Text style={styles.assessmentDate}>{formatDate(assessment.date)}</Text>
              </View>
              
              <Text style={styles.assessmentConductor}>
                Thực hiện bởi: {assessment.conducted_by?.full_name || 'Chưa có'}
                {assessment.conducted_by?.position ? ` (${assessment.conducted_by.position})` : ''}
              </Text>
              
              <Text style={styles.sectionSubtitle}>Ghi chú:</Text>
              <Text style={styles.assessmentText}>{assessment.notes}</Text>
              
              <Text style={styles.sectionSubtitle}>Khuyến nghị:</Text>
              <Text style={styles.assessmentText}>{assessment.recommendations}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu đánh giá</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderActivities = () => (
    <View>
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <Text style={styles.activityName}>{activity.activity_id?.activity_name || 'Chưa có'}</Text>
                <Chip
                  style={[
                    styles.attendanceChip,
                    { backgroundColor: activity.attendance_status === 'attended' ? COLORS.success + '20' : COLORS.warning + '20' }
                  ]}
                  textStyle={{
                    color: activity.attendance_status === 'attended' ? COLORS.success : COLORS.warning
                  }}
                >
                  {activity.attendance_status === 'attended' ? 'Đã tham gia' : 
                   activity.attendance_status === 'excused' ? 'Xin nghỉ' : 'Vắng mặt'}
                </Chip>
              </View>
              <Text style={styles.activityDate}>{activity.activity_id?.schedule_time ? formatDateTime(activity.activity_id.schedule_time) : 'Chưa có'}</Text>
              <Text style={styles.activityLocation}>Địa điểm: {activity.activity_id?.location || 'Chưa có'}</Text>
              <Text style={styles.activityNotes}>Mô tả: {activity.activity_id?.description || 'Chưa có'}</Text>
              <Text style={styles.staffInfo}>
                Hướng dẫn bởi: {activity.staff_id?.full_name || 'Chưa có'}
              </Text>
              <Text style={styles.activityNotes}>Ghi chú: {activity.performance_notes || 'Chưa có'}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu hoạt động</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderMedications = () => (
    <View>
      <Text style={styles.sectionSubtitle}>Thuốc hiện tại:</Text>
      {(residentData.current_medications || []).length > 0 ? (
        (residentData.current_medications || []).map((med, index) => (
          <Card key={`current-${index}`} style={styles.card}>
            <Card.Content>
              <View style={styles.medicationHeader}>
                <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.medication_name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                </View>
              </View>
              
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationFrequency}>Tần suất: {med.frequency}</Text>
                <Text style={styles.medicationFrequency}>Chỉ định: {med.indication || 'Chưa ghi rõ'}</Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có thuốc đang dùng</Text>
          </Card.Content>
        </Card>
      )}
      
      <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Lịch sử dùng thuốc:</Text>
      {medicationAdministrations.length > 0 ? (
        medicationAdministrations.map((medAdmin, index) => (
          <Card key={`admin-${index}`} style={styles.card}>
            <Card.Content>
              <View style={styles.medicationHeader}>
                <MaterialCommunityIcons 
                  name={medAdmin.status === 'administered' ? 'check-circle' : 
                        medAdmin.status === 'missed' ? 'close-circle' : 'clock'} 
                  size={24} 
                  color={medAdmin.status === 'administered' ? COLORS.success : 
                         medAdmin.status === 'missed' ? COLORS.error : COLORS.warning} 
                />
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medAdmin.medication_name}</Text>
                  <Text style={styles.medicationDosage}>{medAdmin.dosage_given}</Text>
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: medAdmin.status === 'administered' ? COLORS.success + '20' : 
                                      medAdmin.status === 'missed' ? COLORS.error + '20' : COLORS.warning + '20' }
                  ]}
                  textStyle={{
                    color: medAdmin.status === 'administered' ? COLORS.success : 
                           medAdmin.status === 'missed' ? COLORS.error : COLORS.warning
                  }}
                >
                  {medAdmin.status === 'administered' ? 'Đã dùng' : 
                   medAdmin.status === 'missed' ? 'Bỏ lỡ' : 
                   medAdmin.status === 'refused' ? 'Từ chối' : 'Trì hoãn'}
                </Chip>
              </View>
              
              <Text style={styles.staffInfo}>
                Cấp thuốc bởi: {medAdmin.staff_name} ({medAdmin.staff_position})
              </Text>
              
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationTime}>
                  Dự kiến: {formatDateTime(medAdmin.scheduled_time)}
                </Text>
                {medAdmin.actual_time && (
                  <Text style={styles.medicationTime}>
                    Thực tế: {formatDateTime(medAdmin.actual_time)}
                  </Text>
                )}
                {medAdmin.notes && (
                  <Text style={styles.medicationNotes}>{medAdmin.notes}</Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có lịch sử dùng thuốc</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'vitals':
        return renderVitalSigns();
      case 'assessments':
        return renderAssessments();
      case 'activities':
        return renderActivities();
      case 'medications':
        return renderMedications();
      default:
        return renderOverview();
    }
  };

  // Thêm log trước khi render
  useEffect(() => {
    if (!loading) {
      console.log('[FamilyResidentDetailScreen] residentData:', residentData);
      console.log('[FamilyResidentDetailScreen] vitalSigns:', vitalSigns);
      console.log('[FamilyResidentDetailScreen] assessments:', assessments);
      console.log('[FamilyResidentDetailScreen] activities:', activities);
      console.log('[FamilyResidentDetailScreen] medicationAdministrations:', medicationAdministrations);
      console.log('[FamilyResidentDetailScreen] carePlanAssignment:', carePlanAssignment);
      console.log('[FamilyResidentDetailScreen] bedInfo:', bedInfo);
    }
  }, [loading, residentData, vitalSigns, assessments, activities, medicationAdministrations, carePlanAssignment, bedInfo]);

  useEffect(() => {
    // Log mỗi lần render để kiểm tra state
    console.log('[FamilyResidentDetailScreen] residentData (in render):', residentData);
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin cư dân...</Text>
      </SafeAreaView>
    );
  }

  // Chỉ return lỗi nếu residentData là null hoặc không phải object
  if (!residentData || typeof residentData !== 'object') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialIcons name="error" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin cư dân</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: residentData.avatar }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{residentData.full_name}</Text>
            <Text style={styles.headerSubtext}>
              Phòng {residentData.room?.room_number} • {calculateAge(residentData.date_of_birth)} tuổi
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
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
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.error,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  careChip: {
    backgroundColor: COLORS.primary + '20',
  },
  medicalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRelation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phoneText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  carePlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  carePlanCost: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  vitalHeader: {
    marginBottom: 16,
  },
  vitalDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  vitalNotes: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  vitalNotesText: {
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assessmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  assessmentDate: {
    fontSize: 12,
    color: '#666',
  },
  assessmentConductor: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 16,
  },
  assessmentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  attendanceChip: {
    marginLeft: 8,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  activityNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  medicationDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  medicationFrequency: {
    fontSize: 14,
    color: '#666',
  },
  medicationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  medicationNotes: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  staffInfo: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default FamilyResidentDetailScreen; 