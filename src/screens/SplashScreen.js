import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Animated } from 'react-native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../constants/theme';
import { useDispatch } from 'react-redux';
import { checkAuthState } from '../redux/slices/authSlice';

const SplashScreen = () => {
  const dispatch = useDispatch();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  
  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 5,
        useNativeDriver: true,
      }),
    ]).start();

    // Initialize authentication state after animation
    const timer = setTimeout(() => {
      dispatch(checkAuthState());
    }, 1500);

    return () => clearTimeout(timer);
  }, [dispatch, fadeAnim, scaleAnim]);

  return (
    <View style={styles.container}>
      <View style={styles.backgroundOverlay} />
      
      <Animated.View 
        style={[
          styles.content, 
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <Text style={styles.title}>Viện Dưỡng Lão</Text>
        <Text style={styles.subtitle}>Hệ Thống Quản Lý Chăm Sóc</Text>
        
        <View style={styles.loaderContainer}>
          <ActivityIndicator
            size="large"
            color={COLORS.surface}
            style={styles.loader}
          />
          <Text style={styles.loadingText}>Đang khởi tạo...</Text>
        </View>
      </Animated.View>

      <View style={styles.footer}>
        <Text style={styles.version}>Phiên bản 1.0.0</Text>
        <Text style={styles.copyright}>© 2025 Nursing Home Management System</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: `linear-gradient(135deg, ${COLORS.primary} 0%, ${COLORS.secondary} 100%)`,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SIZES.large,
  },
  logoContainer: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.xxlarge,
    ...SHADOWS.large,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    ...FONTS.h1,
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SIZES.small,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    ...FONTS.body1,
    color: COLORS.surface + 'DD',
    textAlign: 'center',
    marginBottom: SIZES.xxlarge * 2,
    fontWeight: '500',
    textShadowColor: 'rgba(0,0,0,0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  loaderContainer: {
    alignItems: 'center',
    marginTop: SIZES.large,
  },
  loader: {
    marginBottom: SIZES.medium,
  },
  loadingText: {
    ...FONTS.body2,
    color: COLORS.surface + 'CC',
    textAlign: 'center',
    fontWeight: '400',
  },
  footer: {
    position: 'absolute',
    bottom: SIZES.xxlarge,
    alignItems: 'center',
  },
  version: {
    ...FONTS.body3,
    color: COLORS.surface + 'AA',
    marginBottom: SIZES.small / 2,
    fontWeight: '500',
  },
  copyright: {
    ...FONTS.body3,
    color: COLORS.surface + '88',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default SplashScreen; 