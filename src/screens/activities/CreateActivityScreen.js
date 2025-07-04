import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  HelperText, 
  Divider, 
  Text,
  SegmentedButtons,
  Chip,
  Switch,
  List,
  IconButton,
  Menu
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch } from 'react-redux';
import { createActivity } from '../../redux/slices/activitySlice';

const ACTIVITY_TYPES = [
  { value: 'physical', label: 'Thể chất', icon: 'dumbbell' },
  { value: 'social', label: 'Xã hội', icon: 'account-group' },
  { value: 'cognitive', label: 'Nhận thức', icon: 'brain' },
  { value: 'creative', label: 'Sáng tạo', icon: 'palette' },
  { value: 'spiritual', label: 'Tâm linh', icon: 'hand-peace' },
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

const CreateActivityScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('physical');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('45');
  const [location, setLocation] = useState('Phòng hoạt động');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [participants, setParticipants] = useState('10');
  const [facilitator, setFacilitator] = useState('');
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Tên hoạt động là bắt buộc';
    if (!description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (!location.trim()) newErrors.location = 'Địa điểm là bắt buộc';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      newErrors.duration = 'Nhập thời lượng hợp lệ';
    }
    if (isNaN(parseInt(participants)) || parseInt(participants) <= 0) {
      newErrors.participants = 'Nhập số lượng người tham gia hợp lệ';
    }
    if (!facilitator.trim()) newErrors.facilitator = 'Người hướng dẫn là bắt buộc';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials([
        ...materials,
        { 
          id: Date.now().toString(),
          name: newMaterial,
          quantity: isNaN(parseInt(newMaterialQuantity)) ? 1 : parseInt(newMaterialQuantity)
        }
      ]);
      setNewMaterial('');
      setNewMaterialQuantity('1');
    }
  };
  
  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter(item => item.id !== id));
  };
  
  const handleSubmit = () => {
    if (!validate()) return;
    
    const scheduledTime = new Date(date);
    scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    const activityData = {
      name,
      description,
      type: activityType,
      scheduledTime: scheduledTime.toISOString(),
      durationMinutes: parseInt(duration),
      location,
      participants: parseInt(participants),
      facilitator,
      materials,
      isRecurring,
    };
    
    dispatch(createActivity(activityData))
      .unwrap()
      .then(() => {
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error creating activity:', error);
      });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        <SegmentedButtons
          value={activityType}
          onValueChange={setActivityType}
          buttons={ACTIVITY_TYPES}
          style={styles.segmentedButtons}
        />
        
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
          label="Số người tham gia tối đa"
          value={participants}
          onChangeText={setParticipants}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.participants}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.participants}>
          {errors.participants}
        </HelperText>
        
        <TextInput
          label="Người hướng dẫn"
          value={facilitator}
          onChangeText={setFacilitator}
          style={styles.input}
          error={!!errors.facilitator}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.facilitator}>
          {errors.facilitator}
        </HelperText>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Hoạt động định kỳ</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} />
        </View>
        
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Vật liệu cần thiết</Text>
        
        <View style={styles.materialsContainer}>
          {materials.map((material) => (
            <Chip
              key={material.id}
              onClose={() => handleRemoveMaterial(material.id)}
              style={styles.materialChip}
              icon="package-variant"
            >
              {material.name} (x{material.quantity})
            </Chip>
          ))}
        </View>
        
        <View style={styles.addMaterialContainer}>
          <TextInput
            label="Tên vật liệu"
            value={newMaterial}
            onChangeText={setNewMaterial}
            style={[styles.input, { flex: 2 }]}
            mode="outlined"
          />
          <TextInput
            label="SL"
            value={newMaterialQuantity}
            onChangeText={setNewMaterialQuantity}
            keyboardType="numeric"
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            mode="outlined"
          />
          <IconButton
            icon="plus-circle"
            size={30}
            onPress={handleAddMaterial}
            style={{ alignSelf: 'center' }}
          />
        </View>
        
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
  segmentedButtons: {
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  switchLabel: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  materialChip: {
    margin: 4,
    backgroundColor: COLORS.background,
  },
  addMaterialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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