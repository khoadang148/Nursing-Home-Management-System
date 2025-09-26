import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import billsService from '../../api/services/billsService';
import roomTypeService from '../../api/services/roomTypeService';
import carePlanService from '../../api/services/carePlanService';
import paymentService from '../../api/services/paymentService';

const FamilyRegistrationReviewScreen = ({ route, navigation }) => {
  const { resident, admissionDateISO, endDateISO, selectedMainPlan, selectedSupplementaryPlans = [], selectedRoomType, selectedRoom, selectedBed, pricing } = route.params || {};
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentOptions, setShowPaymentOptions] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [createdBillId, setCreatedBillId] = useState(null);

  const formatPrice = (n) => new Intl.NumberFormat('vi-VN').format((n||0)*10000) + ' VNĐ';

  const calculated = useMemo(() => {
    try {
      const now = new Date();
      const admission = admissionDateISO ? new Date(admissionDateISO) : now;
      // Normalize times to local midnight to avoid off-by-one issues
      const todayLocal = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const admissionLocal = new Date(admission.getFullYear(), admission.getMonth(), admission.getDate(), 0, 0, 0, 0);
      
      // Admission date must be today or in the future, never in the past
      // Use admission date directly for calculation (not baseDate logic)
      const totalMonthly = pricing?.totalCost || ((selectedMainPlan?.monthly_price||0) + (selectedRoomType?.monthly_price||0) + selectedSupplementaryPlans.reduce((s,p)=>s+(p?.monthly_price||0),0));
      
      // First bill: remaining days of the month from admission date + 1 month deposit
      const daysInMonth = new Date(admissionLocal.getFullYear(), admissionLocal.getMonth()+1, 0).getDate();
      const remainingDays = daysInMonth - admissionLocal.getDate() + 1;
      const dailyRate = totalMonthly / daysInMonth; // tính theo đúng số ngày của tháng (28/29/30/31)
      const partialMonthAmount = Math.round(dailyRate * remainingDays);
      const depositAmount = totalMonthly;
      const totalAmount = Math.round(partialMonthAmount + depositAmount);
      const title = `Hóa đơn thanh toán tháng ${(admissionLocal.getMonth()+1).toString().padStart(2,'0')}/${admissionLocal.getFullYear()}`;
      const notes = 'Hóa đơn đăng ký dịch vụ tháng đầu + tiền cọc 1 tháng';
      // Due date requirement: 23:59 on the admission date (local time)
      const dueDate = new Date(
        admissionLocal.getFullYear(),
        admissionLocal.getMonth(),
        admissionLocal.getDate(),
        23,
        59,
        0,
        0
      );
      return { totalMonthly, partialMonthAmount, depositAmount, totalAmount, title, notes, dueDate, daysInMonth, remainingDays, dailyRate, admissionDate: admissionLocal };
    } catch (e) {
      return { totalMonthly: 0, partialMonthAmount: 0, depositAmount: 0, totalAmount: 0, title: '', notes: '', dueDate: new Date() };
    }
  }, [admissionDateISO, pricing, selectedMainPlan, selectedRoomType, selectedSupplementaryPlans]);

  const createBillAndPay = async () => {
    try {
      if (!resident?._id && !resident?.id) { Alert.alert('Lỗi', 'Thiếu thông tin cư dân'); return; }
      setSubmitting(true);
      // 1) Create care plan assignment (required by BE before creating bill)
      const plans = [selectedMainPlan, ...selectedSupplementaryPlans].filter(Boolean);
      const carePlanAssignmentPayload = {
        care_plan_ids: plans.map(p => p._id),
        resident_id: resident._id || resident.id,
        selected_room_type: selectedRoomType?.room_type,
        assigned_room_id: selectedRoom?._id,
        assigned_bed_id: selectedBed?._id,
        total_monthly_cost: pricing?.totalCost,
        room_monthly_cost: pricing?.roomCost,
        care_plans_monthly_cost: pricing?.carePlansCost,
        start_date: admissionDateISO || new Date().toISOString(),
        end_date: endDateISO || undefined,
        status: 'active',
      };

      const cleanedAssignment = Object.fromEntries(Object.entries(carePlanAssignmentPayload).filter(([_, v]) => v !== undefined && v !== null));
      const assignmentRes = await carePlanService.createCarePlanAssignment(cleanedAssignment);
      const carePlanAssignmentId = assignmentRes?._id || assignmentRes?.id || assignmentRes?.data?._id || assignmentRes?.data?.id;
      if (!carePlanAssignmentId) {
        throw new Error('Không thể tạo care plan assignment');
      }

      // 3) Create bed assignment
      const bedAssignmentPayload = {
        resident_id: resident._id || resident.id,
        bed_id: selectedBed._id,
        assigned_by: assignmentRes?.staff_id || assignmentRes?.data?.staff_id || null,
        status: 'pending', // Family requests are initially pending, admin needs to approve
      };
      
      const bedAssignmentRes = await carePlanService.createBedAssignment(bedAssignmentPayload);
      console.log('DEBUG - Bed assignment created successfully:', bedAssignmentRes);

      // 2) Create bill with care_plan_assignment_id
      const billPayload = {
        resident_id: resident._id || resident.id,
        care_plan_assignment_id: carePlanAssignmentId,
        amount: calculated.totalAmount,
        title: calculated.title,
        notes: calculated.notes,
        due_date: new Date(calculated.dueDate.getTime() - (7 * 60 * 60 * 1000)).toISOString(),
      };
      // Ensure staff_id is supplied as BE requires it
      // For family flow, backend may accept family_member_id instead of staff_id
      const staffIdForBill = assignmentRes?.staff_id || assignmentRes?.data?.staff_id || null;
      const familyMemberId = assignmentRes?.family_member_id || assignmentRes?.data?.family_member_id || resident?.family_member_id;
      // Use amount exactly as calculated (already in VND)
      const result = await billsService.createBill({ ...billPayload, staff_id: staffIdForBill, family_member_id: familyMemberId, amount: calculated.totalAmount });
      if (!result?.success) {
        throw new Error(result?.error || 'Không thể tạo hóa đơn');
      }
      const created = result.data || result;
      setCreatedBillId(created._id || created.id);
      setShowPaymentOptions(true);
    } catch (e) {
      console.error('Create bill & pay error', e);
      Alert.alert('Lỗi', 'Không thể khởi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác nhận & thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.content}>
        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleInactive]}>
              <Text style={[styles.progressNumber, styles.progressNumberInactive]}>1</Text>
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelInactive]}>Thông tin</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleInactive]}>
              <Text style={[styles.progressNumber, styles.progressNumberInactive]}>2</Text>
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelInactive]}>Gói & Phòng</Text>
          </View>
          <View style={[styles.progressLine, styles.progressLineActive]} />
          <View style={styles.progressStep}>
            <View style={[styles.progressCircle, styles.progressCircleActive]}>
              <Text style={[styles.progressNumber, styles.progressNumberActive]}>3</Text>
            </View>
            <Text style={[styles.progressLabel, styles.progressLabelActive]}>Thanh toán</Text>
          </View>
        </View>
        <Text style={styles.sectionTitle}>Người cao tuổi</Text>
        <View style={styles.card}><Text style={styles.rowText}>{resident?.full_name}</Text><Text style={styles.rowSub}>Giới tính: {resident?.gender === 'female' ? 'Nữ' : 'Nam'}</Text></View>
        <Text style={styles.sectionTitle}>Gói dịch vụ</Text>
        <View style={styles.card}><Text style={styles.rowText}>{selectedMainPlan?.plan_name}</Text><Text style={styles.rowPrice}>{formatPrice(selectedMainPlan?.monthly_price)}</Text></View>
        {selectedSupplementaryPlans.map(p => (
          <View key={p._id} style={styles.card}><Text style={styles.rowText}>+ {p.plan_name}</Text><Text style={styles.rowPrice}>{formatPrice(p.monthly_price)}</Text></View>
        ))}
        <Text style={styles.sectionTitle}>Phòng & Giường</Text>
        <View style={styles.card}><Text style={styles.rowText}>{selectedRoomType?.type_name}</Text><Text style={styles.rowPrice}>{formatPrice(selectedRoomType?.monthly_price)}</Text></View>
        <View style={styles.card}><Text style={styles.rowText}>Phòng {selectedRoom?.room_number} - Giường {selectedBed?.bed_number}</Text></View>
        <Text style={styles.sectionTitle}>Chi phí tháng</Text>
        <View style={styles.card}><Text style={styles.rowText}>Tổng tháng</Text><Text style={styles.rowPrice}>{formatPrice(calculated.totalMonthly)}</Text></View>
        <View style={styles.card}><Text style={styles.rowText}>Tháng đầu (tính theo ngày còn lại)</Text><Text style={styles.rowPrice}>{formatPrice(calculated.partialMonthAmount)}</Text></View>
        <View style={[styles.card, { flexDirection: 'column', gap: 4 }]}>
          <Text style={styles.calcNote}>Công thức:</Text>
          <Text style={styles.calcNote}>
            (Tổng tháng / Số ngày trong tháng) × Số ngày còn lại
          </Text>
          <Text style={styles.calcNote}>
            = ({formatPrice(calculated.totalMonthly)} / {calculated.daysInMonth}) × {calculated.remainingDays}
          </Text>
          <Text style={styles.calcNote}>= {formatPrice(calculated.partialMonthAmount)}</Text>
        </View>
        <View style={styles.card}><Text style={styles.rowText}>Tiền cọc 1 tháng</Text><Text style={styles.rowPrice}>{formatPrice(calculated.depositAmount)}</Text></View>
        <View style={[styles.card, { borderColor: COLORS.primary }]}> <Text style={[styles.rowText, { fontWeight: '700' }]}>Tổng thanh toán</Text><Text style={[styles.rowPrice, { color: COLORS.primary }]}>{formatPrice(calculated.totalAmount)}</Text></View>
        <TouchableOpacity disabled={submitting} onPress={createBillAndPay} style={[styles.submitButton, submitting && { opacity: 0.7 }]}>
          {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Thanh toán ngay</Text>}
        </TouchableOpacity>
      </ScrollView>
      {/* Payment Options Modal */}
      <Modal
        visible={showPaymentOptions}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowPaymentOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chọn phương thức thanh toán</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPaymentOptions(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.paymentOptionsContent}>
              <TouchableOpacity
                style={styles.paymentOption}
                onPress={async () => {
                  try {
                    setPaymentLoading(true);
                    const res = await paymentService.createPaymentLink(createdBillId, 'webview');
                    if (res?.success && res.data?.data?.checkoutUrl) {
                      setShowPaymentOptions(false);
                      navigation.replace('PaymentWebViewScreen', {
                        checkoutUrl: res.data.data.checkoutUrl,
                        billData: { id: createdBillId },
                      });
                    } else {
                      Alert.alert('Lỗi', 'Không thể tạo link thanh toán trong ứng dụng.');
                    }
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                disabled={paymentLoading}
              >
                <View style={styles.paymentOptionIcon}>
                  <Ionicons name="phone-portrait" size={32} color={COLORS.primary} />
                </View>
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionTitle}>Thanh toán trong ứng dụng</Text>
                  <Text style={styles.paymentOptionDescription}>
                    Thanh toán trực tiếp trong ứng dụng, không cần chuyển ra trình duyệt
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paymentOption}
                onPress={async () => {
                  try {
                    setPaymentLoading(true);
                    const res = await paymentService.createPaymentLink(createdBillId, 'web');
                    if (res?.success && res.data?.data?.checkoutUrl) {
                      setShowPaymentOptions(false);
                      const url = res.data.data.checkoutUrl;
                      const ok = await Linking.canOpenURL(url);
                      if (ok) await Linking.openURL(url);
                    } else {
                      Alert.alert('Lỗi', 'Không thể tạo link thanh toán qua trình duyệt.');
                    }
                  } finally {
                    setPaymentLoading(false);
                  }
                }}
                disabled={paymentLoading}
              >
                <View style={styles.paymentOptionIcon}>
                  <Ionicons name="globe" size={32} color={COLORS.primary} />
                </View>
                <View style={styles.paymentOptionContent}>
                  <Text style={styles.paymentOptionTitle}>Thanh toán qua trình duyệt</Text>
                  <Text style={styles.paymentOptionDescription}>
                    Mở trang thanh toán trong trình duyệt web
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color="#ccc" />
              </TouchableOpacity>

              {paymentLoading && (
                <View style={styles.paymentLoadingContainer}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                  <Text style={styles.paymentLoadingText}>Đang tạo link thanh toán...</Text>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  backButton: { padding: 8, marginRight: 8 },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#212529', flex: 1, textAlign: 'center', marginRight: 40 },
  content: { flex: 1, padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#212529', marginTop: 12, marginBottom: 8 },
  card: { backgroundColor: 'white', borderRadius: 10, borderWidth: 1, borderColor: '#e0e0e0', padding: 12, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  rowText: { fontSize: 14, color: '#212529' },
  rowSub: { fontSize: 13, color: '#6c757d', marginTop: 4 },
  rowPrice: { fontSize: 14, color: COLORS.primary, fontWeight: '700' },
  calcNote: { fontSize: 12, color: '#6c757d' },
  submitButton: { backgroundColor: COLORS.primary, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 12, marginBottom: 24 },
  submitText: { color: 'white', fontWeight: '700' },
  // Progress (compact)
  progressContainer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#f0f0f0', marginBottom: 8
  },
  progressStep: { alignItems: 'center', flex: 1 },
  progressCircle: { width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  progressCircleActive: { backgroundColor: COLORS.primary },
  progressCircleInactive: { backgroundColor: '#E0E0E0' },
  progressNumber: { fontSize: 11, fontWeight: 'bold' },
  progressNumberActive: { color: 'white' },
  progressNumberInactive: { color: '#9E9E9E' },
  progressLabel: { fontSize: 10, textAlign: 'center' },
  progressLabelActive: { color: COLORS.primary },
  progressLabelInactive: { color: '#9E9E9E' },
  progressLine: { height: 2, flex: 1, marginHorizontal: 6, marginBottom: 14 },
  progressLineActive: { backgroundColor: COLORS.primary },

  // Payment modal styles - matching BillDetailScreen
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0, // Bao phủ cả status bar
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  closeButton: {
    padding: 4,
  },
  paymentOptionsContent: {
    padding: 20,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  paymentOptionIcon: {
    marginRight: 16,
  },
  paymentOptionContent: {
    flex: 1,
  },
  paymentOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  paymentOptionDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
  },
  paymentLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  paymentLoadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6c757d',
  },
});

export default FamilyRegistrationReviewScreen;








