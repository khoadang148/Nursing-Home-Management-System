import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import bedAssignmentService from '../../api/services/bedAssignmentService';

// Constants
const COLORS = {
  primary: '#2196F3',
  secondary: '#64B5F6', 
  accent: '#FFC107',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#00BCD4',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  divider: '#E0E0E0',
};

const ServicePackageDetailScreen = ({ route, navigation }) => {
  const { packageData, packageType } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  const [packageInfo, setPackageInfo] = useState(packageData);
  const [bedAssignment, setBedAssignment] = useState(null);

  // Process package data for registered packages
  useEffect(() => {
    console.log('=== ServicePackageDetailScreen Debug ===');
    console.log('packageData:', packageData);
    console.log('packageType:', packageType);
    
    if (packageData && packageType === 'registered') {
      // Process care plan data for registered packages
      const mainCarePlan = packageData.care_plan_ids?.find(plan => plan.category === 'main');
      const supplementaryPlans = packageData.care_plan_ids?.filter(plan => plan.category === 'supplementary') || [];
      
      console.log('mainCarePlan:', mainCarePlan);
      console.log('supplementaryPlans:', supplementaryPlans);
      
      // Calculate total monthly cost
      const totalMonthlyCost = (mainCarePlan?.monthly_price || 0) + 
        supplementaryPlans.reduce((total, plan) => total + (plan.monthly_price || 0), 0);
      
      // If no main care plan, use the first supplementary plan as primary
      const primaryPlan = mainCarePlan || supplementaryPlans[0];
      const remainingSupplementaryPlans = mainCarePlan ? supplementaryPlans : supplementaryPlans.slice(1);
      
      const processedData = {
        ...packageData,
        // Extract main care plan (first main category plan, or first supplementary if no main)
        main_care_plan: primaryPlan,
        // Extract remaining supplementary plans
        supplementary_plans: remainingSupplementaryPlans,
        // Calculate total monthly cost
        total_monthly_cost: totalMonthlyCost,
        // Use resident info from populated data
        resident: packageData.resident_id ? {
          full_name: packageData.resident_id.full_name,
          date_of_birth: packageData.resident_id.date_of_birth,
          room_number: packageData.assigned_room_id?.room_number,
          bed_number: packageData.assigned_bed_id?.bed_number,
        } : null,
      };
      
      console.log('processedData:', processedData);
      setPackageInfo(processedData);
      
      // Load bed assignment data if resident exists
      if (packageData.resident_id?._id) {
        loadBedAssignment(packageData.resident_id._id);
      }
    } else {
      setPackageInfo(packageData);
    }
  }, [packageData, packageType]);

  // Load bed assignment data from API
  const loadBedAssignment = async (residentId) => {
    try {
      setLoading(true);
      const response = await bedAssignmentService.getBedAssignmentByResidentId(residentId);
      if (response.success && response.data && response.data.length > 0) {
        // Find active bed assignment (unassigned_date = null)
        const activeAssignment = response.data.find(assignment => !assignment.unassigned_date);
        if (activeAssignment) {
          setBedAssignment(activeAssignment);
        }
      }
    } catch (error) {
      console.error('Error loading bed assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return '0 VNĐ';
    const formattedAmount = new Intl.NumberFormat('vi-VN').format(amount * 10000);
    return `${formattedAmount} VNĐ`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Không xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  const getPackageIcon = (planType, category) => {
    if (category === 'main') {
      switch (planType) {
        case 'cham_soc_tieu_chuan': return 'heart-outline';
        case 'cham_soc_tich_cuc': return 'medical-outline';
        case 'cham_soc_dac_biet': return 'star-outline';
        case 'cham_soc_sa_sut_tri_tue': return 'fitness-outline';
        default: return 'heart-outline';
      }
    } else {
      switch (planType) {
        case 'ho_tro_dinh_duong': return 'restaurant-outline';
        case 'cham_soc_vet_thuong': return 'bandage';
        case 'vat_ly_tri_lieu': return 'fitness-outline';
        case 'cham_soc_tieu_duong': return 'pulse-outline';
        case 'phuc_hoi_chuc_nang': return 'accessibility-outline';
        case 'cham_soc_giam_nhe': return 'leaf-outline';
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

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Đang hoạt động';
      case 'paused': return 'Tạm dừng';
      case 'completed': return 'Hoàn thành';
      case 'cancelled': return 'Đã hủy';
      default: return 'Không xác định';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return COLORS.success;
      case 'paused': return COLORS.warning;
      case 'completed': return COLORS.info;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getPaymentStatusText = (paymentStatus) => {
    switch (paymentStatus) {
      case 'fully_paid': return '✅ Đã thanh toán đầy đủ';
      case 'deposit_paid': return '💰 Đã đặt cọc';
      case 'pending': return '⏳ Chưa thanh toán';
      case 'overdue': return '⚠️ Quá hạn thanh toán';
      default: return '❓ Không xác định';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'fully_paid': return COLORS.success;
      case 'deposit_paid': return COLORS.info;
      case 'pending': return COLORS.warning;
      case 'overdue': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  if (!packageInfo) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.errorText}>Không tìm thấy thông tin gói dịch vụ</Text>
        </View>
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
          <MaterialIcons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{packageType === 'room_type' ? 'Chi tiết loại phòng' : 'Chi tiết gói dịch vụ'}</Text>
        <View style={{ width: 40 }} />
      </View>
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Package or Room Overview */}
        <View style={styles.overviewCard}>
          <View style={[
            styles.iconContainer, 
            { backgroundColor: (packageType === 'room_type' ? '#607D8B' : getPackageColor(packageInfo?.plan_type || packageInfo?.main_care_plan?.plan_type, packageInfo?.category || 'main')) + '20' }
          ]}>
            <Ionicons 
              name={packageType === 'room_type' ? 'bed-outline' : getPackageIcon(packageInfo?.plan_type || packageInfo?.main_care_plan?.plan_type, packageInfo?.category || 'main')} 
              size={32} 
              color={packageType === 'room_type' ? '#607D8B' : getPackageColor(packageInfo?.plan_type || packageInfo?.main_care_plan?.plan_type, packageInfo?.category || 'main')} 
            />
          </View>
          
          <Text style={styles.packageName}>
            {packageType === 'room_type' ? (packageInfo?.type_name || packageInfo?.name || 'Loại phòng') : (packageInfo?.plan_name || packageInfo?.main_care_plan?.plan_name || 'Tên gói dịch vụ')}
          </Text>
          
          <Text style={styles.packagePrice}>
            {formatCurrency(packageInfo?.monthly_price || packageInfo?.main_care_plan?.monthly_price || 0)}/tháng
          </Text>
          
          <Text style={styles.packageDescription}>
            {packageType === 'room_type' ? (packageInfo?.description || 'Mô tả loại phòng') : (packageInfo?.description || packageInfo?.main_care_plan?.description || 'Mô tả gói dịch vụ')}
          </Text>

          {/* Status Badge */}
          {packageInfo?.status && (
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(packageInfo.status) }]}>
              <Text style={styles.statusText}>{getStatusText(packageInfo.status)}</Text>
            </View>
          )}

          {/* Category Badge for Available Packages */}
          {!packageInfo?.resident && packageType !== 'room_type' && (
            <View style={[styles.categoryBadge, { backgroundColor: packageInfo?.category === 'main' ? COLORS.primary : COLORS.textSecondary }]}>
              <Text style={styles.categoryBadgeText}>
                {packageInfo?.category === 'main' ? '🏆 Gói chăm sóc chính' : '➕ Gói dịch vụ bổ sung'}
              </Text>
            </View>
          )}
        </View>

        {/* Room amenities */}
        {packageType === 'room_type' && Array.isArray(packageInfo?.amenities) && packageInfo.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🛏️ Tiện ích phòng</Text>
            <View style={styles.servicesCard}>
              {packageInfo.amenities.map((amenity, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.serviceText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Resident Information (for registered packages) */}
        {packageInfo?.resident && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>👤 Thông tin người thân</Text>
            <View style={styles.residentCard}>
              <View style={styles.residentHeader}>
                <View style={styles.residentAvatar}>
                  <Ionicons name="person" size={24} color="#666" />
                </View>
                <View style={styles.residentInfo}>
                  <Text style={styles.residentName}>{packageInfo.resident.full_name || 'Không có tên'}</Text>
                  <Text style={styles.residentDetails}>
                    📍 Phòng {bedAssignment?.bed_id?.room_id?.room_number || packageInfo.resident?.room_number || '--'} • Giường {bedAssignment?.bed_id?.bed_number || packageInfo.resident?.bed_number || '--'}
                  </Text>
                  <Text style={styles.residentDetails}>
                    🎂 Ngày sinh: {formatDate(packageInfo.resident.date_of_birth)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Main Care Plan Details */}
        {packageInfo?.main_care_plan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {packageInfo.main_care_plan.category === 'main' ? '📦 Gói chăm sóc chính' : '📦 Gói dịch vụ chính'}
            </Text>
            <View style={styles.carePlanCard}>
              <View style={styles.carePlanHeader}>
                <Text style={styles.carePlanName}>{packageInfo.main_care_plan.plan_name}</Text>
                <Text style={styles.carePlanPrice}>
                  {formatCurrency(packageInfo.main_care_plan.monthly_price)}/tháng
                </Text>
              </View>
              
              <Text style={styles.carePlanDescription}>
                {packageInfo.main_care_plan.description}
              </Text>

              {/* Services Included */}
              {packageInfo.main_care_plan.services_included && packageInfo.main_care_plan.services_included.length > 0 && (
                <View style={styles.servicesSection}>
                  <Text style={styles.servicesTitle}>Dịch vụ bao gồm:</Text>
                  {packageInfo.main_care_plan.services_included.map((service, index) => (
                    <View key={index} style={styles.serviceItem}>
                      <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                      <Text style={styles.serviceText}>{service}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Staff Ratio */}
              {packageInfo.main_care_plan.staff_ratio && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>👥 Tỷ lệ nhân viên:</Text>
                  <Text style={styles.detailValue}>{packageInfo.main_care_plan.staff_ratio}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Services Included (for available packages) */}
        {!packageInfo?.resident && packageInfo?.services_included && packageInfo.services_included.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Dịch vụ bao gồm</Text>
            <View style={styles.servicesCard}>
              {packageInfo.services_included.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Services Included for registered packages */}
        {packageInfo?.resident && packageInfo?.main_care_plan?.services_included && packageInfo.main_care_plan.services_included.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Dịch vụ bao gồm</Text>
            <View style={styles.servicesCard}>
              {packageInfo.main_care_plan.services_included.map((service, index) => (
                <View key={index} style={styles.serviceItem}>
                  <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                  <Text style={styles.serviceText}>{service}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Services Included for registered packages without main care plan */}
        {packageInfo?.resident && !packageInfo?.main_care_plan?.services_included && packageInfo?.care_plan_ids && packageInfo.care_plan_ids.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Dịch vụ bao gồm</Text>
            <View style={styles.servicesCard}>
              {packageInfo.care_plan_ids.map((plan, planIndex) => (
                plan.services_included && plan.services_included.map((service, serviceIndex) => (
                  <View key={`${planIndex}-${serviceIndex}`} style={styles.serviceItem}>
                    <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                    <Text style={styles.serviceText}>{service}</Text>
                  </View>
                ))
              ))}
            </View>
          </View>
        )}

        {/* Supplementary Plans */}
        {packageInfo?.supplementary_plans && packageInfo.supplementary_plans.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>➕ Gói dịch vụ bổ sung ({packageInfo.supplementary_plans.length})</Text>
            {packageInfo.supplementary_plans.map((plan, index) => (
              <View key={index} style={styles.supplementaryCard}>
                <View style={styles.supplementaryHeader}>
                  <Text style={styles.supplementaryName}>{plan.plan_name}</Text>
                  <Text style={styles.supplementaryPrice}>
                    {formatCurrency(plan.monthly_price)}/tháng
                  </Text>
                </View>
                
                <Text style={styles.supplementaryDescription}>
                  {plan.description}
                </Text>

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

        {/* Additional Information for Available Packages */}
        {!packageInfo?.resident && (
          <>
            {/* Staff Ratio */}
            {(packageInfo?.staff_ratio || packageInfo?.category || packageInfo?.duration_type) && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ℹ️ Thông tin chi tiết</Text>
                <View style={styles.detailsCard}>
                  {packageInfo?.staff_ratio && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>👥 Tỷ lệ nhân viên:</Text>
                      <Text style={styles.detailValue}>{packageInfo.staff_ratio}</Text>
                    </View>
                  )}
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>📋 Loại gói:</Text>
                    <Text style={styles.detailValue}>
                      {packageInfo.category === 'main' ? 'Gói chăm sóc chính (bắt buộc)' : 'Gói dịch vụ bổ sung (tùy chọn)'}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>💳 Chu kỳ thanh toán:</Text>
                    <Text style={styles.detailValue}>Hàng tháng</Text>
                  </View>
                  {packageInfo?.duration_type && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>⏱️ Loại thời gian:</Text>
                      <Text style={styles.detailValue}>
                        {packageInfo.duration_type === 'monthly' ? 'Hàng tháng' : 
                         packageInfo.duration_type === 'weekly' ? 'Hàng tuần' :
                         packageInfo.duration_type === 'daily' ? 'Hàng ngày' : 'Một lần'}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* Prerequisites */}
            {packageInfo?.prerequisites && packageInfo.prerequisites.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>📋 Điều kiện áp dụng</Text>
                <View style={styles.prerequisitesCard}>
                  {packageInfo.prerequisites.map((prereq, index) => (
                    <View key={index} style={styles.prereqItem}>
                      <Ionicons name="information-circle" size={16} color={COLORS.primary} />
                      <Text style={styles.prereqText}>{prereq}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Contraindications */}
            {packageInfo?.contraindications && packageInfo.contraindications.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>⚠️ Chống chỉ định</Text>
                <View style={styles.contraindicationsCard}>
                  {packageInfo.contraindications.map((contraind, index) => (
                    <View key={index} style={styles.contraindicationItem}>
                      <Ionicons name="warning" size={16} color={COLORS.warning} />
                      <Text style={styles.contraindicationText}>{contraind}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Thông tin thanh toán</Text>
          <View style={styles.paymentCard}>
            <View style={styles.paymentRow}>
              <Text style={styles.paymentLabel}>Tổng chi phí hàng tháng:</Text>
              <Text style={styles.paymentValue}>
                {formatCurrency(packageInfo?.total_monthly_cost || packageInfo?.monthly_price || 0)}
              </Text>
            </View>
            
            {packageInfo?.payment_status && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Trạng thái thanh toán:</Text>
                <Text style={[styles.paymentValue, { color: getPaymentStatusColor(packageInfo.payment_status) }]}>
                  {getPaymentStatusText(packageInfo.payment_status)}
                </Text>
              </View>
            )}
            
            {(packageInfo?.start_date || packageInfo?.registration_date) && (
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Thời gian áp dụng:</Text>
                <Text style={styles.paymentValue}>
                  {formatDate(packageInfo.start_date || packageInfo.registration_date)} - {formatDate(packageInfo.end_date)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Additional Information */}
        {packageInfo?.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📝 Ghi chú</Text>
            <View style={styles.notesCard}>
              <Text style={styles.notesText}>{packageInfo.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  errorText: {
    fontSize: 16,
    color: COLORS.error,
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  overviewCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  packageName: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  packageDescription: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  residentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  residentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f0f0',
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
    color: COLORS.text,
    marginBottom: 4,
  },
  residentDetails: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  carePlanCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carePlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  carePlanPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  carePlanDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  servicesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  servicesSection: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  servicesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  detailsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  supplementaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  supplementaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  supplementaryName: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  supplementaryPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.success,
  },
  supplementaryDescription: {
    fontSize: 13,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  supplementaryServices: {
    backgroundColor: '#f1f3f4',
    padding: 8,
    borderRadius: 6,
  },
  supplementaryServiceText: {
    fontSize: 12,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  moreServicesText: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
    textAlign: 'center',
  },
  paymentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  paymentLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.text,
  },
  notesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  notesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  prerequisitesCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prereqItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  prereqText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  contraindicationsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contraindicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contraindicationText: {
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
});

export default ServicePackageDetailScreen; 