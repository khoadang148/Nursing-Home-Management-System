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
import { 
  getResidentDetails, 
  getRecommendedActivities 
} from '../../api/residentService';

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
        // Fetch resident data and recommendations in parallel
        const [residentData, recommendationsData] = await Promise.all([
          getResidentDetails(residentId),
          getRecommendedActivities(residentId)
        ]);
        
        setResident(residentData);
        setRecommendations(recommendationsData);
      } catch (error) {
        console.error('Error loading resident recommendations:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [residentId]);
  
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
                label={`${resident.firstName[0]}${resident.lastName[0]}`} 
                style={{ backgroundColor: COLORS.primary }}
              />
              <View style={styles.residentInfo}>
                <Text style={FONTS.h3}>{resident.firstName} {resident.lastName}</Text>
                <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                  {resident.age} years old • Room {resident.roomNumber}
                </Text>
              </View>
            </View>
            
            <View style={styles.preferenceContainer}>
              <Text style={[FONTS.body2, { marginVertical: 8 }]}>Activity Preferences</Text>
              <View style={styles.preferencesRow}>
                {resident.preferences.map((pref, index) => (
                  <Chip key={index} style={styles.preferenceChip} mode="outlined">
                    {pref}
                  </Chip>
                ))}
              </View>
            </View>
            
            <Divider style={styles.divider} />
            
            <View style={styles.engagementContainer}>
              <View style={styles.engagementHeader}>
                <Text style={FONTS.body2}>Activity Engagement</Text>
                <Text style={[FONTS.body3, {color: COLORS.primary}]}>Last 30 days</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Physical</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={resident.engagementScores.physical / 100} 
                    color={COLORS.primary} 
                    style={styles.progressBar} 
                  />
                </View>
                <Text style={styles.scoreText}>{resident.engagementScores.physical}%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Social</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={resident.engagementScores.social / 100} 
                    color={COLORS.accent} 
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>{resident.engagementScores.social}%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Cognitive</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={resident.engagementScores.cognitive / 100} 
                    color="#FF9500"
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>{resident.engagementScores.cognitive}%</Text>
              </View>
              
              <View style={styles.categoryProgressRow}>
                <Text style={styles.categoryLabel}>Creative</Text>
                <View style={styles.progressBarContainer}>
                  <ProgressBar 
                    progress={resident.engagementScores.creative / 100} 
                    color="#FF3B30"
                    style={styles.progressBar}
                  />
                </View>
                <Text style={styles.scoreText}>{resident.engagementScores.creative}%</Text>
              </View>
            </View>
          </Card.Content>
        </Card>
        
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recommended Activities</Text>
          <Text style={styles.sectionDescription}>
            Activities personalized for {resident.firstName} based on preferences and health status
          </Text>
          
          <SegmentedButtons
            value={filter}
            onValueChange={setFilter}
            style={styles.filterButtons}
            buttons={[
              { value: 'all', label: 'All' },
              { value: 'physical', label: 'Physical' },
              { value: 'social', label: 'Social' },
              { value: 'cognitive', label: 'Cognitive' },
              { value: 'creative', label: 'Creative' },
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
                    <Text style={FONTS.h4}>{recommendation.activityName}</Text>
                    <Text style={[FONTS.body3, { color: COLORS.textSecondary }]}>
                      {recommendation.category} Activity
                    </Text>
                  </View>
                  <View style={styles.matchContainer}>
                    <Text style={styles.matchLabel}>Match</Text>
                    <Text style={styles.matchScore}>{recommendation.matchScore}%</Text>
                  </View>
                </View>
                
                <Text style={styles.recommendationReason}>
                  <MaterialIcons name="lightbulb" size={16} color={COLORS.accent} />
                  {' '}{recommendation.reason}
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
                        name: recommendation.activityName,
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