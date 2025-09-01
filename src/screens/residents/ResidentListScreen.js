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
  RefreshControl,
} from 'react-native';
import { Avatar, Badge, Searchbar, Button, FAB, Chip } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';

import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
// import { getImageUri } from '../../config/appConfig';
import CommonAvatar from '../../components/CommonAvatar';
import { formatDateFromBackend, formatDateToVietnamTime } from '../../utils/dateUtils';

// Removed DEFAULT_AVATAR to avoid using placeholder images

const ResidentListScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [residents, setResidents] = useState([]);
  const [filteredResidents, setFilteredResidents] = useState([]);
  const [residentsWithBedInfo, setResidentsWithBedInfo] = useState([]);
  const [isFetching, setIsFetching] = useState(false); // Prevent multiple simultaneous calls
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'discharged'

  // Chỉ reload lần đầu khi component mount
  useEffect(() => {
    fetchResidents();
  }, []);

  const fetchResidents = async () => {
    // Prevent multiple simultaneous API calls
    if (isFetching && !refreshing) {
      console.log('Already fetching residents, skipping...');
      return;
    }

    try {
      setIsFetching(true);
      setLoading(true);
      
      // Debug user data
      console.log('ResidentListScreen - User data:', user);
      console.log('ResidentListScreen - User role:', user?.role);
      console.log('ResidentListScreen - User ID:', user?._id || user?.id);
      
      // Kiểm tra role của user để sử dụng API phù hợp
      let response;
      if (user?.role === 'family') {
        // Family member chỉ có thể xem residents của mình
        console.log('ResidentListScreen - Using family member API');
        response = await residentService.getResidentsByFamilyMember(user._id || user.id);
      } else {
        // Staff có thể xem tất cả residents
        console.log('ResidentListScreen - Using staff API');
        response = await residentService.getAllResidents();
      }
      
      if (response.success) {
        const residentsData = response.data || [];
        setResidents(residentsData);
        setFilteredResidents(residentsData);
        
        // Lấy thông tin giường phòng cho từng resident
        const residentsWithBedData = await Promise.all(
          residentsData.map(async (resident) => {
            try {
              const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
              if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                const bedAssignment = bedResponse.data[0]; // Lấy assignment đầu tiên (active)
                return {
                  ...resident,
                  bed_info: bedAssignment
                };
              }
              return resident;
            } catch (error) {
              console.error('Error fetching bed info for resident:', resident._id, error);
              return resident;
            }
          })
        );
        
        setResidentsWithBedInfo(residentsWithBedData);
        setFilteredResidents(residentsWithBedData);
      } else {
        console.error('Failed to fetch residents:', response.error);
        setResidents([]);
        setFilteredResidents([]);
        setResidentsWithBedInfo([]);
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      setResidents([]);
      setFilteredResidents([]);
      setResidentsWithBedInfo([]);
    } finally {
      setLoading(false);
      setIsFetching(false);
    }
  };

  // Pull to refresh function
  const onRefresh = async () => {
    setRefreshing(true);
    await fetchResidents();
    setRefreshing(false);
  };

  useEffect(() => {
    // Only filter if we have data to filter
    if (!residentsWithBedInfo || residentsWithBedInfo.length === 0) {
      return;
    }

    let result = residentsWithBedInfo || [];

    // Filter by search query
    if (searchQuery) {
      result = result.filter(
        resident =>
          resident &&
          resident.full_name &&
          resident.full_name
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          (resident.bed_info?.bed_id?.room_id?.room_number &&
          resident.bed_info.bed_id.room_id.room_number.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(resident => {
        if (statusFilter === 'active') {
          return resident.status === 'active' || !resident.status; // active hoặc chưa có status
        } else if (statusFilter === 'discharged') {
          return resident.status === 'discharged' || resident.status === 'deceased';
        }
        return true;
      });
    }

    setFilteredResidents(result);
  }, [searchQuery, statusFilter, residentsWithBedInfo]);

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
    
    // Map status to display format
    const getStatusDisplay = (status) => {
      switch (status) {
        case 'active': return 'Đang chăm sóc';
        case 'discharged': return 'Đã xuất viện';
        case 'deceased': return 'Đã qua đời';
        default: return 'Đang chăm sóc';
      }
    };
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'active': return COLORS.success;
        case 'discharged': return COLORS.warning;
        case 'deceased': return COLORS.error;
        default: return COLORS.success;
      }
    };

    return (
      <TouchableOpacity
        style={styles.residentCard}
        onPress={() => navigation.navigate('ResidentDetails', { residentId: item._id })}
      >
        <View style={styles.cardHeader}>
          <CommonAvatar
            source={item.photo || item.avatar}
            size={60}
            name={item.full_name}
            style={styles.avatar}
          />
          <View style={styles.nameContainer}>
            <Text style={styles.residentName}>{item.full_name}</Text>
            <View style={styles.roomContainer}>
              <MaterialIcons name="room" size={16} color={COLORS.primary} />
              <Text style={styles.roomNumber}>
                Phòng {item.bed_info?.bed_id?.room_id?.room_number || 'Chưa phân'}
              </Text>
              {item.bed_info?.bed_id?.bed_number && (
                <Text style={styles.bedNumber}> - Giường {item.bed_info.bed_id.bed_number}</Text>
              )}
            </View>
          </View>
          <View style={styles.statusContainer}>
            <Badge
              style={[
                styles.statusBadge,
                {
                  backgroundColor: getStatusColor(item.status),
                },
              ]}
            >
              {getStatusDisplay(item.status)}
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
                {formatDateFromBackend(item.date_of_birth)}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons
                name="date-range"
                size={16}
                color={COLORS.textSecondary}
              />
              <Text style={styles.infoText}>
                Nhập viện: {formatDateToVietnamTime(item.admission_date)}
              </Text>
            </View>
          </View>

          {medicalConditionsCap.length > 0 && (
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
          )}
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
          <CommonAvatar
            size={40}
            source={user?.avatar || user?.profile_picture}
            name={user?.full_name}
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
        
        {/* Status Filter Buttons */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'all' && styles.activeFilterButton
            ]}
            onPress={() => setStatusFilter('all')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'all' && styles.activeFilterButtonText
            ]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'active' && styles.activeFilterButton
            ]}
            onPress={() => setStatusFilter('active')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'active' && styles.activeFilterButtonText
            ]}>
              Đang chăm sóc
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              statusFilter === 'discharged' && styles.activeFilterButton
            ]}
            onPress={() => setStatusFilter('discharged')}
          >
            <Text style={[
              styles.filterButtonText,
              statusFilter === 'discharged' && styles.activeFilterButtonText
            ]}>
              Đã xuất viện
            </Text>
          </TouchableOpacity>
        </View>
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
            keyExtractor={(item) => (item?._id ? String(item._id) : (item?.id ? String(item.id) : ''))}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={onRefresh}
                colors={[COLORS.primary]}
                tintColor={COLORS.primary}
              />
            }
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={60} color={COLORS.textSecondary} />
                <Text style={styles.emptyText}>Không tìm thấy cư dân</Text>
              </View>
            }
            removeClippedSubviews={false}
            maxToRenderPerBatch={8}
            windowSize={7}
            initialNumToRender={8}
            onEndReachedThreshold={0.2}
            ListFooterComponent={<View style={{ height: 24 }} />}
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingHorizontal: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeFilterButton: {
    backgroundColor: COLORS.surface,
    borderColor: COLORS.surface,
  },
  filterButtonText: {
    ...FONTS.body3,
    color: COLORS.surface,
    fontWeight: '500',
  },
  activeFilterButtonText: {
    color: COLORS.primary,
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
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
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