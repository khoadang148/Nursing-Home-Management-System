import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS } from '../../constants/theme';
import { scale } from '../../constants/dimensions';
import { useDispatch } from 'react-redux';
import { updateActivity } from '../../redux/slices/activitySlice';

const SuaHoatDong = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { activityId } = route.params;

  const [activity, setActivity] = useState({
    title: '',
    description: '',
    startDate: new Date(),
    endDate: new Date(),
    location: '',
    maxParticipants: '',
  });

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  useEffect(() => {
    // Fetch activity details using activityId
    // This is a placeholder - you'll need to implement the actual API call
    const fetchActivityDetails = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch(`/api/activities/${activityId}`);
        const data = await response.json();
        setActivity(data);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin hoạt động');
      }
    };

    fetchActivityDetails();
  }, [activityId]);

  const handleSave = async () => {
    try {
      await dispatch(updateActivity({ id: activityId, ...activity })).unwrap();
      Alert.alert('Thành công', 'Hoạt động đã được cập nhật');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hoạt động');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sửa Hoạt Động</Text>
      </View>

      <View style={styles.form}>
        <TextInput
          label="Tên hoạt động"
          value={activity.title}
          onChangeText={(text) => setActivity({ ...activity, title: text })}
          style={styles.input}
        />

        <TextInput
          label="Mô tả"
          value={activity.description}
          onChangeText={(text) => setActivity({ ...activity, description: text })}
          multiline
          numberOfLines={4}
          style={styles.input}
        />

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowStartDatePicker(true)}
        >
          <Text>Thời gian bắt đầu: {activity.startDate.toLocaleString()}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowEndDatePicker(true)}
        >
          <Text>Thời gian kết thúc: {activity.endDate.toLocaleString()}</Text>
        </TouchableOpacity>

        <TextInput
          label="Địa điểm"
          value={activity.location}
          onChangeText={(text) => setActivity({ ...activity, location: text })}
          style={styles.input}
        />

        <TextInput
          label="Số người tham gia tối đa"
          value={activity.maxParticipants}
          onChangeText={(text) => setActivity({ ...activity, maxParticipants: text })}
          keyboardType="numeric"
          style={styles.input}
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
        </TouchableOpacity>
      </View>

      {showStartDatePicker && (
        <DateTimePicker
          value={activity.startDate}
          mode="datetime"
          onChange={(event, selectedDate) => {
            setShowStartDatePicker(false);
            if (selectedDate) {
              setActivity({ ...activity, startDate: selectedDate });
            }
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={activity.endDate}
          mode="datetime"
          onChange={(event, selectedDate) => {
            setShowEndDatePicker(false);
            if (selectedDate) {
              setActivity({ ...activity, endDate: selectedDate });
            }
          }}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: scale(16),
    backgroundColor: COLORS.primary,
  },
  backButton: {
    color: COLORS.white,
    fontSize: scale(16),
    marginBottom: scale(8),
  },
  title: {
    color: COLORS.white,
    fontSize: scale(24),
    fontWeight: 'bold',
  },
  form: {
    padding: scale(16),
  },
  input: {
    marginBottom: scale(16),
    backgroundColor: COLORS.white,
  },
  dateButton: {
    padding: scale(12),
    backgroundColor: COLORS.white,
    borderRadius: scale(8),
    marginBottom: scale(16),
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    padding: scale(16),
    borderRadius: scale(8),
    alignItems: 'center',
    marginTop: scale(16),
  },
  saveButtonText: {
    color: COLORS.white,
    fontSize: scale(16),
    fontWeight: 'bold',
  },
});

export default SuaHoatDong; 