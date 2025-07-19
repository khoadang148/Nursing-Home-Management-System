import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationProvider } from './src/components/NotificationSystem';

// Ignore specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
  'VirtualizedLists should never be nested',
  'Warning: Failed prop type',
]);

// Configure the app theme
import { COLORS } from './src/constants/theme';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    accent: COLORS.accent,
    background: COLORS.background,
    surface: COLORS.surface,
    text: COLORS.text,
    error: COLORS.error,
    disabled: COLORS.disabled,
    placeholder: COLORS.textSecondary,
    backdrop: COLORS.shadow,
  },
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ReduxProvider store={store}>
          <PaperProvider theme={theme}>
            <NotificationProvider>
              <StatusBar style="auto" />
              <AppNavigator />
            </NotificationProvider>
          </PaperProvider>
        </ReduxProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
