import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Appbar, FAB, Chip, Searchbar, Menu, Divider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import staffAssignmentService from '../../api/services/staffAssignmentService';
import vitalSignsService from '../../api/services/vitalSignsService';
import assessmentService from '../../api/services/assessmentService';

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed, overdue
  const [activeSort, setActiveSort] = useState('time'); // time, priority, resident
  const [refreshing, setRefreshing] = useState(false);

  const isSameDayVN = (dateStr) => {
    if (!dateStr) return false;
    const tz = 'Asia/Ho_Chi_Minh';
    const now = new Date();
    const d = new Date(dateStr);
    const [y1, m1, day1] = now
      .toLocaleDateString('vi-VN', { timeZone: tz })
      .split('/')
      .map(Number);
    const [y2, m2, day2] = d
      .toLocaleDateString('vi-VN', { timeZone: tz })
      .split('/')
      .map(Number);
    return y1 === y2 && m1 === m2 && day1 === day2;
  };

  const buildTasksFromAssignments = async () => {
    setLoading(true);
    try {
      const assignRes = await staffAssignmentService.getMyAssignments();
      console.log('🔍 Staff assignments response:', assignRes);
      
      if (!assignRes.success) {
        console.log('❌ Failed to get staff assignments:', assignRes.error);
        setTasks([]);
        setLoading(false);
        return;
      }
      const assignments = Array.isArray(assignRes.data) ? assignRes.data : [];
      console.log('📋 Found assignments:', assignments.length);

      const taskPromises = assignments.map(async (asg) => {
        const resident = asg.resident_id || asg.resident || {};
        const residentId = resident._id || asg.resident_id || asg.residentId;
        const residentName = resident.full_name || resident.name || 'Không rõ tên';
        
        console.log('👤 Processing resident:', { residentId, residentName });

        // Get bed assignment info
        let roomNumber = '—';
        try {
          console.log('🛏️ Fetching bed assignment for resident:', residentId);
          const bedRes = await staffAssignmentService.getBedAssignmentByResidentId(residentId);
          console.log('🛏️ Bed assignment response:', bedRes);
          
          if (bedRes.success && bedRes.data && bedRes.data.length > 0) {
            const bedAssignment = bedRes.data[0]; // Get the latest assignment
            console.log('🛏️ Bed assignment data:', bedAssignment);
            
            const room = bedAssignment.bed_id?.room_id;
            const bed = bedAssignment.bed_id;
            console.log('🏠 Room data:', room);
            console.log('🛏️ Bed data:', bed);
            
            if (room && bed) {
              roomNumber = `Phòng ${room.room_number} - Giường ${bed.bed_number}`;
            } else if (room) {
              roomNumber = `Phòng ${room.room_number}`;
            } else if (bed) {
              roomNumber = `Giường ${bed.bed_number}`;
            }
            console.log('📍 Final room number:', roomNumber);
          } else {
            console.log('⚠️ No bed assignment found for resident:', residentId);
          }
        } catch (error) {
          console.log('❌ Error fetching bed assignment:', error);
        }

        // Check today's vitals
        const vitalsRes = await vitalSignsService.getVitalSignsByResidentId(residentId);
        const hasTodayVitals = vitalsRes.success && Array.isArray(vitalsRes.data)
          ? vitalsRes.data.some(v => isSameDayVN(v.date_time || v.created_at || v.date))
          : false;

        // Check today's assessments
        const assessRes = await assessmentService.getAssessmentsByResidentId(residentId);
        const hasTodayAssessment = assessRes.success && Array.isArray(assessRes.data)
          ? assessRes.data.some(a => isSameDayVN(a.created_at || a.assessment_date || a.date))
          : false;

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 0, 0);

        return [
          {
            id: `vitals_${residentId}`,
            type: 'vitals',
            residentId,
            residentName,
            roomNumber,
            title: 'Ghi nhận chỉ số sinh hiệu',
            description: `Ghi nhận sinh hiệu hôm nay cho ${residentName}`,
            dueDate: endOfDay.toISOString(),
            status: hasTodayVitals ? 'Hoàn thành' : 'Chờ xử lý',
            category: 'Sinh hiệu',
          },
          {
            id: `assessment_${residentId}`,
            type: 'assessment',
            residentId,
            residentName,
            roomNumber,
            title: 'Thực hiện đánh giá',
            description: `Đánh giá tình trạng hôm nay cho ${residentName}`,
            dueDate: endOfDay.toISOString(),
            status: hasTodayAssessment ? 'Hoàn thành' : 'Chờ xử lý',
            category: 'Đánh giá',
          },
        ];
      });

      const tasksNested = await Promise.all(taskPromises);
      const builtTasks = tasksNested.flat();
      console.log('✅ Built tasks:', builtTasks);
      setTasks(builtTasks);
    } catch (e) {
      console.log('❌ Load tasks from assignments error:', e);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    buildTasksFromAssignments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    buildTasksFromAssignments().finally(() => setRefreshing(false));
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    if (searchQuery) {
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          String(task.roomNumber).toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter(task => task.status === 'Chờ xử lý');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'Hoàn thành');
        break;
      case 'overdue':
        const now = new Date();
        filtered = filtered.filter(
          task => 
            task.status === 'Chờ xử lý' && 
            new Date(task.dueDate) < now
        );
        break;
      default:
        break;
    }

    switch (activeSort) {
      case 'time':
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        break;
      case 'priority':
        const priorityOrder = { Cao: 1, 'Trung bình': 2, Thấp: 3 };
        filtered.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        break;
      case 'resident':
        filtered.sort((a, b) => a.residentName.localeCompare(b.residentName));
        break;
      default:
        break;
    }

    return filtered;
  };

  const handlePressTask = (item) => {
    if (item.type === 'vitals') {
      navigation.navigate('RecordVitals', { residentId: item.residentId });
    } else if (item.type === 'assessment') {
      navigation.navigate('AddAssessment', { residentId: item.residentId });
    } else {
      navigation.navigate('TaskDetail', { task: item });
    }
  };

  const renderTaskItem = ({ item }) => {
    const dueDate = new Date(item.dueDate);
    const isOverdue = dueDate < new Date() && item.status === 'Chờ xử lý';
    const dueTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const today = new Date();
    const isToday = 
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear();
    let dateString = isToday ? 'Hôm nay' : dueDate.toLocaleDateString('vi-VN');

    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => handlePressTask(item)}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
          </View>
          
          <View style={styles.taskStatusContainer}>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === 'Hoàn thành'
                      ? COLORS.success + '20'
                      : isOverdue
                      ? COLORS.error + '20'
                      : COLORS.primary + '20',
                },
              ]}
              textStyle={{
                color:
                  item.status === 'Hoàn thành'
                    ? COLORS.success
                    : isOverdue
                    ? COLORS.error
                    : COLORS.primary,
                ...FONTS.body3,
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {item.status === 'Hoàn thành' ? 'Hoàn thành' : isOverdue ? 'Quá hạn' : 'Chờ xử lý'}
            </Chip>
          </View>
        </View>
        
        <View style={styles.taskResidentInfo}>
          <MaterialIcons name="person" size={16} color={COLORS.textSecondary} />
          <Text style={styles.taskResidentName}>{item.residentName}</Text>
          <Text style={styles.taskRoomNumber}>{item.roomNumber}</Text>
        </View>
        
        <Text style={styles.taskDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.taskFooter}>
          <View style={styles.taskTimeContainer}>
            <MaterialIcons name="schedule" size={16} color={COLORS.primary} />
            <Text
              style={[
                styles.taskDueTime,
                isOverdue && { color: COLORS.error },
              ]}
            >
              {dateString}, {dueTime}
            </Text>
          </View>
          
          <View style={styles.taskActions}>
            {item.status === 'Chờ xử lý' ? (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handlePressTask(item)}
              >
                <MaterialIcons name="play-circle" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            ) : (
              <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="checkbox-marked-outline" size={60} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>Không tìm thấy nhiệm vụ</Text>
      {activeFilter !== 'all' && (
        <TouchableOpacity onPress={() => setActiveFilter('all')}>
          <Text style={styles.emptyActionText}>Xóa bộ lọc</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.Content title="Nhiệm vụ" />
        <Appbar.Action icon="bell" onPress={() => navigation.navigate('ThongBao')} />
        <Menu
          visible={sortMenuVisible}
          onDismiss={() => setSortMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="sort"
              onPress={() => setSortMenuVisible(true)}
            />
          }
        >
          <Menu.Item
            onPress={() => {
              setActiveSort('time');
              setSortMenuVisible(false);
            }}
            title="Sắp xếp theo thời gian"
            leadingIcon="clock-outline"
            titleStyle={activeSort === 'time' ? styles.activeMenuText : null}
          />
          <Menu.Item
            onPress={() => {
              setActiveSort('priority');
              setSortMenuVisible(false);
            }}
            title="Sắp xếp theo độ ưu tiên"
            leadingIcon="flag-outline"
            titleStyle={activeSort === 'priority' ? styles.activeMenuText : null}
          />
          <Menu.Item
            onPress={() => {
              setActiveSort('resident');
              setSortMenuVisible(false);
            }}
            title="Sắp xếp theo cư dân"
            leadingIcon="account-outline"
            titleStyle={activeSort === 'resident' ? styles.activeMenuText : null}
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Tìm kiếm nhiệm vụ, cư dân hoặc phòng..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
Tất cả
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'pending' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('pending')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'pending' && styles.activeFilterText,
              ]}
            >
Chờ xử lý
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'completed' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('completed')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'completed' && styles.activeFilterText,
              ]}
            >
Hoàn thành
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterButton,
              activeFilter === 'overdue' && styles.activeFilterButton,
            ]}
            onPress={() => setActiveFilter('overdue')}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === 'overdue' && styles.activeFilterText,
              ]}
            >
