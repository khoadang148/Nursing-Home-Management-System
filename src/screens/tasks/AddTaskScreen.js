import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Appbar, TextInput, Button, HelperText, Divider, Text, Menu } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';

const PRIORITIES = ['High', 'Medium', 'Low'];
const CATEGORIES = ['Medication', 'Vitals', 'Therapy', 'Treatment', 'Hygiene', 'Nutrition', 'Other'];

// Mock residents data - in a real app, would come from an API or Redux store
const MOCK_RESIDENTS = [
  { id: '1', name: 'John Doe', roomNumber: '101' },
  { id: '2', name: 'Mary Smith', roomNumber: '102' },
  { id: '3', name: 'William Johnson', roomNumber: '103' },
  { id: '4', name: 'Patricia Brown', roomNumber: '104' },
  { id: '5', name: 'Robert Davis', roomNumber: '105' },
];

const AddTaskScreen = () => {
  const navigation = useNavigation();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dueTime, setDueTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [showPriorityMenu, setShowPriorityMenu] = useState(false);
  const [category, setCategory] = useState('Medication');
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [resident, setResident] = useState(null);
  const [showResidentsMenu, setShowResidentsMenu] = useState(false);
  const [assignedTo, setAssignedTo] = useState('');
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!resident) newErrors.resident = 'Resident is required';
    if (!assignedTo.trim()) newErrors.assignedTo = 'Assigned staff is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCreateTask = () => {
    if (!validate()) return;
    
    const combinedDueDate = new Date(dueDate);
    combinedDueDate.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
    
    const newTask = {
      id: Math.random().toString(36).substring(2, 11), // Generate a random ID
      title,
      description,
      dueDate: combinedDueDate.toISOString(),
      priority,
      status: 'Pending',
      category,
      residentId: resident?.id,
      residentName: resident?.name,
      roomNumber: resident?.roomNumber,
      assignedTo
    };
    
    // In a real app, send to API or add to Redux
    console.log('New task:', newTask);
    
    // Navigate back to task list
    Alert.alert(
      "Task Created",
      "The task has been created successfully!",
      [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('TaskList') 
        }
      ]
    );
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString();
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Task" />
        <Appbar.Action icon="check" onPress={handleCreateTask} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Basic Information</Text>
        
        <TextInput
          label="Task Title"
          value={title}
          onChangeText={setTitle}
          style={styles.input}
          error={!!errors.title}
          mode="outlined"
        />
        {!!errors.title && (
          <HelperText type="error" visible={!!errors.title}>
            {errors.title}
          </HelperText>
        )}
        
        <TextInput
          label="Description"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
          style={styles.input}
          error={!!errors.description}
          mode="outlined"
        />
        {!!errors.description && (
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>
        )}
        
        <TextInput
          label="Due Date"
          value={formatDate(dueDate)}
          onPressIn={() => setShowDatePicker(true)}
          right={<TextInput.Icon icon="calendar" />}
          mode="outlined"
          editable={false}
          style={styles.input}
        />
        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDueDate(selectedDate);
            }}
          />
        )}
        
        <TextInput
          label="Due Time"
          value={formatTime(dueTime)}
          onPressIn={() => setShowTimePicker(true)}
          right={<TextInput.Icon icon="clock-outline" />}
          mode="outlined"
          editable={false}
          style={styles.input}
        />
        {showTimePicker && (
          <DateTimePicker
            value={dueTime}
            mode="time"
            display="default"
            onChange={(event, selectedTime) => {
              setShowTimePicker(false);
              if (selectedTime) setDueTime(selectedTime);
            }}
          />
        )}
        
        <View style={styles.menuContainer}>
          <Text style={styles.inputLabel}>Priority</Text>
          <Menu
            visible={showPriorityMenu}
            onDismiss={() => setShowPriorityMenu(false)}
            anchor={
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setShowPriorityMenu(true)}
              >
                <Text style={[
                  styles.menuButtonText,
                  {
                    color: priority === 'High' 
                      ? COLORS.error 
                      : priority === 'Medium'
                      ? COLORS.warning
                      : COLORS.info
                  }
                ]}>
                  {priority}
                </Text>
              </TouchableOpacity>
            }
          >
            {PRIORITIES.map((item) => (
              <Menu.Item
                key={item}
                onPress={() => {
                  setPriority(item);
                  setShowPriorityMenu(false);
                }}
                title={item}
                titleStyle={{
                  color: item === 'High' 
                    ? COLORS.error 
                    : item === 'Medium'
                    ? COLORS.warning
                    : COLORS.info
                }}
              />
            ))}
          </Menu>
        </View>
        
        <View style={styles.menuContainer}>
          <Text style={styles.inputLabel}>Category</Text>
          <Menu
            visible={showCategoryMenu}
            onDismiss={() => setShowCategoryMenu(false)}
            anchor={
              <TouchableOpacity 
                style={styles.menuButton}
                onPress={() => setShowCategoryMenu(true)}
              >
                <Text style={styles.menuButtonText}>{category}</Text>
              </TouchableOpacity>
            }
          >
            {CATEGORIES.map((item) => (
              <Menu.Item
                key={item}
                onPress={() => {
                  setCategory(item);
                  setShowCategoryMenu(false);
                }}
                title={item}
              />
            ))}
          </Menu>
        </View>
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Resident</Text>
        <Menu
          visible={showResidentsMenu}
          onDismiss={() => setShowResidentsMenu(false)}
          anchor={
            <TouchableOpacity 
              style={[styles.residentSelector, !!errors.resident && styles.errorBorder]}
              onPress={() => setShowResidentsMenu(true)}
            >
              {resident ? (
                <View>
                  <Text style={styles.residentName}>{resident.name}</Text>
                  <Text style={styles.roomNumber}>Room {resident.roomNumber}</Text>
                </View>
              ) : (
                <Text style={styles.placeholderText}>Select a Resident</Text>
              )}
            </TouchableOpacity>
          }
        >
          {MOCK_RESIDENTS.map((item) => (
            <Menu.Item
              key={item.id}
              onPress={() => {
                setResident(item);
                setShowResidentsMenu(false);
              }}
              title={`${item.name} (Room ${item.roomNumber})`}
            />
          ))}
        </Menu>
        {!!errors.resident && (
          <HelperText type="error" visible={!!errors.resident}>
            {errors.resident}
          </HelperText>
        )}
        
        <Divider style={styles.divider} />
        
        <Text style={styles.sectionTitle}>Assignment</Text>
        <TextInput
          label="Assigned To"
          value={assignedTo}
          onChangeText={setAssignedTo}
          style={styles.input}
          error={!!errors.assignedTo}
          mode="outlined"
          right={<TextInput.Icon icon="account" />}
        />
        {!!errors.assignedTo && (
          <HelperText type="error" visible={!!errors.assignedTo}>
            {errors.assignedTo}
          </HelperText>
        )}
        
        <Button
          mode="contained"
          onPress={handleCreateTask}
          style={styles.createButton}
        >
          Create Task
        </Button>
      </ScrollView>
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
    elevation: 0,
  },
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 50,
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  menuContainer: {
    marginBottom: 12,
  },
  menuButton: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  menuButtonText: {
    ...FONTS.body2,
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
    height: 1,
    backgroundColor: COLORS.border,
  },
  residentSelector: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  errorBorder: {
    borderColor: COLORS.error,
  },
  residentName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  roomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
  },
  placeholderText: {
    ...FONTS.body2,
    color: COLORS.textSecondary,
  },
  createButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
  },
});

export default AddTaskScreen; 