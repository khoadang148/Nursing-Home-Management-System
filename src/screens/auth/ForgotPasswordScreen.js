import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
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
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useNotification } from '../../components/NotificationSystem';
import authService from '../../api/services/authService';

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { showSuccess, showError, showWarning } = useNotification();

  // Safe navigation method
  const safeNavigate = (routeName) => {
    try {
      if (navigation && navigation.navigate) {
        navigation.navigate(routeName);
      } else {
        console.warn('Navigation not available');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Navigation error:', error);
      navigation.goBack();
    }
  };

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleForgotPassword = async () => {
    // Validation
    if (!email.trim()) {
      showWarning('Vui lòng nhập địa chỉ email');
      return;
    }

    if (!validateEmail(email)) {
      showWarning('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    try {
      setIsLoading(true);
      
      // Gọi API forgot password
      const response = await authService.forgotPassword({ email: email.trim() });
      
      if (response && response.success) {
        showSuccess('Mật khẩu mới đã được gửi về email của bạn');
        
        // Hiển thị thông báo chi tiết
        Alert.alert(
          'Đặt lại mật khẩu thành công',
          'Mật khẩu mới đã được gửi về email của bạn. Vui lòng kiểm tra hộp thư và spam folder.\n\nMật khẩu mới: 123456789\n\nSau khi đăng nhập, bạn nên đổi mật khẩu để bảo mật tài khoản.',
          [
            {
              text: 'Đã hiểu',
              onPress: () => safeNavigate('DangNhap'),
            },
          ]
        );
      } else {
        const errorMessage = response?.message || 'Có lỗi xảy ra khi đặt lại mật khẩu';
        showError(errorMessage);
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      showError('Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    safeNavigate('DangNhap');
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

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header Section */}
            <Animated.View 
              style={[
                styles.headerSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <TouchableOpacity
                style={styles.backButton}
                onPress={handleBackToLogin}
                onLongPress={() => navigation.goBack()} // Fallback for long press
              >
                <MaterialCommunityIcons name="arrow-left" size={24} color={COLORS.primary} />
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.iconContainer,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name="lock-reset"
                  size={80}
                  color={COLORS.primary}
                />
              </Animated.View>

              <Text style={styles.title}>Quên mật khẩu?</Text>
              <Text style={styles.subtitle}>
                Đừng lo lắng! Chúng tôi sẽ giúp bạn đặt lại mật khẩu
              </Text>
            </Animated.View>

            {/* Form Section */}
            <Animated.View 
              style={[
                styles.formSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.formContainer}>
                <Text style={styles.formTitle}>Nhập email của bạn</Text>
                <Text style={styles.formDescription}>
                  Chúng tôi sẽ gửi mật khẩu mới về email đã đăng ký
                </Text>

                <TextInput
                  mode="outlined"
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  outlineColor={COLORS.primary}
                  activeOutlineColor={COLORS.primary}
                  left={<TextInput.Icon icon="email" color={COLORS.primary} />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  placeholder="Nhập địa chỉ email của bạn"
                />

                <Button
                  mode="contained"
                  onPress={handleForgotPassword}
                  style={styles.submitButton}
                  contentStyle={styles.submitButtonContent}
                  labelStyle={styles.submitButtonLabel}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Gửi mật khẩu mới
                </Button>

                <TouchableOpacity
                  onPress={handleBackToLogin}
                  style={styles.backToLoginButton}
                >
                  <Text style={styles.backToLoginText}>
                    Quay lại đăng nhập
                  </Text>
                </TouchableOpacity>
              </View>
            </Animated.View>

            {/* Info Section */}
            <Animated.View 
              style={[
                styles.infoSection,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }]
                }
              ]}
            >
              <View style={styles.infoContainer}>
                <MaterialCommunityIcons name="information" size={24} color={COLORS.primary} />
                <Text style={styles.infoText}>
                  Mật khẩu mới sẽ được gửi về email của bạn. Vui lòng kiểm tra cả hộp thư chính và spam folder.
                </Text>
              </View>
            </Animated.View>
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
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formSection: {
    marginBottom: 30,
  },
  formContainer: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 20,
    padding: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  formDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  input: {
    marginBottom: 24,
    backgroundColor: '#fff',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  submitButtonContent: {
    height: 48,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  backToLoginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backToLoginText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  infoSection: {
    marginTop: 20,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 12,
    lineHeight: 20,
  },
});

export default ForgotPasswordScreen; 