import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
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
  Card
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { createActivity } from '../../redux/slices/activitySlice';

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

// Mock residents data - trong thực tế sẽ load từ API
const MOCK_RESIDENTS = [
  { id: '1', name: 'Nguyễn Văn Nam', room: 'Phòng 101-A', age: 74 },
  { id: '2', name: 'Trần Thị Lan', room: 'Phòng 102-A', age: 76 },
  { id: '3', name: 'Lê Văn Bình', room: 'Phòng 201-B', age: 79 },
  { id: '4', name: 'Phạm Thị Hương', room: 'Phòng 202-C', age: 72 },
];

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
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [capacity, setCapacity] = useState('10');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [errors, setErrors] = useState({});
  
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
  
  const handleSubmit = () => {
    if (!validate()) return;
    
    const scheduledTime = new Date(date);
    scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    const activityData = {
      name,
      description,
      type: activityType === 'Khác' ? customActivityType : activityType,
      scheduledTime: scheduledTime.toISOString(),
      durationMinutes: parseInt(duration),
      location,
      capacity: parseInt(capacity),
      facilitator: user?.full_name || 'Nhân viên',
      selectedResidents,
    };
    
    // Simulate API call
    Alert.alert(
      'Thành công',
      'Hoạt động đã được tạo thành công!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
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
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Thông tin hoạt động</Text>
        
        <TextInput
          label="Tên hoạt động"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!errors.name}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
        
        <TextInput
          label="Mô tả"
          value={description}
          onChangeText={setDescription}
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
          {ACTIVITY_TYPES.map((type) => (
            <Chip
              key={type.value}
              selected={activityType === type.value}
              onPress={() => setActivityType(type.value)}
              style={[
                styles.activityTypeChip,
                activityType === type.value && styles.selectedChip
              ]}
              textStyle={[
                styles.chipText,
                activityType === type.value && styles.selectedChipText
              ]}
              icon={type.icon}
            >
              {type.label}
            </Chip>
          ))}
        </View>
        
        {activityType === 'Khác' && (
          <>
            <TextInput
              label="Nhập loại hoạt động"
              value={customActivityType}
              onChangeText={setCustomActivityType}
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
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
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
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}
          
          <TextInput
            label="Thời lượng (phút)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.duration}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.duration}>
            {errors.duration}
          </HelperText>
          
          <TextInput
            label="Địa điểm"
            value={location}
            onPressIn={() => setShowLocationMenu(true)}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => setShowLocationMenu(true)}
              />
            }
            mode="outlined"
            editable={false}
            style={styles.input}
            error={!!errors.location}
          />
          <HelperText type="error" visible={!!errors.location}>
            {errors.location}
          </HelperText>
          
          <Menu
            visible={showLocationMenu}
            onDismiss={() => setShowLocationMenu(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {LOCATIONS.map((loc) => (
              <Menu.Item
                key={loc}
                title={loc}
                onPress={() => {
                  setLocation(loc);
                  setShowLocationMenu(false);
                }}
              />
            ))}
          </Menu>
        </View>
        
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Tham gia</Text>
        
        <TextInput
          label="Sức chứa tối đa"
          value={capacity}
          onChangeText={setCapacity}
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
        <Card style={styles.residentsCard}>
          <Card.Content>
            {MOCK_RESIDENTS.map((resident) => (
              <List.Item
                key={resident.id}
                title={resident.name}
                description={`${resident.room} • ${resident.age} tuổi`}
                left={() => (
                  <Checkbox
                    status={selectedResidents.includes(resident.id) ? 'checked' : 'unchecked'}
                    onPress={() => handleResidentToggle(resident.id)}
                  />
                )}
                onPress={() => handleResidentToggle(resident.id)}
                style={styles.residentItem}
              />
            ))}
          </Card.Content>
        </Card>
        
        <Text style={styles.selectedCount}>
          Đã chọn: {selectedResidents.length} cư dân
        </Text>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Tạo hoạt động
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 50,
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
  residentsCard: {
    backgroundColor: COLORS.surface,
    marginBottom: 8,
  },
  residentItem: {
    paddingVertical: 4,
  },
  selectedCount: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
  },
  menu: {
    width: '90%',
    maxHeight: 300,
  },
});

export default CreateActivityScreen; 