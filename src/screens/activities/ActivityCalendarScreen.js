import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, StatusBar, FlatList, TouchableOpacity } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Appbar, Card, Text, Badge, Divider, ActivityIndicator } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivities } from '../../redux/slices/activitySlice';

const ActivityCalendarScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const { activities, loading } = useSelector((state) => state.activities);
  
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  
  useEffect(() => {
    dispatch(fetchActivities());
  }, [dispatch]);
  
  // Group activities by date and create marked dates object for calendar
  useEffect(() => {
    if (activities.length) {
      const newMarkedDates = {};
      
      activities.forEach(activity => {
        const activityDate = new Date(activity.scheduledTime).toISOString().split('T')[0];
        
        // Add dots for different activity types
        if (!newMarkedDates[activityDate]) {
          newMarkedDates[activityDate] = { dots: [] };
        }
        
        // Add dot based on activity type if not already present
        const typeExists = newMarkedDates[activityDate].dots.some(
          dot => dot.color === getActivityColor(activity.type)
        );
        
        if (!typeExists) {
          newMarkedDates[activityDate].dots.push({
            key: activity.type,
            color: getActivityColor(activity.type),
          });
        }
      });
      
      // Mark selected date
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: COLORS.primary,
      };
      
      setMarkedDates(newMarkedDates);
    }
  }, [activities, selectedDate]);
  
  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return COLORS.primary;
      case 'social': return COLORS.accent;
      case 'cognitive': return '#FF9500';
      case 'creative': return '#FF3B30';
      case 'spiritual': return '#5856D6';
      default: return COLORS.primary;
    }
  };
  
  // Filter activities for the selected date
  const selectedDateActivities = useMemo(() => {
    if (!selectedDate || !activities.length) return [];
    
    return activities.filter(activity => {
      const activityDate = new Date(activity.scheduledTime).toISOString().split('T')[0];
      return activityDate === selectedDate;
    }).sort((a, b) => {
      return new Date(a.scheduledTime) - new Date(b.scheduledTime);
    });
  }, [selectedDate, activities]);
  
  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchActivities()).finally(() => setRefreshing(false));
  };
  
  const handleDateChange = (date) => {
    setSelectedDate(date.dateString);
  };
  
  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const renderActivityItem = ({ item }) => (
    <TouchableOpacity 
      onPress={() => navigation.navigate('ActivityDetails', { activityId: item.id })}
      style={styles.activityItem}
    >
      <Card style={styles.activityCard}>
        <Card.Content>
          <View style={styles.activityHeader}>
            <View 
              style={[
                styles.activityTypeIndicator, 
                { backgroundColor: getActivityColor(item.type) }
              ]} 
            />
            <View style={styles.activityTime}>
              <Text style={styles.timeText}>{formatTime(item.scheduledTime)}</Text>
              <Text style={styles.durationText}>{item.durationMinutes} phút</Text>
            </View>
            <View style={styles.activityDetails}>
              <Text style={styles.activityTitle} numberOfLines={1}>{item.name}</Text>
              <Text style={styles.activityLocation} numberOfLines={1}>
                <MaterialIcons name="location-on" size={12} color={COLORS.textSecondary} />
                {' '}{item.location}
              </Text>
            </View>
            <Badge style={styles.participantsBadge}>
              {item.participants}
            </Badge>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );
  
  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialIcons name="event-busy" size={64} color={COLORS.disabled} />
      <Text style={styles.emptyText}>Không có hoạt động vào ngày này</Text>
      <TouchableOpacity 
        onPress={() => navigation.navigate('TaoHoatDong')}
        style={styles.createButton}
      >
        <Text style={styles.createButtonText}>Tạo hoạt động</Text>
      </TouchableOpacity>
    </View>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Lịch hoạt động" titleStyle={FONTS.h2} />
        <Appbar.Action icon="plus" onPress={() => navigation.navigate('TaoHoatDong')} />
      </Appbar.Header>
      
      <View style={styles.calendarContainer}>
        <Calendar
          current={selectedDate}
          onDayPress={handleDateChange}
          markingType={'multi-dot'}
          markedDates={markedDates}
          theme={{
            calendarBackground: COLORS.surface,
            textSectionTitleColor: COLORS.text,
            selectedDayBackgroundColor: COLORS.primary,
            selectedDayTextColor: '#ffffff',
            todayTextColor: COLORS.primary,
            dayTextColor: COLORS.text,
            textDisabledColor: COLORS.disabled,
            dotColor: COLORS.primary,
            selectedDotColor: '#ffffff',
            arrowColor: COLORS.primary,
            monthTextColor: COLORS.text,
            indicatorColor: COLORS.primary,
            textDayFontFamily: 'System',
            textMonthFontFamily: 'System',
            textDayHeaderFontFamily: 'System',
            textDayFontWeight: '300',
            textMonthFontWeight: 'bold',
            textDayHeaderFontWeight: '500',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14
          }}
        />
      </View>
      
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
          <Text style={styles.legendText}>Thể chất</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
          <Text style={styles.legendText}>Xã hội</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF9500' }]} />
          <Text style={styles.legendText}>Trí tuệ</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#FF3B30' }]} />
          <Text style={styles.legendText}>Sáng tạo</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#5856D6' }]} />
          <Text style={styles.legendText}>Tâm linh</Text>
        </View>
      </View>
      
      <Divider />
      
      <View style={styles.listContainer}>
        <View style={styles.listHeader}>
          <Text style={styles.listHeaderDate}>
            {new Date(selectedDate).toLocaleDateString([], { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric'
            })}
          </Text>
          <Text style={styles.listHeaderCount}>
            {selectedDateActivities.length} Hoạt động
          </Text>
        </View>
        
        <FlatList
          data={selectedDateActivities}
          renderItem={renderActivityItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.activitiesList}
          ListEmptyComponent={renderEmptyList}
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      </View>
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
  calendarContainer: {
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 4,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 4,
  },
  legendText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  listContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    ...SHADOWS.small,
  },
  listHeaderDate: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  listHeaderCount: {
    ...FONTS.body3,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  activitiesList: {
    padding: SIZES.padding,
    paddingBottom: 50,
  },
  activityItem: {
    marginBottom: SIZES.padding,
  },
  activityCard: {
    borderRadius: SIZES.radius * 1.5,
    ...SHADOWS.small,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTypeIndicator: {
    width: 4,
    height: '100%',
    borderTopLeftRadius: SIZES.radius,
    borderBottomLeftRadius: SIZES.radius,
    marginRight: 12,
  },
  activityTime: {
    width: 80,
  },
  timeText: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  durationText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  activityDetails: {
    flex: 1,
    marginRight: 16,
  },
  activityTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  activityLocation: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  participantsBadge: {
    backgroundColor: COLORS.primary + '20',
    color: COLORS.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  createButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  createButtonText: {
    ...FONTS.body2,
    color: COLORS.surface,
  },
});

export default ActivityCalendarScreen; 