import { Dimensions, Platform, StatusBar } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Thiết kế chuẩn (iPhone 6/7/8)
const guidelineBaseWidth = 375;
const guidelineBaseHeight = 667;

// Hàm tính tỷ lệ cho responsive design
const scale = (size) => (screenWidth / guidelineBaseWidth) * size;
const verticalScale = (size) => (screenHeight / guidelineBaseHeight) * size;
const moderateScale = (size, factor = 0.5) => size + (scale(size) - size) * factor;

// Kích thước màn hình
export const SCREEN_WIDTH = screenWidth;
export const SCREEN_HEIGHT = screenHeight;

// Kiểm tra loại thiết bị
export const isTablet = screenWidth >= 768;
export const isSmallDevice = screenWidth < 375;
export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';

// Status bar height
export const STATUS_BAR_HEIGHT = isIOS ? 44 : StatusBar.currentHeight || 24;

// Safe area insets (có thể được ghi đè bởi useSafeAreaInsets)
export const SAFE_AREA_PADDING = {
  top: isIOS ? 44 : StatusBar.currentHeight || 24,
  bottom: isIOS ? 34 : 0,
};

// Header heights
export const HEADER_HEIGHT = isIOS ? 88 : 64;
export const TAB_BAR_HEIGHT = isIOS ? 84 : 60;

// Responsive dimensions
export const wp = (percentage) => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

export const hp = (percentage) => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

// Responsive font scaling
export const normalize = (size) => {
  if (isTablet) {
    return moderateScale(size, 0.3);
  }
  return moderateScale(size);
};

// Layout constants
export const LAYOUT = {
  window: {
    width: screenWidth,
    height: screenHeight,
  },
  isSmallDevice,
  isTablet,
  padding: {
    small: scale(8),
    medium: scale(16),
    large: scale(24),
    xlarge: scale(32),
  },
  margin: {
    small: scale(8),
    medium: scale(16),
    large: scale(24),
    xlarge: scale(32),
  },
  borderRadius: {
    small: scale(4),
    medium: scale(8),
    large: scale(12),
    xlarge: scale(16),
  },
};

export {
  scale,
  verticalScale,
  moderateScale,
}; 