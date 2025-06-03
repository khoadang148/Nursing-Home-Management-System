import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import BillingScreen from '../screens/family/BillingScreen';
import BillDetailScreen from '../screens/family/BillDetailScreen';
import PaymentHistoryScreen from '../screens/family/PaymentHistoryScreen';

const Stack = createStackNavigator();

const FamilyBillStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="BillingScreen" component={BillingScreen} />
    <Stack.Screen name="BillDetail" component={BillDetailScreen} />
    <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
  </Stack.Navigator>
);

export default FamilyBillStack; 