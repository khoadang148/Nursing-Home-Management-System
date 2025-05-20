import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const AddMedicationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { medicationId } = route.params || {};
  const isEditing = !!medicationId;

  // State for form fields
  const [name, setName] = useState(isEditing ? 'Paracetamol' : '');
  const [dosage, setDosage] = useState(isEditing ? '500mg' : '');
  const [schedule, setSchedule] = useState(isEditing ? 'Morning, Evening' : '');
  const [frequency, setFrequency] = useState(isEditing ? 'Twice daily' : '');
  const [startDate, setStartDate] = useState(isEditing ? '01/01/2023' : '');
  const [endDate, setEndDate] = useState(isEditing ? '01/01/2024' : '');
  const [instructions, setInstructions] = useState(
    isEditing ? 'Take with food. Avoid alcohol consumption while using this medication.' : ''
  );
  const [sideEffects, setSideEffects] = useState(
    isEditing ? 'May cause drowsiness, nausea, or allergic reactions.' : ''
  );
  const [isRequired, setIsRequired] = useState(true);
  const [hasReminder, setHasReminder] = useState(true);

  const handleSave = () => {
    // Here would be logic to save the medication to a database or state
    // For now, we just navigate back
    navigation.navigate('MedicationList');
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
        <Text style={styles.headerTitle}>
          {isEditing ? 'Edit Medication' : 'Add Medication'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView style={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medication Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Enter medication name"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Dosage</Text>
          <TextInput
            style={styles.input}
            value={dosage}
            onChangeText={setDosage}
            placeholder="Enter dosage (e.g., 500mg)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Schedule</Text>
          <TextInput
            style={styles.input}
            value={schedule}
            onChangeText={setSchedule}
            placeholder="When to take (e.g., Morning, Evening)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Frequency</Text>
          <TextInput
            style={styles.input}
            value={frequency}
            onChangeText={setFrequency}
            placeholder="How often (e.g., Once daily)"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Start Date</Text>
          <TextInput
            style={styles.input}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>End Date</Text>
          <TextInput
            style={styles.input}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="DD/MM/YYYY"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Instructions</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={instructions}
            onChangeText={setInstructions}
            placeholder="Special instructions for taking this medication"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Side Effects</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={sideEffects}
            onChangeText={setSideEffects}
            placeholder="Possible side effects"
            multiline={true}
            numberOfLines={4}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Required Medication</Text>
          <Switch
            value={isRequired}
            onValueChange={setIsRequired}
            trackColor={{ false: '#d9d9d9', true: '#3498db' }}
            thumbColor={isRequired ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Set Reminders</Text>
          <Switch
            value={hasReminder}
            onValueChange={setHasReminder}
            trackColor={{ false: '#d9d9d9', true: '#3498db' }}
            thumbColor={hasReminder ? '#fff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save Medication</Text>
        </TouchableOpacity>
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
  formContainer: {
    padding: 15,
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  switchLabel: {
    fontSize: 16,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#27ae60',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddMedicationScreen; 