Quá hạn
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredTasks()}
        renderItem={renderTaskItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmptyList}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />

      {/* Hidden create button for now */}
      {/* <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('CreateTask')}
        color={COLORS.surface}
      /> */}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.padding,
    paddingBottom: 15,
    borderBottomLeftRadius: SIZES.radius,
    borderBottomRightRadius: SIZES.radius,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.surface,
  },
  searchInput: {
    ...FONTS.body2,
  },
  filterContainer: {
    paddingVertical: 10,
    paddingHorizontal: SIZES.padding,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: COLORS.surface,
    minWidth: 80,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  activeFilterButton: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  activeFilterText: {
    color: COLORS.surface,
    fontWeight: 'bold',
  },
  listContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    marginBottom: 16,
    ...SHADOWS.small,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    minHeight: 40,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  taskTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
    flexWrap: 'wrap',
  },
  priorityChip: {
    height: 30,
    paddingHorizontal: 10,
    minWidth: 60,
    marginRight: 4,
  },
  taskStatusContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    minWidth: 90,
  },
  statusChip: {
    height: 30,
    paddingHorizontal: 10,
    minWidth: 90,
  },
  taskResidentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskResidentName: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 4,
    marginRight: 8,
  },
  taskRoomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  taskDescription: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 12,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskDueTime: {
    ...FONTS.body3,
    color: COLORS.primary,
    marginLeft: 4,
  },
  taskActions: {
    flexDirection: 'row',
  },
  completeButton: {
    padding: 4,
  },
  undoButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    ...FONTS.h4,
    color: COLORS.textSecondary,
    marginTop: 16,
  },
  emptyActionText: {
    ...FONTS.body2,
    color: COLORS.primary,
    marginTop: 16,
  },
  activeMenuText: {
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },
});

export default TaskListScreen; 