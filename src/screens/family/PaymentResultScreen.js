import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import paymentService from '../../api/services/paymentService';
import { formatCurrency } from '../../utils/helpers';

const { width: screenWidth } = Dimensions.get('window');

const PaymentResultScreen = ({ route, navigation }) => {
  const { billId, paymentStatus, paymentData } = route.params;
  const [loading, setLoading] = useState(false);
  const [billInfo, setBillInfo] = useState(null);

  useEffect(() => {
    if (billId) {
      fetchBillInfo();
    }
  }, [billId]);

  const fetchBillInfo = async () => {
    try {
      setLoading(true);
      const result = await paymentService.checkPaymentStatus(billId);
      if (result.success) {
        setBillInfo(result.data);
      }
    } catch (error) {
      console.error('Error fetching bill info:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoBack = () => {
    // Navigate to TabsChính (which contains FamilyHomeScreen)
    navigation.navigate('TabsChính');
  };

  const handleViewBill = () => {
    // Navigate into the billing stack and then to BillDetail inside it
    navigation.navigate('HoaDon', {
      screen: 'BillDetail',
      params: { billId },
    });
  };

  const handleRetryPayment = () => {
    navigation.navigate('HoaDon', {
      screen: 'BillDetail',
      params: { billId },
    });
  };

  const isSuccess = paymentStatus === 'success' || paymentStatus === 'paid';
  const isCancelled = paymentStatus === 'cancel' || paymentStatus === 'cancelled';
  const isFailed = paymentStatus === 'failed' || paymentStatus === 'error';

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang kiểm tra trạng thái thanh toán...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleGoBack}
        >
          <Ionicons name="home" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Kết quả thanh toán</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        {/* Status Icon */}
        <View style={[
          styles.statusIconContainer,
          { backgroundColor: isSuccess ? '#e8f5e8' : isCancelled ? '#fff3e0' : '#ffebee' }
        ]}>
          <Ionicons 
            name={
              isSuccess ? 'checkmark-circle' : 
              isCancelled ? 'close-circle' : 
              'alert-circle'
            } 
            size={80} 
            color={
              isSuccess ? '#4caf50' : 
              isCancelled ? '#ff9800' : 
              '#f44336'
            } 
          />
        </View>

        {/* Status Title */}
        <Text style={[
          styles.statusTitle,
          { 
            color: isSuccess ? '#4caf50' : 
            isCancelled ? '#ff9800' : 
            '#f44336' 
          }
        ]}>
          {isSuccess ? 'Thanh toán thành công!' : 
           isCancelled ? 'Thanh toán đã hủy' : 
           'Thanh toán thất bại'}
        </Text>

        {/* Status Description */}
        <Text style={styles.statusDescription}>
          {isSuccess 
            ? 'Hóa đơn của bạn đã được thanh toán thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!'
            : isCancelled 
              ? 'Bạn đã hủy quá trình thanh toán. Hóa đơn vẫn chưa được thanh toán và bạn có thể thử lại bất cứ lúc nào từ trang chi tiết hóa đơn.'
              : 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau hoặc liên hệ hỗ trợ nếu vấn đề vẫn tiếp tục.'
          }
        </Text>

        {/* Bill Information */}
        {billInfo && (
          <View style={styles.billInfoContainer}>
            <Text style={styles.billInfoTitle}>Thông tin hóa đơn</Text>
            <View style={styles.billInfoRow}>
              <Text style={styles.billInfoLabel}>Mã hóa đơn:</Text>
              <Text style={styles.billInfoValue}>{billInfo._id}</Text>
            </View>
            <View style={styles.billInfoRow}>
              <Text style={styles.billInfoLabel}>Số tiền:</Text>
              <Text style={styles.billInfoValue}>{formatCurrency(billInfo.amount || 0)}</Text>
            </View>
            <View style={styles.billInfoRow}>
              <Text style={styles.billInfoLabel}>Trạng thái:</Text>
              <Text style={[
                styles.billInfoValue,
                { 
                  color: billInfo.status === 'paid' ? '#4caf50' : 
                         billInfo.status === 'pending' ? '#ff9800' : '#f44336'
                }
              ]}>
                {billInfo.status === 'paid' ? 'Đã thanh toán' : 
                 billInfo.status === 'pending' ? 'Chờ thanh toán' : 'Quá hạn'}
              </Text>
            </View>
            {billInfo.paid_date && (
              <View style={styles.billInfoRow}>
                <Text style={styles.billInfoLabel}>Ngày thanh toán:</Text>
                <Text style={styles.billInfoValue}>
                  {new Date(billInfo.paid_date).toLocaleDateString('vi-VN')}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Payment Details */}
        {paymentData && (
          <View style={styles.paymentDetailsContainer}>
            <Text style={styles.paymentDetailsTitle}>Chi tiết giao dịch</Text>
            {paymentData.transaction_id && (
              <View style={styles.paymentDetailsRow}>
                <Text style={styles.paymentDetailsLabel}>Mã giao dịch:</Text>
                <Text style={styles.paymentDetailsValue}>{paymentData.transaction_id}</Text>
              </View>
            )}
            {paymentData.payment_method && (
              <View style={styles.paymentDetailsRow}>
                <Text style={styles.paymentDetailsLabel}>Phương thức:</Text>
                <Text style={styles.paymentDetailsValue}>
                  {paymentData.payment_method === 'qr_code' ? 'QR Code' : 
                   paymentData.payment_method === 'card' ? 'Thẻ ngân hàng' : 
                   paymentData.payment_method === 'wallet' ? 'Ví điện tử' : 
                   paymentData.payment_method}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        {isSuccess ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewBill}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Xem hóa đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoBack}
            >
              <Text style={styles.secondaryButtonText}>Về trang chính</Text>
            </TouchableOpacity>
          </>
        ) : isCancelled ? (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleViewBill}
            >
              <Ionicons name="document-text" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Xem hóa đơn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetryPayment}
            >
              <Ionicons name="refresh" size={20} color={COLORS.primary} />
              <Text style={styles.secondaryButtonText}>Thử lại thanh toán</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleRetryPayment}
            >
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.primaryButtonText}>Thử lại thanh toán</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleGoBack}
            >
              <Text style={styles.secondaryButtonText}>Về trang chính</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
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
  content: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  billInfoContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  billInfoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  billInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  billInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  billInfoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  paymentDetailsContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentDetailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
  },
  paymentDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentDetailsLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentDetailsValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PaymentResultScreen;