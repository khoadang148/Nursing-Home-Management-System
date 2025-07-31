import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
} from 'react-native';
import { Card, Chip, Searchbar, Button, ActivityIndicator, Appbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import bedAssignmentService from '../../api/services/bedAssignmentService';

const BedListScreen = ({ navigation }) => {
  const [bedAssignments, setBedAssignments] = useState([]);
  const [filteredBedAssignments, setFilteredBedAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const loadBedAssignments = async () => {
    try {
      setLoading(true);
      const response = await bedAssignmentService.getAllBedAssignments();
      if (response.success) {
        setBedAssignments(response.data || []);
        setFilteredBedAssignments(response.data || []);
      } else {
        throw new Error('Không thể tải danh sách phân công giường');
      }
    } catch (error) {
      console.error('Error loading bed assignments:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phân công giường');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBedAssignments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBedAssignments();
    setRefreshing(false);
  };

  const filterBedAssignments = () => {
    let filtered = bedAssignments;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(assignment => 
        assignment.resident_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        assignment.bed_id?.bed_number?.toString().includes(searchQuery) ||
        assignment.bed_id?.room_id?.room_number?.toString().includes(searchQuery)
      );
    }

    // Filter by status
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(assignment => {
        if (selectedFilter === 'occupied') {
          return !assignment.unassigned_date;
        } else if (selectedFilter === 'available') {
          return assignment.unassigned_date;
        }
        return true;
      });
    }

    setFilteredBedAssignments(filtered);
  };

  useEffect(() => {
    filterBedAssignments();
  }, [bedAssignments, searchQuery, selectedFilter]);

  const getStatusColor = (assignment) => {
    if (assignment.unassigned_date) {
      return COLORS.success; // Available
    }
    return COLORS.primary; // Occupied
  };

  const getStatusText = (assignment) => {
    if (assignment.unassigned_date) {
      return 'Trống';
    }
    return 'Đã phân công';
  };

  const getBedTypeText = (bedType) => {
    switch (bedType) {
      case 'standard': return 'Tiêu chuẩn';
      case 'premium': return 'Cao cấp';
      case 'vip': return 'VIP';
      case 'medical': return 'Y tế';
      default: return bedType || 'Không xác định';
    }
  };

  const renderBedItem = ({ item }) => (
    <Card style={styles.bedCard}>
      <Card.Content>
        <View style={styles.bedHeader}>
          <View style={styles.bedInfo}>
            <Text style={styles.bedNumber}>Giường {item.bed_id?.bed_number}</Text>
            <Chip
              mode="outlined"
              textStyle={{ color: getStatusColor(item) }}
              style={[styles.statusChip, { borderColor: getStatusColor(item) }]}
            >
              {getStatusText(item)}
            </Chip>
          </View>
          <TouchableOpacity
            onPress={() => {
              // Assuming navigation is available from props or context
              // navigation.navigate('BedDetail', { bedId: item._id });
            }}
            style={styles.menuButton}
          >
            <MaterialIcons name="more-vert" size={24} color="#666" />
          </TouchableOpacity>
        </View>

        <View style={styles.bedDetails}>
          <View style={styles.detailRow}>
            <MaterialIcons name="bed" size={16} color="#666" />
            <Text style={styles.detailText}>
              Loại: {getBedTypeText(item.bed_id?.bed_type)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <MaterialIcons name="room" size={16} color="#666" />
            <Text style={styles.detailText}>
              Phòng: {item.bed_id?.room_id?.room_number}
            </Text>
          </View>
          {item.resident_id && (
            <View style={styles.detailRow}>
              <MaterialIcons name="person" size={16} color="#666" />
              <Text style={styles.detailText}>
                Cư dân: {item.resident_id.full_name}
              </Text>
            </View>
          )}
          {item.assigned_date && (
            <View style={styles.detailRow}>
              <MaterialIcons name="calendar-today" size={16} color="#666" />
              <Text style={styles.detailText}>
                Ngày phân công: {new Date(item.assigned_date).toLocaleDateString('vi-VN')}
              </Text>
            </View>
          )}
        </View>
      </Card.Content>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="bed-empty" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có giường nào</Text>
      <Text style={styles.emptySubtext}>
        Nhấn nút + để thêm giường mới
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản lý phân giường" />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Tìm kiếm giường..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={filterBedAssignments}
          style={styles.searchBar}
          icon="magnify"
        />

        {/* Filter Menu */}
        <View style={styles.filterMenu}>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('all')}
            selected={selectedFilter === 'all'}
            style={styles.filterChip}
          >
            Tất cả
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('occupied')}
            selected={selectedFilter === 'occupied'}
            style={styles.filterChip}
          >
            Đã phân công
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('available')}
            selected={selectedFilter === 'available'}
            style={styles.filterChip}
          >
            Trống
          </Chip>
        </View>

        {/* Active Filters */}
        {(searchQuery || selectedFilter !== 'all') && (
          <View style={styles.activeFilters}>
            <Text style={styles.filterLabel}>Bộ lọc:</Text>
            {searchQuery && (
              <Chip
                mode="outlined"
                onClose={() => setSearchQuery('')}
                style={styles.filterChip}
              >
                Tìm kiếm: "{searchQuery}"
              </Chip>
            )}
            {selectedFilter !== 'all' && (
              <Chip
                mode="outlined"
                onClose={() => setSelectedFilter('all')}
                style={styles.filterChip}
              >
                Trạng thái: {getStatusText({ unassigned_date: selectedFilter === 'available' })}
              </Chip>
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={filteredBedAssignments}
            renderItem={renderBedItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 2,
    paddingTop: 0, // Loại bỏ padding mặc định
    paddingBottom: 0, // Loại bỏ padding mặc định
    height: 56, // Chiều cao cố định
    justifyContent: 'center', // Căn giữa nội dung theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  content: {
    flex: 1,
    padding: 16,
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
    marginBottom: 16,
    elevation: 2,
  },
  filterMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  filterChip: {
    margin: 4,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  listContainer: {
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
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default BedListScreen; 