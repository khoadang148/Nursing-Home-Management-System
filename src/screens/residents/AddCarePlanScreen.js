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
  IconButton,
  SegmentedButtons
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';

const AddCarePlanScreen = ({ navigation, route }) => {
  const residentName = route?.params?.residentName || 'Cư dân';
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  
  const [carePlan, setCarePlan] = useState({
    title: '',
    description: '',
    category: 'general',
    priority: 'medium',
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    assignedStaff: [],
    goals: [],
    activities: [],
    frequency: 'daily',
    notes: ''
  });

  const categories = [
    { value: 'general', label: 'Tổng quát', icon: 'clipboard-outline', color: COLORS.primary },
    { value: 'medical', label: 'Y tế', icon: 'medical-bag', color: COLORS.error },
    { value: 'physical', label: 'Vật lý trị liệu', icon: 'dumbbell', color: COLORS.success },
    { value: 'social', label: 'Xã hội', icon: 'account-group', color: COLORS.info },
    { value: 'nutrition', label: 'Dinh dưỡng', icon: 'food-apple', color: COLORS.warning }
  ];

  const priorities = [
    { value: 'low', label: 'Thấp', color: COLORS.success },
    { value: 'medium', label: 'Trung bình', color: COLORS.warning },
    { value: 'high', label: 'Cao', color: COLORS.error }
  ];

  const frequencies = [
    { value: 'daily', label: 'Hàng ngày' },
    { value: 'weekly', label: 'Hàng tuần' },
    { value: 'monthly', label: 'Hàng tháng' },
    { value: 'asNeeded', label: 'Khi cần thiết' }
  ];

  const defaultGoals = [
    'Cải thiện khả năng vận động',
    'Duy trì sức khỏe tinh thần',
    'Tăng cường giao tiếp xã hội',
    'Quản lý đau mãn tính',
    'Cải thiện chất lượng giấc ngủ'
  ];

  const defaultActivities = [
    'Tập vật lý trị liệu',
    'Hoạt động nhóm',
    'Tư vấn tâm lý',
    'Kiểm tra sức khỏe định kỳ',
    'Hoạt động giải trí'
  ];

  const handleSave = () => {
    if (!carePlan.title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề kế hoạch chăm sóc');
      return;
    }
    
    if (!carePlan.description.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mô tả kế hoạch');
      return;
    }

    if (carePlan.goals.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một mục tiêu');
      return;
    }

    Alert.alert(
      'Xác nhận',
      'Bạn có muốn lưu kế hoạch chăm sóc này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Lưu', 
          onPress: () => {
            // Here you would save to your backend/database
            Alert.alert('Thành công', 'Kế hoạch chăm sóc đã được lưu', [
              { text: 'OK', onPress: () => navigation.goBack() }
            ]);
          }
        }
      ]
    );
  };

  const addGoal = (goal) => {
    if (!carePlan.goals.includes(goal)) {
      setCarePlan({...carePlan, goals: [...carePlan.goals, goal]});
    }
  };

  const removeGoal = (goal) => {
    setCarePlan({...carePlan, goals: carePlan.goals.filter(g => g !== goal)});
  };

  const addActivity = (activity) => {
    if (!carePlan.activities.includes(activity)) {
      setCarePlan({...carePlan, activities: [...carePlan.activities, activity]});
    }
  };

  const removeActivity = (activity) => {
    setCarePlan({...carePlan, activities: carePlan.activities.filter(a => a !== activity)});
  };

  const getCategoryInfo = (categoryValue) => {
    return categories.find(cat => cat.value === categoryValue) || categories[0];
  };

  const getPriorityInfo = (priorityValue) => {
    return priorities.find(pri => pri.value === priorityValue) || priorities[1];
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Kế hoạch - ${residentName}`} />
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
            title="Thông Tin Cơ Bản"
            left={(props) => <Avatar.Icon {...props} icon="information" size={40} />}
          />
          <Card.Content>
            <TextInput
              label="Tiêu đề kế hoạch *"
              value={carePlan.title}
              onChangeText={(text) => setCarePlan({...carePlan, title: text})}
              style={styles.input}
              mode="outlined"
            />

            <TextInput
              label="Mô tả chi tiết *"
              value={carePlan.description}
              onChangeText={(text) => setCarePlan({...carePlan, description: text})}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={4}
            />

            {/* Category Selection */}
            <Text style={styles.sectionTitle}>Loại kế hoạch</Text>
            <View style={styles.chipContainer}>
              {categories.map(category => (
                <TouchableOpacity
                  key={category.value}
                  onPress={() => setCarePlan({...carePlan, category: category.value})}
                >
                  <Chip
                    icon={category.icon}
                    selected={carePlan.category === category.value}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: carePlan.category === category.value ? category.color + '20' : 'transparent' }
                    ]}
                    textStyle={{ 
                      color: carePlan.category === category.value ? category.color : COLORS.text 
                    }}
                  >
                    {category.label}
                  </Chip>
                </TouchableOpacity>
              ))}
            </View>

            {/* Priority Selection */}
            <Text style={styles.sectionTitle}>Mức độ ưu tiên</Text>
            <SegmentedButtons
              value={carePlan.priority}
              onValueChange={(value) => setCarePlan({...carePlan, priority: value})}
              buttons={priorities.map(priority => ({
                value: priority.value,
                label: priority.label,
                style: { backgroundColor: carePlan.priority === priority.value ? priority.color + '20' : 'transparent' }
              }))}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Timeline */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Thời Gian Thực Hiện"
            left={(props) => <Avatar.Icon {...props} icon="calendar" size={40} />}
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
                    {carePlan.startDate.toLocaleDateString('vi-VN')}
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
                    {carePlan.endDate.toLocaleDateString('vi-VN')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.sectionTitle}>Tần suất thực hiện</Text>
            <SegmentedButtons
              value={carePlan.frequency}
              onValueChange={(value) => setCarePlan({...carePlan, frequency: value})}
              buttons={frequencies.map(freq => ({
                value: freq.value,
                label: freq.label
              }))}
              style={styles.segmentedButtons}
            />
          </Card.Content>
        </Card>

        {/* Goals */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Mục Tiêu Chăm Sóc"
            left={(props) => <Avatar.Icon {...props} icon="target" size={40} />}
          />
          <Card.Content>
            <Text style={styles.sectionSubtitle}>Mục tiêu đã chọn:</Text>
            <View style={styles.selectedContainer}>
              {carePlan.goals.map(goal => (
                <Chip
                  key={goal}
                  onClose={() => removeGoal(goal)}
                  style={styles.selectedChip}
                >
                  {goal}
                </Chip>
              ))}
              {carePlan.goals.length === 0 && (
                <Text style={styles.emptyText}>Chưa chọn mục tiêu nào</Text>
              )}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionSubtitle}>Chọn thêm mục tiêu:</Text>
            <View style={styles.chipContainer}>
              {defaultGoals.filter(goal => !carePlan.goals.includes(goal)).map(goal => (
                <TouchableOpacity key={goal} onPress={() => addGoal(goal)}>
                  <Chip style={styles.availableChip}>{goal}</Chip>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Activities */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Hoạt Động Thực Hiện"
            left={(props) => <Avatar.Icon {...props} icon="run" size={40} />}
          />
          <Card.Content>
            <Text style={styles.sectionSubtitle}>Hoạt động đã chọn:</Text>
            <View style={styles.selectedContainer}>
              {carePlan.activities.map(activity => (
                <Chip
                  key={activity}
                  onClose={() => removeActivity(activity)}
                  style={styles.selectedChip}
                >
                  {activity}
                </Chip>
              ))}
              {carePlan.activities.length === 0 && (
                <Text style={styles.emptyText}>Chưa chọn hoạt động nào</Text>
              )}
            </View>

            <Divider style={styles.divider} />

            <Text style={styles.sectionSubtitle}>Chọn thêm hoạt động:</Text>
            <View style={styles.chipContainer}>
              {defaultActivities.filter(activity => !carePlan.activities.includes(activity)).map(activity => (
                <TouchableOpacity key={activity} onPress={() => addActivity(activity)}>
                  <Chip style={styles.availableChip}>{activity}</Chip>
                </TouchableOpacity>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* Notes */}
        <Card style={styles.sectionCard}>
          <Card.Title 
            title="Ghi Chú Bổ Sung"
            left={(props) => <Avatar.Icon {...props} icon="note-text" size={40} />}
          />
          <Card.Content>
            <TextInput
              label="Ghi chú thêm"
              value={carePlan.notes}
              onChangeText={(text) => setCarePlan({...carePlan, notes: text})}
              style={styles.textArea}
              mode="outlined"
              multiline
              numberOfLines={3}
              placeholder="Thêm ghi chú về kế hoạch chăm sóc..."
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
            Lưu kế hoạch
          </Button>
        </View>

        <View style={styles.bottomSpace} />
      </ScrollView>

      {/* Date Pickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={carePlan.startDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setCarePlan({...carePlan, startDate: selectedDate});
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={carePlan.endDate}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setCarePlan({...carePlan, endDate: selectedDate});
            }
          }}
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
  sectionSubtitle: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SIZES.small,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SIZES.small / 2,
    marginBottom: SIZES.medium,
  },
  categoryChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
  },
  selectedContainer: {
    minHeight: 50,
    marginBottom: SIZES.medium,
  },
  selectedChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
    backgroundColor: COLORS.primary + '20',
  },
  availableChip: {
    marginRight: SIZES.small / 2,
    marginBottom: SIZES.small / 2,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: SIZES.medium,
  },
  divider: {
    marginVertical: SIZES.medium,
  },
  segmentedButtons: {
    marginBottom: SIZES.medium,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SIZES.medium,
  },
  dateField: {
    flex: 1,
    marginHorizontal: SIZES.small / 2,
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

export default AddCarePlanScreen; 