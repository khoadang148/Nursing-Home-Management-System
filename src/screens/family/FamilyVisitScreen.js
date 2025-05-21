import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';
import { 
  Button, 
  Card, 
  Title, 
  Paragraph, 
  ActivityIndicator, 
  Divider,
  TextInput,
  Chip,
  Modal,
  Portal,
} from 'react-native-paper';
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
    status: 'Confirmed',
    notes: 'Will bring photo album',
  },
  {
    id: '2',
    date: '2023-11-22',
    time: '15:30',
    duration: 60,
    status: 'Pending',
    notes: '',
  },
  {
    id: '3',
    date: '2023-10-30',
    time: '10:00',
    duration: 45,
    status: 'Completed',
    notes: 'Had lunch together',
  },
];

const FamilyVisitScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visits, setVisits] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [markedDates, setMarkedDates] = useState({});
  
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
      case 'Confirmed': return COLORS.primary;
      case 'Pending': return COLORS.warning;
      case 'Completed': return COLORS.success;
      case 'Cancelled': return COLORS.error;
      default: return COLORS.secondary;
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
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
    return time.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
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
      Alert.alert('Validation Error', 'Please fill in all required fields.');
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
      status: 'Pending',
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
      selectedColor: getStatusColor('Pending'),
    };
    setMarkedDates(newMarkedDates);
    
    // Select the newly created visit date
    setSelectedDate(dateString);
    
    // Close the modal
    setShowNewVisitModal(false);
    
    // Show success message
    Alert.alert(
      'Visit Scheduled',
      'Your visit has been submitted for approval. You will be notified once it is confirmed.',
      [{ text: 'OK' }]
    );
  };
  
  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} animating={true} />
        <Text style={styles.loadingText}>Loading visits...</Text>
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
          <Text style={styles.headerTitle}>Visit Schedule</Text>
          <Button 
            mode="contained" 
            icon="plus" 
            onPress={handleScheduleVisit}
            style={styles.scheduleButton}
          >
            Schedule Visit
          </Button>
        </View>
        
        {/* Calendar */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Select Visit Date</Title>
            <Calendar
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
                monthTextColor: COLORS.primary,
                indicatorColor: COLORS.primary,
              }}
            />
            <View style={styles.legendContainer}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>Confirmed</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.warning }]} />
                <Text style={styles.legendText}>Pending</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.success }]} />
                <Text style={styles.legendText}>Completed</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        {/* Visits for selected date */}
        {selectedDate && (
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.cardTitle}>
                Visits for {formatDate(selectedDate)}
              </Title>
              {getVisitsForSelectedDate().length > 0 ? (
                getVisitsForSelectedDate().map((visit) => (
                  <View key={visit.id} style={styles.visitItem}>
                    <View style={styles.visitHeader}>
                      <View style={styles.visitTime}>
                        <Ionicons name="time" size={16} color={COLORS.primary} />
                        <Text style={styles.visitTimeText}>{formatTime(visit.time)}</Text>
                      </View>
                      <Chip 
                        style={{ 
                          backgroundColor: getStatusColor(visit.status) + '20',
                        }}
                        textStyle={{ 
                          color: getStatusColor(visit.status),
                        }}
                      >
                        {visit.status}
                      </Chip>
                    </View>
                    
                    <View style={styles.visitDetail}>
                      <MaterialIcons name="access-time" size={16} color={COLORS.textSecondary} />
                      <Text style={styles.visitDetailText}>{visit.duration} minutes</Text>
                    </View>
                    
                    {visit.notes && (
                      <View style={styles.visitDetail}>
                        <MaterialIcons name="note" size={16} color={COLORS.textSecondary} />
                        <Text style={styles.visitDetailText}>{visit.notes}</Text>
                      </View>
                    )}
                    
                    <View style={styles.visitActions}>
                      {visit.status === 'Pending' && (
                        <Button 
                          mode="text"
                          compact
                          onPress={() => {
                            /* In a real app, this would call an API to cancel the visit */
                            Alert.alert(
                              'Cancel Visit',
                              'Are you sure you want to cancel this visit?',
                              [
                                { text: 'No', style: 'cancel' },
                                { 
                                  text: 'Yes', 
                                  style: 'destructive',
                                  onPress: () => {
                                    const updatedVisits = visits.map(v => 
                                      v.id === visit.id ? { ...v, status: 'Cancelled' } : v
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
                          textColor={COLORS.error}
                        >
                          Cancel
                        </Button>
                      )}
                      {visit.status === 'Confirmed' && (
                        <Button 
                          mode="text"
                          compact
                          onPress={() => {
                            /* In a real app, this would call an API to reschedule the visit */
                            Alert.alert(
                              'Reschedule Visit',
                              'Would you like to reschedule this visit?',
                              [
                                { text: 'No', style: 'cancel' },
                                { 
                                  text: 'Yes',
                                  onPress: () => {
                                    // Logic to open rescheduling modal
                                  }
                                },
                              ]
                            );
                          }}
                          textColor={COLORS.primary}
                        >
                          Reschedule
                        </Button>
                      )}
                    </View>
                    <Divider style={styles.divider} />
                  </View>
                ))
              ) : (
                <Paragraph style={styles.noVisitsText}>No visits scheduled for this date.</Paragraph>
              )}
            </Card.Content>
          </Card>
        )}
        
        {/* Upcoming Visits */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.cardTitle}>Upcoming Visits</Title>
            {visits
              .filter(visit => ['Confirmed', 'Pending'].includes(visit.status))
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
                      {new Date(visit.date).toLocaleString('default', { month: 'short' })}
                    </Text>
                  </View>
                  <View style={styles.upcomingVisitDetails}>
                    <View style={styles.upcomingVisitHeader}>
                      <Text style={styles.upcomingVisitTime}>
                        {formatTime(visit.time)}
                      </Text>
                      <Chip 
                        style={{ 
                          backgroundColor: getStatusColor(visit.status) + '20',
                          height: 24,
                        }}
                        textStyle={{ 
                          color: getStatusColor(visit.status),
                          fontSize: 12,
                        }}
                      >
                        {visit.status}
                      </Chip>
                    </View>
                    <View style={styles.visitDetail}>
                      <MaterialIcons name="access-time" size={14} color={COLORS.textSecondary} />
                      <Text style={styles.visitDetailText}>{visit.duration} minutes</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            }
            {visits.filter(visit => ['Confirmed', 'Pending'].includes(visit.status)).length === 0 && (
              <Paragraph style={styles.noVisitsText}>No upcoming visits scheduled.</Paragraph>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* New Visit Modal */}
      <Portal>
        <Modal 
          visible={showNewVisitModal} 
          onDismiss={() => setShowNewVisitModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Schedule New Visit</Text>
            
            {/* Date Picker */}
            <Text style={styles.inputLabel}>Date*</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => {
                /* In a real app, this would open a date picker */
                // Using DateTimePicker here but for simplicity just showing the selected date
              }}
            >
              <MaterialIcons name="calendar-today" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerText}>
                {visitDate.toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Text>
            </TouchableOpacity>
            
            {/* Time Picker */}
            <Text style={styles.inputLabel}>Time*</Text>
            <TouchableOpacity 
              style={styles.datePickerButton}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={20} color={COLORS.primary} />
              <Text style={styles.datePickerText}>
                {visitTime.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })}
              </Text>
            </TouchableOpacity>
            {showTimePicker && (
              <DateTimePicker
                value={visitTime}
                mode="time"
                is24Hour={false}
                display="default"
                onChange={handleTimeChange}
              />
            )}
            
            {/* Duration */}
            <Text style={styles.inputLabel}>Duration (minutes)*</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={visitDuration}
              onChangeText={setVisitDuration}
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
            
            {/* Notes */}
            <Text style={styles.inputLabel}>Notes (optional)</Text>
            <TextInput
              style={styles.input}
              multiline
              numberOfLines={3}
              value={visitNotes}
              onChangeText={setVisitNotes}
              placeholder="Add any special requirements or notes"
              mode="outlined"
              outlineColor={COLORS.border}
              activeOutlineColor={COLORS.primary}
            />
            
            {/* Buttons */}
            <View style={styles.modalButtons}>
              <Button 
                mode="outlined"
                onPress={() => setShowNewVisitModal(false)}
                style={styles.modalButton}
                textColor={COLORS.text}
              >
                Cancel
              </Button>
              <Button 
                mode="contained"
                onPress={handleSubmitVisit}
                style={styles.modalButton}
              >
                Submit
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
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
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  visitItem: {
    marginBottom: 12,
  },
  visitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  visitTime: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  visitTimeText: {
    ...FONTS.h4,
    marginLeft: 8,
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
    borderRadius: 8,
    overflow: 'hidden',
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
  },
  upcomingVisitDetails: {
    flex: 1,
    padding: 12,
  },
  upcomingVisitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  upcomingVisitTime: {
    ...FONTS.body2,
    fontWeight: '500',
  },
  modalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  modalContent: {
    width: '100%',
  },
  modalTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 20,
    textAlign: 'center',
  },
  inputLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  input: {
    marginBottom: 16,
    backgroundColor: COLORS.surface,
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
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
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default FamilyVisitScreen; 