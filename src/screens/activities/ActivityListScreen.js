import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar, 
  SafeAreaView, // thêm SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  Chip, 
  IconButton,
  FAB, 
  Searchbar,
  SegmentedButtons,
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import activityParticipationService from '../../api/services/activityParticipationService';

const ActivityListScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const user = useSelector((state) => state.auth.user);
  
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('today'); // Thay đổi từ 'upcoming' thành 'today'
  
  // Load activities from API
  const loadActivities = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        const response = await activityParticipationService.getUniqueActivitiesByStaffId(user.id);
        if (response.success) {
          console.log('✅ Unique activities loaded:', response.data.length, 'activities');
          console.log('✅ First unique activity sample:', response.data[0]);
          setActivities(response.data || []);
        } else {
          console.error('Failed to load activities:', response.error);
          setActivities([]);
        }
      }
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadActivities();
  }, [user?.id]);
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivities();
    setRefreshing(false);
  };
  
  // Categorize activities by date
  const categorizeActivities = (activities) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const categorized = {
      today: [],
      upcoming: [],
      past: []
    };
    
    activities.forEach(activity => {
      // Sử dụng date từ API response, không phải activity_id.date
      if (!activity.date) return;
      
      const activityDate = new Date(activity.date);
      activityDate.setHours(0, 0, 0, 0);
      
      if (activityDate.getTime() === today.getTime()) {
        categorized.today.push(activity);
      } else if (activityDate > today) {
        categorized.upcoming.push(activity);
      } else {
        categorized.past.push(activity);
      }
    });
    
    return categorized;
  };
  
  const categorizedActivities = categorizeActivities(activities);
  
  // Debug log
  console.log('📊 Categorized activities:', {
    today: categorizedActivities.today.length,
    upcoming: categorizedActivities.upcoming.length,
    past: categorizedActivities.past.length,
    total: activities.length
  });
  
  // Filter activities based on selected filter
  const getFilteredActivities = () => {
    let filtered = [];
    
    switch (filter) {
      case 'today':
        filtered = categorizedActivities.today;
        break;
      case 'upcoming':
        filtered = categorizedActivities.upcoming;
        break;
      case 'past':
        filtered = categorizedActivities.past;
        break;
      default:
        filtered = activities;
    }
    
    console.log('🔍 Filtered activities for', filter, ':', filtered.length);
    
    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(activity => {
        const activityName = activity.activity_id?.activity_name || '';
        const location = activity.activity_id?.location || '';
        return activityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
               location.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return filtered;
  };
  
  const filteredActivities = getFilteredActivities();
  
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical':
        return <MaterialIcons name="fitness-center" size={24} color={COLORS.primary} />;
      case 'social':
        return <MaterialIcons name="people" size={24} color={COLORS.accent} />;
      case 'cognitive':
        return <MaterialCommunityIcons name="brain" size={24} color="#FF9500" />;
      case 'creative':
        return <MaterialIcons name="brush" size={24} color="#FF3B30" />;
      case 'spiritual':
        return <MaterialCommunityIcons name="meditation" size={24} color="#5856D6" />;
      default:
        return <MaterialIcons name="event" size={24} color={COLORS.primary} />;
    }
  };
  
  const renderActivityItem = ({ item }) => {
    console.log('🎯 Rendering activity item:', {
      id: item._id,
      date: item.date,
      activity_id: item.activity_id,
      attendance_status: item.attendance_status
    });
    
    const activity = item.activity_id;
    
    // Sử dụng date từ item (API response), không phải activity.date
    const activityDate = new Date(item.date);
    const formattedTime = activityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = activityDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    // Fallback nếu không có activity_id hoặc activity_name
    const activityName = activity?.activity_name || 'Hoạt động không xác định';
    const activityDescription = activity?.description || 'Không có mô tả';
    const activityLocation = activity?.location || 'Chưa có địa điểm';
    const activityType = activity?.activity_type || 'general';

    return (
      <TouchableOpacity onPress={() => navigation.navigate('ChiTietHoatDong', { activityId: activity?._id || item._id })}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.activityHeader}>
              <View style={styles.activityTypeIcon}>
                {getActivityIcon(activityType)}
              </View>
              <View style={styles.activityInfo}>
                <Text style={FONTS.h4}>{activityName}</Text>
                <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                  {formattedDate} • {formattedTime}
                </Text>
              </View>
              <IconButton
                icon="chevron-right"
                size={24}
                iconColor={COLORS.primary}
              />
            </View>
            
            <Text style={[FONTS.body2, { marginTop: 8 }]} numberOfLines={2}>
              {activityDescription}
            </Text>
            
            <View style={styles.tagsContainer}>
              <Chip 
                icon="map-marker" 
                mode="outlined" 
                style={styles.chip}>
                {activityLocation}
              </Chip>
              <Chip 
                icon="clock" 
                mode="outlined" 
                style={styles.chip}>
                {activity.duration || 'Không xác định'} phút
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  // Thêm state cho tab filter
  const filterTabs = [
    { value: 'today', label: 'Hôm nay', icon: 'calendar-today' },
    { value: 'upcoming', label: 'Sắp tới', icon: 'calendar-clock' },
    { value: 'past', label: 'Đã qua', icon: 'calendar-check' },
  ];
  
  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={{ marginTop: 16, color: COLORS.textSecondary }}>Đang tải hoạt động...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header + Search + Filter block */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradientBlock}
      >
        {navigation.canGoBack && navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 12, left: 12, right: 12, bottom: 12 }}
          >
            <MaterialIcons name="arrow-back" size={28} color="#fff" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitleNew}>Hoạt Động</Text>
        <View style={styles.searchBoxWrapper}>
          <MaterialIcons name="search" size={22} color={COLORS.textSecondary} style={{ marginLeft: 10 }} />
        <Searchbar
          placeholder="Tìm kiếm hoạt động"
          onChangeText={setSearchQuery}
          value={searchQuery}
            style={styles.searchbarNew}
            inputStyle={{ fontSize: 16 }}
            iconColor="transparent"
        />
      </View>
        <View style={styles.filterTabsWrapper}>
          {filterTabs.map(tab => (
            <TouchableOpacity
              key={tab.value}
              style={[
                styles.filterTab,
                filter === tab.value && styles.filterTabActive
              ]}
              onPress={() => setFilter(tab.value)}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name={tab.icon} size={18} color={filter === tab.value ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.filterTabText, filter === tab.value && styles.filterTabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </LinearGradient>
      {/* Danh sách hoạt động */}
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityItem}
        keyExtractor={item => item._id || item.id}
        contentContainerStyle={styles.listContainerNew}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainerNew}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.disabled} />
            <Text style={styles.emptyTextNew}>Không tìm thấy hoạt động nào</Text>
            <Text style={styles.emptySubTextNew}>Thử thay đổi bộ lọc hoặc tạo hoạt động mới</Text>
            {/* Debug info */}
            <Text style={[styles.emptySubTextNew, { marginTop: 20, fontSize: 12 }]}>
              Tổng {activities.length} hoạt động duy nhất, Bộ lọc: {filter === 'today' ? 'Hôm nay' : filter === 'upcoming' ? 'Sắp tới' : 'Đã qua'}
            </Text>
            <Text style={[styles.emptySubTextNew, { fontSize: 12 }]}>
              Hôm nay: {categorizedActivities.today.length}, 
              Sắp tới: {categorizedActivities.upcoming.length}, 
              Đã qua: {categorizedActivities.past.length}
            </Text>
          </View>
        }
      />
      {/* Nút thêm hoạt động */}
      <TouchableOpacity
        style={styles.fabNew}
        onPress={() => navigation.navigate('TaoHoatDong')}
        activeOpacity={0.85}
      >
        <MaterialIcons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  headerBar: {
    backgroundColor: COLORS.primary,
    paddingTop: 16,
    paddingBottom: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    // Có thể thêm shadow nếu muốn nổi bật
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  searchContainer: {
    padding: SIZES.padding,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    ...SHADOWS.medium,
  },
  searchbar: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
  },
  segmentedButtons: {
    marginHorizontal: SIZES.padding,
    marginTop: SIZES.padding,
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: 60, 
  },
  card: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTypeIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SIZES.padding,
  },
  activityInfo: {
    flex: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...FONTS.h4,
    marginTop: 16,
    color: COLORS.textSecondary,
  },
  emptySubText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginHorizontal: SIZES.padding * 2,
    marginTop: 8,
  },
  gradientBlock: {
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingTop: 24,
    paddingBottom: 24,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  headerTitleNew: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 18,
    letterSpacing: 0.5,
  },
  searchBoxWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '90%',
    marginBottom: 18,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchbarNew: {
    backgroundColor: 'transparent',
    flex: 1,
    borderRadius: 18,
    elevation: 0,
    shadowOpacity: 0,
    marginLeft: 0,
  },
  filterTabsWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 16,
    padding: 4,
    marginTop: 2,
    marginBottom: 2,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 12,
    marginHorizontal: 2,
    backgroundColor: 'transparent',
  },
  filterTabActive: {
    backgroundColor: '#fff',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  filterTabText: {
    marginLeft: 6,
    color: COLORS.textSecondary,
    fontWeight: '600',
    fontSize: 15,
  },
  filterTabTextActive: {
    color: COLORS.primary,
  },
  listContainerNew: {
    padding: SIZES.padding,
    paddingBottom: 80,
  },
  emptyContainerNew: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTextNew: {
    ...FONTS.h4,
    marginTop: 16,
    color: COLORS.textSecondary,
    fontWeight: 'bold',
  },
  emptySubTextNew: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginHorizontal: SIZES.padding * 2,
    marginTop: 8,
  },
  fabNew: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    backgroundColor: COLORS.primary,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 24,
    zIndex: 10,
    padding: 4,
  },
});

export default ActivityListScreen; 