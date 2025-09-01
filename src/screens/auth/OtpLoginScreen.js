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
  Alert,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useNotification } from '../../components/NotificationSystem';

// Placeholder actions, to be implemented in redux
import { loginWithOtp, sendOtp, resetAuthError, resetAuthMessage } from '../../redux/slices/authSlice';

const { width, height } = Dimensions.get('window');

const OtpLoginScreen = ({ navigation }) => {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const dispatch = useDispatch();
  const { error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError, showWarning } = useNotification();

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  // Clear errors when user starts typing
  useEffect(() => {
    if (phone || otp) {
      dispatch(resetAuthError());
    }
  }, [phone, otp, dispatch]);

  // Handle success/error messages
  useEffect(() => {
    if (message && isAuthenticated) {
      showSuccess(message);
      dispatch(resetAuthMessage());
    }
  }, [message, isAuthenticated, showSuccess, dispatch]);

  useEffect(() => {
    if (error) {
      let userFriendlyMessage = 'Có lỗi xảy ra. Vui lòng thử lại.';
      
      if (typeof error === 'string') {
        if (error.includes('phone') || error.includes('not found')) {
          userFriendlyMessage = 'Số điện thoại chưa được đăng ký trong hệ thống.';
        } else if (error.includes('OTP') || error.includes('otp')) {
          userFriendlyMessage = 'Mã OTP không đúng hoặc đã hết hạn.';
        } else if (error.includes('network') || error.includes('timeout')) {
          userFriendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
        }
      } else if (error && typeof error === 'object') {
        if (error.message) {
          const errorMsg = error.message.toLowerCase();
          if (errorMsg.includes('phone') || errorMsg.includes('not found')) {
            userFriendlyMessage = 'Số điện thoại chưa được đăng ký trong hệ thống.';
          } else if (errorMsg.includes('otp') || errorMsg.includes('invalid')) {
            userFriendlyMessage = 'Mã OTP không đúng hoặc đã hết hạn.';
          } else if (errorMsg.includes('network') || errorMsg.includes('timeout')) {
            userFriendlyMessage = 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.';
          }
        }
      }
      
      showError(userFriendlyMessage);
      dispatch(resetAuthError());
    }
  }, [error, showError, dispatch]);

  // Countdown timer for resend OTP
  useEffect(() => {
    let interval = null;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  // Start animations
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

  // Validate phone number
  const validatePhone = (phoneNumber) => {
    const phoneRegex = /^[0-9]{10,15}$/;
    return phoneRegex.test(phoneNumber);
  };

  // Handle send OTP
  const handleSendOtp = async () => {
    if (!validatePhone(phone)) {
      showError('Vui lòng nhập số điện thoại hợp lệ (10-15 chữ số)');
      return;
    }

    setIsLoading(true);
    try {
      console.log('OtpLoginScreen - Sending OTP to phone:', phone);
      const result = await dispatch(sendOtp({ phone }));
      console.log('OtpLoginScreen - Send OTP result:', result);
      
      if (result.payload?.success) {
        setIsOtpSent(true);
        setCountdown(60); // 60 seconds countdown
        showSuccess('Mã OTP đã được gửi đến số điện thoại của bạn');
      } else {
        // Hiển thị thông báo lỗi cụ thể từ backend
        const errorMessage = result.payload?.error || 'Không thể gửi mã OTP';
        showError(errorMessage);
      }
    } catch (error) {
      console.log('OtpLoginScreen - Send OTP error:', error);
      showError('Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle login with OTP
  const handleLoginWithOtp = async () => {
    if (!otp || otp.length !== 6) {
      showError('Vui lòng nhập mã OTP 6 chữ số');
      return;
    }

    setIsLoading(true);
    try {
      console.log('OtpLoginScreen - Attempting OTP login with phone:', phone);
      const result = await dispatch(loginWithOtp({ phone, otp }));
      console.log('OtpLoginScreen - Login result:', result);
      
      if (result.payload?.success) {
        console.log('OtpLoginScreen - Login successful, user data:', result.payload.user);
        showSuccess('Đăng nhập thành công');
        // Navigation will be handled by the auth state change
      }
    } catch (error) {
      console.log('OtpLoginScreen - Login error:', error);
      showError('Đăng nhập thất bại. Vui lòng kiểm tra lại mã OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOtp = () => {
    if (countdown > 0) return;
    handleSendOtp();
  };

  // Format phone number for display
  const formatPhone = (phoneNumber) => {
    if (phoneNumber.length <= 3) return phoneNumber;
    if (phoneNumber.length <= 7) {
      return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)} ${phoneNumber.slice(3, 7)} ${phoneNumber.slice(7)}`;
  };

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
        <MaterialCommunityIcons name="cellphone-message" size={40} color="#ff6b6b" />
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
        <MaterialCommunityIcons name="shield-check" size={35} color="#4ecdc4" />
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
        <MaterialCommunityIcons name="lock" size={30} color="#45b7d1" />
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
                <Text style={styles.formTitle}>
                  {isOtpSent ? 'Nhập mã OTP' : 'Đăng nhập bằng số điện thoại'}
                </Text>

                {/* Phone Input */}
                <TextInput
                  mode="outlined"
                  label="Số điện thoại"
                  value={formatPhone(phone)}
                  onChangeText={(text) => setPhone(text.replace(/\s/g, ''))}
                  keyboardType="phone-pad"
                  maxLength={15}
                  disabled={isOtpSent}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="phone" color="#00A551" />}
                />

                {/* Send OTP Button */}
                {!isOtpSent && (
                  <Button
                    mode="contained"
                    onPress={handleSendOtp}
                    loading={isLoading}
                    disabled={!validatePhone(phone) || isLoading}
                    style={styles.sendOtpButton}
                    contentStyle={styles.sendOtpButtonContent}
                    labelStyle={styles.sendOtpButtonLabel}
                  >
                    Gửi mã OTP
                  </Button>
                )}

                {/* OTP Input */}
                {isOtpSent && (
                  <>
                    <TextInput
                      mode="outlined"
                      label="Mã OTP"
                      value={otp}
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                      maxLength={6}
                      style={styles.input}
                      outlineColor="#00A551"
                      activeOutlineColor="#00A551"
                      left={<TextInput.Icon icon="lock" color="#00A551" />}
                    />

                    <Button
                      mode="contained"
                      onPress={handleLoginWithOtp}
                      loading={isLoading}
                      disabled={!otp || otp.length !== 6 || isLoading}
                      style={styles.loginButton}
                      contentStyle={styles.loginButtonContent}
                      labelStyle={styles.loginButtonLabel}
                    >
                      Đăng nhập
                    </Button>

                    {/* Resend OTP */}
                    <View style={styles.resendContainer}>
                      <Text style={styles.resendText}>
                        Không nhận được mã?{' '}
                      </Text>
                      <TouchableOpacity
                        onPress={handleResendOtp}
                        disabled={countdown > 0}
                        style={styles.resendButton}
                      >
                        <Text
                          style={[
                            styles.resendButtonText,
                            countdown > 0 && styles.resendButtonDisabled,
                          ]}
                        >
                          {countdown > 0 ? `Gửi lại (${countdown}s)` : 'Gửi lại'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </>
                )}

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.divider} />
                </View>

                {/* Back to Email Login */}
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('DangNhap')}
                  style={styles.emailLoginButton}
                  contentStyle={styles.emailLoginButtonContent}
                  labelStyle={styles.emailLoginButtonLabel}
                  disabled={isLoading}
                >
                  Đăng nhập bằng email
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
    paddingHorizontal: 0,
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
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  sendOtpButton: {
    backgroundColor: '#00A551',
    borderRadius: 8,
    elevation: 2,
  },
  sendOtpButtonContent: {
    height: 48,
  },
  sendOtpButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
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
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  resendText: {
    fontSize: 14,
    color: '#666',
  },
  resendButton: {
    marginLeft: 8,
  },
  resendButtonText: {
    fontSize: 14,
    color: '#00A551',
    fontWeight: '600',
  },
  resendButtonDisabled: {
    color: '#999',
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
  emailLoginButton: {
    borderColor: '#00A551',
    borderWidth: 1,
    borderRadius: 8,
  },
  emailLoginButtonContent: {
    height: 48,
  },
  emailLoginButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
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

export default OtpLoginScreen;
