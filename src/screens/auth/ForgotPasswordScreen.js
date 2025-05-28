import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useNotification } from '../../components/NotificationSystem';

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const { showWarning, showLoading, hideLoading, showSuccess } = useNotification();

  const handleSubmit = async () => {
    if (!email) {
      showWarning('Vui lòng nhập địa chỉ email của bạn');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showWarning('Vui lòng nhập địa chỉ email hợp lệ');
      return;
    }

    setLoading(true);
    showLoading('Đang gửi email đặt lại mật khẩu...');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      hideLoading();
      setSubmitted(true);
      showSuccess('Đã gửi email đặt lại mật khẩu thành công! Vui lòng kiểm tra hộp thư của bạn.');
      // In a real app, would call an API endpoint here
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
        </TouchableOpacity>

        <View style={styles.contentContainer}>
          <Text style={styles.title}>Đặt Lại Mật Khẩu</Text>
          
          {!submitted ? (
            <>
              <Text style={styles.instructions}>
                Nhập địa chỉ email của bạn và chúng tôi sẽ gửi hướng dẫn để đặt lại mật khẩu.
              </Text>
              
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

                <Button
                  mode="contained"
                  onPress={handleSubmit}
                  style={styles.submitButton}
                  labelStyle={styles.submitButtonText}
                  loading={loading}
                  disabled={loading}
                >
                  Gửi Hướng Dẫn Đặt Lại
                </Button>
              </View>
            </>
          ) : (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle"
                size={80}
                color={COLORS.success}
              />
              <Text style={styles.successTitle}>Đã Gửi Email!</Text>
              <Text style={styles.successText}>
                Vui lòng kiểm tra hộp thư của bạn để nhận hướng dẫn đặt lại mật khẩu.
              </Text>
              <Button
                mode="contained"
                onPress={() => navigation.navigate('DangNhap')}
                style={[styles.submitButton, { marginTop: 20 }]}
                labelStyle={styles.submitButtonText}
              >
                Trở Về Trang Đăng Nhập
              </Button>
            </View>
          )}
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
    padding: SIZES.padding,
  },
  backButton: {
    marginTop: 40,
    marginBottom: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: SIZES.padding,
  },
  title: {
    ...FONTS.h2,
    color: COLORS.text,
    marginBottom: 16,
  },
  instructions: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 30,
  },
  formContainer: {
    ...SHADOWS.medium,
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radius,
    padding: SIZES.padding * 1.5,
    marginBottom: 30,
  },
  input: {
    marginBottom: SIZES.padding * 1.5,
    backgroundColor: COLORS.surface,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.radius,
    padding: 3,
  },
  submitButtonText: {
    ...FONTS.h4,
    color: COLORS.surface,
  },
  successContainer: {
    alignItems: 'center',
    padding: SIZES.padding * 2,
  },
  successTitle: {
    ...FONTS.h2,
    color: COLORS.success,
    marginVertical: 16,
  },
  successText: {
    ...FONTS.body1,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 30,
  },
});

export default ForgotPasswordScreen; 