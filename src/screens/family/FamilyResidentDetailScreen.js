import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
  Button,
} from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const { width } = Dimensions.get('window');

// Enhanced mock data cho 3 residents dựa theo cấu trúc DB
const mockResidentData = {
  'res_001': {
    _id: 'res_001',
    full_name: 'Nguyễn Văn Nam',
    date_of_birth: new Date('1945-03-15'),
    gender: 'male',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    admission_date: new Date('2024-01-10'),
    family_member_id: 'f1',
    medical_history: 'Tiểu đường type 2, huyết áp cao',
    allergies: ['Penicillin', 'Sulfa drugs'],
    emergency_contact: {
      name: 'Trần Lê Chi Bảo',
      phone: '0764634650',
      relationship: 'con trai'
    },
    care_level: 'intermediate',
    status: 'active',
    room: { room_number: '101', bed_number: '101-A' },
    care_plan: {
      plan_name: 'Gói Chăm Sóc Tích Cực',
      total_monthly_cost: 15000000,
      status: 'active'
    }
  },
  'res_002': {
    _id: 'res_002', 
    full_name: 'Lê Thị Hoa',
    date_of_birth: new Date('1940-07-22'),
    gender: 'female',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    admission_date: new Date('2024-02-15'),
    family_member_id: 'f1',
    medical_history: 'Sa sút trí tuệ, loét chân',
    allergies: ['Latex'],
    emergency_contact: {
      name: 'Trần Lê Chi Bảo',
      phone: '0764634650',
      relationship: 'con trai'
    },
    care_level: 'intensive',
    status: 'active',
    room: { room_number: '102', bed_number: '102-A' },
    care_plan: {
      plan_name: 'Gói Chăm Sóc Sa Sút Trí Tuệ',
      total_monthly_cost: 18000000,
      status: 'active'
    }
  },
  'res_003': {
    _id: 'res_003',
    full_name: 'Trần Văn Bình', 
    date_of_birth: new Date('1948-11-08'),
    gender: 'male',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    admission_date: new Date('2024-03-05'),
    family_member_id: 'f1',
    medical_history: 'Viêm khớp, đau lưng',
    allergies: ['Aspirin'],
    emergency_contact: {
      name: 'Trần Lê Chi Bảo',
      phone: '0764634650',
      relationship: 'con trai'
    },
    care_level: 'basic',
    status: 'active',
    room: { room_number: '201', bed_number: '201-A' },
    care_plan: {
      plan_name: 'Gói Chăm Sóc Tiêu Chuẩn',
      total_monthly_cost: 12000000,
      status: 'active'
    }
  }
};

// Import staff data from centralized mockData
import { staff } from '../../api/mockData';

// Create staff lookup object for easy access
const mockStaffData = staff.reduce((acc, staffMember) => {
  acc[staffMember._id] = staffMember;
  return acc;
}, {});

// Mock vital signs data theo cấu trúc DB vital_signs collection (sử dụng ID từ database schema)
const mockVitalSigns = {
  'res_001': [
    {
      _id: 'vital_001',
      resident_id: 'res_001',
      recorded_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng',
      date_time: new Date('2024-03-01T08:00:00Z'),
      temperature: 36.5,
      heart_rate: 75,
      blood_pressure: '130/80',
      respiratory_rate: 18,
      oxygen_level: 98.5,
      weight: 65.5,
      notes: 'Các chỉ số bình thường, tiểu đường được kiểm soát tốt'
    },
    {
      _id: 'vital_002',
      resident_id: 'res_001',
      recorded_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng',
      date_time: new Date('2024-02-29T08:00:00Z'),
      temperature: 36.7,
      heart_rate: 72,
      blood_pressure: '125/82',
      respiratory_rate: 16,
      oxygen_level: 99.0,
      weight: 65.2,
      notes: 'Huyết áp ổn định, đường huyết trong ngưỡng cho phép'
    },
    {
      _id: 'vital_003',
      resident_id: 'res_001',
      recorded_by: 'staff_003',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc',
      date_time: new Date('2024-02-28T08:00:00Z'),
      temperature: 36.4,
      heart_rate: 78,
      blood_pressure: '128/79',
      respiratory_rate: 17,
      oxygen_level: 98.8,
      weight: 65.0,
      notes: 'Tình trạng ổn định'
    }
  ],
  'res_002': [
    {
      _id: 'vital_004',
      resident_id: 'res_002',
      recorded_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng',
      date_time: new Date('2024-03-01T08:30:00Z'),
      temperature: 36.8,
      heart_rate: 82,
      blood_pressure: '140/85',
      respiratory_rate: 20,
      oxygen_level: 97.8,
      weight: 58.2,
      notes: 'Huyết áp hơi cao, cần theo dõi. Sa sút trí tuệ ổn định.'
    },
    {
      _id: 'vital_005',
      resident_id: 'res_002',
      recorded_by: 'staff_003',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc',
      date_time: new Date('2024-02-29T08:30:00Z'),
      temperature: 37.0,
      heart_rate: 85,
      blood_pressure: '145/88',
      respiratory_rate: 22,
      oxygen_level: 97.5,
      weight: 58.0,
      notes: 'Huyết áp cao, đã thông báo bác sĩ'
    }
  ],
  'res_003': [
    {
      _id: 'vital_006',
      resident_id: 'res_003',
      recorded_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng',
      date_time: new Date('2024-03-01T09:00:00Z'),
      temperature: 36.6,
      heart_rate: 70,
      blood_pressure: '120/75',
      respiratory_rate: 16,
      oxygen_level: 99.2,
      weight: 72.3,
      notes: 'Các chỉ số bình thường, viêm khớp không ảnh hưởng đến chỉ số sinh hiệu'
    }
  ]
};

