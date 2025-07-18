import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  FlatList,
  Dimensions,
  ScrollView as RNScrollView,
} from 'react-native';
import { Appbar, Chip, Surface, Button, Divider, Menu } from 'react-native-paper';
import { MaterialIcons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Mock data imports - in a real app would come from API
import { residents, carePlans, medications, vitals, carePlanAssignments, resident_photos } from '../../api/mockData';

// Mock data cho hoạt động, hình ảnh, đánh giá
const mockActivities = [
  {
    id: 'a1',
    name: 'Tập thể dục buổi sáng',
    date: '2024-03-02',
    rating: 5,
    notes: 'Tham gia tích cực, tinh thần tốt',
  },
  {
    id: 'a2',
    name: 'Hát karaoke',
    date: '2024-03-03',
    rating: 4,
    notes: 'Rất vui vẻ, giao lưu tốt',
  },
];
const mockPhotos = [
  {
    id: 'p1',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
    caption: 'Tập thể dục buổi sáng',
    date: '2024-03-02',
    tags: ['Vui vẻ', 'Khỏe mạnh'],
  },
  {
    id: 'p2',
    url: 'https://images.unsplash.com/photo-1464983953574-0892a716854b',
    caption: 'Bữa ăn tối cùng bạn bè',
    date: '2024-03-01',
    tags: ['Hạnh phúc'],
  },
];
const mockAssessments = [
  {
    id: 'as1',
    type: 'Đánh giá tổng quát',
    date: '2024-03-01',
    notes: 'Sức khỏe ổn định, cần duy trì tập luyện',
    recommendations: 'Tăng cường vận động nhẹ',
    conductedBy: 'Bác sĩ Phạm Thị Doctor',
  },
  {
    id: 'as2',
    type: 'Đánh giá vật lý trị liệu',
    date: '2024-03-05',
    notes: 'Khả năng vận động cải thiện',
    recommendations: 'Tiếp tục vật lý trị liệu',
    conductedBy: 'Điều dưỡng Lê Văn Nurse',
  },
];

// Demo image URLs cho test grid
const DEMO_IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1516979187457-637abb4f9353?auto=format&fit=crop&w=400&q=80',
];

