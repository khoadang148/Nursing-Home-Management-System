import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Image, Alert } from 'react-native';
import { 
  Appbar, 
  Button, 
  Card, 
  Chip, 
  Divider, 
  List, 
  Text, 
  Avatar,
  IconButton,
  ActivityIndicator,
  Menu,
  Checkbox,
  TextInput,
  FAB
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityDetails, deleteActivity } from '../../redux/slices/activitySlice';

import dateUtils from '../../utils/dateUtils';

// Mock participants data
const MOCK_PARTICIPANTS = [
  { 
    id: '1', 
    name: 'Nguyễn Văn Nam', 
    room: 'Phòng 101-A', 
    status: 'pending',
    notes: '',
    attended: false
  },
  { 
    id: '2', 
    name: 'Trần Thị Lan', 
    room: 'Phòng 102-A', 
    status: 'pending',
    notes: '',
    attended: false
  },
];

const ActivityDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { activityId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);
  const [participants, setParticipants] = useState(MOCK_PARTICIPANTS);
  const [attendanceMode, setAttendanceMode] = useState(false);
  
  useEffect(() => {
    setLoading(true);
    dispatch(fetchActivityDetails(activityId))
      .unwrap()
      .then(data => {
        if (!data) {
          throw new Error('Không tìm thấy dữ liệu hoạt động');
        }
        setActivity(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching activity details:', error);
        Alert.alert(
          'Lỗi',
          'Không thể tải thông tin hoạt động. Vui lòng thử lại sau.',
          [
            { text: 'OK', onPress: () => navigation.goBack() }
          ]
        );
        setLoading(false);
      });
  }, [dispatch, activityId]);

  const handleAttendanceToggle = (participantId) => {
    setParticipants(prev => 
      prev.map(participant => 
        participant.id === participantId 
          ? { ...participant, attended: !participant.attended }
          : participant
      )
    );
  };

  const handleNotesChange = (participantId, notes) => {
    setParticipants(prev => 
      prev.map(participant => 
        participant.id === participantId 
          ? { ...participant, notes }
          : participant
      )
    );
  };

  const handleSaveAttendance = () => {
    // Simulate saving attendance
    Alert.alert(
      'Thành công',
      'Điểm danh đã được lưu thành công!',
      [{ text: 'OK' }]
    );
    setAttendanceMode(false);
  };

  const handleAddPhoto = () => {
    Alert.alert(
      'Thêm ảnh',
      'Chọn cách thêm ảnh',
      [
        { text: 'Chụp ảnh', onPress: () => console.log('Camera') },
        { text: 'Chọn từ thư viện', onPress: () => console.log('Gallery') },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };
  
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical':
        return <MaterialIcons name="fitness-center" size={32} color="#fff" />;
      case 'social':
        return <MaterialIcons name="people" size={32} color="#fff" />;
      case 'cognitive':
        return <MaterialCommunityIcons name="brain" size={32} color="#fff" />;
      case 'creative':
        return <MaterialIcons name="brush" size={32} color="#fff" />;
      case 'spiritual':
        return <MaterialCommunityIcons name="meditation" size={32} color="#fff" />;
      default:
        return <MaterialIcons name="event" size={32} color="#fff" />;
    }
  };
  
  const getActivityIconColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return COLORS.primary;
      case 'social': return COLORS.accent;
      case 'cognitive': return '#FF9500';
      case 'creative': return '#FF3B30';
      case 'spiritual': return '#5856D6';
      default: return COLORS.primary;
    }
  };
  
  const formatDate = (dateString) => {
    try {
      if (!dateString) return 'Chưa có thông tin';
      return dateUtils.formatDate(dateString, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Định dạng ngày không hợp lệ';
    }
  };
  
  const formatTime = (dateString) => {
    try {
      if (!dateString) return 'Chưa có thông tin';
      return dateUtils.formatTime(dateString);
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Định dạng giờ không hợp lệ';
    }
  };
  
  const getActivityTypeInVietnamese = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return 'Thể chất';
      case 'social': return 'Xã hội';
      case 'cognitive': return 'Nhận thức';
      case 'creative': return 'Sáng tạo';
      case 'spiritual': return 'Tâm linh';
      case 'recreational': return 'Giải trí';
      case 'educational': return 'Giáo dục';
      case 'therapeutic': return 'Trị liệu';
      default: return type || 'Khác';
    }
  };
  
  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);
  
  const handleDelete = () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn xóa hoạt động này?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
            try {
              await dispatch(deleteActivity(activityId)).unwrap();
              Alert.alert('Thành công', 'Đã xóa hoạt động');
              navigation.goBack();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa hoạt động');
            }
          }
        }
      ]
    );
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (!activity) {
    return (
      <View style={styles.errorContainer}>
        <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
        <Text style={styles.errorText}>Không tìm thấy hoạt động</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Quay lại
        </Button>
      </View>
    );
  }
  
  const activityIconColor = getActivityIconColor(activity.type);
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={activityIconColor} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: activityIconColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} iconColor="#fff" />
        <Appbar.Content title={activity.name} titleStyle={[FONTS.h2, { color: '#fff' }]} />
        
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon="dots-vertical" color="#fff" onPress={openMenu} />
          }
        >
          <Menu.Item onPress={() => { closeMenu(); navigation.navigate('HoatDong', { screen: 'EditActivityScreen', params: { activityId } }); }} title="Sửa" />
          <Menu.Item onPress={() => { closeMenu(); handleDelete(); }} title="Xóa" />
        </Menu>
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.headerCard}>
          <Card.Content style={styles.headerCardContent}>
            <View style={[styles.activityIconContainer, { backgroundColor: activityIconColor }]}>
              {getActivityIcon(activity.type)}
            </View>
            
            <View style={styles.headerInfo}>
              <Text style={FONTS.h3}>{activity.name}</Text>
              <View style={styles.dateTimeContainer}>
                <View style={styles.infoRow}>
                  <MaterialIcons name="event" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.dateText}>{formatDate(activity.scheduledTime)}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialIcons name="access-time" size={18} color={COLORS.textSecondary} />
                  <Text style={styles.timeText}>{formatTime(activity.scheduledTime)}</Text>
                </View>
              </View>
              
              <Chip 
                icon="tag" 
                style={[styles.typeChip, { backgroundColor: `${activityIconColor}20` }]}
                textStyle={{ color: activityIconColor }}
              >
                {getActivityTypeInVietnamese(activity.type)}
              </Chip>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.detailCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.descriptionText}>{activity.description || 'Chưa có mô tả'}</Text>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Chi tiết</Text>
            <List.Item
              title="Địa điểm"
              description={activity.location || 'Chưa có thông tin'}
              left={props => <List.Icon {...props} icon="map-marker" color={COLORS.primary} />}
            />
            <List.Item
              title="Thời lượng"
              description={activity.durationMinutes ? `${activity.durationMinutes} phút` : 'Chưa có thông tin'}
              left={props => <List.Icon {...props} icon="clock-outline" color={COLORS.primary} />}
            />
            <List.Item
              title="Sức chứa"
              description={activity.participants ? `${activity.participants} người tham gia` : 'Chưa có thông tin'}
              left={props => <List.Icon {...props} icon="account-group" color={COLORS.primary} />}
            />
            <List.Item
              title="Hướng dẫn viên"
              description={activity.facilitator || 'Chưa có thông tin'}
              left={props => <List.Icon {...props} icon="account" color={COLORS.primary} />}
            />
          </Card.Content>
        </Card>

        {/* Attendance Section */}
        <Card style={styles.detailCard}>
          <Card.Content>
            <View style={styles.attendanceHeader}>
              <Text style={styles.sectionTitle}>Điểm danh ({participants.length} người)</Text>
              <Button
                mode={attendanceMode ? "outlined" : "contained"}
                onPress={() => setAttendanceMode(!attendanceMode)}
                style={styles.attendanceButton}
                labelStyle={styles.attendanceButtonText}
              >
                {attendanceMode ? 'Hủy' : 'Điểm danh'}
              </Button>
            </View>

            {participants.map((participant) => (
              <View key={participant.id} style={styles.participantCard}>
                <View style={styles.participantInfo}>
                  <Avatar.Text 
                    size={40} 
                    label={participant.name.split(' ').slice(-2).map(n => n[0]).join('')}
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <View style={styles.participantDetails}>
                    <Text style={styles.participantName}>{participant.name}</Text>
                    <Text style={styles.participantRoom}>{participant.room}</Text>
                  </View>
                  {attendanceMode && (
                    <Checkbox
                      status={participant.attended ? 'checked' : 'unchecked'}
                      onPress={() => handleAttendanceToggle(participant.id)}
                    />
                  )}
                </View>
                
                {attendanceMode && (
                  <TextInput
                    label="Ghi chú hoạt động"
                    value={participant.notes}
                    onChangeText={(text) => handleNotesChange(participant.id, text)}
                    multiline
                    numberOfLines={2}
                    style={styles.notesInput}
                    mode="outlined"
                    placeholder="Nhập ghi chú về hoạt động của cư dân..."
                  />
                )}
              </View>
            ))}

            {attendanceMode && (
              <Button
                mode="contained"
                onPress={handleSaveAttendance}
                style={styles.saveButton}
                icon="check"
              >
                Lưu điểm danh
              </Button>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      {/* Floating Action Button for Photos */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={handleAddPhoto}
        label="Thêm ảnh"
      />
    </View>
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
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  errorText: {
    ...FONTS.h3,
    color: COLORS.error,
    marginTop: 16,
    textAlign: 'center',
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  headerCard: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  headerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SIZES.padding,
  },
  headerInfo: {
    flex: 1,
  },
  dateTimeContainer: {
    marginVertical: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  dateText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 6,
  },
  timeText: {
    ...FONTS.body3,
    color: COLORS.text,
    marginLeft: 6,
  },
  typeChip: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  detailCard: {
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
    marginBottom: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 12,
  },
  descriptionText: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  attendanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  attendanceButton: {
    minWidth: 100,
  },
  attendanceButtonText: {
    fontSize: 14,
  },
  participantCard: {
    backgroundColor: COLORS.background,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantDetails: {
    flex: 1,
    marginLeft: 12,
  },
  participantName: {
    ...FONTS.body2,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  participantRoom: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  notesInput: {
    backgroundColor: COLORS.surface,
    marginTop: 8,
  },
  saveButton: {
    marginTop: 16,
    backgroundColor: COLORS.success,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
  },
});

export default ActivityDetailsScreen; 