import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    // Validate current password
    if (!currentPassword.trim()) {
      newErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    // Validate new password
    if (!newPassword.trim()) {
      newErrors.newPassword = 'Vui lòng nhập mật khẩu mới';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    // Validate confirm password
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // Check if new password is same as current
    if (currentPassword === newPassword) {
      newErrors.newPassword = 'Mật khẩu mới phải khác với mật khẩu hiện tại';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChangePassword = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success - in real app, call actual API
      Alert.alert(
        'Thành Công',
        'Đổi mật khẩu thành công! Vui lòng đăng nhập lại với mật khẩu mới.',
        [
          {
            text: 'OK',
            onPress: () => {
              // In real app, logout user and redirect to login
              navigation.goBack();
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert(
        'Lỗi',
        'Đã có lỗi xảy ra khi đổi mật khẩu. Vui lòng thử lại.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: '', color: COLORS.textSecondary };
    
    let strength = 0;
    const checks = [
      password.length >= 6,
      /[a-z]/.test(password),
      /[A-Z]/.test(password),
      /\d/.test(password),
      /[!@#$%^&*(),.?":{}|<>]/.test(password),
      password.length >= 10
    ];
    
    strength = checks.filter(Boolean).length;
    
    if (strength <= 2) {
      return { strength, text: 'Yếu', color: COLORS.error };
    } else if (strength <= 4) {
      return { strength, text: 'Trung bình', color: COLORS.warning };
    } else {
      return { strength, text: 'Mạnh', color: COLORS.success };
    }
  };

  const passwordStrength = getPasswordStrength(newPassword);

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <Title style={styles.headerTitle}>Đổi Mật Khẩu</Title>
          </View>

          {/* Security Info Card */}
          <Card style={styles.infoCard} mode="outlined">
            <Card.Content>
              <View style={styles.infoHeader}>
                <MaterialIcons name="security" size={24} color={COLORS.primary} />
                <Title style={styles.infoTitle}>Bảo Mật Tài Khoản</Title>
              </View>
              <Paragraph style={styles.infoText}>
                Để đảm bảo an toàn cho tài khoản của bạn, vui lòng tạo mật khẩu mạnh 
                với ít nhất 6 ký tự, bao gồm chữ hoa, chữ thường và số.
              </Paragraph>
            </Card.Content>
          </Card>

          {/* Change Password Form */}
          <Card style={styles.formCard} mode="elevated">
            <Card.Content>

              {/* Current Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Mật khẩu hiện tại"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                  error={!!errors.currentPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showCurrentPassword ? "eye-off" : "eye"}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    />
                  }
                />
                {errors.currentPassword && (
                  <Text style={styles.errorText}>{errors.currentPassword}</Text>
                )}
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Mật khẩu mới"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  error={!!errors.newPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showNewPassword ? "eye-off" : "eye"}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    />
                  }
                />
                
                {/* Password Strength Indicator */}
                {newPassword.length > 0 && (
                  <View style={styles.strengthContainer}>
                    <View style={styles.strengthBar}>
                      {[...Array(6)].map((_, index) => (
                        <View
                          key={index}
                          style={[
                            styles.strengthSegment,
                            {
                              backgroundColor: index < passwordStrength.strength 
                                ? passwordStrength.color 
                                : '#e0e0e0'
                            }
                          ]}
                        />
                      ))}
                    </View>
                    <Text style={[styles.strengthText, { color: passwordStrength.color }]}>
                      Độ mạnh: {passwordStrength.text}
                    </Text>
                  </View>
                )}
                
                {errors.newPassword && (
                  <Text style={styles.errorText}>{errors.newPassword}</Text>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
                <TextInput
                  mode="outlined"
                  label="Xác nhận mật khẩu mới"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  error={!!errors.confirmPassword}
                  style={styles.input}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? "eye-off" : "eye"}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                />
                {errors.confirmPassword && (
                  <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.requirementsContainer}>
                <Text style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Text>
                <View style={styles.requirement}>
                  <MaterialIcons 
                    name={newPassword.length >= 6 ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={newPassword.length >= 6 ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: newPassword.length >= 6 ? COLORS.success : COLORS.textSecondary }
                  ]}>
                    Ít nhất 6 ký tự
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <MaterialIcons 
                    name={/[A-Z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={/[A-Z]/.test(newPassword) ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: /[A-Z]/.test(newPassword) ? COLORS.success : COLORS.textSecondary }
                  ]}>
                    Có ít nhất 1 chữ hoa
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <MaterialIcons 
                    name={/[a-z]/.test(newPassword) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={/[a-z]/.test(newPassword) ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: /[a-z]/.test(newPassword) ? COLORS.success : COLORS.textSecondary }
                  ]}>
                    Có ít nhất 1 chữ thường
                  </Text>
                </View>
                <View style={styles.requirement}>
                  <MaterialIcons 
                    name={/\d/.test(newPassword) ? "check-circle" : "radio-button-unchecked"} 
                    size={16} 
                    color={/\d/.test(newPassword) ? COLORS.success : COLORS.textSecondary} 
                  />
                  <Text style={[
                    styles.requirementText,
                    { color: /\d/.test(newPassword) ? COLORS.success : COLORS.textSecondary }
                  ]}>
                    Có ít nhất 1 số
                  </Text>
                </View>
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
                contentStyle={styles.submitButtonContent}
              >
                {loading ? 'Đang xử lý...' : 'Đổi Mật Khẩu'}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  infoCard: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: COLORS.textPrimary,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: COLORS.textSecondary,
  },
  formCard: {
    backgroundColor: 'white',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: COLORS.textPrimary,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  strengthContainer: {
    marginTop: 8,
  },
  strengthBar: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  strengthSegment: {
    flex: 1,
    height: 4,
    marginRight: 2,
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '500',
  },
  requirementsContainer: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  requirementText: {
    fontSize: 12,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
  },
  submitButtonContent: {
    paddingVertical: 8,
  },
});

export default ChangePasswordScreen; 