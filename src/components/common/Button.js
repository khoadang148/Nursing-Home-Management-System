import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { COLORS, FONTS, SHADOWS } from '../../constants/theme';
import { scale, normalize } from '../../constants/dimensions';

const Button = ({
  title,
  onPress,
  style,
  textStyle,
  disabled = false,
  loading = false,
  variant = 'primary', // primary, secondary, outline, text
  size = 'medium', // small, medium, large
  fullWidth = false,
  icon,
  iconPosition = 'left', // left, right
  ...props
}) => {
  const getButtonStyle = () => {
    const baseStyle = [styles.button];
    
    // Size variants
    switch (size) {
      case 'small':
        baseStyle.push(styles.buttonSmall);
        break;
      case 'large':
        baseStyle.push(styles.buttonLarge);
        break;
      default:
        baseStyle.push(styles.buttonMedium);
    }
    
    // Color variants
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.buttonSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.buttonOutline);
        break;
      case 'text':
        baseStyle.push(styles.buttonText);
        break;
      default:
        baseStyle.push(styles.buttonPrimary);
    }
    
    // Full width
    if (fullWidth) {
      baseStyle.push(styles.buttonFullWidth);
    }
    
    // Disabled state
    if (disabled) {
      baseStyle.push(styles.buttonDisabled);
    }
    
    return baseStyle;
  };
  
  const getTextStyle = () => {
    const baseStyle = [styles.text];
    
    // Size variants
    switch (size) {
      case 'small':
        baseStyle.push(styles.textSmall);
        break;
      case 'large':
        baseStyle.push(styles.textLarge);
        break;
      default:
        baseStyle.push(styles.textMedium);
    }
    
    // Color variants
    switch (variant) {
      case 'secondary':
        baseStyle.push(styles.textSecondary);
        break;
      case 'outline':
        baseStyle.push(styles.textOutline);
        break;
      case 'text':
        baseStyle.push(styles.textOnly);
        break;
      default:
        baseStyle.push(styles.textPrimary);
    }
    
    // Disabled state
    if (disabled) {
      baseStyle.push(styles.textDisabled);
    }
    
    return baseStyle;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? COLORS.surface : COLORS.primary} 
        />
      );
    }

    const textElement = <Text style={[getTextStyle(), textStyle]}>{title}</Text>;
    
    if (!icon) {
      return textElement;
    }

    return (
      <View style={styles.contentWithIcon}>
        {iconPosition === 'left' && (
          <View style={styles.iconLeft}>{icon}</View>
        )}
        {textElement}
        {iconPosition === 'right' && (
          <View style={styles.iconRight}>{icon}</View>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  
  // Size variants
  buttonSmall: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(16),
    minHeight: scale(36),
  },
  buttonMedium: {
    paddingVertical: scale(12),
    paddingHorizontal: scale(20),
    minHeight: scale(44),
  },
  buttonLarge: {
    paddingVertical: scale(16),
    paddingHorizontal: scale(24),
    minHeight: scale(52),
  },
  
  // Color variants
  buttonPrimary: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.small,
  },
  buttonSecondary: {
    backgroundColor: COLORS.secondary,
    ...SHADOWS.small,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  
  // States
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonFullWidth: {
    width: '100%',
  },
  
  // Text styles
  text: {
    fontWeight: '600',
  },
  textSmall: {
    fontSize: normalize(14),
  },
  textMedium: {
    fontSize: normalize(16),
  },
  textLarge: {
    fontSize: normalize(18),
  },
  
  // Text color variants
  textPrimary: {
    color: COLORS.surface,
  },
  textSecondary: {
    color: COLORS.surface,
  },
  textOutline: {
    color: COLORS.primary,
  },
  textOnly: {
    color: COLORS.primary,
  },
  textDisabled: {
    color: COLORS.textSecondary,
  },
  
  // Icon styles
  contentWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconLeft: {
    marginRight: scale(8),
  },
  iconRight: {
    marginLeft: scale(8),
  },
});

export default Button; 