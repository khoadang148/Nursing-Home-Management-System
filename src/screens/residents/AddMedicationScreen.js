import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Alert,
  TouchableOpacity 
} from 'react-native';
import { 
  Appbar, 
  Card, 
  TextInput, 
  Button, 
  Chip,
  Divider,
  Avatar,
  Switch,
  SegmentedButtons,
  List
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddMedicationScreen = ({ navigation, route }) => {
  const residentName = route?.params?.residentName || 'Cư dân';
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedTimeIndex, setSelectedTimeIndex] = useState(null);
  
  const [medication, setMedication] = useState({
    name: '',
    type: 'tablet',
    dosage: '',
    unit: 'mg',
    frequency: 'daily',
    times: ['08:00'],
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    instructions: '',
    sideEffects: '',
    prescribedBy: '',
    isAsNeeded: false,
    foodRequirement: 'none',
    priority: 'normal',
    category: 'general'
  });

  const medicationTypes = [
    { value: 'tablet', label: 'Viên nén', icon: 'pill' },
    { value: 'capsule', label: 'Viên nang', icon: 'capsule' },
    { value: 'liquid', label: 'Dạng lỏng', icon: 'water' },
    { value: 'injection', label: 'Tiêm', icon: 'needle' },
    { value: 'topical', label: 'Bôi ngoài', icon: 'lotion' },
    { value: 'inhaler', label: 'Xịt hít', icon: 'spray-bottle' }
  ];

  const units = ['mg', 'g', 'ml', 'IU', 'mcg', 'viên', 'gói'];

  const frequencies = [
    { value: 'daily', label: 'Hàng ngày', times: 1 },
    { value: 'twice', label: '2 lần/ngày', times: 2 },
    { value: 'thrice', label: '3 lần/ngày', times: 3 },
    { value: 'four', label: '4 lần/ngày', times: 4 },
    { value: 'weekly', label: 'Hàng tuần', times: 1 },
    { value: 'asNeeded', label: 'Khi cần', times: 0 }
  ];

  const foodRequirements = [
    { value: 'none', label: 'Không yêu cầu' },
    { value: 'before', label: 'Trước ăn' },
    { value: 'after', label: 'Sau ăn' },
    { value: 'with', label: 'Trong khi ăn' },
    { value: 'empty', label: 'Khi đói' }
  ];

  const priorities = [
    { value: 'low', label: 'Thấp', color: COLORS.success },
    { value: 'normal', label: 'Bình thường', color: COLORS.warning },
    { value: 'high', label: 'Cao', color: COLORS.error },
    { value: 'critical', label: 'Cấp cứu', color: COLORS.error }
  ];

  const categories = [
    { value: 'general', label: 'Tổng quát', color: COLORS.primary },
    { value: 'heart', label: 'Tim mạch', color: COLORS.error },
    { value: 'diabetes', label: 'Tiểu đường', color: COLORS.warning },
    { value: 'pain', label: 'Giảm đau', color: COLORS.info },
    { value: 'mental', label: 'Tâm thần', color: COLORS.accent },
    { value: 'supplement', label: 'Thực phẩm bổ sung', color: COLORS.success }
  ];

  const handleFrequencyChange = (freq) => {
    const freqData = frequencies.find(f => f.value === freq);
    const defaultTimes = [];
    
    if (freqData.times > 0) {
      for (let i = 0; i < freqData.times; i++) {
        const hour = 8 + (i * 8); // Start at 8 AM, then every 8 hours
        defaultTimes.push(`${hour.toString().padStart(2, '0')}:00`);
      }
    }
    
    setMedication({
      ...medication, 
      frequency: freq,
      times: freq === 'asNeeded' ? [] : defaultTimes
    });
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime && selectedTimeIndex !== null) {
      const newTimes = [...medication.times];
      const timeString = selectedTime.toTimeString().slice(0, 5);
      newTimes[selectedTimeIndex] = timeString;
      setMedication({...medication, times: newTimes});
    }
  };

  const addTime = () => {
    setMedication({
      ...medication,
      times: [...medication.times, '08:00']
    });
  };

  const removeTime = (index) => {
    const newTimes = medication.times.filter((_, i) => i !== index);
    setMedication({...medication, times: newTimes});
  };

  const handleSave = () => {
    if (!medication.name.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên thuốc');
      return;
    }
    
    if (!medication.dosage.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập liều lượng');
      return;
    }

    if (!medication.prescribedBy.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập thông tin bác sĩ kê đơn');
      return;
    }

    if (!medication.isAsNeeded && medication.times.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng thêm thời gian uống thuốc');
      return;
    }

    Alert.alert(
      'Xác nhận',
      'Bạn có muốn thêm thuốc này vào danh sách?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Thêm', 
          onPress: () => {
            Alert.alert('Thành công', 'Đã thêm thuốc vào danh sách', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date;
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Thêm thuốc - ${residentName}`} />
        <Appbar.Action icon="content-save" onPress={handleSave} />
      </Appbar.Header>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Basic Information */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Thông Tin Thuốc"
            left={(props) => <Avatar.Icon {...props} icon="pill" size={40} />}
          />
          <Card.Content>
            <TextInput
              label="Tên thuốc *"
              value={medication.name}
              onChangeText={(text) => setMedication({...medication, name: text})}
              style={styles.input}
              mode="outlined"
              placeholder="VD: Paracetamol"
            />

            <View style={styles.row}>
              <TextInput
                label="Liều lượng *"
                value={medication.dosage}
                onChangeText={(text) => setMedication({...medication, dosage: text})}
                style={[styles.input, styles.flexInput]}
                mode="outlined"
                keyboardType="numeric"
                placeholder="500"
              />
              
              <View style={styles.unitContainer}>
                <Text style={styles.unitLabel}>Đơn vị</Text>
                <View style={styles.unitChips}>
                  {units.map(unit => (
                    <TouchableOpacity
                      key={unit}
                      onPress={() => setMedication({...medication, unit})}
                    >
                      <Chip
                        selected={medication.unit === unit}
                        style={styles.unitChip}
                        compact
                      >
                        {unit}
                      </Chip>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Dạng thuốc</Text>
            <View style={styles.chipContainer}>
              {medicationTypes.map(type => (
                <TouchableOpacity
                  key={type.value}
                  onPress={() => setMedication({...medication, type: type.value})}
                >
                  <Chip
                    icon={type.icon}
                    selected={medication.type === type.value}
                    style={styles.typeChip}
                  >
                    {type.label}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              label="Bác sĩ kê đơn *"
              value={medication.prescribedBy}
              onChangeText={(text) => setMedication({...medication, prescribedBy: text})}
              style={styles.input}
              mode="outlined"
              placeholder="Bs. Nguyễn Văn A"
            />
          </Card.Content>
        </Card>

        {/* Dosage Schedule */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Lịch Dùng Thuốc"
            left={(props) => <Avatar.Icon {...props} icon="clock" size={40} />}
          />
          <Card.Content>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Thuốc dùng khi cần</Text>
              <Switch
                value={medication.isAsNeeded}
                onValueChange={(value) => setMedication({
                  ...medication, 
                  isAsNeeded: value,
                  times: value ? [] : ['08:00']
                })}
              />
            </View>

            {!medication.isAsNeeded && (
              <>
                <Text style={styles.sectionTitle}>Tần suất</Text>
                <SegmentedButtons
                  value={medication.frequency}
                  onValueChange={handleFrequencyChange}
                  buttons={frequencies.slice(0, 4).map(freq => ({
                    value: freq.value,
                    label: freq.label
                  }))}
                  style={styles.segmentedButtons}
                />

                <Text style={styles.sectionTitle}>Thời gian dùng thuốc</Text>
                {medication.times.map((time, index) => (
                  <View key={index} style={styles.timeRow}>
                    <TouchableOpacity
                      style={styles.timeButton}
                      onPress={() => {
                        setSelectedTimeIndex(index);
                        setShowTimePicker(true);
                      }}
                    >
                      <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
                      <Text style={styles.timeText}>{time}</Text>
                    </TouchableOpacity>
                    
                    {medication.times.length > 1 && (
                      <TouchableOpacity
                        onPress={() => removeTime(index)}
                        style={styles.removeTimeButton}
                      >
                        <MaterialIcons name="close" size={20} color={COLORS.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                ))}

                <Button
                  mode="outlined"
                  onPress={addTime}
                  icon="plus"
                  style={styles.addTimeButton}
                >
                  Thêm thời gian
                </Button>
              </>
            )}

            <Text style={styles.sectionTitle}>Yêu cầu về thức ăn</Text>
            <SegmentedButtons
              value={medication.foodRequirement}
              onValueChange={(value) => setMedication({...medication, foodRequirement: value})}
              buttons={foodRequirements.slice(0, 3).map(req => ({
                value: req.value,
                label: req.label
              }))}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Duration */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Thời Gian Điều Trị"
            left={(props) => <Avatar.Icon {...props} icon="calendar-range" size={40} />}
          />
          <Card.Content>
            <View style={styles.dateRow}>
              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Ngày bắt đầu</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowStartDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  <Text style={styles.dateText}>
                    {medication.startDate.toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.dateField}>
                <Text style={styles.dateLabel}>Ngày kết thúc</Text>
                <TouchableOpacity 
                  style={styles.dateButton}
                  onPress={() => setShowEndDatePicker(true)}
                >
                  <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
                  <Text style={styles.dateText}>
                    {medication.endDate.toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Categories & Priority */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Phân Loại & Mức Độ"
            left={(props) => <Avatar.Icon {...props} icon="tag" size={40} />}
          />
          <Card.Content>
            <Text style={styles.sectionTitle}>Phân loại</Text>
            <View style={styles.chipContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => setMedication({...medication, category: category.value})}
                >
                  <Chip
                    selected={medication.category === category.value}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: medication.category === category.value ? category.color + '20' : 'transparent' }
                    ]}
                    textStyle={{ 
                      color: medication.category === category.value ? category.color : COLORS.text 
                    }}
                  >
                    {category.label}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
            <SegmentedButtons
              value={medication.priority}
              onValueChange={(value) => setMedication({...medication, priority: value})}
              buttons={priorities.map(priority => ({
                value: priority.value,
                label: priority.label,
                style: { backgroundColor: medication.priority === priority.value ? priority.color + '20' : 'transparent' }
              }))}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Instructions & Side Effects */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Hướng Dẫn & Tác Dụng Phụ"
            left={(props) => <Avatar.Icon {...props} icon="information" size={40} />}
          />
          <Card.Content>
            <TextInput
              label="Hướng dẫn sử dụng"
              value={medication.instructions}
              onChangeText={(text) => setMedication({...medication, instructions: text})}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Uống với nhiều nước, tránh tiếp xúc ánh nắng..."
            />

            <TextInput
              label="Tác dụng phụ có thể xảy ra"
              value={medication.sideEffects}
              onChangeText={(text) => setMedication({...medication, sideEffects: text})}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Buồn nôn, chóng mặt, ngủ gà..."
            />
          </Card.Content>
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            Hủy bỏ
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            style={styles.saveButton}
          >
            Thêm thuốc
          </Button>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={medication.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setMedication({...medication, startDate: selectedDate});
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={medication.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setMedication({...medication, endDate: selectedDate});
            }
          }}
        />
      )}

      {showTimePicker && selectedTimeIndex !== null && (
        <DateTimePicker
          value={parseTime(medication.times[selectedTimeIndex])}
          mode="time"
          display="default"
          onChange={handleTimeChange}
        />
      )}
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
    elevation: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
  },
  sectionCard: {
    marginBottom: SIZES.medium,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  input: {
    marginBottom: SIZES.medium,
  },
  textArea: {
    marginBottom: SIZES.medium,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.text,
    marginTop: SIZES.medium,
    marginBottom: SIZES.small,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SIZES.medium,
  },
  flexInput: {
    flex: 1,
  },
  unitContainer: {
    flex: 1,
  },
  unitLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  unitChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.small / 2,
  },
  unitChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.small / 2,
    marginBottom: SIZES.medium,
  },
  typeChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  categoryChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.medium,
  },
  switchLabel: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  segmentedButtons: {
    marginBottom: SIZES.medium,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.small,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
    flex: 1,
    marginRight: SIZES.small,
  },
  timeText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginLeft: SIZES.small,
  },
  removeTimeButton: {
    padding: SIZES.small,
  },
  addTimeButton: {
    marginTop: SIZES.small,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.medium,
  },
  dateField: {
    flex: 1,
  },
  dateLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: SIZES.small / 2,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: SIZES.radius,
    backgroundColor: COLORS.surface,
  },
  dateText: {
    ...FONTS.body2,
    color: COLORS.text,
    marginLeft: SIZES.small,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.medium,
    marginTop: SIZES.large,
  },
  cancelButton: {
    flex: 1,
  },
  saveButton: {
    flex: 1,
  },
  bottomSpace: {
    height: SIZES.large,
  },
});

export default AddMedicationScreen; 