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
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { useFocusEffect } from '@react-navigation/native';
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
import BottomSheet from '@gorhom/bottom-sheet';

import PhotoSearchFilters from '../../components/PhotoSearchFilters';
import residentPhotosService from '../../api/services/residentPhotosService';
import { getImageUri, APP_CONFIG } from '../../config/appConfig';

// Import constants
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Get screen dimensions
const { width, height } = Dimensions.get('window');
const COLUMNS = 2;
const GRID_SPACING = 8;
const SIDE_PADDING = 16;
// Two columns per row with side paddings and one inter-item gap
const ITEM_DIMENSION = Math.floor((width - SIDE_PADDING * 2 - GRID_SPACING) / COLUMNS);

// Helper để format image
const getImageUriHelper = (imagePath) => {
  return getImageUri(imagePath, 'image');
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

// Chunk an array into rows of given size (for grid in SectionList)
const chunkArray = (arr, size) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
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
  const [showPhotoDetail, setShowPhotoDetail] = useState(false);
  
  // Bottom Sheet
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ['25%', '50%', '75%'], []);
  
  useEffect(() => {
    if (user?.id && photos.length === 0) {
      loadData();
    }
  }, [user?.id, photos.length]); // Only depend on user.id, not entire user object

  useEffect(() => {
    const filtered = filterAndSearchPhotos();
    setFilteredPhotos(filtered);
    const grouped = groupPhotosByDate(filtered);
    const groupedAsRows = grouped.map(section => ({
      title: section.title,
      data: chunkArray(section.data, COLUMNS),
    }));
    setSections(groupedAsRows);
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
          file_path: getImageUriHelper(photo.file_path)
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

  const handlePhotoPress = (photo) => {
    // Tạo danh sách tất cả ảnh từ tất cả sections để có thể lướt qua toàn bộ
    const allPhotosFromSections = sections.flatMap(section => section.data).flat();
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

    // Prefetch nearby images to reduce lag when swiping
    prefetchAround(allImagesForViewing, globalIndex >= 0 ? globalIndex : 0, 2);
  };

  const handleImageIndexChange = (index) => {
    setCurrentImageIndex(index);
    // Tìm photo tương ứng trong allImages hiện tại
    if (allImages[index]) {
      const photoUri = allImages[index].uri;
      // Tìm trong tất cả sections để lấy photo data đầy đủ
      const allPhotosFromSections = sections.flatMap(section => section.data).flat();
      const photo = allPhotosFromSections.find(p => p.file_path === photoUri);
      if (photo) {
      setCurrentPhoto(photo);
      }
    }

    // Prefetch neighbors for smoother swipe
    prefetchAround(allImages, index, 2);
  };
  // Prefetch helper around a center index
  const prefetchAround = (images, centerIndex, radius = 2) => {
    if (!images || images.length === 0) return;
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(images.length - 1, centerIndex + radius);
    for (let i = start; i <= end; i++) {
      const uri = images[i]?.uri;
      if (uri) {
        Image.prefetch(uri).catch(() => {});
      }
    }
  };


  const handlePrevImage = () => {
    setCurrentImageIndex(prev => Math.max(0, prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex(prev => Math.min(allImages.length - 1, prev + 1));
  };

  const handleImageViewClose = () => {
    setIsImageViewVisible(false);
    bottomSheetRef.current?.close();
  };

  const handleInfoButtonPress = () => {
    if (currentPhoto) {
      console.log('Info button pressed from image viewer for photo:', currentPhoto._id);
      // Đóng image viewer trước khi mở modal
      setIsImageViewVisible(false);
      // Mở modal sau một chút để tránh conflict
      setTimeout(() => {
        setShowPhotoDetail(true);
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





  const renderPhotoCard = (photo) => {
    const handlePress = () => handlePhotoPress(photo);
    const handleInfoPress = (e) => {
      e.stopPropagation();
      setCurrentPhoto(photo);
      setShowPhotoDetail(true);
    };
    return (
      <TouchableOpacity style={styles.photoItem} onPress={handlePress} activeOpacity={0.85}>
        <View style={styles.photoCard}>
          <Image
            source={{ uri: photo.file_path }}
            style={styles.photoImage}
            resizeMode="cover"
            fadeDuration={0}
          />
          <View style={styles.photoTimeStamp}>
            <Text style={styles.timeStampText}>
              {photo.taken_date
                ? new Date(photo.taken_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
                : '--:--'}
            </Text>
          </View>
          <TouchableOpacity style={styles.photoInfoButton} onPress={handleInfoPress} activeOpacity={0.8}>
            <MaterialIcons name="info" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  const renderRow = (row) => {
    return (
      <View style={styles.row}> 
        {(Array.isArray(row) ? row : []).map((photo) => (
          <View key={photo._id}>
            {renderPhotoCard(photo)}
          </View>
        ))}
        {Array.isArray(row) && row.length < COLUMNS && Array.from({ length: COLUMNS - row.length }).map((_, idx) => (
          <View key={`spacer-${idx}`} style={[styles.photoItem, { opacity: 0 }]} />
        ))}
      </View>
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

  // Empty state when no photos
  if (photos.length === 0) {
    return (
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
            <View style={{ width: 40 }} />
          </View>
        </View>
        
        {/* Empty State */}
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconContainer}>
            <MaterialIcons name="photo-library" size={80} color="#ccc" />
          </View>
          <Text style={styles.emptyTitle}>Chưa có ảnh nào</Text>
          <Text style={styles.emptyDescription}>
            Hiện tại chưa có ảnh nào được đăng tải cho người thân của bạn.{'\n'}
            Nhân viên sẽ cập nhật ảnh thường xuyên để bạn có thể theo dõi hoạt động của người thân.
          </Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <MaterialIcons name="refresh" size={20} color={COLORS.primary} />
            <Text style={styles.refreshButtonText}>Tải lại</Text>
          </TouchableOpacity>
        </View>
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
        {sections.length > 0 ? (
          <SectionList
            sections={sections}
            keyExtractor={(item, index) => {
              if (Array.isArray(item)) {
                const ids = item.map((p, i) => p?._id || `i${i}`).join('_');
                return `row-${index}-${ids}`;
              }
              return `row-${index}`;
            }}
            renderSectionHeader={renderSectionHeader}
            renderItem={({ item }) => renderRow(item)}
            stickySectionHeadersEnabled={true}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          // Empty state when no results after filtering
          <View style={styles.noResultsContainer}>
            <View style={styles.noResultsIconContainer}>
              <MaterialIcons name="search-off" size={60} color="#ccc" />
            </View>
            <Text style={styles.noResultsTitle}>Không tìm thấy ảnh</Text>
            <Text style={styles.noResultsDescription}>
              Không có ảnh nào phù hợp với tìm kiếm hoặc bộ lọc hiện tại.{'\n'}
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.
            </Text>
            <TouchableOpacity 
              style={styles.clearFiltersButton}
              onPress={() => {
                setSearchQuery('');
                setActiveFilters({});
              }}
            >
              <MaterialIcons name="clear" size={20} color={COLORS.primary} />
              <Text style={styles.clearFiltersButtonText}>Xóa bộ lọc</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Image Viewer */}
        <ImageViewing
          images={allImages}
          imageIndex={currentImageIndex}
          visible={isImageViewVisible}
          onRequestClose={handleImageViewClose}
          onImageIndexChange={handleImageIndexChange}
          backgroundColor="rgba(0, 0, 0, 0.95)"
          presentationStyle="overFullScreen"
          HeaderComponent={() => (
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
            <>
              {/* Fullscreen overlay for centered arrows */}
              <View style={styles.footerOverlay} pointerEvents="box-none">
                {imageIndex > 0 && (
                  <TouchableOpacity 
                    style={styles.viewerLeftArrow}
                    onPress={handlePrevImage}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="chevron-left" size={34} color="#fff" />
                  </TouchableOpacity>
                )}
                {imageIndex < allImages.length - 1 && (
                  <TouchableOpacity 
                    style={styles.viewerRightArrow}
                    onPress={handleNextImage}
                    activeOpacity={0.8}
                  >
                    <MaterialIcons name="chevron-right" size={34} color="#fff" />
                  </TouchableOpacity>
                )}
              </View>
              {/* Footer info */}
              <View style={styles.imageViewerFooter}>
                <Text style={styles.imageViewerFooterText}>
                  {imageIndex + 1} / {allImages.length}
                </Text>
                {currentPhoto && (
                  <View style={styles.viewerInfoBox}>
                    {!!currentPhoto.caption && (
                      <Text style={[styles.viewerInfoText, { fontWeight: '600' }]} numberOfLines={2}>
                        {currentPhoto.caption}
                      </Text>
                    )}
                    <Text style={styles.viewerInfoText}>
                      Người đăng: {currentPhoto.uploaded_by?.full_name || currentPhoto.uploaded_by?.username || 'Không xác định'}
                    </Text>
                    <Text style={styles.viewerInfoText}>
                      Thời gian: {currentPhoto.taken_date ? new Date(currentPhoto.taken_date).toLocaleString('vi-VN') : 'Không xác định'}
                    </Text>
                    {(() => {
                      const ra = currentPhoto.related_activity_id;
                      const location = ra?.location || currentPhoto.location;
                      const activity = ra?.activity_type || ra?.activity_name || currentPhoto.activity_type;
                      return (
                        <>
                          <Text style={styles.viewerInfoText}>Địa điểm: {location || 'Không xác định'}</Text>
                          <Text style={styles.viewerInfoText}>Hoạt động: {activity || 'Không xác định'}</Text>
                        </>
                      );
                    })()}
                    {!!currentPhoto.related_activity_id?.description && (
                      <Text style={styles.viewerInfoText} numberOfLines={3}>
                        Mô tả: {currentPhoto.related_activity_id?.description}
                      </Text>
                    )}
                    {currentPhoto.tags && currentPhoto.tags.length > 0 && (
                      <View style={styles.viewerTagsRow}>
                        {currentPhoto.tags.slice(0, 3).map((tag, idx) => (
                          <View key={idx} style={styles.viewerTagChip}>
                            <Text style={styles.viewerTagText} numberOfLines={1}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            </>
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
          onAnimate={(fromIndex, toIndex) => {
            console.log('Bottom sheet animation:', fromIndex, 'to', toIndex);
          }}
        >
          <ScrollView 
            style={styles.bottomSheetContent}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {currentPhoto && (
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
            )}
          </ScrollView>
        </BottomSheet>

        {/* Photo Detail Modal */}
        <Modal
          visible={showPhotoDetail}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowPhotoDetail(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowPhotoDetail(false)}
              >
                <MaterialIcons name="close" size={24} color="#333" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Chi tiết ảnh</Text>
              <View style={{ width: 24 }} />
            </View>
            
            <ScrollView 
              style={styles.modalContent}
              showsVerticalScrollIndicator={false}
            >
              {currentPhoto && (
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
              )}
            </ScrollView>
          </SafeAreaView>
        </Modal>

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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIDE_PADDING,
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
    marginHorizontal: SIDE_PADDING,
    marginTop: 8,
    elevation: 0,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
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
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 12,
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
    paddingHorizontal: SIDE_PADDING,
    paddingBottom: 8,
  },
  gridContainer: {
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: GRID_SPACING,
    paddingHorizontal: SIDE_PADDING,
  },

  // Photo Items
  photoItem: {
    width: ITEM_DIMENSION,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    position: 'relative',
  },
  photoCard: {
    width: '100%',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#eee',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoImage: {
    width: '100%',
    aspectRatio: 4/3,
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
    top: 6,
    right: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoCaption: {
    marginTop: 6,
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },
  photoDate: {
    marginTop: 2,
    fontSize: 12,
    color: '#777',
  },
  photoTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  tagChip: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 6,
  },
  tagChipText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '500',
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
  footerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 900,
  },
  viewerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
  },
  imageViewerFooterText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  viewerInfoBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 10,
  },
  viewerInfoText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
  viewerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  viewerTagChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  viewerTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  viewerLeftArrow: {
    position: 'absolute',
    left: 12,
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 26,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewerRightArrow: {
    position: 'absolute',
    right: 12,
    top: '45%',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 26,
    width: 52,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Bottom Sheet
  bottomSheetContent: {
    padding: 20,
    backgroundColor: '#fff',
    maxHeight: height * 0.7, // Giới hạn chiều cao
  },
  photoInfo: {
    gap: 12,
    paddingBottom: 20, // Thêm padding bottom để scroll
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
  
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalCloseButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },

  // Empty State Styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  emptyIconContainer: {
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },

  // No Results Styles
  noResultsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  noResultsIconContainer: {
    marginBottom: 20,
  },
  noResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  noResultsDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  clearFiltersButtonText: {
    marginLeft: 8,
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FamilyPhotoGalleryScreen; 