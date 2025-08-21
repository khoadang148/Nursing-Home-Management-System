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
import DropDownPicker from 'react-native-dropdown-picker';
import { COLORS, FONTS } from '../../constants/theme';
import billsService from '../../api/services/billsService';
import carePlanService from '../../api/services/carePlanService';
import roomTypeService from '../../api/services/roomTypeService';

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
        bed_number: bedAssign?.bed_id?.bed_number,
        room_type: bedAssign?.bed_id?.room_id?.room_type
      });
    }
  }, [bedAssignment]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Lấy residents, assignments, roomTypes song song
      const [residentsData, assignmentsData, roomTypesResponse] = await Promise.all([
        billsService.billingService.getResidents(),
        billsService.getAllCarePlanAssignments(),
        roomTypeService.getAllRoomTypes()
      ]);

      // Extract room types data from API response
      const roomTypesData = roomTypesResponse?.success ? roomTypesResponse.data : [];
      setRoomTypes(roomTypesData || []);

      // Lấy danh sách resident_id đã đăng ký dịch vụ
      const registeredResidentIds = new Set(
        (assignmentsData || []).map(a => (a.resident_id?._id || a.resident_id))
      );
      // Lọc residents đã đăng ký dịch vụ
      const filteredResidents = (residentsData || []).filter(r => registeredResidentIds.has(r._id));
      setResidents(filteredResidents);

      // Prepare dropdown items
      const dropdownItems = filteredResidents.map(resident => ({
        label: `${resident.full_name || resident.name} - ${resident.gender === 'male' ? 'Nam' : 'Nữ'}`,
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

      const [carePlanData, bedAssignmentData, existingBills] = await Promise.all([
        billsService.billingService.getCarePlanAssignmentByResident(residentId),
        billsService.billingService.getBedAssignmentByResident(residentId),
        billsService.getBillsByResident(residentId)
      ]);

      setCarePlanAssignment(carePlanData);
      setBedAssignment(bedAssignmentData);

      console.log('DEBUG - Set care plan assignment:', carePlanData);
      console.log('DEBUG - Set bed assignment:', bedAssignmentData);
      console.log('DEBUG - Existing bills:', existingBills);

      // Kiểm tra xem resident đã có hóa đơn trước đó chưa
      const isFirstBill = !existingBills || existingBills.length === 0;
      
      // Tính toán số tiền dựa trên việc có phải lần đầu hay không
      let calculatedAmount;
      let calculatedTitle;
      let calculatedNotes = '';
      let calculatedDueDate;
      
      const carePlan = Array.isArray(carePlanData) ? carePlanData[0] : carePlanData;
      const totalMonthlyCost = carePlan?.total_monthly_cost || 0;
      
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();
      
      if (isFirstBill) {
        // Lần đầu đăng ký
        // Tính số ngày còn lại trong tháng hiện tại
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const remainingDays = daysInMonth - currentDay + 1;
        
        // Tiền tháng hiện tại (theo tỷ lệ ngày còn lại) + tiền cọc 1 tháng
        const dailyRate = totalMonthlyCost / 30;
        const partialMonthAmount = dailyRate * remainingDays;
        const depositAmount = totalMonthlyCost;
        
        calculatedAmount = Math.round(partialMonthAmount + depositAmount);
        calculatedTitle = `Hóa đơn thanh toán tháng ${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
        calculatedNotes = 'Hóa đơn đăng ký dịch vụ tháng đầu + tiền cọc 1 tháng';
        
        // Hạn thanh toán: cuối tháng hiện tại
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0);
        calculatedDueDate = formatDateForDisplay(lastDayOfMonth);
        
        console.log('DEBUG - First bill calculation:', {
          daysInMonth,
          remainingDays,
          dailyRate,
          partialMonthAmount,
          depositAmount,
          totalAmount: calculatedAmount
        });
      } else {
        // Đã có hóa đơn trước đó
        calculatedAmount = totalMonthlyCost;
        
        // Tiêu đề cho tháng kế tiếp
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }
        
        calculatedTitle = `Hóa đơn thanh toán tháng ${nextMonth.toString().padStart(2, '0')}/${nextYear}`;
        calculatedNotes = '';
        
        // Hạn thanh toán: ngày 5 của tháng kế tiếp
        const fifthOfNextMonth = new Date(nextYear, nextMonth - 1, 5);
        calculatedDueDate = formatDateForDisplay(fifthOfNextMonth);
        
        console.log('DEBUG - Regular bill calculation:', {
          totalAmount: calculatedAmount,
          nextMonth,
          nextYear
        });
      }

      // Set các giá trị tính toán được
      setAmount(calculatedAmount.toString());
      setTitle(calculatedTitle);
      setNotes(calculatedNotes);
      setDueDate(calculatedDueDate);

      console.log('DEBUG - Final calculated values:', {
        amount: calculatedAmount,
        title: calculatedTitle,
        notes: calculatedNotes,
        dueDate: calculatedDueDate,
        isFirstBill
      });

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
      setTitle('');
      setNotes('');
      setDueDate('');
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
        due_date: new Date(convertDisplayDateToUTC(dueDate)).toISOString(),
        title: title.trim(),
        notes: notes.trim() || undefined
      };

      console.log('DEBUG - Creating bill with data:', billData);

      const result = await billsService.createBill(billData);
      
      if (!result.success) {
        throw new Error(result.error || 'Không thể tạo hóa đơn');
      }

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
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price);
    return `${formattedPrice} VNĐ`;
  };

  // Get room type name from room_type code
  const getRoomTypeName = (roomTypeCode) => {
    if (!roomTypeCode || !roomTypes.length) return roomTypeCode || 'Chưa xác định';
    
    const roomType = roomTypes.find(rt => rt.room_type === roomTypeCode);
    return roomType?.type_name || roomTypeCode || 'Chưa xác định';
  };

  // Format date for display in Vietnam timezone (UTC+7) - DD/MM/YYYY
  const formatDateForDisplay = (date) => {
    // Create a new date adjusted to Vietnam timezone
    const vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));
    const day = vietnamTime.getUTCDate().toString().padStart(2, '0');
    const month = (vietnamTime.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = vietnamTime.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  // Convert display date back to UTC for saving to DB
  const convertDisplayDateToUTC = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    // Create date in Vietnam timezone then convert to UTC
    const vietnamDate = new Date(year, month - 1, day, 12, 0, 0); // Use noon to avoid timezone edge cases
    const utcDate = new Date(vietnamDate.getTime() - (7 * 60 * 60 * 1000));
    return utcDate.toISOString().split('T')[0];
  };

  // Get selected resident info
  const getSelectedResident = useMemo(() => {
    return residents.find(resident => resident._id === residentDropdownValue);
  }, [residents, residentDropdownValue]);

  // Get selected resident display name
  const getSelectedResidentName = useMemo(() => {
    const resident = getSelectedResident;
    return resident ? (resident.full_name || resident.name) : '';
  }, [getSelectedResident]);

  // Hàm tính tiêu đề mặc định cho hóa đơn
  const getNextMonthTitle = () => {
    const now = new Date();
    let month = now.getMonth() + 2; // getMonth() là 0-based, +1 cho tháng hiện tại, +1 nữa cho tháng tiếp theo
    let year = now.getFullYear();
    
    if (month > 12) {
      month = 1;
      year += 1;
    }
    
    return `Hóa đơn chăm sóc tháng ${month.toString().padStart(2, '0')}/${year}`;
  };

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
            <View style={[styles.dropdownWrapper, residentDropdownOpen && styles.dropdownSpacer]}>
              <DropDownPicker
                open={residentDropdownOpen}
                value={residentDropdownValue}
                items={residentDropdownItems}
                setOpen={setResidentDropdownOpen}
                setValue={setResidentDropdownValue}
                setItems={setResidentDropdownItems}
                placeholder="Chọn người cao tuổi..."
                listMode="SCROLLVIEW"
                maxHeight={320}
                dropDownDirection="BOTTOM"
                zIndex={6000}
                zIndexInverse={1000}
                style={styles.dropdown}
                dropDownContainerStyle={[styles.dropdownContainer, styles.dropdownOverlay]}
                scrollViewProps={{ nestedScrollEnabled: true, keyboardShouldPersistTaps: 'handled' }}
                listItemLabelStyle={styles.dropdownLabelStyle}
                onChangeValue={(val) => {
                  // Không tự động điền tiêu đề nữa vì sẽ được tính toán trong loadAssignmentData
                }}
                closeAfterSelecting={true}
                closeOnBackPressed={true}
              />
            </View>
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
                  </>
                );
              })()}
            </View>
          )}

          {/* Thông tin phòng và giường */}
          {bedAssignment && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Thông Tin Phòng & Giường</Text>
              {(() => {
                const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;
                
                return (
                  <>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Phòng số:</Text>
                      <Text style={styles.infoValue}>
                        {bedAssign?.bed_id?.room_id?.room_number || 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Giường số:</Text>
                      <Text style={styles.infoValue}>
                        {bedAssign?.bed_id?.bed_number || 'Chưa có thông tin'}
                      </Text>
                    </View>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Loại phòng:</Text>
                      <Text style={styles.infoValue}>
                        {getRoomTypeName(bedAssign?.bed_id?.room_id?.room_type)}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Form tạo hóa đơn */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. Thông Tin Hóa Đơn</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Tiêu đề hóa đơn *</Text>
              <TextInput
                mode="outlined"
                value={title}
                onChangeText={setTitle}
                placeholder="Nhập tiêu đề hóa đơn..."
                maxLength={100}
                contentStyle={{ paddingVertical: 8 }}
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
                contentStyle={{ paddingVertical: 8 }}
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
                    mode="outlined"
                    value={dueDate || ''}
                    placeholder="Chọn ngày đến hạn..."
                    editable={false}
                    right={<TextInput.Icon icon="calendar" />}
                    contentStyle={{ paddingVertical: 8 }}
                  />
                </View>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate ? new Date(convertDisplayDateToUTC(dueDate)) : new Date()}
                  mode="date"
                  display="spinner"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (selectedDate) {
                      const formattedDate = formatDateForDisplay(selectedDate);
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
    justifyContent: 'center', // Center vertically
    alignItems: 'center', // Center horizontally
    paddingHorizontal: 15,
  },
  dropdownWrapper: {
    zIndex: 6000,
  },
  dropdownContainer: {
    minWidth: 250,
    maxWidth: 350,
    zIndex: 6000,
  },
  dropdownOverlay: {
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  dropdownSpacer: {
    paddingBottom: 320, // reserve space for dropdown to avoid overlaying next sections
  },
  dropdownContentStyle: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    justifyContent: 'center', // Center content
    alignItems: 'center', // Center content
  },
  dropdownLabelStyle: {
    fontSize: 16,
    color: COLORS.text,
    textAlign: 'center', // Center the text
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