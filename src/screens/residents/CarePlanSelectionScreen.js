import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import carePlanService from '../../api/services/carePlanService';
import { useSelector } from 'react-redux';
import { COLORS, FONTS } from '../../constants/theme';
// Removed mock data import
import { Picker } from '@react-native-picker/picker';
import DropDownPicker from 'react-native-dropdown-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const CarePlanSelectionScreen = () => {
  const navigation = useNavigation();
  const currentUser = useSelector(state => state.auth.user);
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [carePlans, setCarePlans] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [residents, setResidents] = useState([]);
  
  // State cho việc chọn
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedMainPlan, setSelectedMainPlan] = useState(null);
  const [selectedSupplementaryPlans, setSelectedSupplementaryPlans] = useState([]);
  const [selectedRoomType, setSelectedRoomType] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());
  const [familyPreferences, setFamilyPreferences] = useState({
    preferredRoomGender: '',
    preferredFloor: '',
    specialRequests: ''
  });

  const [roomDropdownOpen, setRoomDropdownOpen] = useState(false);
  const [roomDropdownValue, setRoomDropdownValue] = useState(null);
  const [bedDropdownOpen, setBedDropdownOpen] = useState(false);
  const [bedDropdownValue, setBedDropdownValue] = useState(null);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingBeds, setLoadingBeds] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      console.log('DEBUG - Starting to load data...');
      
      const [carePlansData, roomTypesData, unregisteredResidentsData] = await Promise.all([
        carePlanService.getCarePlans(),
        carePlanService.getRoomTypes(),
        carePlanService.getUnregisteredResidents()
      ]);
      
      console.log('DEBUG - Data loaded successfully:');
      console.log('DEBUG - Care plans:', carePlansData?.length || 0);
      console.log('DEBUG - Room types:', roomTypesData?.length || 0);
      console.log('DEBUG - Unregistered residents:', unregisteredResidentsData?.length || 0);
      
      setCarePlans(carePlansData || []);
      setRoomTypes(roomTypesData || []);
      setResidents(unregisteredResidentsData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      
      // Show more specific error message
      let errorMessage = 'Không thể tải dữ liệu. Vui lòng thử lại.';
      
      if (error.response?.status === 400) {
        errorMessage = 'Lỗi dữ liệu từ server. Vui lòng liên hệ admin.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập dữ liệu này.';
      } else if (error.response?.status >= 500) {
        errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const mainCarePlans = carePlans.filter(plan => plan && plan.category === 'main');
  const supplementaryCarePlans = carePlans.filter(plan => plan && plan.category === 'supplementary');

  const handleMainPlanSelect = (plan) => {
    setSelectedMainPlan(plan);
    // Reset room and bed selections when main plan changes
    setSelectedRoom(null);
    setSelectedBed(null);
    setRoomDropdownValue(null);
    setBedDropdownValue(null);
    setAvailableRooms([]);
    setAvailableBeds([]);
  };

  const handleSupplementaryPlanToggle = (plan) => {
    setSelectedSupplementaryPlans(prev => {
      const isSelected = prev.find(p => p._id === plan._id);
      if (isSelected) {
        return prev.filter(p => p._id !== plan._id);
      } else {
        return [...prev, plan];
      }
    });
  };

  // Khi chọn loại phòng
  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
    // Reset room and bed selections when room type changes
    setSelectedRoom(null);
    setSelectedBed(null);
    setRoomDropdownValue(null);
    setBedDropdownValue(null);
    setAvailableRooms([]);
    setAvailableBeds([]);
  };
  // Load available rooms when room type and resident are selected
  useEffect(() => {
    const loadAvailableRooms = async () => {
      if (selectedRoomType && selectedResident && selectedMainPlan) {
        try {
          setLoadingRooms(true);
          console.log('DEBUG - Loading rooms with filters:', {
            room_type: selectedRoomType.room_type, 
            main_care_plan_id: selectedMainPlan._id, // Add main_care_plan_id
            gender: selectedResident.gender,
            status: 'available'
          });
          
          const filters = {
            room_type: selectedRoomType.room_type, 
            main_care_plan_id: selectedMainPlan._id, // Add main care plan ID
            gender: selectedResident.gender,
            status: 'available'
          };
          
          const roomsData = await carePlanService.getRoomsByFilter(filters);
          console.log('DEBUG - Available rooms found:', roomsData.length);
          setAvailableRooms(roomsData);
        } catch (error) {
          console.error('Error loading available rooms:', error);
          Alert.alert('Lỗi', 'Không thể tải danh sách phòng. Vui lòng thử lại.');
          setAvailableRooms([]);
        } finally {
          setLoadingRooms(false);
        }
      } else {
        setAvailableRooms([]);
        setLoadingRooms(false);
      }
    };

    loadAvailableRooms();
  }, [selectedRoomType, selectedResident, selectedMainPlan]); // Add selectedMainPlan dependency

  // Load available beds when room is selected
  useEffect(() => {
    const loadAvailableBeds = async () => {
      if (selectedRoom) {
        try {
          setLoadingBeds(true);
          const bedsData = await carePlanService.getAvailableBedsByRoom(selectedRoom._id);
          setAvailableBeds(bedsData);
        } catch (error) {
          console.error('Error loading available beds:', error);
          Alert.alert('Lỗi', 'Không thể tải danh sách giường. Vui lòng thử lại.');
          setAvailableBeds([]);
        } finally {
          setLoadingBeds(false);
        }
      } else {
        setAvailableBeds([]);
        setLoadingBeds(false);
      }
    };

    loadAvailableBeds();
  }, [selectedRoom]);

  // useMemo cho dropdown items phòng
  const roomDropdownItems = useMemo(() => {
    return availableRooms.map(room => ({
      label: `Phòng ${room.room_number} - Tầng ${room.floor} - ${room.gender === 'male' ? 'Nam' : 'Nữ'}`,
      value: room._id
    }));
  }, [availableRooms]);

  // Handler chọn phòng
  const handleRoomSelect = useCallback((roomId) => {
    if (roomDropdownValue !== roomId) {
      setRoomDropdownValue(roomId);
      const room = availableRooms.find(r => r._id === roomId);
      setSelectedRoom(room);
      setSelectedBed(null);
    }
  }, [roomDropdownValue, availableRooms]);
  // Khi chọn giường
  const handleBedSelect = useCallback((bedId) => {
    if (bedDropdownValue !== bedId) {
      setBedDropdownValue(bedId);
      const bed = availableBeds.find(b => b._id === bedId);
      setSelectedBed(bed);
    }
  }, [bedDropdownValue, availableBeds]);

  const onChangeEndDate = (event, selectedDate) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      setSelectedEndDate(selectedDate);
      setEndDate(selectedDate.toISOString().split('T')[0]); // Format as YYYY-MM-DD
    }
  };

  const showEndDatePickerModal = () => {
    setShowEndDatePicker(true);
  };

  const handleSubmit = async () => {
    if (!selectedResident) {
      Alert.alert('Lỗi', 'Vui lòng chọn người cao tuổi');
      return;
    }

    if (!selectedMainPlan) {
      Alert.alert('Lỗi', 'Vui lòng chọn gói dịch vụ chính');
      return;
    }

    if (!selectedRoomType) {
      Alert.alert('Lỗi', 'Vui lòng chọn loại phòng');
      return;
    }

    if (!selectedRoom) {
      Alert.alert('Lỗi', 'Vui lòng chọn phòng');
      return;
    }

    if (!selectedBed) {
      Alert.alert('Lỗi', 'Vui lòng chọn giường');
      return;
    }

    try {
      const selectedPlans = [selectedMainPlan, ...selectedSupplementaryPlans];
      const costCalculation = carePlanService.calculateTotalCost(selectedPlans, selectedRoomType, roomTypes);

      console.log('DEBUG - Creating care plan assignment with data:', {
        care_plan_ids: selectedPlans.map(plan => plan._id),
        resident_id: selectedResident._id,
        selected_room_type: selectedRoomType.room_type,
        assigned_room_id: selectedRoom._id,
        assigned_bed_id: selectedBed._id,
        total_monthly_cost: costCalculation.totalCost,
        room_monthly_cost: costCalculation.roomCost,
        care_plans_monthly_cost: costCalculation.carePlansCost,
        start_date: new Date().toISOString(),
        status: 'active'
      });

      // Create care plan assignment - Fixed to match DTO
      const assignmentData = {
        care_plan_ids: selectedPlans.map(plan => plan._id),
        resident_id: selectedResident._id,
        consultation_notes: consultationNotes,
        selected_room_type: selectedRoomType.room_type,
        assigned_room_id: selectedRoom._id,
        assigned_bed_id: selectedBed._id,
        family_preferences: {
          preferred_room_gender: familyPreferences.preferredRoomGender || undefined,
          preferred_floor: familyPreferences.preferredFloor ? parseInt(familyPreferences.preferredFloor) : undefined,
          special_requests: familyPreferences.specialRequests || undefined
        },
        total_monthly_cost: costCalculation.totalCost,
        room_monthly_cost: costCalculation.roomCost,
        care_plans_monthly_cost: costCalculation.carePlansCost,
        start_date: new Date().toISOString(), // Use ISO string format
        end_date: endDate || undefined, // Add end date if provided
        status: 'active'
      };

      // Clean up undefined values
      const cleanAssignmentData = Object.fromEntries(
        Object.entries(assignmentData).filter(([_, value]) => value !== undefined)
      );

      // Clean up family_preferences if all values are undefined
      if (cleanAssignmentData.family_preferences) {
        const cleanFamilyPrefs = Object.fromEntries(
          Object.entries(cleanAssignmentData.family_preferences).filter(([_, value]) => value !== undefined)
        );
        if (Object.keys(cleanFamilyPrefs).length === 0) {
          delete cleanAssignmentData.family_preferences;
        } else {
          cleanAssignmentData.family_preferences = cleanFamilyPrefs;
        }
      }

      console.log('DEBUG - Clean assignment data:', cleanAssignmentData);

      const carePlanAssignment = await carePlanService.createCarePlanAssignment(cleanAssignmentData);
      console.log('DEBUG - Care plan assignment created:', carePlanAssignment);

      // Create bed assignment - Fixed to match DTO
      const bedAssignmentData = {
        resident_id: selectedResident._id,
        bed_id: selectedBed._id,
        assigned_by: currentUser._id
      };

      console.log('DEBUG - Creating bed assignment with data:', bedAssignmentData);
      const bedAssignment = await carePlanService.createBedAssignment(bedAssignmentData);
      console.log('DEBUG - Bed assignment created:', bedAssignment);
      
      Alert.alert(
        'Thành công', 
        'Đã đăng ký gói dịch vụ thành công!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      console.error('Error creating assignment:', error);
      console.error('Error response:', error.response?.data);
      Alert.alert('Lỗi', 'Không thể đăng ký gói dịch vụ. Vui lòng thử lại.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalCost = useMemo(() => {
    try {
      return carePlanService.calculateTotalCost(
        [selectedMainPlan, ...selectedSupplementaryPlans].filter(Boolean), 
        selectedRoomType, 
        roomTypes
      );
    } catch (error) {
      console.error('Error calculating total cost:', error);
      return {
        carePlansCost: 0,
        roomCost: 0,
        totalCost: 0
      };
    }
  }, [selectedMainPlan, selectedSupplementaryPlans, selectedRoomType, roomTypes]);

  // useEffect cập nhật items cho dropdown phòng
  // useEffect(() => {
  //   const items = availableRooms.map(room => ({
  //     label: `Phòng ${room.room_number} - Tầng ${room.floor} - ${room.gender === 'male' ? 'Nam' : 'Nữ'}`,
  //     value: room.id
  //   }));
  //   if (JSON.stringify(items) !== JSON.stringify(roomDropdownItems)) {
  //     setRoomDropdownItems(items);
  //   }
  // }, [availableRooms]);
  // useEffect cập nhật items cho dropdown giường
  // useEffect(() => {
  //   const items = availableBeds.map(bed => ({
  //     label: `Giường ${bed.bed_number} (${bed.bed_type})`,
  //     value: bed.id
  //   }));
  //   if (JSON.stringify(items) !== JSON.stringify(bedDropdownItems)) {
  //     setBedDropdownItems(items);
  //   }
  // }, [availableBeds]);

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
      <View style={styles.header}> {/* Đã bỏ paddingTop */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chọn Gói Dịch Vụ & Phòng</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} nestedScrollEnabled={true}>
        {/* Chọn người cao tuổi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chọn Người Cao Tuổi</Text>
          <Text style={styles.sectionSubtitle}>Chọn người chưa được đăng ký gói dịch vụ</Text>
          {residents.filter(Boolean).length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Không có người cao tuổi nào chưa đăng ký gói dịch vụ</Text>
              <Text style={styles.emptySubtext}>Tất cả người cao tuổi đã được đăng ký gói dịch vụ</Text>
            </View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {residents.filter(Boolean).map((resident) => (
                <TouchableOpacity
                  key={resident._id}
                  style={[
                    styles.residentCard,
                    selectedResident?._id === resident._id && styles.selectedCard
                  ]}
                  onPress={() => setSelectedResident(resident)}
                >
                  <Text style={styles.residentName}>{resident?.full_name || 'Không có tên'}</Text>
                  <Text style={styles.residentInfo}>
                    {resident?.gender === 'male' ? 'Nam' : 'Nữ'}
                  </Text>
                  <Text style={styles.residentInfo}>
                    {resident?.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Chọn gói dịch vụ chính */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gói Dịch Vụ Chính (Bắt buộc)</Text>
          <Text style={styles.sectionSubtitle}>Chọn 1 gói dịch vụ chính</Text>
          {mainCarePlans.filter(Boolean).map((plan) => {
            return (
              <TouchableOpacity
                key={plan._id}
                style={[
                  styles.planCard,
                  selectedMainPlan?._id === plan._id && styles.selectedCard
                ]}
                onPress={() => handleMainPlanSelect(plan)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan?.plan_name || 'Không có tên'}</Text>
                  <Text style={styles.planPrice}>{formatPrice(plan?.monthly_price || 0)}/tháng</Text>
                </View>
                <Text style={styles.planDescription}>{plan?.description || 'Không có mô tả'}</Text>
                <View style={styles.planDetails}>
                  <Text style={styles.planDetail}>Tỷ lệ nhân viên: {plan?.staff_ratio || 'Chưa có'}</Text>
                  <Text style={styles.planDetail}>
                    {`Dịch vụ bao gồm: ${plan?.services_included?.length || 0} dịch vụ`}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chọn gói dịch vụ phụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Gói Dịch Vụ Phụ (Tùy chọn)</Text>
          <Text style={styles.sectionSubtitle}>Có thể chọn nhiều gói</Text>
          {supplementaryCarePlans.filter(Boolean).map((plan) => {
            const isSelected = selectedSupplementaryPlans.find(p => p?._id === plan?._id);
            return (
              <TouchableOpacity
                key={plan._id}
                style={[
                  styles.planCard,
                  isSelected && styles.selectedCard
                ]}
                onPress={() => handleSupplementaryPlanToggle(plan)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planName}>{plan?.plan_name || 'Không có tên'}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{formatPrice(plan?.monthly_price || 0)}/tháng</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </View>
                </View>
                <Text style={styles.planDescription}>{plan?.description || 'Không có mô tả'}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Chọn loại phòng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Chọn Loại Phòng</Text>
          <Text style={styles.sectionSubtitle}>Chọn loại phòng phù hợp</Text>
          {roomTypes.filter(Boolean).map((roomType) => (
            <TouchableOpacity
              key={roomType._id}
              style={[
                styles.roomCard,
                selectedRoomType?._id === roomType._id && styles.selectedCard
              ]}
              onPress={() => handleRoomTypeSelect(roomType)}
            >
              <View style={styles.roomHeader}>
                <Text style={styles.roomName}>{roomType?.type_name || 'Không có tên'}</Text>
                <Text style={styles.roomPrice}>{formatPrice(roomType?.monthly_price || 0)}/tháng</Text>
              </View>
              <Text style={styles.roomDescription}>{roomType?.description || 'Không có mô tả'}</Text>
              <View style={styles.amenitiesContainer}>
                {roomType?.amenities?.slice(0, 3).map((amenity, index) => (
                  <Text key={index} style={styles.amenity}>• {amenity}</Text>
                ))}
                {roomType?.amenities?.length > 3 && (
                  <Text style={styles.amenity}>• ... và {roomType.amenities.length - 3} tiện ích khác</Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Chọn phòng cụ thể */}
        {selectedRoomType && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>5. Chọn Phòng</Text>
            {!selectedMainPlan ? (
              <Text style={{ color: COLORS.warning, fontStyle: 'italic' }}>
                Vui lòng chọn gói dịch vụ chính trước để hiển thị danh sách phòng phù hợp.
              </Text>
            ) : loadingRooms ? (
              <View style={styles.sectionLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách phòng...</Text>
              </View>
            ) : availableRooms.length === 0 ? (
              <Text style={{ color: COLORS.error }}>Không có phòng phù hợp còn trống.</Text>
            ) : (
              <DropDownPicker
                open={roomDropdownOpen}
                value={roomDropdownValue}
                items={roomDropdownItems}
                setOpen={setRoomDropdownOpen}
                setValue={val => handleRoomSelect(val())}
                setItems={() => {}} // Không cần setItems
                placeholder="Chọn phòng..."
                style={{
                  marginBottom: 10,
                  borderColor: COLORS.border,
                  backgroundColor: COLORS.white,
                }}
                dropDownContainerStyle={{
                  borderColor: COLORS.border,
                }}
                zIndex={1000}
                listMode="SCROLLVIEW"
                scrollViewProps={{
                  nestedScrollEnabled: true,
                }}
              />
            )}
          </View>
        )}
        {/* Chọn giường cụ thể */}
        {selectedRoom && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>6. Chọn Giường</Text>
            {loadingBeds ? (
              <View style={styles.sectionLoadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách giường...</Text>
              </View>
            ) : availableBeds.length === 0 ? (
              <Text style={{ color: COLORS.error }}>Không còn giường trống trong phòng này.</Text>
            ) : (
              availableBeds.map(bed => {
                return (
                  <TouchableOpacity
                    key={bed._id}
                    style={[
                      styles.roomCard,
                      selectedBed?._id === bed._id && styles.selectedCard
                    ]}
                    onPress={() => setSelectedBed(bed)}
                  >
                    <Text style={styles.roomName}>Giường {bed.bed_number} ({bed.bed_type})</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        )}

        {/* Ngày kết thúc dịch vụ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Ngày Kết Thúc Dịch Vụ (Tùy chọn)</Text>
          <Text style={styles.sectionSubtitle}>Chọn ngày kết thúc dịch vụ nếu có</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={showEndDatePickerModal}
          >
            <View style={styles.datePickerContent}>
              <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerText}>
                {endDate ? new Date(endDate).toLocaleDateString('vi-VN') : 'Chọn ngày kết thúc'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          {endDate && (
            <TouchableOpacity
              style={styles.clearDateButton}
              onPress={() => {
                setEndDate('');
                setSelectedEndDate(new Date());
              }}
            >
              <Text style={styles.clearDateText}>Xóa ngày kết thúc</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Tổng chi phí */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Tổng Chi Phí</Text>
          <View style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Gói dịch vụ chính:</Text>
              <Text style={styles.costValue}>
                {selectedMainPlan ? formatPrice(selectedMainPlan?.monthly_price || 0) : 'Chưa chọn'}
              </Text>
            </View>
            {selectedSupplementaryPlans.filter(Boolean).map((plan) => (
              <View key={plan._id} style={styles.costRow}>
                <Text style={styles.costLabel}>+ {plan?.plan_name || 'Không có tên'}:</Text>
                <Text style={styles.costValue}>{formatPrice(plan?.monthly_price || 0)}</Text>
              </View>
            ))}
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Chi phí phòng:</Text>
              <Text style={styles.costValue}>
                {selectedRoomType ? formatPrice(selectedRoomType?.monthly_price || 0) : 'Chưa chọn'}
              </Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Chi phí giường:</Text>
              <Text style={styles.costValue}>
                {selectedBed ? formatPrice(selectedBed?.monthly_price || 0) : 'Chưa chọn'}
              </Text>
            </View>
            <View style={[styles.costRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Tổng cộng:</Text>
              <Text style={styles.totalValue}>{formatPrice(totalCost?.totalCost || 0)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!selectedResident || !selectedMainPlan || !selectedRoomType || !selectedRoom || !selectedBed) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!selectedResident || !selectedMainPlan || !selectedRoomType || !selectedRoom || !selectedBed}
        >
          <Text style={styles.submitButtonText}>Đăng Ký Gói Dịch Vụ</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modal */}
      {showEndDatePicker && (
        <DateTimePicker
          value={selectedEndDate}
          mode="date"
          display="default"
          onChange={onChangeEndDate}
          minimumDate={new Date()} // Không cho chọn ngày trong quá khứ
        />
      )}
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
    color: COLORS.text,
  },
  sectionLoadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 20,
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
  residentCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  planCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  roomCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  residentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 5,
  },
  residentInfo: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  planPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  planDetails: {
    gap: 5,
  },
  planDetail: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  roomName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1,
  },
  roomPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  roomDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  amenitiesContainer: {
    gap: 3,
  },
  amenity: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  costCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: COLORS.text,
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: 10,
    marginTop: 10,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
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
  datePickerButton: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  datePickerText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 10,
  },
  clearDateButton: {
    backgroundColor: COLORS.error + '10',
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  clearDateText: {
    color: COLORS.error,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default CarePlanSelectionScreen; 