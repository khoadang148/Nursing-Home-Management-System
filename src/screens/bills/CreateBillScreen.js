import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Menu, Button, TextInput } from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS } from '../../constants/theme';
import billService from '../../api/services/billService';
import carePlanService from '../../api/services/carePlanService';

const CreateBillScreen = () => {
  const navigation = useNavigation();
  const currentUser = useSelector(state => state.auth.user);

  // State for data loading
  const [loading, setLoading] = useState(true);
  const [loadingCalculation, setLoadingCalculation] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // State for data
  const [residents, setResidents] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [carePlanAssignment, setCarePlanAssignment] = useState(null);
  const [bedAssignment, setBedAssignment] = useState(null);

  // Resident dropdown states
  const [residentDropdownOpen, setResidentDropdownOpen] = useState(false);
  const [residentDropdownValue, setResidentDropdownValue] = useState(null);
  const [residentDropdownItems, setResidentDropdownItems] = useState([]);

  // State for date picker
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for form
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  // Test authentication
  useEffect(() => {
    const testAuth = async () => {
      try {
        console.log('DEBUG - Testing authentication...');
        const testResponse = await carePlanService.getCarePlans();
        console.log('DEBUG - Auth test successful, care plans count:', testResponse?.length || 0);
      } catch (error) {
        console.error('DEBUG - Auth test failed:', error.response?.status, error.response?.data);
      }
    };
    testAuth();
  }, []);

  // Debug when carePlanAssignment changes
  useEffect(() => {
    console.log('DEBUG - carePlanAssignment state changed:', carePlanAssignment);
    if (carePlanAssignment) {
      const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;
      console.log('DEBUG - carePlan structure:', {
        assigned_room_id: carePlan?.assigned_room_id,
        room_number: carePlan?.assigned_room_id?.room_number,
        assigned_bed_id: carePlan?.assigned_bed_id,
        bed_number: carePlan?.assigned_bed_id?.bed_number
      });
    }
  }, [carePlanAssignment]);

  // Debug when bedAssignment changes
  useEffect(() => {
    console.log('DEBUG - bedAssignment state changed:', bedAssignment);
    if (bedAssignment) {
      const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;
      console.log('DEBUG - bedAssign structure:', {
        bed_id: bedAssign?.bed_id,
        room_id: bedAssign?.bed_id?.room_id,
        room_number: bedAssign?.bed_id?.room_id?.room_number,
        bed_number: bedAssign?.bed_id?.bed_number
      });
    }
  }, [bedAssignment]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [residentsData, roomTypesData] = await Promise.all([
        carePlanService.getResidents(), // Use working service
        carePlanService.getRoomTypes()  // Use working service
      ]);

      setResidents(residentsData || []);
      setRoomTypes(roomTypesData || []);

      // Prepare dropdown items
      const dropdownItems = residentsData.map(resident => ({
        label: `${resident.full_name} - ${resident.gender === 'male' ? 'Nam' : 'Nữ'}`,
        value: resident._id,
        resident: resident
      }));

      setResidentDropdownItems(dropdownItems);
    } catch (error) {
      console.error('Error loading initial data:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        Alert.alert(
          'Lỗi Xác Thực', 
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          [
            {
              text: 'Đăng nhập lại',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Load assignment data when resident is selected
  useEffect(() => {
    if (residentDropdownValue) {
      loadAssignmentData(residentDropdownValue);
    } else {
      setCarePlanAssignment(null);
      setBedAssignment(null);
      setAmount('');
    }
  }, [residentDropdownValue]);

  const loadAssignmentData = async (residentId) => {
    try {
      setLoadingCalculation(true);
      console.log('DEBUG - Loading assignment data for resident:', residentId);

      const [carePlanData, bedAssignmentData] = await Promise.all([
        billService.getCarePlanAssignmentByResident(residentId),
        billService.getBedAssignmentByResident(residentId)
      ]);

      setCarePlanAssignment(carePlanData);
      setBedAssignment(bedAssignmentData);

      console.log('DEBUG - Set care plan assignment:', carePlanData);
      console.log('DEBUG - Set bed assignment:', bedAssignmentData);

      // Calculate amount
      const calculatedAmount = billService.calculateBillAmount(
        carePlanData,
        bedAssignmentData,
        roomTypes
      );

      setAmount(calculatedAmount.toString());
      console.log('DEBUG - Calculated amount:', calculatedAmount);

    } catch (error) {
      console.error('Error loading assignment data:', error);
      
      // Handle specific error types
      if (error.response?.status === 401) {
        Alert.alert(
          'Lỗi Xác Thực', 
          'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
          [
            {
              text: 'Đăng nhập lại',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', 'Không thể tải thông tin gói dịch vụ. Vui lòng thử lại.');
      }
      
      setCarePlanAssignment(null);
      setBedAssignment(null);
      setAmount('');
    } finally {
      setLoadingCalculation(false);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!residentDropdownValue) {
      Alert.alert('Lỗi', 'Vui lòng chọn người cao tuổi');
      return;
    }

    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tiêu đề hóa đơn');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Lỗi', 'Vui lòng nhập số tiền hợp lệ');
      return;
    }

    if (!dueDate) {
      Alert.alert('Lỗi', 'Vui lòng chọn ngày đến hạn');
      return;
    }

    if (!carePlanAssignment) {
      Alert.alert('Lỗi', 'Không tìm thấy gói dịch vụ cho người cao tuổi này');
      return;
    }

    try {
      setSubmitting(true);

      // Handle carePlanAssignment as array
      const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;

      const billData = {
        resident_id: residentDropdownValue,
        care_plan_assignment_id: carePlan._id,
        staff_id: currentUser._id,
        amount: parseFloat(amount),
        due_date: new Date(dueDate).toISOString(),
        title: title.trim(),
        notes: notes.trim() || undefined
      };

      console.log('DEBUG - Creating bill with data:', billData);

      await billService.createBill(billData);

      Alert.alert(
        'Thành công',
        'Đã tạo hóa đơn thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

    } catch (error) {
      console.error('Error creating bill:', error);
      Alert.alert('Lỗi', 'Không thể tạo hóa đơn. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Get selected resident info
  const getSelectedResident = useMemo(() => {
    return residents.find(resident => resident._id === residentDropdownValue);
  }, [residents, residentDropdownValue]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo Hóa Đơn</Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.content} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* Chọn người cao tuổi */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>1. Chọn Người Cao Tuổi</Text>
            <Text style={styles.sectionSubtitle}>Chọn người cần tạo hóa đơn</Text>
            
            <Menu
              visible={residentDropdownOpen}
              onDismiss={() => setResidentDropdownOpen(false)}
              anchor={
                <Button
                  icon="account-circle"
                  mode="outlined"
                  onPress={() => setResidentDropdownOpen(true)}
                  style={styles.dropdown}
                  contentStyle={styles.dropdownContentStyle}
                  labelStyle={styles.dropdownLabelStyle}
                >
                  {residentDropdownValue ? getSelectedResident?.full_name : 'Chọn người cao tuổi...'}
                </Button>
              }
              style={styles.dropdownContainer}
              contentStyle={styles.dropdownContentStyle}
              listMode="SCROLLVIEW"
              scrollViewProps={{
                nestedScrollEnabled: true,
              }}
            >
              {residentDropdownItems.map(item => (
                <Menu.Item
                  key={item.value}
                  onPress={() => {
                    setResidentDropdownValue(item.value);
                    setResidentDropdownOpen(false);
                  }}
                  title={item.label}
                />
              ))}
            </Menu>
          </View>

          {/* Thông tin gói dịch vụ */}
          {carePlanAssignment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Thông Tin Gói Dịch Vụ</Text>
              {(() => {
                const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;
                
                return (
                  <>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Gói dịch vụ:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.care_plans_monthly_cost ? 
                          formatPrice(carePlan.care_plans_monthly_cost) : 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Phí phòng:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.room_monthly_cost ? 
                          formatPrice(carePlan.room_monthly_cost) : 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Tổng cộng:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.total_monthly_cost ? 
                          formatPrice(carePlan.total_monthly_cost) : 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Phòng số:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.assigned_room_id?.room_number || 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Giường số:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.assigned_bed_id?.bed_number || 'Chưa có thông tin'}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Form tạo hóa đơn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>3. Thông Tin Hóa Đơn</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tiêu đề hóa đơn *</Text>
              <TextInput
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề hóa đơn..."
                maxLength={100}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số tiền (VND) *</Text>
              <TextInput
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                placeholder="Nhập số tiền..."
                keyboardType="numeric"
                editable={!loadingCalculation}
              />
              {loadingCalculation && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.calculationLoader} />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ngày đến hạn *</Text>
              <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
                <View pointerEvents="none">
                  <TextInput
                    label="Ngày đến hạn *"
                    value={dueDate || ''}
                    placeholder="Chọn ngày đến hạn..."
                    editable={false}
                    mode="outlined"
                    right={<TextInput.Icon icon="calendar" />}
                    style={styles.dateInput}
                  />
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ? new Date(dueDate) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = selectedDate.toISOString().split('T')[0];
                      setDueDate(formattedDate);
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ghi chú</Text>
              <TextInput
                mode="outlined"
                value={notes}
                onChangeText={setNotes}
                placeholder="Nhập ghi chú (tùy chọn)..."
                multiline
                numberOfLines={3}
                maxLength={200}
              />
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.submitContainer}>
            <TouchableOpacity
              style={[
                styles.submitButton,
                submitting && styles.disabledButton
              ]}
              onPress={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <Text style={styles.submitButtonText}>Tạo Hóa Đơn</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mainContainer: {
    flex: 1,
    padding: 20,
  },
  scrollContent: {
    flex: 1,
    marginTop: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    paddingBottom: 40, // Extra padding at bottom for keyboard
  },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 15,
  },
  dropdown: {
    borderColor: COLORS.primary,
    borderWidth: 1,
    backgroundColor: COLORS.white,
    borderRadius: 8,
    minHeight: 50,
    justifyContent: 'flex-start',
    paddingHorizontal: 15,
  },
  dropdownContainer: {
    minWidth: 250,
    maxWidth: 350,
  },
  dropdownContentStyle: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
  },
  dropdownLabelStyle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'left',
  },
  infoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
    marginBottom: 8,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: COLORS.white,
  },
  calculationLoader: {
    position: 'absolute',
    right: 15,
    top: 40,
  },
  submitContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: COLORS.disabled,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CreateBillScreen;