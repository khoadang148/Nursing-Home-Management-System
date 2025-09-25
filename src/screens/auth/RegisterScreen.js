import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Animated,
  Image,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector, useDispatch } from 'react-redux';
import { TextInput, Button } from 'react-native-paper';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '../../constants/theme';
import { register, resetAuthError, resetAuthMessage } from '../../redux/slices/authSlice';
import { useNotification } from '../../components/NotificationSystem';
import userService from '../../api/services/userService';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { error, message, isAuthenticated } = useSelector((state) => state.auth);
  const { showAlert } = useNotification();

  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cccdId, setCccdId] = useState('');
  const [cccdFront, setCccdFront] = useState(null);
  const [cccdBack, setCccdBack] = useState(null);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  // Validation state
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Email/Phone existence checking
  const [emailExists, setEmailExists] = useState(false);
  const [phoneExists, setPhoneExists] = useState(false);

  // Image preview states
  const [previewImage, setPreviewImage] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageQuality, setImageQuality] = useState({ front: null, back: null });

  // Animation values
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(0)).current;

  // Clear error and message when component mounts
  useEffect(() => {
    dispatch(resetAuthMessage());
    dispatch(resetAuthError());
    
    return () => {
      dispatch(resetAuthError());
    };
  }, [dispatch]);

  // Animation effects
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

  // Handle success messages
  useEffect(() => {
    if (message && !isAuthenticated && message.includes('Đăng ký tài khoản thành công')) {
      showAlert(
        'Đăng ký thành công',
        'Vui lòng chờ quản trị viên phê duyệt tài khoản và thông báo qua email. Nhấn OK để tiếp tục.',
        [
          {
            text: 'OK',
            style: 'primary',
            onPress: () => {
              dispatch(resetAuthMessage());
              navigation.navigate('DangNhap');
            },
          },
        ]
      );
    }
  }, [message, isAuthenticated, showAlert, dispatch, navigation]);

  // Check email existence with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (email && email.includes('@') && email.includes('.')) {
        try {
          const response = await userService.checkEmailExists(email);
          console.log('Email check response:', response);
          const exists = response.exists; // Backend returns { exists: boolean }
          setEmailExists(exists);
          if (exists) {
            setErrors(prev => ({ ...prev, email: 'Email này đã được sử dụng' }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.email;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error checking email:', error);
          // On error, assume email is available to avoid blocking user
          setEmailExists(false);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.email;
            return newErrors;
          });
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [email]);

  // Check phone existence with debounce
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (phone && phone.length >= 10) {
        try {
          const response = await userService.checkPhoneExists(phone);
          console.log('Phone check response:', response);
          const exists = response.exists; // Backend returns { exists: boolean }
          setPhoneExists(exists);
          if (exists) {
            setErrors(prev => ({ ...prev, phone: 'Số điện thoại này đã được sử dụng' }));
          } else {
            setErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors.phone;
              return newErrors;
            });
          }
        } catch (error) {
          console.error('Error checking phone:', error);
          // On error, assume phone is available to avoid blocking user
          setPhoneExists(false);
          setErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors.phone;
            return newErrors;
          });
        }
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [phone]);

  // Clear individual field errors when values change
  useEffect(() => {
    if (fullName) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.fullName;
        return newErrors;
      });
    }
  }, [fullName]);

  useEffect(() => {
    if (address) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.address;
        return newErrors;
      });
    }
  }, [address]);

  useEffect(() => {
    if (password) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.password;
        return newErrors;
      });
    }
  }, [password]);

  useEffect(() => {
    if (confirmPassword) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.confirmPassword;
        return newErrors;
      });
    }
  }, [confirmPassword]);

  useEffect(() => {
    if (cccdId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cccdId;
        return newErrors;
      });
    }
  }, [cccdId]);

  useEffect(() => {
    if (cccdFront) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cccdFront;
        return newErrors;
      });
    }
  }, [cccdFront]);

  useEffect(() => {
    if (cccdBack) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.cccdBack;
        return newErrors;
      });
    }
  }, [cccdBack]);

  // Function to check image quality - focus on readability; relax aspect ratio
  const checkImageQuality = (imageUri) => {
    return new Promise((resolve) => {
      Image.getSize(
        imageUri,
        (width, height) => {
          // More lenient quality checks focused on readability
          const resolution = width * height;
          const aspectRatio = width / height;
          
          let quality = 'good';
          let message = 'Ảnh rõ ràng, có thể đọc thông tin';
          
          // Minimum resolution very lenient; only flag extremely small
          if (resolution < 60000) { // e.g., < 300x200
            quality = 'poor';
            message = 'Ảnh quá mờ, không thể đọc thông tin CCCD';
          }
          
          // Do NOT penalize aspect ratio; users often capture at arbitrary ratios
          // Only keep a soft hint if ratio is extreme and not already poor
          if (quality === 'good' && (aspectRatio < 1.1 || aspectRatio > 2.2)) {
            quality = 'good';
            message = 'Ảnh rõ ràng. Nếu thông tin bị méo, vui lòng chụp chính diện hơn.';
          }
          
          resolve({ quality, message, width, height, resolution });
        },
        (error) => {
          console.error('Error getting image size:', error);
          resolve({ quality: 'good', message: 'Ảnh đã được tải thành công', width: 0, height: 0, resolution: 0 });
        }
      );
    });
  };

  const optimizeImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 1600 } }], // limit width, keep aspect ratio
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      return result.uri;
    } catch (e) {
      console.log('Image optimize failed, using original uri:', e?.message);
      return uri;
    }
  };

  const pickImage = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền truy cập ảnh để upload CCCD.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1.6, 1], // CCCD aspect ratio (1.6:1) - more accurate for rectangular cards
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const raw = result.assets[0];
        const optimizedUri = await optimizeImage(raw.uri);
        const imageAsset = { ...raw, uri: optimizedUri };
        
        // Check image quality
        const qualityResult = await checkImageQuality(imageAsset.uri);
        
        if (type === 'cccd_front') {
          setCccdFront(imageAsset);
          setImageQuality(prev => ({ ...prev, front: qualityResult }));
        } else if (type === 'cccd_back') {
          setCccdBack(imageAsset);
          setImageQuality(prev => ({ ...prev, back: qualityResult }));
        }
        
        // Show quality warning only for poor quality
        if (qualityResult.quality === 'poor') {
          Alert.alert(
            'Chất lượng ảnh kém',
            qualityResult.message,
            [
              { text: 'Chụp lại', onPress: () => showImagePicker(type) },
              { text: 'Tiếp tục', style: 'default' }
            ]
          );
        }
        // For fair quality, just show a subtle notification without blocking
        else if (qualityResult.quality === 'fair') {
          // Show a brief toast-like message instead of blocking alert
          setTimeout(() => {
            Alert.alert(
              'Lưu ý',
              qualityResult.message,
              [{ text: 'OK', style: 'default' }]
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh. Vui lòng thử lại.');
    }
  };

  const takePhoto = async (type) => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('Quyền truy cập', 'Bạn cần cấp quyền truy cập camera để chụp ảnh CCCD.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1.6, 1], // CCCD aspect ratio (1.6:1) - more accurate for rectangular cards
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const raw = result.assets[0];
        const optimizedUri = await optimizeImage(raw.uri);
        const imageAsset = { ...raw, uri: optimizedUri };
        
        // Check image quality
        const qualityResult = await checkImageQuality(imageAsset.uri);
        
        if (type === 'cccd_front') {
          setCccdFront(imageAsset);
          setImageQuality(prev => ({ ...prev, front: qualityResult }));
        } else if (type === 'cccd_back') {
          setCccdBack(imageAsset);
          setImageQuality(prev => ({ ...prev, back: qualityResult }));
        }
        
        // Show quality warning only for poor quality
        if (qualityResult.quality === 'poor') {
          Alert.alert(
            'Chất lượng ảnh kém',
            qualityResult.message,
            [
              { text: 'Chụp lại', onPress: () => showImagePicker(type) },
              { text: 'Tiếp tục', style: 'default' }
            ]
          );
        }
        // For fair quality, just show a subtle notification without blocking
        else if (qualityResult.quality === 'fair') {
          // Show a brief toast-like message instead of blocking alert
          setTimeout(() => {
            Alert.alert(
              'Lưu ý',
              qualityResult.message,
              [{ text: 'OK', style: 'default' }]
            );
          }, 500);
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Lỗi', 'Không thể chụp ảnh. Vui lòng thử lại.');
    }
  };

  const showImagePicker = (type) => {
    Alert.alert(
      'Chọn ảnh CCCD',
      'Bạn muốn chụp ảnh mới hay chọn từ thư viện?',
      [
        { text: 'Chụp ảnh', onPress: () => takePhoto(type) },
        { text: 'Chọn từ thư viện', onPress: () => pickImage(type) },
        { text: 'Hủy', style: 'cancel' }
      ]
    );
  };

  const validateForm = () => {
    const newErrors = {};

    // Full name validation
    if (!fullName.trim()) {
      newErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Họ và tên phải có ít nhất 2 ký tự';
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email không hợp lệ';
    } else if (emailExists) {
      newErrors.email = 'Email này đã được sử dụng';
    }

    // Phone validation
    if (!phone.trim()) {
      newErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10,11}$/.test(phone)) {
      newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
    } else if (phoneExists) {
      newErrors.phone = 'Số điện thoại này đã được sử dụng';
    }

    // Address validation
    if (!address.trim()) {
      newErrors.address = 'Vui lòng nhập địa chỉ';
    } else if (address.trim().length < 2) {
      newErrors.address = 'Địa chỉ phải có ít nhất 2 ký tự';
    } else if (address.trim().length > 200) {
      newErrors.address = 'Địa chỉ không được quá 200 ký tự';
    }

    // Password validation
    if (!password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    // CCCD ID validation
    if (!cccdId.trim()) {
      newErrors.cccdId = 'Vui lòng nhập số CCCD';
    } else if (!/^[0-9]{12}$/.test(cccdId)) {
      newErrors.cccdId = 'Số CCCD phải có đúng 12 chữ số';
    }

    // CCCD Front validation
    if (!cccdFront) {
      newErrors.cccdFront = 'Vui lòng upload ảnh CCCD mặt trước';
    }

    // CCCD Back validation
    if (!cccdBack) {
      newErrors.cccdBack = 'Vui lòng upload ảnh CCCD mặt sau';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      // Create FormData for multipart/form-data
      const formData = new FormData();
      
      // Debug: Log all form data
      console.log('Form data being sent:');
      console.log('Email:', email.trim());
      console.log('Full name:', fullName.trim());
      console.log('Phone:', phone.trim());
      console.log('Address:', address.trim());
      console.log('CCCD ID:', cccdId.trim());
      console.log('CCCD Front exists:', !!cccdFront);
      console.log('CCCD Back exists:', !!cccdBack);
      
      formData.append('email', email.trim());
      formData.append('password', password);
      formData.append('confirmPassword', confirmPassword);
      formData.append('full_name', fullName.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      formData.append('cccd_id', cccdId.trim());
      
      // Add username if not provided (backend will auto-generate)
      // Create a valid username from email (remove dots and special characters)
      if (email.trim()) {
        const emailPrefix = email.trim().split('@')[0];
        // Remove dots, underscores, and other special characters, keep only alphanumeric
        const validUsername = emailPrefix.replace(/[^a-zA-Z0-9]/g, '');
        console.log('Generated username:', validUsername);
        formData.append('username', validUsername);
      }

      // Append CCCD images with proper format
      if (cccdFront) {
        // Try different file object format
        const frontFile = {
          uri: cccdFront.uri,
          type: 'image/jpeg',
          name: 'cccd_front.jpg',
        };
        console.log('CCCD Front file:', frontFile);
        console.log('CCCD Front URI:', cccdFront.uri);
        console.log('CCCD Front type:', typeof frontFile);
        formData.append('cccd_front', frontFile, 'cccd_front.jpg');
      }

      if (cccdBack) {
        // Try different file object format
        const backFile = {
          uri: cccdBack.uri,
          type: 'image/jpeg',
          name: 'cccd_back.jpg',
        };
        console.log('CCCD Back file:', backFile);
        console.log('CCCD Back URI:', cccdBack.uri);
        console.log('CCCD Back type:', typeof backFile);
        formData.append('cccd_back', backFile, 'cccd_back.jpg');
      }

      // Debug: Log FormData contents
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`${key}:`, value);
      }

      console.log('FormData created, sending to backend...');
      const result = await dispatch(register(formData)).unwrap();
      
      if (result.success) {
        // Success message will be handled by useEffect
      }
    } catch (error) {
      console.error('Registration error:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      Alert.alert('Lỗi', 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmPasswordVisible(!confirmPasswordVisible);
  };

  const showImagePreview = (imageUri, type) => {
    setPreviewImage({ uri: imageUri, type });
    setShowImageModal(true);
  };

  const getQualityIcon = (quality) => {
    switch (quality) {
      case 'good':
        return <Ionicons name="checkmark-circle" size={20} color="#00A551" />;
      case 'fair':
        return <Ionicons name="warning" size={20} color="#FFA500" />;
      case 'poor':
        return <Ionicons name="close-circle" size={20} color="#FF4444" />;
      default:
        return null;
    }
  };

  const getQualityText = (quality) => {
    switch (quality) {
      case 'good':
        return 'Tốt';
      case 'fair':
        return 'Trung bình';
      case 'poor':
        return 'Kém';
      default:
        return '';
    }
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
        <MaterialCommunityIcons name="account-plus" size={40} color="#ff6b6b" />
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
        <MaterialCommunityIcons name="card-account-details" size={35} color="#4ecdc4" />
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
        <MaterialCommunityIcons name="shield-account" size={30} color="#45b7d1" />
      </Animated.View>

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#00A551" />
              </TouchableOpacity>
              
              <Animated.View
                style={[
                  styles.logoContainer,
                  {
                    transform: [{ scale: pulseAnim }]
                  }
                ]}
              >
                <MaterialCommunityIcons
                  name="account-plus"
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
                Đăng Ký Tài Khoản
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
                Tạo tài khoản để quản lý thông tin người thân
              </Animated.Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
              <View style={styles.formContainer}>
                {/* Full Name */}
                <TextInput
                  mode="outlined"
                  label="Họ và tên *"
                  value={fullName}
                  onChangeText={setFullName}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="account" color="#00A551" />}
                  error={!!errors.fullName}
                />
                {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}

                {/* Email */}
                <TextInput
                  mode="outlined"
                  label="Email *"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="email" color="#00A551" />}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={!!errors.email}
                />
                {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

                {/* Phone */}
                <TextInput
                  mode="outlined"
                  label="Số điện thoại *"
                  value={phone}
                  onChangeText={setPhone}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="phone" color="#00A551" />}
                  keyboardType="phone-pad"
                  error={!!errors.phone}
                />
                {errors.phone && <Text style={styles.errorText}>{errors.phone}</Text>}

                {/* Address */}
                <TextInput
                  mode="outlined"
                  label="Địa chỉ *"
                  value={address}
                  onChangeText={setAddress}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="map-marker" color="#00A551" />}
                  multiline
                  numberOfLines={2}
                  error={!!errors.address}
                />
                {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

                {/* CCCD ID */}
                <TextInput
                  mode="outlined"
                  label="Số CCCD (12 chữ số) *"
                  value={cccdId}
                  onChangeText={setCccdId}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="card-account-details" color="#00A551" />}
                  keyboardType="numeric"
                  maxLength={12}
                  error={!!errors.cccdId}
                />
                {errors.cccdId && <Text style={styles.errorText}>{errors.cccdId}</Text>}

                {/* CCCD Front Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Ảnh CCCD mặt trước *</Text>
                  
                  {cccdFront ? (
                    <View style={styles.imagePreviewContainer}>
                      <TouchableOpacity
                        style={styles.imagePreview}
                        onPress={() => showImagePreview(cccdFront.uri, 'front')}
                      >
                        <Image 
                          source={{ uri: cccdFront.uri }} 
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                          <Ionicons name="eye" size={24} color="white" />
                          <Text style={styles.previewText}>Xem ảnh</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.imageInfo}>
                        <View style={styles.qualityIndicator}>
                          {getQualityIcon(imageQuality.front?.quality)}
                          <Text style={styles.qualityText}>
                            Chất lượng: {getQualityText(imageQuality.front?.quality)}
                          </Text>
                        </View>
                        
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={() => showImagePicker('cccd_front')}
                        >
                          <Ionicons name="camera" size={16} color="#00A551" />
                          <Text style={styles.changeImageText}>Đổi ảnh</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => showImagePicker('cccd_front')}
                    >
                      <Ionicons name="camera" size={24} color="#00A551" />
                      <Text style={styles.uploadButtonText}>Chọn ảnh CCCD mặt trước</Text>
                    </TouchableOpacity>
                  )}
                  
                  {errors.cccdFront && <Text style={styles.errorText}>{errors.cccdFront}</Text>}
                </View>

                {/* CCCD Back Upload */}
                <View style={styles.uploadSection}>
                  <Text style={styles.uploadLabel}>Ảnh CCCD mặt sau *</Text>
                  
                  {cccdBack ? (
                    <View style={styles.imagePreviewContainer}>
                      <TouchableOpacity
                        style={styles.imagePreview}
                        onPress={() => showImagePreview(cccdBack.uri, 'back')}
                      >
                        <Image 
                          source={{ uri: cccdBack.uri }} 
                          style={styles.previewImage}
                          resizeMode="cover"
                        />
                        <View style={styles.imageOverlay}>
                          <Ionicons name="eye" size={24} color="white" />
                          <Text style={styles.previewText}>Xem ảnh</Text>
                        </View>
                      </TouchableOpacity>
                      
                      <View style={styles.imageInfo}>
                        <View style={styles.qualityIndicator}>
                          {getQualityIcon(imageQuality.back?.quality)}
                          <Text style={styles.qualityText}>
                            Chất lượng: {getQualityText(imageQuality.back?.quality)}
                          </Text>
                        </View>
                        
                        <TouchableOpacity
                          style={styles.changeImageButton}
                          onPress={() => showImagePicker('cccd_back')}
                        >
                          <Ionicons name="camera" size={16} color="#00A551" />
                          <Text style={styles.changeImageText}>Đổi ảnh</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={styles.uploadButton}
                      onPress={() => showImagePicker('cccd_back')}
                    >
                      <Ionicons name="camera" size={24} color="#00A551" />
                      <Text style={styles.uploadButtonText}>Chọn ảnh CCCD mặt sau</Text>
                    </TouchableOpacity>
                  )}
                  
                  {errors.cccdBack && <Text style={styles.errorText}>{errors.cccdBack}</Text>}
                </View>

                {/* Password */}
                <TextInput
                  mode="outlined"
                  label="Mật khẩu *"
                  value={password}
                  onChangeText={setPassword}
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
                  secureTextEntry={!passwordVisible}
                  error={!!errors.password}
                />
                {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

                {/* Confirm Password */}
                <TextInput
                  mode="outlined"
                  label="Xác nhận mật khẩu *"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={styles.input}
                  outlineColor="#00A551"
                  activeOutlineColor="#00A551"
                  left={<TextInput.Icon icon="lock-check" color="#00A551" />}
                  right={
                    <TextInput.Icon
                      icon={confirmPasswordVisible ? "eye-off" : "eye"}
                      color="#00A551"
                      onPress={toggleConfirmPasswordVisibility}
                    />
                  }
                  secureTextEntry={!confirmPasswordVisible}
                  error={!!errors.confirmPassword}
                />
                {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={submitting}
                  disabled={submitting}
                  style={styles.registerButton}
                  contentStyle={styles.registerButtonContent}
                  labelStyle={styles.registerButtonLabel}
                >
                  Đăng Ký
                </Button>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.divider} />
                  <Text style={styles.dividerText}>hoặc</Text>
                  <View style={styles.divider} />
                </View>

                {/* Login Link */}
                <Button
                  mode="text"
                  onPress={() => navigation.navigate('DangNhap')}
                  style={styles.loginButton}
                  contentStyle={styles.loginButtonContent}
                  labelStyle={styles.loginButtonLabel}
                  disabled={submitting}
                >
                  Đã có tài khoản? Đăng nhập ngay
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
                Thông tin CCCD được mã hóa và bảo mật theo tiêu chuẩn y tế quốc tế
              </Text>
            </Animated.View>

            {/* Version */}
            <Text style={styles.version}>Version: 1.0.0</Text>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Image Preview Modal */}
      <Modal
        visible={showImageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {previewImage?.type === 'front' ? 'CCCD Mặt Trước' : 'CCCD Mặt Sau'}
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowImageModal(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            {/* Instructions - moved to top to avoid overlap */}
            <View style={styles.modalInstructionsContainer}>
              <Text style={styles.modalInstructions}>
                Kiểm tra xem thông tin trên CCCD có rõ ràng và đầy đủ không
              </Text>
            </View>
            
            {/* Scrollable content for larger images */}
            <ScrollView 
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Image Container - clean, no overlapping text */}
              <View style={styles.modalImageContainer}>
                <Image
                  source={{ uri: previewImage?.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            </ScrollView>
            
            {/* Footer with action button */}
            <View style={styles.modalFooter}>
              <Button
                mode="contained"
                onPress={() => setShowImageModal(false)}
                style={styles.modalCloseButton}
                labelStyle={styles.modalCloseButtonLabel}
              >
                Đóng
              </Button>
            </View>
          </View>
        </View>
      </Modal>
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
    marginTop: 20,
    marginBottom: 30,
  },
  backButton: {
    position: 'absolute',
    top: 0,
    left: 0,
    padding: 8,
    zIndex: 1,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40,
    shadowColor: '#00A551',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00A551',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  appSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
    fontWeight: '500',
    paddingHorizontal: 20,
  },
  formSection: {
    marginTop: 20,
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
  errorText: {
    color: '#ff4444',
    fontSize: 12,
    marginTop: -12,
    marginBottom: 8,
    marginLeft: 12,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212529',
    marginBottom: 8,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#00A551',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  uploadButtonText: {
    color: '#00A551',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },
  imagePreviewContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 8, // Add some spacing
  },
  imagePreview: {
    position: 'relative',
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 12,
  },
  previewImage: {
    width: '100%',
    height: 120, // Increased height to show more of the CCCD image
    backgroundColor: '#f5f5f5',
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  imageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  qualityText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f8f0',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#00A551',
  },
  changeImageText: {
    fontSize: 12,
    color: '#00A551',
    fontWeight: '500',
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10, // Reduced padding to give more space to modal
  },
  modalContainer: {
    width: '95%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  modalInstructionsContainer: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalInstructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalScrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  modalImageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    minHeight: 500, // Ensure enough space for CCCD image
  },
  modalImage: {
    width: '100%',
    height: Math.min(500, height * 0.6), // Responsive height, max 500px or 60% of screen
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  modalFooter: {
    padding: 16,
    backgroundColor: '#f8f9fa',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  modalCloseButton: {
    backgroundColor: '#00A551',
    borderRadius: 8,
    paddingVertical: 4,
  },
  modalCloseButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  registerButton: {
    backgroundColor: '#00A551',
    borderRadius: 8,
    elevation: 2,
    marginTop: 8,
  },
  registerButtonContent: {
    height: 48,
  },
  registerButtonLabel: {
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
  loginButton: {
    marginTop: 0,
  },
  loginButtonContent: {
    height: 48,
  },
  loginButtonLabel: {
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

export default RegisterScreen;
