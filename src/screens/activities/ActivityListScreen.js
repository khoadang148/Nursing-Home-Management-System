import React, { useEffect, useState } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import { 
  Appbar, 
  Card, 
  Text, 
  Button, 
  Chip, 
  IconButton,
  FAB, 
  Searchbar,
  SegmentedButtons
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities } from '../../redux/slices/activitySlice';

const ActivityListScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);
  
  const { activities, loading } = useSelector((state) => state.activities);
  
  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);
  
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchActivities()).finally(() => setRefreshing(false));
  };
  
  const filteredActivities = activities
    .filter(activity => {
      // Filter by search query
      if (searchQuery) {
        return activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               activity.description.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    })
    .filter(activity => {
      const today = new Date();
      const activityDate = new Date(activity.scheduledTime);
      
      // Apply date filter
      switch (filter) {
        case 'today':
          return activityDate.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
        case 'upcoming':
          return activityDate >= today;
        case 'past':
          return activityDate < today;
        default:
          return true;
      }
    });
  
  const getActivityIcon = (type) => {
    switch (type.toLowerCase()) {
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
    const activityDate = new Date(item.scheduledTime);
    const formattedTime = activityDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const formattedDate = activityDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

    return (
      <TouchableOpacity onPress={() => navigation.navigate('ActivityDetails', { activityId: item.id })}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.activityHeader}>
              <View style={styles.activityTypeIcon}>
                {getActivityIcon(item.type)}
              </View>
              <View style={styles.activityInfo}>
                <Text style={FONTS.h4}>{item.name}</Text>
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
              {item.description}
            </Text>
            
            <View style={styles.tagsContainer}>
              <Chip 
                icon="map-marker" 
                mode="outlined" 
                style={styles.chip}>
                {item.location}
              </Chip>
              <Chip 
                icon="account-group" 
                mode="outlined" 
                style={styles.chip}>
                {item.participants} participants
              </Chip>
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.Content title="Activities" titleStyle={FONTS.h2} />
        <Appbar.Action icon="calendar" onPress={() => navigation.navigate('ActivityCalendar')} />
        <Appbar.Action icon="filter-variant" onPress={() => {}} />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search activities"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={[
          {
            value: 'today',
            label: 'Today',
            icon: 'calendar-today',
          },
          {
            value: 'upcoming',
            label: 'Upcoming',
            icon: 'calendar-clock',
          },
          {
            value: 'past',
            label: 'Past',
            icon: 'calendar-check',
          },
        ]}
        style={styles.segmentedButtons}
      />
      
      <FlatList
        data={filteredActivities}
        renderItem={renderActivityItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color={COLORS.disabled} />
            <Text style={styles.emptyText}>No activities found</Text>
            <Text style={styles.emptySubText}>Try changing your filters or create a new activity</Text>
          </View>
        }
      />
      
      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateActivity')}
        color={COLORS.surface}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    paddingBottom: 80, // Space for FAB
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
});

export default ActivityListScreen; 