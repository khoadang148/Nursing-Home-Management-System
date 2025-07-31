import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl,
  Alert,
  SafeAreaView,
  TextInput
} from 'react-native';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import billsService from '../../api/services/billsService';
import { COLORS, FONTS } from '../../constants/theme';

const MyCreatedBillsScreen = () => {
  const navigation = useNavigation();
  const user = useSelector(state => state.auth.user);
  const staffId = user?._id;

  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'paid', 'pending', 'overdue'

  const fetchBills = useCallback(async () => {
    if (!staffId) return;
    setLoading(true);
    try {
      console.log('DEBUG - Fetching bills for staff:', staffId);
      
      // Thử gọi API lấy hóa đơn theo staff_id trước
      let response = await billsService.getBillsByStaffId(staffId);
      
      // Nếu API staff không tồn tại, fallback về getAllBills và lọc
      if (!response.success) {
        console.log('DEBUG - Staff API not available, falling back to getAllBills');
        response = await billsService.getAllBills();
        
        if (response.success && response.data) {
          console.log('DEBUG - Raw bills data:', response.data);
          
          // Lọc hóa đơn theo staff_id hiện tại
          const myBills = response.data.filter(bill => {
            const billStaffId = bill.staff_id?._id || bill.staff_id;
            console.log('DEBUG - Comparing bill staff_id:', billStaffId, 'with current staffId:', staffId);
            return billStaffId === staffId;
          });
          
          console.log('DEBUG - Found bills:', myBills.length);
          console.log('DEBUG - My bills:', myBills);
          setBills(myBills);
          setFilteredBills(myBills);
        } else {
          console.error('DEBUG - API response error:', response.error);
          setBills([]);
          setFilteredBills([]);
        }
      } else {
        // API staff thành công
        console.log('DEBUG - Staff API response:', response);
        setBills(response.data || []);
        setFilteredBills(response.data || []);
      }
    } catch (error) {
      console.error('DEBUG - Fetch bills error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách hóa đơn. Vui lòng thử lại.');
      setBills([]);
      setFilteredBills([]);
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    fetchBills();
  }, [fetchBills]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBills();
    setRefreshing(false);
  };

  // Filter bills based on search query and status
  useEffect(() => {
    let filtered = bills;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(bill => {
        const residentName = bill.resident_id?.full_name || bill.resident?.full_name || bill.resident?.name || '';
        const title = bill.title || '';
        return residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               title.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(bill => bill.status === statusFilter);
    }
    
    setFilteredBills(filtered);
  }, [bills, searchQuery, statusFilter]);

  const renderStatus = (status) => {
    switch (status) {
      case 'paid':
        return <Text style={[styles.status, styles.paid]}>Đã thanh toán</Text>;
      case 'overdue':
        return <Text style={[styles.status, styles.overdue]}>Quá hạn</Text>;
      case 'pending':
        return <Text style={[styles.status, styles.pending]}>Chưa thanh toán</Text>;
      default:
        return <Text style={[styles.status, styles.pending]}>Chưa thanh toán</Text>;
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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.billItem}
      onPress={() => handleBillPress(item)}
    >
      <View style={styles.billHeader}>
        <View style={styles.billInfo}>
          <Text style={styles.residentName}>
            {item.resident_id?.full_name || item.resident?.full_name || item.resident?.name || 'Không rõ'}
          </Text>
          <Text style={styles.billTitle}>{item.title || 'Hóa đơn chăm sóc'}</Text>
        </View>
        <View style={styles.statusContainer}>
          {renderStatus(item.status)}
        </View>
      </View>
      
      <View style={styles.billDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Số tiền:</Text>
          <Text style={styles.amount} numberOfLines={1}>{formatPrice(item.amount || 0)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày tạo:</Text>
          <Text style={styles.date}>{formatDate(item.created_at)}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Ngày đến hạn:</Text>
          <Text style={styles.date}>{formatDate(item.due_date)}</Text>
        </View>
        {item.care_plan_assignment_id && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Phòng:</Text>
            <Text style={styles.date}>
              {item.care_plan_assignment_id?.assigned_room_id?.room_number || 'Chưa phân'}
            </Text>
          </View>
        )}
      </View>
      
      <View style={styles.chevronContainer}>
        <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
      </View>
    </TouchableOpacity>
  );

  const handleBillPress = (bill) => {
    const residentName = bill.resident_id?.full_name || bill.resident?.full_name || bill.resident?.name || 'N/A';
    const roomNumber = bill.care_plan_assignment_id?.assigned_room_id?.room_number || 'Chưa phân';
    const bedNumber = bill.care_plan_assignment_id?.assigned_bed_id?.bed_number || 'Chưa phân';
    const carePlanName = bill.care_plan_assignment_id?.care_plan_ids?.[0]?.plan_name || 'N/A';
    
    Alert.alert(
      'Chi tiết hóa đơn',
      `Cư dân: ${residentName}\n` +
      `Tiêu đề: ${bill.title || 'N/A'}\n` +
      `Số tiền: ${formatPrice(bill.amount || 0)}\n` +
      `Ngày tạo: ${formatDate(bill.created_at)}\n` +
      `Ngày đến hạn: ${formatDate(bill.due_date)}\n` +
      `Trạng thái: ${bill.status === 'paid' ? 'Đã thanh toán' : bill.status === 'overdue' ? 'Quá hạn' : 'Chưa thanh toán'}\n` +
      `Phòng: ${roomNumber}\n` +
      `Giường: ${bedNumber}\n` +
      `Gói dịch vụ: ${carePlanName}\n` +
      `Ghi chú: ${bill.notes || 'Không có'}`
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
        <Text style={styles.headerTitle}>Hóa Đơn Tôi Đã Tạo</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Search and Filter */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm theo tên cư dân..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[styles.filterText, statusFilter === 'all' && styles.filterTextActive]}>Tất cả</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'pending' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('pending')}
          >
            <Text style={[styles.filterText, statusFilter === 'pending' && styles.filterTextActive]}>Chưa thanh toán</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, statusFilter === 'paid' && styles.filterButtonActive]}
            onPress={() => setStatusFilter('paid')}
          >
            <Text style={[styles.filterText, statusFilter === 'paid' && styles.filterTextActive]}>Đã thanh toán</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bills List */}
      <FlatList
        data={filteredBills}
        keyExtractor={item => item._id || item.id}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textSecondary} />
            <Text style={styles.emptyTitle}>Không có hóa đơn nào</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery || statusFilter !== 'all' 
                ? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
                : 'Bạn chưa tạo hóa đơn nào'
              }
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
      />
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
    color: COLORS.textSecondary,
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
  headerRight: {
    width: 34,
  },
  searchContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    color: COLORS.text,
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.white,
  },
  listContainer: {
    padding: 20,
  },
  billItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  billHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  billInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },
  billTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusContainer: {
    marginLeft: 10,
  },
  status: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  paid: {
    backgroundColor: COLORS.success,
    color: COLORS.white,
  },
  overdue: {
    backgroundColor: COLORS.error,
    color: COLORS.white,
  },
  pending: {
    backgroundColor: COLORS.warning,
    color: COLORS.white,
  },
  billDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 40, // Tạo khoảng trống cho chevron
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  amount: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  chevronContainer: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
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
  },
});

export default MyCreatedBillsScreen;