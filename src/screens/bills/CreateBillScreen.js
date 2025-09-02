import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  Modal,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import residentService from '../../api/services/residentService';

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
      let residentsData;
      if (currentUser?.role === 'family') {
        // Family member chỉ có thể xem residents của mình
        const residentsResponse = await residentService.getResidentsByFamilyMember(currentUser._id || currentUser.id);
        residentsData = residentsResponse.success ? residentsResponse.data : [];
      } else {
        // Staff có thể xem tất cả residents
        const residentsResponse = await billsService.billingService.getResidents();
        residentsData = residentsResponse || [];
      }
      
      const [assignmentsData, roomTypesResponse] = await Promise.all([
        billsService.getAllCarePlanAssignments(),
        roomTypeService.getAllRoomTypes()
      ]);

      // Extract room types data from API response
      const roomTypesData = roomTypesResponse?.success ? roomTypesResponse.data : [];
      setRoomTypes(roomTypesData || []);

      // Lọc residents có gói dịch vụ còn hạn sử dụng và status active
      const now = new Date();
      const validAssignments = (assignmentsData || []).filter(assignment => {
        const startDate = new Date(assignment.start_date);
        const endDate = new Date(assignment.end_date);
        return assignment.status === 'active' && now >= startDate && now <= endDate;
      });

      console.log('DEBUG - Valid assignments found:', validAssignments.length);

      // Lấy danh sách resident IDs có gói dịch vụ hợp lệ
      const validResidentIds = new Set(
        validAssignments.map(a => (a.resident_id?._id || a.resident_id))
      );

      console.log('DEBUG - Valid resident IDs:', Array.from(validResidentIds));

      // Lọc residents có gói dịch vụ còn hạn
      let filteredResidents = (residentsData || []).filter(r => validResidentIds.has(r._id));
      
      console.log('DEBUG - Total residents:', residentsData?.length || 0);
      console.log('DEBUG - Filtered residents with valid care plans:', filteredResidents.length);

      // Kiểm tra thêm bed assignment cho từng resident
      const residentsWithValidBedAssignment = [];
      
      for (const resident of filteredResidents) {
        try {
          const bedAssignmentData = await billsService.billingService.getBedAssignmentByResident(resident._id);
          
          // Kiểm tra có bed assignment hợp lệ không (unassigned_date = null)
          let hasValidBedAssignment = false;
          
          if (bedAssignmentData && Array.isArray(bedAssignmentData)) {
            hasValidBedAssignment = bedAssignmentData.some(assignment => !assignment.unassigned_date);
          } else if (bedAssignmentData && typeof bedAssignmentData === 'object') {
            hasValidBedAssignment = !bedAssignmentData.unassigned_date;
          }
          
          if (hasValidBedAssignment) {
            residentsWithValidBedAssignment.push(resident);
          } else {
            console.log('DEBUG - Resident', resident.full_name, 'has no valid bed assignment');
          }
        } catch (error) {
          console.error('DEBUG - Error checking bed assignment for resident', resident._id, error);
        }
      }
      
      console.log('DEBUG - Final filtered residents with both care plan and bed assignment:', residentsWithValidBedAssignment.length);
      
      setResidents(residentsWithValidBedAssignment);

      // Prepare dropdown items
      const dropdownItems = residentsWithValidBedAssignment.map(resident => ({
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

      // Lọc gói dịch vụ còn hạn sử dụng và status active
      const now = new Date();
      let validCarePlan = null;
      
      console.log('DEBUG - Care plan data received:', carePlanData);
      
      if (carePlanData && Array.isArray(carePlanData)) {
        validCarePlan = carePlanData.filter(assignment => {
          const startDate = new Date(assignment.start_date);
          const endDate = new Date(assignment.end_date);
          const isValid = assignment.status === 'active' && now >= startDate && now <= endDate;
          console.log('DEBUG - Assignment check:', {
            id: assignment._id,
            status: assignment.status,
            startDate: assignment.start_date,
            endDate: assignment.end_date,
            isValid
          });
          return isValid;
        });
      } else if (carePlanData && typeof carePlanData === 'object') {
        const startDate = new Date(carePlanData.start_date);
        const endDate = new Date(carePlanData.end_date);
        if (carePlanData.status === 'active' && now >= startDate && now <= endDate) {
          validCarePlan = [carePlanData];
        }
      }

      console.log('DEBUG - Valid care plans found:', validCarePlan?.length || 0);

      // Lọc phòng giường còn đang sử dụng (unassigned_date = null)
      let validBedAssignment = null;
      
      console.log('DEBUG - Bed assignment data received:', bedAssignmentData);
      
      if (bedAssignmentData && Array.isArray(bedAssignmentData)) {
        validBedAssignment = bedAssignmentData.filter(assignment => {
          const isValid = !assignment.unassigned_date;
          console.log('DEBUG - Bed assignment check:', {
            id: assignment._id,
            unassigned_date: assignment.unassigned_date,
            isValid
          });
          return isValid;
        });
      } else if (bedAssignmentData && typeof bedAssignmentData === 'object') {
        if (!bedAssignmentData.unassigned_date) {
          validBedAssignment = [bedAssignmentData];
        }
      }

      console.log('DEBUG - Valid bed assignments found:', validBedAssignment?.length || 0);

      // Tính toán giá tiền từ care plan assignment
      let calculatedCarePlansCost = 0;
      let calculatedRoomCost = 0;
      let calculatedTotalCost = 0;

      if (validCarePlan && validCarePlan.length > 0) {
        const carePlanAssignment = Array.isArray(validCarePlan) ? validCarePlan[0] : validCarePlan;
        
        // Tính tổng giá gói dịch vụ từ care_plan_ids
        if (carePlanAssignment.care_plan_ids && Array.isArray(carePlanAssignment.care_plan_ids)) {
          calculatedCarePlansCost = carePlanAssignment.care_plan_ids.reduce((total, carePlan) => {
            const monthlyPrice = carePlan.monthly_price || 0;
            console.log('DEBUG - Care plan price:', carePlan.plan_name, monthlyPrice);
            return total + monthlyPrice;
          }, 0);
        }
        
        console.log('DEBUG - Calculated care plans cost:', calculatedCarePlansCost);
      }

      // Tính giá phòng từ bed assignment
      if (validBedAssignment && validBedAssignment.length > 0) {
        const bedAssignment = Array.isArray(validBedAssignment) ? validBedAssignment[0] : validBedAssignment;
        
        if (bedAssignment.bed_id && bedAssignment.bed_id.room_id && bedAssignment.bed_id.room_id.room_type) {
          // Tìm room type để lấy giá
          const roomType = roomTypes.find(rt => rt.room_type === bedAssignment.bed_id.room_id.room_type);
          if (roomType && roomType.monthly_price) {
            calculatedRoomCost = roomType.monthly_price;
            console.log('DEBUG - Room type found:', roomType.type_name, 'Price:', calculatedRoomCost);
          } else {
            console.log('DEBUG - Room type not found or no price for:', bedAssignment.bed_id.room_id.room_type);
          }
        }
        
        console.log('DEBUG - Calculated room cost:', calculatedRoomCost);
      }

      // Tính tổng chi phí
      calculatedTotalCost = calculatedCarePlansCost + calculatedRoomCost;
      console.log('DEBUG - Total calculated cost:', calculatedTotalCost);

      // Cập nhật care plan assignment với giá đã tính
      if (validCarePlan && validCarePlan.length > 0) {
        const updatedCarePlan = Array.isArray(validCarePlan) ? validCarePlan[0] : validCarePlan;
        updatedCarePlan.care_plans_monthly_cost = calculatedCarePlansCost;
        updatedCarePlan.room_monthly_cost = calculatedRoomCost;
        updatedCarePlan.total_monthly_cost = calculatedTotalCost;
        
        setCarePlanAssignment([updatedCarePlan]);
      } else {
        setCarePlanAssignment(validCarePlan);
      }
      
      setBedAssignment(validBedAssignment);

      console.log('DEBUG - Updated care plan assignment with calculated costs:', {
        care_plans_monthly_cost: calculatedCarePlansCost,
        room_monthly_cost: calculatedRoomCost,
        total_monthly_cost: calculatedTotalCost
      });

      // Kiểm tra xem resident đã có hóa đơn trước đó chưa
      const isFirstBill = !existingBills || existingBills.length === 0;
      
      // Tính toán số tiền dựa trên việc có phải lần đầu hay không
      let calculatedAmount;
      let calculatedTitle;
      let calculatedNotes = '';
      let calculatedDueDate;
      
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const currentDay = now.getDate();
      
      if (isFirstBill) {
        // Lần đầu đăng ký
        // Tính số ngày còn lại trong tháng hiện tại
        const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
        const remainingDays = daysInMonth - currentDay + 1;
        
        // Tiền tháng hiện tại (theo tỷ lệ ngày còn lại) + tiền cọc 1 tháng
        const dailyRate = calculatedTotalCost / 30;
        const partialMonthAmount = dailyRate * remainingDays;
        const depositAmount = calculatedTotalCost;
        
        calculatedAmount = Math.round(partialMonthAmount + depositAmount);
        calculatedTitle = `Hóa đơn thanh toán tháng ${currentMonth.toString().padStart(2, '0')}/${currentYear}`;
        calculatedNotes = 'Hóa đơn đăng ký dịch vụ tháng đầu + tiền cọc 1 tháng';
        
        // Hạn thanh toán: cuối tháng hiện tại (23:59:59 VN time)
        const lastDayOfMonth = new Date(currentYear, currentMonth, 0, 23, 59, 59, 999);
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
        calculatedAmount = calculatedTotalCost;
        
        // Tiêu đề cho tháng kế tiếp
        let nextMonth = currentMonth + 1;
        let nextYear = currentYear;
        if (nextMonth > 12) {
          nextMonth = 1;
          nextYear += 1;
        }
        
        calculatedTitle = `Hóa đơn thanh toán tháng ${nextMonth.toString().padStart(2, '0')}/${nextYear}`;
        calculatedNotes = '';
        
        // Hạn thanh toán: ngày 5 của tháng kế tiếp (23:59:59 VN time)
        const fifthOfNextMonth = new Date(nextYear, nextMonth - 1, 5, 23, 59, 59, 999);
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
        isFirstBill,
        dueDateUTC: convertDisplayDateToUTC(calculatedDueDate)
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
        due_date: convertDisplayDateToUTC(dueDate), // Đã được convert sang UTC ISO string
        title: title.trim(),
        notes: notes.trim() || undefined
      };

      console.log('DEBUG - Creating bill with data:', billData);
      console.log('DEBUG - Date conversion details:', {
        displayDueDate: dueDate,
        convertedUTC: billData.due_date,
        parsedDate: new Date(billData.due_date).toISOString()
      });

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
    const formattedPrice = new Intl.NumberFormat('vi-VN').format(price * 10000);
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
    if (!date) return '';
    
    // Tạo date object mới để tránh thay đổi date gốc
    const dateObj = new Date(date);
    
    // Lấy ngày theo giờ địa phương (đã được set đúng giờ VN)
    const day = dateObj.getDate().toString().padStart(2, '0');
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const year = dateObj.getFullYear();
    
    console.log('DEBUG - formatDateForDisplay:', {
      inputDate: date,
      dateObj: dateObj.toISOString(),
      day,
      month,
      year,
      result: `${day}/${month}/${year}`
    });
    
    return `${day}/${month}/${year}`;
  };

  // Convert display date back to UTC for saving to DB
  const convertDisplayDateToUTC = (displayDate) => {
    if (!displayDate) return '';
    const [day, month, year] = displayDate.split('/');
    
    // Tạo ngày ở giờ Việt Nam (UTC+7) vào lúc 23:59:59 để đảm bảo không bị lệch ngày
    // Ví dụ: 5/10/2024 23:59:59 (VN) = 5/10/2024 16:59:59 (UTC) - vẫn là ngày 5/10
    const vietnamDate = new Date(year, month - 1, day, 23, 59, 59, 999);
    
    // Chuyển đổi sang UTC (trừ đi 7 giờ)
    const utcDate = new Date(vietnamDate.getTime() - (7 * 60 * 60 * 1000));
    
    console.log('DEBUG - Date conversion:', {
      displayDate,
      vietnamDate: vietnamDate.toISOString(),
      utcDate: utcDate.toISOString(),
      vietnamDay: vietnamDate.getDate(),
      utcDay: utcDate.getUTCDate()
    });
    
    return utcDate.toISOString();
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
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
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
          {carePlanAssignment && (Array.isArray(carePlanAssignment) ? carePlanAssignment.length > 0 : true) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>2. Thông Tin Gói Dịch Vụ</Text>
              {(() => {
                const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;
                
                console.log('DEBUG - Displaying care plan with calculated costs:', {
                  care_plans_monthly_cost: carePlan?.care_plans_monthly_cost,
                  room_monthly_cost: carePlan?.room_monthly_cost,
                  total_monthly_cost: carePlan?.total_monthly_cost
                });
                
                return (
                  <>
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Gói dịch vụ:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.care_plans_monthly_cost ? 
                          formatPrice(carePlan.care_plans_monthly_cost) : 'Chưa có thông tin'}
                      </Text>
                    </View>
                    {carePlan?.care_plan_ids && Array.isArray(carePlan.care_plan_ids) && carePlan.care_plan_ids.length > 0 && (
                      <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Chi tiết gói:</Text>
                        <View style={styles.packageDetailsContainer}>
                          {carePlan.care_plan_ids.map((cp, index) => (
                            <View key={cp._id || index} style={styles.packageDetailItem}>
                              <Text style={styles.packageDetailText}>
                                • {cp.plan_name || 'Không có tên'}
                              </Text>
                              {cp.monthly_price && (
                                <Text style={styles.packageDetailPrice}>
                                  {formatPrice(cp.monthly_price)}
                                </Text>
                              )}
                            </View>
                          ))}
                        </View>
                      </View>
                    )}
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Phí phòng:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.room_monthly_cost ? 
                          formatPrice(carePlan.room_monthly_cost) : 'Chưa có thông tin'}
                      </Text>
                    </View>
                    {bedAssignment && (Array.isArray(bedAssignment) ? bedAssignment.length > 0 : true) && (
                      <View style={styles.infoCard}>
                        <Text style={styles.infoLabel}>Loại phòng:</Text>
                        <Text style={styles.infoValue}>
                          {(() => {
                            const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;
                            if (bedAssign?.bed_id?.room_id?.room_type) {
                              const roomType = roomTypes.find(rt => rt.room_type === bedAssign.bed_id.room_id.room_type);
                              return roomType ? roomType.type_name : bedAssign.bed_id.room_id.room_type;
                            }
                            return 'Chưa có thông tin';
                          })()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.infoCard}>
                      <Text style={styles.infoLabel}>Tổng cộng:</Text>
                      <Text style={styles.infoValue}>
                        {carePlan?.total_monthly_cost ? 
                          `${formatPrice(carePlan.total_monthly_cost)}` : 'Chưa có thông tin'}
                      </Text>
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Thông báo khi không có gói dịch vụ hợp lệ */}
          {residentDropdownValue && (!carePlanAssignment || (Array.isArray(carePlanAssignment) && carePlanAssignment.length === 0)) && (
            <View style={styles.section}>
              <View style={styles.warningCard}>
                <Ionicons name="warning-outline" size={24} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Người cao tuổi này không có gói dịch vụ còn hạn hoặc đang hoạt động.
                </Text>
              </View>
            </View>
          )}

          {/* Thông tin phòng và giường */}
          {bedAssignment && (Array.isArray(bedAssignment) ? bedAssignment.length > 0 : true) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>3. Thông Tin Phòng & Giường</Text>
              {(() => {
                const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;
                
                console.log('DEBUG - Displaying bed assignment:', bedAssign);
                
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

          {/* Thông báo khi không có phòng giường hợp lệ */}
          {residentDropdownValue && (!bedAssignment || (Array.isArray(bedAssignment) && bedAssignment.length === 0)) && (
            <View style={styles.section}>
              <View style={styles.warningCard}>
                <Ionicons name="warning-outline" size={24} color={COLORS.warning} />
                <Text style={styles.warningText}>
                  Người cao tuổi này không có phòng giường đang sử dụng.
                </Text>
              </View>
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
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={{ backgroundColor: COLORS.white }}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Số tiền (*10,000 VNĐ) *</Text>
              <TextInput
                mode="outlined"
                value={amount}
                onChangeText={setAmount}
                placeholder="Nhập số tiền..."
                keyboardType="numeric"
                editable={!loadingCalculation}
                contentStyle={{ paddingVertical: 8 }}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={{ backgroundColor: COLORS.white }}
              />
              {loadingCalculation && (
                <ActivityIndicator size="small" color={COLORS.primary} style={styles.calculationLoader} />
              )}
              <Text style={styles.calculationNote}>
                Công thức tính tiền tháng đầu: (Số ngày còn lại × Giá 1 ngày) + Tiền cọc 1 tháng
              </Text>
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
                    outlineColor={COLORS.border}
                    activeOutlineColor={COLORS.primary}
                    style={{ backgroundColor: COLORS.white }}
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
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={{ backgroundColor: COLORS.white }}
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
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 0,
        borderWidth: 1,
        borderColor: '#f0f0f0',
      },
    }),
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
    elevation: 0,
    shadowOpacity: 0,
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
  calculationNote: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 8,
    fontStyle: 'italic',
    textAlign: 'center',
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
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.warning + '10',
    borderWidth: 1,
    borderColor: COLORS.warning,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
  },
  warningText: {
    fontSize: 14,
    color: COLORS.warning,
    marginLeft: 8,
    flex: 1,
  },
  packageDetailsContainer: {
    flex: 1,
    marginLeft: 8,
  },
  packageDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  packageDetailText: {
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  packageDetailPrice: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    textAlign: 'right',
  },
});

export default CreateBillScreen;