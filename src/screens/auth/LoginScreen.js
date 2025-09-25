import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Animated,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useNotification } from '../../components/NotificationSystem';

// Placeholder actions, to be implemented in redux
import { login, resetAuthError, resetAuthMessage } from '../../redux/slices/authSlice';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError, showWarning } = useNotification();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Clear error and message when component mounts and unmounts
  useEffect(() => {
    // Clear any existing messages when component mounts
    dispatch(resetAuthMessage());
    dispatch(resetAuthError());
    
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (email || password) {
      dispatch(resetAuthError());
    }
  }, [email, password, dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (message && isAuthenticated) {
      showSuccess(message);
      dispatch(resetAuthMessage());
    }
  }, [message, isAuthenticated, showSuccess, dispatch]);

  // Handle informative backend messages when not authenticated (e.g., locked/inactive account)
  useEffect(() => {
    if (message && !isAuthenticated) {
      const lowerStateMsg = (message || '').toLowerCase();
      const isInactiveOrLocked =
        lowerStateMsg.includes('bị khóa') ||
        lowerStateMsg.includes('chưa được kích hoạt') ||
        lowerStateMsg.includes('khóa') ||
        lowerStateMsg.includes('kích hoạt');

      if (isInactiveOrLocked) {
        showError('Tài khoản đã bị khóa hoặc chưa được kích hoạt. Vui lòng kiểm tra email hoặc liên hệ quản trị viên.');
        dispatch(resetAuthMessage());
        dispatch(resetAuthError());
      }
    }
  }, [message, isAuthenticated, showError, dispatch]);

  useEffect(() => {
    if (error) {
      // Parse error message and show user-friendly message
      let userFriendlyMessage = 'Đăng nhập thất bại. Vui lòng thử lại.';

      // Extract possible server-provided message/code from various shapes
      const serverMessage = (
        (error && typeof error === 'object' && (error.response?.data?.message || error.message)) ||
        (typeof error === 'string' ? error : '')
      );
      const serverErrorCode = (error && typeof error === 'object' && (error.response?.data?.error || error.error || error.code)) || '';
      const lowerMsg = (serverMessage || '').toLowerCase();
      const lowerCode = (serverErrorCode || '').toLowerCase();
      const lowerStateMsg = (typeof message === 'string' ? message : '').toLowerCase();

      // Case 1: Account locked/banned/not activated
      if (
        lowerMsg.includes('bị khóa') ||
        lowerMsg.includes('chưa được kích hoạt') ||
        lowerCode.includes('account_inactive') ||
        lowerCode.includes('account_locked') ||
        lowerCode.includes('account_banned') ||
        // Some BE may still return INVALID_CREDENTIALS code but message indicates inactive
        (lowerCode.includes('invalid_credentials') && (lowerMsg.includes('khóa') || lowerMsg.includes('kích hoạt'))) ||
        // Fallback to state message when error is generic
        lowerStateMsg.includes('bị khóa') ||
        lowerStateMsg.includes('chưa được kích hoạt') ||
        lowerStateMsg.includes('khóa') ||
        lowerStateMsg.includes('kích hoạt')
      ) {
        userFriendlyMessage = 'Tài khoản đã bị khóa hoặc chưa được kích hoạt. Vui lòng kiểm tra email hoặc liên hệ quản trị viên.';
      }
      // Case 2: Incorrect email/password
      else if (
        typeof error === 'string' && (error.includes('401') || error.toLowerCase().includes('unauthorized'))
      ) {
        userFriendlyMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else if (error && typeof error === 'object' && (error.status === 401 || error.statusCode === 401)) {
        userFriendlyMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else if (lowerMsg.includes('invalid credentials') || lowerMsg.includes('unauthorized')) {
        userFriendlyMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      } else if (lowerMsg.includes('user not found') || (error && typeof error === 'object' && (error.status === 404 || error.statusCode === 404))) {
        userFriendlyMessage = 'Tài khoản không tồn tại. Vui lòng kiểm tra email.';
      }
      // Case 3: Network/server errors
      else if (lowerMsg.includes('network') || lowerMsg.includes('timeout')) {
        userFriendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
      } else if (error && typeof error === 'object' && (error.status === 500 || error.statusCode === 500)) {
        userFriendlyMessage = 'Lỗi máy chủ. Vui lòng thử lại sau.';
      } else {
        // Fallback
        userFriendlyMessage = 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại.';
      }

      // Log technical error to console for debugging (but don't show to user)
      console.log('Technical error (hidden from user):', error);
      
      showError(userFriendlyMessage);
      dispatch(resetAuthError());
    }
  }, [error, showError, dispatch, message]);

  useEffect(() => {
    // Pulse animation for logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Float animation for elements
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Glow animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: false,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: false,
        }),
      ])
    ).start();

    // Title animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(titleAnim, {
          toValue: 1,
          duration: 2200,
          useNativeDriver: true,
        }),
        Animated.timing(titleAnim, {
          toValue: 0,
          duration: 2200,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = useCallback(async () => {
    // Validation
    if (!email && !password) {
      showWarning('Vui lòng nhập email và mật khẩu để đăng nhập');
      return;
    }
    if (!email) {
      showWarning('Vui lòng nhập địa chỉ email');
      return;
    }
    if (!password) {
      showWarning('Vui lòng nhập mật khẩu');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    // Dispatch login action
    dispatch(login({ email, password }));
  }, [email, password, showWarning, dispatch]);

  const togglePasswordVisibility = useCallback(() => {
    setPasswordVisible(!passwordVisible);
  }, [passwordVisible]);

  return (
    <View style={styles.container}>
      {/* Animated Background */}
      <LinearGradient
        colors={['#f9e7c4', '#fbc2eb', '#a8d8ff']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Glassmorphism overlay */}
      <View style={styles.glassOverlay} />

      {/* Floating Elements */}
      <Animated.View 
        style={[
          styles.floatingElement1,
          {
            transform: [{
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -15]
              })
            }, {
              scale: pulseAnim
            }]
          }
        ]}
      >
        <MaterialCommunityIcons name="heart" size={40} color="#ff6b6b" />
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingElement2,
          {
            transform: [{
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 10]
              })
            }]
          }
        ]}
      >
        <MaterialCommunityIcons name="account-group" size={35} color="#4ecdc4" />
      </Animated.View>

      <Animated.View 
        style={[
          styles.floatingElement3,
          {
            transform: [{
              translateY: floatAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, -8]
              })
            }]
          }
        ]}
      >
        <MaterialCommunityIcons name="shield-check" size={30} color="#45b7d1" />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Logo and Welcome Section */}
            <View style={styles.headerSection}>
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name="hospital-building"
                  size={60}
                  color="#00A551"
                />
              </Animated.View>
              
              <Animated.Text 
                style={[
                  styles.appTitle,
                  {
                    transform: [{
                      scale: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.02]
                      })
                    }]
                  }
                ]}
              >
                CareHome
              </Animated.Text>
              
              <Animated.Text 
                style={[
                  styles.appSubtitle,
                  {
                    opacity: titleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1]
                    })
                  }
                ]}
              >
                Hệ thống quản lý viện dưỡng lão
              </Animated.Text>
              
              <Animated.Text 
                style={[
                  styles.appSlogan,
                  {
                    transform: [{
                      translateY: titleAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2]
                      })
                    }]
                  }
                ]}
              >
                Chuyên nghiệp • An toàn • Tận tâm
              </Animated.Text>
            </View>

            {/* Illustration Section */}
            <View style={styles.illustrationSection}>
              <View style={styles.illustrationContainer}>
                <Image
                  source={require('../../../assets/elderly-care.jpg')}
                  style={styles.illustration}
                  resizeMode="cover"
                />
              </View>
            </View>

            {/* Login Form */}
            <View style={styles.formSection}>
              <View style={styles.formContainer}>
                <TextInput
                  mode="outlined"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="email" color="#00A551" />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <TextInput
                  mode="outlined"
                  label="Mật khẩu"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!passwordVisible}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="lock" color="#00A551" />}
                  right={
                    <TextInput.Icon
                      icon={passwordVisible ? "eye-off" : "eye"}
                      color="#00A551"
                      onPress={togglePasswordVisibility}
                    />
                  }
                />

                <TouchableOpacity
                  onPress={() => navigation.navigate('QuenMatKhau')}
                  style={styles.forgotPassword}
                >
                  <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
                </TouchableOpacity>

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonLabel}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Đăng nhập
                </Button>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.divider} />
                </View>

                {/* OTP Login Button */}
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('OtpLogin')}
                  style={styles.otpLoginButton}
                  contentStyle={styles.otpLoginButtonContent}
                  labelStyle={styles.otpLoginButtonLabel}
                  disabled={isLoading}
                >
                  Đăng nhập bằng OTP
                </Button>

                {/* Register Button */}
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('Register')}
                  style={styles.registerButton}
                  contentStyle={styles.registerButtonContent}
                  labelStyle={styles.registerButtonLabel}
                  disabled={isLoading}
                >
                  Chưa có tài khoản? Đăng ký ngay
                </Button>
              </View>
            </View>

            {/* Security Note */}
            <Animated.View 
              style={[
                styles.securityNote,
                {
                  opacity: glowAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.7, 1]
                  })
                }
              ]}
            >
              <MaterialCommunityIcons name="shield-check" size={20} color="#00A551" />
              <Text style={styles.securityText}>
                Dữ liệu được mã hóa và bảo mật theo tiêu chuẩn y tế quốc tế
              </Text>
            </Animated.View>

            {/* Version */}
            <Text style={styles.version}>Version: 1.0.0</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  glassOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  floatingElement1: {
    position: 'absolute',
    top: '15%',
    left: '10%',
    zIndex: 1,
    opacity: 0.6,
  },
  floatingElement2: {
    position: 'absolute',
    top: '60%',
    right: '15%',
    zIndex: 1,
    opacity: 0.5,
  },
  floatingElement3: {
    position: 'absolute',
    bottom: '25%',
    left: '5%',
    zIndex: 1,
    opacity: 0.4,
  },
  safeArea: {
    flex: 1,
    zIndex: 2,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerSection: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 50,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#00A551',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#00A551',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
  },
  appSlogan: {
    fontSize: 14,
    color: '#00A551',
    textAlign: 'center',
    fontWeight: '600',
    fontStyle: 'italic',
  },
  illustrationSection: {
    marginBottom: 30,
    paddingHorizontal: 0, // Remove padding to match form width
  },
  illustrationContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  illustration: {
    width: '100%',
    height: 200,
    borderRadius: 16,
  },
  formSection: {
    marginTop: 24,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: '#00A551',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#00A551',
    borderRadius: 8,
    elevation: 2,
  },
  loginButtonContent: {
    height: 48,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
  otpLoginButton: {
    borderColor: '#00A551',
    borderWidth: 1,
    borderRadius: 8,
  },
  otpLoginButtonContent: {
    height: 48,
  },
  otpLoginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A551',
  },
  registerButton: {
    marginTop: 16,
  },
  registerButtonContent: {
    height: 48,
  },
  registerButtonLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00A551',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 24,
  },
  securityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    textAlign: 'center',
  },
  version: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 16,
  },
});

export default LoginScreen; 