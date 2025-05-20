import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ActivityListScreen from '../screens/activities/ActivityListScreen';
import ActivityDetailsScreen from '../screens/activities/ActivityDetailsScreen';
import CreateActivityScreen from '../screens/activities/CreateActivityScreen';
import ActivityCalendarScreen from '../screens/activities/ActivityCalendarScreen';
import RecommendActivityScreen from '../screens/activities/RecommendActivityScreen';

const Stack = createStackNavigator();

const ActivityNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="ActivityList" component={ActivityListScreen} />
      <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
      <Stack.Screen name="CreateActivity" component={CreateActivityScreen} />
      <Stack.Screen name="ActivityCalendar" component={ActivityCalendarScreen} />
      <Stack.Screen name="RecommendActivity" component={RecommendActivityScreen} />
    </Stack.Navigator>
  );
};

export default ActivityNavigator; 