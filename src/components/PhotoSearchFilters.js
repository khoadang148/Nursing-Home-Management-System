import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  ScrollView,
} from 'react-native';
import {
  Button,
  Chip,
  Divider,
  RadioButton,
  Checkbox,
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const PhotoSearchFilters = ({ 
  visible, 
  onClose, 
  onApplyFilters,
  currentFilters = {} 
}) => {
  const [filters, setFilters] = useState({
    residents: [],
    activities: [],
    dateRange: 'all', // all, today, week, month, custom
    staff: [],
    tags: [],
    ...currentFilters
  });

  const residents = [
    { id: 'resident1', name: 'Cụ Nguyễn Văn Nam' },
    { id: 'resident2', name: 'Cụ Trần Thị Hoa' },
    { id: 'resident3', name: 'Cụ Lê Văn Minh' },
  ];

  const activities = [
    'Hoạt động thể chất',
    'Bữa ăn',
    'Hoạt động tinh thần',
    'Thăm viếng gia đình',
    'Sinh nhật/Lễ hội',
    'Học tập',
    'Dạo chơi',
    'Hoạt động xã hội',
  ];

  const staff = [
    'Nhân viên Mai',
    'Nhân viên Lan',
    'Nhân viên Hoa',
    'Nhân viên Minh',
    'Nhân viên Tâm',
  ];

  const tags = [
    'Vui vẻ',
    'Khỏe mạnh',
    'Tích cực',
    'Hạnh phúc',
    'Gia đình',
    'Yêu thương',
    'Sáng tạo',
    'Học hỏi',
    'Nghệ thuật',
    'Thư giãn',
    'Tự nhiên',
  ];

  const dateRanges = [
    { value: 'all', label: 'Tất cả' },
    { value: 'today', label: 'Hôm nay' },
    { value: 'week', label: 'Tuần này' },
    { value: 'month', label: 'Tháng này' },
    { value: 'custom', label: 'Tùy chọn' },
  ];

  const handleResidentToggle = (residentId) => {
    setFilters(prev => ({
      ...prev,
      residents: prev.residents.includes(residentId)
        ? prev.residents.filter(id => id !== residentId)
        : [...prev.residents, residentId]
    }));
  };

  const handleActivityToggle = (activity) => {
    setFilters(prev => ({
      ...prev,
      activities: prev.activities.includes(activity)
        ? prev.activities.filter(a => a !== activity)
        : [...prev.activities, activity]
    }));
  };

  const handleStaffToggle = (staffMember) => {
    setFilters(prev => ({
      ...prev,
      staff: prev.staff.includes(staffMember)
        ? prev.staff.filter(s => s !== staffMember)
        : [...prev.staff, staffMember]
    }));
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  const handleDateRangeChange = (value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: value
    }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      residents: [],
      activities: [],
      dateRange: 'all',
      staff: [],
      tags: [],
    });
  };

  const renderSection = (title, children) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Bộ lọc tìm kiếm</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetButton}>
            <Text style={styles.resetText}>Đặt lại</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Residents Filter */}
          {renderSection('Người thân', (
            <View style={styles.checkboxGroup}>
              {residents.map(resident => (
                <TouchableOpacity
                  key={resident.id}
                  style={styles.checkboxItem}
                  onPress={() => handleResidentToggle(resident.id)}
                >
                  <Checkbox
                    status={filters.residents.includes(resident.id) ? 'checked' : 'unchecked'}
                    onPress={() => handleResidentToggle(resident.id)}
                  />
                  <Text style={styles.checkboxLabel}>{resident.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Date Range Filter */}
          {renderSection('Thời gian', (
            <View style={styles.segmentedGroup}>
              {dateRanges.map(range => (
                <TouchableOpacity
                  key={range.value}
                  style={[
                    styles.segment,
                    filters.dateRange === range.value && styles.segmentActive
                  ]}
                  onPress={() => handleDateRangeChange(range.value)}
                >
                  <Text style={[styles.segmentText, filters.dateRange === range.value && styles.segmentTextActive]}>
                    {range.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Activities Filter */}
          {renderSection('Loại hoạt động', (
            <View style={styles.chipContainer}>
              {activities.map(activity => (
                <Chip
                  key={activity}
                  mode={filters.activities.includes(activity) ? 'flat' : 'outlined'}
                  selected={filters.activities.includes(activity)}
                  onPress={() => handleActivityToggle(activity)}
                  style={[
                    styles.chip,
                    filters.activities.includes(activity) && styles.chipSelected
                  ]}
                  textStyle={filters.activities.includes(activity) && styles.chipTextSelected}
                >
                  {activity}
                </Chip>
              ))}
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Staff Filter */}
          {renderSection('Nhân viên tải lên', (
            <View style={styles.chipContainer}>
              {staff.map(staffMember => (
                <Chip
                  key={staffMember}
                  mode={filters.staff.includes(staffMember) ? 'flat' : 'outlined'}
                  selected={filters.staff.includes(staffMember)}
                  onPress={() => handleStaffToggle(staffMember)}
                  style={[
                    styles.chip,
                    filters.staff.includes(staffMember) && styles.chipSelected
                  ]}
                  textStyle={filters.staff.includes(staffMember) && styles.chipTextSelected}
                >
                  {staffMember}
                </Chip>
              ))}
            </View>
          ))}

          <Divider style={styles.divider} />

          {/* Tags Filter */}
          {renderSection('Tags', (
            <View style={styles.chipContainer}>
              {tags.map(tag => (
                <Chip
                  key={tag}
                  mode={filters.tags.includes(tag) ? 'flat' : 'outlined'}
                  selected={filters.tags.includes(tag)}
                  onPress={() => handleTagToggle(tag)}
                  style={[
                    styles.chip,
                    filters.tags.includes(tag) && styles.chipSelected
                  ]}
                  textStyle={filters.tags.includes(tag) && styles.chipTextSelected}
                >
                  {tag}
                </Chip>
              ))}
            </View>
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            mode="contained"
            onPress={handleApply}
            style={styles.applyButton}
            labelStyle={styles.applyButtonText}
          >
            Áp dụng bộ lọc
          </Button>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  resetButton: {
    padding: 8,
  },
  resetText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  divider: {
    backgroundColor: '#f0f0f0',
    height: 1,
  },
  checkboxGroup: {
    marginLeft: -8,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    marginLeft: -8,
  },
  radioLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  chip: {
    margin: 4,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipTextSelected: {
    color: '#fff',
  },
  segmentedGroup: {
    flexDirection: 'row',
    backgroundColor: '#f2f3f5',
    borderRadius: 10,
    padding: 4,
    alignSelf: 'flex-start',
  },
  segment: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 6,
  },
  segmentActive: {
    backgroundColor: COLORS.primary,
  },
  segmentText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  segmentTextActive: {
    color: '#fff',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  applyButton: {
    backgroundColor: COLORS.primary,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PhotoSearchFilters; 