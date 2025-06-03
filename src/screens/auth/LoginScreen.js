import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
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

  // Clear error when component unmounts
  useEffect(() => {
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

  useEffect(() => {
    if (error) {
      showError(error);
      dispatch(resetAuthError());
    }
  }, [error, showError, dispatch]);

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
      {/* Background Waves */}
      <View style={styles.waveContainer}>
        <View style={[styles.wave, styles.wave1]} />
        <View style={[styles.wave, styles.wave2]} />
        <View style={[styles.wave, styles.wave3]} />
      </View>

      {/* Main Content */}
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Image
                source={require('../../../assets/logo.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.appTitle}>VIỆN DƯỠNG LÃO</Text>
            <Text style={styles.appSubtitle}>Hệ Thống Quản Lý Chăm Sóc</Text>
          </View>

          {/* Login Form */}
          <View style={styles.formSection}>
            <View style={styles.formContainer}>
              <Text style={styles.welcomeText}>Đăng nhập</Text>
              <Text style={styles.welcomeSubtext}>Vui lòng nhập thông tin để tiếp tục</Text>

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                style={styles.input}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                activeOutlineColor={COLORS.primary}
                outlineColor="transparent"
                left={<TextInput.Icon icon="email" iconColor={COLORS.primary} />}
                autoCapitalize="none"
                keyboardType="email-address"
                theme={{
                  colors: {
                    surface: COLORS.surface,
                    onSurface: COLORS.text,
                  }
                }}
              />

              <TextInput
                label="Mật khẩu"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!passwordVisible}
                style={styles.input}
                mode="outlined"
                outlineStyle={styles.inputOutline}
                activeOutlineColor={COLORS.primary}
                outlineColor="transparent"
                left={<TextInput.Icon icon="lock" iconColor={COLORS.primary} />}
                right={
                  <TextInput.Icon
                    icon={passwordVisible ? "eye-off" : "eye"}
                    iconColor={COLORS.primary}
                    onPress={togglePasswordVisibility}
                  />
                }
                theme={{
                  colors: {
                    surface: COLORS.surface,
                    onSurface: COLORS.text,
                  }
                }}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('QuenMatKhau')}
                style={styles.forgotPasswordLink}
              >
                <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
              </TouchableOpacity>

              <Button
                mode="contained"
                onPress={handleLogin}
                style={styles.loginButton}
                labelStyle={styles.loginButtonText}
                loading={isLoading}
                disabled={isLoading}
                buttonColor={COLORS.primary}
              >
                Đăng nhập
              </Button>
            </View>
          </View>

          {/* Version */}
          <View style={styles.versionContainer}>
            <Text style={styles.versionText}>Version: 1.0.0</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  waveContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  wave: {
    position: 'absolute',
    borderRadius: width,
  },
  wave1: {
    width: width * 1.8,
    height: height * 0.7,
    backgroundColor: COLORS.primary + '15',
    top: -height * 0.3,
    right: -width * 0.5,
    transform: [{ rotate: '15deg' }],
  },
  wave2: {
    width: width * 1.6,
    height: height * 0.6,
    backgroundColor: COLORS.primary + '25',
    top: -height * 0.25,
    right: -width * 0.4,
    transform: [{ rotate: '10deg' }],
  },
  wave3: {
    width: width * 1.4,
    height: height * 0.5,
    backgroundColor: COLORS.primary + '35',
    top: -height * 0.2,
    right: -width * 0.3,
    transform: [{ rotate: '5deg' }],
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    minHeight: height,
    paddingHorizontal: SIZES.large,
  },
  logoSection: {
    alignItems: 'center',
    paddingTop: height * 0.15,
    paddingBottom: SIZES.xxlarge,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.large,
    ...SHADOWS.large,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
  },
  appTitle: {
    ...FONTS.h1,
    fontSize: SIZES.h1 * 0.9,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SIZES.small / 2,
    letterSpacing: 1,
  },
  appSubtitle: {
    ...FONTS.body1,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
  },
  formSection: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: SIZES.large,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.large,
    padding: SIZES.large,
    paddingVertical: SIZES.xxlarge,
    ...SHADOWS.large,
    elevation: 10,
  },
  welcomeText: {
    ...FONTS.h2,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SIZES.small,
    fontWeight: '700',
  },
  welcomeSubtext: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SIZES.xxlarge,
  },
  input: {
    marginBottom: SIZES.large,
    backgroundColor: COLORS.background,
  },
  inputOutline: {
    borderRadius: SIZES.medium,
    borderWidth: 0,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.large,
    marginTop: -SIZES.small,
  },
  forgotPasswordText: {
    ...FONTS.body2,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: SIZES.medium,
    paddingVertical: SIZES.small / 2,
    elevation: 3,
  },
  loginButtonText: {
    ...FONTS.h5,
    fontWeight: '600',
    color: COLORS.surface,
  },
  versionContainer: {
    alignItems: 'center',
    paddingBottom: SIZES.xxlarge,
  },
  versionText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    fontWeight: '400',
  },
});

export default LoginScreen; 