import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, Button, Divider, Chip, Avatar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Mock tasks data - in a real app, this would come from an API or Redux store
import { mockTasks } from './TaskListScreen';

const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulating API loading
    setTimeout(() => {
      // Find the task with the given ID from the mock data
      const foundTask = mockTasks.find(t => t.id === taskId);
      setTask(foundTask);
      setLoading(false);
    }, 500);
  }, [taskId]);
  
  const markTaskCompleted = () => {
    Alert.alert(
      "Hoàn thành nhiệm vụ",
      "Bạn có chắc chắn muốn đánh dấu nhiệm vụ này là đã hoàn thành?",
      [
        { text: "Hủy bỏ", style: "cancel" },
        { 
          text: "Hoàn thành", 
          onPress: () => {
            // In a real app, update via API/Redux
            setTask({...task, status: 'Completed'});
            // Then navigate back after a delay
            setTimeout(() => {
              navigation.goBack();
            }, 1000);
          }
        }
      ]
    );
  };
  
  const deleteTask = () => {
    Alert.alert(
      "Xóa nhiệm vụ",
      "Bạn có chắc chắn muốn xóa nhiệm vụ này?",
      [
        { text: "Hủy bỏ", style: "cancel" },
        { 
          text: "Xóa", 
          style: "destructive",
          onPress: () => {
            // In a real app, delete via API/Redux
            // Then navigate back
            navigation.goBack();
          }
        }
      ]
    );
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Cao':
        return COLORS.error;
      case 'Trung bình':
        return COLORS.warning;
      case 'Thấp':
        return COLORS.info;
      default:
        return COLORS.info;
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return COLORS.success;
      case 'Pending':
        return COLORS.warning;
      case 'Overdue':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };
  
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };
  
  const getFormattedTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading || !task) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chi tiết nhiệm vụ" />
        </Appbar.Header>
              <View style={styles.loadingContainer}>
        <Text>Đang tải...</Text>
      </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chi tiết nhiệm vụ" />
        <Appbar.Action icon="pencil" onPress={() => navigation.navigate('EditTask', { taskId })} />
        <Appbar.Action icon="delete" onPress={deleteTask} />
      </Appbar.Header>
      
      <ScrollView style={styles.content}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <View style={styles.chipContainer}>
            <Chip
              style={[styles.chip, { backgroundColor: getPriorityColor(task.priority) + '20' }]}
              textStyle={{ color: getPriorityColor(task.priority) }}
            >
              Ưu tiên {task.priority}
            </Chip>
            <Chip
              style={[styles.chip, { backgroundColor: getStatusColor(task.status) + '20' }]}
              textStyle={{ color: getStatusColor(task.status) }}
            >
              {task.status}
            </Chip>
          </View>
        </View>
        
        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <MaterialIcons name="schedule" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Hạn hoàn thành:</Text>
            <Text style={styles.infoValue}>
              {getFormattedDate(task.dueDate)} at {getFormattedTime(task.dueDate)}
            </Text>
          </View>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="category" size={20} color={COLORS.primary} />
            <Text style={styles.infoLabel}>Danh mục:</Text>
            <Text style={styles.infoValue}>{task.category}</Text>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.residentSection}>
          <Text style={styles.sectionTitle}>Cư dân</Text>
          <View style={styles.residentInfo}>
            <Avatar.Text 
              size={50} 
              label={task.residentName.split(' ').map(n => n[0]).join('')}
              style={{ backgroundColor: COLORS.accent }}
            />
            <View style={styles.residentTextInfo}>
              <Text style={styles.residentName}>{task.residentName}</Text>
              <Text style={styles.roomNumber}>Phòng {task.roomNumber}</Text>
            </View>
          </View>
        </View>
        
        <Divider style={styles.divider} />
        
        <View style={styles.descriptionSection}>
          <Text style={styles.sectionTitle}>Mô tả</Text>
          <Text style={styles.descriptionText}>{task.description}</Text>
        </View>
        
        <View style={styles.assigneeSection}>
          <Text style={styles.sectionTitle}>Được giao cho</Text>
          <View style={styles.assigneeInfo}>
            <Avatar.Text 
              size={40}
              label={task.assignedTo.split(' ').map(n => n[0]).join('')} 
              style={{ backgroundColor: COLORS.primary }}
            />
            <Text style={styles.assigneeName}>{task.assignedTo}</Text>
          </View>
        </View>
      </ScrollView>
      
      {task.status !== 'Completed' && (
        <View style={styles.bottomBar}>
          <Button 
            mode="contained" 
            icon="check-circle"
            onPress={markTaskCompleted}
            style={styles.completeButton}
          >
            Đánh dấu hoàn thành
          </Button>
        </View>
      )}
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
  content: {
    flex: 1,
  },
  taskHeader: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  taskTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginBottom: 12,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 8,
    marginBottom: 8,
  },
  infoSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginRight: 4,
  },
  infoValue: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  divider: {
    height: 8,
    backgroundColor: COLORS.background,
  },
  residentSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  residentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  residentTextInfo: {
    marginLeft: 16,
  },
  residentName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  roomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  descriptionSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  descriptionText: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 22,
  },
  assigneeSection: {
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    marginBottom: 80, // For bottom bar space
  },
  assigneeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  assigneeName: {
    ...FONTS.body2,
    color: COLORS.text,
    marginLeft: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  completeButton: {
    backgroundColor: COLORS.success,
  },
});

export default TaskDetailScreen; 