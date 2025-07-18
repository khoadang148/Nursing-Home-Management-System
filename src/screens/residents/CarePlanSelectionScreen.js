import React, { useState, useEffect } from 'react';
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
import { 
  getCarePlans, 
  getRoomTypes, 
  getResidents, 
  createCarePlanAssignment,
  calculateTotalCost 
} from '../../api/carePlanService';
import { useSelector } from 'react-redux';
import { COLORS, FONTS } from '../../constants/theme';

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
  const [consultationNotes, setConsultationNotes] = useState('');
  const [familyPreferences, setFamilyPreferences] = useState({
    preferredRoomGender: '',
    preferredFloor: '',
    specialRequests: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [carePlansData, roomTypesData, residentsData] = await Promise.all([
        getCarePlans(),
        getRoomTypes(),
        getResidents()
      ]);
      
      setCarePlans(carePlansData);
      setRoomTypes(roomTypesData);
      setResidents(residentsData);
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const mainCarePlans = carePlans.filter(plan => plan && plan.category === 'main');
  const supplementaryCarePlans = carePlans.filter(plan => plan && plan.category === 'supplementary');

  const handleMainPlanSelect = (plan) => {
    setSelectedMainPlan(plan);
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

  const handleRoomTypeSelect = (roomType) => {
    setSelectedRoomType(roomType);
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

    try {
      const selectedPlans = [selectedMainPlan, ...selectedSupplementaryPlans];
      const costCalculation = calculateTotalCost(selectedPlans, selectedRoomType.room_type, roomTypes);

      const assignmentData = {
        staff_id: currentUser._id,
        care_plan_ids: selectedPlans.map(plan => plan._id),
        resident_id: selectedResident._id,
        family_member_id: selectedResident.family_member_id,
        registration_date: new Date(),
        consultation_notes: consultationNotes,
        selected_room_type: selectedRoomType.room_type,
        family_preferences: familyPreferences,
        total_monthly_cost: costCalculation.totalCost,
        room_monthly_cost: costCalculation.roomCost,
        care_plans_monthly_cost: costCalculation.carePlansCost,
        status: 'consulting',
        payment_status: 'pending'
      };

      await createCarePlanAssignment(assignmentData);
      
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
      Alert.alert('Lỗi', 'Không thể đăng ký gói dịch vụ. Vui lòng thử lại.');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const totalCost = calculateTotalCost(
    [selectedMainPlan, ...selectedSupplementaryPlans], 
    selectedRoomType?.room_type, 
    roomTypes
  );

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

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Chọn người cao tuổi */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Chọn Người Cao Tuổi</Text>
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
                <Text style={styles.residentName}>{resident?.full_name || ''}</Text>
                <Text style={styles.residentInfo}>
                  {`${resident?.gender === 'male' ? 'Nam' : 'Nữ'}  b7 ${resident?.care_level || ''}`}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Chọn gói dịch vụ chính */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Gói Dịch Vụ Chính (Bắt buộc)</Text>
          <Text style={styles.sectionSubtitle}>Chọn 1 gói dịch vụ chính</Text>
          {mainCarePlans.filter(Boolean).map((plan) => (
            <TouchableOpacity
              key={plan._id}
              style={[
                styles.planCard,
                selectedMainPlan?._id === plan._id && styles.selectedCard
              ]}
              onPress={() => handleMainPlanSelect(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan?.plan_name || ''}</Text>
                <Text style={styles.planPrice}>{formatPrice(plan?.monthly_price || 0)}/tháng</Text>
              </View>
              <Text style={styles.planDescription}>{plan?.description || ''}</Text>
              <View style={styles.planDetails}>
                <Text style={styles.planDetail}>Tỷ lệ nhân viên: {plan?.staff_ratio || ''}</Text>
                <Text style={styles.planDetail}>
                  Dịch vụ bao gồm: {plan?.services_included?.length || 0} dịch vụ
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
                  <Text style={styles.planName}>{plan?.plan_name || ''}</Text>
                  <View style={styles.priceContainer}>
                    <Text style={styles.planPrice}>{formatPrice(plan?.monthly_price || 0)}/tháng</Text>
                    {isSelected && (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />
                    )}
                  </View>
                </View>
                <Text style={styles.planDescription}>{plan?.description || ''}</Text>
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
                <Text style={styles.roomName}>{roomType?.type_name || ''}</Text>
                <Text style={styles.roomPrice}>{formatPrice(roomType?.monthly_price || 0)}/tháng</Text>
              </View>
              <Text style={styles.roomDescription}>{roomType?.description || ''}</Text>
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

        {/* Tổng chi phí */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Tổng Chi Phí</Text>
          <View style={styles.costCard}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Gói dịch vụ chính:</Text>
              <Text style={styles.costValue}>
                {selectedMainPlan ? formatPrice(selectedMainPlan?.monthly_price || 0) : 'Chưa chọn'}
              </Text>
            </View>
            {selectedSupplementaryPlans.filter(Boolean).map((plan) => (
              <View key={plan._id} style={styles.costRow}>
                <Text style={styles.costLabel}>+ {plan?.plan_name || ''}:</Text>
                <Text style={styles.costValue}>{formatPrice(plan?.monthly_price || 0)}</Text>
              </View>
            ))}
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Chi phí phòng:</Text>
              <Text style={styles.costValue}>
                {selectedRoomType ? formatPrice(selectedRoomType?.monthly_price || 0) : 'Chưa chọn'}
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
            (!selectedResident || !selectedMainPlan || !selectedRoomType) && styles.disabledButton
          ]}
          onPress={handleSubmit}
          disabled={!selectedResident || !selectedMainPlan || !selectedRoomType}
        >
          <Text style={styles.submitButtonText}>Đăng Ký Gói Dịch Vụ</Text>
        </TouchableOpacity>
      </View>
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
});

export default CarePlanSelectionScreen; 