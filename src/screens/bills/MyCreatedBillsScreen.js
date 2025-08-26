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
import residentService from '../../api/services/residentService';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';
import { COLORS, FONTS } from '../../constants/theme';
import { formatDateToVietnamTime } from '../../utils/dateUtils';

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
      // Gọi API lấy hóa đơn theo staff_id
      const response = await billsService.getBillsByStaffId(staffId);
      
      if (response.success && response.data) {
        console.log('DEBUG - Staff API response:', response);
        console.log('DEBUG - Bills data:', response.data);
        
        // Process và enhance dữ liệu nếu cần
        const enhancedBills = response.data.map((bill) => {
          let enhancedBill = { ...bill };
          
          // Debug log để xem cấu trúc dữ liệu
          console.log('DEBUG - Processing bill:', {
            id: bill._id,
            resident_id_type: typeof bill.resident_id,
            resident_id_value: bill.resident_id,
            care_plan_assignment_id_type: typeof bill.care_plan_assignment_id,
            care_plan_assignment_id_value: bill.care_plan_assignment_id
          });
          
          return enhancedBill;
        });
        
        setBills(enhancedBills || []);
        setFilteredBills(enhancedBills || []);
      } else {
        console.error('DEBUG - API response error:', response.error);
        setBills([]);
        setFilteredBills([]);
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
    return formatDateToVietnamTime(date);
  };

  const renderItem = ({ item }) => {
    // Debug log để kiểm tra dữ liệu
    console.log('DEBUG - Bill item data:', {
      id: item._id,
      resident_id: item.resident_id,
      care_plan_assignment_id: item.care_plan_assignment_id,
      title: item.title
    });

    // Lấy thông tin resident với fallback tốt hơn
    let residentName = 'Không rõ';
    if (item.resident_id) {
      if (typeof item.resident_id === 'object') {
        // Thử các trường khác nhau có thể chứa tên
        if (item.resident_id.full_name) {
          residentName = item.resident_id.full_name;
        } else if (item.resident_id.name) {
          residentName = item.resident_id.name;
        } else if (item.resident_id.first_name && item.resident_id.last_name) {
          residentName = item.resident_id.first_name + ' ' + item.resident_id.last_name;
        } else if (item.resident_id._id) {
          residentName = item.resident_id._id; // Fallback về ID nếu không có tên
        } else {
          residentName = 'Không rõ';
        }
      } else if (typeof item.resident_id === 'string') {
        residentName = item.resident_id; // Fallback nếu chỉ có ID
      }
    }

    // Lấy thông tin phòng/giường với logic cải thiện
    let roomInfo = 'Chưa phân phòng';
    let bedInfo = '';
    
    // Thử lấy từ care_plan_assignment_id trước
    if (item.care_plan_assignment_id) {
      const assignment = item.care_plan_assignment_id;
      
      // Lấy thông tin phòng
      if (assignment.assigned_room_id) {
        if (typeof assignment.assigned_room_id === 'object') {
          if (assignment.assigned_room_id.room_number) {
            roomInfo = `Phòng ${assignment.assigned_room_id.room_number}`;
          } else if (assignment.assigned_room_id._id) {
            roomInfo = `Phòng ${assignment.assigned_room_id._id}`;
          }
        } else if (typeof assignment.assigned_room_id === 'string') {
          roomInfo = `Phòng ${assignment.assigned_room_id}`;
        }
      }
      
      // Lấy thông tin giường
      if (assignment.assigned_bed_id) {
        if (typeof assignment.assigned_bed_id === 'object') {
          if (assignment.assigned_bed_id.bed_number) {
            bedInfo = ` - Giường ${assignment.assigned_bed_id.bed_number}`;
          } else if (assignment.assigned_bed_id._id) {
            bedInfo = ` - Giường ${assignment.assigned_bed_id._id}`;
          }
        } else if (typeof assignment.assigned_bed_id === 'string') {
          bedInfo = ` - Giường ${assignment.assigned_bed_id}`;
        }
      }
    }
    
    // Fallback: Thử lấy từ resident_id nếu có thông tin phòng
    if (roomInfo === 'Chưa phân phòng' && item.resident_id && typeof item.resident_id === 'object') {
      if (item.resident_id.room_number) {
        roomInfo = `Phòng ${item.resident_id.room_number}`;
      } else if (item.resident_id.room_id) {
        roomInfo = `Phòng ${item.resident_id.room_id}`;
      }
      
      if (item.resident_id.bed_number) {
        bedInfo = ` - Giường ${item.resident_id.bed_number}`;
      } else if (item.resident_id.bed_id) {
        bedInfo = ` - Giường ${item.resident_id.bed_id}`;
      }
    }

    const title = item.title || 'Hóa đơn chăm sóc';
    const amount = item.amount || 0;
    const dueDate = item.due_date;
    const status = item.status;
    
    // Tính số ngày còn lại/quá hạn
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    const daysRemaining = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
    
    let daysText = '';
    if (status === 'pending') {
      daysText = daysRemaining === 0 ? 'Quá hạn 0 ngày' : `Còn ${daysRemaining} ngày`;
    } else if (status === 'overdue') {
      daysText = `Quá hạn ${Math.abs(daysRemaining)} ngày`;
    }

    return (
      <TouchableOpacity
        style={styles.billItem}
        onPress={() => handleBillPress(item)}
      >
        <View style={styles.billHeader}>
          <View style={styles.billTitleContainer}>
            <Text style={styles.billTitle}>{title}</Text>
            <View style={styles.residentInfo}>
              <Ionicons name="person-outline" size={14} color="#666" />
              <Text style={styles.residentName}>{residentName}</Text>
              <Text style={styles.roomNumber}>• {roomInfo}{bedInfo}</Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            {renderStatus(status)}
          </View>
        </View>
        
        <Text style={styles.billAmount}>{formatPrice(amount)}</Text>
        
        <View style={styles.billFooter}>
          <Text style={styles.dueDate}>
            Hạn thanh toán: {formatDate(dueDate)}
          </Text>
          {(status === 'pending' || status === 'overdue') && (
            <Text style={[
              styles.daysRemaining,
              status === 'overdue' && styles.overdueText,
              daysRemaining === 0 && status === 'pending' && styles.dueTodayText
            ]}>
              {daysText}
            </Text>
          )}
        </View>
        
        <View style={styles.chevronContainer}>
          <MaterialIcons name="chevron-right" size={24} color={COLORS.textSecondary} />
        </View>
      </TouchableOpacity>
    );
  };

  const handleBillPress = (bill) => {
    // Navigate to StaffBillDetailScreen instead of showing Alert
    navigation.navigate('StaffBillDetail', { 
      billId: bill._id || bill.id,
      billData: bill
    });
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
    color: '#FF9800',
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