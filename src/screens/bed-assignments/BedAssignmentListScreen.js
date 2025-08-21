import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  StatusBar,
  Modal,
  ScrollView,
} from 'react-native';
import { Card, Chip, Searchbar, Button, ActivityIndicator, Appbar } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import bedService from '../../api/services/bedService';
import residentService from '../../api/services/residentService';
import roomTypeService from '../../api/services/roomTypeService';
import carePlanService from '../../api/services/carePlanService';
import carePlanAssignmentService from '../../api/services/carePlanAssignmentService';

const BedListScreen = ({ navigation }) => {
  const [bedAssignments, setBedAssignments] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [allBeds, setAllBeds] = useState([]);
  const [filteredBeds, setFilteredBeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showResidentModal, setShowResidentModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [unassignedResidents, setUnassignedResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [assigningBed, setAssigningBed] = useState(false);
  const [unassigningBed, setUnassigningBed] = useState(false);
  const [roomTypes, setRoomTypes] = useState([]);
  const [carePlans, setCarePlans] = useState([]);

  const loadBedAssignments = async () => {
    try {
      setLoading(true);
      
      // Lấy tất cả giường (bao gồm cả trống và đã phân)
      const bedsResponse = await bedService.getAllBeds();
      console.log('All beds response:', bedsResponse);
      
      // Lấy danh sách room types để map type_name
      const roomTypesResponse = await roomTypeService.getAllRoomTypes();
      if (roomTypesResponse.success) {
        setRoomTypes(roomTypesResponse.data || []);
        console.log('Room types loaded:', roomTypesResponse.data?.length);
      }
      
      // Lấy danh sách care plans để hiển thị plan_name
      const carePlansResponse = await carePlanService.getCarePlans();
      if (carePlansResponse && Array.isArray(carePlansResponse)) {
        setCarePlans(carePlansResponse);
        console.log('Care plans loaded:', carePlansResponse.length);
      }
      
      if (bedsResponse.success) {
        const beds = bedsResponse.data || [];
        setAllBeds(beds);
        setFilteredBeds(beds);
        
        // Phân chia giường trống và đã phân
        const occupied = beds.filter(bed => bed.status === 'occupied' || bed.is_assigned);
        const available = beds.filter(bed => bed.status === 'available' && !bed.is_assigned);
        
        console.log('Occupied beds:', occupied.length);
        console.log('Available beds:', available.length);
        
        setBedAssignments(occupied);
        setAvailableBeds(available);
      } else {
        throw new Error('Không thể tải danh sách giường');
      }
    } catch (error) {
      console.error('Error loading beds:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách giường');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBedAssignments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBedAssignments();
    setRefreshing(false);
  };

  const filterBeds = () => {
    let filtered = [];

    if (selectedFilter === 'all') {
      filtered = allBeds;
    } else if (selectedFilter === 'occupied') {
      filtered = allBeds.filter(bed => bed.status === 'occupied' || bed.is_assigned);
    } else if (selectedFilter === 'available') {
      filtered = allBeds.filter(bed => bed.status === 'available' && !bed.is_assigned);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(bed => 
        bed.resident_id?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bed.bed_number?.toString().includes(searchQuery) ||
        bed.room_id?.room_number?.toString().includes(searchQuery)
      );
    }

    setFilteredBeds(filtered);
  };

  useEffect(() => {
    filterBeds();
  }, [allBeds, searchQuery, selectedFilter]);

  const getStatusColor = (bed) => {
    if (bed.status === 'available' && !bed.is_assigned) {
      return COLORS.success; // Available
    } else if (bed.is_assigned && !bed.unassigned_date) {
      return COLORS.primary; // Occupied
    } else if (bed.unassigned_date) {
      return '#e74c3c'; // Left
    }
    return COLORS.primary; // Default
  };

  const getStatusText = (bed) => {
    if (bed.status === 'available' && !bed.is_assigned) {
      return 'Trống';
    } else if (bed.is_assigned && !bed.unassigned_date) {
      return 'Đang ở';
    } else if (bed.unassigned_date) {
      return 'Đã rời giường';
    }
    return 'Đã phân công';
  };

  const getBedTypeText = (bedType) => {
    switch (bedType) {
      case 'standard': return 'Tiêu chuẩn';
      case 'premium': return 'Cao cấp';
      case 'vip': return 'VIP';
      case 'medical': return 'Y tế';
      default: return bedType || 'Không xác định';
    }
  };

  // Lấy type_name từ room_type
  const getRoomTypeName = (roomTypeCode) => {
    if (!roomTypeCode || !roomTypes.length) return roomTypeCode || 'Chưa xác định';
    
    const roomType = roomTypes.find(rt => rt.room_type === roomTypeCode);
    return roomType?.type_name || roomTypeCode || 'Chưa xác định';
  };

  // Lấy plan_name từ main_care_plan_id
  const getMainCarePlanName = (mainCarePlanId) => {
    if (!mainCarePlanId || !carePlans.length) return 'Chưa xác định';
    
    const carePlan = carePlans.find(cp => cp._id === mainCarePlanId);
    return carePlan?.plan_name || 'Chưa xác định';
  };

  // Tính tuổi từ date_of_birth
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'Chưa có thông tin';
    
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age.toString();
    } catch (error) {
      console.error('Error calculating age:', error);
      return 'Chưa có thông tin';
    }
  };

  // Xử lý khi bấm vào giường trống để phân giường
  const handleAvailableBedPress = async (bed) => {
    setSelectedBed(bed);
    setLoadingResidents(true);
    setShowResidentModal(true);
    
    try {
      // Lấy tất cả residents
      const residentsResponse = await residentService.getAllResidents();
      
      // Lấy tất cả bed assignments (cả active và inactive)
      const bedAssignmentsResponse = await bedAssignmentService.getAllBedAssignmentsIncludingInactive();
      
      // Lấy tất cả care plan assignments để kiểm tra điều kiện
      const carePlanAssignmentsResponse = await carePlanAssignmentService.getAllCarePlanAssignments();
      
      if (residentsResponse.success && bedAssignmentsResponse.success) {
        const allResidents = residentsResponse.data || [];
        const allBedAssignments = bedAssignmentsResponse.data || [];
        const allCarePlanAssignments = carePlanAssignmentsResponse?.data || carePlanAssignmentsResponse || [];
        
        // Lọc ra những residents chưa có giường hoặc đã rời giường và thỏa điều kiện
        const unassignedResidents = allResidents.filter(resident => {
          // Tìm bed assignment của resident này
          const bedAssignment = allBedAssignments.find(ba => 
            ba.resident_id === resident._id || 
            ba.resident_id?._id === resident._id
          );
          
          // Resident chưa phân giường hoặc đã rời giường (có unassigned_date)
          const isUnassigned = !bedAssignment || bedAssignment.unassigned_date !== null;
          
          if (!isUnassigned) return false;
          
          // Kiểm tra điều kiện phòng nếu có thông tin room
          if (bed.room_id) {
            const roomGender = bed.room_id.gender;
            const roomMainCarePlanId = bed.room_id.main_care_plan_id;
            const roomType = bed.room_id.room_type;
            
            // Tìm care plan assignment của resident
            const residentCarePlanAssignment = allCarePlanAssignments.find(cpa =>
              cpa.resident_id === resident._id || cpa.resident_id?._id === resident._id
            );
            
            // Kiểm tra giới tính khớp
            if (roomGender && resident.gender) {
              if (roomGender !== resident.gender) {
                return false;
              }
            }
            
            // Kiểm tra loại phòng khớp
            if (roomType && residentCarePlanAssignment?.selected_room_type) {
              if (roomType !== residentCarePlanAssignment.selected_room_type) {
                return false;
              }
            }
            
            // Kiểm tra dịch vụ chính khớp
            if (roomMainCarePlanId && residentCarePlanAssignment?.care_plan_ids) {
              const carePlanIds = Array.isArray(residentCarePlanAssignment.care_plan_ids)
                ? residentCarePlanAssignment.care_plan_ids
                : [residentCarePlanAssignment.care_plan_ids];
              
              // Kiểm tra xem có care plan nào có category 'main' và khớp với main_care_plan_id không
              const hasMatchingMainCarePlan = carePlanIds.some(cpId => {
                const carePlan = carePlans.find(cp => cp._id === cpId || cp._id === cpId._id);
                return carePlan && carePlan.category === 'main' && carePlan._id === roomMainCarePlanId;
              });
              
              if (!hasMatchingMainCarePlan) {
                return false;
              }
            }
          }
          
          return true;
        });
        
        console.log('All residents:', allResidents.length);
        console.log('All bed assignments:', allBedAssignments.length);
        console.log('Unassigned residents:', unassignedResidents.length);
        
        setUnassignedResidents(unassignedResidents);
      } else {
        Alert.alert('Lỗi', 'Không thể lấy danh sách cư dân chưa phân giường');
        setShowResidentModal(false);
      }
    } catch (error) {
      console.error('Error loading unassigned residents:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách cư dân chưa phân giường');
      setShowResidentModal(false);
    } finally {
      setLoadingResidents(false);
    }
  };

  // Xử lý phân giường cho resident
  const handleAssignBed = async (resident) => {
    if (!selectedBed || !resident) return;
    
    setAssigningBed(true);
    try {
      const assignmentData = {
        resident_id: resident._id,
        bed_id: selectedBed._id,
        assigned_date: new Date().toISOString(),
      };
      
      const response = await bedAssignmentService.createBedAssignment(assignmentData);
      if (response.success) {
        Alert.alert(
          'Thành công', 
          `Đã phân giường ${selectedBed.bed_number} cho ${resident.full_name}`,
          [{ 
            text: 'OK', 
            onPress: () => {
              setShowResidentModal(false);
              loadBedAssignments(); // Reload data
            }
          }]
        );
      } else {
        Alert.alert('Lỗi', response.error || 'Không thể phân giường');
      }
    } catch (error) {
      console.error('Error assigning bed:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi phân giường');
    } finally {
      setAssigningBed(false);
    }
  };

  // Xử lý hủy phân giường
  const handleUnassignBed = async (bed) => {
    if (!bed.assignment_id) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin phân giường');
      return;
    }

    Alert.alert(
      'Xác nhận hủy phân giường',
      `Bạn có chắc chắn muốn hủy phân giường ${bed.bed_number} cho ${bed.resident_id?.full_name || 'cư dân này'}?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xác nhận',
          style: 'destructive',
          onPress: async () => {
            setUnassigningBed(true);
            try {
              const response = await bedAssignmentService.unassignBed(bed.assignment_id);
              if (response.success) {
                Alert.alert(
                  'Thành công',
                  `Đã hủy phân giường ${bed.bed_number}`,
                  [{ 
                    text: 'OK', 
                    onPress: () => {
                      loadBedAssignments(); // Reload data
                    }
                  }]
                );
              } else {
                Alert.alert('Lỗi', response.error || 'Không thể hủy phân giường');
              }
            } catch (error) {
              console.error('Error unassigning bed:', error);
              Alert.alert('Lỗi', 'Có lỗi xảy ra khi hủy phân giường');
            } finally {
              setUnassigningBed(false);
            }
          },
        },
      ]
    );
  };

  const renderBedItem = ({ item }) => {
    const isAvailable = item.status === 'available' && !item.is_assigned;
    const isOccupied = item.is_assigned && !item.unassigned_date;
    
    return (
      <TouchableOpacity
        onPress={() => {
          if (isAvailable) {
            handleAvailableBedPress(item);
          }
        }}
        disabled={!isAvailable}
      >
        <Card style={[
          styles.bedCard,
          isAvailable && styles.availableBedCard
        ]}>
          <Card.Content>
            <View style={styles.bedHeader}>
              <View style={styles.bedInfo}>
                <Text style={styles.bedNumber}>Giường {item.bed_number}</Text>
                <Chip
                  mode="outlined"
                  textStyle={{ color: getStatusColor(item) }}
                  style={[styles.statusChip, { borderColor: getStatusColor(item) }]}
                >
                  {getStatusText(item)}
                </Chip>
              </View>
              {isAvailable && (
                <TouchableOpacity
                  onPress={() => handleAvailableBedPress(item)}
                  style={styles.assignButton}
                >
                  <MaterialIcons name="person-add" size={24} color={COLORS.primary} />
                </TouchableOpacity>
              )}
              {isOccupied && (
                <TouchableOpacity
                  onPress={() => handleUnassignBed(item)}
                  style={styles.unassignButton}
                  disabled={unassigningBed}
                >
                  {unassigningBed ? (
                    <ActivityIndicator size="small" color="#e74c3c" />
                  ) : (
                    <MaterialIcons name="close" size={24} color="#e74c3c" />
                  )}
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.bedDetails}>
              <View style={styles.detailRow}>
                <MaterialIcons name="bed" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Loại: {getBedTypeText(item.bed_type)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="room" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Phòng: {item.room_id?.room_number || 'Chưa có phòng'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="home" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Loại phòng: {getRoomTypeName(item.room_id?.room_type)}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="stairs" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Tầng: {item.room_id?.floor || 'Chưa xác định'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="people" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Giới tính: {item.room_id?.gender === 'male' ? 'Nam' : item.room_id?.gender === 'female' ? 'Nữ' : 'Chưa xác định'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="hotel" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Số giường: {item.room_id?.bed_count || 'Chưa xác định'}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <MaterialIcons name="medical-services" size={16} color="#666" />
                <Text style={styles.detailText}>
                  Dịch vụ chính: {getMainCarePlanName(item.room_id?.main_care_plan_id)}
                </Text>
              </View>
              {item.resident_id && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="person" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Cư dân: {item.resident_id.full_name}
                  </Text>
                </View>
              )}
              {item.assigned_date && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="calendar-today" size={16} color="#666" />
                  <Text style={styles.detailText}>
                    Ngày phân công: {new Date(item.assigned_date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}
              {item.unassigned_date && (
                <View style={styles.detailRow}>
                  <MaterialIcons name="event-busy" size={16} color="#e74c3c" />
                  <Text style={[styles.detailText, { color: '#e74c3c' }]}>
                    Ngày rời giường: {new Date(item.unassigned_date).toLocaleDateString('vi-VN')}
                  </Text>
                </View>
              )}
              {isAvailable && (
                <View style={styles.availableIndicator}>
                  <MaterialIcons name="touch-app" size={16} color={COLORS.primary} />
                  <Text style={styles.availableText}>Nhấn để phân giường</Text>
                </View>
              )}
            </View>
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="bed-empty" size={64} color="#ccc" />
      <Text style={styles.emptyText}>Chưa có giường nào</Text>
      <Text style={styles.emptySubtext}>
        Nhấn nút + để thêm giường mới
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Quản lý phân giường" />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Tìm kiếm giường..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          onSubmitEditing={filterBeds}
          style={styles.searchBar}
          icon="magnify"
        />

        {/* Filter Menu */}
        <View style={styles.filterMenu}>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('all')}
            selected={selectedFilter === 'all'}
            style={styles.filterChip}
          >
            Tất cả
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('occupied')}
            selected={selectedFilter === 'occupied'}
            style={styles.filterChip}
          >
            Đang ở
          </Chip>
          <Chip
            mode="outlined"
            onPress={() => setSelectedFilter('available')}
            selected={selectedFilter === 'available'}
            style={styles.filterChip}
          >
            Trống
          </Chip>
        </View>

        {/* Active Filters */}
        {(searchQuery || selectedFilter !== 'all') && (
          <View style={styles.activeFilters}>
            <Text style={styles.filterLabel}>Bộ lọc:</Text>
            {searchQuery && (
              <Chip
                mode="outlined"
                onClose={() => setSearchQuery('')}
                style={styles.filterChip}
              >
                Tìm kiếm: "{searchQuery}"
              </Chip>
            )}
            {selectedFilter !== 'all' && (
              <Chip
                mode="outlined"
                onClose={() => setSelectedFilter('all')}
                style={styles.filterChip}
              >
                Trạng thái: {getStatusText({ unassigned_date: selectedFilter === 'available' })}
              </Chip>
            )}
          </View>
        )}

        {loading ? (
          <ActivityIndicator size="large" style={styles.loadingIndicator} />
        ) : (
          <FlatList
            data={filteredBeds}
            renderItem={renderBedItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            ListEmptyComponent={renderEmptyState}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Modal để chọn resident */}
      <Modal
        visible={showResidentModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResidentModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Chọn cư dân cho giường {selectedBed?.bed_number}
              </Text>
              <TouchableOpacity
                onPress={() => setShowResidentModal(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {loadingResidents ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách cư dân...</Text>
              </View>
            ) : (
              <ScrollView style={styles.modalContent}>
                {unassignedResidents.length === 0 ? (
                  <View style={styles.emptyResidents}>
                    <MaterialIcons name="person-off" size={64} color="#ccc" />
                    <Text style={styles.emptyResidentsText}>
                      Không có cư dân nào chưa được phân giường
                    </Text>
                  </View>
                ) : (
                  unassignedResidents.map((resident) => (
                    <TouchableOpacity
                      key={resident._id}
                      style={styles.residentItem}
                      onPress={() => handleAssignBed(resident)}
                      disabled={assigningBed}
                    >
                      <View style={styles.residentInfo}>
                        <MaterialIcons name="person" size={20} color={COLORS.primary} />
                        <View style={styles.residentDetails}>
                          <Text style={styles.residentName}>{resident.full_name}</Text>
                          <Text style={styles.residentAge}>
                            Tuổi: {calculateAge(resident.date_of_birth)}
                          </Text>
                          <Text style={styles.residentGender}>
                            Giới tính: {resident.gender === 'male' ? 'Nam' : 'Nữ'}
                          </Text>
                        </View>
                      </View>
                      <MaterialIcons name="chevron-right" size={24} color="#666" />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            )}

            {assigningBed && (
              <View style={styles.assigningOverlay}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.assigningText}>Đang phân giường...</Text>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    elevation: 2,
    paddingTop: 0, // Loại bỏ padding mặc định
    paddingBottom: 0, // Loại bỏ padding mặc định
    height: 56, // Chiều cao cố định
    justifyContent: 'center', // Căn giữa nội dung theo chiều dọc
    alignItems: 'center', // Căn giữa theo chiều ngang
  },
  content: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  filterButton: {
    padding: 8,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filterMenu: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingBottom: 8,
  },
  filterChip: {
    margin: 4,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 8,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  listContainer: {
    paddingBottom: 100,
  },
  bedCard: {
    marginBottom: 12,
    elevation: 2,
  },
  bedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bedNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 12,
  },
  statusChip: {
    height: 32,
  },
  menuButton: {
    padding: 4,
  },
  bedDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingIndicator: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  availableBedCard: {
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  assignButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: COLORS.primary + '20',
  },
  unassignButton: {
    padding: 4,
    borderRadius: 4,
    backgroundColor: '#e74c3c20',
  },
  availableIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 8,
    backgroundColor: COLORS.primary + '10',
    borderRadius: 4,
  },
  availableText: {
    marginLeft: 4,
    fontSize: 12,
    color: COLORS.primary,
    fontStyle: 'italic',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    width: '90%',
    maxHeight: '80%',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  modalContent: {
    maxHeight: 400,
    padding: 16,
  },
  emptyResidents: {
    alignItems: 'center',
    padding: 40,
  },
  emptyResidentsText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
  },
  residentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    backgroundColor: 'white',
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  residentDetails: {
    marginLeft: 12,
    flex: 1,
  },
  residentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  residentAge: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  residentGender: {
    fontSize: 14,
    color: '#666',
  },
  assigningOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  assigningText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});

export default BedListScreen; 