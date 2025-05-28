import { normalize, scale, LAYOUT } from './dimensions';

export const COLORS = {
  primary: '#4169E1', // Royal Blue - primary brand color
  secondary: '#6495ED', // Cornflower Blue - secondary color
  accent: '#20B2AA', // Light Sea Green - accent color for call-to-actions
  background: '#F5F7FF', // Light blue-tinted background
  surface: '#FFFFFF', // White surface
  text: '#333333', // Dark text
  textSecondary: '#757575', // Secondary text
  error: '#FF3B30', // Error state
  warning: '#FF9500', // Warning state
  success: '#34C759', // Success state
  info: '#5AC8FA', // Information state
  border: '#DDDDDD', // Border color
  disabled: '#E5E5E5', // Disabled state
  card: '#FFFFFF', // Card background
  statusBar: '#3457D5', // Darker blue for status bar
  shadow: '#000000', // Shadow color
};

export const SIZES = {
  // Global sizes (responsive)
  base: scale(8),
  small: scale(12),
  font: normalize(14),
  medium: scale(16),
  large: scale(18),
  xlarge: scale(24),
  xxlarge: scale(32),
  
  // Font sizes (responsive)
  h1: normalize(30),
  h2: normalize(24),
  h3: normalize(20),
  h4: normalize(18),
  h5: normalize(16),
  body1: normalize(16),
  body2: normalize(14),
  body3: normalize(12),
  
  // App dimensions
  width: '100%',
  height: '100%',
  
  // Spacing (responsive)
  padding: LAYOUT.padding.medium,
  margin: LAYOUT.margin.medium,
  radius: LAYOUT.borderRadius.medium,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', lineHeight: normalize(36) },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', lineHeight: normalize(30) },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold', lineHeight: normalize(26) },
  h4: { fontSize: SIZES.h4, fontWeight: '600', lineHeight: normalize(24) },
  h5: { fontSize: SIZES.h5, fontWeight: '600', lineHeight: normalize(22) },
  body1: { fontSize: SIZES.body1, lineHeight: normalize(22) },
  body2: { fontSize: SIZES.body2, lineHeight: normalize(20) },
  body3: { fontSize: SIZES.body3, lineHeight: normalize(18) },
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: scale(2) },
    shadowOpacity: 0.1,
    shadowRadius: scale(3),
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: scale(4) },
    shadowOpacity: 0.15,
    shadowRadius: scale(5),
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: scale(6) },
    shadowOpacity: 0.2,
    shadowRadius: scale(8),
    elevation: 8,
  },
};

const appTheme = { COLORS, SIZES, FONTS, SHADOWS };

export default appTheme; 