// Mock assessments data theo cấu trúc DB assessments collection (sử dụng ID từ database schema)
const mockAssessments = {
  'res_001': [
    {
      _id: 'assessment_001',
      assessment_type: 'Đánh giá tình trạng sức khỏe tổng quát',
      date: new Date('2024-02-28'),
      notes: 'Tình trạng ổn định, cần theo dõi đường huyết thường xuyên. Bệnh nhân tuân thủ tốt chế độ điều trị.',
      recommendations: 'Duy trì chế độ ăn kiêng, tập thể dục nhẹ 30 phút/ngày, uống thuốc đúng giờ',
      resident_id: 'res_001',
      conducted_by: 'staff_002',
      staff_name: 'Phạm Thị Doctor',
      staff_position: 'Bác sĩ'
    },
    {
      _id: 'assessment_002',
      assessment_type: 'Đánh giá dinh dưỡng',
      date: new Date('2024-02-25'),
      notes: 'Chế độ ăn phù hợp với bệnh tiểu đường. Cân nặng ổn định.',
      recommendations: 'Tiếp tục chế độ ăn ít đường, nhiều rau xanh',
      resident_id: 'res_001',
      conducted_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    }
  ],
  'res_002': [
    {
      _id: 'assessment_003',
      assessment_type: 'Đánh giá tình trạng sa sút trí tuệ',
      date: new Date('2024-02-26'),
      notes: 'Sa sút trí tuệ giai đoạn vừa, có dấu hiệu cải thiện nhờ hoạt động kích thích trí nhớ.',
      recommendations: 'Tăng cường hoạt động kích thích nhận thức, liệu pháp âm nhạc',
      resident_id: 'res_002',
      conducted_by: 'staff_002',
      staff_name: 'Phạm Thị Doctor',
      staff_position: 'Bác sĩ'
    },
    {
      _id: 'assessment_004',
      assessment_type: 'Đánh giá vết thương',
      date: new Date('2024-02-28'),
      notes: 'Vết loét chân đang lành dần, không có dấu hiệu nhiễm trùng.',
      recommendations: 'Tiếp tục thay băng hàng ngày, giữ vệ sinh',
      resident_id: 'res_002',
      conducted_by: 'staff_001',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    }
  ],
  'res_003': [
    {
      _id: 'assessment_005',
      assessment_type: 'Đánh giá vật lý trị liệu',
      date: new Date('2024-03-01'),
      notes: 'Khả năng vận động cải thiện so với lúc mới nhập viện. Đau khớp giảm nhờ điều trị.',
      recommendations: 'Tiếp tục vật lý trị liệu, tăng cường bài tập co duỗi khớp',
      resident_id: 'res_003',
      conducted_by: 'staff_003',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ]
};

// Mock activities data theo cấu trúc DB activity_participations
const mockActivities = {
  'res_001': [
    {
      _id: 'activity_001',
      activity_name: 'Tập thể dục buổi sáng',
      description: 'Các bài tập nhẹ nhàng phù hợp với người cao tuổi',
      date: new Date('2024-03-01'),
      time: '07:00',
      location: 'Sân vườn',
      performance_notes: 'Tham gia tích cực, tinh thần tốt. Hoàn thành đầy đủ các bài tập.',
      attendance_status: 'attended',
      staff_id: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    },
    {
      _id: 'activity_002',
      activity_name: 'Đọc báo buổi chiều',
      description: 'Hoạt động đọc báo và thảo luận',
      date: new Date('2024-02-29'),
      time: '15:00',
      location: 'Phòng đọc',
      performance_notes: 'Rất quan tâm đến tin tức thời sự, tham gia thảo luận sôi nổi',
      attendance_status: 'attended',
      staff_id: 'nurse1',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    }
  ],
  'res_002': [
    {
      _id: 'activity_003',
      activity_name: 'Liệu pháp âm nhạc',
      description: 'Nghe nhạc và hát những bài hát quen thuộc',
      date: new Date('2024-03-01'),
      time: '14:00',
      location: 'Phòng giải trí',
      performance_notes: 'Phản ứng tích cực với âm nhạc, giúp cải thiện tâm trạng',
      attendance_status: 'attended',
      staff_id: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    },
    {
      _id: 'activity_004',
      activity_name: 'Chăm sóc vườn hoa',
      description: 'Hoạt động chăm sóc và tưới cây',
      date: new Date('2024-02-28'),
      time: '09:00',
      location: 'Vườn hoa',
      performance_notes: 'Rất thích hoạt động này, giúp thư giãn và kích thích trí nhớ',
      attendance_status: 'attended',
      staff_id: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ],
  'res_003': [
    {
      _id: 'activity_005',
      activity_name: 'Vật lý trị liệu',
      description: 'Bài tập phục hồi chức năng cho khớp',
      date: new Date('2024-03-01'),
      time: '10:00',
      location: 'Phòng vật lý trị liệu',
      performance_notes: 'Thực hiện tốt các bài tập, khả năng vận động cải thiện',
      attendance_status: 'attended',
      staff_id: 'nurse1',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    },
    {
      _id: 'activity_006',
      activity_name: 'Hát karaoke',
      description: 'Hoạt động giải trí ca hát',
      date: new Date('2024-02-29'),
      time: '16:00',
      location: 'Phòng giải trí',
      performance_notes: 'Tham gia vui vẻ, hát những bài hát cũ rất hay',
      attendance_status: 'attended',
      staff_id: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ]
};

// Mock medication administrations theo cấu trúc DB medication_administrations
const mockMedicationAdministrations = {
  'res_001': [
    {
      _id: 'med_admin_001',
      medication_name: 'Metformin',
      dosage: '500mg',
      frequency: '2 lần/ngày',
      scheduled_time: new Date('2024-03-01T08:00:00Z'),
      actual_time: new Date('2024-03-01T08:05:00Z'),
      dosage_given: '500mg',
      status: 'administered',
      notes: 'Uống sau ăn sáng, không có tác dụng phụ',
      side_effects: null,
      administered_by: 'nurse1',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    },
    {
      _id: 'med_admin_002',
      medication_name: 'Amlodipine',
      dosage: '5mg',
      frequency: '1 lần/ngày',
      scheduled_time: new Date('2024-03-01T20:00:00Z'),
      actual_time: new Date('2024-03-01T20:10:00Z'),
      dosage_given: '5mg',
      status: 'administered',
      notes: 'Uống trước khi ngủ',
      side_effects: null,
      administered_by: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ],
  'res_002': [
    {
      _id: 'med_admin_003',
      medication_name: 'Donepezil',
      dosage: '5mg',
      frequency: '1 lần/ngày',
      scheduled_time: new Date('2024-03-01T19:00:00Z'),
      actual_time: new Date('2024-03-01T19:15:00Z'),
      dosage_given: '5mg',
      status: 'administered',
      notes: 'Thuốc điều trị sa sút trí tuệ, uống sau bữa tối',
      side_effects: null,
      administered_by: 'nurse1',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    },
    {
      _id: 'med_admin_004',
      medication_name: 'Vitamin D3',
      dosage: '1000 IU',
      frequency: '1 lần/ngày',
      scheduled_time: new Date('2024-03-01T12:00:00Z'),
      actual_time: null,
      dosage_given: '1000 IU',
      status: 'missed',
      notes: 'Bệnh nhân từ chối uống do quên',
      side_effects: null,
      administered_by: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ],
  'res_003': [
    {
      _id: 'med_admin_005',
      medication_name: 'Ibuprofen',
      dosage: '400mg',
      frequency: '3 lần/ngày',
      scheduled_time: new Date('2024-03-01T12:00:00Z'),
      actual_time: new Date('2024-03-01T12:05:00Z'),
      dosage_given: '400mg',
      status: 'administered',
      notes: 'Thuốc giảm đau viêm khớp, uống sau ăn',
      side_effects: null,
      administered_by: 'nurse1',
      staff_name: 'Lê Văn Nurse',
      staff_position: 'Điều dưỡng'
    },
    {
      _id: 'med_admin_006',
      medication_name: 'Glucosamine',
      dosage: '500mg',
      frequency: '2 lần/ngày',
      scheduled_time: new Date('2024-03-01T08:00:00Z'),
      actual_time: new Date('2024-03-01T08:15:00Z'),
      dosage_given: '500mg',
      status: 'administered',
      notes: 'Bổ sung cho xương khớp',
      side_effects: null,
      administered_by: 'caregiver1',
      staff_name: 'Hoàng Văn Caregiver',
      staff_position: 'Nhân viên chăm sóc'
    }
  ]
};

const FamilyResidentDetailScreen = ({ route, navigation }) => {
  const { residentId, initialTab } = route.params;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab || 'overview'); // overview, vitals, assessments, activities, medications

  const [residentData, setResidentData] = useState(null);
  const [vitalSigns, setVitalSigns] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [activities, setActivities] = useState([]);
  const [medicationAdministrations, setMedicationAdministrations] = useState([]);

  useEffect(() => {
    loadResidentData();
  }, [residentId]);

  useEffect(() => {
    // Set active tab based on initialTab parameter
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadResidentData = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Load resident basic info
    const resident = mockResidentData[residentId];
    if (resident) {
      setResidentData(resident);
      
      // Load related data for this specific resident
      setVitalSigns(mockVitalSigns[residentId] || []);
      setAssessments(mockAssessments[residentId] || []);
      setActivities(mockActivities[residentId] || []);
      setMedicationAdministrations(mockMedicationAdministrations[residentId] || []);
    }
    
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadResidentData();
    setRefreshing(false);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const renderTabBar = () => {
    const tabs = [
      { key: 'overview', title: 'Tổng quan', icon: 'account' },
      { key: 'vitals', title: 'Chỉ số', icon: 'heart-pulse' },
      { key: 'assessments', title: 'Đánh giá', icon: 'clipboard-text' },
      { key: 'activities', title: 'Hoạt động', icon: 'run' },
      { key: 'medications', title: 'Thuốc', icon: 'pill' }
    ];

    return (
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tab,
                activeTab === tab.key && styles.activeTab
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={20}
                color={activeTab === tab.key ? COLORS.primary : COLORS.textSecondary}
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.key && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderOverview = () => (
    <View>
      {/* Basic Info */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="person" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Thông tin cơ bản</Title>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Họ và tên:</Text>
            <Text style={styles.infoValue}>{residentData.full_name}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày sinh:</Text>
            <Text style={styles.infoValue}>
              {formatDate(residentData.date_of_birth)} ({calculateAge(residentData.date_of_birth)} tuổi)
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Giới tính:</Text>
            <Text style={styles.infoValue}>
              {residentData.gender === 'male' ? 'Nam' : 'Nữ'}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Ngày nhập viện:</Text>
            <Text style={styles.infoValue}>{formatDate(residentData.admission_date)}</Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phòng - Giường:</Text>
            <Text style={styles.infoValue}>
              {residentData.room.room_number} - {residentData.room.bed_number}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mức độ chăm sóc:</Text>
            <Chip style={styles.careChip}>
              {residentData.care_level === 'intensive' ? 'Tích cực' : 
               residentData.care_level === 'intermediate' ? 'Trung bình' : 'Cơ bản'}
            </Chip>
          </View>
        </Card.Content>
      </Card>

      {/* Medical History */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="local-hospital" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Tiền sử bệnh</Title>
          </View>
          <Text style={styles.medicalText}>{residentData.medical_history}</Text>
          
          <Text style={styles.sectionSubtitle}>Dị ứng:</Text>
          <View style={styles.allergiesContainer}>
            {residentData.allergies.map((allergy, index) => (
              <Chip
                key={index}
                icon={() => <MaterialIcons name="warning" size={16} color={COLORS.error} />}
                style={[styles.allergyChip, { backgroundColor: COLORS.error + '20' }]}
                textStyle={{ color: COLORS.error }}
              >
                {allergy}
              </Chip>
            ))}
          </View>
        </Card.Content>
      </Card>

      {/* Emergency Contact */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="contact-emergency" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Liên hệ khẩn cấp</Title>
          </View>
          
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{residentData.emergency_contact.name}</Text>
            <Text style={styles.contactRelation}>({residentData.emergency_contact.relationship})</Text>
            <TouchableOpacity
              style={styles.phoneButton}
              onPress={() => Alert.alert('Gọi điện', 'Bạn có muốn gọi ' + residentData.emergency_contact.phone + '?')}
            >
              <MaterialIcons name="phone" size={20} color={COLORS.primary} />
              <Text style={styles.phoneText}>{residentData.emergency_contact.phone}</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>

      {/* Care Plan */}
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <MaterialIcons name="assignment" size={24} color={COLORS.primary} />
            <Title style={styles.cardTitle}>Gói chăm sóc</Title>
          </View>
          
          <Text style={styles.carePlanName}>{residentData.care_plan.plan_name}</Text>
          <Text style={styles.carePlanCost}>
            Chi phí: {formatCurrency(residentData.care_plan.total_monthly_cost)}/tháng
          </Text>
          <Chip
            style={[styles.statusChip, { backgroundColor: COLORS.success + '20' }]}
            textStyle={{ color: COLORS.success }}
          >
            {residentData.care_plan.status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
          </Chip>
        </Card.Content>
      </Card>
    </View>
  );

  const renderVitalSigns = () => (
    <View>
      {vitalSigns.length > 0 ? (
        vitalSigns.map((vital, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.vitalHeader}>
                <Text style={styles.vitalDate}>{formatDateTime(vital.date_time)}</Text>
                <Text style={styles.staffInfo}>
                  Ghi nhận bởi: {vital.staff_name} ({vital.staff_position})
                </Text>
              </View>
              
              <View style={styles.vitalGrid}>
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="thermometer" size={20} color={COLORS.error} />
                  <Text style={styles.vitalLabel}>Nhiệt độ</Text>
                  <Text style={styles.vitalValue}>{vital.temperature}°C</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="heart-pulse" size={20} color={COLORS.primary} />
                  <Text style={styles.vitalLabel}>Nhịp tim</Text>
                  <Text style={styles.vitalValue}>{vital.heart_rate} bpm</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="blood-bag" size={20} color={COLORS.accent} />
                  <Text style={styles.vitalLabel}>Huyết áp</Text>
                  <Text style={styles.vitalValue}>{vital.blood_pressure}</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="lungs" size={20} color={COLORS.secondary} />
                  <Text style={styles.vitalLabel}>Nhịp thở</Text>
                  <Text style={styles.vitalValue}>{vital.respiratory_rate}/phút</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="water-percent" size={20} color={COLORS.info} />
                  <Text style={styles.vitalLabel}>SpO2</Text>
                  <Text style={styles.vitalValue}>{vital.oxygen_level}%</Text>
                </View>
                
                <View style={styles.vitalItem}>
                  <MaterialCommunityIcons name="scale-bathroom" size={20} color={COLORS.warning} />
                  <Text style={styles.vitalLabel}>Cân nặng</Text>
                  <Text style={styles.vitalValue}>{vital.weight} kg</Text>
                </View>
              </View>
              
              {vital.notes && (
                <View style={styles.vitalNotes}>
                  <Text style={styles.vitalNotesText}>{vital.notes}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu chỉ số sinh hiệu</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderAssessments = () => (
    <View>
      {assessments.length > 0 ? (
        assessments.map((assessment, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.assessmentHeader}>
                <Text style={styles.assessmentType}>{assessment.assessment_type}</Text>
                <Text style={styles.assessmentDate}>{formatDate(assessment.date)}</Text>
              </View>
              
              <Text style={styles.assessmentConductor}>
                Thực hiện bởi: {assessment.staff_name} ({assessment.staff_position})
              </Text>
              
              <Text style={styles.sectionSubtitle}>Ghi chú:</Text>
              <Text style={styles.assessmentText}>{assessment.notes}</Text>
              
              <Text style={styles.sectionSubtitle}>Khuyến nghị:</Text>
              <Text style={styles.assessmentText}>{assessment.recommendations}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu đánh giá</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderActivities = () => (
    <View>
      {activities.length > 0 ? (
        activities.map((activity, index) => (
          <Card key={index} style={styles.card}>
            <Card.Content>
              <View style={styles.activityHeader}>
                <Text style={styles.activityName}>{activity.activity_name}</Text>
                <Chip
                  style={[
                    styles.attendanceChip,
                    { backgroundColor: activity.attendance_status === 'attended' ? COLORS.success + '20' : COLORS.warning + '20' }
                  ]}
                  textStyle={{
                    color: activity.attendance_status === 'attended' ? COLORS.success : COLORS.warning
                  }}
                >
                  {activity.attendance_status === 'attended' ? 'Đã tham gia' : 
                   activity.attendance_status === 'excused' ? 'Xin nghỉ' : 'Vắng mặt'}
                </Chip>
              </View>
              
              <Text style={styles.activityDate}>{formatDate(activity.date)} - {activity.time}</Text>
              <Text style={styles.staffInfo}>
                Hướng dẫn bởi: {activity.staff_name} ({activity.staff_position})
              </Text>
              <Text style={styles.activityLocation}>Địa điểm: {activity.location}</Text>
              <Text style={styles.activityNotes}>{activity.performance_notes}</Text>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có dữ liệu hoạt động</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  const renderMedications = () => (
    <View>
      <Text style={styles.sectionSubtitle}>Thuốc hiện tại:</Text>
      {/* Current medications from resident data */}
      {getCurrentMedications().length > 0 ? (
        getCurrentMedications().map((med, index) => (
          <Card key={`current-${index}`} style={styles.card}>
            <Card.Content>
              <View style={styles.medicationHeader}>
                <MaterialCommunityIcons name="pill" size={24} color={COLORS.primary} />
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{med.medication_name}</Text>
                  <Text style={styles.medicationDosage}>{med.dosage}</Text>
                </View>
              </View>
              
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationFrequency}>Tần suất: {med.frequency}</Text>
                <Text style={styles.medicationFrequency}>Chỉ định: {med.indication || 'Chưa ghi rõ'}</Text>
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có thuốc đang dùng</Text>
          </Card.Content>
        </Card>
      )}
      
      <Text style={[styles.sectionSubtitle, { marginTop: 20 }]}>Lịch sử dùng thuốc:</Text>
      {medicationAdministrations.length > 0 ? (
        medicationAdministrations.map((medAdmin, index) => (
          <Card key={`admin-${index}`} style={styles.card}>
            <Card.Content>
              <View style={styles.medicationHeader}>
                <MaterialCommunityIcons 
                  name={medAdmin.status === 'administered' ? 'check-circle' : 
                        medAdmin.status === 'missed' ? 'close-circle' : 'clock'} 
                  size={24} 
                  color={medAdmin.status === 'administered' ? COLORS.success : 
                         medAdmin.status === 'missed' ? COLORS.error : COLORS.warning} 
                />
                <View style={styles.medicationInfo}>
                  <Text style={styles.medicationName}>{medAdmin.medication_name}</Text>
                  <Text style={styles.medicationDosage}>{medAdmin.dosage_given}</Text>
                </View>
                <Chip
                  style={[
                    styles.statusChip,
                    { backgroundColor: medAdmin.status === 'administered' ? COLORS.success + '20' : 
                                      medAdmin.status === 'missed' ? COLORS.error + '20' : COLORS.warning + '20' }
                  ]}
                  textStyle={{
                    color: medAdmin.status === 'administered' ? COLORS.success : 
                           medAdmin.status === 'missed' ? COLORS.error : COLORS.warning
                  }}
                >
                  {medAdmin.status === 'administered' ? 'Đã dùng' : 
                   medAdmin.status === 'missed' ? 'Bỏ lỡ' : 
                   medAdmin.status === 'refused' ? 'Từ chối' : 'Trì hoãn'}
                </Chip>
              </View>
              
              <Text style={styles.staffInfo}>
                Cấp thuốc bởi: {medAdmin.staff_name} ({medAdmin.staff_position})
              </Text>
              
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationTime}>
                  Dự kiến: {formatDateTime(medAdmin.scheduled_time)}
                </Text>
                {medAdmin.actual_time && (
                  <Text style={styles.medicationTime}>
                    Thực tế: {formatDateTime(medAdmin.actual_time)}
                  </Text>
                )}
                {medAdmin.notes && (
                  <Text style={styles.medicationNotes}>{medAdmin.notes}</Text>
                )}
              </View>
            </Card.Content>
          </Card>
        ))
      ) : (
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.noDataText}>Chưa có lịch sử dùng thuốc</Text>
          </Card.Content>
        </Card>
      )}
    </View>
  );

  // Function to get current medications for selected resident
  const getCurrentMedications = () => {
    switch (residentId) {
      case 'res_001':
        return [
          { medication_name: 'Metformin', dosage: '500mg', frequency: '2 lần/ngày', indication: 'Điều trị tiểu đường type 2' },
          { medication_name: 'Amlodipine', dosage: '5mg', frequency: '1 lần/ngày', indication: 'Điều trị huyết áp cao' }
        ];
      case 'res_002':
        return [
          { medication_name: 'Donepezil', dosage: '5mg', frequency: '1 lần/ngày', indication: 'Điều trị sa sút trí tuệ' },
          { medication_name: 'Calcium + Vitamin D3', dosage: '500mg + 400 IU', frequency: '1 lần/ngày', indication: 'Bổ sung canxi' }
        ];
      case 'res_003':
        return [
          { medication_name: 'Ibuprofen', dosage: '400mg', frequency: '3 lần/ngày', indication: 'Giảm đau viêm khớp' },
          { medication_name: 'Glucosamine', dosage: '500mg', frequency: '2 lần/ngày', indication: 'Bổ sung cho xương khớp' }
        ];
      default:
        return [];
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'vitals':
        return renderVitalSigns();
      case 'assessments':
        return renderAssessments();
      case 'activities':
        return renderActivities();
      case 'medications':
        return renderMedications();
      default:
        return renderOverview();
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin cư dân...</Text>
      </SafeAreaView>
    );
  }

  if (!residentData) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <MaterialIcons name="error" size={50} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy thông tin cư dân</Text>
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
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        
        <View style={styles.headerInfo}>
          <Image
            source={{ uri: residentData.avatar }}
            style={styles.avatar}
          />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{residentData.full_name}</Text>
            <Text style={styles.headerSubtext}>
              Phòng {residentData.room.room_number} • {calculateAge(residentData.date_of_birth)} tuổi
            </Text>
          </View>
        </View>
      </View>

      {/* Tab Bar */}
      {renderTabBar()}

      {/* Content */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    marginTop: 16,
    fontSize: 18,
    color: COLORS.error,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  headerSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  tabBar: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  careChip: {
    backgroundColor: COLORS.primary + '20',
  },
  medicalText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    marginBottom: 8,
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  allergyChip: {
    marginRight: 8,
    marginBottom: 4,
  },
  contactInfo: {
    alignItems: 'center',
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRelation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  phoneText: {
    marginLeft: 8,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  carePlanName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  carePlanCost: {
    fontSize: 14,
    color: COLORS.primary,
    marginBottom: 8,
  },
  statusChip: {
    alignSelf: 'flex-start',
  },
  vitalHeader: {
    marginBottom: 16,
  },
  vitalDate: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  vitalItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  vitalLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  vitalValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 2,
  },
  vitalNotes: {
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  vitalNotesText: {
    fontSize: 14,
    color: '#1976d2',
    fontStyle: 'italic',
  },
  assessmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  assessmentType: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  assessmentDate: {
    fontSize: 12,
    color: '#666',
  },
  assessmentConductor: {
    fontSize: 12,
    color: COLORS.primary,
    marginBottom: 16,
  },
  assessmentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  attendanceChip: {
    marginLeft: 8,
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  activityNotes: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  medicationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationInfo: {
    marginLeft: 12,
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  medicationDosage: {
    fontSize: 14,
    color: COLORS.primary,
    marginTop: 2,
  },
  medicationDetails: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  medicationFrequency: {
    fontSize: 14,
    color: '#666',
  },
  medicationTime: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  medicationNotes: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
    fontStyle: 'italic',
  },
  noDataText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  staffInfo: {
    fontSize: 12,
    color: COLORS.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  activityLocation: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

export default FamilyResidentDetailScreen; 