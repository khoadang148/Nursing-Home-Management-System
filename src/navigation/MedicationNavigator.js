import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import MedicationListScreen from '../screens/medications/MedicationListScreen';
import MedicationDetailsScreen from '../screens/medications/MedicationDetailsScreen';
import AddMedicationScreen from '../screens/medications/AddMedicationScreen';
import MedicationScheduleScreen from '../screens/medications/MedicationScheduleScreen';
import MedicationAdminScreen from '../screens/medications/MedicationAdminScreen';

const Stack = createStackNavigator();

const MedicationNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="MedicationList" component={MedicationListScreen} />
      <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} />
      <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
      <Stack.Screen name="MedicationSchedule" component={MedicationScheduleScreen} />
      <Stack.Screen name="MedicationAdmin" component={MedicationAdminScreen} />
    </Stack.Navigator>
  );
};

export default MedicationNavigator; 