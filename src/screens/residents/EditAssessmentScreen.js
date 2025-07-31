import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Appbar, TextInput, Button, Surface, HelperText, Divider } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import assessmentService from '../../api/services/assessmentService';
import { validateAssessment } from '../../utils/validation';

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
  const { assessmentId, assessmentData } = route.params;
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
  useEffect(() => {
    if (assessmentData && assessmentId) {
      // Use setTimeout to avoid animation conflicts
      setTimeout(() => {
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
      }, 100);
    }
  }, [assessmentData, assessmentId]);

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
        // Use callback instead of Redux dispatch
        if (route.params?.onGoBack) {
          route.params.onGoBack();
        }
        Alert.alert('Thành công', 'Đã cập nhật đánh giá!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chỉnh sửa đánh giá" />
        </Appbar.Header>
        
        <ScrollView 
          style={styles.scrollView} 
          keyboardShouldPersistTaps="handled" 
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Thông tin đánh giá hiện tại */}
          <Surface style={styles.currentInfo}>
            <Text style={styles.currentInfoTitle}>Thông tin đánh giá hiện tại</Text>
            <Text style={styles.currentInfoText}>
              Loại: {assessmentData.assessment_type || 'Chưa có'}
            </Text>
            <Text style={styles.currentInfoText}>
              Ngày: {assessmentData.date ? new Date(assessmentData.date).toLocaleDateString('vi-VN') : 'Chưa có'}
            </Text>
            <Text style={styles.currentInfoText}>
              Người thực hiện: {assessmentData.conducted_by?.full_name || assessmentData.conducted_by?.name || 'Chưa có'}
            </Text>
          </Surface>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Loại đánh giá</Text>
            <TouchableOpacity onPress={() => setAssessmentTypeModalVisible(true)}>
              <TextInput
                mode="outlined"
                label="Chọn loại đánh giá"
                value={assessmentType || 'Chọn loại đánh giá...'}
                style={[styles.textInput, { fontSize: 15 }]}
                right={<TextInput.Icon name="menu-down" />}
                editable={false}
                pointerEvents="none"
                error={!!errors.assessmentType}
                numberOfLines={1}
                multiline={false}
              />
            </TouchableOpacity>
            {errors.assessmentType && (
              <HelperText type="error" visible={true}>
                {errors.assessmentType}
              </HelperText>
            )}
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
            {assessmentType === 'Khác' && errors.otherAssessmentType && (
              <HelperText type="error" visible={true}>
                {errors.otherAssessmentType}
              </HelperText>
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
            {errors.notes && (
              <HelperText type="error" visible={true}>
                {errors.notes}
              </HelperText>
            )}
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
              numberOfLines={3}
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
                    ItemSeparatorComponent={() => <Divider />}
                    showsVerticalScrollIndicator={false}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  currentInfo: {
    padding: SIZES.padding,
    margin: SIZES.padding,
    borderRadius: SIZES.radius,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    ...SHADOWS.small,
  },
  currentInfoTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: 'bold',
  },
  currentInfoText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  section: {
    paddingHorizontal: SIZES.padding,
    paddingTop: SIZES.padding,
    paddingBottom: 0,
    marginBottom: 4,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 8,
  },
  textInput: {
    marginBottom: 2,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '80%',
    maxHeight: 350,
    paddingVertical: 8,
    ...SHADOWS.medium,
  },
  modalTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
    paddingHorizontal: 20,
  },
  modalItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
  },
  modalItemText: {
    fontSize: 16,
    color: COLORS.text,
  },
});

export default EditAssessmentScreen; 