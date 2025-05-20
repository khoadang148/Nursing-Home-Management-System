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
  // Global sizes
  base: 8,
  small: 12,
  font: 14,
  medium: 16,
  large: 18,
  xlarge: 24,
  xxlarge: 32,
  
  // Font sizes
  h1: 30,
  h2: 24,
  h3: 20,
  h4: 18,
  h5: 16,
  body1: 16,
  body2: 14,
  body3: 12,
  
  // App dimensions
  width: '100%',
  height: '100%',
  
  // Spacing
  padding: 16,
  margin: 16,
  radius: 8,
};

export const FONTS = {
  h1: { fontSize: SIZES.h1, fontWeight: 'bold', lineHeight: 36 },
  h2: { fontSize: SIZES.h2, fontWeight: 'bold', lineHeight: 30 },
  h3: { fontSize: SIZES.h3, fontWeight: 'bold', lineHeight: 26 },
  h4: { fontSize: SIZES.h4, fontWeight: '600', lineHeight: 24 },
  h5: { fontSize: SIZES.h5, fontWeight: '600', lineHeight: 22 },
  body1: { fontSize: SIZES.body1, lineHeight: 22 },
  body2: { fontSize: SIZES.body2, lineHeight: 20 },
  body3: { fontSize: SIZES.body3, lineHeight: 18 },
};

export const SHADOWS = {
  small: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  medium: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  large: {
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

const appTheme = { COLORS, SIZES, FONTS, SHADOWS };

export default appTheme; 