import React, { useState } from 'react';
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
import { TextInput, Button } from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

// Placeholder actions, to be implemented in redux
import { login } from '../../redux/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // In a real app, this would verify credentials with an API
      await dispatch(login({ email, password }));
      // Navigation will be handled by AppNavigator based on auth state
    } catch (error) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
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
          <Text style={styles.title}>Nursing Home Management System</Text>
          <Text style={styles.subtitle}>Staff Mobile Application</Text>
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
            label="Password"
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
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotPasswordLink}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginButton}
            labelStyle={styles.loginButtonText}
            loading={loading}
            disabled={loading}
          >
            Log In
          </Button>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2024 Nursing Home Management System
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