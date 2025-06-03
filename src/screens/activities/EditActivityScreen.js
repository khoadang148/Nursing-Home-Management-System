import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  Card, 
  Chip,
  Divider,
  List,
  Text,
  ActivityIndicator
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { scale } from '../../constants/dimensions';
import { useDispatch } from 'react-redux';
import { updateActivity } from '../../redux/slices/activitySlice';

const EditActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { activityId } = route.params;

  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState({
    name: '',
    description: '',
    type: 'physical',
    scheduledTime: new Date(),
    durationMinutes: '',
    location: '',
    participants: '',
    facilitator: '',
    materials: [],
  });

  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    const fetchActivityDetails = async () => {
      try {
        setLoading(true);
        // Replace with your actual API call
        const response = await fetch(`/api/activities/${activityId}`);
        const data = await response.json();
        setActivity(data);
        setLoading(false);
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể tải thông tin hoạt động');
        setLoading(false);
      }
    };

    fetchActivityDetails();
  }, [activityId]);

  const getActivityTypeInVietnamese = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return 'Thể chất';
      case 'social': return 'Xã hội';
      case 'cognitive': return 'Nhận thức';
      case 'creative': return 'Sáng tạo';
      case 'spiritual': return 'Tâm linh';
      case 'recreational': return 'Giải trí';
      case 'educational': return 'Giáo dục';
      case 'therapeutic': return 'Trị liệu';
      default: return type || 'Khác';
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await dispatch(updateActivity({ id: activityId, ...activity })).unwrap();
      Alert.alert('Thành công', 'Hoạt động đã được cập nhật');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật hoạt động');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} iconColor="#fff" />
        <Appbar.Content title="Sửa Hoạt Động" titleStyle={[FONTS.h2, { color: '#fff' }]} />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              label="Tên hoạt động"
              value={activity.name}
              onChangeText={(text) => setActivity({ ...activity, name: text })}
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

            <List.Item
              title="Loại hoạt động"
              description={getActivityTypeInVietnamese(activity.type)}
              left={props => <List.Icon {...props} icon="tag" color={COLORS.primary} />}
              onPress={() => {
                // Add activity type selection logic here
              }}
            />

            <List.Item
              title="Thời gian"
              description={activity.scheduledTime.toLocaleString()}
              left={props => <List.Icon {...props} icon="clock-outline" color={COLORS.primary} />}
              onPress={() => setShowDatePicker(true)}
            />

            <TextInput
              label="Thời lượng (phút)"
              value={activity.durationMinutes?.toString()}
              onChangeText={(text) => setActivity({ ...activity, durationMinutes: parseInt(text) || '' })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Địa điểm"
              value={activity.location}
              onChangeText={(text) => setActivity({ ...activity, location: text })}
              style={styles.input}
            />

            <TextInput
              label="Số người tham gia tối đa"
              value={activity.participants?.toString()}
              onChangeText={(text) => setActivity({ ...activity, participants: parseInt(text) || '' })}
              keyboardType="numeric"
              style={styles.input}
            />

            <TextInput
              label="Hướng dẫn viên"
              value={activity.facilitator}
              onChangeText={(text) => setActivity({ ...activity, facilitator: text })}
              style={styles.input}
            />

            <Divider style={styles.divider} />

            <Text style={styles.sectionTitle}>Vật liệu cần thiết</Text>
            {activity.materials && activity.materials.map((material, index) => (
              <View key={index} style={styles.materialItem}>
                <TextInput
                  label="Tên vật liệu"
                  value={material.name}
                  onChangeText={(text) => {
                    const newMaterials = [...activity.materials];
                    newMaterials[index] = { ...material, name: text };
                    setActivity({ ...activity, materials: newMaterials });
                  }}
                  style={styles.materialInput}
                />
                <TextInput
                  label="Số lượng"
                  value={material.quantity?.toString()}
                  onChangeText={(text) => {
                    const newMaterials = [...activity.materials];
                    newMaterials[index] = { ...material, quantity: parseInt(text) || '' };
                    setActivity({ ...activity, materials: newMaterials });
                  }}
                  keyboardType="numeric"
                  style={styles.materialInput}
                />
              </View>
            ))}

            <Button
              mode="outlined"
              icon="plus"
              onPress={() => {
                setActivity({
                  ...activity,
                  materials: [...(activity.materials || []), { name: '', quantity: '' }]
                });
              }}
              style={styles.addButton}
            >
              Thêm vật liệu
            </Button>
          </Card.Content>
        </Card>

        <Button
          mode="contained"
          onPress={handleSave}
          style={styles.saveButton}
          loading={loading}
        >
          Lưu thay đổi
        </Button>
      </ScrollView>

      {showDatePicker && (
        <DateTimePicker
          value={activity.scheduledTime}
          mode="datetime"
          onChange={(event, selectedDate) => {
            setShowDatePicker(false);
            if (selectedDate) {
              setActivity({ ...activity, scheduledTime: selectedDate });
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    padding: SIZES.padding,
  },
  card: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  input: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: SIZES.padding,
  },
  materialItem: {
    flexDirection: 'row',
    marginBottom: SIZES.padding,
  },
  materialInput: {
    flex: 1,
    marginRight: SIZES.padding,
    backgroundColor: COLORS.white,
  },
  addButton: {
    marginBottom: SIZES.padding,
  },
  saveButton: {
    marginBottom: SIZES.padding * 2,
    backgroundColor: COLORS.primary,
  },
});

export default EditActivityScreen; 