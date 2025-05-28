import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  Chip,
  IconButton,
  Button,
} from 'react-native-paper';
import { MaterialIcons, Ionicons, FontAwesome } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Get screen dimensions
const { width } = Dimensions.get('window');
const numColumns = 3;
const photoSize = (width - 48) / numColumns;

// Mock photo data - in a real app this would come from an API
const mockPhotos = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1573056019137-d8576a36d23c',
    thumbnail: 'https://images.unsplash.com/photo-1573056019137-d8576a36d23c?w=200',
    title: 'Nhóm Tập Thể Dục Buổi Sáng',
    date: '2023-11-10T09:30:00Z',
    description: 'Ông John tham gia hoạt động tập thể dục buổi sáng',
    likes: 3,
    liked: false,
    tags: ['Hoạt động', 'Thể dục', 'Nhóm'],
    albumId: '1'
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507',
    thumbnail: 'https://images.unsplash.com/photo-1573497491208-6b1acb260507?w=200',
    title: 'Buổi Trị Liệu Nghệ Thuật',
    date: '2023-11-08T14:15:00Z',
    description: 'Ông John đã tạo ra một bức tranh tuyệt đẹp trong buổi trị liệu nghệ thuật',
    likes: 5,
    liked: true,
    tags: ['Hoạt động', 'Nghệ thuật', 'Sáng tạo'],
    albumId: '2'
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd',
    thumbnail: 'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=200',
    title: 'Câu Lạc Bộ Làm Vườn',
    date: '2023-11-05T10:45:00Z',
    description: 'Ông John giúp trồng hoa mới trong khu vườn cộng đồng',
    likes: 2,
    liked: false,
    tags: ['Hoạt động', 'Làm vườn', 'Ngoài trời'],
    albumId: '3'
  },
  {
    id: '4',
    url: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
    thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=200',
    title: 'Trị Liệu Âm Nhạc',
    date: '2023-11-03T15:30:00Z',
    description: 'Ông John thưởng thức buổi trị liệu âm nhạc với nghệ sĩ piano',
    likes: 4,
    liked: false,
    tags: ['Hoạt động', 'Âm nhạc', 'Giải trí'],
    albumId: '4'
  },
  {
    id: '5',
    url: 'https://images.unsplash.com/photo-1581285690158-f4995af90ee6',
    thumbnail: 'https://images.unsplash.com/photo-1581285690158-f4995af90ee6?w=200',
    title: 'Tiệc Sinh Nhật',
    date: '2023-11-01T12:00:00Z',
    description: 'Ông John ăn mừng sinh nhật cùng bạn bè và nhân viên',
    likes: 8,
    liked: true,
    tags: ['Lễ kỷ niệm', 'Xã hội', 'Đặc biệt'],
    albumId: '5'
  },
  {
    id: '6',
    url: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea',
    thumbnail: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=200',
    title: 'Thăm Viếng Gia Đình',
    date: '2023-10-28T11:15:00Z',
    description: 'Ông John trong chuyến thăm gần đây của gia đình',
    likes: 6,
    liked: true,
    tags: ['Gia đình', 'Thăm viếng', 'Xã hội'],
    albumId: '6'
  },
  {
    id: '7',
    url: 'https://images.unsplash.com/photo-1486308510493-aa64833637bc',
    thumbnail: 'https://images.unsplash.com/photo-1486308510493-aa64833637bc?w=200',
    title: 'Đêm Bingo',
    date: '2023-10-25T18:30:00Z',
    description: 'Ông John chiến thắng trong đêm bingo hàng tuần',
    likes: 3,
    liked: false,
    tags: ['Hoạt động', 'Trò chơi', 'Xã hội'],
    albumId: '7'
  },
  {
    id: '8',
    url: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0',
    thumbnail: 'https://images.unsplash.com/photo-1514896856000-91cb6de818e0?w=200',
    title: 'Chiều Xem Phim',
    date: '2023-10-22T14:00:00Z',
    description: 'Ông John xem phim kinh điển cùng các cư dân khác',
    likes: 2,
    liked: false,
    tags: ['Giải trí', 'Xã hội', 'Hoạt động'],
    albumId: '8'
  },
  {
    id: '9',
    url: 'https://images.unsplash.com/photo-1426901555017-5a600ff9233f',
    thumbnail: 'https://images.unsplash.com/photo-1426901555017-5a600ff9233f?w=200',
    title: 'Đi Bộ Ngoài Trời',
    date: '2023-10-20T09:45:00Z',
    description: 'Ông John tận hưởng không khí trong lành trong buổi đi bộ sáng',
    likes: 4,
    liked: false,
    tags: ['Hoạt động', 'Ngoài trời', 'Thể dục'],
    albumId: '9'
  },
];

// Mock album data
const mockAlbums = [
  { id: 'all', name: 'Tất cả ảnh' },
  { id: 'recent', name: 'Gần đây' },
  { id: 'activities', name: 'Hoạt động' },
  { id: 'family', name: 'Thăm viếng gia đình' },
  { id: 'events', name: 'Sự kiện' },
];

const FamilyPhotoGalleryScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [photos, setPhotos] = useState([]);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [albums, setAlbums] = useState([]);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would filter photos by the user's resident
    setPhotos(mockPhotos);
    setAlbums(mockAlbums);
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const handlePhotoPress = (photo) => {
    setSelectedPhoto(photo);
    setModalVisible(true);
  };
  
  const handleLikePress = (photoId) => {
    setPhotos(photos.map(photo => {
      if (photo.id === photoId) {
        return {
          ...photo,
          liked: !photo.liked,
          likes: photo.liked ? photo.likes - 1 : photo.likes + 1
        };
      }
      return photo;
    }));
  };
  
  const filterPhotos = (photos) => {
    if (selectedFilter === 'all') return photos;
    if (selectedFilter === 'recent') {
      return photos.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);
    }
    return photos.filter(photo => 
      photo.tags.some(tag => tag.toLowerCase().includes(selectedFilter.toLowerCase()))
    );
  };
  
  const renderPhotoItem = ({ item }) => (
    <TouchableOpacity
      style={styles.photoItem}
      onPress={() => handlePhotoPress(item)}
    >
      <Image
        source={{ uri: item.thumbnail }}
        style={styles.thumbnail}
        resizeMode="cover"
      />
      <View style={styles.photoOverlay}>
        <Text style={styles.photoDate}>{formatDate(item.date).split(',')[0]}</Text>
      </View>
    </TouchableOpacity>
  );
  
  const renderFilterItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedFilter(item.id)}
    >
      <Chip
        selected={selectedFilter === item.id}
        style={[
          styles.filterChip,
          selectedFilter === item.id && { backgroundColor: COLORS.primary }
        ]}
        textStyle={selectedFilter === item.id ? { color: COLORS.surface } : {}}
        mode="outlined"
      >
        {item.name}
      </Chip>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Đang tải thư viện ảnh...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thư Viện Ảnh</Text>
      </View>
      
      {/* Album Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={albums}
          renderItem={renderFilterItem}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>
      
      {/* Photo Grid */}
      <FlatList
        data={filterPhotos(photos)}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        contentContainerStyle={styles.photoGrid}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="photo-library" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>Không tìm thấy ảnh nào</Text>
          </View>
        }
      />
      
      {/* Photo Detail Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <IconButton
              icon="close"
              size={24}
              onPress={() => setModalVisible(false)}
              style={styles.closeButton}
              color={COLORS.surface}
            />
            
            {selectedPhoto && (
              <>
                <Image
                  source={{ uri: selectedPhoto.url }}
                  style={styles.fullImage}
                  resizeMode="contain"
                />
                
                <View style={styles.photoDetails}>
                  <Text style={styles.photoTitle}>{selectedPhoto.title}</Text>
                  <Text style={styles.photoDetailDate}>{formatDate(selectedPhoto.date)}</Text>
                  <Text style={styles.photoDescription}>{selectedPhoto.description}</Text>
                  
                  <View style={styles.photoActions}>
                    <TouchableOpacity
                      style={styles.likeButton}
                      onPress={() => handleLikePress(selectedPhoto.id)}
                    >
                      <Ionicons 
                        name={selectedPhoto.liked ? "heart" : "heart-outline"} 
                        size={24} 
                        color={selectedPhoto.liked ? COLORS.error : COLORS.text} 
                      />
                      <Text style={styles.likeCount}>{selectedPhoto.likes}</Text>
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                      <Ionicons name="share-social-outline" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    
                    <TouchableOpacity style={styles.actionButton}>
                      <MaterialIcons name="file-download" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                  
                  <View style={styles.tagsContainer}>
                    {selectedPhoto.tags.map((tag, index) => (
                      <Chip key={index} style={styles.tag}>
                        {tag}
                      </Chip>
                    ))}
                  </View>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  header: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  filtersContainer: {
    marginBottom: 8,
  },
  filtersList: {
    paddingHorizontal: 16,
  },
  filterChip: {
    marginRight: 8,
  },
  photoGrid: {
    padding: 12,
    paddingBottom: 100,
  },
  photoItem: {
    width: photoSize,
    height: photoSize,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  thumbnail: {
    width: '100%',
    height: '100%',
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    padding: 4,
    justifyContent: 'flex-end',
  },
  photoDate: {
    color: COLORS.surface,
    fontSize: 10,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    height: 300,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  fullImage: {
    width: '100%',
    height: '50%',
  },
  photoDetails: {
    width: '100%',
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
  },
  photoTitle: {
    ...FONTS.h3,
    marginBottom: 4,
  },
  photoDetailDate: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  photoDescription: {
    ...FONTS.body2,
    marginBottom: 16,
  },
  photoActions: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 24,
  },
  likeCount: {
    ...FONTS.body3,
    marginLeft: 4,
  },
  actionButton: {
    marginRight: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
});

export default FamilyPhotoGalleryScreen; 