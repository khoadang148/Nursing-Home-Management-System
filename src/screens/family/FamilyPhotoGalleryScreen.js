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
  Modal,
  Platform,
  PermissionsAndroid
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
import { GestureHandlerRootView } from 'react-native-gesture-handler';
// Removed BottomSheet import
import * as FileSystem from 'expo-file-system';

// Removed PhotoSearchFilters import
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

// Helper để format image với validation tốt hơn
const getImageUriHelper = (imagePath) => {
  if (!imagePath || typeof imagePath !== 'string') {
    return null;
  }
  
  // Nếu đã là URL đầy đủ, trả về luôn
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Nếu là mock data với URL đầy đủ
  if (imagePath.includes('unsplash.com') || imagePath.includes('mekongsport.com')) {
    return imagePath;
  }
  
  // Sử dụng getImageUri từ config
  try {
    const uri = getImageUri(imagePath, 'image');
    // Kiểm tra URI có hợp lệ không
    if (uri && typeof uri === 'string' && uri.length > 0) {
      return uri;
    }
    return null;
  } catch (error) {
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log('Image URI generation failed for:', imagePath, error.message);
    }
    return null;
  }
};

// Helper để lấy tên cư dân một cách nhất quán
const getResidentDisplayName = (photo) => {
  try {
    if (photo.resident_name) return photo.resident_name;
    if (photo.resident_id) {
      if (typeof photo.resident_id === 'string') return photo.resident_id;
      if (photo.resident_id.full_name) return photo.resident_id.full_name;
      if (photo.resident_id.name) return photo.resident_id.name;
    }
    return 'Không xác định';
  } catch (error) {
    return 'Không xác định';
  }
};

// Helper để lấy tên hoạt động một cách nhất quán
const getActivityDisplayName = (photo) => {
  try {
    if (photo.activity_type) return photo.activity_type;
    if (photo.related_activity_id) {
      if (photo.related_activity_id.activity_name) return photo.related_activity_id.activity_name;
      if (photo.related_activity_id.activity_type) return photo.related_activity_id.activity_type;
    }
    return 'Không xác định';
  } catch (error) {
    return 'Không xác định';
  }
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
      
      // Kiểm tra array có rỗng không
      if (!aPhotos || aPhotos.length === 0 || !aPhotos[0]?.upload_date) return 1;
      if (!bPhotos || bPhotos.length === 0 || !bPhotos[0]?.upload_date) return -1;
      
      try {
      const aDate = new Date(aPhotos[0].upload_date);
      const bDate = new Date(bPhotos[0].upload_date);
      return bDate - aDate;
      } catch (error) {
        console.error('Error sorting photos by date:', error);
        return 0;
      }
    })
    .map(date => ({
      title: date,
      data: grouped[date]
    }));
};

