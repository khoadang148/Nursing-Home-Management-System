import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Chip,
  IconButton,
  ActivityIndicator,
  Badge,
} from 'react-native-paper';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Mock data cho các gói dịch vụ
const mockServicePackages = [
  {
    id: '1',
    name: 'Gói Cơ Bản',
    price: 3000000,
    duration: 'Tháng',
    popular: false,
    description: 'Chăm sóc thiết yếu hàng ngày',
    features: [
      'Chăm sóc 24/7',
      'Bữa ăn 3 bữa/ngày',
      'Kiểm tra sức khỏe tuần',
      'Vệ sinh phòng ở',
      'Hoạt động giải trí',
    ],
    color: COLORS.primary,
    icon: 'favorite',
  },
  {
    id: '2',
    name: 'Gói Nâng Cao',
    price: 5000000,
    duration: 'Tháng',
    popular: true,
    description: 'Dịch vụ toàn diện chuyên sâu',
    features: [
      'Tất cả dịch vụ cơ bản',
      'Chăm sóc y tế chuyên khoa',
      'Liệu pháp vật lý',
      'Tư vấn dinh dưỡng',
      'Giải trí đa dạng',
      'Giặt ủi premium',
      'Phòng riêng cao cấp',
    ],
    color: COLORS.accent,
    icon: 'star',
  },
  {
    id: '3',
    name: 'Gói VIP',
    price: 8000000,
    duration: 'Tháng',
    popular: false,
    description: 'Dịch vụ cao cấp nhất',
    features: [
      'Tất cả dịch vụ nâng cao',
      'Chăm sóc 1-1 riêng',
      'Bữa ăn theo yêu cầu',
      'Kiểm tra sức khỏe hàng ngày',
      'Spa và massage',
      'Phòng suite ban công',
      'Đưa đón khi cần',
      'Hỗ trợ 24/7',
    ],
    color: COLORS.secondary,
    icon: 'diamond',
  },
];

// Mock data cho gói hiện tại
const currentPackage = {
  id: '1',
  name: 'Gói Cơ Bản',
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  status: 'active',
};

const ServicePackageScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [packages, setPackages] = useState(mockServicePackages);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [current, setCurrent] = useState(currentPackage);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setTimeout(() => {
      setPackages(mockServicePackages);
      setCurrent(currentPackage);
      setLoading(false);
    }, 1000);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSelectPackage = (packageData) => {
    if (packageData.id === current?.id) {
      Alert.alert('Thông báo', 'Đây là gói dịch vụ hiện tại của bạn');
      return;
    }

    Alert.alert(
      'Xác nhận thay đổi gói',
      `Chuyển sang "${packageData.name}"?\n\nGiá: ${formatPrice(packageData.price)}/${packageData.duration}`,
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Xác nhận', onPress: () => handleConfirmChange(packageData) },
      ]
    );
  };

  const handleConfirmChange = async (packageData) => {
    setLoading(true);
    
    setTimeout(() => {
      setCurrent({
        ...packageData,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
      });
      
      Alert.alert(
        'Thành công',
        `Đã chuyển sang "${packageData.name}". Gói dịch vụ mới sẽ có hiệu lực từ ngày mai.`,
        [{ text: 'OK' }]
      );
      
      setLoading(false);
    }, 2000);
  };

  const handleContactSupport = () => {
    Alert.alert(
      'Liên hệ hỗ trợ',
      'Chọn phương thức liên hệ:',
      [
        { text: 'Hủy', style: 'cancel' },
        { 
          text: 'Gọi điện', 
          onPress: () => Alert.alert('Gọi điện', 'Đang kết nối đến 1900-xxxx...') 
        },
        { 
          text: 'Chat', 
          onPress: () => navigation.navigate('TabsChính', { screen: 'TinNhan' })
        },
      ]
    );
  };

  const renderPackageCard = (packageData) => {
    const isCurrentPackage = current?.id === packageData.id;
    
    return (
      <TouchableOpacity 
        key={packageData.id} 
        style={[styles.packageCard, isCurrentPackage && styles.currentPackageCard]}
        onPress={() => !isCurrentPackage && handleSelectPackage(packageData)}
        disabled={isCurrentPackage}
      >
        {/* Header */}
        <View style={styles.packageHeader}>
          <View style={styles.packageTitleRow}>
            <MaterialIcons 
              name={packageData.icon} 
              size={20} 
              color={packageData.color} 
            />
            <Text style={styles.packageName}>{packageData.name}</Text>
            {packageData.popular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularText}>PHỔ BIẾN</Text>
              </View>
            )}
          </View>
          
          {isCurrentPackage && (
            <View style={styles.currentBadge}>
              <Text style={styles.currentText}>ĐANG DÙNG</Text>
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={[styles.price, { color: packageData.color }]}>
            {formatPrice(packageData.price)}
          </Text>
          <Text style={styles.duration}>/{packageData.duration}</Text>
        </View>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {packageData.description}
        </Text>

        {/* Features Preview */}
        <View style={styles.featuresPreview}>
          {packageData.features.slice(0, 3).map((feature, index) => (
            <View key={index} style={styles.featureItem}>
              <MaterialIcons name="check-circle" size={14} color={packageData.color} />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
          {packageData.features.length > 3 && (
            <Text style={styles.moreFeatures}>
              +{packageData.features.length - 3} tính năng khác
            </Text>
          )}
        </View>

        {/* Action Button */}
        {!isCurrentPackage && (
          <TouchableOpacity 
            style={[styles.selectButton, { backgroundColor: packageData.color }]}
            onPress={() => handleSelectPackage(packageData)}
          >
            <Text style={styles.selectButtonText}>Chọn gói này</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Đang tải gói dịch vụ...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Gói Dịch Vụ</Text>
          <Text style={styles.headerSubtitle}>
            Chọn gói phù hợp với nhu cầu chăm sóc
          </Text>
        </View>

        {/* Current Package Summary */}
        {current && (
          <View style={styles.currentSummary}>
            <View style={styles.currentSummaryHeader}>
              <MaterialIcons name="info" size={18} color={COLORS.primary} />
              <Text style={styles.currentSummaryTitle}>Gói hiện tại</Text>
            </View>
            <Text style={styles.currentSummaryText}>
              {current.name} - {formatPrice(packages.find(p => p.id === current.id)?.price || 0)}/tháng
            </Text>
          </View>
        )}

        {/* Package Cards */}
        <View style={styles.packagesContainer}>
          {packages.map(renderPackageCard)}
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Cần hỗ trợ?</Text>
          <Text style={styles.supportText}>
            Liên hệ với chúng tôi để được tư vấn chi tiết về các gói dịch vụ
          </Text>
          
          <View style={styles.supportButtons}>
            <TouchableOpacity style={styles.supportButton} onPress={handleContactSupport}>
              <MaterialIcons name="phone" size={18} color={COLORS.primary} />
              <Text style={styles.supportButtonText}>Gọi điện</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.supportButton} 
              onPress={() => navigation.navigate('TabsChính', { screen: 'TinNhan' })}
            >
              <MaterialIcons name="chat" size={18} color={COLORS.primary} />
              <Text style={styles.supportButtonText}>Chat ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 15,
    color: '#6c757d',
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 15,
    color: '#6c757d',
  },
  currentSummary: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.primary,
  },
  currentSummaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  currentSummaryTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 8,
  },
  currentSummaryText: {
    fontSize: 14,
    color: '#1976d2',
  },
  packagesContainer: {
    gap: 16,
  },
  packageCard: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  currentPackageCard: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  packageHeader: {
    marginBottom: 14,
  },
  packageTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  packageName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginLeft: 10,
    flex: 1,
  },
  popularBadge: {
    backgroundColor: '#ff6b35',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
  },
  popularText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  currentBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  currentText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  duration: {
    fontSize: 15,
    color: '#6c757d',
    marginLeft: 4,
  },
  description: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 14,
    lineHeight: 20,
  },
  featuresPreview: {
    marginBottom: 18,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureText: {
    fontSize: 13,
    color: '#495057',
    marginLeft: 8,
    flex: 1,
  },
  moreFeatures: {
    fontSize: 13,
    color: '#6c757d',
    fontStyle: 'italic',
    marginTop: 6,
  },
  selectButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  supportSection: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8,
  },
  supportText: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 14,
    lineHeight: 20,
  },
  supportButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
    backgroundColor: 'white',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary,
    marginLeft: 8,
  },
});

export default ServicePackageScreen; 