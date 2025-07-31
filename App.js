import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Provider as ReduxProvider } from 'react-redux';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox, View, Text } from 'react-native';
import { store } from './src/redux/store';
import AppNavigator from './src/navigation/AppNavigator';
import { NotificationProvider } from './src/components/NotificationSystem';

// Ignore specific warnings that don't affect functionality
LogBox.ignoreLogs([
  'Text strings must be rendered within a <Text> component',
  'VirtualizedLists should never be nested',
  'Warning: Failed prop type',
  'Warning: useInsertionEffect must not schedule updates',
  'Warning: ReactDOM.render is no longer supported',
  'Warning: componentWillReceiveProps has been renamed',
  'Warning: componentWillMount has been renamed',
  'Warning: componentWillUpdate has been renamed',
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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
          <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 20 }}>
            Đã xảy ra lỗi. Vui lòng khởi động lại ứng dụng.
          </Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
            Nếu lỗi vẫn tiếp tục, hãy liên hệ hỗ trợ.
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  console.log('App component rendering...');
  
  try {
    return (
      <ErrorBoundary>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <SafeAreaProvider style={{ flex: 1 }}>
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
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('Error in App component:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
        <Text style={{ fontSize: 18, color: '#333', textAlign: 'center', marginBottom: 20 }}>
          Lỗi khởi động ứng dụng
        </Text>
        <Text style={{ fontSize: 14, color: '#666', textAlign: 'center' }}>
          {error.message}
        </Text>
      </View>
    );
  }
}
