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
  const [filter, setFilter] = useState('Tất cả'); // Tất cả, Cao, Trung bình, Thấp

  useEffect(() => {
    // Simulate API loading
    setTimeout(() => {
      setFilteredResidents(residents || []);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    let result = residents || [];

    // Filter by care level
    if (filter !== 'Tất cả') {
      const careLevelMap = {
        'Cao': 'intensive',
        'Trung bình': 'intermediate', 
        'Thấp': 'basic'
      };
      const careLevel = careLevelMap[filter];
      result = result.filter(resident => resident && resident.care_level === careLevel);
    }

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        resident =>
          resident &&
          resident.full_name &&
          resident.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          resident.room_number &&
          resident.room_number.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredResidents(result);
  }, [searchQuery, filter]);

  const renderResidentItem = ({ item }) => {
    // Safety check for undefined item
    if (!item) {
      return null;
    }
    
    // Parse full_name to get first and last name
    const nameParts = item.full_name ? item.full_name.split(' ') : ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    // Parse medical conditions from medical_history
    const medicalConditions = item.medical_history ? item.medical_history.split(', ') : [];
    // Capitalize only the first letter of each condition
    const capitalizeFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1);
    const medicalConditionsCap = medicalConditions.map(cond => capitalizeFirst(cond));
    
    // Map care_level to display format
    const getCareLevelDisplay = (careLevel) => {
      switch (careLevel) {
        case 'intensive': return 'Cao';
        case 'intermediate': return 'Trung bình';
        case 'basic': return 'Thấp';
        default: return 'Thấp';
      }
    };
    
    const getCareLevelColor = (careLevel) => {
      switch (careLevel) {
        case 'intensive': return COLORS.error;
        case 'intermediate': return COLORS.warning;
        case 'basic': return COLORS.success;
        default: return COLORS.success;
      }
    };

    return (
      <TouchableOpacity
        style={styles.residentCard}
        onPress={() => navigation.navigate('ResidentDetails', { residentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <Avatar.Image
            source={{ uri: item.photo || item.avatar }}
            size={60}
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.residentName}>{item.full_name}</Text>
            <View style={styles.roomContainer}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomNumber}>Phòng {item.room_number}</Text>
              {item.bed_number && (
                <Text style={styles.bedNumber}> - Giường {item.bed_number}</Text>
              )}
            </View>
          </View>
          <View style={styles.careLevelContainer}>
            <Badge
              style={[
                styles.careLevelBadge,
                {
                  backgroundColor: getCareLevelColor(item.care_level),
                },
              ]}
            >
              {getCareLevelDisplay(item.care_level)}
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
                {new Date(item.date_of_birth).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="date-range"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                Nhập viện: {new Date(item.admission_date).toLocaleDateString()}
              </Text>
            </View>
          </View>

          <View style={styles.conditionsContainer}>
            {medicalConditionsCap.map((condition, index) => (
              <Chip
                key={index}
                style={styles.conditionChip}
                textStyle={styles.conditionText}
              >
                {condition}
              </Chip>
            ))}
          </View>
        </View>

        <View style={styles.cardFooter}>
          <Button
            mode="text"
            onPress={() =>
              navigation.navigate('ResidentDetails', { residentId: item._id, initialTab: 'overview' })
            }
            color={COLORS.primary}
            labelStyle={styles.buttonLabel}
            icon="clipboard-check"
          >
            Kế hoạch chăm sóc
          </Button>
          <Button
            mode="text"
            onPress={() =>
              navigation.navigate('ResidentDetails', { residentId: item._id, initialTab: 'meds' })
            }
            color={COLORS.primary}
            labelStyle={styles.buttonLabel}
            icon="pill"
          >
            Thuốc men
          </Button>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Cư dân</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('HoSo')}
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
          placeholder="Tìm kiếm cư dân hoặc phòng..."
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
              filter === 'Tất cả' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Tất cả')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Tất cả' && styles.activeFilterText,
              ]}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Cao' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Cao')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Cao' && styles.activeFilterText,
              ]}
            >
              Chăm sóc cao
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Trung bình' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Trung bình')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Trung bình' && styles.activeFilterText,
              ]}
            >
              Chăm sóc trung bình
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'Thấp' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('Thấp')}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'Thấp' && styles.activeFilterText,
              ]}
            >
              Chăm sóc thấp
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
            data={filteredResidents || []}
            renderItem={renderResidentItem}
            keyExtractor={(item) => item?._id || Math.random().toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Không tìm thấy cư dân</Text>
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
  bedNumber: {
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