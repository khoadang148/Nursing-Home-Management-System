import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
  Modal,
  FlatList
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import carePlanService from '../../api/services/carePlanService';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';
import { useSelector } from 'react-redux';
import { formatDate } from '../../utils/helpers';
import { COLORS } from '../../constants/theme';
import apiClient from '../../api/config/axiosConfig';

const { width: screenWidth } = Dimensions.get('window');

// Hàm formatDate an toàn với kiểm tra null
const safeFormatDate = (date) => {
  if (!date) return 'Không xác định';
  return formatDate(date);
};

// Chuyển loại giường sang tiếng Việt
const bedTypeToVietnamese = (type) => {
  switch (type) {
    case 'standard': return 'Tiêu chuẩn';
    case 'electric': return 'Điện';
    case 'medical': return 'Y tế';
    default: return type || '';
  }
};

// Helper functions for status
const getStatusText = (status) => {
  switch (status) {
    case 'active': return 'Đang hoạt động';
    case 'completed': return 'Hoàn thành';
    case 'cancelled': return 'Đã hủy';
    case 'paused': return 'Tạm dừng';
    case 'packages_selected': return 'Đã chọn gói';
    case 'room_assigned': return 'Đã phân phòng';
    case 'payment_completed': return 'Đã thanh toán';
    default: return 'Không xác định';
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return '#4CAF50'; // Green
    case 'completed': return '#2196F3'; // Blue
    case 'cancelled': return '#F44336'; // Red
    case 'paused': return '#FF9800'; // Orange
    case 'packages_selected': return '#9C27B0'; // Purple
    case 'room_assigned': return '#607D8B'; // Blue Grey
    case 'payment_completed': return '#4CAF50'; // Green
    default: return '#757575'; // Grey
  }
};

// Hàm format giá tiền với đơn vị tính riêng
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN').format(price * 10000);
};

const ServicePackageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('registered'); // 'registered', 'available'
  const [registeredPackages, setRegisteredPackages] = useState([]);
  const [availablePackages, setAvailablePackages] = useState({ main_packages: [], supplementary_packages: [] });
  const [showPackageDetail, setShowPackageDetail] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // New states for resident selection
  const [showResidentSelection, setShowResidentSelection] = useState(false);
  const [availableResidents, setAvailableResidents] = useState([]);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentsLoading, setResidentsLoading] = useState(false);
  const [bedAssignments, setBedAssignments] = useState({}); // { [resident_id]: bedAssignment }
  const [roomTypes, setRoomTypes] = useState([]);

  const user = useSelector((state) => state.auth.user);
  useEffect(() => {
    if (user?.id) {
      fetchData();
    }
  }, [user?.id]); // Only depend on user.id, not entire user object

  // Lấy thông tin bed assignment cho từng resident
  const fetchBedAssignments = async (packages) => {
    const newAssignments = { ...bedAssignments };
    const promises = [];
    (packages || []).forEach(pkg => {
      const residentId = pkg.resident_id?._id || pkg.resident_id;
      if (residentId && !newAssignments[residentId]) {
        promises.push(
          apiClient.get('/bed-assignments/by-resident', { params: { resident_id: residentId } })
            .then(res => {
              newAssignments[residentId] = Array.isArray(res.data) ? res.data[0] : res.data;
            })
            .catch(() => { newAssignments[residentId] = null; })
        );
      }
    });
    await Promise.all(promises);
    setBedAssignments(newAssignments);
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      // Lấy gói đã đăng ký
      const registeredRes = await carePlanAssignmentService.getCarePlanAssignmentsByFamilyMemberId(user?.id);
      const pkgs = registeredRes.success ? registeredRes.data : [];
      setRegisteredPackages(pkgs);
      await fetchBedAssignments(pkgs);

      // Lấy gói có sẵn
      const availableRes = await carePlanService.getCarePlans();
      console.log('DEBUG - Available care plans response:', availableRes);
      if (availableRes && Array.isArray(availableRes)) {
        console.log('DEBUG - Available care plans data:', availableRes);
        const mainPackages = availableRes.filter(pkg => pkg.category === 'main')
          .sort((a, b) => (a.monthly_price || 0) - (b.monthly_price || 0));
        const supplementaryPackages = availableRes.filter(pkg => pkg.category === 'supplementary')
          .sort((a, b) => (a.monthly_price || 0) - (b.monthly_price || 0));
        console.log('DEBUG - Main packages count:', mainPackages.length);
        console.log('DEBUG - Supplementary packages count:', supplementaryPackages.length);
        setAvailablePackages({
          main_packages: mainPackages,
          supplementary_packages: supplementaryPackages
        });
      } else {
        console.log('DEBUG - Available care plans failed or empty:', availableRes);
        setAvailablePackages({ main_packages: [], supplementary_packages: [] });
      }

      // Fetch room types
      try {
        let roomTypesRes = await apiClient.get('/room-types');
        let types = Array.isArray(roomTypesRes.data) ? roomTypesRes.data : (roomTypesRes.data?.data || []);
        if (!Array.isArray(types) || types.length === 0) {
          try {
            roomTypesRes = await apiClient.get('/room_types');
            types = Array.isArray(roomTypesRes.data) ? roomTypesRes.data : (roomTypesRes.data?.data || []);
          } catch (e) {}
        }
        types = (types || []).sort((a, b) => (a.monthly_price || 0) - (b.monthly_price || 0));
        setRoomTypes(types);
      } catch (e) {
        console.log('Failed to fetch room types:', e?.response?.status || e?.message);
        setRoomTypes([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu gói dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const getPackageIcon = (planType, category) => {
    if (category === 'main') {
      switch (planType) {
        case 'cham_soc_tieu_chuan': return 'heart-outline';
        case 'cham_soc_tich_cuc': return 'medical-outline';
        case 'cham_soc_dac_biet': return 'star-outline';
        case 'cham_soc_sa_sut_tri_tue': return 'fitness-outline'; // Thay thế brain-outline bằng fitness-outline
        default: return 'heart-outline';
      }
    } else {
      switch (planType) {
        case 'ho_tro_dinh_duong': return 'restaurant-outline'; // Thay thế nutrition-outline bằng restaurant-outline
        case 'cham_soc_vet_thuong': return 'bandage'; // Thay thế bandage-outline vì không có trong Ionicons
        case 'vat_ly_tri_lieu': return 'fitness-outline';
        case 'cham_soc_tieu_duong': return 'pulse-outline';
        case 'phuc_hoi_chuc_nang': return 'accessibility-outline';
        case 'cham_soc_giam_nhe': return 'leaf-outline'; // Thay thế flower-outline bằng leaf-outline
        default: return 'add-circle-outline';
      }
    }
  };

  const getPackageColor = (planType, category) => {
    if (category === 'main') {
      switch (planType) {
        case 'cham_soc_tieu_chuan': return '#2196F3';
        case 'cham_soc_tich_cuc': return '#4CAF50';
        case 'cham_soc_dac_biet': return '#FF9800';
        case 'cham_soc_sa_sut_tri_tue': return '#9C27B0';
        default: return '#2196F3';
      }
    } else {
      return '#607D8B';
    }
  };

  const handlePackagePress = (packageData) => {
    console.log('=== Package Press Debug ===');
    console.log('Package pressed:', packageData);
    
    // Determine package type based on data structure
    const isRegistered = packageData.resident_id || packageData.family_member_id;
    const packageType = isRegistered ? 'registered' : 'available';
    
    console.log('Package type:', packageType);
    console.log('Package name:', packageData.plan_name || packageData.main_care_plan?.plan_name);
    console.log('Navigation params:', {
      packageData: packageData,
      packageType: packageType
    });
    console.log('Navigating to ServicePackageDetail screen...');
    
    try {
      // Navigate to dedicated detail screen
      navigation.navigate('ServicePackageDetail', {
        packageData: packageData,
        packageType: packageType
      });
      console.log('Navigation successful!');
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert('Lỗi', 'Không thể mở chi tiết gói dịch vụ');
    }
  };

  // TODO: Cập nhật logic lấy residents phù hợp từ API thật nếu cần
  const handleRegisterPress = async (packageData) => {
    try {
      setResidentsLoading(true);
      // Lấy danh sách người thân phù hợp để đăng ký gói dịch vụ
      const result = await carePlanAssignmentService.getAvailableResidents(packageData);
      
      if (result.success && result.data.length > 0) {
        setAvailableResidents(result.data);
        setSelectedPackage(packageData);
        setShowPackageDetail(false);
        setShowResidentSelection(true);
      } else if (result.data.length === 0) {
        Alert.alert(
          'Không thể đăng ký',
          'Tất cả người thân đã đăng ký gói dịch vụ này hoặc gói tương tự.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Lỗi', result.error);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải danh sách người thân');
    } finally {
      setResidentsLoading(false);
    }
  };

  // TODO: Cập nhật logic đăng ký gói dịch vụ qua API thật nếu cần
  const handleRegisterPackage = async (residentId) => {
    if (!selectedPackage || !residentId) return;

    Alert.alert(
      'Xác nhận đăng ký',
      `Bạn có muốn đăng ký gói "${selectedPackage.plan_name}" cho ${availableResidents.find(r => r._id === residentId)?.full_name}?`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng ký',
          onPress: async () => {
            try {
              setActionLoading(true);
              // Thực hiện đăng ký gói dịch vụ thông qua API
              const result = await carePlanAssignmentService.registerCarePlanAssignment({
                care_plan_id: selectedPackage._id,
                family_member_id: residentId,
                notes: 'Đăng ký từ app mobile'
              });

              if (result.success) {
                Alert.alert('Thành công', 'Đăng ký gói dịch vụ thành công!');
                setShowResidentSelection(false);
                setSelectedPackage(null);
                fetchData(); // Refresh data
              } else {
                Alert.alert('Lỗi', result.error);
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể đăng ký gói dịch vụ');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderTabHeader = () => (
    <View style={styles.tabContainer}>
      <View style={styles.tabWrapper}>
        <TouchableOpacity
          style={[
            styles.tab, 
            selectedTab === 'registered' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('registered')}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText, 
              selectedTab === 'registered' && styles.activeTabText
            ]}>
              Gói đã đăng ký
            </Text>
            {registeredPackages.length > 0 && (
              <View style={[
                styles.badge,
                selectedTab === 'registered' && styles.activeBadge
              ]}>
                <Text style={[
                  styles.badgeText,
                  selectedTab === 'registered' && styles.activeBadgeText
                ]}>{registeredPackages.length}</Text>
              </View>
            )}
          </View>
          {selectedTab === 'registered' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab, 
            selectedTab === 'available' && styles.activeTab
          ]}
          onPress={() => setSelectedTab('available')}
          activeOpacity={0.7}
        >
          <View style={styles.tabContent}>
            <Text style={[
              styles.tabText, 
              selectedTab === 'available' && styles.activeTabText
            ]}>
              Gói và loại phòng có sẵn
            </Text>
          </View>
          {selectedTab === 'available' && <View style={styles.activeIndicator} />}
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderRegisteredPackageCard = ({ item }) => {
    const residentId = item.resident_id?._id || item.resident_id;
    const bedAssignment = bedAssignments[residentId];
    let roomNumber = '--', bedNumber = '--', bedType = '';
    if (bedAssignment && bedAssignment.bed_id) {
      bedNumber = bedAssignment.bed_id.bed_number || '--';
      bedType = bedAssignment.bed_id.bed_type || '';
      if (bedAssignment.bed_id.room_id) {
        roomNumber = bedAssignment.bed_id.room_id.room_number || '--';
      }
    }

    // Robust care plans monthly: prefer API field, otherwise sum plan.monthly_price
    const carePlansMonthly = (item.care_plans_monthly_cost != null)
      ? item.care_plans_monthly_cost
      : (Array.isArray(item.care_plan_ids)
          ? item.care_plan_ids.reduce((sum, plan) => sum + (plan?.monthly_price || 0), 0)
          : 0);
    const roomMonthly = item.room_monthly_cost || 0;

    // Determine total to display: if no room/bed, show only care plans cost; else show total
    const hasBed = !!(bedAssignment && bedAssignment.bed_id);
    const totalMonthly = hasBed
      ? (item.total_monthly_cost != null ? item.total_monthly_cost : (carePlansMonthly + roomMonthly))
      : carePlansMonthly;

    // Phân loại gói chính/gói phụ từ care_plan_ids
    const mainPlan = (item.care_plan_ids || []).find(plan => plan.category === 'main');
    const supplementaryPlans = (item.care_plan_ids || []).filter(plan => plan.category === 'supplementary');
    return (
      <TouchableOpacity
        style={styles.registeredCard}
        onPress={() => handlePackagePress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.cardHeader}>
          <View style={styles.residentInfo}>
            <View style={[styles.iconContainer, { backgroundColor: getPackageColor(mainPlan?.plan_type || 'default', 'main') + '20' }]}>
              <Ionicons 
                name="person" 
                size={20} 
                color={getPackageColor(mainPlan?.plan_type || 'default', 'main')} 
              />
            </View>
            <View style={styles.residentDetails}>
              <Text style={styles.residentName}>{item.resident_id?.full_name || 'Không có tên'}</Text>
              <Text style={styles.roomInfo}>Phòng {roomNumber} • Giường {bedNumber}{bedType ? ` (${bedTypeToVietnamese(bedType)})` : ''}</Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.packageInfo}>
          <View style={styles.mainPackage}>
            <Text style={styles.packageTitle}>Gói chính</Text>
            <Text style={styles.packageName}>{mainPlan?.plan_name || 'Không có tên gói'}</Text>
            <Text style={styles.packagePrice}>{formatPrice(mainPlan?.monthly_price || 0)}/tháng</Text>
          </View>

          {supplementaryPlans.length > 0 && (
            <View style={styles.supplementaryPackages}>
              <Text style={styles.packageTitle}>Gói bổ sung ({supplementaryPlans.length})</Text>
              {supplementaryPlans.map((plan, index) => (
                <View key={plan._id || index} style={styles.supplementaryItem}>
                  <Text style={styles.supplementaryName}>{plan.plan_name || 'Không có tên'}</Text>
                  <Text style={styles.supplementaryPrice}>{formatPrice(plan.monthly_price || 0)}/tháng</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.totalCost}>
            <Text style={styles.totalLabel}>Tổng chi phí hàng tháng:</Text>
            <Text style={styles.totalAmount}>{formatPrice(totalMonthly)}/tháng</Text>
          </View>

        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.dateInfo}>
            Từ {safeFormatDate(item.start_date)} đến {safeFormatDate(item.end_date)}
          </Text>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderAvailablePackageCard = ({ item }) => (
    <TouchableOpacity
      style={[styles.availableCard, { borderLeftColor: getPackageColor(item.plan_type, item.category) }]}
      onPress={() => handlePackagePress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.availableCardHeader}>
        <View style={[styles.iconContainer, { backgroundColor: getPackageColor(item.plan_type, item.category) + '20' }]}>
          <Ionicons 
            name={getPackageIcon(item.plan_type, item.category)} 
            size={24} 
            color={getPackageColor(item.plan_type, item.category)} 
          />
        </View>
        <View style={styles.packageDetails}>
          <Text style={styles.availablePackageName}>{item.plan_name}</Text>
          <Text style={styles.availablePackageDesc}>{item.description}</Text>
          <Text style={styles.availablePackagePrice}>{formatPrice(item.monthly_price)}/tháng</Text>
        </View>
        <View style={[styles.categoryBadge, { backgroundColor: item.category === 'main' ? '#2196F3' : '#607D8B' }]}>
          <Text style={styles.categoryText}>
            {item.category === 'main' ? 'Chính' : 'Phụ'}
          </Text>
        </View>
      </View>

      <View style={styles.servicesPreview}>
        <Text style={styles.servicesTitle}>Dịch vụ bao gồm:</Text>
        <Text style={styles.servicesText} numberOfLines={2}>
          {item.services_included.slice(0, 3).join(' • ')}
          {item.services_included.length > 3 && '...'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderPackageDetailModal = () => {
    console.log('renderPackageDetailModal called:', { selectedPackage: !!selectedPackage, showPackageDetail, hasSelectedPackage: !!selectedPackage });
    if (!selectedPackage || !showPackageDetail) {
      console.log('Modal not showing because:', { selectedPackage: !!selectedPackage, showPackageDetail });
      return null;
    }
    console.log('Modal should show now!');
    
    return (
      <Modal
        visible={showPackageDetail}
        animationType="slide"
        transparent={true}
        onShow={() => console.log('Modal onShow triggered!')}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedPackage?.plan_name || selectedPackage?.main_care_plan?.plan_name || 'Chi tiết gói dịch vụ'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowPackageDetail(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {selectedPackage?.resident ? (
                // Hiển thị chi tiết gói đã đăng ký
                <View>
                  <View style={styles.residentSection}>
                    <Text style={styles.sectionTitle}>👤 Thông tin người thân</Text>
                    <View style={styles.residentDetailCard}>
                      <Text style={styles.residentDetailName}>{selectedPackage.resident?.full_name || 'Không có tên'}</Text>
                      <Text style={styles.residentDetailInfo}>
                        📍 Phòng {selectedPackage.resident?.room_number || '--'} • Giường {selectedPackage.resident?.bed_number || '--'}
                      </Text>
                      <Text style={styles.residentDetailInfo}>
                        🎂 Ngày sinh: {safeFormatDate(selectedPackage.resident?.date_of_birth)}
                      </Text>
                                          <Text style={styles.residentDetailInfo}>
                      ⚕️ Trạng thái: {getStatusText(selectedPackage.status)}
                    </Text>
                    </View>
                  </View>

                  <View style={styles.packageSection}>
                    <Text style={styles.sectionTitle}>📦 Gói dịch vụ chính</Text>
                    <View style={styles.mainPackageDetail}>
                      <View style={styles.packageDetailInfo}>
                        <Text style={styles.mainPackageDetailName}>{selectedPackage.main_care_plan?.plan_name || 'Không có tên gói'}</Text>
                        <Text style={styles.packageDetailDescription}>{selectedPackage.main_care_plan?.description || 'Gói chăm sóc cơ bản'}</Text>
                      </View>
                      <Text style={styles.mainPackageDetailPrice}>{formatPrice(selectedPackage.main_care_plan?.monthly_price || 0)}/tháng</Text>
                    </View>
                    
                    {selectedPackage.main_care_plan?.services_included && selectedPackage.main_care_plan.services_included.length > 0 && (
                      <View style={styles.servicesSection}>
                        <Text style={styles.servicesTitle}>Dịch vụ bao gồm:</Text>
                        {selectedPackage.main_care_plan.services_included.map((service, index) => (
                          <View key={index} style={styles.serviceItem}>
                            <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                            <Text style={styles.serviceText}>{service}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>

                  {selectedPackage.supplementary_plans && selectedPackage.supplementary_plans.length > 0 && (
                    <View style={styles.packageSection}>
                      <Text style={styles.sectionTitle}>➕ Gói dịch vụ bổ sung ({selectedPackage.supplementary_plans.length})</Text>
                      {selectedPackage.supplementary_plans.map((plan, index) => (
                        <View key={index} style={styles.supplementaryDetailCard}>
                          <View style={styles.supplementaryDetailHeader}>
                            <Text style={styles.supplementaryDetailName}>{plan.plan_name || 'Không có tên'}</Text>
                            <Text style={styles.supplementaryDetailPrice}>{formatPrice(plan.monthly_price || 0)}/tháng</Text>
                          </View>
                          <Text style={styles.supplementaryDescription}>{plan.description || 'Dịch vụ bổ sung'}</Text>
                          
                          {plan.services_included && plan.services_included.length > 0 && (
                            <View style={styles.supplementaryServices}>
                              {plan.services_included.slice(0, 3).map((service, serviceIndex) => (
                                <View key={serviceIndex} style={styles.serviceItem}>
                                  <Ionicons name="checkmark-circle" size={14} color="#607D8B" />
                                  <Text style={styles.supplementaryServiceText}>{service}</Text>
                                </View>
                              ))}
                              {plan.services_included.length > 3 && (
                                <Text style={styles.moreServicesText}>
                                  +{plan.services_included.length - 3} dịch vụ khác
                                </Text>
                              )}
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  <View style={styles.packageSection}>
                    <Text style={styles.sectionTitle}>💰 Thông tin thanh toán</Text>
                    <View style={styles.paymentInfo}>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Tổng chi phí hàng tháng:</Text>
                        <Text style={styles.paymentValue}>{formatPrice(selectedPackage.total_monthly_cost || 0)}/tháng</Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Trạng thái thanh toán:</Text>
                        <Text style={[styles.paymentValue, { color: selectedPackage.payment_status === 'fully_paid' ? '#4CAF50' : '#FF9800' }]}>
                          {selectedPackage.payment_status === 'fully_paid' ? '✅ Đã thanh toán đầy đủ' : '⏳ Chưa hoàn tất'}
                        </Text>
                      </View>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Thời gian áp dụng:</Text>
                        <Text style={styles.paymentValue}>
                          {safeFormatDate(selectedPackage.start_date)} - {safeFormatDate(selectedPackage.end_date)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {selectedPackage.notes && (
                    <View style={styles.packageSection}>
                      <Text style={styles.sectionTitle}>📝 Ghi chú</Text>
                      <Text style={styles.notesText}>{selectedPackage.notes}</Text>
                    </View>
                  )}
                </View>
              ) : (
                // Hiển thị chi tiết gói có sẵn
                <View>
                  <View style={styles.packageOverview}>
                    <View style={[styles.largeIconContainer, { backgroundColor: getPackageColor(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main') + '20' }]}>
                      <Ionicons 
                        name={getPackageIcon(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main')} 
                        size={32} 
                        color={getPackageColor(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main')} 
                      />
                    </View>
                    <Text style={styles.packageOverviewName}>{selectedPackage?.plan_name || 'Gói dịch vụ'}</Text>
                    <Text style={styles.packageOverviewPrice}>{formatPrice(selectedPackage?.monthly_price || 0)}/tháng</Text>
                    <Text style={styles.packageOverviewDesc}>{selectedPackage?.description || 'Không có mô tả'}</Text>
                    <View style={[styles.categoryIndicator, { backgroundColor: selectedPackage?.category === 'main' ? '#2196F3' : '#607D8B' }]}>
                      <Text style={styles.categoryIndicatorText}>
                        {selectedPackage?.category === 'main' ? '🏆 Gói chăm sóc chính' : '➕ Gói dịch vụ bổ sung'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.packageSection}>
                    <Text style={styles.sectionTitle}>✅ Dịch vụ bao gồm</Text>
                    {selectedPackage?.services_included && selectedPackage.services_included.length > 0 ? (
                      selectedPackage.services_included.map((service, index) => (
                        <View key={index} style={styles.serviceItem}>
                          <Ionicons name="checkmark-circle" size={16} color="#4CAF50" />
                          <Text style={styles.serviceText}>{service}</Text>
                        </View>
                      ))
                    ) : (
                      <View style={styles.emptyServiceState}>
                        <Text style={styles.emptyServiceText}>Không có thông tin dịch vụ</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.packageSection}>
                    <Text style={styles.sectionTitle}>ℹ️ Thông tin chi tiết</Text>
                    <View style={styles.detailInfo}>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>👥 Tỷ lệ nhân viên:</Text>
                        <Text style={styles.detailValue}>{selectedPackage?.staff_ratio || 'Không xác định'}</Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📋 Loại gói:</Text>
                        <Text style={styles.detailValue}>
                          {selectedPackage?.category === 'main' ? 'Gói chăm sóc chính (bắt buộc)' : 'Gói dịch vụ bổ sung (tùy chọn)'}
                        </Text>
                      </View>
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>💳 Chu kỳ thanh toán:</Text>
                        <Text style={styles.detailValue}>Hàng tháng</Text>
                      </View>
                      {selectedPackage?.duration && (
                        <View style={styles.detailRow}>
                          <Text style={styles.detailLabel}>⏱️ Thời gian tối thiểu:</Text>
                          <Text style={styles.detailValue}>{selectedPackage.duration}</Text>
                        </View>
                      )}
                    </View>
                  </View>

                  {selectedPackage?.prerequisites && selectedPackage.prerequisites.length > 0 && (
                    <View style={styles.packageSection}>
                      <Text style={styles.sectionTitle}>📋 Điều kiện áp dụng</Text>
                      {selectedPackage.prerequisites.map((prereq, index) => (
                        <View key={index} style={styles.prereqItem}>
                          <Ionicons name="information-circle" size={16} color="#2196F3" />
                          <Text style={styles.prereqText}>{prereq}</Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedPackage?.contraindications && selectedPackage.contraindications.length > 0 && (
                    <View style={styles.packageSection}>
                      <Text style={styles.sectionTitle}>⚠️ Chống chỉ định</Text>
                      {selectedPackage.contraindications.map((contraind, index) => (
                        <View key={index} style={styles.contraindicationItem}>
                          <Ionicons name="warning" size={16} color="#FF9800" />
                          <Text style={styles.contraindicationText}>{contraind}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </ScrollView>

            {!selectedPackage?.resident && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={() => handleRegisterPress(selectedPackage)}
                  disabled={actionLoading}
                  activeOpacity={0.8}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.registerButtonText}>Đăng ký gói này</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  const renderResidentSelectionModal = () => {
    // Thêm điều kiện kiểm tra để đảm bảo modal chỉ hiển thị khi cần
    if (!showResidentSelection || !selectedPackage) return null;
    
    return (
      <Modal
        visible={showResidentSelection}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                👥 Chọn người thân đăng ký
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowResidentSelection(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalContent}>
              <View style={styles.packageInfoBanner}>
                <View style={[styles.iconContainer, { backgroundColor: getPackageColor(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main') + '20' }]}>
                  <Ionicons 
                    name={getPackageIcon(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main')} 
                    size={24} 
                    color={getPackageColor(selectedPackage?.plan_type || 'default', selectedPackage?.category || 'main')} 
                  />
                </View>
                <View style={styles.packageInfoText}>
                  <Text style={styles.packageInfoName}>{selectedPackage?.plan_name}</Text>
                  <Text style={styles.packageInfoPrice}>{formatPrice(selectedPackage?.monthly_price || 0)}/tháng</Text>
                </View>
              </View>

              <Text style={styles.instructionText}>
                Chọn người thân bạn muốn đăng ký gói dịch vụ này:
              </Text>

              {residentsLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={COLORS.primary} />
                  <Text style={styles.loadingText}>Đang tải danh sách...</Text>
                </View>
              ) : availableResidents.length > 0 ? (
                <ScrollView style={styles.residentsList} showsVerticalScrollIndicator={false}>
                  {availableResidents.map((resident) => (
                    <TouchableOpacity
                      key={resident._id}
                      style={[
                        styles.residentCard,
                        selectedResident === resident._id && styles.selectedResidentCard
                      ]}
                      onPress={() => setSelectedResident(resident._id)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.residentCardContent}>
                        <View style={styles.residentAvatar}>
                          <Ionicons name="person" size={24} color="#666" />
                        </View>
                        <View style={styles.residentInfo}>
                          <Text style={styles.residentName}>{resident.full_name}</Text>
                          <Text style={styles.residentDetails}>
                            📍 Phòng {resident.room_number} • Giường {resident.bed_number}
                          </Text>
                          <Text style={styles.residentDetails}>
                            🎂 {safeFormatDate(resident.date_of_birth)}
                          </Text>
                        </View>
                        {selectedResident === resident._id && (
                          <View style={styles.selectedIcon}>
                            <Ionicons name="checkmark-circle" size={24} color={COLORS.primary} />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <View style={styles.emptyResidents}>
                  <Ionicons name="people-outline" size={64} color="#ccc" />
                  <Text style={styles.emptyResidentsTitle}>Không có người thân phù hợp</Text>
                  <Text style={styles.emptyResidentsDesc}>
                    Tất cả người thân đã đăng ký gói dịch vụ này hoặc gói tương tự.
                  </Text>
                </View>
              )}
            </View>

            {availableResidents.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={[
                    styles.registerButton,
                    !selectedResident && styles.disabledButton
                  ]}
                  onPress={() => handleRegisterPackage(selectedResident)}
                  disabled={!selectedResident || actionLoading}
                  activeOpacity={0.8}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="white" />
                  ) : (
                    <>
                      <Ionicons name="add-circle" size={20} color="white" style={{ marginRight: 8 }} />
                      <Text style={styles.registerButtonText}>
                        Đăng ký cho {availableResidents.find(r => r._id === selectedResident)?.full_name || 'người thân'}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Đang tải gói dịch vụ...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#212529" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Gói Dịch Vụ Và Phòng</Text>
            <Text style={styles.headerSubtitle}>Quản lý gói chăm sóc của người thân</Text>
          </View>
        </View>
      </View>

      {renderTabHeader()}

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
      >
        {selectedTab === 'registered' ? (
          <View style={styles.registeredSection}>
             {registeredPackages.length > 0 ? (
               <FlatList
                 data={registeredPackages}
                 renderItem={renderRegisteredPackageCard}
                 keyExtractor={(item) => item._id}
                 scrollEnabled={false}
                 showsVerticalScrollIndicator={false}
               />
             ) : (
               <View style={styles.emptyState}>
                 <Ionicons name="package-outline" size={64} color="#ccc" />
                 <Text style={styles.emptyTitle}>Chưa có gói dịch vụ nào</Text>
                 <Text style={styles.emptyDesc}>
                   {`Bạn chưa đăng ký gói dịch vụ nào cho người thân\nHãy xem các gói có sẵn để đăng ký.`}
                 </Text>
                 <TouchableOpacity
                   style={styles.viewAvailableButton}
                   onPress={() => setSelectedTab('available')}
                 >
                   <Text style={styles.viewAvailableButtonText}>Xem gói có sẵn</Text>
                 </TouchableOpacity>
               </View>
             )}
           </View>
         ) : (
          <View style={styles.availableSection}>
            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Gói Chăm Sóc Chính</Text>
              </View>
              <Text style={styles.categoryDesc}>Gói dịch vụ chăm sóc cơ bản (bắt buộc)</Text>
              <FlatList
                data={availablePackages.main_packages}
                renderItem={renderAvailablePackageCard}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Gói Dịch Vụ Bổ Sung</Text>
              </View>
              <Text style={styles.categoryDesc}>Dịch vụ chuyên khoa theo nhu cầu (tùy chọn)</Text>
              <FlatList
                data={availablePackages.supplementary_packages}
                renderItem={renderAvailablePackageCard}
                keyExtractor={(item) => item._id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>

            <View style={styles.categorySection}>
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryTitle}>Loại Phòng Có Sẵn</Text>
              </View>
              <Text style={styles.categoryDesc}>Các loại phòng và tiện ích kèm theo</Text>
              <FlatList
                data={roomTypes}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.availableCard, { borderLeftColor: '#607D8B' }]}
                    onPress={() => navigation.navigate('ServicePackageDetail', { packageData: item, packageType: 'room_type' })}
                    activeOpacity={0.7}
                  >
                    <View style={styles.availableCardHeader}>
                      <View style={[styles.iconContainer, { backgroundColor: '#607D8B20' }]}>
                        <Ionicons name="bed-outline" size={24} color="#607D8B" />
                      </View>
                      <View style={styles.packageDetails}>
                        <Text style={styles.availablePackageName}>{item.type_name || item.name || 'Loại phòng'}</Text>
                        {!!item.description && (
                          <Text style={styles.availablePackageDesc}>{item.description}</Text>
                        )}
                        <Text style={styles.availablePackagePrice}>{formatPrice(item.monthly_price || 0)}/tháng</Text>
                      </View>
                      <View style={[styles.categoryBadge, { backgroundColor: '#607D8B' }]}>
                        <Text style={styles.categoryText}>Phòng</Text>
                      </View>
                    </View>

                    {Array.isArray(item.amenities) && item.amenities.length > 0 && (
                      <View style={styles.servicesPreview}>
                        <Text style={styles.servicesTitle}>Tiện ích:</Text>
                        <Text style={styles.servicesText} numberOfLines={2}>
                          {item.amenities.slice(0, 4).join(' • ')}
                          {item.amenities.length > 4 && '...'}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
                keyExtractor={(item, index) => item._id || item.id || `${item.type_name || item.name}-${index}`}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          </View>
        )}
      </ScrollView>

      {renderPackageDetailModal()}
      {renderResidentSelectionModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#6c757d',
    textAlign: 'center',
  },
  header: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6c757d',
  },
  tabContainer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tabWrapper: {
    flexDirection: 'row',
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    padding: 4,
  },
  tab: {
    flex: 1,
    position: 'relative',
  },
  activeTab: {
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6c757d',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  badge: {
    backgroundColor: '#e9ecef',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
    minWidth: 20,
    alignItems: 'center',
  },
  activeBadge: {
    backgroundColor: COLORS.primary,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6c757d',
  },
  activeBadgeText: {
    color: 'white',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  registeredSection: {
    padding: 16,
  },
  unitRow: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  unitUnderTotal: {
    marginTop: 4,
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    alignSelf: 'flex-end',
  },
  registeredCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  residentInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 13,
    color: '#6c757d',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  packageInfo: {
    marginBottom: 12,
  },
  mainPackage: {
    marginBottom: 12,
  },
  packageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 2,
  },
  packagePrice: {
    fontSize: 14,
    color: '#28a745',
    fontWeight: '500',
  },
  supplementaryPackages: {
    marginBottom: 12,
  },
  supplementaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  supplementaryName: {
    fontSize: 13,
    color: '#495057',
    flex: 1,
  },
  supplementaryPrice: {
    fontSize: 13,
    color: '#28a745',
    fontWeight: '500',
  },
  totalCost: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f8f9fa',
  },
  dateInfo: {
    fontSize: 12,
    color: '#6c757d',
  },
  availableSection: {
    padding: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  unitLabel: {
    fontSize: 12,
    color: '#6c757d',
    fontStyle: 'italic',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryDesc: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
  },
  availableCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  availableCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  packageDetails: {
    flex: 1,
  },
  availablePackageName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  availablePackageDesc: {
    fontSize: 13,
    color: '#6c757d',
    marginBottom: 6,
  },
  availablePackagePrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'white',
  },
  servicesPreview: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  servicesTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  servicesText: {
    fontSize: 12,
    color: '#6c757d',
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDesc: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  viewAvailableButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  viewAvailableButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  residentSection: {
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 12,
  },
  residentDetailCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
  },
  residentDetailName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 6,
  },
  residentDetailInfo: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  packageSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  mainPackageDetail: {
    backgroundColor: '#e8f5e8',
    padding: 16,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainPackageDetailName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212529',
    flex: 1,
  },
  mainPackageDetailPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  supplementaryDetailCard: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplementaryDetailName: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  supplementaryDetailPrice: {
    fontSize: 13,
    fontWeight: '500',
    color: '#28a745',
  },
  paymentInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentLabel: {
    fontSize: 14,
    color: '#6c757d',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
  },
  notesText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 10,
  },
  packageOverview: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  largeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageOverviewName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 8,
    textAlign: 'center',
  },
  packageOverviewPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  packageOverviewDesc: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  categoryIndicator: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
  },
  categoryIndicatorText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  packageDetailInfo: {
    flex: 1,
  },
  packageDetailDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 4,
  },
  servicesSection: {
    marginTop: 12,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  supplementaryDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  supplementaryDescription: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 8,
  },
  supplementaryServices: {
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderRadius: 6,
  },
  supplementaryServiceText: {
    fontSize: 12,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  moreServicesText: {
    fontSize: 11,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  emptyServiceState: {
    alignItems: 'center',
    padding: 20,
  },
  emptyServiceText: {
    fontSize: 14,
    color: '#6c757d',
    fontStyle: 'italic',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    flexDirection: 'row',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  packageInfoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  packageInfoText: {
    flex: 1,
    marginLeft: 12,
  },
  packageInfoName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  packageInfoPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
  },
  instructionText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 16,
    textAlign: 'center',
  },
  residentsList: {
    maxHeight: 300,
  },
  residentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e9ecef',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectedResidentCard: {
    borderColor: COLORS.primary,
    backgroundColor: '#f0f8ff',
  },
  residentCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  residentInfo: {
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  residentDetails: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  selectedIcon: {
    marginLeft: 8,
  },
  emptyResidents: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyResidentsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#495057',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyResidentsDesc: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center',
    lineHeight: 20,
  },
  disabledButton: {
    backgroundColor: '#6c757d',
    opacity: 0.6,
  },
});

export default ServicePackageScreen;