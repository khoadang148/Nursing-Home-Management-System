import React, { useState, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
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
} from 'react-native';
import { Appbar, TextInput, Button, Surface, HelperText, Menu, Divider } from 'react-native-paper';
import { useRoute, useNavigation, useFocusEffect } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector, useDispatch } from 'react-redux';
import assessmentService from '../../api/services/assessmentService';
import { triggerResidentDataReload } from '../../redux/slices/residentSlice';

const ASSESSMENT_TYPES = [
  'Đánh giá tổng quát',
  'Đánh giá tâm lý',
  'Đánh giá dinh dưỡng',
  'Đánh giá vận động',
  'Đánh giá nhận thức',
  'Đánh giá xã hội',
  'Khác'
];

const EditAssessmentScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { assessmentId, assessmentData } = route?.params || {};
  const user = useSelector(state => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize state with empty values to avoid animation conflicts
  const [assessmentType, setAssessmentType] = useState('');
  const [otherAssessmentType, setOtherAssessmentType] = useState('');
  const [notes, setNotes] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [errors, setErrors] = useState({});

  const [assessmentTypeModalVisible, setAssessmentTypeModalVisible] = useState(false);

  // Update state when screen focuses to avoid animation conflicts
  useFocusEffect(
    useCallback(() => {
      if (assessmentData && assessmentId) {
        requestAnimationFrame(() => {
          setAssessmentType(assessmentData.assessment_type || '');
          setNotes(assessmentData.notes || '');
          setRecommendations(assessmentData.recommendations || '');
          
          // Check if assessment type is custom
          if (assessmentData.assessment_type && !ASSESSMENT_TYPES.includes(assessmentData.assessment_type)) {
            setAssessmentType('Khác');
            setOtherAssessmentType(assessmentData.assessment_type);
          } else {
            setOtherAssessmentType('');
          }
        });
      }
    }, [assessmentData, assessmentId])
  );

  const validate = () => {
    const newErrors = {};
    if (!assessmentType.trim()) newErrors.assessmentType = 'Vui lòng chọn loại đánh giá';
    if (assessmentType === 'Khác' && !otherAssessmentType.trim()) newErrors.otherAssessmentType = 'Vui lòng nhập loại đánh giá khác';
    if (!notes.trim()) newErrors.notes = 'Vui lòng nhập ghi chú';
    // Khuyến nghị không bắt buộc - đã xóa validation
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    if (!validate()) return;
    if (!assessmentId) {
      Alert.alert('Lỗi', 'Không tìm thấy ID đánh giá');
      return;
    }
    
    try {
      setSubmitting(true);
      const updateData = {
        assessment_type: assessmentType === 'Khác' ? otherAssessmentType : assessmentType,
        notes: notes,
        recommendations: recommendations.trim() || undefined, // Chỉ gửi khi có giá trị
      };

      const response = await assessmentService.updateAssessment(assessmentId, updateData);
      
      if (response.success) {
        // Trigger Redux reload để cập nhật dữ liệu
        dispatch(triggerResidentDataReload());
        Alert.alert(
          'Thành công',
          'Đánh giá đã được cập nhật thành công',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể cập nhật đánh giá');
      }
    } catch (error) {
      console.error('Error updating assessment:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật đánh giá. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  // Add error boundary
  if (!assessmentId || !assessmentData) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Không tìm thấy dữ liệu đánh giá</Text>
        <Button onPress={() => navigation.goBack()}>Quay lại</Button>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chỉnh sửa đánh giá" />
      </Appbar.Header>
      <ScrollView style={styles.scrollView} keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 20 }}>

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
          {assessmentType === 'Khác' && (
            <HelperText type="error" visible={!!errors.otherAssessmentType} style={errors.otherAssessmentType ? undefined : styles.helperTextNoError}>{errors.otherAssessmentType}</HelperText>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ghi chú</Text>
          <TextInput
            mode="outlined"
            label="Ghi chú đánh giá"
            value={notes}
            onChangeText={setNotes}
            style={styles.textInput}
            multiline
            numberOfLines={4}
            error={!!errors.notes}
          />
          <HelperText type="error" visible={!!errors.notes} style={errors.notes ? undefined : styles.helperTextNoError}>{errors.notes}</HelperText>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Khuyến nghị (Tùy chọn)</Text>
          <TextInput
            mode="outlined"
            label="Khuyến nghị (Không bắt buộc)"
            value={recommendations}
            onChangeText={setRecommendations}
            style={styles.textInput}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.buttonContainer}>
          <Button
            mode="contained"
            onPress={handleUpdate}
            style={styles.submitButton}
            labelStyle={styles.submitButtonText}
            loading={submitting}
            disabled={submitting}
          >
            {submitting ? 'Đang cập nhật...' : 'Cập nhật đánh giá'}
          </Button>
        </View>
      </ScrollView>

             {/* Modal chọn loại đánh giá */}
       <Modal
         visible={assessmentTypeModalVisible}
         transparent={true}
         animationType="fade"
         onRequestClose={() => setAssessmentTypeModalVisible(false)}
       >
        <TouchableWithoutFeedback onPress={() => setAssessmentTypeModalVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Chọn loại đánh giá</Text>
                <FlatList
                  data={ASSESSMENT_TYPES}
                  keyExtractor={(item) => item}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.modalItem}
                      onPress={() => {
                        setAssessmentType(item);
                        setAssessmentTypeModalVisible(false);
                      }}
                    >
                      <Text style={styles.modalItemText}>{item}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
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
  appbar: {
    backgroundColor: COLORS.primary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    padding: SIZES.padding,
    marginBottom: 8,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  textInput: {
    backgroundColor: '#fff',
    borderRadius: SIZES.radius,
  },
  helperTextNoError: {
    opacity: 0,
  },
  buttonContainer: {
    padding: SIZES.padding,
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  submitButtonText: {
    ...FONTS.body1,
    color: COLORS.surface,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  modalItem: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalItemText: {
    ...FONTS.body2,
    color: COLORS.text,
    textAlign: 'center',
  },
});

export default EditAssessmentScreen; 