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

// Mock data for tasks
export const mockTasks = [
  {
    id: '1',
    title: 'Medication Administration',
    description: 'Administer morning medications to John Doe',
    dueDate: '2024-03-15T09:00:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '1',
    residentName: 'John Doe',
    roomNumber: '101',
    category: 'Medication',
  },
  {
    id: '2',
    title: 'Blood Pressure Check',
    description: 'Check and record blood pressure for Mary Smith',
    dueDate: '2024-03-15T10:30:00',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '2',
    residentName: 'Mary Smith',
    roomNumber: '102',
    category: 'Vitals',
  },
  {
    id: '3',
    title: 'Physical Therapy Session',
    description: 'Assist William Johnson with PT exercises',
    dueDate: '2024-03-15T13:00:00',
    priority: 'Medium',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '3',
    residentName: 'William Johnson',
    roomNumber: '103',
    category: 'Therapy',
  },
  {
    id: '4',
    title: 'Wound Dressing Change',
    description: 'Change wound dressing for Patricia Brown',
    dueDate: '2024-03-15T11:15:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '4',
    residentName: 'Patricia Brown',
    roomNumber: '104',
    category: 'Treatment',
  },
  {
    id: '5',
    title: 'Social Activity',
    description: 'Escort Richard Miller to group activity in common room',
    dueDate: '2024-03-15T14:30:00',
    priority: 'Low',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '5',
    residentName: 'Richard Miller',
    roomNumber: '105',
    category: 'Activity',
  },
  {
    id: '6',
    title: 'Medication Administration',
    description: 'Administer afternoon medications to John Doe',
    dueDate: '2024-03-15T15:00:00',
    priority: 'High',
    status: 'Pending',
    assignedTo: 'Jane Wilson',
    residentId: '1',
    residentName: 'John Doe',
    roomNumber: '101',
    category: 'Medication',
  },
  {
    id: '7',
    title: 'Change Bed Linens',
    description: 'Change bed linens for Mary Smith',
    dueDate: '2024-03-15T10:00:00',
    priority: 'Low',
    status: 'Completed',
    completedAt: '2024-03-15T09:45:00',
    assignedTo: 'Jane Wilson',
    residentId: '2',
    residentName: 'Mary Smith',
    roomNumber: '102',
    category: 'Housekeeping',
  },
];

const TaskListScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all'); // all, pending, completed, overdue
  const [activeSort, setActiveSort] = useState('time'); // time, priority, resident
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Simulating API fetch
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 800);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulating refresh
    setTimeout(() => {
      setTasks(mockTasks);
      setRefreshing(false);
    }, 1000);
  };

  const getFilteredTasks = () => {
    let filtered = [...tasks];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.residentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.roomNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply status filter
    switch (activeFilter) {
      case 'pending':
        filtered = filtered.filter(task => task.status === 'Pending');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'Completed');
        break;
      case 'overdue':
        const now = new Date();
        filtered = filtered.filter(
          task => 
            task.status === 'Pending' && 
            new Date(task.dueDate) < now
        );
        break;
      default:
        // 'all' - no filtering
        break;
    }

    // Apply sorting
    switch (activeSort) {
      case 'time':
        filtered.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
        break;
      case 'priority':
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
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

  const markTaskCompleted = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'Completed',
              completedAt: new Date().toISOString(),
            }
          : task
      )
    );
  };

  const markTaskPending = (taskId) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              status: 'Pending',
              completedAt: null,
            }
          : task
      )
    );
  };

  const renderTaskItem = ({ item }) => {
    const dueDate = new Date(item.dueDate);
    const isOverdue = dueDate < new Date() && item.status === 'Pending';
    
    // Format the due time
    const dueTime = dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Calculate if the task is due today
    const today = new Date();
    const isToday = 
      dueDate.getDate() === today.getDate() &&
      dueDate.getMonth() === today.getMonth() &&
      dueDate.getFullYear() === today.getFullYear();
      
    // Calculate the date string to display
    let dateString = isToday ? 'Today' : dueDate.toLocaleDateString();
    
    return (
      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        <View style={styles.taskHeader}>
          <View style={styles.taskTitleContainer}>
            <Text style={styles.taskTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Chip
              style={[
                styles.priorityChip,
                {
                  backgroundColor:
                    item.priority === 'High'
                      ? COLORS.error + '20'
                      : item.priority === 'Medium'
                      ? COLORS.warning + '20'
                      : COLORS.info + '20',
                },
              ]}
              textStyle={{
                color:
                  item.priority === 'High'
                    ? COLORS.error
                    : item.priority === 'Medium'
                    ? COLORS.warning
                    : COLORS.info,
                ...FONTS.body3,
              }}
            >
              {item.priority}
            </Chip>
          </View>
          
          <View style={styles.taskStatusContainer}>
            <Chip
              style={[
                styles.statusChip,
                {
                  backgroundColor:
                    item.status === 'Completed'
                      ? COLORS.success + '20'
                      : isOverdue
                      ? COLORS.error + '20'
                      : COLORS.primary + '20',
                },
              ]}
              textStyle={{
                color:
                  item.status === 'Completed'
                    ? COLORS.success
                    : isOverdue
                    ? COLORS.error
                    : COLORS.primary,
                ...FONTS.body3,
              }}
            >
              {item.status === 'Completed' ? 'Completed' : isOverdue ? 'Overdue' : 'Pending'}
            </Chip>
          </View>
        </View>
        
        <View style={styles.taskResidentInfo}>
          <MaterialIcons name="person" size={16} color={COLORS.textSecondary} />
          <Text style={styles.taskResidentName}>{item.residentName}</Text>
          <Text style={styles.taskRoomNumber}>Room {item.roomNumber}</Text>
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
            {item.status === 'Pending' ? (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => markTaskCompleted(item.id)}
              >
                <MaterialIcons name="check-circle" size={24} color={COLORS.success} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.undoButton}
                onPress={() => markTaskPending(item.id)}
              >
                <MaterialIcons name="undo" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmptyList = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="checkbox-marked-outline" size={60} color={COLORS.textSecondary} />
      <Text style={styles.emptyText}>No tasks found</Text>
      {activeFilter !== 'all' && (
        <TouchableOpacity onPress={() => setActiveFilter('all')}>
          <Text style={styles.emptyActionText}>Clear filters</Text>
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
        <Appbar.Content title="Tasks" />
        <Appbar.Action icon="bell" onPress={() => navigation.navigate('Notifications')} />
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
            title="Sort by Time"
            leadingIcon="clock-outline"
            titleStyle={activeSort === 'time' ? styles.activeMenuText : null}
          />
          <Menu.Item
            onPress={() => {
              setActiveSort('priority');
              setSortMenuVisible(false);
            }}
            title="Sort by Priority"
            leadingIcon="flag-outline"
            titleStyle={activeSort === 'priority' ? styles.activeMenuText : null}
          />
          <Menu.Item
            onPress={() => {
              setActiveSort('resident');
              setSortMenuVisible(false);
            }}
            title="Sort by Resident"
            leadingIcon="account-outline"
            titleStyle={activeSort === 'resident' ? styles.activeMenuText : null}
          />
        </Menu>
      </Appbar.Header>

      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search tasks, residents or rooms..."
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
              All
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
              Pending
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
              Completed
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
              Overdue
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

      <FAB
        style={styles.fab}
        icon="plus"
        onPress={() => navigation.navigate('AddTask')}
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
    alignItems: 'center',
    marginBottom: 8,
  },
  taskTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    height: 24,
  },
  taskStatusContainer: {
    marginLeft: 8,
  },
  statusChip: {
    height: 24,
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