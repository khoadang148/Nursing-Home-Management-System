import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { Appbar, Card, Text, FAB, Chip, Searchbar, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Mock medications data
const mockMedications = [
  { 
    id: '1', 
    name: 'Paracetamol', 
    dosage: '500mg', 
    schedule: 'Morning, Evening',
    category: 'Pain Relief',
    residentName: 'John Doe',
    roomNumber: '101',
    nextDue: '2024-03-15T09:00:00'
  },
  { 
    id: '2', 
    name: 'Amoxicillin', 
    dosage: '250mg', 
    schedule: 'Three times a day',
    category: 'Antibiotic',
    residentName: 'Mary Smith',
    roomNumber: '102',
    nextDue: '2024-03-15T08:00:00'
  },
  { 
    id: '3', 
    name: 'Ibuprofen', 
    dosage: '400mg', 
    schedule: 'As needed',
    category: 'Anti-inflammatory',
    residentName: 'William Johnson',
    roomNumber: '103',
    nextDue: null
  },
  { 
    id: '4', 
    name: 'Metformin', 
    dosage: '850mg', 
    schedule: 'Twice daily with meals',
    category: 'Diabetes',
    residentName: 'Patricia Brown',
    roomNumber: '104',
    nextDue: '2024-03-15T12:00:00'
  },
  { 
    id: '5', 
    name: 'Simvastatin', 
    dosage: '20mg', 
    schedule: 'Once daily at bedtime',
    category: 'Cholesterol',
    residentName: 'Richard Miller',
    roomNumber: '105',
    nextDue: '2024-03-15T20:00:00'
  },
];

const MedicationListScreen = () => {
  const navigation = useNavigation();
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // all, scheduled, asNeeded

  useEffect(() => {
    // Simulating API loading
    setTimeout(() => {
      setMedications(mockMedications);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredMedications = () => {
    let filtered = [...medications];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        med =>
          med.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          med.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply type filter
    if (activeFilter === 'scheduled') {
      filtered = filtered.filter(med => med.nextDue !== null);
    } else if (activeFilter === 'asNeeded') {
      filtered = filtered.filter(med => med.nextDue === null);
    }

    return filtered;
  };

  const getFormattedTime = (dateString) => {
    if (!dateString) return 'As needed';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMedicationItem = ({ item }) => (
    <TouchableOpacity onPress={() => navigation.navigate('MedicationDetails', { medicationId: item.id })}>
      <Card style={styles.medicationCard}>
        <Card.Content>
          <View style={styles.medicationHeader}>
            <View style={styles.medicationInfo}>
              <Text style={styles.medicationName}>{item.name}</Text>
              <Text style={styles.medicationDosage}>{item.dosage} • {item.category}</Text>
            </View>
            <Chip style={styles.scheduleChip}>
              {item.nextDue ? getFormattedTime(item.nextDue) : 'PRN'}
            </Chip>
          </View>
          
          <Divider style={styles.divider} />
          
          <View style={styles.residentInfo}>
            <MaterialIcons name="person" size={16} color={COLORS.textSecondary} />
            <Text style={styles.residentName}>{item.residentName}</Text>
            <MaterialIcons name="room" size={16} color={COLORS.textSecondary} />
            <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
          </View>
          
          <View style={styles.scheduleInfo}>
            <MaterialCommunityIcons name="calendar-clock" size={16} color={COLORS.textSecondary} />
            <Text style={styles.scheduleText}>{item.schedule}</Text>
          </View>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('MedicationSchedule', { medicationId: item.id })}
            >
              <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Schedule</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('MedicationAdmin', { medicationId: item.id })}
            >
              <MaterialCommunityIcons name="pill" size={20} color={COLORS.primary} />
              <Text style={styles.actionButtonText}>Administer</Text>
            </TouchableOpacity>
          </View>
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="pill-off" size={60} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>No medications found</Text>
      <Text style={styles.emptySubtext}>Try changing your search or filter</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Medications" titleStyle={FONTS.h2} />
        <Appbar.Action icon="tune-vertical" onPress={() => {}} />
      </Appbar.Header>
      
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search medications or residents..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'all' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'all' && styles.activeFilterText,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'scheduled' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('scheduled')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'scheduled' && styles.activeFilterText,
            ]}
          >
            Scheduled
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filterButton,
            activeFilter === 'asNeeded' && styles.activeFilterButton,
          ]}
          onPress={() => setActiveFilter('asNeeded')}
        >
          <Text
            style={[
              styles.filterText,
              activeFilter === 'asNeeded' && styles.activeFilterText,
            ]}
          >
            As Needed (PRN)
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={getFilteredMedications()}
        renderItem={renderMedicationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
      />
      
      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddMedication')}
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
  appbar: {
    backgroundColor: COLORS.primary,
    elevation: 0,
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: 12,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  activeFilterText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: SIZES.padding,
    paddingBottom: 80, // Space for FAB
  },
  medicationCard: {
    marginBottom: 12,
    borderRadius: SIZES.radius,
    ...SHADOWS.small,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  medicationInfo: {
    flex: 1,
  },
  medicationName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  medicationDosage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  scheduleChip: {
    backgroundColor: COLORS.primary + '20',
  },
  divider: {
    marginVertical: 8,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  residentName: {
    ...FONTS.body3,
    marginLeft: 4,
    marginRight: 12,
  },
  roomNumber: {
    ...FONTS.body3,
    marginLeft: 4,
  },
  scheduleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleText: {
    ...FONTS.body3,
    marginLeft: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionButtonText: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
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
  emptySubtext: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default MedicationListScreen; 