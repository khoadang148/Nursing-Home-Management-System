import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { TextInput, Button, Card, HelperText } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useNotification } from '../../components/NotificationSystem';
import { validateEmail, validatePassword } from '../../utils/validation';
import { auditLog } from '../../utils/auditLogger';

// Placeholder actions, to be implemented in redux
import { login, resetAuthError, resetAuthMessage } from '../../redux/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockTimeRemaining, setBlockTimeRemaining] = useState(0);
  
  const dispatch = useDispatch();
  const { isLoading, error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { showSuccess, showError, showWarning, showLoading, hideLoading } = useNotification();

  // Clear error when component unmounts or when user starts typing
  useEffect(() => {
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  useEffect(() => {
    if (email || password) {
      dispatch(resetAuthError());
      setEmailError('');
      setPasswordError('');
    }
  }, [email, password, dispatch]);

  // Handle account blocking
  useEffect(() => {
    if (isBlocked && blockTimeRemaining > 0) {
      const timer = setInterval(() => {
        setBlockTimeRemaining(prev => {
          if (prev <= 1) {
            setIsBlocked(false);
            setLoginAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isBlocked, blockTimeRemaining]);

  // Handle loading state
  useEffect(() => {
    if (isLoading) {
      showLoading('Đang đăng nhập...');
    } else {
      hideLoading();
    }
  }, [isLoading, showLoading, hideLoading]);

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

  const handleLogin = async () => {
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

    // Dispatch login action - error handling is done in Redux
    dispatch(login({ email, password }));
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.logoContainer}>
          <Image
            source={require('../../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>Viện Dưỡng Lão</Text>
        </View>

        <View style={styles.formContainer}>
          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            mode="outlined"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="email" color={COLORS.primary} />}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TextInput
            label="Mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!passwordVisible}
            style={styles.input}
            mode="outlined"
            outlineColor={COLORS.border}
            activeOutlineColor={COLORS.primary}
            left={<TextInput.Icon icon="lock" color={COLORS.primary} />}
            right={
              <TextInput.Icon
                icon={passwordVisible ? "eye-off" : "eye"}
                color={COLORS.primary}
                onPress={() => setPasswordVisible(!passwordVisible)}
              />
            }
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
          >
            Đăng nhập
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 Hệ Thống Quản Lý Viện Dưỡng Lão
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: SIZES.padding,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 40,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.primary,
    textAlign: 'center',
  },
  subtitle: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: 5,
  },
  formContainer: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: 30,
  },

  input: {
    marginBottom: SIZES.padding,
    backgroundColor: COLORS.surface,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: SIZES.padding * 1.5,
  },
  forgotPasswordText: {
    ...FONTS.body3,
    color: COLORS.primary,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 3,
  },
  loginButtonText: {
    ...FONTS.h4,
    color: COLORS.surface,
  },
  footer: {
    marginBottom: 20,
  },
  footerText: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default LoginScreen; 