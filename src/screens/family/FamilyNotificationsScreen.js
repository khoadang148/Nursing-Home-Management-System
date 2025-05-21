import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { ActivityIndicator, Chip, Divider, Menu, IconButton, Card, Title, Paragraph, Badge, Button } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

// Import constants
import { COLORS, FONTS } from '../../constants/theme';

// Mock notifications data - in a real app this would come from an API
const mockNotifications = [
  {
    id: '1',
    title: 'Medication Update',
    message: 'Blood pressure medication was administered at 9:00 AM.',
    type: 'medication',
    date: '2023-11-12T09:15:00Z',
    read: false,
    priority: 'normal'
  },
  {
    id: '2',
    title: 'Health Update',
    message: 'Routine vital signs check completed. Everything looks normal.',
    type: 'health',
    date: '2023-11-11T14:30:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '3',
    title: 'Activity Participation',
    message: 'Participated in group music therapy and showed excellent engagement.',
    type: 'activity',
    date: '2023-11-10T11:45:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '4',
    title: 'Visit Confirmed',
    message: 'Your visit request for November 15th at 2:00 PM has been confirmed.',
    type: 'visit',
    date: '2023-11-09T16:20:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '5',
    title: 'Doctor Visit Scheduled',
    message: 'Routine check-up with Dr. Johnson scheduled for November 20th at 10:00 AM.',
    type: 'appointment',
    date: '2023-11-08T13:10:00Z',
    read: true,
    priority: 'high'
  },
  {
    id: '6',
    title: 'Meal Preferences Updated',
    message: 'Dietary preferences have been updated to include more vegetable options.',
    type: 'general',
    date: '2023-11-07T10:30:00Z',
    read: true,
    priority: 'low'
  },
  {
    id: '7',
    title: 'Photo Added',
    message: 'New photos from the Birthday Celebration have been added to the gallery.',
    type: 'photo',
    date: '2023-11-05T15:45:00Z',
    read: true,
    priority: 'normal'
  },
  {
    id: '8',
    title: 'Medication Change',
    message: 'Doctor has prescribed a new medication for blood pressure management.',
    type: 'medication',
    date: '2023-11-04T09:20:00Z',
    read: true,
    priority: 'high'
  },
];

const FamilyNotificationsScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });
  
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: 'Unread' },
    { id: 'health', label: 'Health' },
    { id: 'medication', label: 'Medication' },
    { id: 'activity', label: 'Activities' },
    { id: 'visit', label: 'Visits' },
    { id: 'appointment', label: 'Appointments' },
  ];
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would filter notifications by the user's ID and resident
    setNotifications(mockNotifications);
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If the notification is from today, only show the time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    
    // If the notification is from yesterday, show "Yesterday"
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    // If the notification is from this year, show the month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Otherwise, show the full date
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'medication':
        return <FontAwesome5 name="pills" size={20} color={COLORS.primary} />;
      case 'health':
        return <FontAwesome5 name="heartbeat" size={20} color={COLORS.error} />;
      case 'activity':
        return <MaterialIcons name="directions-run" size={20} color={COLORS.accent} />;
      case 'visit':
        return <MaterialIcons name="event" size={20} color={COLORS.secondary} />;
      case 'appointment':
        return <MaterialIcons name="event-available" size={20} color={COLORS.info} />;
      case 'photo':
        return <MaterialIcons name="photo" size={20} color={COLORS.success} />;
      default:
        return <MaterialIcons name="notifications" size={20} color={COLORS.textSecondary} />;
    }
  };
  
  const handleNotificationPress = (notification) => {
    // If notification is unread, mark it as read
    if (!notification.read) {
      const updatedNotifications = notifications.map(n => 
        n.id === notification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
      
      // In a real app, we would call an API to mark it as read
      // dispatch(markNotificationAsRead(notification.id));
    }
    
    // Navigate based on notification type
    switch (notification.type) {
      case 'medication':
        // Navigate to medication details
        break;
      case 'health':
        // Navigate to health details
        break;
      case 'activity':
        // Navigate to activity details
        break;
      case 'visit':
        navigation.navigate('Visits');
        break;
      case 'appointment':
        // Navigate to appointment details
        break;
      case 'photo':
        navigation.navigate('Gallery');
        break;
      default:
        // Do nothing special
        break;
    }
  };
  
  const handleNotificationLongPress = (notification, event) => {
    // Get the position of the long press for the menu
    setMenuPosition({
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    });
    
    setSelectedNotification(notification);
    setMenuVisible(true);
  };
  
  const handleMarkAsRead = () => {
    if (selectedNotification) {
      const updatedNotifications = notifications.map(n => 
        n.id === selectedNotification.id ? { ...n, read: true } : n
      );
      setNotifications(updatedNotifications);
    }
    
    setMenuVisible(false);
  };
  
  const handleMarkAllAsRead = () => {
    const updatedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updatedNotifications);
    
    // In a real app, we would call an API to mark all as read
    // dispatch(markAllNotificationsAsRead());
  };
  
  const filterNotifications = (notifications) => {
    if (activeFilter === 'all') return notifications;
    if (activeFilter === 'unread') return notifications.filter(n => !n.read);
    
    return notifications.filter(n => n.type === activeFilter);
  };
  
  const renderNotificationItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification
      ]}
      onPress={() => handleNotificationPress(item)}
      onLongPress={(event) => handleNotificationLongPress(item, event)}
    >
      <View style={styles.notificationIconContainer}>
        {getNotificationIcon(item.type)}
        {!item.read && <View style={styles.unreadIndicator} />}
      </View>
      <View style={styles.notificationContent}>
        <View style={styles.notificationHeader}>
          <Text 
            style={[
              styles.notificationTitle,
              !item.read && styles.unreadText
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.notificationTime}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text 
          style={[
            styles.notificationMessage,
            !item.read && styles.unreadText
          ]}
          numberOfLines={2}
        >
          {item.message}
        </Text>
        {item.priority === 'high' && (
          <Chip 
            style={styles.priorityChip} 
            textStyle={{ color: COLORS.error, fontSize: 12 }}
            icon={() => <MaterialIcons name="priority-high" size={16} color={COLORS.error} />}
          >
            High Priority
          </Chip>
        )}
      </View>
    </TouchableOpacity>
  );
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Loading notifications...</Text>
      </SafeAreaView>
    );
  }
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity 
            style={styles.markAllReadButton}
            onPress={handleMarkAllAsRead}
          >
            <Text style={styles.markAllReadText}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Filter Chips */}
      <FlatList
        data={filters}
        renderItem={({ item }) => (
          <Chip
            selected={activeFilter === item.id}
            style={styles.filterChip}
            onPress={() => setActiveFilter(item.id)}
            selectedColor={COLORS.primary}
          >
            {item.label}
            {item.id === 'unread' && unreadCount > 0 && ` (${unreadCount})`}
          </Chip>
        )}
        keyExtractor={item => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
      />
      
      {/* Notifications List */}
      <FlatList
        data={filterNotifications(notifications)}
        renderItem={renderNotificationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.notificationList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ItemSeparatorComponent={() => <Divider style={styles.divider} />}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="notifications-off" size={60} color={COLORS.border} />
            <Text style={styles.emptyText}>No notifications found</Text>
          </View>
        }
      />
      
      {/* Context Menu */}
      <Menu
        visible={menuVisible}
        onDismiss={() => setMenuVisible(false)}
        anchor={menuPosition}
      >
        <Menu.Item 
          onPress={handleMarkAsRead} 
          title="Mark as read" 
          leadingIcon="check"
        />
      </Menu>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
  },
  markAllReadButton: {
    padding: 8,
  },
  markAllReadText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  filtersContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  filterChip: {
    marginRight: 8,
  },
  notificationList: {
    paddingHorizontal: 16,
    paddingBottom: 100, // Tăng padding cho thanh tab bar cao hơn
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  unreadNotification: {
    backgroundColor: COLORS.primary + '10',
  },
  notificationIconContainer: {
    marginRight: 12,
    position: 'relative',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  notificationTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '400',
    flex: 1,
    marginRight: 8,
  },
  notificationTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  notificationMessage: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 6,
  },
  unreadText: {
    fontWeight: '500',
  },
  priorityChip: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.error + '15',
    marginTop: 4,
  },
  divider: {
    height: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    marginTop: 80,
  },
  emptyText: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
});

export default FamilyNotificationsScreen; 