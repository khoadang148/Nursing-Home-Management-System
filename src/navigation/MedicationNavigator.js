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
      <Stack.Screen name="DanhSachThuoc" component={MedicationListScreen} />
      <Stack.Screen name="ChiTietThuoc" component={MedicationDetailsScreen} />
      <Stack.Screen name="ThemThuoc" component={AddMedicationScreen} />
      <Stack.Screen name="LichUongThuoc" component={MedicationScheduleScreen} />
      <Stack.Screen name="QuanLyThuoc" component={MedicationAdminScreen} />
    </Stack.Navigator>
  );
};

export default MedicationNavigator; 