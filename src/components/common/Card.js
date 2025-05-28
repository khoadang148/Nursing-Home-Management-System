import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, SHADOWS } from '../../constants/theme';
import { scale } from '../../constants/dimensions';

const Card = ({
  children,
  style,
  onPress,
  padding = true,
  margin = false,
  shadow = true,
  borderRadius = true,
  backgroundColor = COLORS.surface,
  ...props
}) => {
  const cardStyle = [
    styles.card,
    {
      backgroundColor,
      padding: padding ? scale(16) : 0,
      margin: margin ? scale(8) : 0,
      borderRadius: borderRadius ? scale(8) : 0,
      ...(shadow ? SHADOWS.small : {}),
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        style={cardStyle}
        onPress={onPress}
        activeOpacity={0.7}
        {...props}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});

export default Card; 