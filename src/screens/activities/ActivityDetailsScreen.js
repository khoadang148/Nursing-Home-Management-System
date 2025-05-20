import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar, Image } from 'react-native';
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
  ActivityIndicator
} from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityDetails } from '../../redux/slices/activitySlice';

const ActivityDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const dispatch = useDispatch();
  const { activityId } = route.params;
  
  const [loading, setLoading] = useState(true);
  const [activity, setActivity] = useState(null);
  
  useEffect(() => {
    setLoading(true);
    dispatch(fetchActivityDetails(activityId))
      .unwrap()
      .then(data => {
        setActivity(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching activity details:', error);
        setLoading(false);
      });
  }, [dispatch, activityId]);
  
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
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  const formatTime = (dateString) => {
    const options = { hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleTimeString(undefined, options);
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
        <Text style={styles.errorText}>Activity not found</Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.goBack()}
          style={{ marginTop: 16 }}
        >
          Go Back
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
        <Appbar.Action icon="pencil" onPress={() => navigation.navigate('EditActivity', { activityId })} iconColor="#fff" />
        <Appbar.Action icon="dots-vertical" onPress={() => {}} iconColor="#fff" />
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
                {activity.type}
              </Chip>
            </View>
          </Card.Content>
        </Card>
        
        <Card style={styles.detailCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.descriptionText}>{activity.description}</Text>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Details</Text>
            <List.Item
              title="Location"
              description={activity.location}
              left={props => <List.Icon {...props} icon="map-marker" color={COLORS.primary} />}
            />
            <List.Item
              title="Duration"
              description={`${activity.durationMinutes} minutes`}
              left={props => <List.Icon {...props} icon="clock-outline" color={COLORS.primary} />}
            />
            <List.Item
              title="Capacity"
              description={`${activity.participants} participants`}
              left={props => <List.Icon {...props} icon="account-group" color={COLORS.primary} />}
            />
            <List.Item
              title="Facilitator"
              description={activity.facilitator}
              left={props => <List.Icon {...props} icon="account" color={COLORS.primary} />}
            />
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Participants</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.participantsContainer}
            >
              {activity.participantsList && activity.participantsList.map((participant, index) => (
                <View key={index} style={styles.participantItem}>
                  <Avatar.Text 
                    size={50} 
                    label={`${participant.firstName[0]}${participant.lastName[0]}`}
                    style={{ backgroundColor: COLORS.primary }}
                  />
                  <Text style={styles.participantName} numberOfLines={1}>
                    {participant.firstName} {participant.lastName}
                  </Text>
                </View>
              ))}
              
              {(!activity.participantsList || activity.participantsList.length === 0) && (
                <View style={styles.noParticipantsContainer}>
                  <Text style={styles.noParticipantsText}>No participants yet</Text>
                </View>
              )}
            </ScrollView>
            
            <Divider style={styles.divider} />
            
            <Text style={styles.sectionTitle}>Materials Needed</Text>
            {activity.materials && activity.materials.length > 0 ? (
              activity.materials.map((item, index) => (
                <List.Item
                  key={index}
                  title={item.name}
                  description={`Quantity: ${item.quantity}`}
                  left={props => <List.Icon {...props} icon="package-variant" color={COLORS.primary} />}
                />
              ))
            ) : (
              <Text style={styles.emptyListText}>No materials required</Text>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
      
      <View style={styles.actionButtonsContainer}>
        <Button 
          mode="contained" 
          icon="check" 
          style={[styles.actionButton, {backgroundColor: COLORS.success}]} 
          labelStyle={{color: 'white'}}
          onPress={() => {}}
        >
          Mark Complete
        </Button>
        <Button 
          mode="contained" 
          icon="account-plus" 
          style={[styles.actionButton, {backgroundColor: COLORS.primary}]} 
          labelStyle={{color: 'white'}}
          onPress={() => {}}
        >
          Add Participants
        </Button>
      </View>
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
  participantsContainer: {
    paddingVertical: 8,
  },
  participantItem: {
    alignItems: 'center',
    marginRight: SIZES.padding * 1.5,
    width: 70,
  },
  participantName: {
    ...FONTS.body3,
    textAlign: 'center',
    marginTop: 6,
  },
  noParticipantsContainer: {
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noParticipantsText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  emptyListText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    paddingVertical: 8,
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SIZES.padding,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    ...SHADOWS.medium,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
  },
});

export default ActivityDetailsScreen; 