import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
  ScrollView,
  TextInput,
  SectionList,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  Chip,
  IconButton,
  Button,
  Searchbar,
  Menu,
} from 'react-native-paper';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';
import ImageViewing from 'react-native-image-viewing';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { FlatGrid } from 'react-native-super-grid';
import PhotoSearchFilters from '../../components/PhotoSearchFilters';
import residentPhotosService from '../../api/services/residentPhotosService';
import { API_BASE_URL as CONFIG_API_BASE_URL } from '../../api/config/apiConfig';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const GRID_SPACING = 2;
const COLUMNS = 4; // Tăng lên 4 cột theo yêu cầu người dùng
const ITEM_DIMENSION = (width - (GRID_SPACING * (COLUMNS + 1) * 2)) / COLUMNS;

const DEFAULT_API_BASE_URL = 'http://192.168.2.5:8000';
const getApiBaseUrl = () => {
  if (typeof CONFIG_API_BASE_URL === 'string' && CONFIG_API_BASE_URL.startsWith('http')) {
    return CONFIG_API_BASE_URL;
  }
  return DEFAULT_API_BASE_URL;
};

const getImageUri = (filePath) => {
  if (!filePath) return '';
  if (filePath.startsWith('http') || filePath.startsWith('https')) return filePath;
  // Chuyển \ thành /
  const cleanPath = filePath.replace(/\\/g, '/').replace(/^\/+|^\/+/, '');
  return `${getApiBaseUrl()}/${cleanPath}`;
};

