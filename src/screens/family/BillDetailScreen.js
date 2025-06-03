import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { billingService } from '../../api/billingService';
import { formatCurrency, formatDate, isExpired, getDaysRemaining } from '../../utils/helpers';

const BillDetailScreen = ({ route, navigation }) => {
  const { bill } = route.params;
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentMethods, setPaymentMethods] = useState([]);

  React.useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const methods = await billingService.getPaymentMethods();
      setPaymentMethods(methods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const handlePayment = async () => {
    if (!selectedPaymentMethod) {
      Alert.alert('Thông báo', 'Vui lòng chọn phương thức thanh toán');
      return;
    }

    Alert.alert(
      'Xác nhận thanh toán',
      'Bạn có chắc chắn muốn thanh toán hóa đơn này?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Thanh toán',
          onPress: async () => {
            try {
              setLoading(true);
              const result = await billingService.processPayment(
                bill.id,
                selectedPaymentMethod.id,
                { /* payment details */ }
              );
              Alert.alert('Thành công', result.message);
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', error.message);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      const result = await billingService.exportBillPDF(bill.id);
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
              // TODO: Implement download logic
              console.log('Download PDF:', result.url);
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể xuất hóa đơn. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = getDaysRemaining(bill.dueDate);
  const isOverdue = isExpired(bill.dueDate);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{bill.title}</Text>
        <View style={[
          styles.statusBadge,
          { 
            backgroundColor: bill.status === 'paid' 
              ? '#4CAF50' 
              : isOverdue 
                ? '#F44336' 
                : '#FFA000'
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

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin hóa đơn</Text>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Số tiền:</Text>
          <Text style={styles.value}>
            {formatCurrency(bill.amount)}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Hạn thanh toán:</Text>
          <Text style={[styles.value, isOverdue && styles.overdueText]}>
            {formatDate(bill.dueDate)}
            {!bill.status === 'paid' && (
              <Text style={styles.daysRemaining}>
                {isOverdue 
                  ? ` (Quá hạn ${Math.abs(daysRemaining)} ngày)`
                  : ` (Còn ${daysRemaining} ngày)`}
              </Text>
            )}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Loại hóa đơn:</Text>
          <Text style={styles.value}>
            {bill.type === 'monthly' ? 'Phí chăm sóc hàng tháng' : 'Phí thuốc'}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.label}>Ngày tạo:</Text>
          <Text style={styles.value}>{formatDate(bill.createdAt)}</Text>
        </View>
        {bill.status === 'paid' && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Ngày thanh toán:</Text>
              <Text style={styles.value}>{formatDate(bill.paymentDate)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Phương thức thanh toán:</Text>
              <Text style={styles.value}>
                {bill.paymentMethod === 'card' 
                  ? 'Thẻ ngân hàng' 
                  : bill.paymentMethod === 'wallet' 
                    ? 'Ví điện tử' 
                    : 'Chuyển khoản'}
              </Text>
            </View>
          </>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Chi tiết hóa đơn</Text>
        {bill.items.map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemAmount}>{formatCurrency(item.amount)}</Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng cộng:</Text>
          <Text style={styles.totalAmount}>{formatCurrency(bill.amount)}</Text>
        </View>
      </View>

      {bill.status === 'pending' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
          <View style={styles.paymentMethods}>
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethod,
                  selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethod
                ]}
                onPress={() => setSelectedPaymentMethod(method)}
              >
                <Ionicons 
                  name={method.icon} 
                  size={24} 
                  color={selectedPaymentMethod?.id === method.id ? colors.primary : '#666'} 
                />
                <Text style={[
                  styles.paymentMethodText,
                  selectedPaymentMethod?.id === method.id && styles.selectedPaymentMethodText
                ]}>
                  {method.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <View style={styles.buttonContainer}>
        {bill.status === 'pending' ? (
          <TouchableOpacity
            style={[styles.payButton, { backgroundColor: colors.primary }]}
            onPress={handlePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>Thanh toán ngay</Text>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.exportButton, { borderColor: colors.primary }]}
            onPress={handleExportPDF}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.primary} />
            ) : (
              <>
                <Ionicons name="download-outline" size={20} color={colors.primary} />
                <Text style={[styles.exportButtonText, { color: colors.primary }]}>
                  Xuất hóa đơn
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: 'white',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    backgroundColor: 'white',
    marginTop: 16,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
    color: '#666',
  },
  value: {
    fontSize: 16,
    fontWeight: '500',
  },
  overdueText: {
    color: '#F44336',
  },
  daysRemaining: {
    fontSize: 14,
    color: '#666',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    color: '#333',
  },
  itemAmount: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  paymentMethods: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  paymentMethod: {
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    width: '45%',
    marginRight: '5%',
    marginBottom: 12,
  },
  selectedPaymentMethod: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  paymentMethodText: {
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  selectedPaymentMethodText: {
    color: '#2196F3',
    fontWeight: '500',
  },
  buttonContainer: {
    padding: 16,
  },
  payButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
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
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default BillDetailScreen; 