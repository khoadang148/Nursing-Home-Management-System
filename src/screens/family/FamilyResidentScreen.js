import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { Card, Title, Paragraph, Divider, ActivityIndicator, Chip } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import mock data
import { residents, medications, carePlans } from '../../api/mockData';

const FamilyResidentScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [activeMedications, setActiveMedications] = useState([]);
  const [carePlanData, setCarePlanData] = useState([]);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (user?.residentId) {
      // Get resident information
      const residentData = residents.find(r => r.id === user.residentId);
      setResident(residentData);
      
      // Get active medications for the resident
      const residentMedications = medications
        .filter(med => med.residentId === user.residentId && med.status === 'Active')
        .slice(0, 5); // Just get the first 5 for display
      setActiveMedications(residentMedications);
      
      // Get care plans
      const residentCarePlans = carePlans.filter(cp => cp.residentId === user.residentId);
      setCarePlanData(residentCarePlans);
    }
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const calculateAge = (dateOfBirth) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải thông tin cư dân...</Text>
      </SafeAreaView>
    );
  }
  
  if (!resident) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <FontAwesome5 name="exclamation-circle" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin cư dân</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Image 
            source={{ uri: resident.photo || 'https://randomuser.me/api/portraits/men/1.jpg' }}
            style={styles.photo}
          />
          <View style={styles.headerInfo}>
            <Text style={styles.name}>{`${resident.firstName} ${resident.lastName}`}</Text>
            <View style={styles.infoRow}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>Phòng {resident.roomNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="cake" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {formatDate(resident.dateOfBirth)} ({calculateAge(resident.dateOfBirth)} tuổi)
              </Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="event" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                Ngày tiếp nhận: {formatDate(resident.admissionDate)}
              </Text>
            </View>
            <View style={styles.statusChipContainer}>
              <Chip 
                icon={() => <MaterialIcons name="check-circle" size={16} color={COLORS.success} />} 
                style={[styles.statusChip, {backgroundColor: COLORS.success + '20'}]}
                textStyle={{color: COLORS.success}}
              >
                {resident.status === 'Active' ? 'Đang Ở' : resident.status}
              </Chip>
              <Chip 
                icon={() => <MaterialIcons name="local-hospital" size={16} color={COLORS.primary} />} 
                style={[styles.statusChip, {backgroundColor: COLORS.primary + '20'}]}
                textStyle={{color: COLORS.primary}}
              >
                Chăm sóc {resident.careLevel === 'Intensive' ? 'Tích cực' : 
                          resident.careLevel === 'Moderate' ? 'Vừa phải' : 
                          resident.careLevel === 'Standard' ? 'Tiêu chuẩn' : 
                          resident.careLevel}
              </Chip>
            </View>
          </View>
        </View>
        
        {/* Medical Information Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <FontAwesome5 name="heartbeat" size={20} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Thông Tin Y Tế</Title>
            </View>
            
            <Text style={styles.sectionTitle}>Tình Trạng Bệnh</Text>
            <View style={styles.tagsContainer}>
              {resident.medicalConditions?.map((condition, index) => (
                <Chip 
                  key={index} 
                  style={styles.tag}
                  textStyle={styles.tagText}
                >
                  {condition}
                </Chip>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Dị Ứng</Text>
            <View style={styles.tagsContainer}>
              {resident.allergies?.map((allergy, index) => (
                <Chip 
                  key={index} 
                  icon={() => <MaterialIcons name="warning" size={16} color={COLORS.error} />}
                  style={[styles.tag, {backgroundColor: COLORS.error + '20'}]}
                  textStyle={{color: COLORS.error}}
                >
                  {allergy}
                </Chip>
              ))}
            </View>
            
            <Text style={styles.sectionTitle}>Hạn Chế Ăn Uống</Text>
            <Text style={styles.detailText}>{resident.dietaryRestrictions || 'Không có hạn chế'}</Text>
            
            <Text style={styles.sectionTitle}>Bác Sĩ Chính</Text>
            <Text style={styles.detailText}>{resident.doctor || 'Chưa được chỉ định'}</Text>
          </Card.Content>
        </Card>
        
        {/* Medications Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Thuốc Hiện Tại</Title>
            </View>
            
            {activeMedications.length > 0 ? (
              activeMedications.map((med) => (
                <View key={med.id} style={styles.medicationItem}>
                  <View style={styles.medicationHeader}>
                    <Text style={styles.medicationName}>{med.name}</Text>
                    <Text style={styles.medicationDosage}>{med.dosage}</Text>
                  </View>
                  <View style={styles.medicationDetails}>
                    <View style={styles.medDetailItem}>
                      <MaterialIcons name="schedule" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.medDetailText}>{med.frequency}</Text>
                    </View>
                    <View style={styles.medDetailItem}>
                      <MaterialIcons name="arrow-forward" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.medDetailText}>{med.route}</Text>
                    </View>
                  </View>
                  {med.notes && (
                    <Text style={styles.medicationNotes}>Ghi chú: {med.notes}</Text>
                  )}
                  <Divider style={styles.divider} />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có thuốc đang sử dụng</Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Care Plan Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <MaterialIcons name="assignment" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Kế Hoạch Chăm Sóc</Title>
            </View>
            
            {carePlanData.length > 0 ? (
              carePlanData.map((plan) => (
                <View key={plan.id} style={styles.carePlanItem}>
                  <View style={styles.carePlanHeader}>
                    <Text style={styles.carePlanTitle}>{plan.title}</Text>
                    <Chip 
                      style={[
                        styles.statusChip, 
                        {backgroundColor: plan.status === 'Active' ? COLORS.success + '20' : COLORS.warning + '20'}
                      ]}
                      textStyle={{
                        color: plan.status === 'Active' ? COLORS.success : COLORS.warning
                      }}
                    >
                      {plan.status === 'Active' ? 'Đang áp dụng' : 
                       plan.status === 'Pending' ? 'Đang chờ' : 
                       plan.status === 'Completed' ? 'Đã hoàn thành' : plan.status}
                    </Chip>
                  </View>
                  
                  <Text style={styles.carePlanDescription}>{plan.description}</Text>
                  
                  <Text style={styles.carePlanSubtitle}>Mục tiêu:</Text>
                  {plan.goals.map((goal, index) => (
                    <View key={index} style={styles.goalItem}>
                      <MaterialIcons name="check" size={16} color={COLORS.success} />
                      <Text style={styles.goalText}>{goal}</Text>
                    </View>
                  ))}
                  
                  <View style={styles.carePlanDates}>
                    <Text style={styles.carePlanDateText}>
                      Bắt đầu: {formatDate(plan.startDate)}
                    </Text>
                    <Text style={styles.carePlanDateText}>
                      Đánh giá: {formatDate(plan.reviewDate)}
                    </Text>
                  </View>
                  
                  <Divider style={styles.divider} />
                </View>
              ))
            ) : (
              <Text style={styles.noDataText}>Không có kế hoạch chăm sóc</Text>
            )}
          </Card.Content>
        </Card>
        
        {/* Emergency Contact Card */}
        <Card style={styles.card} mode="elevated">
          <Card.Content>
            <View style={styles.cardHeader}>
              <Ionicons name="call" size={24} color={COLORS.primary} />
              <Title style={styles.cardTitle}>Liên Hệ Khẩn Cấp</Title>
            </View>
            
            {resident.contactInfo?.emergency ? (
              <View style={styles.contactContainer}>
                <Text style={styles.contactName}>{resident.contactInfo.emergency.name}</Text>
                <Text style={styles.contactRelationship}>{resident.contactInfo.emergency.relationship}</Text>
                
                <View style={styles.contactItem}>
                  <Ionicons name="call-outline" size={16} color={COLORS.primary} />
                  <Text style={styles.contactDetail}>{resident.contactInfo.emergency.phone}</Text>
                </View>
                
                <View style={styles.contactItem}>
                  <MaterialIcons name="email" size={16} color={COLORS.primary} />
                  <Text style={styles.contactDetail}>{resident.contactInfo.emergency.email}</Text>
                </View>
              </View>
            ) : (
              <Text style={styles.noDataText}>Không có thông tin liên hệ khẩn cấp</Text>
            )}
          </Card.Content>
        </Card>
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
  loadingText: {
    marginTop: 10,
    color: COLORS.text,
    fontSize: 16,
  },
  errorText: {
    marginTop: 16,
    color: COLORS.error,
    fontSize: 18,
    fontWeight: '500',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Tăng padding cho thanh tab bar cao hơn
  },
  header: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 16,
    backgroundColor: COLORS.border,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  name: {
    ...FONTS.h2,
    marginBottom: 8,
    color: COLORS.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
  },
  statusChipContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statusChip: {
    marginRight: 8,
  },
  card: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    ...FONTS.h3,
    marginLeft: 8,
  },
  sectionTitle: {
    ...FONTS.h5,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 16,
  },
  detailText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  medicationItem: {
    marginBottom: 12,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  medicationName: {
    ...FONTS.body2,
    fontWeight: '500',
    color: COLORS.text,
  },
  medicationDosage: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: '500',
  },
  medicationDetails: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  medDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  medDetailText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  medicationNotes: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 4,
  },
  divider: {
    marginTop: 12,
    marginBottom: 12,
  },
  noDataText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 16,
  },
  carePlanItem: {
    marginBottom: 12,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carePlanTitle: {
    ...FONTS.body2,
    fontWeight: '500',
    flex: 1,
  },
  carePlanDescription: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 12,
  },
  carePlanSubtitle: {
    ...FONTS.body3,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
    paddingLeft: 4,
  },
  goalText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
  },
  carePlanDates: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  carePlanDateText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  contactContainer: {
    padding: 8,
  },
  contactName: {
    ...FONTS.h4,
    marginBottom: 4,
  },
  contactRelationship: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactDetail: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
  },
});

export default FamilyResidentScreen; 