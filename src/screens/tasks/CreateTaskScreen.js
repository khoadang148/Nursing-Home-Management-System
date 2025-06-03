import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, TextInput, Button, HelperText, Divider, Text, Menu, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { assignTask, fetchAllStaff } from '../../redux/slices/staffSlice';

const PRIORITIES = ['Cao', 'Trung bình', 'Thấp'];
const CATEGORIES = ['Thuốc', 'Dấu hiệu sinh tồn', 'Liệu pháp', 'Điều trị', 'Vệ sinh', 'Dinh dưỡng', 'Khác'];

// Mock residents data - in a real app, would come from an API or Redux store
const MOCK_RESIDENTS = [
  { id: '1', name: 'John Doe', roomNumber: '101' },
  { id: '2', name: 'Mary Smith', roomNumber: '102' },
  { id: '3', name: 'William Johnson', roomNumber: '103' },
  { id: '4', name: 'Patricia Brown', roomNumber: '104' },
  { id: '5', name: 'Robert Davis', roomNumber: '105' },
];

const CreateTaskScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { isLoading, error, staff } = useSelector((state) => state.staff);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueTime, setDueTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState('Trung bình');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [category, setCategory] = useState('Thuốc');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [resident, setResident] = useState(null);
  const [showResidentsMenu, setShowResidentsMenu] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showStaffMenu, setShowStaffMenu] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch staff list when component mounts
    dispatch(fetchAllStaff());
  }, [dispatch]);
  
  const validate = () => {
    const newErrors = {};
    const now = new Date();
    const selectedDateTime = new Date(dueDate);
    selectedDateTime.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
    
    if (!title.trim()) newErrors.title = 'Tiêu đề là bắt buộc';
    if (!description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (!resident) newErrors.resident = 'Cư dân là bắt buộc';
    if (!selectedStaff) newErrors.staff = 'Nhân viên được giao là bắt buộc';
    if (selectedDateTime < now) newErrors.dueDate = 'Thời gian đến hạn phải lớn hơn thời gian hiện tại';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateTask = () => {
    if (!validate()) return;

    Alert.alert(
      "Xác nhận",
      "Bạn có chắc chắn muốn tạo nhiệm vụ này?",
      [
        {
          text: "Hủy",
          style: "cancel"
        },
        {
          text: "Tạo",
          onPress: async () => {
            const combinedDueDate = new Date(dueDate);
            combinedDueDate.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
            
            const taskData = {
              title,
              description,
              dueDate: combinedDueDate.toISOString(),
              priority,
              status: 'Chờ xử lý',
              category,
              residentId: resident?.id,
              residentName: resident?.name,
              roomNumber: resident?.roomNumber,
              assignedTo: selectedStaff?.id
            };

            try {
              const result = await dispatch(assignTask({ 
                staffId: selectedStaff.id, 
                taskData 
              })).unwrap();
              
              Alert.alert(
                "Thành công",
                "Nhiệm vụ đã được tạo thành công!",
                [
                  { 
                    text: "OK", 
                    onPress: () => navigation.reset({
                      index: 0,
                      routes: [{ name: 'TaskList' }],
                    })
                  }
                ]
              );
            } catch (err) {
              Alert.alert(
                "Lỗi",
                err.message || "Không thể tạo nhiệm vụ. Vui lòng thử lại sau."
              );
            }
          }
        }
      ]
    );
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} color={COLORS.surface} />
        <Appbar.Content title="Tạo Nhiệm Vụ Mới" color={COLORS.surface} />
      </Appbar.Header>

      <ScrollView style={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Thông tin nhiệm vụ</Text>
        
        <TextInput
          label="Tiêu đề"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          error={!!errors.title}
          mode="outlined"
        />
        {!!errors.title && (
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>
        )}

        <TextInput
          label="Mô tả"
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          error={!!errors.description}
          mode="outlined"
          multiline
          numberOfLines={4}
        />
        {!!errors.description && (
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>
        )}

        <View style={styles.dateTimeContainer}>
          <TouchableOpacity
            style={[styles.dateTimeButton, !!errors.dueDate && styles.errorBorder]}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateTimeLabel}>Ngày đến hạn:</Text>
            <Text style={styles.dateTimeValue}>{formatDate(dueDate)}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.dateTimeButton, !!errors.dueDate && styles.errorBorder]}
            onPress={() => setShowTimePicker(true)}
          >
            <Text style={styles.dateTimeLabel}>Giờ đến hạn:</Text>
            <Text style={styles.dateTimeValue}>{formatTime(dueTime)}</Text>
          </TouchableOpacity>
        </View>
        {!!errors.dueDate && (
          <HelperText type="error" visible={!!errors.dueDate}>
            {errors.dueDate}
          </HelperText>
        )}

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            value={dueTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) {
                setDueTime(selectedTime);
              }
            }}
          />
        )}

        <Menu
          visible={showPriorityMenu}
          onDismiss={() => setShowPriorityMenu(false)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowPriorityMenu(true)}
            >
              <Text style={styles.menuButtonText}>Độ ưu tiên: {priority}</Text>
            </TouchableOpacity>
          }
        >
          {PRIORITIES.map((item) => (
            <Menu.Item
              key={item}
              onPress={() => {
                setPriority(item);
                setShowPriorityMenu(false);
              }}
              title={item}
            />
          ))}
        </Menu>

        <Menu
          visible={showCategoryMenu}
          onDismiss={() => setShowCategoryMenu(false)}
          anchor={
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setShowCategoryMenu(true)}
            >
              <Text style={styles.menuButtonText}>Danh mục: {category}</Text>
            </TouchableOpacity>
          }
        >
          {CATEGORIES.map((item) => (
            <Menu.Item
              key={item}
              onPress={() => {
                setCategory(item);
                setShowCategoryMenu(false);
              }}
              title={item}
            />
          ))}
        </Menu>

        <Divider style={styles.divider} />

        <Text style={styles.sectionTitle}>Cư dân</Text>
        <Menu
          visible={showResidentsMenu}
          onDismiss={() => setShowResidentsMenu(false)}
          anchor={
            <TouchableOpacity 
              style={[styles.residentSelector, !!errors.resident && styles.errorBorder]}
              onPress={() => setShowResidentsMenu(true)}
            >
              {resident ? (
                <View>
                  <Text style={styles.residentName}>{resident.name}</Text>
                  <Text style={styles.roomNumber}>Phòng {resident.roomNumber}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Chọn cư dân</Text>
              )}
            </TouchableOpacity>
          }
        >
          {MOCK_RESIDENTS.map((item) => (
            <Menu.Item
              key={item.id}
              onPress={() => {
                setResident(item);
                setShowResidentsMenu(false);
              }}
              title={`${item.name} (Phòng ${item.roomNumber})`}
            />
          ))}
        </Menu>
        {!!errors.resident && (
          <HelperText type="error" visible={!!errors.resident}>
            {errors.resident}
          </HelperText>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Phân công</Text>
        <Menu
          visible={showStaffMenu}
          onDismiss={() => setShowStaffMenu(false)}
          anchor={
            <TouchableOpacity 
              style={[styles.staffSelector, !!errors.staff && styles.errorBorder]}
              onPress={() => setShowStaffMenu(true)}
            >
              {selectedStaff ? (
                <View>
                  <Text style={styles.staffName}>{selectedStaff.name}</Text>
                  <Text style={styles.staffRole}>{selectedStaff.role}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Chọn nhân viên</Text>
              )}
            </TouchableOpacity>
          }
        >
          {staff.map((item) => (
            <Menu.Item
              key={item.id}
              onPress={() => {
                setSelectedStaff(item);
                setShowStaffMenu(false);
              }}
              title={`${item.name} (${item.role})`}
            />
          ))}
        </Menu>
        {!!errors.staff && (
          <HelperText type="error" visible={!!errors.staff}>
            {errors.staff}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleCreateTask}
          style={styles.createButton}
          loading={isLoading}
          disabled={isLoading}
        >
          Tạo Nhiệm Vụ
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
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 50,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: 4,
  },
  dateTimeLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  dateTimeValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  menuButton: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  menuButtonText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: COLORS.border,
  },
  residentSelector: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  staffSelector: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  residentName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  staffName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  roomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  staffRole: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  placeholderText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
});

export default CreateTaskScreen; 