import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { Avatar, Chip, Badge, Searchbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { visits, familyMembers } from '../../api/mockData';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';

const getFamilyName = (family_member_id) => {
  const member = familyMembers.find(f => f.id === family_member_id);
  return member ? member.full_name : 'Không rõ';
};

const getFamilyAvatar = (family_member_id) => {
  const member = familyMembers.find(f => f.id === family_member_id);
  return member ? member.photo : undefined;
};

const getStatusColor = (status) => {
  switch (status) {
    case 'completed': return COLORS.success;
    case 'cancelled': return COLORS.error;
    default: return COLORS.warning;
  }
};

const VisitsManagementScreen = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredVisits, setFilteredVisits] = useState(visits);
  const [filter, setFilter] = useState('upcoming'); // 'upcoming', 'today', 'past'
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    let result = visits;
    // Lọc theo search
    if (searchQuery) {
      result = result.filter(v => {
        const familyName = getFamilyName(v.family_member_id).toLowerCase();
        return familyName.includes(searchQuery.toLowerCase());
      });
    }
    // Lọc theo ngày nếu có selectedDate
    if (selectedDate) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      result = result.filter(v => v.visit_date === dateStr);
    }
    // Lọc theo filter tab
    const today = new Date();
    result = result.filter(v => {
      const visitDate = new Date(v.visit_date);
      switch (filter) {
        case 'today':
          return visitDate.toDateString() === today.toDateString();
        case 'upcoming':
          return visitDate > today;
        case 'past':
          return visitDate < today;
        default:
          return true;
      }
    });
    setFilteredVisits(result);
  }, [searchQuery, filter, selectedDate]);

  // Sắp xếp theo ngày giảm dần
  const sortedVisits = [...filteredVisits].sort((a, b) => new Date(b.visit_date) - new Date(a.visit_date));

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.headerRow}>
        <Avatar.Image source={{ uri: getFamilyAvatar(item.family_member_id) }} size={48} />
        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text style={styles.familyName}>{getFamilyName(item.family_member_id)}</Text>
          <Text style={styles.dateTime}>{item.visit_date} - {item.visit_time}</Text>
        </View>
        {/* Không hiển thị trạng thái */}
      </View>
      <View style={styles.body}>
        <Text style={styles.purpose}>Mục đích: <Text style={{ fontWeight: 'bold' }}>{item.purpose}</Text></Text>
        <Text style={styles.info}>Số người: {item.numberOfVisitors}</Text>
        {item.notes ? <Text style={styles.notes}>Ghi chú: {item.notes}</Text> : null}
      </View>
    </TouchableOpacity>
  );

  // Xác định có hiển thị nút back không: nếu có navigation.canGoBack() và không phải tab root
  const showBack = navigation.canGoBack() && route.name !== 'Menu';

  // Tab filter
  const filterTabs = [
    { value: 'today', label: 'Hôm nay' },
    { value: 'upcoming', label: 'Sắp tới' },
    { value: 'past', label: 'Đã qua' },
  ];

  // Date picker
  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) setSelectedDate(date);
  };
  const clearDate = () => setSelectedDate(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={[styles.header, { paddingTop: 16 }]}> 
        <View style={styles.headerContent}>
          {showBack && (
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
          )}
          <Text style={styles.headerTitle}>Quản Lý Lịch Thăm</Text>
          {showBack ? <View style={{ width: 32 }} /> : null}
        </View>
      </View>
      <View style={styles.content}>
        <Searchbar
          placeholder="Tìm theo tên người thân..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchbar}
        />
        <View style={styles.filterTabsWrapper}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[styles.filterTab, filter === tab.value && styles.filterTabActive]}
              onPress={() => setFilter(tab.value)}
              activeOpacity={0.8}
            >
              <Text style={[styles.filterTabText, filter === tab.value && styles.filterTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker(true)}>
            <MaterialIcons name="date-range" size={20} color={selectedDate ? COLORS.primary : COLORS.textSecondary} />
            <Text style={[styles.datePickerText, selectedDate && { color: COLORS.primary }]}> {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chọn ngày'}</Text>
            {selectedDate && (
              <TouchableOpacity onPress={clearDate} style={{ marginLeft: 4 }}>
                <MaterialIcons name="close" size={16} color={COLORS.error} />
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </View>
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate || new Date()}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
        <FlatList
          data={sortedVisits}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 24 }}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 32 }}>Không có lịch thăm nào.</Text>}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: 0,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 0,
    padding: 0,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: COLORS.background,
  },
  searchbar: {
    marginVertical: 16,
  },
  filterTabsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    marginRight: 6,
  },
  filterTabActive: {
    backgroundColor: COLORS.primaryLight,
  },
  filterTabText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTabTextActive: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  datePickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginLeft: 8,
  },
  datePickerText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
      android: { elevation: 2 },
    }),
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  familyName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  dateTime: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    color: '#fff',
    textTransform: 'capitalize',
  },
  body: {
    marginTop: 4,
  },
  purpose: {
    fontSize: 15,
    color: COLORS.text,
    marginBottom: 2,
  },
  info: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  notes: {
    fontSize: 13,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 2,
  },
});

export default VisitsManagementScreen; 