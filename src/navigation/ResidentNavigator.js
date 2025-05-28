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

const Stack = createStackNavigator();

const ResidentNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DanhSachCuDan"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DanhSachCuDan" component={ResidentListScreen} />
      <Stack.Screen name="ChiTietCuDan" component={ResidentDetailScreen} />
      <Stack.Screen name="ThemCuDan" component={AddResidentScreen} />
      <Stack.Screen name="SuaCuDan" component={EditResidentScreen} />
      <Stack.Screen name="ChiTietKeHoachChamSoc" component={CarePlanDetailScreen} />
      <Stack.Screen name="ThemKeHoachChamSoc" component={AddCarePlanScreen} />
      <Stack.Screen name="ChiTietThuoc" component={MedicationDetailScreen} />
      <Stack.Screen name="ThemThuoc" component={AddMedicationScreen} />
      <Stack.Screen name="GhiNhanDauHieuSinhTon" component={RecordVitalsScreen} />
      <Stack.Screen name="ChiTietDauHieuSinhTon" component={VitalDetailScreen} />
      <Stack.Screen name="GhiChuCuDan" component={ResidentNotesScreen} />
      <Stack.Screen name="GiaDinhCuDan" component={ResidentFamilyScreen} />
    </Stack.Navigator>
  );
};

export default ResidentNavigator; 