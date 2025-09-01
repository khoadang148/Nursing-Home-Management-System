import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';

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
      // Lấy danh sách care plan assignments từ API
      console.log('[CarePlanAssignmentsScreen] Fetching assignments...');
      const assignmentsResponse = await carePlanAssignmentService.getAllCarePlanAssignments();
      console.log('[CarePlanAssignmentsScreen] Assignments response:', assignmentsResponse);
      
      if (assignmentsResponse.success && assignmentsResponse.data) {
        console.log('[CarePlanAssignmentsScreen] Assignment data count:', assignmentsResponse.data.length);
        console.log('[CarePlanAssignmentsScreen] First assignment:', assignmentsResponse.data[0]);
        // Lọc ra những assignment có resident_id hợp lệ trước
        const validAssignments = assignmentsResponse.data.filter(assignment => {
          const isValid = assignment.resident_id && assignment.resident_id._id;
          if (!isValid) {
            console.log('[CarePlanAssignmentsScreen] Skipping assignment with null resident_id:', assignment._id);
          }
          return isValid;
        });
        
        console.log('[CarePlanAssignmentsScreen] Valid assignments count:', validAssignments.length);
        
        // Lấy thông tin bed assignments cho từng resident
        const assignmentsWithBedInfo = await Promise.all(
          validAssignments.map(async (assignment) => {
            try {
              const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(assignment.resident_id._id);
              if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                const bedAssignment = bedResponse.data[0]; // Lấy assignment đầu tiên (active)
                return {
                  ...assignment,
                  bed_info: bedAssignment
                };
              }
              return assignment;
            } catch (error) {
              console.error('Error fetching bed info for resident:', assignment.resident_id._id, error);
              return assignment;
            }
          })
        );
        
        setAssignments(assignmentsWithBedInfo);
        
        // Debug: Log thông tin về các assignment có vấn đề
        assignmentsWithBedInfo.forEach((assignment, index) => {
          const actualStatus = getActualStatus(assignment);
          const validStatuses = ['packages_selected', 'room_assigned', 'payment_completed', 'active', 'completed', 'cancelled', 'paused'];
          
          // Log tất cả assignments để debug
          console.log(`[CarePlanAssignmentsScreen] Assignment ${index + 1} (${assignment._id}):`);
          console.log(`  - Resident: ${assignment.resident_id?.full_name}`);
          console.log(`  - Original status: ${assignment.status}`);
          console.log(`  - Is valid status: ${validStatuses.includes(assignment.status)}`);
          console.log(`  - Resident status: ${assignment.resident_id?.status}`);
          console.log(`  - End date: ${assignment.end_date}`);
          console.log(`  - Bed unassigned: ${assignment.bed_info?.unassigned_date}`);
          console.log(`  - Calculated status: ${actualStatus}`);
          
          // Log cảnh báo nếu status không hợp lệ
          if (assignment.status && !validStatuses.includes(assignment.status)) {
            console.warn(`[CarePlanAssignmentsScreen] INVALID STATUS: ${assignment.status} for assignment ${assignment._id}`);
          }
        });
      } else {
        console.error('Failed to fetch assignments:', assignmentsResponse.error);
        setAssignments([]);
      }
    } catch (error) {
      console.error('Error loading assignments:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách đăng ký gói dịch vụ.');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price * 1000);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('vi-VN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'packages_selected':
        return COLORS.primary; // Xanh dương - đã chọn gói
      case 'room_assigned':
        return COLORS.warning; // Vàng - đã phân phòng
      case 'payment_completed':
        return COLORS.success; // Xanh lá - đã thanh toán
      case 'active':
        return COLORS.success; // Xanh lá - đang hoạt động
      case 'completed':
        return COLORS.success; // Xanh lá - đã hoàn thành
      case 'cancelled':
        return COLORS.error; // Đỏ - đã hủy
      case 'paused':
        return COLORS.warning; // Vàng - tạm dừng
      default:
        return COLORS.textSecondary; // Xám - không xác định
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'packages_selected':
        return 'Đã chọn gói';
      case 'room_assigned':
        return 'Đã phân phòng';
      case 'payment_completed':
        return 'Đã thanh toán';
      case 'active':
        return 'Đang hoạt động';
      case 'completed':
        return 'Đã hoàn thành';
      case 'cancelled':
        return 'Đã hủy';
      case 'paused':
        return 'Tạm dừng';
      default:
        return 'Không xác định';
    }
  };

  // Hàm xác định trạng thái thực tế dựa trên nhiều yếu tố
  const getActualStatus = (assignment) => {
    console.log('[CarePlanAssignmentsScreen] getActualStatus for assignment:', assignment._id);
    console.log('[CarePlanAssignmentsScreen] Assignment status:', assignment.status);
    console.log('[CarePlanAssignmentsScreen] Resident status:', assignment.resident_id?.status);
    console.log('[CarePlanAssignmentsScreen] End date:', assignment.end_date);
    console.log('[CarePlanAssignmentsScreen] Bed unassigned date:', assignment.bed_info?.unassigned_date);

    // 1. Ưu tiên cao nhất: Status của care plan assignment (nếu hợp lệ)
    const validStatuses = ['packages_selected', 'room_assigned', 'payment_completed', 'active', 'completed', 'cancelled', 'paused'];
    if (assignment.status && validStatuses.includes(assignment.status)) {
      console.log('[CarePlanAssignmentsScreen] Using valid assignment status:', assignment.status);
      return assignment.status;
    }

    // 2. Kiểm tra end_date - nếu đã hết hạn thì là completed
    if (assignment.end_date) {
      const endDate = new Date(assignment.end_date);
      const now = new Date();
      
      if (endDate < now) {
        console.log('[CarePlanAssignmentsScreen] Assignment completed based on end_date');
        return 'completed';
      }
    }

    // 3. Kiểm tra resident status - nếu resident đã xuất viện hoặc qua đời
    if (assignment.resident_id?.status) {
      const residentStatus = assignment.resident_id.status;
      if (residentStatus === 'discharged' || residentStatus === 'deceased') {
        console.log('[CarePlanAssignmentsScreen] Assignment completed due to resident status:', residentStatus);
        return 'completed';
      }
    }

    // 4. Kiểm tra bed assignment - nếu đã rời giường
    if (assignment.bed_info?.unassigned_date) {
      console.log('[CarePlanAssignmentsScreen] Assignment completed based on bed unassigned');
      return 'completed';
    }

    // 5. Mặc định là active nếu không có dấu hiệu gì khác
    console.log('[CarePlanAssignmentsScreen] Defaulting to active status');
    return 'active';
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



  const handleAssignmentPress = (assignment) => {
    const mainPlan = assignment.care_plan_ids?.find(plan => plan.category === 'main')?.plan_name || 
                     assignment.care_plan_ids?.[0]?.plan_name || 'N/A';
    const supplementaryPlans = assignment.care_plan_ids?.filter(plan => plan.category === 'supplementary')
                              .map(plan => plan.plan_name).join(', ') || 'Không có';
    
    const actualStatus = getActualStatus(assignment);
    
    Alert.alert(
      'Chi tiết đăng ký',
      `Cư dân: ${assignment.resident_id?.full_name || 'N/A'}\n` +
      `Gói chính: ${mainPlan}\n` +
      `Gói phụ: ${supplementaryPlans}\n` +
      `Phòng: ${assignment.bed_info?.bed_id?.room_id?.room_number || 'N/A'}\n` +
      `Giường: ${assignment.bed_info?.bed_id?.bed_number || 'N/A'}\n` +
      `Ngày bắt đầu: ${formatDate(assignment.start_date || assignment.registration_date || assignment.created_at)}\n` +
      `Ngày kết thúc: ${assignment.end_date ? formatDate(assignment.end_date) : 'Chưa có'}\n` +
      `Tổng chi phí: ${formatPrice(assignment.total_monthly_cost || 0)}\n` +
      `Trạng thái gốc: ${getStatusText(assignment.status)}\n` +
      `Trạng thái thực tế: ${getStatusText(actualStatus)}\n` +
      `Trạng thái cư dân: ${assignment.resident_id?.status || 'N/A'}\n` +
      `Ngày rời giường: ${assignment.bed_info?.unassigned_date ? formatDate(assignment.bed_info.unassigned_date) : 'N/A'}\n` +
      `Thanh toán: ${getPaymentStatusText(assignment.payment_status || 'pending')}`
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
                  <Text style={styles.residentName}>{assignment.resident_id?.full_name || 'Không có tên'}</Text>
                  <Text style={styles.residentDetails}>
                    {`${assignment.resident_id?.gender === 'male' ? 'Nam' : 'Nữ'}`}
                  </Text>
                </View>
                <View style={styles.statusContainer}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(getActualStatus(assignment)) }
                  ]}>
                    <Text style={styles.statusText}>
                      {getStatusText(getActualStatus(assignment))}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.assignmentDetails}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Gói chính:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.care_plan_ids && assignment.care_plan_ids.length > 0 
                      ? assignment.care_plan_ids.find(plan => plan.category === 'main')?.plan_name || assignment.care_plan_ids[0]?.plan_name || 'Chưa có'
                      : 'Chưa có'}
                  </Text>
                </View>

                {assignment.care_plan_ids && assignment.care_plan_ids.length > 1 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Gói phụ:</Text>
                    <Text style={styles.detailValue}>
                      {assignment.care_plan_ids
                        .filter(plan => plan && plan.category === 'supplementary')
                        .map(plan => plan.plan_name)
                        .join(', ') || 
                      assignment.care_plan_ids
                        .slice(1)
                        .filter(plan => plan && plan.plan_name)
                        .map(plan => plan.plan_name)
                        .join(', ')}
                    </Text>
                  </View>
                )}

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Loại phòng:</Text>
                  <Text style={styles.detailValue}>
                    {getRoomTypeText(assignment.selected_room_type || 'Chưa chọn')}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phòng:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.bed_info?.bed_id?.room_id?.room_number || 'Chưa phân'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Giường:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.bed_info?.bed_id?.bed_number || 'Chưa phân'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ngày bắt đầu:</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(assignment.start_date || assignment.registration_date || assignment.created_at)}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Ngày kết thúc:</Text>
                  <Text style={styles.detailValue}>
                    {assignment.end_date ? formatDate(assignment.end_date) : 'Chưa có'}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tổng chi phí:</Text>
                  <Text style={styles.costValue}>
                    {formatPrice(assignment.total_monthly_cost || 0)}
                  </Text>
                </View>

                <View style={styles.paymentRow}>
                  <Text style={styles.detailLabel}>Thanh toán:</Text>
                  <View style={[
                    styles.paymentBadge,
                    { backgroundColor: getPaymentStatusColor(assignment.payment_status || 'pending') }
                  ]}>
                    <Text style={styles.paymentText}>
                      {getPaymentStatusText(assignment.payment_status || 'pending')}
                    </Text>
                  </View>
                </View>
              </View>

              {assignment.consultation_notes && assignment.consultation_notes.trim() && (
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      },
    }),
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