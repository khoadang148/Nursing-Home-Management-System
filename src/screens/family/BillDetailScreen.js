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
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import billsService from '../../api/services/billsService';
import roomTypeService from '../../api/services/roomTypeService';
import paymentService from '../../api/services/paymentService';
import { formatDate, isExpired, getDaysRemaining } from '../../utils/helpers';
import { COLORS } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

const BillDetailScreen = ({ route, navigation }) => {
  const { billId, bedAssignment: bedAssignmentFromList } = route.params;
  const { colors } = useTheme();
  const [bill, setBill] = useState(null);

  // Hàm format giá tiền mới
  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    return new Intl.NumberFormat('vi-VN').format(amount * 10000) + ' VNĐ';
  };
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [bedAssignment, setBedAssignment] = useState(bedAssignmentFromList || null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [matchedRoomType, setMatchedRoomType] = useState(null);
  const [notesExpanded, setNotesExpanded] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [additionalCarePlans, setAdditionalCarePlans] = useState([]);
  const [loadingCarePlans, setLoadingCarePlans] = useState(false);

  useEffect(() => {
    fetchBillDetail();
  }, [billId]);

  // Fetch care plans từ API nếu bill không có assignment
  useEffect(() => {
    const fetchCarePlansFromAPI = async () => {
      if (bill && bill.resident_id?._id && (!bill.care_plan_assignment_id)) {
        setLoadingCarePlans(true);
        try {
          console.log('[BillDetailScreen] Fetching care plans from API for resident:', bill.resident_id._id);
          const response = await billsService.billingService.getCarePlanAssignmentByResident(bill.resident_id._id);
          console.log('[BillDetailScreen] Care plan assignment response:', response);
          
          if (response && Array.isArray(response) && response.length > 0) {
            // Lấy assignment đầu tiên và care_plan_ids của nó
            const assignment = response[0];
            if (assignment && assignment.care_plan_ids && assignment.care_plan_ids.length > 0) {
              setAdditionalCarePlans(assignment.care_plan_ids);
              console.log('[BillDetailScreen] Set additional care plans:', assignment.care_plan_ids);
            } else {
              console.log('[BillDetailScreen] No care plans found in assignment');
            }
          } else if (response && response.care_plan_ids && response.care_plan_ids.length > 0) {
            // Nếu response trực tiếp là assignment object
            setAdditionalCarePlans(response.care_plan_ids);
            console.log('[BillDetailScreen] Set additional care plans:', response.care_plan_ids);
          } else {
            console.log('[BillDetailScreen] No care plans found from API');
          }
        } catch (error) {
          console.error('[BillDetailScreen] Error fetching care plans:', error);
        } finally {
          setLoadingCarePlans(false);
        }
      }
    };
    
    fetchCarePlansFromAPI();
  }, [bill?.resident_id?._id, bill?.care_plan_assignment_id]);

  useEffect(() => {
    const fetchBed = async () => {
      if (!bedAssignment && bill && bill.resident_id?._id) {
        const assignment = await billsService.billingService.getBedAssignmentByResident(bill.resident_id._id);
        setBedAssignment(assignment);
        const typesRes = await roomTypeService.getAllRoomTypes();
        console.log('[BillDetailScreen] API room-types:', typesRes);
        const types = typesRes.data || typesRes;
        setRoomTypes(types);
        // Lấy đúng room_type code để đối chiếu
        const roomTypeCode =
          assignment?.bed_id?.room_id?.room_type ||
          assignment?.room_type ||
          assignment?.selected_room_type;
        console.log('[BillDetailScreen] roomTypeCode:', roomTypeCode);
        if (roomTypeCode && types && Array.isArray(types)) {
          const matched = types.find(rt => rt.room_type === roomTypeCode);
          console.log('[BillDetailScreen] matchedRoomType:', matched);
          setMatchedRoomType(matched);
        } else {
          setMatchedRoomType(null);
        }
      } else if (bedAssignment) {
        const typesRes = await roomTypeService.getAllRoomTypes();
        console.log('[BillDetailScreen] API room-types:', typesRes);
        const types = typesRes.data || typesRes;
        setRoomTypes(types);
        const roomTypeCode =
          bedAssignment?.bed_id?.room_id?.room_type ||
          bedAssignment?.room_type ||
          bedAssignment?.selected_room_type;
        console.log('[BillDetailScreen] roomTypeCode:', roomTypeCode);
        if (roomTypeCode && types && Array.isArray(types)) {
          const matched = types.find(rt => rt.room_type === roomTypeCode);
          console.log('[BillDetailScreen] matchedRoomType:', matched);
          setMatchedRoomType(matched);
        } else {
          setMatchedRoomType(null);
        }
      }
    };
    fetchBed();
  }, [bill, bedAssignment]);

  const fetchBillDetail = async () => {
    try {
      setLoading(true);
      const billData = await billsService.billingService.getBillDetail(billId);
      console.log('[BillDetailScreen] Bill data received:', JSON.stringify(billData, null, 2));
      console.log('[BillDetailScreen] Assignment:', billData?.care_plan_assignment_id);
      console.log('[BillDetailScreen] Care plans:', billData?.care_plan_assignment_id?.care_plan_ids);
      setBill(billData);
    } catch (error) {
      console.error('Error fetching bill detail:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hóa đơn');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchBillDetail();
      // Cũng refresh bed assignment data nếu cần
      if (bill && bill.resident_id?._id) {
        const assignment = await billsService.billingService.getBedAssignmentByResident(bill.resident_id._id);
        setBedAssignment(assignment);
      }
    } catch (error) {
      console.error('Error refreshing bill detail:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const [showPaymentOptions, setShowPaymentOptions] = useState(false);

  const handlePayment = async () => {
    setShowPaymentOptions(true);
  };

  const handlePaymentInApp = async () => {
    try {
      setPaymentLoading(true);
      setShowPaymentOptions(false);
      
      // Tạo payment link từ PayOS cho WebView
      const result = await paymentService.createPaymentLink(bill._id, 'webview');
      
      if (result.success && result.data?.data?.checkoutUrl) {
        const checkoutUrl = result.data.data.checkoutUrl;
        
        // Navigate to WebView screen
        navigation.navigate('PaymentWebViewScreen', {
          checkoutUrl,
          billData: {
            id: bill._id,
            amount: bill.total_amount,
            orderCode: bill.order_code || `BILL_${bill._id}`,
            residentName: bill.resident_id?.full_name,
            period: bill.due_date ? `${new Date(bill.due_date).getMonth() + 1}/${new Date(bill.due_date).getFullYear()}` : 'N/A',
          },
          onPaymentComplete: async (status, billData) => {
            // Handle payment completion
            if (status === 'success') {
              // Reload bill data to check if webhook updated the status
              console.log('🔄 Payment success detected, reloading bill data...');
              await fetchBillDetail();
              
              // Navigate directly to PaymentResult without Alert
              navigation.navigate('PaymentResult', {
                billId: bill._id,
                paymentStatus: 'success',
                paymentData: {
                  transaction_id: billData?.orderCode || 'N/A',
                  payment_method: 'PayOS',
                  amount: billData?.amount || 0,
                  timestamp: new Date().toISOString(),
                }
              });
            } else if (status === 'cancel') {
              Alert.alert(
                'Thanh toán đã hủy',
                'Bạn đã hủy quá trình thanh toán.',
                [{ text: 'OK' }]
              );
            } else {
              Alert.alert(
                'Thanh toán thất bại',
                'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.',
                [{ text: 'OK' }]
              );
            }
          }
        });
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tạo link thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentInBrowser = async () => {
    try {
      setPaymentLoading(true);
      setShowPaymentOptions(false);
      
      // Tạo payment link từ PayOS cho browser
      const result = await paymentService.createPaymentLink(bill._id, 'web');
      
      if (result.success && result.data?.data?.checkoutUrl) {
        // Mở PayOS checkout URL trong browser
        const checkoutUrl = result.data.data.checkoutUrl;
        const supported = await Linking.canOpenURL(checkoutUrl);
        
        if (supported) {
          await Linking.openURL(checkoutUrl);
          
          // Hiển thị thông báo hướng dẫn
          Alert.alert(
            'Thanh toán',
            'Đã mở trang thanh toán PayOS trong trình duyệt. Vui lòng hoàn tất thanh toán và quay lại ứng dụng.',
            [
              {
                text: 'Đã hiểu',
                onPress: () => {
                  // Có thể thêm logic để kiểm tra trạng thái thanh toán sau khi quay lại
                }
              }
            ]
          );
        } else {
          Alert.alert('Lỗi', 'Không thể mở trang thanh toán. Vui lòng thử lại.');
        }
      } else {
        Alert.alert('Lỗi', result.error || 'Không thể tạo link thanh toán. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau.');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải thông tin hóa đơn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!bill) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={64} color="#ccc" />
          <Text style={styles.errorText}>Không tìm thấy thông tin hóa đơn</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Tính toán trạng thái thực tế dựa trên due date
  const daysRemaining = getDaysRemaining(bill.due_date);
  const isOverdue = bill.status === 'overdue' || (bill.status === 'pending' && daysRemaining < 0);

  // Lấy thông tin assignment, care plans, room, bed từ bill (đã populate)
  const assignment = bill.care_plan_assignment_id;
  
  // Lấy care plans từ assignment hoặc từ API
  let carePlans = assignment?.care_plan_ids || [];
  const finalCarePlans = carePlans.length > 0 ? carePlans : additionalCarePlans;
  
  console.log('[BillDetailScreen] Render - Assignment:', assignment);
  console.log('[BillDetailScreen] Render - Care plans from assignment:', carePlans);
  console.log('[BillDetailScreen] Render - Additional care plans:', additionalCarePlans);
  console.log('[BillDetailScreen] Render - Final care plans:', finalCarePlans);
  
  const room = assignment?.assigned_room_id;
  const bed = assignment?.assigned_bed_id;
  const residentName = bill.resident_id?.full_name || 'Không rõ';
  // Lấy thông tin phòng/giường thực tế từ bedAssignment
  const roomNumber = bedAssignment?.bed_id?.room_id?.room_number || 'Không rõ';
  const roomType = bedAssignment?.bed_id?.room_id?.room_type || '';
  const bedNumber = bedAssignment?.bed_id?.bed_number || '';
  const bedTypeRaw = bedAssignment?.bed_id?.bed_type || '';
  // Chuyển bedType sang tiếng Việt
  const bedType =
    bedTypeRaw === 'standard' ? 'Tiêu chuẩn'
    : bedTypeRaw === 'electric' ? 'Điện'
    : bedTypeRaw === 'medical' ? 'Y tế'
    : bedTypeRaw === 'vip' ? 'VIP'
    : bedTypeRaw === 'special' ? 'Đặc biệt'
    : bedTypeRaw || '';

  // Lấy room_type code từ bedAssignment (ưu tiên bed_id.room_id.room_type, selected_room_type)
  const roomTypeCode = bedAssignment?.bed_id?.room_id?.room_type || assignment?.selected_room_type || '';
  // Tìm roomTypeObj từ danh sách roomTypes lấy từ API
  const roomTypeObj = roomTypes && Array.isArray(roomTypes)
    ? roomTypes.find(rt => rt.room_type === roomTypeCode)
    : null;

  // Kỳ thanh toán: lấy tháng/năm của hạn thanh toán
  const periodDisplay = bill.due_date ? `${new Date(bill.due_date).getMonth() + 1}/${new Date(bill.due_date).getFullYear()}` : 'N/A';

  const getItemIcon = (category) => {
    switch (category) {
      case 'main':
        return 'heart-outline'; // Icon trái tim để thể hiện chăm sóc chính
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

  const getItemBackgroundColor = (category) => {
    switch (category) {
      case 'main':
        return '#e3f2fd'; // Nền xanh dương nhạt nhưng rõ ràng
      case 'room':
        return '#f3e5f5';
      case 'supplementary':
        return '#e8f5e8';
      case 'medication':
        return '#fff3e0';
      default:
        return '#f5f5f5';
    }
  };

  const getItemBorderColor = (category) => {
    switch (category) {
      case 'main':
        return '#1976d2'; // Border xanh dương đậm hơn, nổi bật hơn
      case 'room':
        return '#9c27b0';
      case 'supplementary':
        return '#4caf50';
      case 'medication':
        return '#ff9800';
      default:
        return '#ccc';
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

  const handleExportPDF = async () => {
    try {
      setExportLoading(true);
      console.log('DEBUG - Exporting PDF for bill:', bill._id || bill.id);
      
      const result = await billsService.billingService.exportBillPDF(bill._id || bill.id);
      console.log('DEBUG - Export result:', result);
      
      if (result && result.success && result.data?.url) {
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
                // Mở URL trong browser để tải xuống
                Linking.openURL(result.data.url);
              },
            },
          ]
        );
      } else if (result && result.success && result.data) {
        // Nếu có data nhưng không có URL
        Alert.alert('Thông báo', 'Hóa đơn đã được xuất thành công. Vui lòng kiểm tra email hoặc liên hệ nhân viên để nhận file.');
      } else {
        // Nếu result không có success hoặc data
        console.error('Export failed - Invalid result structure:', result);
        Alert.alert('Lỗi', 'Không thể xuất hóa đơn. Vui lòng thử lại sau.');
      }
    } catch (error) {
      console.error('Export PDF error:', error);
      Alert.alert('Lỗi', `Không thể xuất hóa đơn: ${error.message || 'Vui lòng thử lại sau.'}`);
    } finally {
      setExportLoading(false);
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
                  ? '#F44336'  // Đỏ - Quá hạn (pending + quá ngày)
                  : '#FFA000'  // Cam - Chờ thanh toán (pending)
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
            <Text style={styles.roomNumberHeader}> • Phòng {roomNumber}{bedNumber ? ` - Giường ${bedNumber}` : ''}</Text>
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
                        ? 'Hạn thanh toán hôm nay'
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
        {finalCarePlans.length > 0 && finalCarePlans.map((plan) => (
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
        {/* Hiển thị thông tin phòng ở trên, giường ở dưới */}
        {bedAssignment && (
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
                  {roomTypeObj ? ` (${roomTypeObj.type_name})` : ''}
                </Text>
              </View>
              {/* Mô tả và tiện ích - căn lề đồng bộ với các gói dịch vụ, không hiển thị lại loại phòng */}
              {roomTypeObj && (
                <View style={{ marginTop: 4, marginLeft: 28 }}>
                  {roomTypeObj.description && (
                    <Text style={styles.itemDescription}>{roomTypeObj.description}</Text>
                  )}
                  {roomTypeObj.amenities && roomTypeObj.amenities.length > 0 && (
                    <Text style={styles.itemDescription}>Tiện ích: {roomTypeObj.amenities.join(', ')}</Text>
                  )}
                </View>
              )}
              {/* Giá tiền phòng - giống style các gói dịch vụ */}
              {roomTypeObj && (
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 8 }}>
                  <Text style={[styles.itemAmount, { fontWeight: 'bold', color: COLORS.primary, fontSize: 16 }]}> 
                    {formatCurrency(roomTypeObj.monthly_price)}
                  </Text>
                </View>
              )}
            </View>
            {/* Ô giường */}
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
        {bill.status !== 'paid' ? (
          <TouchableOpacity            style={[
              styles.payButton,
              {
                backgroundColor: isOverdue
                  ? '#dc3545'  // Màu đỏ cho quá hạn (pending + quá ngày)
                  : COLORS.primary  // Màu xanh cho chờ thanh toán (pending chưa quá hạn)
              }
            ]}
            onPress={handlePayment}
            disabled={paymentLoading}
          >
            {paymentLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>Thanh toán ngay</Text>
            )}
          </TouchableOpacity>
        ) : (
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
        )}
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
              onPress={handlePaymentInApp}
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
              onPress={handlePaymentInBrowser}
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
    marginRight: 40, // để cân bằng với back button
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
    color: '#FF9800', // Màu cam cho "Đến hạn hôm nay"
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
  payButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
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
    paddingTop: 0, // Bao phủ cả status bar
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
  // New styles for notes section
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
  // Payment Options Modal Styles
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

export default BillDetailScreen; 