// Chunk an array into rows of given size (for grid in SectionList)
const chunkArray = (arr, size) => {
  if (!Array.isArray(arr) || arr.length === 0) {
    return [];
  }
  
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
  // Removed advanced filters - only search functionality remains
  // Removed photo detail modal state
  
  // Download functionality states
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState(new Set());
  const [downloadingPhotos, setDownloadingPhotos] = useState(new Set());
  const [downloadProgress, setDownloadProgress] = useState({});
  
  // Removed bottom sheet refs
  
  useEffect(() => {
    if (user?.id && photos.length === 0) {
      loadData();
    }
  }, [user?.id, photos.length]); // Only depend on user.id, not entire user object

  useEffect(() => {
    try {
    const filtered = filterAndSearchPhotos();
    setFilteredPhotos(filtered);
    const grouped = groupPhotosByDate(filtered);
    const groupedAsRows = grouped.map(section => ({
      title: section.title,
      data: chunkArray(section.data, COLUMNS),
    }));
    setSections(groupedAsRows);
    } catch (error) {
      console.error('Error in useEffect for sections:', error);
      setSections([]);
    }
  }, [photos, searchQuery]);
  
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
        // Lọc ra những ảnh có file_path hợp lệ
        const validPhotos = res.data.filter(photo => {
          const imageUri = getImageUriHelper(photo.file_path);
          return imageUri !== null;
        });
        
        // Debug: Log sample photo data structure
        if (__DEV__ && validPhotos.length > 0) {
          console.log('DEBUG - Sample photo data structure:', {
            id: validPhotos[0]._id,
            caption: validPhotos[0].caption,
            resident_name: validPhotos[0].resident_name,
            resident_id: validPhotos[0].resident_id,
            activity_type: validPhotos[0].activity_type,
            related_activity_id: validPhotos[0].related_activity_id,
            uploaded_by: validPhotos[0].uploaded_by,
            location: validPhotos[0].location,
            tags: validPhotos[0].tags
          });
        }
        
        // Chỉ log trong development mode
        if (__DEV__) {
          console.log(`Loaded ${res.data.length} photos, ${validPhotos.length} are valid`);
        }
        
        setPhotos(validPhotos);
        setFilteredPhotos(validPhotos);
        const groupedSections = groupPhotosByDate(validPhotos);
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

    // Apply search with safe string operations
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      
      if (__DEV__) {
        console.log('DEBUG - Searching for query:', query);
        console.log('DEBUG - Total photos to search:', photos.length);
      }
      
      filtered = filtered.filter(photo => {
        try {
          // Get all possible searchable text from photo
          const searchableTexts = [];
          
          // 1. Caption
          if (photo.caption) {
            searchableTexts.push(photo.caption.toLowerCase());
          }
          
          // 2. Resident name - using helper function
          const residentName = getResidentDisplayName(photo);
          if (residentName && residentName !== 'Không xác định') {
            searchableTexts.push(residentName.toLowerCase());
          }
          
          // 3. Activity information - using helper function
          const activityName = getActivityDisplayName(photo);
          if (activityName && activityName !== 'Không xác định') {
            searchableTexts.push(activityName.toLowerCase());
          }
          
          // 4. Uploaded by
          if (photo.uploaded_by) {
            if (typeof photo.uploaded_by === 'string') {
              searchableTexts.push(photo.uploaded_by.toLowerCase());
            } else if (photo.uploaded_by.full_name) {
              searchableTexts.push(photo.uploaded_by.full_name.toLowerCase());
            } else if (photo.uploaded_by.username) {
              searchableTexts.push(photo.uploaded_by.username.toLowerCase());
            }
          }
          
          // 5. Location
          if (photo.location) {
            searchableTexts.push(photo.location.toLowerCase());
          }
          if (photo.related_activity_id?.location) {
            searchableTexts.push(photo.related_activity_id.location.toLowerCase());
          }
          
          // 6. Tags
          if (photo.tags && Array.isArray(photo.tags)) {
            photo.tags.forEach(tag => {
              if (tag) {
                searchableTexts.push(tag.toLowerCase());
              }
            });
          }
          
          // Check if query matches any of the searchable texts
          const matches = searchableTexts.some(text => text.includes(query));
          
          if (__DEV__ && matches) {
            console.log('DEBUG - Photo matched:', {
              id: photo._id,
              caption: photo.caption,
              resident_name: getResidentDisplayName(photo),
              activity_name: getActivityDisplayName(photo),
              searchableTexts: searchableTexts
            });
          }
          
          return matches;
          
        } catch (error) {
          // If any error occurs during search, include the photo to be safe
          if (__DEV__) {
            console.log('Search error for photo:', photo._id, error.message);
          }
            return true;
        }
      });
      
      if (__DEV__) {
        console.log('DEBUG - Search results:', filtered.length, 'photos found');
      }
    }

    return filtered;
  };

  // Removed advanced filters functionality

  const handlePhotoPress = (photo) => {
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log('DEBUG - handlePhotoPress called with photo:', photo);
    }
    
    // Kiểm tra ảnh có khả dụng không
    const imageUri = getImageUriHelper(photo.file_path);
    if (!imageUri) {
      Alert.alert(
        'Ảnh không khả dụng',
        'Ảnh này có thể đã bị xóa hoặc không tồn tại trên server. Vui lòng liên hệ nhân viên để được hỗ trợ.',
        [{ text: 'Đã hiểu' }]
      );
      return;
    }
    
    // Platform-specific loading indicator
    if (Platform.OS === 'android') {
      // Android: Show loading state before opening viewer
      setLoading(true);
      setTimeout(() => setLoading(false), 100);
    }
    
    // Tạo danh sách tất cả ảnh từ tất cả sections để có thể lướt qua toàn bộ
    const allPhotosFromSections = sections.flatMap(section => section.data).flat();
    
    // Tìm index của ảnh hiện tại trong toàn bộ danh sách
    const globalIndex = allPhotosFromSections.findIndex(p => p._id === photo._id);
    
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log('DEBUG - allPhotosFromSections length:', allPhotosFromSections.length);
      console.log('DEBUG - globalIndex:', globalIndex);
    }
    
    // Lưu trữ toàn bộ photo data, không chỉ uri
    setAllImages(allPhotosFromSections);
    setCurrentImageIndex(globalIndex >= 0 ? globalIndex : 0);
    setCurrentPhoto(photo);
    
          // Android: Delay opening viewer slightly for better performance
      if (Platform.OS === 'android') {
        setTimeout(() => {
    setIsImageViewVisible(true);
          // Chỉ log trong development mode
          if (__DEV__) {
            console.log('DEBUG - Android image viewer opened');
          }
        }, 50);
      } else {
        setIsImageViewVisible(true);
        // Chỉ log trong development mode
        if (__DEV__) {
          console.log('DEBUG - iOS image viewer opened');
        }
      }
    
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log('DEBUG - Image viewer opened with:', {
        allImagesLength: allPhotosFromSections.length,
        currentIndex: globalIndex >= 0 ? globalIndex : 0,
        currentPhoto: photo._id,
        platform: Platform.OS
      });
    }

    // Prefetch nearby images to reduce lag when swiping
    try {
      prefetchAround(allPhotosFromSections, globalIndex >= 0 ? globalIndex : 0, 2);
    } catch (error) {
      console.error('Error in prefetchAround:', error);
    }
  };

  const handleImageIndexChange = (index) => {
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log('DEBUG - handleImageIndexChange called with index:', index);
    }
    
    setCurrentImageIndex(index);
    
    // Bây giờ allImages chứa toàn bộ photo data
    if (allImages[index]) {
      const photo = allImages[index];
      // Chỉ log trong development mode
      if (__DEV__) {
        console.log('DEBUG - Setting current photo:', photo._id);
      }
      setCurrentPhoto(photo);
    }

    // Prefetch neighbors for smoother swipe
    try {
    prefetchAround(allImages, index, 2);
    } catch (error) {
      console.error('Error in prefetchAround during image change:', error);
    }
  };
  // Enhanced Prefetch helper with platform-specific optimizations
  const prefetchAround = (images, centerIndex, radius = 2) => {
    if (!images || images.length === 0) return;
    
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(images.length - 1, centerIndex + radius);
    
    // Chỉ log trong development mode
    if (__DEV__) {
      console.log(`[FamilyPhotoGalleryScreen] Prefetching images from ${start} to ${end}`);
    }
    
    for (let i = start; i <= end; i++) {
      const photo = images[i];
      if (photo && photo.file_path) {
        try {
          const uri = getImageUriHelper(photo.file_path);
          if (uri && typeof uri === 'string') {
            // Platform-specific prefetch strategies
            if (Platform.OS === 'android') {
              // Android: Standard prefetch (no options supported)
              Image.prefetch(uri).catch(() => {
                // Silently handle prefetch failures - this is normal
                if (__DEV__) {
                  console.log('Android prefetch failed for image:', photo.file_path);
                }
              });
            } else {
              // iOS: Standard prefetch
              Image.prefetch(uri).catch(() => {
                // Silently handle prefetch failures - this is normal
                if (__DEV__) {
                  console.log('iOS prefetch failed for image:', photo.file_path);
                }
              });
            }
          }
        } catch (error) {
          // Chỉ log trong development mode
          if (__DEV__) {
            console.log('Error in prefetch for photo:', photo._id, error.message);
          }
        }
      }
    }
  };

  // =========================
  // DOWNLOAD FUNCTIONS
  // =========================
  
  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Quyền truy cập bộ nhớ',
            message: 'Ứng dụng cần quyền truy cập bộ nhớ để tải ảnh về điện thoại.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS doesn't need explicit permission for this
  };

  const downloadSinglePhoto = async (photo) => {
    if (!photo || !photo.file_path) {
      Alert.alert('Lỗi', 'Không thể tải ảnh này.');
      return;
    }

    try {
      setDownloadingPhotos(prev => new Set(prev).add(photo._id));
      setDownloadProgress(prev => ({ ...prev, [photo._id]: 0 }));

      // Lấy URI thực tế của ảnh
      const imageUri = getImageUriHelper(photo.file_path);
      if (!imageUri) {
        throw new Error('Không thể lấy URI của ảnh');
      }

      // Generate filename with resident name
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const residentName = getResidentDisplayName(photo);
      const filename = `NHMS_${residentName}_${timestamp}.jpg`;
      
      if (__DEV__) {
        console.log('DEBUG - Downloading from:', imageUri);
        console.log('DEBUG - To:', FileSystem.cacheDirectory + filename);
      }
      
      // Download file to cache directory
      const downloadResumable = FileSystem.createDownloadResumable(
        imageUri,
        FileSystem.cacheDirectory + filename,
        {},
        (downloadProgress) => {
          const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
          setDownloadProgress(prev => ({ ...prev, [photo._id]: progress }));
        }
      );

      const { uri } = await downloadResumable.downloadAsync();
      
      if (__DEV__) {
        console.log('DEBUG - Download completed:', uri);
      }
      
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo._id);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[photo._id];
        return newProgress;
      });

      Alert.alert(
        'Tải xuống thành công',
        `Ảnh "${photo.caption || 'Không có tiêu đề'}" đã được tải xuống thành công!\n\nĐể lưu vào thư viện ảnh, hãy:\n1. Mở ứng dụng "Ảnh" trên điện thoại\n2. Tìm ảnh trong thư mục "Tải xuống"\n3. Nhấn "Lưu vào thư viện"`,
        [{ text: 'Đóng', onPress: () => {} }]
      );
      
    } catch (error) {
      console.error('Download error:', error);
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photo._id);
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[photo._id];
        return newProgress;
      });
      Alert.alert('Lỗi', `Không thể tải ảnh: ${error.message || 'Vui lòng thử lại sau.'}`);
    }
  };

  const downloadMultiplePhotos = async () => {
    if (selectedPhotos.size === 0) {
      Alert.alert('Thông báo', 'Vui lòng chọn ít nhất một ảnh để tải.');
      return;
    }

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập bộ nhớ để tải ảnh.');
      return;
    }

    const allPhotosFromSections = sections.flatMap(section => section.data).flat();
    const photosToDownload = allPhotosFromSections.filter(photo => selectedPhotos.has(photo._id));

    if (photosToDownload.length === 0) {
      Alert.alert('Lỗi', 'Không tìm thấy ảnh đã chọn.');
      return;
    }

    try {
      // Add all photos to downloading set
      setDownloadingPhotos(prev => new Set([...prev, ...selectedPhotos]));
      
      let successCount = 0;
      let errorCount = 0;

      for (const photo of photosToDownload) {
        try {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const residentName = getResidentDisplayName(photo);
            const filename = `NHMS_${residentName}_${timestamp}.jpg`;
            
            // Lấy URI thực tế của ảnh
            const imageUri = getImageUriHelper(photo.file_path);
            if (!imageUri) {
              if (__DEV__) {
                console.error(`Cannot get URI for photo: ${photo._id}`);
              }
              errorCount++;
              continue;
            }
          
          const downloadResumable = FileSystem.createDownloadResumable(
              imageUri,
            FileSystem.cacheDirectory + filename,
            {},
            (downloadProgress) => {
              const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
              setDownloadProgress(prev => ({ ...prev, [photo._id]: progress }));
            }
          );

          const { uri } = await downloadResumable.downloadAsync();
          
          successCount++;
        } catch (error) {
            if (__DEV__) {
          console.error(`Error downloading photo ${photo._id}:`, error);
            }
          errorCount++;
        }
      }

      // Clear downloading states
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        selectedPhotos.forEach(id => newSet.delete(id));
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        selectedPhotos.forEach(id => delete newProgress[id]);
        return newProgress;
      });

      // Show result
      if (errorCount === 0) {
        Alert.alert(
          'Thành công', 
          `Đã tải ${successCount} ảnh thành công!\n\nĐể lưu vào thư viện ảnh, hãy:\n1. Mở ứng dụng "Ảnh" trên điện thoại\n2. Tìm ảnh trong thư mục "Tải xuống"\n3. Nhấn "Lưu vào thư viện"`
        );
      } else {
        Alert.alert('Hoàn thành', `Đã tải ${successCount} ảnh thành công, ${errorCount} ảnh lỗi.`);
      }

      // Exit selection mode
      setIsSelectionMode(false);
      setSelectedPhotos(new Set());

    } catch (error) {
      console.error('Batch download error:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi tải ảnh. Vui lòng thử lại sau.');
      
      // Clear downloading states
      setDownloadingPhotos(prev => {
        const newSet = new Set(prev);
        selectedPhotos.forEach(id => newSet.delete(id));
        return newSet;
      });
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        selectedPhotos.forEach(id => delete newProgress[id]);
        return newProgress;
      });
    }
  };

  const togglePhotoSelection = (photoId) => {
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedPhotos(new Set());
    }
  };

  const selectAllPhotos = () => {
    const allPhotosFromSections = sections.flatMap(section => section.data).flat();
    setSelectedPhotos(new Set(allPhotosFromSections.map(photo => photo._id)));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotos(new Set());
  };


  const handlePrevImage = () => {
    const newIndex = Math.max(0, currentImageIndex - 1);
    handleImageIndexChange(newIndex);
  };

  const handleNextImage = () => {
    const newIndex = Math.min(allImages.length - 1, currentImageIndex + 1);
    handleImageIndexChange(newIndex);
  };

  const handleImageViewClose = () => {
    setIsImageViewVisible(false);
    // Reset current photo to avoid showing wrong info
    setCurrentPhoto(null);
  };

  // Removed info button handler

  // =========================
  // 4. RENDER METHODS
  // =========================
  
  const renderSectionHeader = ({ section: { title, data } }) => {
    // Count actual photos, not rows
    const actualPhotoCount = data.reduce((total, row) => {
      return total + (Array.isArray(row) ? row.length : 1);
    }, 0);
    
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionHeaderText}>{title}</Text>
        <Text style={styles.sectionHeaderCount}>{actualPhotoCount} ảnh</Text>
      </View>
    );
  };





  const renderPhotoCard = (photo) => {
    const isSelected = selectedPhotos.has(photo._id);
    const isDownloading = downloadingPhotos.has(photo._id);
    const downloadProgressValue = downloadProgress[photo._id] || 0;

    const handlePress = () => {
      if (isSelectionMode) {
        togglePhotoSelection(photo._id);
      } else {
        handlePhotoPress(photo);
      }
    };

    // Removed info press handler

    const handleDownloadPress = (e) => {
      e.stopPropagation();
      downloadSinglePhoto(photo);
    };

    return (
      <TouchableOpacity 
        style={[
          styles.photoItem, 
          isSelected && styles.photoItemSelected
        ]} 
        onPress={handlePress} 
        activeOpacity={0.85}
      >
        <View style={styles.photoCard}>
          {getImageUriHelper(photo.file_path) ? (
          <Image
            source={{ uri: getImageUriHelper(photo.file_path) }}
            style={styles.photoImage}
            resizeMode="cover"
            fadeDuration={0}
              onError={() => {
                // Silently handle image load errors - no need to log everything
                // This is normal when some images don't exist on server
              }}
              onLoad={() => {
                // Only log successful loads in development
                if (__DEV__) {
                  console.log('Image loaded successfully:', photo.file_path);
                }
              }}
            />
          ) : (
            <View style={styles.imageErrorContainer}>
              <MaterialIcons name="broken-image" size={40} color="#ccc" />
              <Text style={styles.imageErrorText}>Ảnh không khả dụng</Text>
            </View>
          )}
          
          {/* Selection overlay */}
          {isSelectionMode && (
            <View style={styles.selectionOverlay}>
              <View style={[
                styles.selectionCheckbox,
                isSelected && styles.selectionCheckboxSelected
              ]}>
                {isSelected && (
                  <MaterialIcons name="check" size={18} color="#fff" />
                )}
              </View>
            </View>
          )}

          {/* Download progress overlay */}
          {isDownloading && (
            <View style={styles.downloadOverlay}>
              <View style={styles.downloadProgressContainer}>
                <View style={styles.downloadProgressBar}>
                  <View 
                    style={[
                      styles.downloadProgressFill, 
                      { width: `${downloadProgressValue * 100}%` }
                    ]} 
                  />
                </View>
                <Text style={styles.downloadProgressText}>
                  {Math.round(downloadProgressValue * 100)}%
                </Text>
              </View>
            </View>
          )}

          <View style={styles.photoTimeStamp}>
            <Text style={styles.timeStampText}>
              {photo.taken_date
                ? new Date(photo.taken_date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })
                : '--:--'}
            </Text>
          </View>

          {/* Action buttons */}
          <View style={styles.photoActionButtons}>
            {!isSelectionMode && (
              <TouchableOpacity 
                style={styles.photoDownloadButton} 
                onPress={handleDownloadPress}
                disabled={isDownloading}
                activeOpacity={0.8}
              >
                <MaterialIcons 
                  name={isDownloading ? "hourglass-empty" : "download"} 
                  size={16} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
            {/* Removed info button */}
          </View>
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
      <SafeAreaView style={styles.loadingContainer} edges={['top']}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thư viện ảnh...</Text>
      </SafeAreaView>
    );
  }

  // Empty state when no photos
  if (photos.length === 0) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
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
    <SafeAreaView style={styles.container} edges={['top']}>
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
            <View style={styles.headerActions}>
              {isSelectionMode && (
                <TouchableOpacity
                  style={styles.downloadButton}
                  onPress={downloadMultiplePhotos}
                  disabled={selectedPhotos.size === 0 || downloadingPhotos.size > 0}
                >
                  <MaterialIcons 
                    name="download" 
                    size={24} 
                    color={selectedPhotos.size === 0 || downloadingPhotos.size > 0 ? "#ccc" : COLORS.primary} 
                  />
                  {selectedPhotos.size > 0 && (
                    <View style={styles.downloadBadge}>
                      <Text style={styles.downloadBadgeText}>{selectedPhotos.size}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={[
                  styles.selectionButton,
                  isSelectionMode && styles.selectionButtonActive
                ]}
                onPress={toggleSelectionMode}
              >
                <MaterialIcons 
                  name={isSelectionMode ? "close" : "select-all"} 
                  size={24} 
                  color={isSelectionMode ? "#fff" : "#333"} 
                />
              </TouchableOpacity>
            </View>
      </View>
      
          {isSelectionMode && (
            <View style={styles.selectionBar}>
              <View style={styles.selectionInfo}>
                <Text style={styles.selectionText}>
                  Đã chọn {selectedPhotos.size} ảnh
                </Text>
              </View>
              <View style={styles.selectionActions}>
                <TouchableOpacity
                  style={styles.selectionActionButton}
                  onPress={selectAllPhotos}
                >
                  <Text style={styles.selectionActionText}>Chọn tất cả</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.selectionActionButton}
                  onPress={deselectAllPhotos}
                >
                  <Text style={styles.selectionActionText}>Bỏ chọn</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
      
          <Searchbar
            placeholder="Tìm kiếm theo tên cư dân, hoạt động, địa điểm..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
            icon="magnify"
            clearIcon="close-circle"
            onClearIconPress={() => setSearchQuery('')}
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
              }}
            >
              <MaterialIcons name="clear" size={20} color={COLORS.primary} />
              <Text style={styles.clearFiltersButtonText}>Xóa tìm kiếm</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Enhanced Image Viewer Modal - Cross Platform Compatible */}
        <Modal
          visible={isImageViewVisible}
          transparent={Platform.OS === 'ios'}
          animationType={Platform.OS === 'ios' ? 'fade' : 'slide'}
          onRequestClose={handleImageViewClose}
          hardwareAccelerated={Platform.OS === 'android'}
          statusBarTranslucent={Platform.OS === 'android'}
        >
          <View style={[
            styles.imageViewerContainer,
            Platform.OS === 'android' && styles.imageViewerContainerAndroid
          ]}>
            {/* Header with close button and image counter */}
            <View style={styles.imageViewerHeader}>
              <TouchableOpacity 
                style={styles.imageViewerCloseButton}
                onPress={handleImageViewClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="close" size={28} color="#fff" />
              </TouchableOpacity>
              <Text style={styles.imageViewerCounter}>
                {currentImageIndex + 1} / {allImages.length}
              </Text>
                          <View style={{ width: 40 }} />
            </View>

            {/* Navigation arrows */}
            {currentImageIndex > 0 && (
                  <TouchableOpacity 
                style={styles.imageViewerNavButton}
                    onPress={handlePrevImage}
                    activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                <MaterialIcons name="chevron-left" size={30} color="#fff" />
                  </TouchableOpacity>
                )}
            
            {currentImageIndex < allImages.length - 1 && (
                  <TouchableOpacity 
                style={[styles.imageViewerNavButton, styles.imageViewerNavButtonRight]}
                    onPress={handleNextImage}
                    activeOpacity={0.8}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                <MaterialIcons name="chevron-right" size={30} color="#fff" />
                  </TouchableOpacity>
                )}

            {/* Main image with platform-specific optimizations */}
            <View style={styles.imageViewerMainContainer}>
              {allImages.length > 0 && allImages[currentImageIndex] && getImageUriHelper(allImages[currentImageIndex].file_path) ? (
                <>
                  <Image
                    source={{ 
                      uri: getImageUriHelper(allImages[currentImageIndex].file_path),
                      // Android-specific optimizations
                      ...(Platform.OS === 'android' && {
                        cache: 'force-cache',
                        fadeDuration: 0,
                      })
                    }}
                    style={styles.imageViewerImage}
                    resizeMode="contain"
                    onLoadStart={() => {
                      // Only log in development
                      if (__DEV__) {
                        console.log('Image loading started');
                      }
                    }}
                    onLoad={() => {
                      // Only log in development
                      if (__DEV__) {
                        console.log('Image loaded successfully');
                      }
                    }}
                    onError={() => {
                      // Silently handle image load errors in image viewer
                      // This is normal when some images don't exist on server
                    }}
                    // Android performance improvements
                    {...(Platform.OS === 'android' && {
                      progressiveRenderingEnabled: true,
                      resizeMethod: 'resize',
                    })}
                  />
                </>
              ) : (
                <View style={styles.modalImageErrorContainer}>
                  <MaterialIcons name="broken-image" size={80} color="#ccc" />
                  <Text style={styles.modalImageErrorText}>Ảnh không khả dụng</Text>
                  <Text style={styles.modalImageErrorSubtext}>
                    Ảnh này có thể đã bị xóa hoặc không tồn tại trên server
                </Text>
                </View>
              )}
            </View>

            {/* Image info panel (caption + metadata) */}
                {currentPhoto && (
              <View style={styles.imageInfoContainer}>
                    {!!currentPhoto.caption && (
                  <Text style={[styles.imageInfoText, { fontWeight: '600' }]} numberOfLines={2}>
                        {currentPhoto.caption}
                      </Text>
                    )}
                <Text style={styles.imageInfoText}>
                  <Text style={styles.imageInfoLabel}>Cư dân: </Text>
                  {getResidentDisplayName(currentPhoto)}
                    </Text>
                <Text style={styles.imageInfoText}>
                  <Text style={styles.imageInfoLabel}>Người đăng: </Text>
                  {(() => {
                    try {
                      if (currentPhoto.uploaded_by) {
                        if (typeof currentPhoto.uploaded_by === 'string') {
                          return currentPhoto.uploaded_by;
                        } else if (currentPhoto.uploaded_by.full_name) {
                          return currentPhoto.uploaded_by.full_name;
                        } else if (currentPhoto.uploaded_by.username) {
                          return currentPhoto.uploaded_by.username;
                        }
                      }
                      return 'Không xác định';
                    } catch (error) {
                      return 'Không xác định';
                    }
                  })()}
                    </Text>
                <Text style={styles.imageInfoText}>
                  <Text style={styles.imageInfoLabel}>Thời gian: </Text>
                    {(() => {
                    try {
                      if (currentPhoto.taken_date) {
                        const date = new Date(currentPhoto.taken_date);
                        if (!isNaN(date.getTime())) {
                          return date.toLocaleString('vi-VN');
                        }
                      }
                      return 'Không xác định';
                    } catch (error) {
                      return 'Không xác định';
                    }
                  })()}
                </Text>
                {(() => {
                  try {
                      const ra = currentPhoto.related_activity_id;
                      const location = ra?.location || currentPhoto.location;
                      const activity = ra?.activity_type || ra?.activity_name || currentPhoto.activity_type;
                      return (
                        <>
                        <Text style={styles.imageInfoText}>
                          <Text style={styles.imageInfoLabel}>Địa điểm: </Text>
                          {location || 'Không xác định'}
                        </Text>
                        <Text style={styles.imageInfoText}>
                          <Text style={styles.imageInfoLabel}>Hoạt động: </Text>
                          {getActivityDisplayName(currentPhoto)}
                        </Text>
                        </>
                      );
                  } catch (error) {
                    return (
                      <>
                        <Text style={styles.imageInfoText}>
                          <Text style={styles.imageInfoLabel}>Địa điểm: </Text>
                          Không xác định
                        </Text>
                        <Text style={styles.imageInfoText}>
                          <Text style={styles.imageInfoLabel}>Hoạt động: </Text>
                          Không xác định
                        </Text>
                      </>
                    );
                  }
                    })()}
                {(() => {
                  try {
                    if (currentPhoto.related_activity_id?.description) {
                      return (
                        <Text style={styles.imageInfoText} numberOfLines={3}>
                          <Text style={styles.imageInfoLabel}>Mô tả: </Text>
                          {currentPhoto.related_activity_id.description}
                      </Text>
                      );
                    }
                    return null;
                  } catch (error) {
                    return null;
                  }
                })()}
                {(() => {
                  try {
                    if (currentPhoto.tags && Array.isArray(currentPhoto.tags) && currentPhoto.tags.length > 0) {
                      return (
                        <View style={styles.imageViewerTagsRow}>
                        {currentPhoto.tags.slice(0, 3).map((tag, idx) => (
                            <View key={idx} style={styles.imageViewerTagChip}>
                              <Text style={styles.imageViewerTagText} numberOfLines={1}>{tag || 'Tag'}</Text>
                          </View>
                        ))}
                      </View>
                      );
                    }
                    return null;
                  } catch (error) {
                    return null;
                  }
                })()}
                  </View>
                )}
              </View>
        </Modal>

        {/* Removed bottom sheet for photo details */}

        {/* Removed photo detail modal */}

        {/* Removed advanced search filters */}
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  // Removed filter button styles
  selectionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  selectionButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIDE_PADDING,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  selectionInfo: {
    flex: 1,
    marginRight: 10,
  },
  selectionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  selectionActions: {
    flexDirection: 'row',
  },
  selectionActionButton: {
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: COLORS.primary + '10',
    marginLeft: 10,
  },
  selectionActionText: {
    color: COLORS.primary,
    fontSize: 14,
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
  photoItemSelected: {
    borderWidth: 2,
    borderColor: COLORS.primary,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 30,
    height: 30,
    borderRadius: 15,
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

  // Image Info Container (for image viewer)
  imageInfoContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    padding: 10,
  },
  imageInfoText: {
    color: '#fff',
    fontSize: 13,
    marginBottom: 4,
  },
  imageInfoLabel: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  imageViewerTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 6,
  },
  imageViewerTagChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  imageViewerTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },

  // Removed bottom sheet and modal styles

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
  downloadButton: {
    position: 'relative',
    padding: 8,
  },
  downloadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  downloadBadgeText: {
    color: '#fff',
    fontSize: 12,
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

  // Selection Overlay
  selectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  selectionCheckbox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCheckboxSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  // Download Overlay
  downloadOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  downloadProgressContainer: {
    width: '80%',
    alignItems: 'center',
  },
  downloadProgressBar: {
    width: '100%',
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 10,
  },
  downloadProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 5,
  },
  downloadProgressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  photoActionButtons: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    zIndex: 2,
  },
  photoDownloadButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  
  // Image Error Styles
  imageErrorContainer: {
    width: '100%',
    aspectRatio: 4/3,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderStyle: 'dashed',
  },
  imageErrorText: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 8,
    textAlign: 'center',
  },
  modalImageErrorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalImageErrorText: {
    fontSize: 18,
    color: '#6c757d',
    marginTop: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  modalImageErrorSubtext: {
    fontSize: 14,
    color: '#adb5bd',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 20,
  },

  // Enhanced Image Viewer Styles - Cross Platform
  imageViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
  },
  imageViewerContainerAndroid: {
    backgroundColor: '#000',
  },
  imageViewerHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 40 : 20,
    left: 20,
    right: 20,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  imageViewerCloseButton: {
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
  },
  imageViewerCounter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  // Removed info button style
  imageViewerNavButton: {
    position: 'absolute',
    left: 20,
    top: '50%',
    zIndex: 2,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
  },
  imageViewerNavButtonRight: {
    left: 'auto',
    right: 20,
  },
  imageViewerMainContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 120,
  },
  imageViewerImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
  },
  
  // Android-specific loading styles
  androidLoadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    zIndex: 1,
  },
  androidLoadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
  },
});

export default FamilyPhotoGalleryScreen; 