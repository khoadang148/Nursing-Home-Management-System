import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { billingService } from '../../api/billingService';
import { formatCurrency, formatDate, isExpired, getDaysRemaining } from '../../utils/helpers';

const BillingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [bills, setBills] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    type: null,
  });
  const [showFabMenu, setShowFabMenu] = useState(false);

  useEffect(() => {
    fetchBills();
  }, [filters, searchQuery]);

  const fetchBills = async () => {
    try {
      const result = await billingService.getBills({
        ...filters,
        search: searchQuery,
      });
      setBills(result.data);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };

  const renderBillItem = ({ item }) => {
    const daysRemaining = getDaysRemaining(item.dueDate);
    const isOverdue = isExpired(item.dueDate);

    return (
      <TouchableOpacity
        style={styles.billItem}
        onPress={() => navigation.navigate('BillDetail', { bill: item })}
      >
        <View style={styles.billHeader}>
          <Text style={styles.billTitle}>{item.title}</Text>
          <View style={[
            styles.statusBadge,
            { 
              backgroundColor: item.status === 'paid' 
                ? '#4CAF50' 
                : isOverdue 
                  ? '#F44336' 
                  : '#FFA000'
            }
          ]}>
            <Text style={styles.statusText}>
              {item.status === 'paid' 
                ? 'Đã thanh toán' 
                : isOverdue 
                  ? 'Quá hạn' 
                  : 'Chờ thanh toán'}
            </Text>
          </View>
        </View>
        <Text style={styles.billAmount}>{formatCurrency(item.amount)}</Text>
        <View style={styles.billFooter}>
          <Text style={styles.dueDate}>
            Hạn thanh toán: {formatDate(item.dueDate)}
          </Text>
          {item.status !== 'paid' && (
            <Text style={[
              styles.daysRemaining,
              isOverdue && styles.overdueText
            ]}>
              {isOverdue 
                ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                : `Còn ${daysRemaining} ngày`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderFabMenu = () => {
    if (!showFabMenu) return null;

    return (
      <View style={styles.fabMenu}>
        <TouchableOpacity
          style={styles.fabMenuItem}
          onPress={() => {
            setShowFabMenu(false);
            navigation.navigate('PaymentHistory');
          }}
        >
          <Ionicons name="time-outline" size={24} color={colors.primary} />
          <Text style={styles.fabMenuText}>Lịch sử thanh toán</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabMenuItem}
          onPress={() => {
            setShowFabMenu(false);
            // TODO: Implement export all bills
            console.log('Export all bills');
          }}
        >
          <Ionicons name="download-outline" size={24} color={colors.primary} />
          <Text style={styles.fabMenuText}>Xuất tất cả hóa đơn</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fabMenuItem}
          onPress={() => {
            setShowFabMenu(false);
            // TODO: Implement payment reminder
            console.log('Set payment reminder');
          }}
        >
          <Ionicons name="notifications-outline" size={24} color={colors.primary} />
          <Text style={styles.fabMenuText}>Nhắc nhở thanh toán</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Hóa Đơn</Text>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="filter" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm hóa đơn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      <FlatList
        data={bills}
        renderItem={renderBillItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.primary }]}
        onPress={() => setShowFabMenu(!showFabMenu)}
      >
        <Ionicons name={showFabMenu ? "close" : "add"} size={24} color="white" />
      </TouchableOpacity>

      {renderFabMenu()}

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              <Text style={styles.filterSectionTitle}>Trạng thái</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.status === 'pending' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status === 'pending' ? null : 'pending'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.status === 'pending' && styles.filterButtonTextActive
                  ]}>Chờ thanh toán</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.status === 'paid' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status === 'paid' ? null : 'paid'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.status === 'paid' && styles.filterButtonTextActive
                  ]}>Đã thanh toán</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.filterSectionTitle}>Loại hóa đơn</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.type === 'monthly' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    type: prev.type === 'monthly' ? null : 'monthly'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.type === 'monthly' && styles.filterButtonTextActive
                  ]}>Phí chăm sóc</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filters.type === 'medicine' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    type: prev.type === 'medicine' ? null : 'medicine'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.type === 'medicine' && styles.filterButtonTextActive
                  ]}>Phí thuốc</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => setFilters({ status: null, type: null })}
              >
                <Text style={styles.clearFiltersText}>Xóa bộ lọc</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyButton}
                onPress={() => setShowFilters(false)}
              >
                <Text style={styles.applyButtonText}>Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  listContainer: {
    padding: 16,
  },
  billItem: {
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
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  billAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 8,
  },
  billFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dueDate: {
    fontSize: 14,
    color: '#666',
  },
  daysRemaining: {
    fontSize: 14,
    color: '#FFA000',
  },
  overdueText: {
    color: '#F44336',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  filterOptions: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: '#2196F3',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  clearFiltersButton: {
    padding: 12,
  },
  clearFiltersText: {
    color: '#666',
    fontSize: 16,
  },
  applyButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabMenu: {
    position: 'absolute',
    bottom: 80,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  fabMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  fabMenuText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
});

export default BillingScreen; 