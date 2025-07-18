import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
} from 'react-native';
import { Appbar, TextInput, Button, Surface, HelperText, Menu, Divider } from 'react-native-paper';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useSelector } from 'react-redux';

// Mock data imports
import { residents } from '../../api/mockData';

const ASSESSMENT_TYPES = [
  'Đánh giá tình trạng sức khỏe tổng quát',
  'Đánh giá vật lý trị liệu',
  'Đánh giá dinh dưỡng',
  'Đánh giá tâm lý',
  'Đánh giá chức năng vận động',
  'Khác',
];



// Giả lập user staff đang đăng nhập
const CURRENT_STAFF = { id: 'staff2', name: 'Phạm Thị Doctor' };

const AddAssessmentScreen = ({ route, navigation }) => {
  const { residentId } = route.params;
  const [resident, setResident] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [assessmentType, setAssessmentType] = useState('');
  const [otherAssessmentType, setOtherAssessmentType] = useState('');
  const [assessmentTypeModalVisible, setAssessmentTypeModalVisible] = useState(false);
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [errors, setErrors] = useState({});

  // Ngày đánh giá luôn là ngày hiện tại
  const date = new Date();

  const user = useSelector(state => state.auth.user);
  // Người thực hiện là staff đang đăng nhập
  const conductedBy = user ? { id: user._id || user.id, name: user.full_name || user.name } : CURRENT_STAFF;

  useEffect(() => {
    const fetchResident = async () => {
      setTimeout(() => {
        const foundResident = residents.find(r => r._id === residentId);
        setResident(foundResident);
        setLoading(false);
      }, 500);
    };
    fetchResident();
  }, [residentId]);

  const validate = () => {
    const newErrors = {};
    if (!assessmentType.trim()) newErrors.assessmentType = 'Vui lòng chọn loại đánh giá';
    if (assessmentType === 'Khác' && !otherAssessmentType.trim()) newErrors.otherAssessmentType = 'Vui lòng nhập loại đánh giá khác';
    if (!notes.trim()) newErrors.notes = 'Vui lòng nhập ghi chú';
    if (!recommendations.trim()) newErrors.recommendations = 'Vui lòng nhập khuyến nghị';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    // In a real app, this would be an API call
    Alert.alert(
      'Thành công',
      'Đánh giá đã được lưu thành công',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (loading || !resident) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Thêm đánh giá chung" />
        </Appbar.Header>
        <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 0 }}>
          <Surface style={styles.residentInfo}>
            <Text style={styles.residentName}>{resident.full_name}</Text>
            <Text style={styles.residentRoom}>
              Phòng {resident.room_number}
              {resident.bed_number && ` - Giường ${resident.bed_number}`}
            </Text>
          </Surface>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại đánh giá</Text>
            <TouchableOpacity onPress={() => setAssessmentTypeModalVisible(true)}>
              <TextInput
                mode="outlined"
                label="Chọn loại đánh giá"
                value={assessmentType}
                style={[styles.textInput, { fontSize: 15 }]}
                right={<TextInput.Icon name="menu-down" />}
                editable={false}
                pointerEvents="none"
                error={!!errors.assessmentType}
                numberOfLines={1}
                multiline={false}
              />
            </TouchableOpacity>
            <HelperText type="error" visible={!!errors.assessmentType} style={errors.assessmentType ? undefined : styles.helperTextNoError}>{errors.assessmentType}</HelperText>
            {assessmentType === 'Khác' && (
              <TextInput
                mode="outlined"
                label="Nhập loại đánh giá khác"
                value={otherAssessmentType}
                onChangeText={setOtherAssessmentType}
                style={styles.textInput}
                error={!!errors.otherAssessmentType}
              />
            )}
            <HelperText type="error" visible={!!errors.otherAssessmentType} style={errors.otherAssessmentType ? undefined : styles.helperTextNoError}>{errors.otherAssessmentType}</HelperText>
          </View>

          {/* Modal chọn loại đánh giá */}
          <Modal
            visible={assessmentTypeModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setAssessmentTypeModalVisible(false)}
          >
            <TouchableWithoutFeedback onPress={() => setAssessmentTypeModalVisible(false)}>
              <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ backgroundColor: '#fff', borderRadius: 12, width: '80%', maxHeight: 350, paddingVertical: 8 }}>
                  <FlatList
                    data={ASSESSMENT_TYPES}
                    keyExtractor={item => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity
                        style={{ paddingVertical: 14, paddingHorizontal: 18 }}
                        onPress={() => {
                          setAssessmentType(item);
                          setAssessmentTypeModalVisible(false);
                        }}
                      >
                        <Text style={{ fontSize: 16, color: COLORS.text }}>{item}</Text>
                      </TouchableOpacity>
                    )}
                    ItemSeparatorComponent={() => <Divider />}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ngày đánh giá</Text>
            <Surface style={styles.infoStaticBox}>
              <Text style={styles.infoStaticText}>{date.toLocaleDateString('vi-VN')}</Text>
            </Surface>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Người thực hiện</Text>
            <Surface style={styles.infoStaticBox}>
              <Text style={styles.infoStaticText}>{conductedBy.name}</Text>
            </Surface>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TextInput
              mode="outlined"
              label="Ghi chú"
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              style={styles.textInput}
              error={!!errors.notes}
            />
            <HelperText type="error" visible={!!errors.notes} style={errors.notes ? undefined : styles.helperTextNoError}>{errors.notes}</HelperText>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khuyến nghị</Text>
            <TextInput
              mode="outlined"
              label="Khuyến nghị"
              value={recommendations}
              onChangeText={setRecommendations}
              multiline
              numberOfLines={3}
              style={styles.textInput}
              error={!!errors.recommendations}
            />
            <HelperText type="error" visible={!!errors.recommendations} style={errors.recommendations ? undefined : styles.helperTextNoError}>{errors.recommendations}</HelperText>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              labelStyle={styles.submitButtonText}
            >
              Lưu đánh giá
            </Button>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
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
  appbar: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  residentInfo: {
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: '#fff', // đổi nền trắng
    borderWidth: 1,
    borderColor: '#eee',
    ...SHADOWS.small,
  },
  residentName: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 4,
  },
  residentRoom: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: 0,
    marginBottom: 4, // giảm tiếp khoảng cách giữa các section
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 8, // giảm margin dưới
  },
  textInput: {
    marginBottom: 2, // giảm tiếp margin dưới
  },
  helperTextNoError: {
    height: 0,
    margin: 0,
    padding: 0,
  },
  buttonContainer: {
    padding: SIZES.padding,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
  submitButtonText: {
    ...FONTS.body1,
    color: COLORS.surface,
  },
  infoStaticBox: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 4,
  },
  infoStaticText: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '500',
  },
});

export default AddAssessmentScreen; 