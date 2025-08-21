import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Image, Alert, TouchableOpacity, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native';
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
  FAB,
  Badge
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import activityService from '../../api/services/activityService';
import activityParticipationService from '../../api/services/activityParticipationService';
import bedAssignmentService from '../../api/services/bedAssignmentService';
import residentPhotosService from '../../api/services/residentPhotosService';
import * as ImagePicker from 'expo-image-picker';

import dateUtils from '../../utils/dateUtils';

const ActivityDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activityId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [menuVisible, setMenuVisible] = useState(false);
  const [attendanceMode, setAttendanceMode] = useState(false);
  const [activityPhotos, setActivityPhotos] = useState([]);
  const [bedAssignments, setBedAssignments] = useState({});
  
  // New states for attendance tracking
  const [attendanceChanges, setAttendanceChanges] = useState({});
  const [participantPhotos, setParticipantPhotos] = useState({});
  const [participantNotes, setParticipantNotes] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Load activity details and participants
  const loadActivityDetails = async () => {
    try {
      setLoading(true);
      
      // Load activity details
      const activityResponse = await activityService.getActivityById(activityId);
      if (activityResponse.success) {
        setActivity(activityResponse.data);
        
        // Load participants for this specific activity using the correct API
        const activityDate = new Date(activityResponse.data.schedule_time);
        const dateString = activityDate.toISOString().split('T')[0]; // YYYY-MM-DD format
        
        const participantsResponse = await activityParticipationService.getParticipationsByActivity(
          activityId, 
          dateString
        );
        
        if (participantsResponse.success) {
          const participantsData = participantsResponse.data || [];
          setParticipants(participantsData);
          
          // Reset attendance tracking states
          setAttendanceChanges({});
          setParticipantPhotos({});
          setParticipantNotes({});
          
          // Load bed assignments for each participant
          const bedAssignmentsData = {};
          for (const participant of participantsData) {
            if (participant.resident_id?._id) {
              try {
                const bedAssignmentResponse = await bedAssignmentService.getBedAssignmentByResidentId(participant.resident_id._id);
                if (bedAssignmentResponse.success && bedAssignmentResponse.data.length > 0) {
                  bedAssignmentsData[participant.resident_id._id] = bedAssignmentResponse.data[0];
                }
              } catch (error) {
                console.log('Error loading bed assignment for resident:', participant.resident_id._id, error);
              }
            }
          }
          setBedAssignments(bedAssignmentsData);
        }
      } else {
        throw new Error('Không thể tải thông tin hoạt động');
      }
      
    } catch (error) {
      console.error('Error loading activity details:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải thông tin hoạt động. Vui lòng thử lại sau.',
        [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadActivityDetails();
    setRefreshing(false);
  };

  // Initialize attendance state from database data
  const initializeAttendanceState = () => {
    const initialAttendanceChanges = {};
    const initialParticipantNotes = {};
    
    participants.forEach(participant => {
      initialAttendanceChanges[participant._id] = participant.attendance_status === 'attended';
      initialParticipantNotes[participant._id] = participant.performance_notes || '';
    });
    
    setAttendanceChanges(initialAttendanceChanges);
    setParticipantNotes(initialParticipantNotes);
  };

  // Toggle attendance mode and initialize state
  const toggleAttendanceMode = () => {
    if (!attendanceMode) {
      // Entering attendance mode - initialize from database
      initializeAttendanceState();
    }
    setAttendanceMode(!attendanceMode);
  };

  useEffect(() => {
    loadActivityDetails();
  }, [activityId]);

  const handleAttendanceToggle = (participantId) => {
    console.log('Toggling attendance for participant:', participantId);
    setAttendanceChanges(prev => ({
      ...prev,
      [participantId]: !prev[participantId]
    }));
  };

  const handleNotesChange = (participantId, notes) => {
    setParticipantNotes(prev => ({
      ...prev,
      [participantId]: notes
    }));
  };

  const handleSaveAttendance = async () => {
    try {
      setSubmitting(true);
      
      // Update attendance status for all participants
      const updatePromises = participants.map(async (participant) => {
        const participantId = participant._id;
        const residentId = participant.resident_id?._id;
        
        // Get the participation record for this resident and activity
        const participationResponse = await activityParticipationService.getParticipationByResidentAndActivity(
          residentId, 
          activityId
        );
        
        if (!participationResponse.success) {
          console.error('Failed to get participation for resident:', residentId);
          return null;
        }
        
        const participation = participationResponse.data;
        const participationId = participation._id;
        
        // Determine attendance status
        const isAttended = attendanceChanges[participantId] || false;
        const newStatus = isAttended ? 'attended' : 'absent';
        const notes = participantNotes[participantId] || '';
        
        // Update participation
        const updateResponse = await activityParticipationService.updateParticipation(participationId, {
          attendance_status: newStatus,
          performance_notes: notes
        });
        
        // Upload photos if any
        const photos = participantPhotos[participantId] || [];
        if (photos.length > 0) {
          for (const photoUri of photos) {
            try {
              console.log('Uploading photo:', photoUri);
              
              // Create FormData for file upload
              const formData = new FormData();
              
              // Convert URI to file object for React Native
              const fileName = photoUri.split('/').pop() || 'activity_photo.jpg';
              formData.append('file', {
                uri: photoUri,
                type: 'image/jpeg',
                name: fileName,
              });
              formData.append('resident_id', residentId);
              formData.append('activity_type', activity.activity_type);
              formData.append('related_activity_id', activityId);
              formData.append('caption', `Ảnh hoạt động: ${activity.activity_name}`);
              formData.append('taken_date', new Date().toISOString());
              formData.append('staff_notes', notes || 'Ảnh chụp trong hoạt động');
              
              const uploadResult = await residentPhotosService.uploadResidentPhoto(formData);
              if (!uploadResult.success) {
                console.error('Failed to upload photo:', uploadResult.error);
              } else {
                console.log('Photo uploaded successfully:', uploadResult.data);
              }
            } catch (photoError) {
              console.error('Failed to upload photo:', photoError);
            }
          }
        }
        
        return updateResponse;
      });
      
      const results = await Promise.all(updatePromises);
      const successfulUpdates = results.filter(result => result !== null).length;
      
      // Count total photos uploaded
      const totalPhotos = Object.values(participantPhotos).reduce((total, photos) => total + photos.length, 0);
      
      let successMessage = `Đã cập nhật điểm danh ${successfulUpdates}/${participants.length} người tham gia!`;
      if (totalPhotos > 0) {
        successMessage += `\nĐã upload ${totalPhotos} ảnh cư dân.`;
      }
      
      Alert.alert(
        'Thành công',
        successMessage,
        [{ text: 'OK' }]
      );
      
      // Update local participants state with new data
      setParticipants(prev => prev.map(participant => {
        const participantId = participant._id;
        const isAttended = attendanceChanges[participantId] || false;
        const notes = participantNotes[participantId] || '';
        
        return {
          ...participant,
          attendance_status: isAttended ? 'attended' : 'absent',
          performance_notes: notes
        };
      }));
      
      setAttendanceMode(false);
      setAttendanceChanges({});
      setParticipantPhotos({});
      setParticipantNotes({});
      
    } catch (error) {
      console.error('Error saving attendance:', error);
      Alert.alert('Lỗi', 'Không thể lưu điểm danh. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập camera để chụp ảnh');
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh');
    }
    return null;
  };

  const pickImage = async () => {
    const hasPermission = await requestMediaLibraryPermission();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        return result.assets[0].uri;
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
    return null;
  };

  const handleAddPhotoForParticipant = async (participantId) => {
    Alert.alert(
      'Thêm ảnh cho ' + participants.find(p => p._id === participantId)?.resident_id?.full_name,
      'Chọn cách thêm ảnh',
      [
        { text: 'Chụp ảnh', onPress: async () => {
          const photoUri = await takePhoto();
          if (photoUri) {
            setParticipantPhotos(prev => ({
              ...prev,
              [participantId]: [...(prev[participantId] || []), photoUri]
            }));
          }
        }},
        { text: 'Chọn từ thư viện', onPress: async () => {
          const photoUri = await pickImage();
          if (photoUri) {
            setParticipantPhotos(prev => ({
              ...prev,
              [participantId]: [...(prev[participantId] || []), photoUri]
            }));
          }
        }},
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const handleAddActivityPhoto = async () => {
    Alert.alert(
      'Thêm ảnh hoạt động',
      'Chọn cách thêm ảnh',
      [
        { text: 'Chụp ảnh', onPress: async () => {
          const photoUri = await takePhoto();
          if (photoUri) {
            setActivityPhotos(prev => [...prev, photoUri]);
          }
        }},
        { text: 'Chọn từ thư viện', onPress: async () => {
          const photoUri = await pickImage();
          if (photoUri) {
            setActivityPhotos(prev => [...prev, photoUri]);
          }
        }},
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const removePhoto = (participantId, photoIndex) => {
    setParticipants(prev => 
      prev.map(participant => 
        participant._id === participantId 
          ? { 
              ...participant, 
              photos: participant.photos.filter((_, index) => index !== photoIndex) 
            }
          : participant
      )
    );
  };

  const removeActivityPhoto = (photoIndex) => {
    setActivityPhotos(prev => prev.filter((_, index) => index !== photoIndex));
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
  
  const handleDelete = async () => {
    Alert.alert(
      'Xác nhận xóa',
      'Bạn có chắc muốn xóa hoạt động này? Hành động này sẽ xóa tất cả thông tin tham gia liên quan.',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xóa', style: 'destructive', onPress: async () => {
            try {
              setSubmitting(true);
              
              // First, delete all activity participations for this activity
              const activityDate = new Date(activity.schedule_time);
              const dateString = activityDate.toISOString().split('T')[0];
              
              const participationsResponse = await activityParticipationService.getParticipationsByActivity(
                activityId, 
                dateString
              );
              
              if (participationsResponse.success && participationsResponse.data) {
                const participations = participationsResponse.data;
                console.log(`Deleting ${participations.length} participations for activity ${activityId}`);
                
                // Delete all participations
                const deletePromises = participations.map(participation => 
                  activityParticipationService.deleteParticipation(participation._id)
                );
                
                await Promise.all(deletePromises);
                console.log('All participations deleted successfully');
              }
              
              // Then delete the activity
              const deleteResponse = await activityService.deleteActivity(activityId);
              if (!deleteResponse.success) {
                throw new Error(deleteResponse.error || 'Không thể xóa hoạt động');
              }
              
              Alert.alert('Thành công', 'Đã xóa hoạt động và tất cả thông tin tham gia liên quan');
              navigation.goBack();
            } catch (error) {
              console.error('Error deleting activity:', error);
              Alert.alert('Lỗi', error.message || 'Không thể xóa hoạt động. Vui lòng thử lại.');
            } finally {
              setSubmitting(false);
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
  
  const activityIconColor = getActivityIconColor(activity.activity_type);
  const attendedCount = participants.filter(p => p.attendance_status === 'attended').length;
  
  const getAttendanceStatusColor = (status) => {
    switch (status) {
      case 'attended': return COLORS.success;
      case 'absent': return COLORS.error;
      case 'pending': return COLORS.warning;
      default: return COLORS.textSecondary;
    }
  };
  
  const getRoomBedInfo = (residentId) => {
    const bedAssignment = bedAssignments[residentId];
    if (!bedAssignment) return 'Chưa có thông tin phòng';
    
    const bedInfo = bedAssignment.bed_id;
    const roomInfo = bedAssignment.room_id;
    
    if (bedInfo && roomInfo) {
      return `Phòng ${roomInfo.room_number} - Giường ${bedInfo.bed_number}`;
    } else if (roomInfo) {
      return `Phòng ${roomInfo.room_number}`;
    } else if (bedInfo) {
      return `Giường ${bedInfo.bed_number}`;
    }
    
    return 'Chưa có thông tin phòng';
  };
  
  const getAttendanceStatusText = (status) => {
    switch (status) {
      case 'attended': return '✓ Đã tham gia';
      case 'absent': return '✗ Vắng mặt';
      case 'pending': return '⏳ Chờ xác nhận';
      default: return '❓ Không xác định';
    }
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={activityIconColor} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: activityIconColor }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} iconColor="#fff" />
        <Appbar.Content title={activity.activity_name} titleStyle={[FONTS.h2, { color: '#fff' }]} />
        
        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={
            <Appbar.Action icon="dots-vertical" color="#fff" onPress={openMenu} />
          }
        >
          <Menu.Item 
            onPress={() => { 
              closeMenu(); 
              navigation.navigate('EditActivityScreen', { activityId }); 
            }} 
            title="Sửa" 
            leadingIcon="pencil"
          />
          <Menu.Item 
            onPress={() => { 
              closeMenu(); 
              handleDelete(); 
            }} 
            title="Xóa" 
            leadingIcon="delete"
            titleStyle={{ color: COLORS.error }}
          />
        </Menu>
      </Appbar.Header>
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        style={styles.keyboardAvoidingView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Card style={styles.headerCard}>
            <Card.Content style={styles.headerCardContent}>
              <View style={[styles.activityIconContainer, { backgroundColor: activityIconColor }]}>
                {getActivityIcon(activity.activity_type)}
              </View>
              
              <View style={styles.headerInfo}>
                <Text style={FONTS.h3}>{activity.activity_name}</Text>
                <View style={styles.dateTimeContainer}>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="event" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.dateText}>{formatDate(activity.schedule_time)}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <MaterialIcons name="access-time" size={18} color={COLORS.textSecondary} />
                    <Text style={styles.timeText}>{formatTime(activity.schedule_time)}</Text>
                  </View>
                </View>
                
                <Chip 
                  icon="tag" 
                  style={[styles.typeChip, { backgroundColor: `${activityIconColor}20` }]}
                  textStyle={{ color: activityIconColor }}
                >
                  {getActivityTypeInVietnamese(activity.activity_type)}
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
                description={activity.duration ? `${activity.duration} phút` : 'Chưa có thông tin'}
                left={props => <List.Icon {...props} icon="clock-outline" color={COLORS.primary} />}
              />
              <List.Item
                title="Sức chứa"
                description={activity.capacity ? `${activity.capacity} người tham gia` : 'Chưa có thông tin'}
                left={props => <List.Icon {...props} icon="account-group" color={COLORS.primary} />}
              />
              <List.Item
                title="Hướng dẫn viên"
                description={activity.facilitator || 'Chưa có thông tin'}
                left={props => <List.Icon {...props} icon="account" color={COLORS.primary} />}
              />
            </Card.Content>
          </Card>

          {/* Activity Photos Section */}
          {activityPhotos.length > 0 && (
            <Card style={styles.detailCard}>
              <Card.Content>
                <Text style={styles.sectionTitle}>Ảnh hoạt động ({activityPhotos.length})</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScrollView}>
                  {activityPhotos.map((photo, index) => (
                    <View key={index} style={styles.photoContainer}>
                      <Image source={{ uri: photo }} style={styles.photo} />
                      <IconButton
                        icon="close"
                        size={12}
                        style={styles.removePhotoButton}
                        onPress={() => removeActivityPhoto(index)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </Card.Content>
            </Card>
          )}

          {/* Attendance Section */}
          <Card style={styles.detailCard}>
            <Card.Content>
              <View style={styles.attendanceHeader}>
                <View style={styles.attendanceLeftSection}>
                  <Text style={styles.sectionTitle}>Điểm danh ({participants.length} người)</Text>
                  {attendedCount > 0 && (
                    <View style={styles.attendanceCountContainer}>
                      <Text style={styles.attendanceCountText}>{attendedCount} người tham gia</Text>
                      <View style={styles.attendanceBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#fff" />
                      </View>
                    </View>
                  )}
                </View>
                <Button
                  mode="outlined"
                  onPress={toggleAttendanceMode}
                  style={styles.attendanceButton}
                  labelStyle={styles.attendanceButtonText}
                >
                  {attendanceMode ? 'Hủy điểm danh' : 'Điểm danh'}
                </Button>
              </View>

              {participants.map((participant) => {
                const participantId = participant._id;
                // Show database data when not in attendance mode, show local state when in attendance mode
                const isAttended = attendanceMode 
                  ? (attendanceChanges[participantId] || false)
                  : (participant.attendance_status === 'attended');
                const notes = attendanceMode 
                  ? (participantNotes[participantId] || '')
                  : (participant.performance_notes || '');
                const photos = participantPhotos[participantId] || [];
                
                return (
                  <View key={participant._id} style={styles.participantCard}>
                    <View style={styles.participantInfo}>
                      <Avatar.Text 
                        size={40} 
                        label={participant.resident_id?.full_name?.split(' ').slice(-2).map(n => n[0]).join('') || '??'}
                        style={{ backgroundColor: COLORS.primary }}
                      />
                      <View style={styles.participantDetails}>
                        <Text style={styles.participantName}>
                          {participant.resident_id?.full_name || 'Không xác định'}
                        </Text>
                        <Text style={styles.participantRoom}>
                          {getRoomBedInfo(participant.resident_id?._id)}
                        </Text>
                        <Text style={[styles.attendanceStatus, { color: getAttendanceStatusColor(isAttended ? 'attended' : 'absent') }]}>
                          {getAttendanceStatusText(isAttended ? 'attended' : 'absent')}
                        </Text>
                      </View>
                      {attendanceMode && (
                        <View style={styles.participantActions}>
                          <TouchableOpacity 
                            style={styles.checkboxButton}
                            onPress={() => handleAttendanceToggle(participant._id)}
                          >
                            <MaterialIcons 
                              name={isAttended ? "check-box" : "check-box-outline-blank"} 
                              size={26} 
                              color={isAttended ? COLORS.primary : COLORS.textSecondary} 
                            />
                          </TouchableOpacity>
                          <IconButton
                            icon="camera"
                            size={20}
                            onPress={() => handleAddPhotoForParticipant(participant._id)}
                            style={styles.photoButton}
                          />
                        </View>
                      )}
                    </View>
                    
                    {attendanceMode && (
                      <TextInput
                        label="Ghi chú hoạt động"
                        value={notes}
                        onChangeText={(text) => handleNotesChange(participant._id, text)}
                        multiline
                        numberOfLines={2}
                        style={styles.notesInput}
                        mode="outlined"
                        placeholder="Nhập ghi chú về hoạt động của cư dân..."
                      />
                    )}
                    
                    {/* Display notes even when not in attendance mode */}
                    {!attendanceMode && notes && (
                      <View style={styles.notesDisplay}>
                        <Text style={styles.notesLabel}>Ghi chú hoạt động:</Text>
                        <Text style={styles.notesText}>{notes}</Text>
                      </View>
                    )}
                    
                    {/* Display participant photos */}
                    {photos.length > 0 && (
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.participantPhotoScrollView}>
                        {photos.map((photo, index) => (
                          <View key={index} style={styles.participantPhotoContainer}>
                            <Image source={{ uri: photo }} style={styles.participantPhoto} />
                            <IconButton
                              icon="close"
                              size={12}
                              style={styles.removeParticipantPhotoButton}
                              onPress={() => {
                                setParticipantPhotos(prev => ({
                                  ...prev,
                                  [participantId]: prev[participantId].filter((_, i) => i !== index)
                                }));
                              }}
                            />
                          </View>
                        ))}
                      </ScrollView>
                    )}
                  </View>
                );
              })}

              <Button
                mode="contained"
                onPress={handleSaveAttendance}
                style={styles.saveButton}
                icon="check"
                loading={submitting}
                disabled={submitting}
              >
                Lưu điểm danh ({Object.values(attendanceChanges).filter(Boolean).length}/{participants.length})
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Floating Action Button for Activity Photos */}
      <FAB
        icon="camera"
        style={styles.fab}
        onPress={handleAddActivityPhoto}
        label="Thêm ảnh hoạt động"
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
    paddingBottom: 50,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  attendanceLeftSection: {
    flex: 1,
    marginRight: 12,
  },
  attendanceCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: COLORS.success + '15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  attendanceCountText: {
    ...FONTS.body3,
    color: COLORS.success,
    fontWeight: '600',
    marginRight: 4,
  },
  attendanceBadge: {
    backgroundColor: COLORS.success,
    borderRadius: 8,
    width: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  attendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    alignSelf: 'flex-start',
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
  participantActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    padding: 4,
    borderRadius: 4,
    minWidth: 60,
    justifyContent: 'space-between',
  },
  photoButton: {
    marginLeft: 2,
    padding: 2,
  },
  participantPhotoScrollView: {
    marginTop: 8,
    paddingVertical: 4,
  },
  participantPhotoContainer: {
    marginRight: 8,
    position: 'relative',
  },
  participantPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  removeParticipantPhotoButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: COLORS.error,
    borderRadius: 10,
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
  photoScrollView: {
    marginTop: 8,
    paddingVertical: 4,
  },
  photoContainer: {
    marginRight: 8,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -3,
    right: -3,
    backgroundColor: COLORS.error,
    borderRadius: 8,
    width: 16,
    height: 16,
  },
  attendedStatus: {
    ...FONTS.body3,
    color: COLORS.success,
    marginTop: 4,
    fontWeight: '500',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    backgroundColor: COLORS.surface,
    padding: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginLeft: 4,
  },
  attendanceCheckbox: {
    marginRight: 4,
  },
  participantAttendanceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  checkboxButton: {
    padding: 2,
    marginRight: 4,
  },
  notesDisplay: {
    marginTop: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  notesLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  notesText: {
    ...FONTS.body2,
    color: COLORS.text,
    lineHeight: 20,
  },
});

export default ActivityDetailsScreen; 