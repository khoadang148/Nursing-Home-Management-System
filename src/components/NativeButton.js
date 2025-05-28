import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { COLORS, FONTS } from '../constants/theme';

const NativeButton = ({ 
  title, 
  onPress, 
  mode = 'contained', 
  disabled = false, 
  loading = false, 
  style,
  textStyle,
  icon,
  size = 'medium'
}) => {
  const buttonStyle = [
    styles.button,
    styles[mode],
    size === 'small' && styles.small,
    size === 'large' && styles.large,
    disabled && styles.disabled,
    style,
  ];

  const textStyles = [
    styles.text,
    styles[`${mode}Text`],
    size === 'small' && styles.smallText,
    disabled && styles.disabledText,
    textStyle,
  ];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={mode === 'contained' ? COLORS.surface : COLORS.primary} 
        />
      ) : (
        <>
          {icon && icon}
          <Text style={textStyles}>{title}</Text>
        </>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    minHeight: 48,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  contained: {
    backgroundColor: COLORS.primary,
  },
  outlined: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  text: {
    backgroundColor: 'transparent',
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    minHeight: 36,
  },
  large: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    minHeight: 56,
  },
  disabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6,
  },
  text: {
    ...FONTS.button,
    fontWeight: '600',
  },
  containedText: {
    color: COLORS.surface,
  },
  outlinedText: {
    color: COLORS.primary,
  },
  textText: {
    color: COLORS.primary,
  },
  smallText: {
    fontSize: 14,
  },
  disabledText: {
    color: COLORS.textSecondary,
  },
});

export default NativeButton; 