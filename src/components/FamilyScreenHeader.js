import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const FamilyScreenHeader = ({ title, navigation, backAction }) => {
  const handleBackPress = () => {
    if (backAction) {
      backAction();
    } else {
      navigation.goBack();
    }
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={handleBackPress}
      >
        <MaterialIcons name="arrow-back" size={24} color={COLORS.primary} />
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
});

export default FamilyScreenHeader; 