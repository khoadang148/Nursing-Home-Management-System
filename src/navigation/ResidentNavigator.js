import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import ResidentListScreen from '../screens/residents/ResidentListScreen';
import ResidentDetailScreen from '../screens/residents/ResidentDetailScreen';
import AddResidentScreen from '../screens/residents/AddResidentScreen';
import EditResidentScreen from '../screens/residents/EditResidentScreen';
import CarePlanDetailScreen from '../screens/residents/CarePlanDetailScreen';
import AddCarePlanScreen from '../screens/residents/AddCarePlanScreen';
import MedicationDetailScreen from '../screens/residents/MedicationDetailScreen';
import AddMedicationScreen from '../screens/residents/AddMedicationScreen';
import RecordVitalsScreen from '../screens/residents/RecordVitalsScreen';
import VitalDetailScreen from '../screens/residents/VitalDetailScreen';
import ResidentNotesScreen from '../screens/residents/ResidentNotesScreen';
import ResidentFamilyScreen from '../screens/residents/ResidentFamilyScreen';
import AddAssessmentScreen from '../screens/residents/AddAssessmentScreen';

// Import medication screens
import MedicationDetailsScreen from '../screens/medications/MedicationDetailsScreen';
import MedicationScheduleScreen from '../screens/medications/MedicationScheduleScreen';
import MedicationAdminScreen from '../screens/medications/MedicationAdminScreen';

// Import task screens
import EditTaskScreen from '../screens/tasks/EditTaskScreen';

const Stack = createStackNavigator();

const ResidentNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="ResidentList"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ResidentList" component={ResidentListScreen} />
      <Stack.Screen name="ResidentDetails" component={ResidentDetailScreen} />
      <Stack.Screen name="AddResident" component={AddResidentScreen} />
      <Stack.Screen name="EditResident" component={EditResidentScreen} />
      <Stack.Screen name="CarePlanDetail" component={CarePlanDetailScreen} />
      <Stack.Screen name="AddCarePlan" component={AddCarePlanScreen} />
      <Stack.Screen name="MedicationDetail" component={MedicationDetailScreen} />
      <Stack.Screen name="AddMedication" component={AddMedicationScreen} />
      <Stack.Screen name="RecordVitals" component={RecordVitalsScreen} />
      <Stack.Screen name="VitalDetail" component={VitalDetailScreen} />
      <Stack.Screen name="ResidentNotes" component={ResidentNotesScreen} />
      <Stack.Screen name="ResidentFamily" component={ResidentFamilyScreen} />
      <Stack.Screen name="AddAssessment" component={AddAssessmentScreen} />
      
      {/* Add missing medication screens */}
      <Stack.Screen name="MedicationDetails" component={MedicationDetailsScreen} />
      <Stack.Screen name="MedicationSchedule" component={MedicationScheduleScreen} />
      <Stack.Screen name="MedicationAdmin" component={MedicationAdminScreen} />
      
      {/* Add missing task screens */}
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
    </Stack.Navigator>
  );
};

export default ResidentNavigator; 