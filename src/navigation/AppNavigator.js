import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MobileOptimizedNavigator from './MobileOptimizedNavigator';

// Import screens
import SplashScreen from '../screens/SplashScreen';

const Stack = createStackNavigator();

// Thay đổi USE_MOBILE_NAVIGATION thành true để sử dụng phiên bản mobile tối ưu
const USE_MOBILE_NAVIGATION = true;

const AppNavigator = () => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  
  if (!isInitialized) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen 
            name="ManHinhChinh" 
            component={USE_MOBILE_NAVIGATION ? MobileOptimizedNavigator : MainNavigator} 
          />
        ) : (
          <Stack.Screen name="XacThuc" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator; 