// =========================
// 1. ENHANCED MOCK DATA
// =========================
const mockResidentPhotos = [
  // Hôm nay - 3 ảnh
  {
    _id: 'photo_001',
    resident_id: 'res_001',
    resident_name: 'Nguyễn Văn Nam', 
    uploaded_by: 'Nhân viên Mai',
    file_name: 'tap_the_duc_buoi_sang.jpg',
    file_path: 'https://mekongsport.com/public/uploads/images/cac-bai-tap-the-duc-cho-nguoi-cao-tuoi-2.jpg?1664621210877',
    file_size: 2500000,
    file_type: 'image/jpeg',
    caption: 'Hoạt động tập thể dục buổi sáng',
    activity_type: 'Hoạt động thể chất',
    tags: ['Vui vẻ', 'Khỏe mạnh', 'Tích cực'],
    upload_date: new Date().toISOString(),
    taken_date: new Date().toISOString(),
    staff_notes: 'Cụ Nam tham gia rất tích cực vào buổi tập thể dục sáng nay, cụ rất vui vẻ và năng động',
    location: 'Sân vận động',
    created_at: new Date().toISOString(),
  },
  {
    _id: 'photo_002',
    resident_id: 'res_001',
    resident_name: 'Nguyễn Văn Nam',
    uploaded_by: 'Nhân viên Mai',
    file_name: 'bua_sang.jpg',
    file_path: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=800&h=800&fit=crop&crop=center',
    file_size: 1800000,
    file_type: 'image/jpeg',
    caption: 'Bữa sáng dinh dưỡng',
    activity_type: 'Bữa ăn',
    tags: ['Khỏe mạnh', 'Dinh dưỡng'],
    upload_date: new Date().toISOString(),
    taken_date: new Date().toISOString(),
    staff_notes: 'Cụ Nam ăn uống ngon miệng, đặc biệt thích món cháo gà',
    location: 'Phòng ăn',
    created_at: new Date().toISOString(),
  },
  {
    _id: 'photo_003',
    resident_id: 'res_001',
    resident_name: 'Nguyễn Văn Nam',
    uploaded_by: 'Nhân viên Mai',
    file_name: 'hoat_dong_van_nghe.jpg',
    file_path: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=800&h=800&fit=crop&crop=center',
    file_size: 2200000,
    file_type: 'image/jpeg',
    caption: 'Hoạt động văn nghệ chiều',
    activity_type: 'Hoạt động tinh thần',
    tags: ['Vui vẻ', 'Sáng tạo', 'Hạnh phúc'],
    upload_date: new Date().toISOString(),
    taken_date: new Date().toISOString(),
    staff_notes: 'Cụ Nam hát rất hay và được mọi người khen ngợi',
    location: 'Phòng sinh hoạt',
    created_at: new Date().toISOString(),
  },
  
  // Hôm qua - 2 ảnh
  {
    _id: 'photo_004',
    resident_id: 'res_001',
    resident_name: 'Nguyễn Văn Nam',
    uploaded_by: 'Nhân viên Lan',
    file_name: 'tham_vieng_gia_dinh.jpg',
    file_path: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&h=800&fit=crop&crop=center',
    file_size: 1900000,
    file_type: 'image/jpeg',
    caption: 'Thăm viếng gia đình',
    activity_type: 'Thăm viếng gia đình',
    tags: ['Hạnh phúc', 'Gia đình', 'Yêu thương'],
    upload_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    taken_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    staff_notes: 'Con trai cụ Nam đến thăm, cụ rất xúc động và hạnh phúc',
    location: 'Phòng tiếp khách',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: 'photo_005',
    resident_id: 'res_001',
    resident_name: 'Nguyễn Văn Nam',
    uploaded_by: 'Nhân viên Lan',
    file_name: 'hoat_dong_the_chat.jpg',
    file_path: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=800&fit=crop&crop=center',
    file_size: 2100000,
    file_type: 'image/jpeg',
    caption: 'Tập yoga nhẹ nhàng',
    activity_type: 'Hoạt động thể chất',
    tags: ['Khỏe mạnh', 'Tập trung', 'Bình yên'],
    upload_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    taken_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    staff_notes: 'Cụ Nam tập yoga rất chăm chỉ, động tác rất đẹp',
    location: 'Phòng tập',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },

  // 3 ngày trước
  {
    _id: 'photo_006',
    resident_id: 'res_002',
    resident_name: 'Lê Thị Hoa',
    uploaded_by: 'Nhân viên Hoa',
    file_name: 'sinh_nhat.jpg',
    file_path: 'https://images.unsplash.com/photo-1464349153735-7db50ed83c84?w=800&h=800&fit=crop&crop=center',
    file_size: 2800000,
    file_type: 'image/jpeg',
    caption: 'Sinh nhật cụ Hoa',
    activity_type: 'Sinh nhật/Lễ hội',
    tags: ['Hạnh phúc', 'Sinh nhật', 'Vui vẻ'],
    upload_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    taken_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    staff_notes: 'Cụ Hoa rất vui mừng trong ngày sinh nhật',
    location: 'Phòng sinh hoạt',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  
  // 1 tuần trước
  {
    _id: 'photo_007',
    resident_id: 'res_002',
    resident_name: 'Lê Thị Hoa',
    uploaded_by: 'Nhân viên Hoa',
    file_name: 'cham_soc_vuon.jpg',
    file_path: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800&h=800&fit=crop&crop=center',
    file_size: 2100000,
    file_type: 'image/jpeg',
    caption: 'Chăm sóc vườn hoa',
    activity_type: 'Hoạt động tinh thần',
    tags: ['Sáng tạo', 'Tích cực'],
    upload_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    taken_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    staff_notes: 'Cụ Hoa rất thích chăm sóc hoa, hoạt động này giúp cụ thư giãn',
    location: 'Vườn hoa',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// =========================
// 2. HELPER FUNCTIONS
// =========================
const getDateLabel = (dateStr) => {
  if (!dateStr) return 'Không xác định';
  
  const date = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const diffTime = Math.abs(today - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (date.toDateString() === today.toDateString()) {
    return 'Hôm nay';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Hôm qua';
  } else if (diffDays >= 3) {
    // Từ 3 ngày trở đi hiển thị ngày chi tiết
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } else {
    return `${diffDays} ngày trước`;
  }
};

const groupPhotosByDate = (photos) => {
  const grouped = photos.reduce((acc, photo) => {
    if (!photo.upload_date) {
      const dateLabel = 'Không xác định';
      if (!acc[dateLabel]) {
        acc[dateLabel] = [];
      }
      acc[dateLabel].push(photo);
      return acc;
    }
    
    const dateLabel = getDateLabel(photo.upload_date);
    if (!acc[dateLabel]) {
      acc[dateLabel] = [];
    }
    acc[dateLabel].push(photo);
    return acc;
  }, {});

  return Object.keys(grouped)
    .sort((a, b) => {
      if (a === 'Không xác định') return 1;
      if (b === 'Không xác định') return -1;
      
      const aPhotos = grouped[a];
      const bPhotos = grouped[b];
      
      if (!aPhotos[0].upload_date) return 1;
      if (!bPhotos[0].upload_date) return -1;
      
      const aDate = new Date(aPhotos[0].upload_date);
      const bDate = new Date(bPhotos[0].upload_date);
      return bDate - aDate;
    })
    .map(date => ({
      title: date,
      data: grouped[date]
    }));
};

// =========================
// 3. MAIN COMPONENT
// =========================
const FamilyPhotoGalleryScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [photos, setPhotos] = useState([]);
  const [filteredPhotos, setFilteredPhotos] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isImageViewVisible, setIsImageViewVisible] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [allImages, setAllImages] = useState([]);
  const [currentPhoto, setCurrentPhoto] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  
  // Bottom Sheet
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
  
  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    const filtered = filterAndSearchPhotos();
    setFilteredPhotos(filtered);
    setSections(groupPhotosByDate(filtered));
  }, [photos, searchQuery, activeFilters]);
  
  const loadData = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setPhotos([]);
        setFilteredPhotos([]);
        setSections([]);
        setLoading(false);
        return;
      }
      const res = await residentPhotosService.getAllResidentPhotos({ family_member_id: user.id });
      if (res.success && Array.isArray(res.data)) {
        // Format lại file_path cho đúng URL
        const photos = res.data.map(photo => ({
          ...photo,
          file_path: getImageUri(photo.file_path)
        }));
        setPhotos(photos);
        setFilteredPhotos(photos);
        const groupedSections = groupPhotosByDate(photos);
        setSections(groupedSections);
      } else {
        setPhotos([]);
        setFilteredPhotos([]);
        setSections([]);
      }
    } catch (error) {
      console.error('Error loading photos:', error);
      setPhotos([]);
      setFilteredPhotos([]);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const filterAndSearchPhotos = () => {
    let filtered = photos;

    // Apply search
    if (searchQuery.trim()) {
      filtered = filtered.filter(photo =>
        photo.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.resident_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        photo.uploaded_by.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply advanced filters
    if (activeFilters.residents?.length > 0) {
      filtered = filtered.filter(photo => 
        activeFilters.residents.includes(photo.resident_id)
      );
    }

    if (activeFilters.activities?.length > 0) {
      filtered = filtered.filter(photo => 
        activeFilters.activities.includes(photo.activity_type)
      );
    }

    if (activeFilters.staff?.length > 0) {
      filtered = filtered.filter(photo => 
        activeFilters.staff.includes(photo.uploaded_by)
      );
    }

    if (activeFilters.tags?.length > 0) {
      filtered = filtered.filter(photo => 
        photo.tags?.some(tag => activeFilters.tags.includes(tag))
      );
    }

    // Apply date range filter
    if (activeFilters.dateRange && activeFilters.dateRange !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(photo => {
        const photoDate = new Date(photo.upload_date);
        const photoDay = new Date(photoDate.getFullYear(), photoDate.getMonth(), photoDate.getDate());
        
        switch (activeFilters.dateRange) {
          case 'today':
            return photoDay.getTime() === today.getTime();
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return photoDay >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return photoDay >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const handleApplyFilters = (filters) => {
    setActiveFilters(filters);
  };

  const handlePhotoPress = (photo, sectionData, photoIndex) => {
    // Tạo danh sách tất cả ảnh từ tất cả sections để có thể lướt qua toàn bộ
    const allPhotosFromSections = sections.flatMap(section => section.data);
    const allImagesForViewing = allPhotosFromSections.map(p => ({
      uri: p.file_path,
      title: p.caption,
    }));
    
    // Tìm index của ảnh hiện tại trong toàn bộ danh sách
    const globalIndex = allPhotosFromSections.findIndex(p => p._id === photo._id);
    
    setAllImages(allImagesForViewing);
    setCurrentImageIndex(globalIndex >= 0 ? globalIndex : 0);
    setCurrentPhoto(photo);
    setIsImageViewVisible(true);
  };

  const handleImageIndexChange = (index) => {
    setCurrentImageIndex(index);
    // Tìm photo tương ứng trong allImages hiện tại
    if (allImages[index]) {
      const photoUri = allImages[index].uri;
      // Tìm trong tất cả sections để lấy photo data đầy đủ
      const allPhotosFromSections = sections.flatMap(section => section.data);
      const photo = allPhotosFromSections.find(p => p.file_path === photoUri);
      if (photo) {
      setCurrentPhoto(photo);
      }
    }
  };

  const handleImageViewClose = () => {
    setIsImageViewVisible(false);
    bottomSheetRef.current?.close();
  };

  const handleInfoButtonPress = () => {
    if (currentPhoto && bottomSheetRef.current) {
      // Đóng image viewer trước khi mở bottom sheet
      setIsImageViewVisible(false);
      // Mở bottom sheet sau một chút để tránh conflict
      setTimeout(() => {
      bottomSheetRef.current.expand();
      }, 300);
    }
  };

  // =========================
  // 4. RENDER METHODS
  // =========================
  
  const renderSectionHeader = ({ section: { title, data } }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderText}>{title}</Text>
      <Text style={styles.sectionHeaderCount}>{data.length} ảnh</Text>
    </View>
  );

  const renderPhotoGrid = ({ section }) => {
    return (
      <View style={styles.sectionContainer}>
        <FlatGrid
          itemDimension={ITEM_DIMENSION}
          spacing={GRID_SPACING}
          data={section.data}
          renderItem={({ item, index }) => renderPhotoItem(item, index, section.data)}
          keyExtractor={item => `photo-${section.title}-${item._id}`}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
          style={styles.gridView}
          maxItemsPerRow={COLUMNS}
          listKey={`section-${section.title}`}
        />
      </View>
    );
  };

  const renderPhotoItem = (item, index, sectionData) => {
    const handlePress = () => {
      handlePhotoPress(item, sectionData, index);
    };

    const handleInfoPress = (e) => {
      e.stopPropagation();
      setCurrentPhoto(item);
      bottomSheetRef.current?.expand();
    };

    return (
      <TouchableOpacity
        style={styles.photoItem}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Image
          source={{ uri: item.file_path }}
          style={styles.photo}
          resizeMode="cover"
          fadeDuration={0}
        />
        
        {/* Time stamp overlay */}
        <View style={styles.photoTimeStamp}>
          <Text style={styles.timeStampText}>
            {item.taken_date 
              ? new Date(item.taken_date).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false
                })
              : '--:--'
            }
          </Text>
        </View>
        
        {/* Info button overlay */}
        <TouchableOpacity
          style={styles.photoInfoButton}
          onPress={handleInfoPress}
          activeOpacity={0.8}
        >
          <MaterialIcons name="info" size={16} color="#fff" />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderBottomSheetContent = () => {
    if (!currentPhoto) return null;
    return (
      <BottomSheetScrollView 
        contentContainerStyle={styles.bottomSheetContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.photoInfo}>
          <Text style={styles.photoInfoTitle}>{currentPhoto.caption || 'Không có tiêu đề'}</Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Người đăng tải: </Text>
            {currentPhoto.uploaded_by?.full_name || currentPhoto.uploaded_by?.username || 'Không xác định'}
          </Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Người thân: </Text>
            {currentPhoto.resident_id?.full_name || 'Không xác định'}
          </Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Thời gian: </Text>
            {currentPhoto.taken_date ? new Date(currentPhoto.taken_date).toLocaleString('vi-VN') : 'Không xác định'}
          </Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Địa điểm: </Text>
            {currentPhoto.related_activity_id?.location || 'Không xác định'}
          </Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Hoạt động: </Text>
            {currentPhoto.related_activity_id?.activity_name || 'Không xác định'}
          </Text>
          <Text style={styles.photoInfoText}>
            <Text style={styles.label}>Mô tả hoạt động: </Text>
            {currentPhoto.related_activity_id?.description || 'Không xác định'}
          </Text>
          {currentPhoto.staff_notes && (
            <>
              <Text style={[styles.label, styles.notesLabel]}>Ghi chú:</Text>
              <Text style={styles.notesText}>{currentPhoto.staff_notes}</Text>
            </>
          )}
          {currentPhoto.tags && currentPhoto.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              <Text style={[styles.label, styles.tagsLabel]}>Thẻ gắn:</Text>
              <View style={styles.tagsWrapper}>
              {currentPhoto.tags.map((tag, index) => (
                  <View key={index} style={[styles.tag, styles.tagColorful]}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
              ))}
              </View>
            </View>
          )}
        </View>
      </BottomSheetScrollView>
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thư viện ảnh...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <GestureHandlerRootView style={styles.container}>
    <SafeAreaView style={styles.container}>
        {/* Header with Search */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
            <Text style={styles.headerTitle}>Thư viện ảnh</Text>
            <TouchableOpacity
              style={[
                styles.filterButton,
                Object.keys(activeFilters).length > 0 && styles.filterButtonActive
              ]}
              onPress={() => setShowAdvancedFilters(true)}
            >
              <MaterialIcons 
                name="filter-list" 
                size={24} 
                color={Object.keys(activeFilters).length > 0 ? COLORS.primary : "#333"} 
              />
              {Object.keys(activeFilters).length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>
                    {Object.values(activeFilters).flat().filter(Boolean).length}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
      </View>
      
          <Searchbar
            placeholder="Tìm kiếm ảnh, người thân, hoạt động..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
        />
      </View>
      
        {/* Photo Gallery */}
        <SectionList
          sections={sections}
          keyExtractor={(item, index) => `section-item-${item._id}-${index}`}
          renderSectionHeader={renderSectionHeader}
          renderItem={renderPhotoGrid}
          stickySectionHeadersEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />

        {/* Image Viewer */}
        <ImageViewing
          images={allImages}
          imageIndex={currentImageIndex}
          visible={isImageViewVisible}
          onRequestClose={handleImageViewClose}
          onImageIndexChange={handleImageIndexChange}
          backgroundColor="rgba(0, 0, 0, 0.95)"
          presentationStyle="overFullScreen"
          HeaderComponent={({ imageIndex }) => (
            <View style={styles.imageViewerHeader}>
              <TouchableOpacity 
                style={styles.imageViewerCloseButton}
                onPress={handleImageViewClose}
              >
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.imageViewerInfoButton}
                onPress={handleInfoButtonPress}
              >
                <MaterialIcons name="info" size={28} color="#fff" />
              </TouchableOpacity>
            </View>
          )}
          FooterComponent={({ imageIndex }) => (
            <View style={styles.imageViewerFooter}>
              <Text style={styles.imageViewerFooterText}>
                {imageIndex + 1} / {allImages.length}
              </Text>
            </View>
          )}
        />

        {/* Bottom Sheet for Photo Details */}
        <BottomSheet
          ref={bottomSheetRef}
          snapPoints={snapPoints}
          enablePanDownToClose={true}
          index={-1}
          backgroundStyle={{ backgroundColor: '#fff' }}
          handleIndicatorStyle={{ backgroundColor: '#ccc' }}
        >
          {renderBottomSheetContent()}
        </BottomSheet>

        {/* Advanced Search Filters */}
        <PhotoSearchFilters
          visible={showAdvancedFilters}
          onClose={() => setShowAdvancedFilters(false)}
          onApplyFilters={handleApplyFilters}
          currentFilters={activeFilters}
        />
    </SafeAreaView>
    </GestureHandlerRootView>
  );
};

// =========================
// 5. STYLES
// =========================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // Header
  header: {
    backgroundColor: '#fff',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginLeft: 12,
  },
  filterButton: {
    padding: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary + '15',
    borderRadius: 8,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 8,
    elevation: 0,
    backgroundColor: '#f5f5f5',
  },
  searchInput: {
    fontSize: 14,
  },

  // Gallery
  galleryContainer: {
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  sectionHeaderText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  sectionHeaderCount: {
    fontSize: 14,
    color: '#666',
  },
  sectionContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  gridView: {
    flex: 1,
  },

  // Photo Items
  photoItem: {
    width: ITEM_DIMENSION,
    height: ITEM_DIMENSION,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoTimeStamp: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  timeStampText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '500',
  },
  photoInfoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Image Viewer
  imageViewerHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 40,
    zIndex: 1000,
  },
  imageViewerCloseButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerInfoButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageViewerFooterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Bottom Sheet
  bottomSheetContent: {
    padding: 20,
    backgroundColor: '#fff',
  },
  photoInfo: {
    gap: 12,
  },
  photoInfoTitle: {
    ...FONTS.h3,
    marginBottom: 12,
    color: '#333',
    fontWeight: '600',
  },
  photoInfoText: {
    ...FONTS.body3,
    color: '#555',
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: '#333',
  },
  notesLabel: {
    marginTop: 12,
    marginBottom: 6,
    fontSize: 16,
  },
  notesText: {
    ...FONTS.body3,
    color: '#555',
    fontStyle: 'italic',
    lineHeight: 20,
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  tagsContainer: {
    marginTop: 16,
  },
  tagsLabel: {
    marginBottom: 10,
    fontSize: 16,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: COLORS.lightGray,
  },
  tagColorful: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  tagText: {
    ...FONTS.body4,
    color: '#fff',
    fontWeight: '600',
  },
});

export default FamilyPhotoGalleryScreen; 