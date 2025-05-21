import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import { FontAwesome, MaterialIcons, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

// Import theme
import { COLORS } from '../constants/theme';

// Import screens
import FamilyHomeScreen from '../screens/family/FamilyHomeScreen';
import FamilyResidentScreen from '../screens/family/FamilyResidentScreen';
import FamilyCommunicationScreen from '../screens/family/FamilyCommunicationScreen';
import FamilyVisitScreen from '../screens/family/FamilyVisitScreen';
import FamilyPhotoGalleryScreen from '../screens/family/FamilyPhotoGalleryScreen';
import FamilyNotificationsScreen from '../screens/family/FamilyNotificationsScreen';
import FamilyProfileScreen from '../screens/family/FamilyProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Stack navigators for each section
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyHomeScreen" component={FamilyHomeScreen} />
  </Stack.Navigator>
);

const ResidentStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyResidentScreen" component={FamilyResidentScreen} />
  </Stack.Navigator>
);

const CommunicationStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyCommunicationScreen" component={FamilyCommunicationScreen} />
  </Stack.Navigator>
);

const VisitStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyVisitScreen" component={FamilyVisitScreen} />
  </Stack.Navigator>
);

const GalleryStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyPhotoGalleryScreen" component={FamilyPhotoGalleryScreen} />
  </Stack.Navigator>
);

const NotificationsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyNotificationsScreen" component={FamilyNotificationsScreen} />
  </Stack.Navigator>
);

const ProfileStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="FamilyProfileScreen" component={FamilyProfileScreen} />
  </Stack.Navigator>
);

const FamilyNavigator = () => {
  const unreadCount = useSelector((state) => state.notifications.unreadCount);
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingTop: 5,
          paddingBottom: 10,
          height: 65,
          position: 'absolute',
          elevation: 5,
          shadowOpacity: 0.2,
          shadowRadius: 3,
          shadowOffset: { height: -3, width: 0 },
          bottom: 15,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Loved One"
        component={ResidentStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Messages"
        component={CommunicationStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="message-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Visits"
        component={VisitStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="event" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="photo-library" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Alerts"
        component={NotificationsStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications" size={size} color={color} />
          ),
          tabBarBadge: unreadCount > 0 ? unreadCount : null,
          tabBarBadgeStyle: { backgroundColor: COLORS.error },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <FontAwesome name="user-circle" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default FamilyNavigator; 