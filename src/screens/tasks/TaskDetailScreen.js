import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Appbar, Button, Divider, Chip, Avatar } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

const TaskDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { task } = route.params;

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
      case 'Hoàn thành':
        return COLORS.success;
      case 'Chờ xử lý':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };
  
  const getFormattedDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };
  
  const getFormattedTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleStart = () => {
    if (task.type === 'vitals') {
      navigation.replace('RecordVitals', { residentId: task.residentId });
    } else if (task.type === 'assessment') {
      navigation.replace('AddAssessment', { residentId: task.residentId });
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chi tiết nhiệm vụ" />
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
              {getFormattedDate(task.dueDate)} lúc {getFormattedTime(task.dueDate)}
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
      </ScrollView>
      
      {task.status !== 'Hoàn thành' && (
        <View style={styles.bottomBar}>
          <Button 
            mode="contained" 
            icon={task.type === 'vitals' ? 'stethoscope' : 'clipboard-text'}
            onPress={handleStart}
            style={styles.completeButton}
          >
            {task.type === 'vitals' ? 'Ghi nhận sinh hiệu' : 'Tạo đánh giá'}
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
    marginBottom: 80,
  },
  descriptionText: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 22,
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
    backgroundColor: COLORS.primary,
  },
});

export default TaskDetailScreen; 