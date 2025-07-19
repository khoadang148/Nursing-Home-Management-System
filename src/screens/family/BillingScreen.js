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
  SafeAreaView,
} from 'react-native';
import { useTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { billingService } from '../../api/billingService';
import { formatCurrency, formatDate, isExpired, getDaysRemaining } from '../../utils/helpers';
import { COLORS } from '../../constants/theme';

const BillingScreen = ({ navigation }) => {
  const { colors } = useTheme();
  const [bills, setBills] = useState([]);
  const [residents, setResidents] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: null,
    type: null,
    residentId: null,
    period: null,
  });


  useEffect(() => {
    fetchBills();
    fetchResidents();
  }, [filters, searchQuery]);

  const fetchBills = async () => {
    try {
      const result = await billingService.getBills({
        ...filters,
        search: searchQuery,
      });
      console.log('Fetched bills:', result.data);
      // Filter out any bills without proper id and resident
      const validBills = result.data.filter(bill => bill && (bill.id || bill._id) && bill.resident);
      setBills(validBills);
    } catch (error) {
      console.error('Error fetching bills:', error);
    }
  };

  const fetchResidents = async () => {
    try {
      const residentsData = await billingService.getResidents();
      console.log('Fetched residents:', residentsData);
      // Filter out any residents without proper _id, name, and room
      const validResidents = residentsData.filter(resident => 
        resident && resident._id && resident.name && resident.room
      );
      setResidents(validResidents);
    } catch (error) {
      console.error('Error fetching residents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };



  const getStatusColor = (bill) => {
    if (bill.status === 'paid') return '#4CAF50';    // Xanh lá - Đã thanh toán
    if (bill.status === 'overdue') return '#F44336'; // Đỏ - Quá hạn
    return '#FFA000'; // Cam - Chờ thanh toán (pending)
  };

  const getStatusText = (bill) => {
    if (bill.status === 'paid') return 'Đã thanh toán';
    if (bill.status === 'overdue') return 'Quá hạn';
    return 'Chờ thanh toán'; // pending
  };

  const renderBillItem = ({ item }) => {
    // Safety check for item
    if (!item || !item.resident) {
      return null;
    }

    const daysRemaining = getDaysRemaining(item.dueDate);
    
    // Sử dụng trạng thái từ API đã được tính toán chính xác
    const isOverdue = item.status === 'overdue';

    return (
      <TouchableOpacity
        style={styles.billItem}
        onPress={() => navigation.navigate('BillDetail', { billId: item.id || item._id })}
      >
        <View style={styles.billHeader}>
          <View style={styles.billTitleContainer}>
          <Text style={styles.billTitle}>{item.title || 'Hóa đơn chăm sóc'}</Text>
            <View style={styles.residentInfo}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.residentName}>{item.resident.name || 'Unknown'}</Text>
              <Text style={styles.roomNumber}>• Phòng {item.resident.room || 'Unknown'}</Text>
            </View>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item) }
          ]}>
            <Text style={styles.statusText}>{getStatusText(item)}</Text>
          </View>
        </View>
        <Text style={styles.billAmount}>{formatCurrency(item.amount || 0)}</Text>
        <View style={styles.billFooter}>
          <Text style={styles.dueDate}>
            Hạn thanh toán: {formatDate(item.dueDate)}
          </Text>
          {item.status !== 'paid' && (
            <Text style={[
              styles.daysRemaining,
              isOverdue && styles.overdueText,
              daysRemaining === 0 && !isOverdue && styles.dueTodayText
            ]}>
              {isOverdue 
                ? `Quá hạn ${Math.abs(daysRemaining)} ngày`
                : daysRemaining === 0 
                  ? `Đến hạn hôm nay`
                  : `Còn ${daysRemaining} ngày`}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const clearAllFilters = () => {
    setFilters({
      status: null,
      type: null,
      residentId: null,
      period: null,
    });
    setSearchQuery('');
  };

  const getActiveFilterCount = () => {
    return Object.values(filters).filter(value => value !== null).length;
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
        <Text style={styles.customHeaderTitle}>Hóa Đơn</Text>
        <View style={styles.headerRight}>
        <TouchableOpacity
          style={styles.filterButton}
          onPress={() => setShowFilters(true)}
        >
            <Ionicons name="options-outline" size={24} color={COLORS.primary} />
            {getActiveFilterCount() > 0 && (
              <View style={styles.filterBadge}>
                <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
              </View>
            )}
        </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên cụ, phòng, hóa đơn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {(searchQuery || getActiveFilterCount() > 0) ? (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllFilters}
          >
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Active Filters Display */}
      {getActiveFilterCount() > 0 && (
        <View style={styles.activeFiltersContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {filters.status && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {filters.status === 'paid' ? 'Đã thanh toán' : 
                   filters.status === 'pending' ? 'Chờ thanh toán' : 
                   filters.status === 'overdue' ? 'Quá hạn' : filters.status}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, status: null }))}
                >
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {filters.residentId && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {residents.find(r => r._id === filters.residentId)?.name || 'Cụ được chọn'}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, residentId: null }))}
                >
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
            {filters.period && (
              <View style={styles.activeFilterChip}>
                <Text style={styles.activeFilterText}>
                  {filters.period === 'this_month' ? 'Tháng này' :
                   filters.period === 'this_year' ? 'Năm nay' :
                   filters.period === 'last_month' ? 'Tháng trước' : filters.period}
                </Text>
                <TouchableOpacity
                  onPress={() => setFilters(prev => ({ ...prev, period: null }))}
                >
                  <Ionicons name="close" size={14} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      )}

      <FlatList
        data={bills.filter(bill => bill && (bill.id || bill._id) && bill.resident)}
        renderItem={renderBillItem}
        keyExtractor={item => item.id || item._id || `bill_${Math.random()}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>
              {searchQuery || getActiveFilterCount() > 0 
                ? 'Không tìm thấy hóa đơn phù hợp' 
                : 'Chưa có hóa đơn nào'}
            </Text>
          </View>
        )}
        removeClippedSubviews={false}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
      />

      <Modal
        visible={showFilters}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bộ lọc hóa đơn</Text>
              <TouchableOpacity
                onPress={() => setShowFilters(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.filterOptions}>
              {/* Status Filter */}
              <Text style={styles.filterSectionTitle}>Trạng thái thanh toán</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButtonOption,
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
                    styles.filterButtonOption,
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
                <TouchableOpacity
                  style={[
                    styles.filterButtonOption,
                    filters.status === 'overdue' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    status: prev.status === 'overdue' ? null : 'overdue'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.status === 'overdue' && styles.filterButtonTextActive
                  ]}>Quá hạn</Text>
                </TouchableOpacity>
              </View>

              {/* Resident Filter */}
              <Text style={styles.filterSectionTitle}>Người cao tuổi</Text>
              <View style={styles.filterButtons}>
                {residents.length > 0 ? (
                  residents.filter(resident => resident && resident._id && resident.name && resident.room).map(resident => (
                  <TouchableOpacity
                      key={resident._id}
                    style={[
                      styles.filterButtonOption,
                        filters.residentId === resident._id && styles.filterButtonActive
                    ]}
                    onPress={() => setFilters(prev => ({
                      ...prev,
                        residentId: prev.residentId === resident._id ? null : resident._id
                    }))}
                  >
                    <Text style={[
                      styles.filterButtonText,
                        filters.residentId === resident._id && styles.filterButtonTextActive
                    ]}>{resident.name} ({resident.room})</Text>
                  </TouchableOpacity>
                  ))
                ) : (
                  <Text style={styles.filterButtonText}>Không có dữ liệu người cao tuổi</Text>
                )}
              </View>

              {/* Period Filter */}
              <Text style={styles.filterSectionTitle}>Thời gian</Text>
              <View style={styles.filterButtons}>
                <TouchableOpacity
                  style={[
                    styles.filterButtonOption,
                    filters.period === 'this_month' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    period: prev.period === 'this_month' ? null : 'this_month'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.period === 'this_month' && styles.filterButtonTextActive
                  ]}>Tháng này</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonOption,
                    filters.period === 'last_month' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    period: prev.period === 'last_month' ? null : 'last_month'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.period === 'last_month' && styles.filterButtonTextActive
                  ]}>Tháng trước</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterButtonOption,
                    filters.period === 'this_year' && styles.filterButtonActive
                  ]}
                  onPress={() => setFilters(prev => ({
                    ...prev,
                    period: prev.period === 'this_year' ? null : 'this_year'
                  }))}
                >
                  <Text style={[
                    styles.filterButtonText,
                    filters.period === 'this_year' && styles.filterButtonTextActive
                  ]}>Năm nay</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.clearFiltersButton}
                onPress={() => setFilters({ 
                  status: null, 
                  type: null, 
                  residentId: null, 
                  period: null 
                })}
              >
                <Text style={styles.clearFiltersText}>Xóa tất cả</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    textAlign: 'center',
    marginRight: 40, // để cân bằng với back button
  },
  headerRight: {
    position: 'absolute',
    right: 16,
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  billTitleContainer: {
    flex: 1,
    marginRight: 8,
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  residentName: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
  },
  roomNumber: {
    fontSize: 13,
    color: '#999',
    marginLeft: 4,
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
    color: COLORS.primary,
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
  dueTodayText: {
    color: '#FF9800', // Orange color for due today
    fontWeight: '500',
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
  filterButtonOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginRight: 8,
    marginBottom: 8,
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary + '20',
    borderColor: COLORS.primary,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
  },
  filterButtonTextActive: {
    color: COLORS.primary,
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  applyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  activeFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.primary + '40',
  },
  activeFilterText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '500',
    marginRight: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 11,
    color: 'white',
    fontWeight: 'bold',
  },
});

export default BillingScreen;