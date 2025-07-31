import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, FlatList, SafeAreaView } from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  HelperText, 
  Divider, 
  Text,
  Chip,
  List,
  IconButton,
  Menu,
  Checkbox,
  Card,
  Avatar,
  ActivityIndicator
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { createActivity } from '../../redux/slices/activitySlice';

// Import services
import activityService from '../../api/services/activityService';
import activityParticipationService from '../../api/services/activityParticipationService';
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';

const ACTIVITY_TYPES = [
  { value: 'Thể thao', label: 'Thể thao', icon: 'run' },
  { value: 'Xã hội', label: 'Xã hội', icon: 'account-group' },
  { value: 'Nhận thức', label: 'Nhận thức', icon: 'brain' },
  { value: 'Sáng tạo', label: 'Sáng tạo', icon: 'palette' },
  { value: 'Tâm lý', label: 'Tâm lý', icon: 'heart' },
  { value: 'Y tế', label: 'Y tế', icon: 'medical-bag' },
  { value: 'Giải trí', label: 'Giải trí', icon: 'music' },
  { value: 'Học tập', label: 'Học tập', icon: 'book' },
  { value: 'Khác', label: 'Khác', icon: 'dots-horizontal' },
];

const LOCATIONS = [
  'Phòng hoạt động',
  'Khu vực chung',
  'Phòng ăn',
  'Vườn',
  'Phòng trị liệu',
  'Thư viện',
  'Sân hiên ngoài trời',
  'Phòng riêng',
];

// ActivityTypeChip component
const ActivityTypeChip = ({ type, isSelected, onPress }) => {
  const iconColor = isSelected ? '#FFFFFF' : COLORS.primary;
  
  console.log(`DEBUG: ${type.label} - isSelected: ${isSelected}, iconColor: ${iconColor}`);
  
  return (
    <Chip
      selected={isSelected}
      onPress={onPress}
      style={[
        styles.activityTypeChip,
        isSelected && styles.selectedChip
      ]}
      textStyle={[
        styles.chipText,
        isSelected && styles.selectedChipText
      ]}
      icon={({ size }) => (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <IconButton
            icon={type.icon}
            size={size - 4}
            iconColor={iconColor}
            disabled
            style={{ margin: 0, padding: 0 }}
          />
        </View>
      )}
    >
      {type.label}
    </Chip>
  );
};

const CreateActivityScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('Thể thao');
  const [customActivityType, setCustomActivityType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('45');
  const [location, setLocation] = useState('Phòng hoạt động');
  const [capacity, setCapacity] = useState('10');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [errors, setErrors] = useState({});
  
  // New states for real data
  const [residents, setResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Dropdown picker states
  const [locationOpen, setLocationOpen] = useState(false);
  const [residentsOpen, setResidentsOpen] = useState(false);
  
  // Helper functions
  const getSelectedResidentsData = () => {
    return residents.filter(resident => selectedResidents.includes(resident._id));
  };

  const getAvailableResidents = () => {
    return residents.filter(resident => !selectedResidents.includes(resident._id));
  };

  // Load residents from API
  useEffect(() => {
    loadResidents();
  }, []);

  const loadResidents = async () => {
    try {
      setLoadingResidents(true);
      const response = await residentService.getAllResidents();
      if (response.success) {
        const residentsData = response.data || [];
        
        // Fetch bed assignments for each resident
        const residentsWithBedInfo = await Promise.all(
          residentsData.map(async (resident) => {
            try {
              // Calculate age from birth date
              let age = 'N/A';
              if (resident.birth_date) {
                const birthDate = new Date(resident.birth_date);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                  age--;
                }
              }
              
              // Fetch bed assignment
              let bedInfo = null;
              try {
                const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
                if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                  bedInfo = bedResponse.data[0]; // Take the first assignment
                }
              } catch (bedError) {
                console.log(`No bed assignment found for resident ${resident._id}:`, bedError.message);
              }
              
              return {
                ...resident,
                age: age,
                bed_info: bedInfo
              };
            } catch (error) {
              console.error(`Error processing resident ${resident._id}:`, error);
              return {
                ...resident,
                age: 'N/A',
                bed_info: null
              };
            }
          })
        );
        
        setResidents(residentsWithBedInfo);
      } else {
        console.error('Failed to load residents:', response.error);
        Alert.alert('Lỗi', 'Không thể tải danh sách cư dân');
      }
    } catch (error) {
      console.error('Error loading residents:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cư dân');
    } finally {
      setLoadingResidents(false);
    }
  };
  
  // Memoize expensive calculations
  const locationItems = useMemo(() => 
    LOCATIONS.map(loc => ({ label: loc, value: loc })), 
    []
  );

  const residentsItems = () => {
    const availableResidents = getAvailableResidents();
    return availableResidents.map(resident => {
      // Get bed and room information
      let bedRoomInfo = 'Chưa phân công';
      if (resident.bed_info) {
        if (resident.bed_info.room_id) {
          const roomNumber = resident.bed_info.room_id.room_number || 'N/A';
          const bedNumber = resident.bed_info.bed_number || 'N/A';
          bedRoomInfo = `P${roomNumber} - G${bedNumber}`;
        } else if (resident.bed_info.bed_id) {
          const roomNumber = resident.bed_info.bed_id.room_id?.room_number || 'N/A';
          const bedNumber = resident.bed_info.bed_id.bed_number || 'N/A';
          bedRoomInfo = `P${roomNumber} - G${bedNumber}`;
        }
      }
      
      return {
        label: `${resident.full_name} (${bedRoomInfo} • ${resident.age} tuổi)`,
        value: resident._id,
        resident: resident
      };
    });
  };

  // Simple handlers without useCallback to prevent focus issues
  const handleActivityTypeChange = (newType) => {
    console.log(`DEBUG: Pressing ${newType}, current activityType: ${activityType}`);
    setActivityType(newType);
  };

  const handleResidentSelect = (callback) => {
    const value = callback(null);
    if (value && !selectedResidents.includes(value)) {
      setSelectedResidents(prev => [...prev, value]);
    }
  };

  const handleRemoveResident = (residentId) => {
    setSelectedResidents(prev => prev.filter(id => id !== residentId));
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleNameChange = (text) => {
    setName(text);
  };

  const handleDescriptionChange = (text) => {
    setDescription(text);
  };

  const handleCustomActivityTypeChange = (text) => {
    setCustomActivityType(text);
  };

  const handleDurationChange = (text) => {
    setDuration(text);
  };

  const handleCapacityChange = (text) => {
    setCapacity(text);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Tên hoạt động là bắt buộc';
    if (!description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (activityType === 'Khác' && !customActivityType.trim()) {
      newErrors.customActivityType = 'Vui lòng nhập loại hoạt động';
    }
    if (!location.trim()) newErrors.location = 'Địa điểm là bắt buộc';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      newErrors.duration = 'Nhập thời lượng hợp lệ';
    }
    if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      newErrors.capacity = 'Nhập số lượng người tham gia hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleResidentToggle = (residentId) => {
    setSelectedResidents(prev => 
      prev.includes(residentId) 
        ? prev.filter(id => id !== residentId)
        : [...prev, residentId]
    );
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      
      // Prepare activity data according to API structure
      const scheduledTime = new Date(date);
      scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      
      const activityData = {
        activity_name: name,
        description: description,
        activity_type: activityType === 'Khác' ? customActivityType : activityType,
        schedule_time: scheduledTime.toISOString(),
        duration: parseInt(duration),
        location: location,
        capacity: parseInt(capacity)
      };
      
      console.log('Creating activity with data:', activityData);
      
      // Create activity
      const activityResponse = await activityService.createActivity(activityData);
      if (!activityResponse.success) {
        throw new Error(activityResponse.error || 'Không thể tạo hoạt động');
      }
      
      const createdActivity = activityResponse.data;
      console.log('Activity created successfully:', createdActivity);
      
      // Create activity participations for selected residents
      if (selectedResidents.length > 0) {
        const participationDataList = selectedResidents.map(residentId => ({
          staff_id: user._id,
          activity_id: createdActivity._id,
          resident_id: residentId,
          date: scheduledTime.toISOString().split('T')[0], // YYYY-MM-DD format
          attendance_status: 'pending' // Default status as per schema
        }));
        
        console.log('Creating participations:', participationDataList);
        
        const participationResponse = await activityParticipationService.createMultipleActivityParticipations(participationDataList);
        if (!participationResponse.success) {
          console.warn('Failed to create some participations:', participationResponse.error);
        } else {
          console.log('Participations created successfully:', participationResponse.data);
        }
      }
      
      Alert.alert(
        'Thành công',
        'Hoạt động đã được tạo thành công!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error creating activity:', error);
      Alert.alert('Lỗi', error.message || 'Không thể tạo hoạt động. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Tạo hoạt động" titleStyle={FONTS.h2} />
        <Appbar.Action icon="check" onPress={handleSubmit} />
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled={true}
          removeClippedSubviews={false}
        >
          <View style={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Thông tin hoạt động</Text>
            
            <TextInput
              key="activity-name"
              label="Tên hoạt động"
              value={name}
              onChangeText={handleNameChange}
              style={styles.input}
              error={!!errors.name}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>
            
            <TextInput
              key="activity-description"
              label="Mô tả"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={4}
              style={styles.input}
              error={!!errors.description}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>
            
            <Text style={styles.inputLabel}>Loại hoạt động</Text>
            <View style={styles.activityTypeContainer}>
              {ACTIVITY_TYPES.map((type) => {
                const isSelected = activityType === type.value;
                
                return (
                  <ActivityTypeChip
                    key={type.value}
                    type={type}
                    isSelected={isSelected}
                    onPress={() => handleActivityTypeChange(type.value)}
                  />
                );
              })}
            </View>
            
            {activityType === 'Khác' && (
              <>
                <TextInput
                  key="custom-activity-type"
                  label="Nhập loại hoạt động"
                  value={customActivityType}
                  onChangeText={handleCustomActivityTypeChange}
                  style={styles.input}
                  error={!!errors.customActivityType}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.customActivityType}>
                  {errors.customActivityType}
                </HelperText>
              </>
            )}
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Lịch trình</Text>
            
            <View>
              <TextInput
                label="Ngày"
                value={formatDate(date)}
                onPressIn={() => setShowDatePicker(true)}
                right={<TextInput.Icon icon="calendar" />}
                mode="outlined"
                editable={false}
                style={styles.input}
              />
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                />
              )}
              
              <TextInput
                label="Thời gian"
                value={formatTime(time)}
                onPressIn={() => setShowTimePicker(true)}
                right={<TextInput.Icon icon="clock-outline" />}
                mode="outlined"
                editable={false}
                style={styles.input}
              />
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display="default"
                  onChange={handleTimeChange}
                />
              )}
              
              <TextInput
                key="duration"
                label="Thời lượng (phút)"
                value={duration}
                onChangeText={handleDurationChange}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.duration}
                mode="outlined"
              />
              <HelperText type="error" visible={!!errors.duration}>
                {errors.duration}
              </HelperText>
              
              <Text style={styles.inputLabel}>Địa điểm</Text>
              <DropDownPicker
                open={locationOpen}
                value={location}
                items={locationItems}
                setOpen={setLocationOpen}
                setValue={handleLocationChange}
                style={styles.dropdownPicker}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                placeholder="Chọn địa điểm"
                zIndex={5000}
                zIndexInverse={1000}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                  showsVerticalScrollIndicator: true,
                }}
                maxHeight={150}
                minHeight={50}
                listItemContainerStyle={styles.listItemContainer}
                listItemLabelStyle={styles.listItemLabel}
              />
              <HelperText type="error" visible={!!errors.location}>
                {errors.location}
              </HelperText>
            </View>
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Tham gia</Text>
            
            <TextInput
              key="capacity"
              label="Sức chứa tối đa"
              value={capacity}
              onChangeText={handleCapacityChange}
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.capacity}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.capacity}>
              {errors.capacity}
            </HelperText>
            
            <Text style={styles.inputLabel}>Người hướng dẫn</Text>
            <View style={styles.facilitatorContainer}>
              <Text style={styles.facilitatorText}>{user?.full_name || 'Nhân viên'}</Text>
              <Text style={styles.facilitatorRole}>{user?.position || 'Nhân viên'}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Đề xuất cư dân tham gia</Text>
            
            {loadingResidents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách cư dân...</Text>
              </View>
            ) : (
              <DropDownPicker
                open={residentsOpen}
                value={null}
                items={residentsItems()}
                setOpen={setResidentsOpen}
                setValue={handleResidentSelect}
                style={styles.dropdownPicker}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                placeholder={`${getAvailableResidents().length} cư dân có sẵn`}
                zIndex={4000}
                zIndexInverse={2000}
                multiple={false}
                searchable={true}
                searchPlaceholder="Tìm kiếm cư dân..."
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                  showsVerticalScrollIndicator: true,
                }}
                maxHeight={200}
                minHeight={50}
                searchTextInputProps={{
                  style: styles.searchInput,
                  placeholderTextColor: COLORS.textSecondary,
                }}
                searchContainerStyle={styles.searchContainer}
                listItemContainerStyle={styles.listItemContainer}
                listItemLabelStyle={styles.listItemLabel}
              />
            )}
            
            {selectedResidents.length > 0 && (
              <View style={styles.selectedResidentsContainer}>
                <Text style={styles.selectedResidentsTitle}>
                  Cư dân đã chọn ({selectedResidents.length})
                </Text>
                <View style={styles.selectedResidentsList}>
                  {getSelectedResidentsData().map((resident) => (
                    <Chip
                      key={resident._id}
                      style={styles.selectedResidentChip}
                      textStyle={styles.selectedResidentChipText}
                      onClose={() => handleRemoveResident(resident._id)}
                      closeIcon="close"
                    >
                      {resident.full_name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Đang tạo...' : 'Tạo hoạt động'}
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 12,
    marginTop: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 4,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  activityTypeChip: {
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.surface,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  facilitatorContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  facilitatorText: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  facilitatorRole: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  selectedResidentsContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  selectedResidentsTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  selectedResidentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedResidentChip: {
    backgroundColor: COLORS.primary,
    marginBottom: 4,
  },
  selectedResidentChipText: {
    color: COLORS.surface,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
  },
  dropdownPicker: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownContainerStyle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 8,
  },
  searchInput: {
    fontSize: 16,
    color: COLORS.text,
  },
  searchContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  listItemContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  listItemLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: COLORS.textSecondary,
  },
});

export default CreateActivityScreen; 