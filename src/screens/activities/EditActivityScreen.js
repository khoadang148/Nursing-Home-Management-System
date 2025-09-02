import React, { useState, useEffect, useMemo } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Alert, KeyboardAvoidingView, Platform, FlatList, SafeAreaView, TouchableOpacity, Pressable, Keyboard } from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  HelperText, 
  Divider, 
  Text,
  Chip,
  IconButton,
  ActivityIndicator,
  List,
  Checkbox,
  Card,
  Avatar,
  Searchbar
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import DropDownPicker from 'react-native-dropdown-picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS, FONTS, SIZES } from '../../constants/theme';
import { useSelector } from 'react-redux';

// Import services
import activityService from '../../api/services/activityService';
import activityParticipationService from '../../api/services/activityParticipationService';
import residentService from '../../api/services/residentService';
import bedAssignmentService from '../../api/services/bedAssignmentService';

const ACTIVITY_TYPES = [
  { value: 'Thể thao', label: 'Thể thao', icon: 'run' },
  { value: 'Xã hội', label: 'Xã hội', icon: 'account-group' },
  { value: 'Nhận thức', label: 'Nhận thức', icon: 'brain' },
  { value: 'Sáng tạo', label: 'Sáng tạo', icon: 'palette' },
  { value: 'Tâm lý', label: 'Tâm lý', icon: 'heart' },
  { value: 'Y tế', label: 'Y tế', icon: 'medical-bag' },
  { value: 'Giải trí', label: 'Giải trí', icon: 'music' },
  { value: 'Học tập', label: 'Học tập', icon: 'book' },
  { value: 'Khác', label: 'Khác', icon: 'dots-horizontal' },
];

const LOCATIONS = [
  'Phòng hoạt động',
  'Khu vực chung',
  'Phòng ăn',
  'Vườn',
  'Phòng trị liệu',
  'Thư viện',
  'Sân hiên ngoài trời',
  'Phòng riêng',
];

const ActivityTypeChip = ({ type, isSelected, onPress }) => {
  const iconColor = isSelected ? '#FFFFFF' : COLORS.primary;
  
  return (
    <Chip
      selected={isSelected}
      onPress={onPress}
      style={[
        styles.activityTypeChip,
        isSelected && styles.selectedChip
      ]}
      textStyle={[
        styles.chipText,
        isSelected && styles.selectedChipText
      ]}
      icon={({ size }) => (
        <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
          <IconButton
            icon={type.icon}
            size={size - 4}
            iconColor={iconColor}
            disabled
            style={{ margin: 0, padding: 0 }}
          />
        </View>
      )}
    >
      {type.label}
    </Chip>
  );
};

const EditActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { activityId } = route.params;
  const user = useSelector((state) => state.auth.user);
  
  // Debug user object
  useEffect(() => {
    console.log('DEBUG - User object in EditActivityScreen:', user);
    console.log('DEBUG - User _id:', user?._id);
    console.log('DEBUG - User id:', user?.id);
  }, [user]);
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('Thể thao');
  const [customActivityType, setCustomActivityType] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('45');
  const [location, setLocation] = useState('Phòng hoạt động');
  const [capacity, setCapacity] = useState('10');
  const [selectedResidents, setSelectedResidents] = useState([]);
  const [errors, setErrors] = useState({});
  
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existingParticipations, setExistingParticipations] = useState([]);
  
  const [locationOpen, setLocationOpen] = useState(false);
  
  // Filter states for residents
  const [searchQuery, setSearchQuery] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [genderFilter, setGenderFilter] = useState('all');
  const [showResidentSelector, setShowResidentSelector] = useState(false);
  
  const getSelectedResidentsData = () => {
    return residents.filter(resident => selectedResidents.includes(resident._id));
  };

  const getAvailableResidents = () => {
    return residents.filter(resident => !selectedResidents.includes(resident._id));
  };

  // Filter and search residents
  const filteredResidents = useMemo(() => {
    let filtered = getAvailableResidents();
    
    // Search by name
    if (searchQuery.trim()) {
      filtered = filtered.filter(resident => 
        resident.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by age
    if (ageFilter !== 'all') {
      filtered = filtered.filter(resident => {
        if (!resident.age || resident.age === 'N/A') return false;
        const age = parseInt(resident.age);
        switch (ageFilter) {
          case '60-70':
            return age >= 60 && age <= 70;
          case '71-80':
            return age >= 71 && age <= 80;
          case '81-90':
            return age >= 81 && age <= 90;
          case '90+':
            return age > 90;
          default:
            return true;
        }
      });
    }
    
    // Filter by gender
    if (genderFilter !== 'all') {
      filtered = filtered.filter(resident => {
        const residentGender = resident.gender;
        if (genderFilter === 'Nam') {
          return residentGender === 'male';
        } else if (genderFilter === 'Nữ') {
          return residentGender === 'female';
        }
        return false;
      });
    }
    
    return filtered;
  }, [residents, selectedResidents, searchQuery, ageFilter, genderFilter]);

  // Helper function to calculate age
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age > 0 ? age : null;
    } catch (error) {
      console.error('Error calculating age:', error);
      return null;
    }
  };

  useEffect(() => {
    loadActivityData();
  }, [activityId]);

  const loadActivityData = async () => {
    try {
      setLoading(true);
      
      const activityResponse = await activityService.getActivityById(activityId);
      if (!activityResponse.success) {
        throw new Error('Không thể tải thông tin hoạt động');
      }
      
      const activity = activityResponse.data;
      
      setName(activity.activity_name || '');
      setDescription(activity.description || '');
      setDuration(activity.duration?.toString() || '45');
      setLocation(activity.location || 'Phòng hoạt động');
      setCapacity(activity.capacity?.toString() || '10');
      // Note: facilitator is automatically set from user data, not loaded from activity
      
      const type = activity.activity_type || 'Thể thao';
      if (ACTIVITY_TYPES.some(t => t.value === type)) {
        setActivityType(type);
        setCustomActivityType('');
      } else {
        setActivityType('Khác');
        setCustomActivityType(type);
      }
      
      if (activity.schedule_time) {
        const scheduleDate = new Date(activity.schedule_time);
        setDate(scheduleDate);
        setTime(scheduleDate);
      }
      
      const activityDate = new Date(activity.schedule_time);
      const dateString = activityDate.toISOString().split('T')[0];
      
      const participationsResponse = await activityParticipationService.getParticipationsByActivity(
        activityId, 
        dateString
      );
      
      if (participationsResponse.success) {
        const participations = participationsResponse.data || [];
        setExistingParticipations(participations);
        
        const residentIds = participations.map(p => p.resident_id?._id || p.resident_id).filter(Boolean);
        setSelectedResidents(residentIds);
      }
      
      await loadResidents();
      
    } catch (error) {
      console.error('Error loading activity data:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin hoạt động');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const loadResidents = async () => {
    try {
      setLoadingResidents(true);
      
      // Kiểm tra role của user để sử dụng API phù hợp
      let response;
      if (user?.role === 'family') {
        // Family member chỉ có thể xem residents của mình
        response = await residentService.getResidentsByFamilyMember(user._id || user.id);
      } else {
        // Staff có thể xem tất cả residents
        response = await residentService.getAllResidents();
      }
      
      if (response.success) {
        const residentsData = response.data || [];
        console.log('DEBUG - API Response residents:', residentsData.map(r => ({
          name: r.full_name,
          date_of_birth: r.date_of_birth,
          has_date_of_birth: !!r.date_of_birth
        })));
        
        const residentsWithBedInfo = await Promise.all(
          residentsData.map(async (resident) => {
            try {
              // Calculate age using local function with multiple fallbacks
              let age = calculateAge(resident.date_of_birth);
              
              // Fallback: nếu không có date_of_birth, thử tính từ birth_date
              if (!age && resident.birth_date) {
                age = calculateAge(resident.birth_date);
              }
              
              // Fallback: nếu vẫn không có, thử tính từ admission_date (ước tính tuổi)
              if (!age && resident.admission_date) {
                const admissionDate = new Date(resident.admission_date);
                const today = new Date();
                age = today.getFullYear() - admissionDate.getFullYear() + 65; // Ước tính tuổi trung bình
              }
              
              console.log(`DEBUG - Resident ${resident.full_name}:`, {
                date_of_birth: resident.date_of_birth,
                birth_date: resident.birth_date,
                admission_date: resident.admission_date,
                calculated_age: age,
                has_date_of_birth: !!resident.date_of_birth,
                has_birth_date: !!resident.birth_date
              });
              
              let bedInfo = null;
              try {
                const bedResponse = await bedAssignmentService.getBedAssignmentByResidentId(resident._id);
                if (bedResponse.success && bedResponse.data && bedResponse.data.length > 0) {
                  bedInfo = bedResponse.data[0];
                }
              } catch (bedError) {
                console.log(`No bed assignment found for resident ${resident._id}:`, bedError.message);
              }
              
              return {
                ...resident,
                age: age || 'N/A',
                bed_info: bedInfo
              };
            } catch (error) {
              console.error(`Error processing resident ${resident._id}:`, error);
              return {
                ...resident,
                age: 'N/A',
                bed_info: null
              };
            }
          })
        );
        
        setResidents(residentsWithBedInfo);
      } else {
        console.error('Failed to load residents:', response.error);
        Alert.alert('Lỗi', 'Không thể tải danh sách cư dân');
      }
    } catch (error) {
      console.error('Error loading residents:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách cư dân');
    } finally {
      setLoadingResidents(false);
    }
  };
  
  const locationItems = useMemo(() => 
    LOCATIONS.map(loc => ({ label: loc, value: loc })), 
    []
  );



  const getBedRoomInfo = (resident) => {
    if (resident.bed_info) {
      if (resident.bed_info.room_id) {
        const roomNumber = resident.bed_info.room_id.room_number || 'N/A';
        const bedNumber = resident.bed_info.bed_number || 'N/A';
        return `P${roomNumber} - G${bedNumber}`;
      } else if (resident.bed_info.bed_id) {
        const roomNumber = resident.bed_info.bed_id.room_id?.room_number || 'N/A';
        const bedNumber = resident.bed_info.bed_id.bed_number || 'N/A';
        return `P${roomNumber} - G${bedNumber}`;
      }
    }
    return 'Chưa phân công';
  };

  const handleActivityTypeChange = (newType) => {
    setActivityType(newType);
  };

  const handleSearchQueryChange = (query) => {
    setSearchQuery(query);
  };

  const handleAgeFilterChange = (filter) => {
    setAgeFilter(filter);
  };

  const handleGenderFilterChange = (filter) => {
    setGenderFilter(filter);
  };

  const toggleResidentSelector = () => {
    setShowResidentSelector(!showResidentSelector);
  };

  const handleResidentToggle = (residentId) => {
    setSelectedResidents(prev => 
      prev.includes(residentId) 
        ? prev.filter(id => id !== residentId)
        : [...prev, residentId]
    );
  };

  const handleRemoveResident = (residentId) => {
    setSelectedResidents(prev => prev.filter(id => id !== residentId));
  };

  const handleLocationChange = (newLocation) => {
    setLocation(newLocation);
  };

  const handleNameChange = (text) => {
    setName(text);
  };

  const handleDescriptionChange = (text) => {
    setDescription(text);
  };

  const handleCustomActivityTypeChange = (text) => {
    setCustomActivityType(text);
  };

  const handleDurationChange = (text) => {
    setDuration(text);
  };

  const handleCapacityChange = (text) => {
    setCapacity(text);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) setDate(selectedDate);
  };

  const handleTimeChange = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) setTime(selectedTime);
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Tên hoạt động là bắt buộc';
    if (!description.trim()) newErrors.description = 'Mô tả là bắt buộc';
    if (activityType === 'Khác' && !customActivityType.trim()) {
      newErrors.customActivityType = 'Vui lòng nhập loại hoạt động';
    }
    if (!location.trim()) newErrors.location = 'Địa điểm là bắt buộc';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      newErrors.duration = 'Nhập thời lượng hợp lệ';
    }
    if (isNaN(parseInt(capacity)) || parseInt(capacity) <= 0) {
      newErrors.capacity = 'Nhập số lượng người tham gia hợp lệ';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    try {
      setSubmitting(true);
      
      const scheduledTime = new Date(date);
      scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
      
      const activityData = {
        activity_name: name,
        description: description,
        activity_type: activityType === 'Khác' ? customActivityType : activityType,
        schedule_time: scheduledTime.toISOString(),
        duration: parseInt(duration),
        location: location,
        capacity: parseInt(capacity),
        facilitator: user?.full_name || 'Nhân viên'
      };
      
      console.log('Updating activity with data:', activityData);
      
      // ===== PHASE 1: KIỂM TRA TẤT CẢ CONFLICTS TRƯỚC KHI CẬP NHẬT =====
      
      // 1.1 Check staff schedule conflicts first (excluding current activity)
      let staffConflict = null;
      try {
        const staffActivitiesResponse = await activityService.getActivitiesByStaffId(user._id || user.id);
        if (staffActivitiesResponse.success && staffActivitiesResponse.data) {
          staffConflict = staffActivitiesResponse.data.find(activity => {
            // Skip current activity being updated
            if (activity._id === activityId) return false;
            
            const activityDate = new Date(activity.schedule_time);
            const activityEndTime = new Date(activityDate.getTime() + (activity.duration || 60) * 60 * 1000);
            
            const newActivityDate = new Date(scheduledTime);
            const newActivityEndTime = new Date(newActivityDate.getTime() + parseInt(duration) * 60 * 1000);
            
            // Check same day and time overlap
            const sameDay = activityDate.toDateString() === newActivityDate.toDateString();
            const timeOverlap = newActivityDate < activityEndTime && newActivityEndTime > activityDate;
            
            return sameDay && timeOverlap;
          });
        }
      } catch (error) {
        console.warn('Error checking staff schedule conflicts:', error);
      }
      
      // 1.2 Check resident schedule conflicts for ALL selected residents
      const conflictingResidents = [];
      const validResidents = [];
      
      if (selectedResidents.length > 0) {
        for (const residentId of selectedResidents) {
          try {
            // Check if resident has conflicting activities
            const residentParticipations = await activityParticipationService.getParticipationsByResidentId(residentId);
            if (residentParticipations.success && residentParticipations.data) {
              const conflictingParticipation = residentParticipations.data.find(participation => {
                if (!participation.activity_id || typeof participation.activity_id === 'string') return false;
                if (participation.activity_id._id === activityId) return false; // Skip current activity
                
                const activity = participation.activity_id;
                const activityDate = new Date(activity.schedule_time);
                const activityEndTime = new Date(activityDate.getTime() + (activity.duration || 60) * 60 * 1000);
                
                const newActivityDate = new Date(scheduledTime);
                const newActivityEndTime = new Date(newActivityDate.getTime() + parseInt(duration) * 60 * 1000);
                
                // Check same day and time overlap
                const sameDay = activityDate.toDateString() === newActivityDate.toDateString();
                const timeOverlap = newActivityDate < activityEndTime && newActivityEndTime > activityDate;
                
                return sameDay && timeOverlap;
              });
              
              if (conflictingParticipation) {
                const activity = conflictingParticipation.activity_id;
                // Fix timezone issue by adding 7 hours for Vietnam timezone
                const activityDate = new Date(activity.schedule_time);
                const vietnamTime = new Date(activityDate.getTime() + (7 * 60 * 60 * 1000));
                const activityStartTime = `${vietnamTime.getHours().toString().padStart(2, '0')}:${vietnamTime.getMinutes().toString().padStart(2, '0')}`;
                const activityEndTime = new Date(vietnamTime.getTime() + (activity.duration || 60) * 60 * 1000);
                const endTimeStr = `${activityEndTime.getHours().toString().padStart(2, '0')}:${activityEndTime.getMinutes().toString().padStart(2, '0')}`;
                const residentName = residents.find(r => r._id === residentId)?.full_name || 'Cư dân';
                conflictingResidents.push(`${residentName} (${activity.activity_name} - ${activityStartTime} đến ${endTimeStr})`);
              } else {
                validResidents.push(residentId);
              }
            } else {
              validResidents.push(residentId);
            }
          } catch (error) {
            console.warn(`Error checking resident ${residentId} schedule:`, error);
            validResidents.push(residentId);
          }
        }
      }
      
      // 1.3 Nếu có conflicts, hiển thị cảnh báo và KHÔNG cập nhật activity
      if (staffConflict || conflictingResidents.length > 0) {
        let conflictMessage = 'Không thể cập nhật hoạt động do các xung đột lịch trình sau:\n\n';
        
        if (staffConflict) {
          // Fix timezone issue by adding 7 hours for Vietnam timezone
          const activityDate = new Date(staffConflict.schedule_time);
          const vietnamTime = new Date(activityDate.getTime() + (7 * 60 * 60 * 1000));
          const activityStartTime = `${vietnamTime.getHours().toString().padStart(2, '0')}:${vietnamTime.getMinutes().toString().padStart(2, '0')}`;
          const activityEndTime = new Date(vietnamTime.getTime() + (staffConflict.duration || 60) * 60 * 1000);
          const endTimeStr = `${activityEndTime.getHours().toString().padStart(2, '0')}:${activityEndTime.getMinutes().toString().padStart(2, '0')}`;
          conflictMessage += `• Bạn đã có hoạt động "${staffConflict.activity_name}" từ ${activityStartTime} đến ${endTimeStr} trong cùng ngày.\n\n`;
        }
        
        if (conflictingResidents.length > 0) {
          conflictMessage += `• Cư dân không thể tham gia do trùng lịch:\n${conflictingResidents.join('\n')}`;
        }
        
        Alert.alert(
          'Xung đột lịch trình',
          conflictMessage,
          [{ text: 'OK' }]
        );
        return;
      }
      
      // ===== PHASE 2: CẬP NHẬT ACTIVITY VÀ PARTICIPATIONS (CHỈ KHI KHÔNG CÓ CONFLICTS) =====
      
      // 2.1 Update activity
      const activityResponse = await activityService.updateActivity(activityId, activityData);
      if (!activityResponse.success) {
        // Kiểm tra các loại lỗi từ backend
        const errorMessage = activityResponse.error || 'Không thể cập nhật hoạt động. Vui lòng thử lại.';
        
        if (errorMessage.includes('Đã có hoạt động') || 
            errorMessage.includes('Bạn đã có hoạt động') || 
            errorMessage.includes('Nhân viên đã có hoạt động') ||
            errorMessage.includes('trùng lịch') ||
            errorMessage.includes('trong cùng ngày')) {
          Alert.alert(
            'Xung đột lịch trình',
            errorMessage,
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Lỗi',
            errorMessage,
            [{ text: 'OK' }]
          );
        }
        return;
      }
      
      console.log('Activity updated successfully:', activityResponse.data);
      
      // 2.2 Handle resident changes
      const activityDate = scheduledTime.toISOString().split('T')[0];
      const currentParticipations = existingParticipations;
      const currentResidentIds = currentParticipations.map(p => p.resident_id?._id || p.resident_id).filter(Boolean);
      
      const residentsToRemove = currentResidentIds.filter(id => !selectedResidents.includes(id));
      const residentsToAdd = selectedResidents.filter(id => !currentResidentIds.includes(id));
      
      // Remove participations for residents no longer selected
      for (const residentId of residentsToRemove) {
        const participation = currentParticipations.find(p => 
          (p.resident_id?._id || p.resident_id) === residentId
        );
        if (participation) {
          await activityParticipationService.deleteParticipation(participation._id);
        }
      }
      
      // Add participations for new residents (only those without conflicts)
      const validNewResidents = residentsToAdd.filter(id => validResidents.includes(id));
      if (validNewResidents.length > 0) {
        // Debug user object
        console.log('DEBUG - User object:', user);
        console.log('DEBUG - User _id:', user?._id);
        console.log('DEBUG - User id:', user?.id);
        
        // Check for both _id and id fields
        const userId = user?._id || user?.id;
        if (!userId) {
          throw new Error('Không thể lấy thông tin người dùng. Vui lòng đăng nhập lại.');
        }
        
        const participationDataList = validNewResidents.map(residentId => ({
          staff_id: userId,
          activity_id: activityId,
          resident_id: residentId,
          date: activityDate,
          attendance_status: 'pending'
        }));
        
        console.log('DEBUG - Participation data list:', participationDataList);
        
        const participationResponse = await activityParticipationService.createMultipleActivityParticipations(participationDataList);
        if (!participationResponse.success) {
          console.warn('Failed to create some participations:', participationResponse.error);
          Alert.alert(
            'Cảnh báo',
            'Hoạt động đã được cập nhật nhưng không thể tạo một số danh sách tham gia. Vui lòng kiểm tra lại.',
            [{ text: 'OK' }]
          );
        }
      }
      
      // ===== PHASE 3: HIỂN THỊ THÔNG BÁO THÀNH CÔNG =====
      
      // Show success message with conflict information if any
      let successMessage = `Hoạt động "${name}" đã được cập nhật thành công!`;
      const actualParticipants = selectedResidents.length - conflictingResidents.length;
      
      if (actualParticipants > 0) {
        successMessage += `\n\n${actualParticipants} cư dân đã được cập nhật trong danh sách tham gia.`;
      }
      
      if (conflictingResidents.length > 0) {
        successMessage += `\n\nLưu ý: ${conflictingResidents.length} cư dân không thể tham gia do trùng lịch:\n${conflictingResidents.join('\n')}`;
      }
      
      Alert.alert(
        'Thành công',
        successMessage,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
      
    } catch (error) {
      console.error('Error updating activity:', error);
      Alert.alert(
        'Lỗi',
        'Có lỗi xảy ra khi cập nhật hoạt động. Vui lòng kiểm tra lại thông tin và thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setSubmitting(false);
    }
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString('vi-VN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin hoạt động...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Chỉnh sửa hoạt động" titleStyle={FONTS.h2} />
        <Appbar.Action icon="check" onPress={handleSubmit} />
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
          removeClippedSubviews={false}
          onScrollBeginDrag={Keyboard.dismiss}
          scrollEnabled={true}
        >
          <View style={styles.scrollContent}>
            <Text style={styles.sectionTitle}>Thông tin hoạt động</Text>
            
            <TextInput
              key="activity-name"
              label="Tên hoạt động"
              value={name}
              onChangeText={handleNameChange}
              style={styles.input}
              error={!!errors.name}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.name}>
              {errors.name}
            </HelperText>
            
            <TextInput
              key="activity-description"
              label="Mô tả"
              value={description}
              onChangeText={handleDescriptionChange}
              multiline
              numberOfLines={4}
              style={styles.input}
              error={!!errors.description}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description}
            </HelperText>
            
            <Text style={styles.inputLabel}>Loại hoạt động</Text>
            <View style={styles.activityTypeContainer}>
              {ACTIVITY_TYPES.map((type) => {
                const isSelected = activityType === type.value;
                
                return (
                  <ActivityTypeChip
                    key={type.value}
                    type={type}
                    isSelected={isSelected}
                    onPress={() => handleActivityTypeChange(type.value)}
                  />
                );
              })}
            </View>
            
            {activityType === 'Khác' && (
              <>
                <TextInput
                  key="custom-activity-type"
                  label="Nhập loại hoạt động"
                  value={customActivityType}
                  onChangeText={handleCustomActivityTypeChange}
                  style={styles.input}
                  error={!!errors.customActivityType}
                  mode="outlined"
                />
                <HelperText type="error" visible={!!errors.customActivityType}>
                  {errors.customActivityType}
                </HelperText>
              </>
            )}
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Lịch trình</Text>
            
            <View>
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                style={styles.dateTimeInput}
              >
                <TextInput
                  label="Ngày"
                  value={formatDate(date)}
                  right={<TextInput.Icon icon="calendar" />}
                  mode="outlined"
                  editable={false}
                  style={styles.input}
                />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  style={Platform.OS === 'android' ? { width: '100%' } : {}}
                />
              )}
              
              <TouchableOpacity
                onPress={() => setShowTimePicker(true)}
                style={styles.dateTimeInput}
              >
                <TextInput
                  label="Thời gian"
                  value={formatTime(time)}
                  right={<TextInput.Icon icon="clock-outline" />}
                  mode="outlined"
                  editable={false}
                  style={styles.input}
                />
              </TouchableOpacity>
              {showTimePicker && (
                <DateTimePicker
                  value={time}
                  mode="time"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleTimeChange}
                  style={Platform.OS === 'android' ? { width: '100%' } : {}}
                />
              )}
              
              <TextInput
                key="duration"
                label="Thời lượng (phút)"
                value={duration}
                onChangeText={handleDurationChange}
                keyboardType="numeric"
                style={styles.input}
                error={!!errors.duration}
                mode="outlined"
              />
              <HelperText type="error" visible={!!errors.duration}>
                {errors.duration}
              </HelperText>
              
              <Text style={styles.inputLabel}>Địa điểm</Text>
              <DropDownPicker
                open={locationOpen}
                value={location}
                items={locationItems}
                setOpen={setLocationOpen}
                setValue={handleLocationChange}
                style={styles.dropdownPicker}
                dropDownContainerStyle={styles.dropdownContainerStyle}
                placeholder="Chọn địa điểm"
                zIndex={10000}
                zIndexInverse={1000}
                listMode="FLATLIST"
                maxHeight={280}
                minHeight={80}
                listItemContainerStyle={styles.listItemContainer}
                listItemLabelStyle={styles.listItemLabel}
                scrollViewProps={{
                  nestedScrollEnabled: true,
                  showsVerticalScrollIndicator: true,
                  scrollEnabled: true,
                }}
                flatListProps={{
                  nestedScrollEnabled: true,
                  showsVerticalScrollIndicator: true,
                  scrollEnabled: true,
                  contentContainerStyle: { paddingBottom: 20 },
                }}
              />
              <HelperText type="error" visible={!!errors.location}>
                {errors.location}
              </HelperText>
            </View>
            
            <Divider style={styles.divider} />
            <Text style={styles.sectionTitle}>Tham gia</Text>
            
            <TextInput
              key="capacity"
              label="Sức chứa tối đa"
              value={capacity}
              onChangeText={handleCapacityChange}
              keyboardType="numeric"
              style={styles.input}
              error={!!errors.capacity}
              mode="outlined"
            />
            <HelperText type="error" visible={!!errors.capacity}>
              {errors.capacity}
            </HelperText>
            
            <Text style={styles.inputLabel}>Người hướng dẫn</Text>
            <View style={styles.facilitatorContainer}>
              <Text style={styles.facilitatorText}>{user?.full_name || 'Nhân viên'}</Text>
              <Text style={styles.facilitatorRole}>{user?.position || 'Nhân viên'}</Text>
            </View>
            
            <Text style={styles.inputLabel}>Đề xuất cư dân tham gia</Text>
            
            {loadingResidents ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={COLORS.primary} />
                <Text style={styles.loadingText}>Đang tải danh sách cư dân...</Text>
              </View>
            ) : (
              <View style={styles.residentSelectorContainer}>
                <Button
                  mode="outlined"
                  onPress={toggleResidentSelector}
                  style={styles.residentSelectorButton}
                  icon={showResidentSelector ? "chevron-up" : "chevron-down"}
                >
                  {showResidentSelector ? 'Ẩn danh sách' : `Chọn cư dân (${filteredResidents.length} có sẵn)`}
                </Button>
                
                {showResidentSelector && (
                  <View style={styles.residentSelectorContent}>
                    {/* Search Bar */}
                    <Searchbar
                      placeholder="Tìm kiếm cư dân..."
                      onChangeText={handleSearchQueryChange}
                      value={searchQuery}
                      style={styles.searchBar}
                      elevation={0}
                    />
                    
                    {/* Filter Chips */}
                    <View style={styles.filterContainer}>
                      <Text style={styles.filterLabel}>Lọc theo độ tuổi:</Text>
                      <View style={styles.filterChips}>
                        {[
                          { label: 'Tất cả', value: 'all' },
                          { label: '60-70', value: '60-70' },
                          { label: '71-80', value: '71-80' },
                          { label: '81-90', value: '81-90' },
                          { label: '90+', value: '90+' }
                        ].map((filter) => (
                          <Chip
                            key={filter.value}
                            selected={ageFilter === filter.value}
                            onPress={() => handleAgeFilterChange(filter.value)}
                            style={[
                              styles.filterChip,
                              ageFilter === filter.value && styles.selectedFilterChip
                            ]}
                            textStyle={[
                              styles.filterChipText,
                              ageFilter === filter.value && styles.selectedFilterChipText
                            ]}
                          >
                            {filter.label}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    
                    <View style={styles.filterContainer}>
                      <Text style={styles.filterLabel}>Lọc theo giới tính:</Text>
                      <View style={styles.filterChips}>
                        {[
                          { label: 'Tất cả', value: 'all' },
                          { label: 'Nam', value: 'Nam' },
                          { label: 'Nữ', value: 'Nữ' }
                        ].map((filter) => (
                          <Chip
                            key={filter.value}
                            selected={genderFilter === filter.value}
                            onPress={() => handleGenderFilterChange(filter.value)}
                            style={[
                              styles.filterChip,
                              genderFilter === filter.value && styles.selectedFilterChip
                            ]}
                            textStyle={[
                              styles.filterChipText,
                              genderFilter === filter.value && styles.selectedFilterChipText
                            ]}
                          >
                            {filter.label}
                          </Chip>
                        ))}
                      </View>
                    </View>
                    
                    {/* Residents List */}
                    <View style={styles.residentsListContainer}>
                      <Text style={styles.residentsListTitle}>
                        Danh sách cư dân ({filteredResidents.length})
                      </Text>
                      <FlatList
                        data={filteredResidents}
                        keyExtractor={(item) => item._id}
                        renderItem={({ item }) => {
                          const isSelected = selectedResidents.includes(item._id);
                          const ageDisplay = item.age && item.age !== 'N/A' ? `${item.age} tuổi` : 'Tuổi N/A';
                          const bedRoomInfo = getBedRoomInfo(item);
                          
                          return (
                            <TouchableOpacity
                              onPress={() => handleResidentToggle(item._id)}
                              style={[
                                styles.residentCard,
                                isSelected && styles.selectedResidentCard
                              ]}
                            >
                              <View style={styles.residentCardContent}>
                                <View style={styles.residentInfo}>
                                  <View style={styles.residentHeader}>
                                    <Text style={styles.residentName}>{item.full_name}</Text>
                                    <Checkbox
                                      status={isSelected ? 'checked' : 'unchecked'}
                                      onPress={() => handleResidentToggle(item._id)}
                                    />
                                  </View>
                                  <Text style={styles.residentDetails}>
                                    {bedRoomInfo} • {ageDisplay} • {item.gender === 'male' ? 'Nam' : item.gender === 'female' ? 'Nữ' : 'N/A'}
                                  </Text>
                                </View>
                              </View>
                            </TouchableOpacity>
                          );
                        }}
                        showsVerticalScrollIndicator={true}
                        style={styles.residentsList}
                        contentContainerStyle={styles.residentsListContent}
                        nestedScrollEnabled={true}
                        scrollEnabled={true}
                      />
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {selectedResidents.length > 0 && (
              <View style={styles.selectedResidentsContainer}>
                <Text style={styles.selectedResidentsTitle}>
                  Cư dân đã chọn ({selectedResidents.length})
                </Text>
                <View style={styles.selectedResidentsList}>
                  {getSelectedResidentsData().map((resident) => (
                    <Chip
                      key={resident._id}
                      style={styles.selectedResidentChip}
                      textStyle={styles.selectedResidentChipText}
                      onClose={() => handleRemoveResident(resident._id)}
                      closeIcon="close"
                    >
                      {resident.full_name}
                    </Chip>
                  ))}
                </View>
              </View>
            )}
            
            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              loading={submitting}
              disabled={submitting}
            >
              {submitting ? 'Đang cập nhật...' : 'Cập nhật hoạt động'}
            </Button>
                      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 12,
    marginTop: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 4,
  },
  dateTimeInput: {
    marginBottom: 4,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  activityTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  activityTypeChip: {
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  selectedChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.text,
  },
  selectedChipText: {
    color: COLORS.surface,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  facilitatorContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  facilitatorText: {
    ...FONTS.h4,
    color: COLORS.text,
    marginBottom: 4,
  },
  facilitatorRole: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  selectedResidentsContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 16,
  },
  selectedResidentsTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  selectedResidentsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectedResidentChip: {
    backgroundColor: COLORS.primary,
    marginBottom: 4,
  },
  selectedResidentChipText: {
    color: COLORS.surface,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
  },
  dropdownPicker: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 4,
  },
  dropdownContainerStyle: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: COLORS.surface,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: 280,
  },

  listItemContainer: {
    paddingVertical: 18,
    paddingHorizontal: 16,
    paddingBottom: 24,
    minHeight: 65,
  },
  listItemLabel: {
    fontSize: 16,
    color: COLORS.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: COLORS.textSecondary,
  },
  // Resident Selector Styles
  residentSelectorContainer: {
    marginBottom: 16,
  },
  residentSelectorButton: {
    marginBottom: 8,
  },
  residentSelectorContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  searchBar: {
    backgroundColor: COLORS.background,
    marginBottom: 16,
    elevation: 0,
    shadowOpacity: 0,
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 0,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterLabel: {
    ...FONTS.body3,
    color: COLORS.text,
    marginBottom: 8,
    fontWeight: '600',
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginRight: 4,
    marginBottom: 4,
  },
  selectedFilterChip: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    marginRight: 4,
    marginBottom: 4,
  },
  filterChipText: {
    color: COLORS.text,
  },
  selectedFilterChipText: {
    color: COLORS.surface,
  },
  residentsListContainer: {
    marginTop: 8,
  },
  residentsListTitle: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 12,
    fontWeight: '600',
  },
  residentsList: {
    maxHeight: 300,
    flex: 1,
  },
  residentsListContent: {
    paddingBottom: 8,
  },
  residentCard: {
    marginBottom: 8,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
  },
  selectedResidentCard: {
    backgroundColor: COLORS.primary + '15',
    borderColor: COLORS.primary,
  },
  residentCardContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  residentInfo: {
    flex: 1,
  },
  residentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  residentName: {
    ...FONTS.body2,
    color: COLORS.text,
    fontWeight: '600',
    flex: 1,
  },
  residentDetails: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
});

export default EditActivityScreen; 