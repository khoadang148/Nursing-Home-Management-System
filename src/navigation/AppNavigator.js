import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';

// Import navigators
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import MobileOptimizedNavigator from './MobileOptimizedNavigator';

// Import screens
import SplashScreen from '../screens/SplashScreen';

// Import deep link handler
import deepLinkHandler from '../utils/deepLinkHandler';

const Stack = createStackNavigator();

// Thay đổi USE_MOBILE_NAVIGATION thành true để sử dụng phiên bản mobile tối ưu
const USE_MOBILE_NAVIGATION = true;

const AppNavigator = () => {
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);
  const navigationRef = useRef(null);
  
  useEffect(() => {
    // Khởi tạo deep link handler khi navigation sẵn sàng
    try {
      if (navigationRef.current) {
        deepLinkHandler.init(navigationRef.current);
      }

      // Cleanup khi component unmount
      return () => {
        try {
          deepLinkHandler.cleanup();
        } catch (error) {
          console.error('Error cleaning up deep link handler:', error);
        }
      };
    } catch (error) {
      console.error('Error initializing deep link handler:', error);
    }
  }, []);
  
  if (!isInitialized) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer ref={navigationRef}>
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