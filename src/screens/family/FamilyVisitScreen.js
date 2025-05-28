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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

// Mock visits data - in a real app this would come from an API
const mockVisits = [
  {
    id: '1',
    date: '2023-11-15',
    time: '14:00',
    duration: 60,
    status: 'Đã xác nhận',
    notes: 'Sẽ mang theo album ảnh',
  },
  {
    id: '2',
    date: '2023-11-22',
    time: '15:30',
    duration: 60,
    status: 'Đang chờ',
    notes: '',
  },
  {
    id: '3',
    date: '2023-10-30',
    time: '10:00',
    duration: 45,
    status: 'Đã hoàn thành',
    notes: 'Đã ăn trưa cùng nhau',
  },
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
  const [visitTime, setVisitTime] = useState(new Date());
  const [visitDuration, setVisitDuration] = useState('60');
  const [visitNotes, setVisitNotes] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  useEffect(() => {
    loadData();
  }, [user]);
  
  const loadData = async () => {
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // In a real app, this would filter visits by the user's ID and their resident
    setVisits(mockVisits);
    
    // Create marked dates for the calendar
    const marked = {};
    mockVisits.forEach(visit => {
      marked[visit.date] = { 
        selected: true, 
        marked: true, 
        selectedColor: getStatusColor(visit.status),
      };
    });
    setMarkedDates(marked);
    
    setLoading(false);
  };
  
  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Đã xác nhận': return COLORS.primary;
      case 'Đang chờ': return COLORS.warning;
      case 'Đã hoàn thành': return COLORS.success;
      case 'Đã hủy': return COLORS.error;
      default: return COLORS.secondary;
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
  
  // Filter visits for selected date
  const getVisitsForSelectedDate = () => {
    if (!selectedDate) return [];
    return visits.filter(visit => visit.date === selectedDate);
  };
  
  const handleDateSelect = (day) => {
    setSelectedDate(day.dateString);
  };
  
  const handleScheduleVisit = () => {
    setShowNewVisitModal(true);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setVisitDate(tomorrow);
    setVisitTime(new Date());
    setVisitDuration('60');
    setVisitNotes('');
  };
  
  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      setVisitTime(selectedTime);
    }
  };
  
  const handleSubmitVisit = () => {
    // Form validation
    if (!visitDate || !visitTime || !visitDuration) {
      Alert.alert('Lỗi xác thực', 'Vui lòng điền đầy đủ thông tin.');
      return;
    }
    
    const hours = visitTime.getHours().toString().padStart(2, '0');
    const minutes = visitTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    const dateString = visitDate.toISOString().split('T')[0];
    
    // In a real app, this would call an API to create the visit
    const newVisit = {
      id: (visits.length + 1).toString(),
      date: dateString,
      time: timeString,
      duration: parseInt(visitDuration, 10),
      status: 'Đang chờ',
      notes: visitNotes,
    };
    
    // Add new visit to the list
    const updatedVisits = [...visits, newVisit];
    setVisits(updatedVisits);
    
    // Update calendar marked dates
    const newMarkedDates = { ...markedDates };
    newMarkedDates[dateString] = { 
      selected: true, 
      marked: true, 
      selectedColor: getStatusColor('Đang chờ'),
    };
    setMarkedDates(newMarkedDates);
    
    // Select the newly created visit date
    setSelectedDate(dateString);
    
    // Close the modal
    setShowNewVisitModal(false);
    
    // Show success message
    Alert.alert(
      'Đã Đặt Lịch Thăm',
      'Lịch thăm của bạn đã được gửi để chờ phê duyệt. Bạn sẽ nhận được thông báo khi lịch được xác nhận.',
      [{ text: 'OK' }]
    );
  };
  
  const handleMonthChange = (direction) => {
    const newMonth = new Date(currentMonth);
    if (direction === 'left') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setCurrentMonth(newMonth);
  };
  
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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Lịch Thăm</Text>
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
                <MaterialIcons name="chevron-left" size={24} color={COLORS.primary} />
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
                <MaterialIcons name="chevron-right" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.calendarContainer}>
              <Calendar
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
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.legendText}>Đang chờ</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Hoàn thành</Text>
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
                        <Text style={styles.visitTimeText}>{formatTime(visit.time)}</Text>
                      </View>
                      <View style={[styles.customChip, { 
                        backgroundColor: getStatusColor(visit.status) + '20',
                      }]}>
                        <Text style={[styles.customChipText, { 
                          color: getStatusColor(visit.status),
                        }]}>
                          {visit.status}
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
                    
                    <View style={styles.visitActions}>
                      {visit.status === 'Đang chờ' && (
                        <NativeButton 
                          title="Hủy"
                          mode="text"
                          size="small"
                          onPress={() => {
                            Alert.alert(
                              'Hủy Lịch Thăm',
                              'Bạn có chắc muốn hủy lịch thăm này không?',
                              [
                                { text: 'Không', style: 'cancel' },
                                { 
                                  text: 'Có', 
                                  style: 'destructive',
                                  onPress: () => {
                                    const updatedVisits = visits.map(v => 
                                      v.id === visit.id ? { ...v, status: 'Đã hủy' } : v
                                    );
                                    setVisits(updatedVisits);
                                    
                                    // Update calendar marked dates
                                    const newMarkedDates = { ...markedDates };
                                    newMarkedDates[visit.date] = { 
                                      selected: true, 
                                      marked: true, 
                                      selectedColor: COLORS.error,
                                    };
                                    setMarkedDates(newMarkedDates);
                                  }
                                },
                              ]
                            );
                          }}
                          textStyle={{ color: COLORS.error }}
                        />
                      )}
                      {visit.status === 'Đã xác nhận' && (
                        <NativeButton 
                          title="Đổi lịch"
                          mode="text"
                          size="small"
                          onPress={() => {
                            Alert.alert(
                              'Đổi Lịch Thăm',
                              'Bạn có muốn đổi lịch thăm này không?',
                              [
                                { text: 'Không', style: 'cancel' },
                                { 
                                  text: 'Có',
                                  onPress: () => {
                                    // Logic to open rescheduling modal
                                  }
                                },
                              ]
                            );
                          }}
                          textStyle={{ color: COLORS.primary }}
                        />
                      )}
                    </View>
                    <View style={styles.divider} />
                  </View>
                ))
              ) : (
                <Text style={styles.noVisitsText}>Không có lịch thăm cho ngày này.</Text>
              )}
            </NativeCard.Content>
          </NativeCard>
        )}
        
        {/* Upcoming Visits */}
        <NativeCard style={styles.card}>
          <NativeCard.Content>
            <Text style={styles.cardTitle}>Lịch Thăm Sắp Tới</Text>
            {visits
              .filter(visit => ['Đã xác nhận', 'Đang chờ'].includes(visit.status))
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 3)
              .map((visit) => (
                <TouchableOpacity
                  key={visit.id} 
                  style={styles.upcomingVisitItem}
                  onPress={() => setSelectedDate(visit.date)}
                >
                  <View style={styles.upcomingVisitDate}>
                    <Text style={styles.upcomingVisitDateDay}>
                      {new Date(visit.date).getDate()}
                    </Text>
                    <Text style={styles.upcomingVisitDateMonth}>
                      Th{new Date(visit.date).getMonth() + 1}
                    </Text>
                  </View>
                  <View style={styles.upcomingVisitDetails}>
                    <View style={styles.upcomingVisitHeader}>
                      <Text style={styles.upcomingVisitTime}>
                        {formatTime(visit.time)}
                      </Text>
                      <View style={[styles.customChip, { 
                        backgroundColor: getStatusColor(visit.status) + '20',
                      }]}>
                        <Text style={[styles.customChipText, { 
                          color: getStatusColor(visit.status),
                        }]}>
                          {visit.status}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.visitDetail}>
                      <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.visitDetailText}>{visit.duration} phút</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            }
            {visits.filter(visit => ['Đã xác nhận', 'Đang chờ'].includes(visit.status)).length === 0 && (
              <Text style={styles.noVisitsText}>Không có lịch thăm sắp tới.</Text>
            )}
          </NativeCard.Content>
        </NativeCard>
      </ScrollView>
      
      {/* New Visit Modal */}
      <NativeModal 
        visible={showNewVisitModal} 
        onClose={() => setShowNewVisitModal(false)}
      >
        <Text style={styles.modalTitle}>Đặt Lịch Thăm Mới</Text>
        
        {/* Date Picker */}
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => {
            // In a real app, this would open a date picker
          }}
        >
          <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
          <Text style={styles.datePickerText}>
            {visitDate.toLocaleDateString('vi-VN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </TouchableOpacity>
        
        {/* Time Picker */}
        <TouchableOpacity 
          style={styles.datePickerButton}
          onPress={() => setShowTimePicker(true)}
        >
          <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
          <Text style={styles.datePickerText}>
            {visitTime.toLocaleTimeString('vi-VN', {
              hour: '2-digit',
              minute: '2-digit',
              hour12: false,
            })}
          </Text>
        </TouchableOpacity>
        {showTimePicker && (
          <DateTimePicker
            value={visitTime}
            mode="time"
            is24Hour={true}
            display="default"
            onChange={handleTimeChange}
          />
        )}
        
        {/* Duration */}
        <NativeTextInput
          label="Thời lượng (phút)*"
          keyboardType="numeric"
          value={visitDuration}
          onChangeText={setVisitDuration}
        />
        
        {/* Notes */}
        <NativeTextInput
          label="Ghi chú (không bắt buộc)"
          multiline
          numberOfLines={3}
          value={visitNotes}
          onChangeText={setVisitNotes}
          placeholder="Thêm các yêu cầu đặc biệt hoặc ghi chú"
        />
        
        {/* Buttons */}
        <View style={styles.modalButtons}>
          <NativeButton 
            title="Hủy bỏ"
            mode="outlined"
            onPress={() => setShowNewVisitModal(false)}
            style={styles.modalButton}
          />
          <NativeButton 
            title="Gửi"
            mode="contained"
            onPress={handleSubmitVisit}
            style={styles.modalButton}
          />
        </View>
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
    paddingBottom: 100,
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
    padding: 6,
    borderRadius: 16,
    backgroundColor: COLORS.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
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
    justifyContent: 'space-around',
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
  visitActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginBottom: 4,
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
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '700',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 14,
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  datePickerText: {
    ...FONTS.body2,
    marginLeft: 8,
    color: COLORS.text,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});

export default FamilyVisitScreen; 