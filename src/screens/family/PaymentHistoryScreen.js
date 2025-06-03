import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { billingService } from '../../api/billingService';
import { formatCurrency, formatDate } from '../../utils/helpers';

const PaymentHistoryScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [payments, setPayments] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const result = await billingService.getBills({ status: 'paid' });
      setPayments(result.data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  };

  const getPaymentMethodIcon = (method) => {
    switch (method) {
      case 'card':
        return 'card-outline';
      case 'wallet':
        return 'wallet-outline';
      case 'transfer':
        return 'swap-horizontal-outline';
      default:
        return 'cash-outline';
    }
  };

  const renderPaymentItem = ({ item }) => (
    <TouchableOpacity
      style={styles.paymentItem}
      onPress={() => navigation.navigate('BillDetail', { bill: item })}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.paymentTitle}>{item.title}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>Đã thanh toán</Text>
        </View>
      </View>
      <Text style={styles.paymentAmount}>{formatCurrency(item.amount)}</Text>
      <View style={styles.paymentFooter}>
        <View style={styles.paymentMethod}>
          <Ionicons
            name={getPaymentMethodIcon(item.paymentMethod)}
            size={16}
            color={colors.primary}
          />
          <Text style={styles.paymentMethodText}>
            {item.paymentMethod === 'card'
              ? 'Thẻ ngân hàng'
              : item.paymentMethod === 'wallet'
              ? 'Ví điện tử'
              : 'Chuyển khoản'}
          </Text>
        </View>
        <Text style={styles.paymentDate}>
          {formatDate(item.paymentDate)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Lịch sử thanh toán</Text>
      </View>

      <FlatList
        data={payments}
        renderItem={renderPaymentItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 16,
  },
  paymentItem: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  paymentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  paymentDate: {
    fontSize: 14,
    color: '#666',
  },
});

export default PaymentHistoryScreen; 