// Định nghĩa hàm capitalizeWords (nên đặt gần đầu file hoặc ngay trên component)
const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Hàm capitalizeFirst cho từng bệnh lý
const capitalizeFirst = (str) => str && str.length > 0 ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const ResidentDetailScreen = ({ route, navigation }) => {
  const { residentId, initialTab = 'overview' } = route.params;
  const [resident, setResident] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  // Tab mới: overview, activity, meds, vitals, images, assessment
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    // In a real app, this would be an API call
    const fetchData = async () => {
      // Simulate API call delay
      setTimeout(() => {
        const foundResident = residents.find(r => r._id === residentId);
        setResident(foundResident);
        setLoading(false);
      }, 500);
    };

    fetchData();
  }, [residentId]);

  // Update active tab when initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  if (loading || !resident) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // For now, we'll show empty lists since the IDs don't match between residents and medications/vitals
  // In a real app, this would be properly linked
  const residentCarePlans = [];
  const residentMedications = [];
  const residentVitals = [];

  // Tìm assignment active của resident
  const activeAssignment = carePlanAssignments.find(
    a => a.resident_id === resident._id && a.status === 'active'
  );
  const mainCarePlan = activeAssignment?.main_care_plan;
  const supplementaryPlans = activeAssignment?.supplementary_plans || [];

  const handleRegisterCarePlan = () => {
    navigation.navigate('CarePlanSelection', { residentId: resident._id, residentName: resident.full_name });
  };

  const renderOverviewTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Gói Dịch Vụ Đang Dùng</Text>
        <Surface style={[styles.infoBox, { backgroundColor: '#fff' }]}>
          {mainCarePlan ? (
            <>
              <Text style={styles.infoLabel}>Gói chính:</Text>
              <Text style={styles.infoValue}>{mainCarePlan.plan_name}</Text>
              {supplementaryPlans.length > 0 && (
                <>
                  <Text style={[styles.infoLabel, { marginTop: 8 }]}>Gói phụ:</Text>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 }}>
                    {supplementaryPlans.map((plan, idx) => (
                      <Chip key={plan._id || idx} style={styles.conditionChip}>{plan.plan_name}</Chip>
                    ))}
                  </View>
                </>
              )}
            </>
          ) : (
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.infoValue}>Chưa đăng ký gói dịch vụ</Text>
              <Button
                mode="contained"
                style={{ marginTop: 12 }}
                onPress={handleRegisterCarePlan}
                icon="plus"
              >
                Đăng ký gói dịch vụ
              </Button>
            </View>
          )}
        </Surface>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Thông Tin Cá Nhân</Text>
        <Surface style={[styles.infoBox, { backgroundColor: '#fff' }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Số Phòng - Giường</Text>
              <Text style={styles.infoValue}>
                {resident.room_number}
                {resident.bed_number ? ` - ${resident.bed_number}` : ''}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày Sinh</Text>
              <Text style={styles.infoValue}>
                {resident.date_of_birth ? new Date(resident.date_of_birth).toLocaleDateString('vi-VN') : 'Không có thông tin'}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Ngày Nhập Viện</Text>
              <Text style={styles.infoValue}>
                {resident.admission_date ? new Date(resident.admission_date).toLocaleDateString('vi-VN') : 'Không có thông tin'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mức Độ Chăm Sóc</Text>
              <Chip
                style={[
                  styles.careChip,
                  {
                    backgroundColor:
                      resident.care_level === 'intensive'
                        ? COLORS.error
                        : resident.care_level === 'intermediate'
                        ? COLORS.warning
                        : COLORS.success,
                  },
                ]}
                textStyle={{ color: COLORS.surface }}
              >
                {resident.care_level === 'intensive' ? 'Cao' : resident.care_level === 'intermediate' ? 'Trung Bình' : 'Thấp'}
              </Chip>
            </View>
          </View>
        </Surface>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Tình Trạng Sức Khỏe</Text>
        <Surface style={[styles.infoBox, { backgroundColor: '#fff' }]}>
          <View style={styles.conditionsContainer}>
            {resident.medical_history ? (
              resident.medical_history.split(', ').map((condition, index) => (
                <Chip key={index} style={styles.conditionChip}>
                  {capitalizeFirst(condition)}
                </Chip>
              ))
            ) : (
              <Text style={styles.infoValue}>Không có thông tin bệnh lý</Text>
            )}
          </View>
          
          <Text style={[styles.infoLabel, { marginTop: 16 }]}>Dị Ứng</Text>
          <View style={styles.conditionsContainer}>
            {resident.allergies && resident.allergies.length > 0 ? (
              resident.allergies.map((allergy, index) => (
                <Chip
                  key={index}
                  style={[styles.conditionChip, { backgroundColor: COLORS.error + '20' }]}
                  textStyle={{ color: COLORS.error }}
                >
                  {allergy}
                </Chip>
              ))
            ) : (
              <Text style={styles.infoValue}>Không có dị ứng đã biết</Text>
            )}
          </View>
        </Surface>
      </View>
      
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Liên Hệ Khẩn Cấp</Text>
        <Surface style={[styles.infoBox, { backgroundColor: '#fff' }]}>
          <View style={styles.infoRow}>
            <View style={styles.infoFullItem}>
              <Text style={styles.infoLabel}>Tên</Text>
              <Text style={styles.infoValue}>{resident.emergency_contact?.name || 'Không có thông tin'}</Text>
            </View>
          </View>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Mối Quan Hệ</Text>
              <Text style={styles.infoValue}>{capitalizeWords(resident.emergency_contact?.relationship) || 'Không có thông tin'}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Điện Thoại</Text>
              <Text style={styles.infoValue}>{resident.emergency_contact?.phone || 'Không có thông tin'}</Text>
            </View>
          </View>
        </Surface>
      </View>
    </>
  );

  // Tab Hoạt Động
  const renderActivityTab = () => (
    <View style={styles.sectionContainer}>
      <Text style={styles.sectionTitle}>Hoạt Động Đã Tham Gia</Text>
      {mockActivities.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có hoạt động nào</Text>
        </View>
      ) : (
        mockActivities.map(act => (
          <Surface key={act.id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
            <Text style={styles.activityName}>{act.name}</Text>
            <Text style={styles.activityDate}>Ngày: {act.date}</Text>
            <Text style={styles.activityRating}>Đánh giá: {'★'.repeat(act.rating)}</Text>
            <Text style={styles.activityNotes}>Ghi chú: {act.notes}</Text>
          </Surface>
        ))
      )}
    </View>
  );

  // Tab Hình Ảnh
  const renderImagesTab = () => {
    const photos = resident_photos.filter(photo => photo.resident_id === resident._id);
    const screenWidth = Dimensions.get('window').width;
    const cardMargin = 10;
    const cardWidth = (screenWidth - cardMargin * 3 - 32) * 0.46; // 46% width, margin lớn hơn

    if (photos.length === 0) {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Hình Ảnh Của Cư Dân</Text>
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Chưa có hình ảnh nào</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.sectionContainer}>
        <Text style={styles.sectionTitle}>Hình Ảnh Của Cư Dân</Text>
        <FlatList
          data={photos}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: cardMargin }}
          renderItem={({ item, index }) => {
            const demoImg = DEMO_IMAGES[index % DEMO_IMAGES.length];
            const imgSrc = item.file_path && item.file_path.startsWith('http') ? item.file_path : demoImg;
            // Hiển thị tối đa 2 tag, còn lại dùng '...'
            const tags = item.tags || [];
            const displayTags = tags.slice(0, 2);
            const hasMoreTags = tags.length > 2;
            return (
              <Surface style={[styles.photoCard, { width: cardWidth, marginBottom: cardMargin }] }>
                <Image
                  source={{ uri: imgSrc }}
                  style={styles.photoImage}
                  resizeMode="cover"
                />
                <Text style={styles.photoCaption} numberOfLines={2}>{item.caption}</Text>
                <Text style={styles.photoDate}>Ngày: {item.taken_date ? new Date(item.taken_date).toLocaleDateString('vi-VN') : ''}</Text>
                <View style={styles.photoTagsRow}>
                  {displayTags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      style={styles.photoTagChip}
                      textStyle={styles.photoTagText}
                      compact
                    >
                      <Text numberOfLines={1} ellipsizeMode="tail" style={styles.photoTagText}>{tag}</Text>
                    </Chip>
                  ))}
                  {hasMoreTags && (
                    <Chip style={[styles.photoTagChip, { backgroundColor: '#ccc' }]} textStyle={styles.photoTagText} compact>...</Chip>
                  )}
                </View>
              </Surface>
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
        />
      </View>
    );
  };

  // Tab Đánh Giá Chung (Assessment)
  const renderAssessmentTab = () => (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Đánh Giá Chung</Text>
        <Button
          mode="contained"
          icon="plus"
          onPress={() => navigation.navigate('AddAssessment', { residentId: resident._id })}
          style={styles.addButton}
          labelStyle={styles.addButtonText}
        >
          Ghi Nhận
        </Button>
      </View>
      {mockAssessments.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có đánh giá nào</Text>
        </View>
      ) : (
        mockAssessments.map(as => (
          <Surface key={as.id} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
            <Text style={styles.assessmentType}>{as.type}</Text>
            <Text style={styles.assessmentDate}>Ngày: {as.date}</Text>
            <Text style={styles.assessmentBy}>Người thực hiện: {as.conductedBy}</Text>
            <Text style={styles.assessmentNotes}>Ghi chú: {as.notes}</Text>
            <Text style={styles.assessmentRec}>Khuyến nghị: {as.recommendations}</Text>
          </Surface>
        ))
      )}
    </View>
  );

  const renderMedicationsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Thuốc Chi Tiết</Text>
        </View>
        
        {resident.current_medications && resident.current_medications.length > 0 ? (
          resident.current_medications.map((med, index) => (
            <Surface key={index} style={[styles.cardContainer, { backgroundColor: '#fff' }]}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationName}>{med.medication_name}</Text>
                <Chip
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: COLORS.success + '20',
                    },
                  ]}
                  textStyle={{
                    color: COLORS.success,
                  }}
                >
                  Đang Sử Dụng
                </Chip>
              </View>
              
              <View style={styles.medicationDetails}>
                <View style={styles.medicationDetail}>
                  <Text style={styles.medicationLabel}>Liều Lượng:</Text>
                  <Text style={styles.medicationValue}>{med.dosage}</Text>
                </View>
                <View style={styles.medicationDetail}>
                  <Text style={styles.medicationLabel}>Tần Suất:</Text>
                  <Text style={styles.medicationValue}>{med.frequency}</Text>
                </View>
              </View>
            </Surface>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Không có thông tin thuốc chi tiết</Text>
          </View>
        )}
      </View>
    </>
  );

  const renderVitalsTab = () => (
    <>
      <View style={styles.sectionContainer}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Dấu Hiệu Sinh Tồn</Text>
          <Button
            mode="contained"
            icon="plus"
            onPress={() => navigation.navigate('RecordVitals', { residentId })}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Ghi Nhận
          </Button>
        </View>
        
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Chưa có dấu hiệu sinh tồn được ghi nhận</Text>
          <Text style={styles.emptyText}>Dữ liệu sẽ được hiển thị khi có thông tin</Text>
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Thông tin cư dân" />
        <Menu
          visible={menuVisible}
          onDismiss={() => setMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="dots-vertical"
              onPress={() => setMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('EditResident', { residentId });
            }}
            title="Chỉnh Sửa Thông Tin"
            icon="pencil"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentNotes', { residentId });
            }}
            title="Ghi Chú"
            icon="notebook"
          />
          <Menu.Item
            onPress={() => {
              setMenuVisible(false);
              navigation.navigate('ResidentFamily', { residentId });
            }}
            title="Liên Hệ Gia Đình"
            icon="account-group"
          />
        </Menu>
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <View style={styles.profileContainer}>
          <Image source={{ uri: resident.photo || resident.avatar }} style={styles.profileImage} />
          <View style={styles.profileInfo}>
            <View style={styles.nameContainer}>
              <Text style={styles.name}>{resident.full_name || 'Không có tên'}</Text>
            </View>
            <View style={styles.roomBadge}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomText}>Phòng {resident.room_number || 'N/A'}</Text>
              {resident.bed_number && (
                <Text style={styles.bedText}> - Giường {resident.bed_number}</Text>
              )}
            </View>
          </View>
        </View>

        <RNScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScrollContainer}>
          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'overview' && styles.activeTabButton]}
            onPress={() => setActiveTab('overview')}
          >
            <MaterialIcons
              name="person"
              size={24}
              color={activeTab === 'overview' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'overview' && styles.activeTabText,
              ]}
            >
              Tổng Quan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'activity' && styles.activeTabButton]}
            onPress={() => setActiveTab('activity')}
          >
            <MaterialIcons
              name="event"
              size={24}
              color={activeTab === 'activity' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'activity' && styles.activeTabText,
              ]}
            >
              Hoạt Động
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'meds' && styles.activeTabButton]}
            onPress={() => setActiveTab('meds')}
          >
            <FontAwesome5
              name="pills"
              size={24}
              color={activeTab === 'meds' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'meds' && styles.activeTabText,
              ]}
            >
              Thuốc
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'vitals' && styles.activeTabButton]}
            onPress={() => setActiveTab('vitals')}
          >
            <MaterialCommunityIcons
              name="heart-pulse"
              size={24}
              color={activeTab === 'vitals' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'vitals' && styles.activeTabText,
              ]}
            >
              Sinh Hiệu
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'images' && styles.activeTabButton]}
            onPress={() => setActiveTab('images')}
          >
            <MaterialIcons
              name="photo-library"
              size={24}
              color={activeTab === 'images' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'images' && styles.activeTabText,
              ]}
            >
              Hình Ảnh
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabButton, activeTab === 'assessment' && styles.activeTabButton]}
            onPress={() => setActiveTab('assessment')}
          >
            <MaterialIcons
              name="assignment-turned-in"
              size={24}
              color={activeTab === 'assessment' ? COLORS.primary : COLORS.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === 'assessment' && styles.activeTabText,
              ]}
            >
              Đánh Giá
            </Text>
          </TouchableOpacity>
        </RNScrollView>

        <Divider />

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'activity' && renderActivityTab()}
        {activeTab === 'meds' && renderMedicationsTab()}
        {activeTab === 'vitals' && renderVitalsTab()}
        {activeTab === 'images' && (
          // FlatList KHÔNG scroll dọc độc lập, chỉ render nội dung, scrollEnabled={false}
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Hình Ảnh Của Cư Dân</Text>
            <FlatList
              data={resident_photos.filter(photo => photo.resident_id === resident._id)}
              keyExtractor={item => item._id}
              numColumns={2}
              columnWrapperStyle={{ justifyContent: 'space-between', marginBottom: 10 }}
              renderItem={({ item, index }) => {
                const demoImg = DEMO_IMAGES[index % DEMO_IMAGES.length];
                const imgSrc = item.file_path && item.file_path.startsWith('http') ? item.file_path : demoImg;
                const tags = item.tags || [];
                const displayTags = tags.slice(0, 2);
                const hasMoreTags = tags.length > 2;
                return (
                  <Surface style={[styles.photoCard, { width: (Dimensions.get('window').width - 10 * 3 - 32) * 0.46, marginBottom: 10 }] }>
                    <Image
                      source={{ uri: imgSrc }}
                      style={styles.photoImage}
                      resizeMode="cover"
                    />
                    <Text style={styles.photoCaption} numberOfLines={2}>{item.caption}</Text>
                    <Text style={styles.photoDate}>Ngày: {item.taken_date ? new Date(item.taken_date).toLocaleDateString('vi-VN') : ''}</Text>
                    <View style={styles.photoTagsRow}>
                      {displayTags.map((tag, idx) => (
                        <Chip
                          key={idx}
                          style={styles.photoTagChip}
                          textStyle={styles.photoTagText}
                          compact
                        >
                          <Text numberOfLines={1} ellipsizeMode="tail" style={styles.photoTagText}>{tag}</Text>
                        </Chip>
                      ))}
                      {hasMoreTags && (
                        <Chip style={[styles.photoTagChip, { backgroundColor: '#ccc' }]} textStyle={styles.photoTagText} compact>...</Chip>
                      )}
                    </View>
                  </Surface>
                );
              }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 16, paddingHorizontal: 16 }}
              scrollEnabled={false}
            />
          </View>
        )}
        {activeTab === 'assessment' && renderAssessmentTab()}
      </ScrollView>
    </View>
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
  profileContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
  },
  nameContainer: {
    marginBottom: 4,
  },
  name: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  bedText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  tabButton: {
    minWidth: 115,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 8,
    borderRadius: 16,
    backgroundColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: COLORS.primary,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 16,
  },
  tabText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  sectionContainer: {
    padding: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  infoBox: {
    padding: SIZES.padding,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
  },
  infoFullItem: {
    flex: 1,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  careChip: {
    alignSelf: 'flex-start',
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
  },
  conditionChip: {
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    backgroundColor: COLORS.primary,
  },
  addButtonText: {
    ...FONTS.body3,
    color: COLORS.surface,
  },
  cardContainer: {
    padding: SIZES.padding,
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  carePlanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  carePlanTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  carePlanDate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  statusChip: {
    height: 28,
  },
  carePlanDescription: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 12,
  },
  goalsContainer: {
    marginTop: 8,
  },
  goalsTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  goalText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
  },
  moreText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginTop: 4,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  medicationDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  medicationDetail: {
    marginRight: 16,
    marginBottom: 8,
  },
  medicationLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  medicationValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  medicationSchedule: {
    marginBottom: 12,
  },
  medicationScheduleTitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeChip: {
    backgroundColor: COLORS.primary + '20',
    marginRight: 8,
    marginBottom: 8,
  },
  medicationNotes: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  vitalHeader: {
    marginBottom: 12,
  },
  vitalDate: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  vitalRecorded: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  vitalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  vitalItem: {
    width: '33%',
    paddingVertical: 8,
    paddingHorizontal: 4,
    alignItems: 'center',
  },
  vitalLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  vitalValue: {
    ...FONTS.body1,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  vitalNotes: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    marginTop: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginBottom: 10,
  },
  activityName: { ...FONTS.h4, color: COLORS.primary, marginBottom: 4 },
  activityDate: { ...FONTS.body3, color: COLORS.textSecondary },
  activityRating: { ...FONTS.body3, color: COLORS.warning, marginBottom: 4 },
  activityNotes: { ...FONTS.body2, color: COLORS.text },
  photoCaption: { ...FONTS.body4, fontWeight: '500', marginBottom: 2, textAlign: 'center', color: COLORS.text, fontSize: 13 },
  photoDate: { ...FONTS.caption, color: COLORS.gray, marginBottom: 2, textAlign: 'center', fontSize: 12 },
  assessmentType: { ...FONTS.h4, color: COLORS.primary, marginBottom: 4 },
  assessmentDate: { ...FONTS.body3, color: COLORS.textSecondary },
  assessmentBy: { ...FONTS.body3, color: COLORS.textSecondary },
  assessmentNotes: { ...FONTS.body2, color: COLORS.text },
  assessmentRec: { ...FONTS.body2, color: COLORS.success },
  photoCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 10,
    alignItems: 'flex-start', // đổi từ center sang flex-start
    ...SHADOWS.small,
    minWidth: 0,
    maxWidth: '100%',
    paddingBottom: 6, // giảm padding dưới
  },
  photoImage: {
    width: '100%',
    aspectRatio: 4/3,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#eee',
  },
  photoTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start', // đổi từ center sang flex-start
    marginTop: 2,
  },
  photoTagChip: {
    marginRight: 4,
    marginBottom: 2,
    backgroundColor: COLORS.primary + '15',
    height: 22,
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderRadius: 8,
    minHeight: 20,
    maxWidth: 130, // tăng maxWidth
  },
  photoTagText: {
    fontSize: 11, // nhỏ lại
    paddingHorizontal: 0,
    paddingVertical: 0,
    lineHeight: 15,
  },
  tabScrollContainer: {
    paddingHorizontal: 4,
    alignItems: 'center',
  },
});

export default ResidentDetailScreen; 