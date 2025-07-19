import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Card, IconButton, Avatar, Badge } from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useSelector } from 'react-redux';
import { residents, activities } from '../../api/mockData';

const DEFAULT_AVATAR = 'https://randomuser.me/api/portraits/men/1.jpg';

// Mock data - In a real app, this would come from an API
const mockDashboardData = {
  residents: {
    total: 42,
    newAdmissions: 3,
    requireAttention: 5,
  },
  tasks: {
    total: 28,
    completed: 17,
    pending: 11,
    overdue: 2,
  },
  medications: {
    pending: 8,
    administered: 23,
    refused: 1,
  },
  activities: {
    today: 6,
    upcoming: 4,
    participation: '78%',
  },
  alerts: [
    {
      id: '1',
      type: 'urgent',
      title: 'Cảnh Báo Thuốc',
      message: 'John Doe bỏ lỡ thuốc buổi sáng',
      time: '10:15 AM',
      read: false,
    },
    {
      id: '2',
      type: 'info',
      title: 'Cư Dân Mới',
      message: 'Margaret Wilson đã được đưa vào Phòng 204',
      time: 'Hôm qua',
      read: true,
    },
    {
      id: '3',
      type: 'warning',
      title: 'Dấu Hiệu Sinh Tồn',
      message: 'Mary Smith có huyết áp cao',
      time: 'Hôm qua',
      read: false,
    },
  ],
};

const upcomingShifts = [
  {
    id: '1',
    date: 'Hôm nay',
    startTime: '07:00 AM',
    endTime: '03:00 PM',
    department: 'Khoa Tổng Quát',
    assignedResidents: 8,
  },
  {
    id: '2',
    date: 'Ngày mai',
    startTime: '03:00 PM',
    endTime: '11:00 PM',
    department: 'Khoa Chăm Sóc Trí Nhớ',
    assignedResidents: 6,
  },
];

