import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { COLORS, FONTS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock data tương tự như trong DB sample
const MOCK_ASSIGNMENTS = [
  {
    _id: '1',
    staff_id: 'nurse1',
    care_plan_ids: ['intensive_care', 'nutrition_support'],
    resident: {
      _id: 'resident1',
      full_name: 'Nguyễn Văn Nam',
      gender: 'male',
      care_level: 'intermediate',
      date_of_birth: '1950-05-15'
    },
    family_member_id: 'family1',
    registration_date: '2024-01-05',
    consultation_notes: 'Bệnh nhân cần chăm sóc tăng cường do tiểu đường và huyết áp cao. Gia đình mong muốn phòng có ít người để dễ thăm nom.',
    selected_room_type: '2_bed',
    assigned_room: {
      _id: 'room101',
      room_number: '101',
      room_type: '2_bed'
    },
    assigned_bed: {
      _id: 'bed101A',
      bed_number: '101-A'
    },
    main_care_plan: {
      _id: 'intensive_care',
      plan_name: 'Gói Chăm Sóc Tích Cực',
      plan_type: 'cham_soc_tich_cuc'
    },
    supplementary_plans: [
      {
        _id: 'nutrition_support',
        plan_name: 'Dịch Vụ Hỗ Trợ Dinh Dưỡng',
        plan_type: 'ho_tro_dinh_duong'
      }
    ],
    total_monthly_cost: 17000000,
    room_monthly_cost: 6500000,
    care_plans_monthly_cost: 10500000,
    start_date: '2024-01-10',
    end_date: '2024-04-10',
    status: 'active',
    payment_status: 'paid',
    notes: 'Đã hoàn tất thanh toán. Bệnh nhân đã ổn định trong gói chăm sóc.',
    created_at: '2024-01-05',
    updated_at: '2024-01-10'
  },
  {
    _id: '2',
    staff_id: 'doctor1',
    care_plan_ids: ['dementia_care', 'wound_care'],
    resident: {
      _id: 'resident2',
      full_name: 'Trần Thị Lan',
      gender: 'female',
      care_level: 'intensive',
      date_of_birth: '1948-12-03'
    },
    family_member_id: 'family2',
    registration_date: '2024-02-10',
    consultation_notes: 'Bệnh nhân mắc sa sút trí tuệ giai đoạn vừa, cần chăm sóc đặc biệt.',
    selected_room_type: '2_bed',
    assigned_room: {
      _id: 'room102',
      room_number: '102',
      room_type: '2_bed'
    },
    assigned_bed: {
      _id: 'bed102A',
      bed_number: '102-A'
    },
    main_care_plan: {
      _id: 'dementia_care',
      plan_name: 'Gói Chăm Sóc Sa Sút Trí Tuệ',
      plan_type: 'cham_soc_sa_sut_tri_tue'
    },
    supplementary_plans: [
      {
        _id: 'wound_care',
        plan_name: 'Chăm Sóc Vết Thương',
        plan_type: 'cham_soc_vet_thuong'
      }
    ],
    total_monthly_cost: 23000000,
    room_monthly_cost: 8000000,
    care_plans_monthly_cost: 15000000,
    start_date: '2024-02-15',
    end_date: '2024-05-15',
    status: 'active',
    payment_status: 'pending',
    notes: 'Gói chăm sóc đặc biệt cho sa sút trí tuệ, theo dõi chặt chẽ vết thương.',
    created_at: '2024-02-10',
    updated_at: '2024-02-15'
  }
];

const CarePlanAssignmentsScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAssignments(MOCK_ASSIGNMENTS);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đăng ký gói dịch vụ.');
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return COLORS.success;
      case 'consulting':
        return COLORS.warning;
      case 'pending':
        return COLORS.primary;
      case 'cancelled':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'consulting':
        return 'Đang tư vấn';
      case 'pending':
        return 'Chờ xử lý';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return 'Không xác định';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return COLORS.success;
      case 'pending':
        return COLORS.warning;
      case 'overdue':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'paid':
        return 'Đã thanh toán';
      case 'pending':
        return 'Chờ thanh toán';
      case 'overdue':
        return 'Quá hạn';
      default:
        return status;
    }
  };

  const getRoomTypeText = (roomType) => {
    switch (roomType) {
      case '2_bed': return 'Phòng 2 giường';
      case '3_bed': return 'Phòng 3 giường';
      case '4_5_bed': return 'Phòng 4-5 giường';
      case '6_8_bed': return 'Phòng 6-8 giường';
      default: return roomType;
    }
  };

  const getCareLevel = (level) => {
    switch (level) {
      case 'basic': return 'Cơ bản';
      case 'intermediate': return 'Trung bình';
      case 'intensive': return 'Tăng cường';
      case 'specialized': return 'Chuyên biệt';
      default: return level;
    }
  };

  const handleAssignmentPress = (assignment) => {
    Alert.alert(
      'Chi tiết đăng ký',
      `Cư dân: ${assignment.resident?.full_name || 'N/A'}\n` +
      `Gói chính: ${assignment.main_care_plan?.plan_name || 'N/A'}\n` +
      `Phòng: ${assignment.assigned_room?.room_number || 'N/A'}\n` +
      `Giường: ${assignment.assigned_bed?.bed_number || 'N/A'}\n` +
      `Tổng chi phí: ${formatPrice(assignment.total_monthly_cost)}\n` +
      `Trạng thái: ${getStatusText(assignment.status)}\n` +
      `Thanh toán: ${getPaymentStatusText(assignment.payment_status)}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
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
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Danh Sách Đăng Ký</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => navigation.navigate('CarePlanSelection')}
        >
          <Ionicons name="add" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {assignments.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="document-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Chưa có đăng ký gói dịch vụ</Text>
            <Text style={styles.emptySubtitle}>
              Nhấn nút + để tạo đăng ký gói dịch vụ mới
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('CarePlanSelection')}
            >
              <Text style={styles.emptyButtonText}>Tạo đăng ký mới</Text>
            </TouchableOpacity>
          </View>
        ) : (
          assignments.map((assignment) => (
            <TouchableOpacity
              key={assignment._id}
              style={styles.assignmentCard}
              onPress={() => handleAssignmentPress(assignment)}
            >
              {/* Header với thông tin cư dân */}
              <View style={styles.assignmentHeader}>
                <View style={styles.residentInfo}>
                  <Text style={styles.residentName}>{assignment.resident?.full_name}</Text>
                  <Text style={styles.residentDetails}>
                    {`${assignment.resident?.gender === 'male' ? 'Nam' : 'Nữ'} • ${getCareLevel(assignment.resident?.care_level)}`}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(assignment.status) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(assignment.status)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.assignmentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gói chính:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.main_care_plan?.plan_name}
                  </Text>
                </View>

                {assignment.supplementary_plans && assignment.supplementary_plans.length > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gói phụ:</Text>
                    <Text style={styles.detailValue}>
                      {assignment.supplementary_plans.map(plan => plan.plan_name).join(', ')}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loại phòng:</Text>
                  <Text style={styles.detailValue}>
                    {getRoomTypeText(assignment.selected_room_type)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phòng:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.assigned_room?.room_number || 'Chưa phân'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Giường:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.assigned_bed?.bed_number || 'Chưa phân'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ngày đăng ký:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(assignment.registration_date)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tổng chi phí:</Text>
                  <Text style={styles.costValue}>
                    {formatPrice(assignment.total_monthly_cost)}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.detailLabel}>Thanh toán:</Text>
                  <View style={[
                    styles.paymentBadge,
                    { backgroundColor: getPaymentStatusColor(assignment.payment_status) }
                  ]}>
                    <Text style={styles.paymentText}>
                      {getPaymentStatusText(assignment.payment_status)}
                    </Text>
                  </View>
                </View>
              </View>

              {assignment.consultation_notes && (
                <View style={styles.notesContainer}>
                  <Text style={styles.notesLabel}>Ghi chú tư vấn:</Text>
                  <Text style={styles.notesText} numberOfLines={2}>
                    {assignment.consultation_notes}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))
        )}
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
    fontSize: 16,
    color: COLORS.text,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  addButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
  assignmentCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  residentDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  assignmentDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  costValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
    flex: 2,
    textAlign: 'right',
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  notesContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  notesLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
});

export default CarePlanAssignmentsScreen; 