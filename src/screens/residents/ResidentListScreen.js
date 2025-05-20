import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Avatar, Badge, Searchbar, Button, FAB, Chip } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Importing mock data - in a real app would come from API
import { residents } from '../../api/mockData';

const ResidentListScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [filter, setFilter] = useState('All'); // All, High, Medium, Low

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setFilteredResidents(residents);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = residents;

    // Filter by care level
    if (filter !== 'All') {
      result = result.filter(resident => resident.careLevel === filter);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        resident =>
          `${resident.firstName} ${resident.lastName}`
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          resident.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResidents(result);
  }, [searchQuery, filter]);

  const renderResidentItem = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.residentCard}
        onPress={() => navigation.navigate('ResidentDetails', { residentId: item.id })}
      >
        <View style={styles.cardHeader}>
          <Avatar.Image
            source={{ uri: item.photo }}
            size={60}
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.residentName}>{`${item.firstName} ${item.lastName}`}</Text>
            <View style={styles.roomContainer}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomNumber}>Room {item.roomNumber}</Text>
            </View>
          </View>
          <View style={styles.careLevelContainer}>
            <Badge
              style={[
                styles.careLevelBadge,
                {
                  backgroundColor:
                    item.careLevel === 'High'
                      ? COLORS.error
                      : item.careLevel === 'Medium'
                      ? COLORS.warning
                      : COLORS.success,
                },
              ]}
            >
              {item.careLevel}
            </Badge>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons
                name="cake-variant"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                {new Date(item.dateOfBirth).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="date-range"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                Admitted: {new Date(item.admissionDate).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.conditionsContainer}>
            {item.medicalConditions.slice(0, 2).map((condition, index) => (
              <Chip
                key={index}
                style={styles.conditionChip}
                textStyle={styles.conditionText}
              >
                {condition}
              </Chip>
            ))}
            {item.medicalConditions.length > 2 && (
              <Chip
                style={styles.conditionChip}
                textStyle={styles.conditionText}
              >
                +{item.medicalConditions.length - 2}
              </Chip>
            )}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            mode="text"
            onPress={() =>
              navigation.navigate('ResidentCare', { residentId: item.id })
            }
            color={COLORS.primary}
            labelStyle={styles.buttonLabel}
            icon="clipboard-check"
          >
            Care Plan
          </Button>
          <Button
            mode="text"
            onPress={() =>
              navigation.navigate('ResidentMedications', { residentId: item.id })
            }
            color={COLORS.primary}
            labelStyle={styles.buttonLabel}
            icon="pill"
          >
            Medications
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Residents</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Profile')}
          style={styles.profileButton}
        >
          <Avatar.Image
            size={40}
            source={{ uri: 'https://randomuser.me/api/portraits/women/21.jpg' }}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search residents or rooms..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'All' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('All')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'All' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'High' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('High')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'High' && styles.activeFilterText,
              ]}
            >
              High Care
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Medium' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Medium')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Medium' && styles.activeFilterText,
              ]}
            >
              Medium Care
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Low' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Low')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Low' && styles.activeFilterText,
              ]}
            >
              Low Care
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={filteredResidents}
            renderItem={renderResidentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>No residents found</Text>
              </View>
            }
          />

          <FAB
            style={styles.fab}
            icon="plus"
            color={COLORS.surface}
            onPress={() => navigation.navigate('AddResident')}
          />
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.surface,
  },
  profileButton: {
    borderRadius: 20,
    ...SHADOWS.small,
  },
  searchContainer: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  searchBar: {
    borderRadius: SIZES.radius,
    elevation: 0,
  },
  searchInput: {
    ...FONTS.body2,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: SIZES.padding,
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
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 80,
  },
  residentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    marginBottom: 16,
    ...SHADOWS.medium,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    padding: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  nameContainer: {
    flex: 1,
  },
  residentName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  roomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  roomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  careLevelContainer: {
    alignItems: 'flex-end',
  },
  careLevelBadge: {
    paddingHorizontal: 8,
  },
  cardBody: {
    padding: SIZES.padding,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 6,
  },
  conditionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  conditionChip: {
    backgroundColor: COLORS.background,
    marginRight: 8,
    marginBottom: 8,
  },
  conditionText: {
    ...FONTS.body3,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: 8,
  },
  buttonLabel: {
    ...FONTS.body3,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: COLORS.primary,
    ...SHADOWS.large,
  },
});

export default ResidentListScreen; 