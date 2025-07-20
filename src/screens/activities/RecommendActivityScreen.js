import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { 
  Appbar, 
  Card, 
  Text, 
  Chip, 
  Button, 
  Avatar, 
  ProgressBar,
  ActivityIndicator,
  Divider,
  IconButton,
  SegmentedButtons
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch } from 'react-redux';
import residentService from '../../api/services/residentService';

const RecommendActivityScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { residentId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [resident, setResident] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [filter, setFilter] = useState('all');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch resident data using new service
        const residentResponse = await residentService.getResidentById(residentId);
        
        if (residentResponse.success) {
          const residentData = residentService.formatResidentForDisplay(residentResponse.data);
          setResident(residentData);
          
          // Generate mock recommendations based on resident data
          const mockRecommendations = generateRecommendations(residentData);
          setRecommendations(mockRecommendations);
        } else {
          console.error('Error loading resident:', residentResponse.error);
        }
      } catch (error) {
        console.error('Error loading resident recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [residentId]);
  
  // Generate mock recommendations based on resident data
  const generateRecommendations = (residentData) => {
    const baseRecommendations = [
      {
        id: '1',
        title: 'Tập thể dục buổi sáng',
        description: 'Hoạt động thể chất nhẹ nhàng để tăng cường sức khỏe',
        category: 'physical',
        duration: '30 phút',
        difficulty: 'easy',
        benefits: ['Tăng cường sức khỏe tim mạch', 'Cải thiện lưu thông máu'],
        equipment: ['Không cần thiết bị'],
        score: 85
      },
      {
        id: '2',
        title: 'Trò chơi trí nhớ',
        description: 'Hoạt động kích thích não bộ và cải thiện trí nhớ',
        category: 'cognitive',
        duration: '20 phút',
        difficulty: 'medium',
        benefits: ['Cải thiện trí nhớ', 'Tăng khả năng tập trung'],
        equipment: ['Thẻ bài, giấy bút'],
        score: 78
      },
      {
        id: '3',
        title: 'Vẽ tranh theo chủ đề',
        description: 'Hoạt động sáng tạo giúp thư giãn và phát triển nghệ thuật',
        category: 'creative',
        duration: '45 phút',
        difficulty: 'easy',
        benefits: ['Giảm stress', 'Phát triển sáng tạo'],
        equipment: ['Giấy vẽ, bút màu'],
        score: 92
      },
      {
        id: '4',
        title: 'Trò chuyện nhóm',
        description: 'Hoạt động giao tiếp xã hội với các cư dân khác',
        category: 'social',
        duration: '60 phút',
        difficulty: 'easy',
        benefits: ['Cải thiện kỹ năng giao tiếp', 'Tăng sự tự tin'],
        equipment: ['Không cần thiết bị'],
        score: 88
      },
      {
        id: '5',
        title: 'Thiền định',
        description: 'Hoạt động tinh thần giúp thư giãn và cân bằng cảm xúc',
        category: 'spiritual',
        duration: '15 phút',
        difficulty: 'easy',
        benefits: ['Giảm stress', 'Cải thiện giấc ngủ'],
        equipment: ['Không cần thiết bị'],
        score: 95
      }
    ];
    
    // Filter recommendations based on resident's medical history
    if (residentData.medical_history) {
      const medicalHistory = residentData.medical_history.toLowerCase();
      
      // Add specific recommendations based on conditions
      if (medicalHistory.includes('tiểu đường')) {
        baseRecommendations.push({
          id: '6',
          title: 'Đi bộ trong vườn',
          description: 'Hoạt động thể chất nhẹ nhàng phù hợp cho người tiểu đường',
          category: 'physical',
          duration: '20 phút',
          difficulty: 'easy',
          benefits: ['Kiểm soát đường huyết', 'Tăng cường sức khỏe'],
          equipment: ['Không cần thiết bị'],
          score: 90
        });
      }
      
      if (medicalHistory.includes('cao huyết áp')) {
        baseRecommendations.push({
          id: '7',
          title: 'Thở sâu và thư giãn',
          description: 'Kỹ thuật thở giúp kiểm soát huyết áp',
          category: 'spiritual',
          duration: '10 phút',
          difficulty: 'easy',
          benefits: ['Giảm huyết áp', 'Thư giãn tinh thần'],
          equipment: ['Không cần thiết bị'],
          score: 87
        });
      }
    }
    
    return baseRecommendations;
  };
  
  // Filter recommendations based on selection
  const filteredRecommendations = recommendations.filter(recommendation => {
    if (filter === 'all') return true;
    return recommendation.category.toLowerCase() === filter.toLowerCase();
  });
  
  const getActivityIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical':
        return <MaterialIcons name="fitness-center" size={24} color={COLORS.primary} />;
      case 'social':
        return <MaterialIcons name="people" size={24} color={COLORS.accent} />;
      case 'cognitive':
        return <MaterialCommunityIcons name="brain" size={24} color="#FF9500" />;
      case 'creative':
        return <MaterialIcons name="brush" size={24} color="#FF3B30" />;
      case 'spiritual':
        return <MaterialCommunityIcons name="meditation" size={24} color="#5856D6" />;
      default:
        return <MaterialIcons name="event" size={24} color={COLORS.primary} />;
    }
  };
  
  const getActivityColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'physical': return COLORS.primary;
      case 'social': return COLORS.accent;
      case 'cognitive': return '#FF9500';
      case 'creative': return '#FF3B30';
      case 'spiritual': return '#5856D6';
      default: return COLORS.primary;
    }
  };
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }
  
  if (!resident || !recommendations.length) {
    return (
      <View style={styles.container}>
        <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
        <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Gợi ý Hoạt động" titleStyle={FONTS.h2} />
        </Appbar.Header>
        
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color={COLORS.error} />
          <Text style={styles.errorText}>
            {!resident ? 'Resident not found' : 'No recommendations available'}
          </Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.goBack()}
            style={{ marginTop: 16 }}
          >
            Go Back
          </Button>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Gợi ý Hoạt động" titleStyle={FONTS.h2} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.residentCard}>
          <Card.Content>
            <View style={styles.residentHeader}>
              <Avatar.Text 
                size={60} 
                label={resident.full_name ? resident.full_name.substring(0, 2).toUpperCase() : 'NA'} 
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.residentInfo}>
                <Text style={FONTS.h3}>{resident.full_name || 'Không có tên'}</Text>
                <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                  {resident.age || 0} tuổi • Phòng {resident.roomNumber || 'Chưa phân phòng'}
                </Text>
                <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                  {resident.relationship || 'Chưa cập nhật'}
                </Text>
              </View>
            </View>
            
            {resident.medical_history && (
              <View style={styles.preferenceContainer}>
                <Text style={[FONTS.body2, { marginVertical: 8 }]}>Tiền sử bệnh</Text>
                <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                  {resident.medical_history}
                </Text>
              </View>
            )}
            
            {resident.current_medications && resident.current_medications.length > 0 && (
              <View style={styles.preferenceContainer}>
                <Text style={[FONTS.body2, { marginVertical: 8 }]}>Thuốc hiện tại</Text>
                {resident.current_medications.slice(0, 3).map((med, index) => (
                  <Text key={index} style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                    • {med.medication_name} - {med.dosage} ({med.frequency})
                  </Text>
                ))}
                {resident.current_medications.length > 3 && (
                  <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                    • Và {resident.current_medications.length - 3} thuốc khác...
                  </Text>
                )}
              </View>
            )}
            
            <Divider style={styles.divider} />
            
            <View style={styles.engagementContainer}>
              <View style={styles.engagementHeader}>
                <Text style={FONTS.body2}>Gợi ý hoạt động</Text>
                <Text style={[FONTS.body3, {color: COLORS.primary}]}>Dựa trên tình trạng sức khỏe</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Thể chất</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={0.75} 
                    color={COLORS.primary} 
                    style={styles.progressBar} 
                  />
                </View>
                <Text style={styles.scoreText}>75%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Xã hội</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={0.68} 
                    color={COLORS.accent} 
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>68%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Nhận thức</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={0.82}
                    color="#FF9500"
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>82%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Sáng tạo</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={0.91} 
                    color="#FF3B30"
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>91%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Hoạt động được gợi ý</Text>
          <Text style={styles.sectionDescription}>
            Hoạt động được cá nhân hóa cho {resident.full_name || 'người cao tuổi'} dựa trên tình trạng sức khỏe và sở thích
          </Text>
          
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            style={styles.filterButtons}
            buttons={[
              { value: 'all', label: 'Tất cả' },
              { value: 'physical', label: 'Thể chất' },
              { value: 'social', label: 'Xã hội' },
              { value: 'cognitive', label: 'Nhận thức' },
              { value: 'creative', label: 'Sáng tạo' },
            ]}
          />
          
          {filteredRecommendations.map((recommendation, index) => (
            <Card key={index} style={styles.recommendationCard}>
              <Card.Content>
                <View style={styles.recommendationHeader}>
                  <View 
                    style={[
                      styles.activityIconContainer, 
                      { backgroundColor: getActivityColor(recommendation.category) }
                    ]}
                  >
                    {getActivityIcon(recommendation.category)}
                  </View>
                  <View style={styles.recommendationInfo}>
                    <Text style={FONTS.h4}>{recommendation.title}</Text>
                    <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                      {recommendation.category} Activity
                    </Text>
                  </View>
                  <View style={styles.matchContainer}>
                    <Text style={styles.matchLabel}>Match</Text>
                    <Text style={styles.matchScore}>{recommendation.score}%</Text>
                  </View>
                </View>
                
                <Text style={styles.recommendationReason}>
                  <MaterialIcons name="lightbulb" size={16} color={COLORS.accent} />
                  {' '}{recommendation.description}
                </Text>
                
                <View style={styles.benefitsContainer}>
                  {recommendation.benefits.map((benefit, idx) => (
                    <Chip 
                      key={idx}
                      icon="check-circle" 
                      style={styles.benefitChip}
                    >
                      {benefit}
                    </Chip>
                  ))}
                </View>
                
                <View style={styles.actionButtonsRow}>
                  <Button 
                    mode="contained" 
                    onPress={() => navigation.navigate('TaoHoatDong', {
                      prefill: {
                        name: recommendation.title,
                        type: recommendation.category.toLowerCase(),
                        participants: [resident]
                      }
                    })}
                    style={styles.scheduleButton}
                  >
                    Schedule
                  </Button>
                  <Button 
                    mode="outlined" 
                    onPress={() => {}}
                    style={styles.detailsButton}
                  >
                    Details
                  </Button>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </ScrollView>
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
  residentCard: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  residentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  residentInfo: {
    marginLeft: 16,
    flex: 1,
  },
  preferenceContainer: {
    marginVertical: 8,
  },
  preferencesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  preferenceChip: {
    margin: 4,
    backgroundColor: COLORS.background,
  },
  divider: {
    marginVertical: 16,
  },
  engagementContainer: {
    marginVertical: 8,
  },
  engagementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  categoryLabel: {
    ...FONTS.body3,
    width: 80,
  },
  progressBarContainer: {
    flex: 1,
    marginHorizontal: 8,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
  },
  scoreText: {
    ...FONTS.body3,
    width: 40,
    textAlign: 'right',
    color: COLORS.text,
  },
  recommendationsSection: {
    marginVertical: SIZES.padding,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
  },
  sectionDescription: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 16,
  },
  filterButtons: {
    marginBottom: 16,
  },
  recommendationCard: {
    marginBottom: SIZES.padding,
    borderRadius: SIZES.radius * 2,
    backgroundColor: COLORS.surface,
    ...SHADOWS.small,
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  activityIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  matchContainer: {
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: SIZES.radius,
  },
  matchLabel: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  matchScore: {
    ...FONTS.h3,
    color: COLORS.primary,
  },
  recommendationReason: {
    ...FONTS.body3,
    color: COLORS.text,
    marginVertical: 8,
    fontStyle: 'italic',
  },
  benefitsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  benefitChip: {
    margin: 4,
    backgroundColor: COLORS.primary + '15',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  scheduleButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: COLORS.primary,
  },
  detailsButton: {
    flex: 1,
    marginLeft: 8,
    borderColor: COLORS.primary,
  },
});

export default RecommendActivityScreen;