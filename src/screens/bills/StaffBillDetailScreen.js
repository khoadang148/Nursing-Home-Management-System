import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import billsService from '../../api/services/billsService';
import roomTypeService from '../../api/services/roomTypeService';
import { formatCurrency, formatDate, getDaysRemaining } from '../../utils/helpers';
import { COLORS } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const StaffBillDetailScreen = ({ route, navigation }) => {
  const { billId, billData } = route.params;
  const [bill, setBill] = useState(billData || null);
  const [loading, setLoading] = useState(!billData);
  const [exportLoading, setExportLoading] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [matchedRoomType, setMatchedRoomType] = useState(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!billData) {
      fetchBillDetail();
    }
    fetchRoomTypes();
  }, [billId, billData]);

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      const response = await billsService.getBillById(billId);
      if (response.success) {
        setBill(response.data);
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin hóa đơn');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching bill detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hóa đơn');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomTypes = async () => {
    try {
      const typesRes = await roomTypeService.getAllRoomTypes();
      const types = typesRes.data || typesRes;
      setRoomTypes(types);
      
      // Tìm room type phù hợp nếu có
      if (bill && bill.care_plan_assignment_id) {
        const assignment = bill.care_plan_assignment_id;
        const roomTypeCode = assignment?.assigned_room_id?.room_type || assignment?.selected_room_type;
        if (roomTypeCode && types && Array.isArray(types)) {
          const matched = types.find(rt => rt.room_type === roomTypeCode);
          setMatchedRoomType(matched);
        }
      }
    } catch (error) {
      console.error('Error fetching room types:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBillDetail();
      await fetchRoomTypes();
    } catch (error) {
      console.error('Error refreshing bill detail:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      const result = await billsService.billingService.exportBillPDF(bill._id);
      Alert.alert(
        'Xuất hóa đơn',
        'Hóa đơn đã được xuất thành công. Bạn có muốn tải xuống không?',
        [
          {
            text: 'Hủy',
            style: 'cancel',
          },
          {
            text: 'Tải xuống',
            onPress: () => {
              console.log('Download PDF:', result.url);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xuất hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setExportLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin hóa đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin hóa đơn</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Sử dụng trạng thái từ API thay vì tự tính toán
  const isOverdue = bill.status === 'overdue';
  const daysRemaining = getDaysRemaining(bill.due_date);

  // Lấy thông tin từ bill (đã populate)
  const assignment = bill.care_plan_assignment_id;
  const carePlans = assignment?.care_plan_ids || [];
  const room = assignment?.assigned_room_id;
  const bed = assignment?.assigned_bed_id;
  const residentName = bill.resident_id?.full_name || 'Không rõ';
  const roomNumber = room?.room_number || 'Chưa phân';
  const bedNumber = bed?.bed_number || 'Chưa phân';
  const bedTypeRaw = bed?.bed_type || '';
  
  // Chuyển bedType sang tiếng Việt
  const bedType =
    bedTypeRaw === 'standard' ? 'Tiêu chuẩn'
    : bedTypeRaw === 'electric' ? 'Điện'
    : bedTypeRaw === 'medical' ? 'Y tế'
    : bedTypeRaw === 'vip' ? 'VIP'
    : bedTypeRaw === 'special' ? 'Đặc biệt'
    : bedTypeRaw || '';

  // Kỳ thanh toán: lấy tháng/năm của hạn thanh toán
  const periodDisplay = bill.due_date ? `${new Date(bill.due_date).getMonth() + 1}/${new Date(bill.due_date).getFullYear()}` : 'N/A';

  const getItemIcon = (category) => {
    switch (category) {
      case 'main':
        return 'heart-outline';
      case 'room':
        return 'bed-outline';
      case 'supplementary':
        return 'add-circle-outline';
      case 'medication':
        return 'bandage-outline';
      default:
        return 'document-outline';
    }
  };

  const getNotesIcon = (notes) => {
    const lowerNotes = notes.toLowerCase();
    if (lowerNotes.includes('cọc') || lowerNotes.includes('deposit')) {
      return 'card-outline';
    } else if (lowerNotes.includes('tháng') || lowerNotes.includes('month')) {
      return 'calendar-outline';
    } else if (lowerNotes.includes('phí') || lowerNotes.includes('fee') || lowerNotes.includes('cost')) {
      return 'calculator-outline';
    } else if (lowerNotes.includes('đặc biệt') || lowerNotes.includes('special')) {
      return 'star-outline';
    } else {
      return 'chatbubble-ellipses-outline';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Chi tiết hóa đơn</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleExportPDF}
            disabled={loading}
          >
            <Ionicons name="share-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Header Compact */}
        <View style={styles.header}>
          {/* Title and Status Row */}
          <View style={styles.headerRow}>
            <Text style={styles.title}>{bill.title}</Text>
            <View style={[
              styles.statusBadge,
              { 
                backgroundColor: bill.status === 'paid' 
                  ? '#4CAF50'    // Xanh lá - Đã thanh toán
                  : isOverdue 
                    ? '#F44336'  // Đỏ - Quá hạn
                    : '#FFA000'  // Cam - Chờ thanh toán
              }
            ]}>
              <Text style={styles.statusText}>
                {bill.status === 'paid' 
                  ? 'Đã thanh toán' 
                  : isOverdue 
                    ? 'Quá hạn' 
                    : 'Chờ thanh toán'}
              </Text>
            </View>
          </View>
          
          {/* Resident Info Row */}
          <View style={styles.residentInfoRow}>
            <View style={styles.residentInfoHeader}>
              <Ionicons name="person" size={16} color="#666" />
              <Text style={styles.residentNameHeader}>{residentName}</Text>
              <Text style={styles.roomNumberHeader}> • Phòng {roomNumber}{bedNumber !== 'Chưa phân' ? ` - Giường ${bedNumber}` : ''}</Text>
            </View>
          </View>
          
          {/* Amount Row */}
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Tổng tiền:</Text>
            <Text style={styles.amountText}>{formatCurrency(bill.amount)}</Text>
          </View>
        </View>

        {/* Bill Info Compact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin hóa đơn</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Hạn thanh toán</Text>
                <Text style={[styles.value, isOverdue && styles.overdueText]}>
                  {formatDate(bill.due_date)}
                </Text>
                {bill.status !== 'paid' && (
                  <Text style={[
                    styles.daysRemaining, 
                    isOverdue && styles.overdueText,
                    (!isOverdue && daysRemaining === 0) && styles.dueTodayText
                  ]}>
                    {isOverdue 
                      ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                      : daysRemaining === 0 
                        ? 'Đến hạn hôm nay'
                        : `Còn ${daysRemaining} ngày`}
                  </Text>
                )}
              </View>
              
              <View style={styles.infoItem}>
                <Text style={styles.label}>Kỳ thanh toán</Text>
                <Text style={styles.value}>{periodDisplay}</Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={styles.label}>Ngày tạo</Text>
                <Text style={styles.value}>{formatDate(bill.created_at)}</Text>
              </View>
              
              {bill.status === 'paid' && (
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Ngày thanh toán</Text>
                  <Text style={styles.value}>{formatDate(bill.paid_date)}</Text>
                </View>
              )}
            </View>

            {bill.status === 'paid' && (
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <Text style={styles.label}>Phương thức thanh toán</Text>
                  <Text style={styles.value}>
                    {bill.payment_method === 'card' 
                      ? 'Thẻ ngân hàng' 
                      : bill.payment_method === 'wallet' 
                        ? 'Ví điện tử' 
                        : bill.payment_method === 'qr_payment' 
                          ? 'QR Code' 
                          : 'Chuyển khoản'}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Bill Notes Section */}
        {bill.notes && bill.notes.trim() !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <View style={styles.notesContainer}>
              <TouchableOpacity 
                style={styles.notesHeader}
                onPress={() => setNotesExpanded(!notesExpanded)}
                activeOpacity={0.7}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={getNotesIcon(bill.notes)} size={20} color="#6c757d" style={styles.notesIcon} />
                  <Text style={styles.notesLabel}>Thông tin bổ sung</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {bill.created_at && (
                    <Text style={styles.notesTimestamp}>
                      {new Date(bill.created_at).toLocaleDateString('vi-VN')}
                    </Text>
                  )}
                  <Ionicons 
                    name={notesExpanded ? 'chevron-up' : 'chevron-down'} 
                    size={16} 
                    color="#6c757d" 
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </TouchableOpacity>
              <View style={[styles.notesContent, { display: notesExpanded ? 'flex' : 'none' }]}>
                <Text style={styles.notesText}>{bill.notes}</Text>
              </View>
              {!notesExpanded && bill.notes.length > 100 && (
                <View style={styles.notesPreview}>
                  <Text style={styles.notesText}>
                    {bill.notes.substring(0, 100)}...
                  </Text>
                  <View style={styles.notesActions}>
                    <Text style={styles.notesCharCount}>
                      {bill.notes.length - 100} ký tự còn lại
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setNotesExpanded(true)}
                      style={styles.expandButton}
                    >
                      <Text style={styles.expandButtonText}>Xem thêm</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
              {!notesExpanded && bill.notes.length <= 100 && (
                <View style={styles.notesContent}>
                  <Text style={styles.notesText}>{bill.notes}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Bill Details Compact */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
          {/* Hiển thị các gói dịch vụ */}
          {carePlans.length > 0 && carePlans.map((plan) => (
            <View 
              key={plan._id}
              style={[
                styles.itemCard,
                {
                  backgroundColor: plan.category === 'main' ? '#e3f2fd' : '#e8f5e8',
                  borderLeftColor: plan.category === 'main' ? '#1976d2' : '#4caf50',
                  borderWidth: plan.category === 'main' ? 1.5 : 1,
                  borderColor: plan.category === 'main' ? '#1976d2' : '#4caf50',
                  elevation: plan.category === 'main' ? 3 : 1,
                  shadowColor: plan.category === 'main' ? '#1976d2' : '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.15,
                  shadowRadius: 4,
                }
              ]}
            >
              <View style={styles.itemTitleRow}>
                <Ionicons 
                  name={plan.category === 'main' ? 'heart-outline' : 'add-circle-outline'} 
                  size={20} 
                  color={plan.category === 'main' ? '#1976d2' : '#4caf50'}
                  style={styles.itemIcon}
                />
                <View style={styles.itemContent}>
                  <Text style={[
                    styles.itemName,
                    plan.category === 'main' && { fontWeight: 'bold', color: '#1976d2' }
                  ]}>{plan.plan_name} ({plan.category === 'main' ? 'Gói chính' : 'Gói phụ'})</Text>
                  {plan.description && (
                    <Text style={[
                      styles.itemDescription,
                      plan.category === 'main' && { fontWeight: '500', color: '#1976d2' }
                    ]}>{plan.description}</Text>
                  )}
                </View>
              </View>
              <View style={styles.itemAmountContainer}>
                <Text style={[
                  styles.itemAmount,
                  plan.category === 'main' && { fontWeight: 'bold', color: '#1976d2', fontSize: 17 }
                ]}>{formatCurrency(plan.monthly_price)}</Text>
              </View>
            </View>
          ))}
          
          {/* Hiển thị thông tin phòng và giường */}
          {room && (
            <>
              {/* Ô phòng */}
              <View style={[
                styles.itemCard,
                { backgroundColor: '#f3e5f5', borderLeftColor: '#9c27b0', marginBottom: 12, flexDirection: 'column' }
              ]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="home-outline" size={20} color="#9c27b0" style={styles.itemIcon} />
                  <Text style={styles.itemName}>
                    Phòng: {roomNumber}
                    {matchedRoomType ? ` (${matchedRoomType.type_name})` : ''}
                  </Text>
                </View>
                {/* Mô tả và tiện ích */}
                {matchedRoomType && (
                  <View style={{ marginTop: 4, marginLeft: 28 }}>
                    {matchedRoomType.description && (
                      <Text style={styles.itemDescription}>{matchedRoomType.description}</Text>
                    )}
                    {matchedRoomType.amenities && matchedRoomType.amenities.length > 0 && (
                      <Text style={styles.itemDescription}>Tiện ích: {matchedRoomType.amenities.join(', ')}</Text>
                    )}
                  </View>
                )}
                {/* Giá tiền phòng */}
                {matchedRoomType && (
                  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                    <Text style={[styles.itemAmount, { fontWeight: 'bold', color: COLORS.primary, fontSize: 16 }]}> 
                      {formatCurrency(matchedRoomType.monthly_price)}
                    </Text>
                  </View>
                )}
              </View>
              {/* Ô giường */}
              {bedNumber !== 'Chưa phân' && (
                <View style={[
                  styles.itemCard,
                  { backgroundColor: '#fff3e0', borderLeftColor: '#ff9800', flexDirection: 'row', alignItems: 'center', marginBottom: 12, justifyContent: 'space-between' }
                ]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                    <Ionicons name="bed-outline" size={20} color="#ff9800" style={styles.itemIcon} />
                    <Text style={styles.itemName}>
                      Giường: {bedNumber} {bedType ? `(${bedType})` : ''}
                    </Text>
                  </View>
                </View>
              )}
            </>
          )}
          
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng cộng:</Text>
            <Text style={styles.totalAmount}>{formatCurrency(bill.amount)}</Text>
          </View>
        </View>

        {/* Payment Policy Link */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.policyButton}
            onPress={() => setShowPolicyModal(true)}
          >
            <Ionicons name="document-text-outline" size={20} color={COLORS.primary} />
            <Text style={styles.policyButtonText}>Xem chính sách thanh toán</Text>
            <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        {/* Action Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.exportButton, { borderColor: COLORS.primary }]}
            onPress={handleExportPDF}
            disabled={exportLoading}
          >
            {exportLoading ? (
              <ActivityIndicator color={COLORS.primary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={18} color={COLORS.primary} />
                <Text style={[styles.exportButtonText, { color: COLORS.primary }]}>
                  Xuất hóa đơn
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Payment Policy Modal */}
      <Modal
        visible={showPolicyModal}
        animationType="slide"
        transparent={true}
        statusBarTranslucent={true}
        onRequestClose={() => setShowPolicyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chính sách thanh toán</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPolicyModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.policyContent}>
              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>1. Thời hạn thanh toán</Text>
                <Text style={styles.policyText}>
                  • Thanh toán được thực hiện hàng tháng từ ngày 1 đến ngày 5 của mỗi tháng{'\n'}
                  • Hóa đơn phải được thanh toán trước ngày hết hạn{'\n'}
                  • Nếu quá hạn, nhân viên sẽ liên hệ trao đổi với gia đình để tìm hiểu lý do{'\n'}
                  • Nếu không thanh toán, viện sẽ trao trả lại người cao tuổi cho gia đình
                </Text>
              </View>

              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>2. Phương thức thanh toán</Text>
                <Text style={styles.policyText}>
                  • Đợt đăng ký đầu tiên: Thanh toán tại quầy nhân viên bằng chuyển khoản{'\n'}
                  • Các tháng tiếp theo: Có thể thanh toán online qua QR Code hoặc tại quầy{'\n'}
                  • Hỗ trợ tất cả ví điện tử và ứng dụng ngân hàng{'\n'}
                  • Giao dịch được xác nhận tự động
                </Text>
              </View>

              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>3. Cơ sở tính phí</Text>
                <Text style={styles.policyText}>
                  • Dịch vụ chính: Chăm sóc cơ bản theo gói đã đăng ký (bắt buộc){'\n'}
                  • Phí phòng: Theo loại phòng và tiện nghi (bắt buộc){'\n'}
                  • Dịch vụ bổ sung: Các dịch vụ y tế, vật lý trị liệu (tùy chọn){'\n'}
                  • Thuốc bổ sung: Thuốc không trong gói cơ bản (tùy chọn){'\n'}
                  • Chi phí được tính dựa trên số ngày thực tế người cao tuổi lưu trú tại viện
                </Text>
              </View>

              <View style={styles.policySection}>
                <Text style={styles.policySectionTitle}>4. Chính sách hoàn tiền</Text>
                <Text style={styles.policyText}>
                  • Hoàn tiền chỉ áp dụng khi gia đình hủy gói dịch vụ và đến nhận người thân{'\n'}
                  • Thời gian hoàn tiền: Trong vòng 7 ngày làm việc kể từ khi nhận người thân về.{'\n'}
                  • Công thức hoàn tiền: Tiền đã đóng - (Tổng phí dịch vụ ÷ 30 ngày) × Số ngày thực tế ở viện{'\n'}
                  • Tiền cọc 1 tháng ban đầu sẽ được hoàn lại cùng với số tiền dư{'\n'}
                </Text>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={styles.policyCloseButton}
              onPress={() => setShowPolicyModal(false)}
            >
              <Text style={styles.policyCloseButtonText}>Đã hiểu</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  headerRight: {
    position: 'absolute',
    right: 16,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    marginRight: 12,
  },
  residentInfoRow: {
    marginBottom: 12,
  },
  residentInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentNameHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginLeft: 4,
  },
  roomNumberHeader: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 80,
    alignItems: 'center',
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  amountLabel: {
    fontSize: 16,
    color: '#6c757d',
  },
  amountText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#212529',
  },
  infoGrid: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    marginRight: 16,
  },
  label: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212529',
  },
  overdueText: {
    color: '#dc3545',
  },
  dueTodayText: {
    color: '#FF9800',
  },
  daysRemaining: {
    fontSize: 13,
    color: '#6c757d',
    marginTop: 2,
  },
  itemCard: {
    padding: 12,
    borderLeftWidth: 4,
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  itemTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  itemContent: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 13,
    color: '#6c757d',
    lineHeight: 18,
  },
  itemAmountContainer: {
    alignItems: 'flex-end',
    paddingTop: 4,
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  policyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dee2e6',
  },
  policyButtonText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '500',
    marginLeft: 8,
  },
  buttonContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  exportButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  exportButtonText: {
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 0,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: screenWidth * 0.9,
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
  // Policy Modal Styles
  policyContent: {
    maxHeight: 400,
    padding: 16,
  },
  policySection: {
    marginBottom: 16,
  },
  policySectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  policyText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20,
  },
  policyCloseButton: {
    margin: 16,
    padding: 12,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    alignItems: 'center',
  },
  policyCloseButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  // Loading and Error States
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Notes section styles
  notesContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  notesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    justifyContent: 'space-between',
  },
  notesIcon: {
    marginRight: 8,
  },
  notesLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
    flex: 1,
  },
  notesTimestamp: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  notesContent: {
    paddingLeft: 4,
  },
  notesText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 22,
    textAlign: 'justify',
  },
  expandButton: {
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  expandButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  notesPreview: {
    paddingTop: 8,
  },
  notesActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  notesCharCount: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
  },
});

export default StaffBillDetailScreen; 