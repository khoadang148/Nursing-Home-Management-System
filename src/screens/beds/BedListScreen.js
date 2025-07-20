import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Card, Chip, FAB, Searchbar, Menu, Divider } from 'react-native-paper';
import { useNotification } from '../../components/NotificationSystem';

import {
  getAllBeds,
  deleteBed,
  searchBeds,
  clearBedState,
  setBedFilters,
  clearBedFilters,
} from '../../redux/slices/bedSlice';

const BedListScreen = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { showSuccess, showError, showWarning, confirmAction } = useNotification();
  
  const { beds, isLoading, error, message, filters } = useSelector((state) => state.beds);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [bedMenuVisible, setBedMenuVisible] = useState(false);

  // Load beds on mount
  useEffect(() => {
    if (isAuthenticated) {
      loadBeds();
    }
  }, [isAuthenticated]);

  // Handle messages
  useEffect(() => {
    if (message) {
      showSuccess(message);
      dispatch(clearBedState());
    }
  }, [message, showSuccess, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(clearBedState());
    }
  }, [error, showError, dispatch]);

  const loadBeds = useCallback(async () => {
    try {
      await dispatch(getAllBeds(filters)).unwrap();
    } catch (error) {
      console.log('Load beds error:', error);
    }
  }, [dispatch, filters]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadBeds();
    setRefreshing(false);
  }, [loadBeds]);

  const handleSearch = useCallback(async () => {
    if (searchQuery.trim()) {
      try {
        await dispatch(searchBeds({ query: searchQuery.trim() })).unwrap();
      } catch (error) {
        console.log('Search beds error:', error);
      }
    } else {
      loadBeds();
    }
  }, [searchQuery, dispatch, loadBeds]);

  const handleDeleteBed = useCallback(async (bedId, bedNumber) => {
    const confirmed = await confirmAction(
      'Xác nhận xóa',
      `Bạn có chắc chắn muốn xóa giường ${bedNumber}?`,
      'Xóa',
      'Hủy'
    );

    if (confirmed) {
      try {
        await dispatch(deleteBed(bedId)).unwrap();
        showSuccess('Xóa giường thành công!');
      } catch (error) {
        console.log('Delete bed error:', error);
      }
    }
  }, [dispatch, confirmAction, showSuccess]);

  const handleFilterChange = useCallback((filterType, value) => {
    dispatch(setBedFilters({ [filterType]: value }));
    setFilterMenuVisible(false);
  }, [dispatch]);

  const clearAllFilters = useCallback(() => {
    dispatch(clearBedFilters());
    setFilterMenuVisible(false);
  }, [dispatch]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return '#4CAF50';
      case 'occupied':
        return '#F44336';
      case 'maintenance':
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available':
        return 'Có sẵn';
      case 'occupied':
        return 'Đã sử dụng';
      case 'maintenance':
        return 'Bảo trì';
      default:
        return status;
    }
  };

  const getBedTypeText = (bedType) => {
    switch (bedType) {
      case 'standard':
        return 'Tiêu chuẩn';
      case 'premium':
        return 'Cao cấp';
      case 'vip':
        return 'VIP';
      default:
        return bedType;
    }
  };

  const renderBedItem = ({ item }) => (
    <Card style={styles.bedCard} mode="outlined">
      <Card.Content>
        <View style={styles.bedHeader}>
          <View style={styles.bedInfo}>
            <Text style={styles.bedNumber}>{item.bed_number}</Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item.status) }}
              style={[styles.statusChip, { borderColor: getStatusColor(item.status) }]}
            >
              {getStatusText(item.status)}
            </Chip>
          </View>
          <Menu
            visible={bedMenuVisible && selectedBed === item._id}
            onDismiss={() => setBedMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => {
                  setSelectedBed(item._id);
                  setBedMenuVisible(true);
                }}
                style={styles.menuButton}
              >
                <MaterialIcons name="more-vert" size={24} color="#666" />
              </TouchableOpacity>
            }
          >
            <Menu.Item
              onPress={() => {
                setBedMenuVisible(false);
                navigation.navigate('BedDetail', { bedId: item._id });
              }}
              title="Xem chi tiết"
              leadingIcon="eye"
            />
            <Menu.Item
              onPress={() => {
                setBedMenuVisible(false);
                navigation.navigate('EditBed', { bed: item });
              }}
              title="Chỉnh sửa"
              leadingIcon="pencil"
            />
            <Divider />
            <Menu.Item
              onPress={() => {
                setBedMenuVisible(false);
                handleDeleteBed(item._id, item.bed_number);
              }}
              title="Xóa"
              leadingIcon="delete"
              titleStyle={{ color: '#F44336' }}
            />
          </Menu>
        </View>

        <View style={styles.bedDetails}>
          <View style={styles.detailRow}>
            <MaterialCommunityIcons name="bed" size={16} color="#666" />
            <Text style={styles.detailText}>
              Loại: {getBedTypeText(item.bed_type)}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <MaterialIcons name="room" size={16} color="#666" />
            <Text style={styles.detailText}>
              Phòng: {item.room_id}
            </Text>
          </View>

          <View style={styles.detailRow}>
            <MaterialIcons name="schedule" size={16} color="#666" />
            <Text style={styles.detailText}>
              Cập nhật: {new Date(item.updated_at).toLocaleDateString('vi-VN')}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialCommunityIcons name="bed-empty" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có giường nào</Text>
      <Text style={styles.emptySubtext}>
        Nhấn nút + để thêm giường mới
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Quản lý Giường</Text>
        <TouchableOpacity
          onPress={() => setFilterMenuVisible(true)}
          style={styles.filterButton}
        >
          <MaterialIcons name="filter-list" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <Searchbar
        placeholder="Tìm kiếm giường..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        onSubmitEditing={handleSearch}
        style={styles.searchBar}
        icon="magnify"
      />

      {/* Filter Menu */}
      <Menu
        visible={filterMenuVisible}
        onDismiss={() => setFilterMenuVisible(false)}
        anchor={<View />}
        style={styles.filterMenu}
      >
        <Menu.Item
          onPress={() => handleFilterChange('status', 'available')}
          title="Có sẵn"
          leadingIcon="check-circle"
        />
        <Menu.Item
          onPress={() => handleFilterChange('status', 'occupied')}
          title="Đã sử dụng"
          leadingIcon="account"
        />
        <Menu.Item
          onPress={() => handleFilterChange('status', 'maintenance')}
          title="Bảo trì"
          leadingIcon="wrench"
        />
        <Divider />
        <Menu.Item
          onPress={() => handleFilterChange('bed_type', 'standard')}
          title="Tiêu chuẩn"
          leadingIcon="bed"
        />
        <Menu.Item
          onPress={() => handleFilterChange('bed_type', 'premium')}
          title="Cao cấp"
          leadingIcon="star"
        />
        <Menu.Item
          onPress={() => handleFilterChange('bed_type', 'vip')}
          title="VIP"
          leadingIcon="crown"
        />
        <Divider />
        <Menu.Item
          onPress={clearAllFilters}
          title="Xóa bộ lọc"
          leadingIcon="close"
        />
      </Menu>

      {/* Active Filters */}
      {(filters.status || filters.bed_type) && (
        <View style={styles.activeFilters}>
          <Text style={styles.filterLabel}>Bộ lọc:</Text>
          {filters.status && (
            <Chip
              mode="outlined"
              onClose={() => handleFilterChange('status', '')}
              style={styles.filterChip}
            >
              {getStatusText(filters.status)}
            </Chip>
          )}
          {filters.bed_type && (
            <Chip
              mode="outlined"
              onClose={() => handleFilterChange('bed_type', '')}
              style={styles.filterChip}
            >
              {getBedTypeText(filters.bed_type)}
            </Chip>
          )}
        </View>
      )}

      {/* Bed List */}
      <FlatList
        data={beds}
        renderItem={renderBedItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />

      {/* FAB */}
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('AddBed')}
        label="Thêm giường"
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  searchBar: {
    margin: 16,
    elevation: 2,
  },
  filterMenu: {
    marginTop: 8,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  filterChip: {
    marginRight: 8,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  bedCard: {
    marginBottom: 12,
    elevation: 2,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bedNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusChip: {
    height: 24,
  },
  menuButton: {
    padding: 4,
  },
  bedDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default BedListScreen; 