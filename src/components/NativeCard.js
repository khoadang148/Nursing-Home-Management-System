import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { COLORS } from '../constants/theme';

const NativeCard = ({ children, style, elevation = 2 }) => {
  return (
    <View style={[styles.card, { elevation }, style]}>
      {children}
    </View>
  );
};

const NativeCardContent = ({ children, style }) => {
  return (
    <View style={[styles.content, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginVertical: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  content: {
    padding: 16,
  },
});

NativeCard.Content = NativeCardContent;

export default NativeCard; 