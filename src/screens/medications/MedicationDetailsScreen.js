import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MedicationDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicationId } = route.params || { medicationId: '1' };
  
  // Mock data - in a real app, fetch from API or database
  const medication = {
    id: medicationId,
    name: 'Paracetamol',
    dosage: '500mg',
    schedule: 'Morning, Evening',
    frequency: 'Twice daily',
    startDate: '01/01/2023',
    endDate: '01/01/2024',
    instructions: 'Take with food. Avoid alcohol consumption while using this medication.',
    sideEffects: 'May cause drowsiness, nausea, or allergic reactions.',
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Medication Details</Text>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => navigation.navigate('AddMedication', { medicationId })}
        >
          <Icon name="pencil" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <Text style={styles.medicationName}>{medication.name}</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Dosage:</Text>
            <Text style={styles.infoValue}>{medication.dosage}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Schedule:</Text>
            <Text style={styles.infoValue}>{medication.schedule}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Frequency:</Text>
            <Text style={styles.infoValue}>{medication.frequency}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Start Date:</Text>
            <Text style={styles.infoValue}>{medication.startDate}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>End Date:</Text>
            <Text style={styles.infoValue}>{medication.endDate}</Text>
          </View>
        </View>

        <View style={styles.instructionCard}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>{medication.instructions}</Text>
        </View>

        <View style={styles.sideEffectsCard}>
          <Text style={styles.sectionTitle}>Side Effects</Text>
          <Text style={styles.sideEffectsText}>{medication.sideEffects}</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.scheduleButton}
            onPress={() => navigation.navigate('MedicationSchedule', { medicationId })}
          >
            <Icon name="calendar" size={20} color="#fff" />
            <Text style={styles.buttonText}>View Schedule</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.adminButton}
            onPress={() => navigation.navigate('MedicationAdmin', { medicationId })}
          >
            <Icon name="pill" size={20} color="#fff" />
            <Text style={styles.buttonText}>Administer</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2c3e50',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  backButton: {
    padding: 5,
  },
  editButton: {
    padding: 5,
  },
  content: {
    padding: 15,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  medicationName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#2c3e50',
  },
  infoRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    width: '30%',
    fontWeight: 'bold',
    color: '#555',
  },
  infoValue: {
    width: '70%',
    color: '#333',
  },
  instructionCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2c3e50',
  },
  instructionText: {
    lineHeight: 22,
    color: '#333',
  },
  sideEffectsCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sideEffectsText: {
    lineHeight: 22,
    color: '#333',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  scheduleButton: {
    backgroundColor: '#3498db',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  adminButton: {
    backgroundColor: '#27ae60',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: 'bold',
  },
});

export default MedicationDetailsScreen; 