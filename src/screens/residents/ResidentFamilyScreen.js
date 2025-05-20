import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Appbar } from 'react-native-paper';
import { COLORS } from '../../constants/theme';

const ResidentFamilyScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Family Contacts" />
        <Appbar.Action icon="plus" onPress={() => console.log('Add family contact')} />
      </Appbar.Header>
      <View style={styles.content}>
        <Text>Family Contacts Screen (placeholder)</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  appbar: {
    backgroundColor: COLORS.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default ResidentFamilyScreen; 