const DashboardScreen = ({ navigation }) => {
  const user = useSelector((state) => state.auth.user);
  const [refreshing, setRefreshing] = useState(false);
  // Lấy số lượng thực tế từ mockData
  const residentCount = residents.length;
  const activityCount = activities.length;
  const [dashboardData, setDashboardData] = useState(mockDashboardData);

  // Lấy thông tin user, fallback nếu chưa đăng nhập
  const getUserData = () => {
    if (user && user.full_name) return user;
    return {
      full_name: 'Nguyễn Văn A',
      avatar: DEFAULT_AVATAR,
    };
  };
  const userData = getUserData();

  // Chào hỏi theo thời gian
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Chào buổi sáng';
    if (hour < 17) return 'Chào buổi chiều';
    return 'Chào buổi tối';
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>{getGreeting()},</Text>
          <Text style={styles.nameText}>{userData.full_name}</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('HoSo')}
          style={styles.profileButton}
        >
          <Avatar.Image
            size={50}
            source={{ uri: userData.avatar || DEFAULT_AVATAR }}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Summary Cards */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: COLORS.primary }]}
            onPress={() => navigation.navigate('CuDan')}
          >
            <View style={styles.cardIconContainer}>
              <FontAwesome5 name="user-injured" size={24} color={COLORS.surface} />
            </View>
            <Text style={styles.cardTitle}>Cư Dân</Text>
            <Text style={styles.cardValue}>{residentCount}</Text>
            {/* Có thể thêm thông tin phụ nếu muốn */}
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.summaryCard, { backgroundColor: COLORS.info }]}
            onPress={() => navigation.navigate('HoatDong')}
          >
            <View style={styles.cardIconContainer}>
              <MaterialIcons name="event" size={24} color={COLORS.surface} />
            </View>
            <Text style={styles.cardTitle}>Hoạt Động</Text>
            <Text style={styles.cardValue}>{activityCount}</Text>
            {/* Có thể thêm thông tin phụ nếu muốn */}
          </TouchableOpacity>
        </View>
        {/* Ẩn các card nhiệm vụ và thuốc */}
        {/* Upcoming Shifts, Recent Alerts giữ nguyên nếu muốn */}
        <Card style={styles.shiftCard}>
          <Card.Title
            title="Ca Làm Sắp Tới"
            titleStyle={styles.cardSectionTitle}
            right={(props) => (
              <IconButton
                {...props}
                icon="calendar"
                color={COLORS.primary}
                size={24}
                onPress={() => navigation.navigate('NhiemVu')}
              />
            )}
          />
          <Card.Content>
            {upcomingShifts.map((shift) => (
                              <View key={shift.id} style={styles.shiftItem}>
                <View style={styles.shiftInfo}>
                  <Text style={styles.shiftDate}>{shift.date}</Text>
                  <Text style={styles.shiftTime}>
                    {shift.startTime} - {shift.endTime}
                  </Text>
                </View>
                <View style={styles.shiftDetails}>
                  <Text style={styles.shiftDepartment}>{shift.department}</Text>
                  <Text style={styles.shiftResidents}>
                    {shift.assignedResidents} cư dân
                  </Text>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>
        <Card style={styles.alertsCard}>
          <Card.Title
            title="Cảnh Báo Gần Đây"
            titleStyle={styles.cardSectionTitle}
            right={(props) => (
              <IconButton
                {...props}
                icon="bell"
                color={COLORS.primary}
                size={24}
                onPress={() => navigation.navigate('ThongBao')}
              />
            )}
          />
          <Card.Content>
            {dashboardData.alerts.map((alert) => (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertItem}
                onPress={() => navigation.navigate('ThongBao')}
              >
                <View
                  style={[
                    styles.alertIconContainer,
                    {
                      backgroundColor:
                        alert.type === 'urgent'
                          ? COLORS.error
                          : alert.type === 'warning'
                          ? COLORS.warning
                          : COLORS.info,
                    },
                  ]}
                >
                  <MaterialIcons
                    name={
                      alert.type === 'urgent'
                        ? 'priority-high'
                        : alert.type === 'warning'
                        ? 'warning'
                        : 'info'
                    }
                    size={20}
                    color={COLORS.surface}
                  />
                </View>
                <View style={styles.alertContent}>
                  <View style={styles.alertHeader}>
                    <Text style={styles.alertTitle}>
                      {alert.title}
                    </Text>
                    {!alert.read && <Badge size={8} style={styles.unreadBadge} />}
                  </View>
                  <Text style={styles.alertMessage}>
                    {alert.message}
                  </Text>
                  <Text style={styles.alertTime}>
                    {alert.time}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
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
    backgroundColor: COLORS.surface,
    ...SHADOWS.medium,
  },
  welcomeText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  nameText: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  profileButton: {
    borderRadius: 25,
    ...SHADOWS.small,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: SIZES.padding,
    paddingBottom: 100,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    width: '48%',
    borderRadius: SIZES.radius,
    padding: SIZES.padding,
    ...SHADOWS.medium,
  },
  cardIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    ...FONTS.body3,
    color: COLORS.surface,
    opacity: 0.9,
  },
  cardValue: {
    ...FONTS.h1,
    color: COLORS.surface,
    marginVertical: 5,
  },
  cardFooter: {
    marginTop: 5,
  },
  cardFooterText: {
    ...FONTS.body3,
    color: COLORS.surface,
    opacity: 0.8,
  },
  shiftCard: {
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  cardSectionTitle: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  shiftItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  shiftInfo: {
    flex: 1,
  },
  shiftDate: {
    ...FONTS.h5,
    color: COLORS.text,
  },
  shiftTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  shiftDetails: {
    flex: 1,
    alignItems: 'flex-end',
  },
  shiftDepartment: {
    ...FONTS.body2,
    color: COLORS.primary,
  },
  shiftResidents: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  alertsCard: {
    marginBottom: 16,
    borderRadius: SIZES.radius,
    ...SHADOWS.medium,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  alertIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  alertTitle: {
    ...FONTS.h5,
    color: COLORS.text,
    flex: 1,
  },
  unreadBadge: {
    backgroundColor: COLORS.primary,
    marginLeft: 8,
  },
  alertMessage: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  alertTime: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    opacity: 0.7,
  },
});

export default DashboardScreen; 