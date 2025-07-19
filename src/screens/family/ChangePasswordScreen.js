import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
} from 'react-native';
import { TextInput, Button, Card, Title, Paragraph } from 'react-native-paper';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SIZES } from '../../constants/theme';

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    // Validate inputs
    if (!currentPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu hiện tại');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Thành công',
        'Mật khẩu đã được thay đổi thành công',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thay đổi mật khẩu. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <View style={styles.customHeader}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
          <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Đổi Mật Khẩu</Text>
        <View style={styles.headerRight} />
          </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
            <Card.Content>
            <Title style={styles.cardTitle}>Thông Tin Bảo Mật</Title>
            <Paragraph style={styles.cardSubtitle}>
              Để đảm bảo tài khoản của bạn được bảo vệ tốt nhất, vui lòng sử dụng mật khẩu mạnh với ít nhất 6 ký tự.
              </Paragraph>
            </Card.Content>
          </Card>

        <View style={styles.formContainer}>
              {/* Current Password */}
              <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu hiện tại</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                style={styles.passwordInput}
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  secureTextEntry={!showCurrentPassword}
                placeholder="Nhập mật khẩu hiện tại"
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                      onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <MaterialIcons
                  name={showCurrentPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
              </View>

              {/* New Password */}
              <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                style={styles.passwordInput}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                placeholder="Nhập mật khẩu mới"
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <MaterialIcons
                  name={showNewPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={COLORS.textSecondary}
                        />
              </TouchableOpacity>
                  </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.passwordInputContainer}>
                <TextInput
                style={styles.passwordInput}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                mode="outlined"
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            </View>
              </View>

              {/* Password Requirements */}
          <Card style={styles.requirementsCard}>
            <Card.Content>
              <Title style={styles.requirementsTitle}>Yêu cầu mật khẩu:</Title>
              <View style={styles.requirementItem}>
                  <MaterialIcons 
                  name={newPassword.length >= 6 ? 'check-circle' : 'radio-button-unchecked'}
                    size={16} 
                    color={newPassword.length >= 6 ? COLORS.success : COLORS.textSecondary} 
                  />
                <Text style={styles.requirementText}>Ít nhất 6 ký tự</Text>
                </View>
              <View style={styles.requirementItem}>
                  <MaterialIcons 
                  name={newPassword !== currentPassword ? 'check-circle' : 'radio-button-unchecked'}
                    size={16} 
                  color={newPassword !== currentPassword ? COLORS.success : COLORS.textSecondary}
                  />
                <Text style={styles.requirementText}>Khác với mật khẩu hiện tại</Text>
                </View>
              <View style={styles.requirementItem}>
                  <MaterialIcons 
                  name={newPassword === confirmPassword && newPassword.length > 0 ? 'check-circle' : 'radio-button-unchecked'}
                    size={16} 
                  color={newPassword === confirmPassword && newPassword.length > 0 ? COLORS.success : COLORS.textSecondary}
                  />
                <Text style={styles.requirementText}>Xác nhận mật khẩu khớp</Text>
              </View>
            </Card.Content>
          </Card>

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={handleChangePassword}
                loading={loading}
                disabled={loading}
                style={styles.submitButton}
            labelStyle={styles.submitButtonText}
              >
            {loading ? 'Đang xử lý...' : 'Thay đổi mật khẩu'}
              </Button>
        </View>
        </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  customHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 5,
  },
  customHeaderTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  headerRight: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 20,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 8,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    backgroundColor: COLORS.surface,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
    zIndex: 1,
  },
  requirementsCard: {
    marginBottom: 30,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  requirementsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

export default ChangePasswordScreen; 