import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { useSelector } from 'react-redux';
// Native components
import NativeCard from '../../components/NativeCard';
import NativeButton from '../../components/NativeButton';
import NativeTextInput from '../../components/NativeTextInput';
import NativeModal from '../../components/NativeModal';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

// Import constants
import { COLORS, FONTS, SIZES } from '../../constants/theme';

// Import API service
import apiService from '../../api/apiService';

// Update mockVisits to match updated MongoDB schema structure (removed resident_id)
const mockVisits = [
  {
    id: '1',
    family_member_id: 'family1Id', // Will be replaced with actual ID from API
    visit_date: new Date('2023-11-15'),
    visit_time: '14:00',
    duration: 90,
    status: 'completed', // Updated to match new schema
    purpose: 'Thăm hỏi sức khỏe và mang quà',
    numberOfVisitors: 2,
    notes: 'Sẽ mang theo album ảnh'
  },
  {
    id: '2',
    family_member_id: 'family1Id',
    visit_date: new Date('2025-07-07'), // 7 days from now
    visit_time: '15:30',
    duration: 60,
    status: 'completed',
    purpose: 'Chúc mừng sinh nhật',
    numberOfVisitors: 3,
    notes: 'Mang theo bánh sinh nhật'
  },
  {
    id: '3',
    family_member_id: 'family1Id',
    visit_date: new Date('2023-10-30'),
    visit_time: '10:00',
    duration: 45,
    status: 'completed',
    purpose: 'Trao đổi với bác sĩ',
    numberOfVisitors: 1,
    notes: 'Đã ăn trưa cùng nhau'
  },
  // Add a future visit for testing upcoming visits section
  {
    id: '4',
    family_member_id: 'family1Id',
    visit_date: new Date('2025-07-07'), // Future date
    visit_time: '14:00',
    duration: 60,
    status: 'completed',
    purpose: 'Thăm định kỳ',
    numberOfVisitors: 2,
    notes: 'Lịch thăm định kỳ hàng tháng'
  }
];

const FamilyVisitScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // New visit form state
  const [showNewVisitModal, setShowNewVisitModal] = useState(false);
  const [visitDate, setVisitDate] = useState(new Date());
  const [visitTime, setVisitTime] = useState('09:00');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [visitorCount, setVisitorCount] = useState('1');
  const [visitNotes, setVisitNotes] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimeDropdown, setShowTimeDropdown] = useState(false);
  const [showPurposeDropdown, setShowPurposeDropdown] = useState(false);

  // Available time slots
  const timeSlots = [
    '09:00 - 10:00',
    '10:00 - 11:00', 
    '14:00 - 15:00',
    '15:00 - 16:00',
    '16:00 - 17:00'
  ];

  // Visit purposes
  const visitPurposes = [
    'Thăm hỏi sức khỏe',
    'Chúc mừng sinh nhật',
    'Mang quà và thức ăn',
    'Tham gia hoạt động',
    'Khác'
  ];
  
  // Add state to track if month changed
  const [forceUpdate, setForceUpdate] = useState(0);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  // Add API integration functions
  // Function to fetch visits from API
  const fetchVisits = async () => {
    setLoading(true);
    try {
      // In a real app, this would be an API call
      // const response = await apiService.getVisits(user.id);
      // setVisits(response.data);
      
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
      setVisits(mockVisits);
      
      // Create marked dates for the calendar
      const marked = {};
      mockVisits.forEach(visit => {
        marked[visit.visit_date.toISOString().split('T')[0]] = { 
          selected: true, 
          marked: true, 
          selectedColor: getStatusColor(visit.status),
        };
      });
      setMarkedDates(marked);
    } catch (error) {
      console.error('Error fetching visits:', error);
      Alert.alert('Lỗi', 'Không thể tải dữ liệu lịch thăm. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };
  
  // Function to create a new visit
  const createVisit = async (visitData) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiService.createVisit(visitData);
      // return response.data;
      
      // For now, simulate API response
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return {
        success: true,
        data: {
          id: (visits.length + 1).toString(),
          ...visitData
        }
      };
    } catch (error) {
      console.error('Error creating visit:', error);
      throw new Error('Không thể tạo lịch thăm. Vui lòng thử lại sau.');
    }
  };
  
  // Function to cancel a visit
  const cancelVisit = async (visitId) => {
    try {
      // In a real app, this would be an API call
      // const response = await apiService.cancelVisit(visitId);
      // return response.data;
      
      // For now, simulate API response
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      return { success: true };
    } catch (error) {
      console.error('Error cancelling visit:', error);
      throw new Error('Không thể hủy lịch thăm. Vui lòng thử lại sau.');
    }
  };
  
  // Replace loadData with fetchVisits
  const loadData = async () => {
    await fetchVisits();
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'Đã xác nhận':
        return COLORS.primary;
      case 'cancelled':
      case 'Đã hủy':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (timeString) => {
    if (!timeString) return '';
    const [hour, minute] = timeString.split(':');
    const time = new Date();
    time.setHours(parseInt(hour, 10));
    time.setMinutes(parseInt(minute, 10));
    return time.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };
  
  // Update getVisitsForSelectedDate to sort by time
  const getVisitsForSelectedDate = () => {
    if (!selectedDate) return [];
    return visits
      .filter(visit => visit.visit_date.toISOString().split('T')[0] === selectedDate)
      .sort((a, b) => {
        // Sort by time (earlier times first)
        const timeA = a.visit_time.split(':').map(Number);
        const timeB = b.visit_time.split(':').map(Number);
        
        // Compare hours first
        if (timeA[0] !== timeB[0]) {
          return timeA[0] - timeB[0];
        }
        
        // If hours are the same, compare minutes
        return timeA[1] - timeB[1];
      });
  };
  
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };
  
  const handleScheduleVisit = () => {
    setShowNewVisitModal(true);
    // Set minimum date to 24 hours from now
    const minDate = new Date();
    minDate.setDate(minDate.getDate() + 1); // Add 1 day (24 hours)
    setVisitDate(minDate);
    setVisitTime('09:00');
    setVisitPurpose('');
    setCustomPurpose('');
    setVisitorCount('1');
    setVisitNotes('');
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      // Ensure selected date is at least 24 hours from now
      const now = new Date();
      const minDate = new Date();
      minDate.setDate(now.getDate() + 1);
      
      if (selectedDate >= minDate) {
        setVisitDate(selectedDate);
      } else {
        Alert.alert('Lỗi', 'Chỉ được đặt lịch trước ít nhất 24 giờ. Vui lòng chọn ngày từ ngày mai trở đi.');
      }
    }
  };

  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'left') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
    
    // Clear selected date when changing months to avoid showing incorrect data
    setSelectedDate('');
    
    // Force update to refresh the calendar view and related data
    setForceUpdate(prev => prev + 1);
  };
  
  // Updated handleSubmitVisit to use the createVisit function
  const handleSubmitVisit = async () => {
    // Form validation
    if (!visitDate || !visitTime || !visitPurpose || !visitorCount) {
      Alert.alert('Lỗi xác thực', 'Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }

    if (visitPurpose === 'Khác' && !customPurpose.trim()) {
      Alert.alert('Lỗi xác thực', 'Vui lòng nhập mục đích thăm.');
      return;
    }
    
    const finalPurpose = visitPurpose === 'Khác' ? customPurpose : visitPurpose;
    const dateString = visitDate.toISOString().split('T')[0];
    
    // Check for duplicate visits (same date and time)
    const duplicateVisit = visits.find(visit => {
      const existingDateString = new Date(visit.visit_date).toISOString().split('T')[0];
      return existingDateString === dateString && 
             visit.visit_time === visitTime && 
             visit.status !== 'cancelled';
    });
    
    if (duplicateVisit) {
      Alert.alert(
        'Lịch thăm trùng', 
        `Bạn đã có lịch thăm vào ngày ${visitDate.toLocaleDateString('vi-VN')} lúc ${visitTime}.\n\nMục đích: ${duplicateVisit.purpose}\n\nVui lòng chọn thời gian khác.`,
        [{ text: 'OK' }]
      );
      return;
    }
    
    // Prepare data for API call - matches updated MongoDB schema (no resident_id)
    const newVisitData = {
      family_member_id: user.id, // Current user ID
      visit_date: visitDate,
      visit_time: visitTime,
      duration: 60, // Fixed 1 hour duration
      status: 'completed', // Auto-completed, no approval needed
      purpose: finalPurpose,
      numberOfVisitors: parseInt(visitorCount, 10),
      notes: visitNotes
    };
    
    try {
      // Call the createVisit function
      const result = await createVisit(newVisitData);
      
      if (result.success) {
        // Add new visit to the list
        const updatedVisits = [...visits, result.data];
        setVisits(updatedVisits);
        
        // Update calendar marked dates
        const newMarkedDates = { ...markedDates };
        newMarkedDates[dateString] = { 
          selected: true, 
          marked: true, 
          selectedColor: getStatusColor('Đã xác nhận'),
        };
        setMarkedDates(newMarkedDates);
        
        // Select the newly created visit date
        setSelectedDate(dateString);
        
        // Close the modal
        setShowNewVisitModal(false);
        
        // Show success message
        Alert.alert(
          'Đặt Lịch Thành Công',
          `Lịch thăm đã được đặt thành công cho ngày ${visitDate.toLocaleDateString('vi-VN')} lúc ${visitTime}. Vui lòng đến đúng giờ đã hẹn.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      Alert.alert('Lỗi', error.message || 'Có lỗi xảy ra khi đặt lịch. Vui lòng thử lại.');
    }
  };
  
  // Add function to handle visit cancellation
  const handleCancelVisit = async (visitId) => {
    Alert.alert(
      'Xác nhận hủy lịch',
      'Bạn có chắc chắn muốn hủy lịch thăm này không?',
      [
        { text: 'Không', style: 'cancel' },
        { 
          text: 'Có, hủy lịch', 
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await cancelVisit(visitId);
              
              if (result.success) {
                // Update the visit status in the local state
                const updatedVisits = visits.map(visit => 
                  visit.id === visitId ? { ...visit, status: 'cancelled' } : visit
                );
                setVisits(updatedVisits);
                
                // Update the calendar markers
                await fetchVisits(); // Refresh all data
                
                Alert.alert('Thành công', 'Đã hủy lịch thăm thành công.');
              }
            } catch (error) {
              Alert.alert('Lỗi', error.message || 'Không thể hủy lịch thăm. Vui lòng thử lại sau.');
            }
          }
        }
      ]
    );
  };
  
  // Add this useEffect to log upcoming visits for debugging
  useEffect(() => {
    // Log upcoming visits for debugging
    const upcomingVisits = visits.filter(visit => {
      const visitDate = new Date(visit.visit_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return visitDate >= today;
    });
    
    console.log('Upcoming visits:', upcomingVisits.length);
    upcomingVisits.forEach(visit => {
      console.log(`Visit date: ${new Date(visit.visit_date).toLocaleDateString()}, Purpose: ${visit.purpose}`);
    });
  }, [visits]);
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải lịch thăm...</Text>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Lịch Thăm</Text>
      </View>
      
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Action Header */}
        <View style={styles.actionHeader}>
          <NativeButton 
            title="Đặt Lịch Thăm"
            mode="contained" 
            onPress={handleScheduleVisit}
            style={styles.scheduleButton}
            icon={<MaterialIcons name="add" size={20} color={COLORS.surface} style={{ marginRight: 8 }} />}
          />
        </View>
        
        {/* Calendar */}
        <NativeCard style={styles.card}>
          <NativeCard.Content>
            <Text style={styles.cardTitle}>Chọn Ngày Thăm</Text>
            
            {/* Custom Calendar Header */}
            <View style={styles.calendarHeader}>
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => handleMonthChange('left')}
              >
                <MaterialIcons name="chevron-left" size={24} color={COLORS.primary} style={styles.navIcon} />
              </TouchableOpacity>
              
              <Text style={styles.monthYearText}>
                {currentMonth.toLocaleDateString('vi-VN', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </Text>
              
              <TouchableOpacity 
                style={styles.monthNavButton}
                onPress={() => handleMonthChange('right')}
              >
                <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} style={styles.navIcon} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarContainer}>
              <Calendar
                key={`calendar-${forceUpdate}`} // Force re-render when month changes
                current={currentMonth.toISOString().split('T')[0]}
                onDayPress={handleDateSelect}
                markedDates={{
                  ...markedDates,
                  [selectedDate]: {
                    ...markedDates[selectedDate],
                    selected: true,
                    selectedColor: COLORS.primary,
                  }
                }}
                theme={{
                  calendarBackground: COLORS.surface,
                  textSectionTitleColor: COLORS.primary,
                  selectedDayBackgroundColor: COLORS.primary,
                  selectedDayTextColor: COLORS.surface,
                  todayTextColor: COLORS.primary,
                  dayTextColor: COLORS.text,
                  textDisabledColor: COLORS.disabled,
                  arrowColor: COLORS.primary,
                  monthTextColor: COLORS.text,
                  indicatorColor: COLORS.primary,
                  textDayFontFamily: 'System',
                  textMonthFontFamily: 'System',
                  textDayHeaderFontFamily: 'System',
                  textDayFontWeight: '500',
                  textMonthFontWeight: '700',
                  textDayHeaderFontWeight: '600',
                  textDayFontSize: 16,
                  textMonthFontSize: 20,
                  textDayHeaderFontSize: 13,
                  dayTextColor: COLORS.text,
                  textSectionTitleDisabledColor: COLORS.disabled,
                  'stylesheet.calendar.header': {
                    dayHeader: {
                      marginTop: 2,
                      marginBottom: 7,
                      width: 32,
                      textAlign: 'center',
                      fontSize: 13,
                      fontFamily: 'System',
                      fontWeight: '600',
                      color: COLORS.textSecondary
                    },
                    header: {
                      display: 'none'
                    }
                  },
                  'stylesheet.day.basic': {
                    selected: {
                      backgroundColor: COLORS.primary,
                      borderRadius: 20,
                    },
                    today: {
                      backgroundColor: COLORS.primary + '20',
                      borderRadius: 20,
                    },
                    base: {
                      width: 32,
                      height: 32,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }
                  }
                }}
                hideExtraDays={true}
                enableSwipeMonths={false}
                showWeekNumbers={false}
                disableAllTouchEventsForDisabledDays={true}
                hideArrows={true}
                firstDay={1}
                markingType={'simple'}
              />
            </View>
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Đã xác nhận</Text>
              </View>
            </View>
          </NativeCard.Content>
        </NativeCard>
        
        {/* Visits for selected date */}
        {selectedDate && (
          <NativeCard style={styles.card}>
            <NativeCard.Content>
              <Text style={styles.cardTitle}>
                Lịch thăm cho {formatDate(selectedDate)}
              </Text>
              {getVisitsForSelectedDate().length > 0 ? (
                getVisitsForSelectedDate().map((visit) => (
                  <View key={visit.id} style={styles.visitItem}>
                    <View style={styles.visitHeader}>
                      <View style={styles.visitTime}>
                        <Ionicons name="time" size={16} color={COLORS.primary} />
                        <Text style={styles.visitTimeText}>{formatTime(visit.visit_time)}</Text>
                      </View>
                      <View style={[styles.customChip, { 
                        backgroundColor: getStatusColor(visit.status) + '20',
                      }]}>
                        <Text style={[styles.customChipText, { 
                          color: getStatusColor(visit.status),
                        }]}>
                          {visit.status === 'completed' ? 'Đã xác nhận' : 
                           visit.status === 'cancelled' ? 'Đã hủy' : visit.status}
                        </Text>
                      </View>
                    </View>
                    
                    <View style={styles.visitDetail}>
                      <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.visitDetailText}>{visit.duration} phút</Text>
                    </View>
                    
                    {visit.notes && (
                      <View style={styles.visitDetail}>
                        <MaterialIcons name="note" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.visitDetailText}>{visit.notes}</Text>
                      </View>
                    )}
                    
                    {visit.purpose && (
                      <View style={styles.visitDetail}>
                        <MaterialIcons name="favorite" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.visitDetailText}>{visit.purpose}</Text>
                      </View>
                    )}
                    
                    {visit.numberOfVisitors && (
                      <View style={styles.visitDetail}>
                        <MaterialIcons name="people" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.visitDetailText}>{visit.numberOfVisitors} người</Text>
                      </View>
                    )}
                    
                    {/* Add cancel button for future visits that are not cancelled
                    {visit.status === 'completed' && new Date(visit.visit_date) > new Date() && (
                      <TouchableOpacity 
                        style={styles.cancelVisitButton}
                        onPress={() => handleCancelVisit(visit.id)}
                      >
                        <Text style={styles.cancelVisitButtonText}>Hủy lịch thăm</Text>
                      </TouchableOpacity>
                    )} */}
                    
                    <View style={styles.divider} />
                  </View>
                ))
              ) : (
                <Text style={styles.noVisitsText}>Không có lịch thăm cho ngày này.</Text>
              )}
            </NativeCard.Content>
          </NativeCard>
        )}
        
        {/* Upcoming Visits Section */}
        <NativeCard style={styles.card}>
          <NativeCard.Content>
            <Text style={styles.cardTitle}>Lịch thăm sắp tới</Text>
            {visits
              .filter(visit => {
                // Only show visits with dates in the future
                const visitDate = new Date(visit.visit_date);
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
                return visitDate >= today;
              })
              .sort((a, b) => {
                // First compare dates
                const dateComparison = new Date(a.visit_date) - new Date(b.visit_date);
                if (dateComparison !== 0) {
                  return dateComparison; // If dates are different, sort by date
                }
                
                // If dates are the same, compare times
                const timeA = a.visit_time.split(':').map(Number);
                const timeB = b.visit_time.split(':').map(Number);
                
                // Compare hours first
                if (timeA[0] !== timeB[0]) {
                  return timeA[0] - timeB[0];
                }
                
                // If hours are the same, compare minutes
                return timeA[1] - timeB[1];
              })
              .slice(0, 3)
              .map((visit) => (
                <TouchableOpacity
                  key={visit.id} 
                  style={styles.upcomingVisitItem}
                  onPress={() => setSelectedDate(visit.visit_date.toISOString().split('T')[0])}
                >
                  <View style={styles.upcomingVisitDate}>
                    <Text style={styles.upcomingVisitDateDay}>
                      {new Date(visit.visit_date).getDate()}
                    </Text>
                    <Text style={styles.upcomingVisitDateMonth}>
                      Th{new Date(visit.visit_date).getMonth() + 1}
                    </Text>
                  </View>
                  <View style={styles.upcomingVisitDetails}>
                    <View style={styles.upcomingVisitHeader}>
                      <Text style={styles.upcomingVisitTime}>
                        {formatTime(visit.visit_time)}
                      </Text>
                      <View style={[styles.customChip, { 
                        backgroundColor: getStatusColor(visit.status) + '20',
                        borderColor: getStatusColor(visit.status),
                      }]}>
                        <Text style={[styles.chipText, { color: getStatusColor(visit.status) }]}>
                          Đã xác nhận
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.upcomingVisitPurpose} numberOfLines={1}>
                      {visit.purpose}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            {visits.filter(visit => {
              const visitDate = new Date(visit.visit_date);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              return visitDate >= today;
            }).length === 0 && (
              <Text style={styles.noVisitsText}>Không có lịch thăm sắp tới</Text>
            )}
          </NativeCard.Content>
        </NativeCard>
      </ScrollView>
      
      {/* New Visit Modal - Fix spacing issues */}
      <NativeModal 
        visible={showNewVisitModal} 
        onClose={() => setShowNewVisitModal(false)}
        style={{paddingBottom: 16}} // Reduce bottom padding of the modal
      >
        <ScrollView 
          style={styles.modalScrollView}
          contentContainerStyle={styles.modalContentContainer}
          showsVerticalScrollIndicator={true}
          bounces={false}
          overScrollMode="never" // Prevents over-scrolling on Android
        >
          <Text style={styles.modalTitle}>Đặt Lịch Thăm Mới</Text>
          <Text style={styles.modalSubtitle}>Vui lòng điền đầy đủ thông tin để đặt lịch thăm</Text>
          
          {/* Date Picker */}
          <Text style={styles.fieldLabel}>Ngày thăm <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => setShowDatePicker(true)}
          >
            <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
            <Text style={styles.dropdownButtonText}>
              {visitDate.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric', 
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          <Text style={styles.fieldNote}>Chỉ được đặt lịch trước ít nhất 24 giờ. Thời gian thăm: 9:00-11:00 và 14:00-17:00.</Text>
          
          {showDatePicker && (
            <DateTimePicker
              value={visitDate}
              mode="date"
              display="default"
              minimumDate={new Date(Date.now() + 24 * 60 * 60 * 1000)} // 24 hours from now
              onChange={handleDateChange}
            />
          )}
          
          {/* Time Picker */}
          <Text style={styles.fieldLabel}>Giờ thăm <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              setShowTimeDropdown(!showTimeDropdown);
              setShowPurposeDropdown(false); // Close other dropdowns
            }}
          >
            <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
            <Text style={styles.dropdownButtonText}>
              {visitTime || 'Chọn giờ thăm...'}
            </Text>
            <MaterialIcons name={showTimeDropdown ? "expand-less" : "expand-more"} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.fieldNote}>Mỗi lần thăm kéo dài 1 giờ. Vui lòng đến đúng giờ đã chọn.</Text>
          
          {showTimeDropdown && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[styles.dropdownItem, visitTime === slot.split(' - ')[0] && styles.dropdownItemSelected]}
                    onPress={() => {
                      setVisitTime(slot.split(' - ')[0]);
                      setShowTimeDropdown(false);
                    }}
                  >
                    <Text style={[styles.dropdownItemText, visitTime === slot.split(' - ')[0] && styles.dropdownItemTextSelected]}>
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Purpose Picker */}
          <Text style={styles.fieldLabel}>Mục đích thăm <Text style={styles.required}>*</Text></Text>
          <TouchableOpacity 
            style={styles.dropdownButton}
            onPress={() => {
              setShowPurposeDropdown(!showPurposeDropdown);
              setShowTimeDropdown(false); // Close other dropdowns
            }}
          >
            <MaterialIcons name="favorite" size={20} color={COLORS.primary} />
            <Text style={styles.dropdownButtonText}>
              {visitPurpose || 'Chọn mục đích...'}
            </Text>
            <MaterialIcons name={showPurposeDropdown ? "expand-less" : "expand-more"} size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.fieldNote}>Chọn đúng mục đích để nhân viên chuẩn bị tốt nhất cho chuyến thăm.</Text>
          
          {showPurposeDropdown && (
            <View style={styles.dropdown}>
              <ScrollView style={styles.dropdownScrollView} nestedScrollEnabled={true}>
                {visitPurposes.map((purpose) => (
                  <TouchableOpacity
                    key={purpose}
                    style={[styles.dropdownItem, visitPurpose === purpose && styles.dropdownItemSelected]}
                    onPress={() => {
                      setVisitPurpose(purpose);
                      setShowPurposeDropdown(false);
                      if (purpose !== 'Khác') {
                        setCustomPurpose('');
                      }
                    }}
                  >
                    <Text style={[styles.dropdownItemText, visitPurpose === purpose && styles.dropdownItemTextSelected]}>
                      {purpose}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          {/* Custom Purpose Input */}
          {visitPurpose === 'Khác' && (
            <NativeTextInput
              label="Mục đích thăm cụ thể*"
              value={customPurpose}
              onChangeText={setCustomPurpose}
              placeholder="Nhập mục đích thăm của bạn"
              style={styles.textInput}
            />
          )}
          
          {/* Visitor Count */}
          <NativeTextInput
            label="Số người đến thăm*"
            keyboardType="numeric"
            value={visitorCount}
            onChangeText={setVisitorCount}
            placeholder="Ví dụ: 2"
            style={styles.textInput}
          />
          
          {/* Notes */}
          <NativeTextInput
            label="Ghi chú (không bắt buộc)"
            multiline
            numberOfLines={3}
            value={visitNotes}
            onChangeText={setVisitNotes}
            placeholder="Thêm các yêu cầu đặc biệt hoặc ghi chú"
            style={styles.textInput}
            textAlignVertical="top"
          />
          
          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialIcons name="info" size={20} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.infoText}>
              Lưu ý: Vui lòng mang theo giấy tờ tùy thân khi đến thăm. Đặt lịch trước ít nhất 24 giờ. Nếu có thay đổi, hãy liên hệ nhân viên để được hỗ trợ.
            </Text>
          </View>
          
          {/* Buttons - Improved styling */}
          <View style={styles.modalButtons}>
            <NativeButton 
              title="Hủy bỏ"
              mode="outlined"
              onPress={() => setShowNewVisitModal(false)}
              style={[styles.modalButton, styles.cancelButton]}
            />
            <NativeButton 
              title="Đặt lịch"
              mode="contained"
              onPress={handleSubmitVisit}
              style={styles.modalButton}
            />
          </View>
        </ScrollView>
      </NativeModal>
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
    ...FONTS.body2,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  customHeaderTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  actionHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    ...FONTS.h2,
    color: COLORS.text,
    fontWeight: '700',
  },
  scheduleButton: {
    backgroundColor: COLORS.primary,
  },
  card: {
    marginBottom: 20,
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    ...FONTS.h4,
    marginBottom: 16,
    color: COLORS.text,
    fontWeight: '600',
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  monthNavButton: {
    padding: 0, // Remove padding to center icon
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
  },
  navIcon: {
    // Center the icon in the circle
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  monthYearText: {
    ...FONTS.h4,
    color: COLORS.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  calendarContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    marginHorizontal: -4,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  visitItem: {
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    minHeight: 32,
  },
  visitTime: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  visitTimeText: {
    ...FONTS.h4,
    marginLeft: 8,
    color: COLORS.text,
    fontWeight: '600',
  },
  visitDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  visitDetailText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginTop: 8,
    marginBottom: 12,
  },
  noVisitsText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  upcomingVisitItem: {
    flexDirection: 'row',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    overflow: 'hidden',
    minHeight: 80,
  },
  upcomingVisitDate: {
    width: 60,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 8,
  },
  upcomingVisitDateDay: {
    ...FONTS.h3,
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  upcomingVisitDateMonth: {
    ...FONTS.body3,
    color: COLORS.surface,
    fontWeight: '500',
  },
  upcomingVisitDetails: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  upcomingVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    minHeight: 32,
  },
  upcomingVisitTime: {
    ...FONTS.body2,
    fontWeight: '500',
    flex: 1,
    marginRight: 12,
    flexWrap: 'wrap',
    color: COLORS.text,
  },
  customChip: {
    flexShrink: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 90,
    maxWidth: 120,
  },
  customChipText: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalScrollView: {
    maxHeight: '100%',
  },
  modalContentContainer: {
    paddingTop: 0, // Remove top padding as the modal already has padding
    paddingBottom: 0, // Remove bottom padding as the modal already has padding
  },
  textInput: {
    marginTop: 8,
    marginBottom: 12,
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
    fontWeight: '700',
  },
  modalSubtitle: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
    lineHeight: 20,
  },
  fieldLabel: {
    ...FONTS.body2,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 12,
  },
  required: {
    color: COLORS.error,
  },
  fieldNote: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 8,
    marginTop: 4,
    lineHeight: 16,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    backgroundColor: COLORS.surface,
    justifyContent: 'space-between',
  },
  dropdownButtonText: {
    ...FONTS.body2,
    marginLeft: 8,
    color: COLORS.text,
    flex: 1,
  },
  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    marginTop: 4,
    marginBottom: 12,
    zIndex: 10,
  },
  dropdownScrollView: {
    maxHeight: 150,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemSelected: {
    backgroundColor: COLORS.primary + '20',
  },
  dropdownItemText: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  dropdownItemTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary + '10',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    marginBottom: 8, // Further reduced margin
    alignItems: 'flex-start',
  },
  infoText: {
    ...FONTS.body3,
    color: COLORS.primary,
    lineHeight: 18,
    flex: 1,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4, // Minimal margin for spacing
    marginBottom: 5,
    paddingHorizontal: 0,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 4,
    marginVertical: 0, // Remove vertical margin completely
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  upcomingVisitPurpose: {
    ...FONTS.body4,
    color: COLORS.textPrimary,
    marginTop: 4,
  },
  // cancelVisitButton: {
  //   marginTop: 8,
  //   padding: 8,
  //   backgroundColor: COLORS.error + '15',
  //   borderRadius: 8,
  //   alignSelf: 'flex-start',
  // },
  // cancelVisitButtonText: {
  //   ...FONTS.body3,
  //   color: COLORS.error,
  //   fontWeight: '600',
  // },
});

export default FamilyVisitScreen; 