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
import visitsService from '../../api/services/visitsService';
import dateUtils from '../../utils/dateUtils';
import DateTimePicker from '@react-native-community/datetimepicker';

const VisitsManagementScreen = ({ navigation }) => {
  const [visits, setVisits] = useState([]);
  const [filteredVisits, setFilteredVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadVisits = async () => {
    try {
      setLoading(true);
      const response = await visitsService.getAllVisits();
      if (response.success) {
        setVisits(response.data || []);
        setFilteredVisits(response.data || []);
      } else {
        throw new Error('Không thể tải danh sách lịch thăm');
      }
    } catch (error) {
      console.error('Error loading visits:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách lịch thăm');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVisits();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadVisits();
    setRefreshing(false);
  };

  const categorizeVisits = (visitsList) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return {
      today: visitsList.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
        return visitDateOnly.getTime() === today.getTime();
      }),
      upcoming: visitsList.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
        return visitDateOnly.getTime() > today.getTime();
      }).sort((a, b) => new Date(a.visit_date) - new Date(b.visit_date)), // Sắp xếp tăng dần theo ngày
      past: visitsList.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
        return visitDateOnly.getTime() < today.getTime();
      })
    };
  };

  const filterVisits = () => {
    let filtered = visits;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(visit => 
        visit.family_member_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by selected date
    if (selectedDate) {
      const selectedDateOnly = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      filtered = filtered.filter(visit => {
        const visitDate = new Date(visit.visit_date);
        const visitDateOnly = new Date(visitDate.getFullYear(), visitDate.getMonth(), visitDate.getDate());
        return visitDateOnly.getTime() === selectedDateOnly.getTime();
      });
    }

    // Filter by category
    if (selectedFilter !== 'all') {
      const categorized = categorizeVisits(filtered);
      filtered = categorized[selectedFilter] || [];
    }

    setFilteredVisits(filtered);
  };

  useEffect(() => {
    filterVisits();
  }, [visits, searchQuery, selectedDate, selectedFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed': return 'Hoàn thành';
      case 'pending': return 'Chờ xác nhận';
      case 'cancelled': return 'Đã hủy';
      default: return status || 'Không xác định';
    }
  };

  const formatVisitDate = (dateString) => {
    try {
      return dateUtils.formatDate(dateString, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      return 'Ngày không hợp lệ';
    }
  };

  const formatVisitTime = (timeString) => {
    try {
      return timeString || 'Không có giờ';
    } catch (error) {
      return 'Giờ không hợp lệ';
    }
  };

  const renderItem = ({ item }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
            <Text style={styles.familyName}>{item.family_member_id?.full_name || 'Không rõ'}</Text>
          </View>
        </View>
        
        <View style={styles.dateTimeContainer}>
          <View style={styles.dateTimeRow}>
            <MaterialIcons name="calendar-today" size={18} color={COLORS.textSecondary} />
            <Text style={styles.dateTimeText}>{formatVisitDate(item.visit_date)}</Text>
          </View>
          <View style={styles.dateTimeRow}>
            <MaterialIcons name="access-time" size={18} color={COLORS.textSecondary} />
            <Text style={styles.dateTimeText}>Giờ thăm: {formatVisitTime(item.visit_time)}</Text>
          </View>
        </View>
        
        <View style={styles.purposeContainer}>
          <Text style={styles.purpose}>Mục đích: <Text style={{ fontWeight: 'bold' }}>{item.purpose}</Text></Text>
          <Text style={styles.info}>Số người: {item.numberOfVisitors}</Text>
          {item.notes ? <Text style={styles.notes}>Ghi chú: {item.notes}</Text> : null}
        </View>
      </Card.Content>
    </Card>
  );

  const filterTabs = [
    { value: 'all', label: 'Tất cả' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'upcoming', label: 'Sắp tới' },
    { value: 'past', label: 'Đã qua' },
  ];

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };
  
  const clearDate = () => setSelectedDate(null);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản Lý Lịch Thăm" />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Searchbar
          placeholder="Tìm kiếm theo tên người thăm..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.filterTab,
                selectedFilter === tab.value && styles.filterTabActive
              ]}
              onPress={() => setSelectedFilter(tab.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, selectedFilter === tab.value && styles.filterTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Date Filter */}
        <View style={styles.dateFilterContainer}>
          <TouchableOpacity 
            style={styles.datePickerBtn} 
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="date-range" size={20} color={selectedDate ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.datePickerText, selectedDate && { color: COLORS.primary }]}>
              {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chọn ngày'}
            </Text>
          </TouchableOpacity>
          {selectedDate && (
            <TouchableOpacity onPress={clearDate} style={styles.clearDateBtn}>
              <MaterialIcons name="close" size={16} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>

        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}

        {loading ? (
          <ActivityIndicator size="large" style={{ marginTop: 50 }} />
        ) : (
          <FlatList
            data={filteredVisits}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 24 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Không có lịch thăm nào.</Text>}
          />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  searchBar: {
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginHorizontal: 4,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateFilterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  datePickerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  clearDateBtn: {
    padding: 8,
  },
  card: {
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyName: {
    ...FONTS.body2,
    fontWeight: 'bold',
    color: COLORS.text,
    marginLeft: 8,
  },
  dateTimeContainer: {
    marginBottom: 8,
  },
  dateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dateTimeText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  purposeContainer: {
    marginTop: 8,
  },
  purpose: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: 4,
  },
  info: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  notes: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default VisitsManagementScreen; 