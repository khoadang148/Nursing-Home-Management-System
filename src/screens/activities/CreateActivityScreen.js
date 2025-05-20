import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Button, 
  HelperText, 
  Divider, 
  Text,
  SegmentedButtons,
  Chip,
  Switch,
  List,
  IconButton,
  Menu
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation } from '@react-navigation/native';
import { COLORS, FONTS, SIZES, SHADOWS } from '../../constants/theme';
import { useDispatch } from 'react-redux';
import { createActivity } from '../../redux/slices/activitySlice';

const ACTIVITY_TYPES = [
  { value: 'physical', label: 'Physical', icon: 'dumbbell' },
  { value: 'social', label: 'Social', icon: 'account-group' },
  { value: 'cognitive', label: 'Cognitive', icon: 'brain' },
  { value: 'creative', label: 'Creative', icon: 'palette' },
  { value: 'spiritual', label: 'Spiritual', icon: 'hand-peace' },
];

const LOCATIONS = [
  'Activity Room',
  'Common Area',
  'Dining Hall',
  'Garden',
  'Therapy Room',
  'Library',
  'Outdoor Patio',
  'Private Room',
];

const CreateActivityScreen = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [activityType, setActivityType] = useState('physical');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [duration, setDuration] = useState('45');
  const [location, setLocation] = useState('Activity Room');
  const [showLocationMenu, setShowLocationMenu] = useState(false);
  const [participants, setParticipants] = useState('10');
  const [facilitator, setFacilitator] = useState('');
  const [materials, setMaterials] = useState([]);
  const [newMaterial, setNewMaterial] = useState('');
  const [newMaterialQuantity, setNewMaterialQuantity] = useState('1');
  const [isRecurring, setIsRecurring] = useState(false);
  const [errors, setErrors] = useState({});
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = 'Activity name is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!location.trim()) newErrors.location = 'Location is required';
    if (isNaN(parseInt(duration)) || parseInt(duration) <= 0) {
      newErrors.duration = 'Enter a valid duration';
    }
    if (isNaN(parseInt(participants)) || parseInt(participants) <= 0) {
      newErrors.participants = 'Enter a valid number of participants';
    }
    if (!facilitator.trim()) newErrors.facilitator = 'Facilitator is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddMaterial = () => {
    if (newMaterial.trim()) {
      setMaterials([
        ...materials,
        { 
          id: Date.now().toString(),
          name: newMaterial,
          quantity: isNaN(parseInt(newMaterialQuantity)) ? 1 : parseInt(newMaterialQuantity)
        }
      ]);
      setNewMaterial('');
      setNewMaterialQuantity('1');
    }
  };
  
  const handleRemoveMaterial = (id) => {
    setMaterials(materials.filter(item => item.id !== id));
  };
  
  const handleSubmit = () => {
    if (!validate()) return;
    
    const scheduledTime = new Date(date);
    scheduledTime.setHours(time.getHours(), time.getMinutes(), 0, 0);
    
    const activityData = {
      name,
      description,
      type: activityType,
      scheduledTime: scheduledTime.toISOString(),
      durationMinutes: parseInt(duration),
      location,
      participants: parseInt(participants),
      facilitator,
      materials,
      isRecurring,
    };
    
    dispatch(createActivity(activityData))
      .unwrap()
      .then(() => {
        navigation.goBack();
      })
      .catch(error => {
        console.error('Error creating activity:', error);
      });
  };
  
  const formatDate = (date) => {
    return date.toLocaleDateString(undefined, {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  const formatTime = (time) => {
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <View style={styles.container}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <Appbar.Header style={{ backgroundColor: COLORS.primary }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Create Activity" titleStyle={FONTS.h2} />
        <Appbar.Action icon="check" onPress={handleSubmit} />
      </Appbar.Header>
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.sectionTitle}>Activity Information</Text>
        
        <TextInput
          label="Activity Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
          error={!!errors.name}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.name}>
          {errors.name}
        </HelperText>
        
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
        <HelperText type="error" visible={!!errors.description}>
          {errors.description}
        </HelperText>
        
        <Text style={styles.inputLabel}>Activity Type</Text>
        <SegmentedButtons
          value={activityType}
          onValueChange={setActivityType}
          buttons={ACTIVITY_TYPES}
          style={styles.segmentedButtons}
        />
        
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Schedule</Text>
        
        <View>
          <TextInput
            label="Date"
            value={formatDate(date)}
            onPressIn={() => setShowDatePicker(true)}
            right={<TextInput.Icon icon="calendar" />}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
          
          <TextInput
            label="Time"
            value={formatTime(time)}
            onPressIn={() => setShowTimePicker(true)}
            right={<TextInput.Icon icon="clock-outline" />}
            mode="outlined"
            editable={false}
            style={styles.input}
          />
          {showTimePicker && (
            <DateTimePicker
              value={time}
              mode="time"
              display="default"
              onChange={(event, selectedTime) => {
                setShowTimePicker(false);
                if (selectedTime) setTime(selectedTime);
              }}
            />
          )}
          
          <TextInput
            label="Duration (minutes)"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            style={styles.input}
            error={!!errors.duration}
            mode="outlined"
          />
          <HelperText type="error" visible={!!errors.duration}>
            {errors.duration}
          </HelperText>
          
          <TextInput
            label="Location"
            value={location}
            onPressIn={() => setShowLocationMenu(true)}
            right={
              <TextInput.Icon
                icon="menu-down"
                onPress={() => setShowLocationMenu(true)}
              />
            }
            mode="outlined"
            editable={false}
            style={styles.input}
            error={!!errors.location}
          />
          <HelperText type="error" visible={!!errors.location}>
            {errors.location}
          </HelperText>
          
          <Menu
            visible={showLocationMenu}
            onDismiss={() => setShowLocationMenu(false)}
            anchor={{ x: 0, y: 0 }}
            style={styles.menu}
          >
            {LOCATIONS.map((loc) => (
              <Menu.Item
                key={loc}
                title={loc}
                onPress={() => {
                  setLocation(loc);
                  setShowLocationMenu(false);
                }}
              />
            ))}
          </Menu>
        </View>
        
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Attendance</Text>
        
        <TextInput
          label="Maximum Participants"
          value={participants}
          onChangeText={setParticipants}
          keyboardType="numeric"
          style={styles.input}
          error={!!errors.participants}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.participants}>
          {errors.participants}
        </HelperText>
        
        <TextInput
          label="Facilitator"
          value={facilitator}
          onChangeText={setFacilitator}
          style={styles.input}
          error={!!errors.facilitator}
          mode="outlined"
        />
        <HelperText type="error" visible={!!errors.facilitator}>
          {errors.facilitator}
        </HelperText>
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Recurring Activity</Text>
          <Switch value={isRecurring} onValueChange={setIsRecurring} />
        </View>
        
        <Divider style={styles.divider} />
        <Text style={styles.sectionTitle}>Materials Needed</Text>
        
        <View style={styles.materialsContainer}>
          {materials.map((material) => (
            <Chip
              key={material.id}
              onClose={() => handleRemoveMaterial(material.id)}
              style={styles.materialChip}
              icon="package-variant"
            >
              {material.name} (x{material.quantity})
            </Chip>
          ))}
        </View>
        
        <View style={styles.addMaterialContainer}>
          <TextInput
            label="Material Name"
            value={newMaterial}
            onChangeText={setNewMaterial}
            style={[styles.input, { flex: 2 }]}
            mode="outlined"
          />
          <TextInput
            label="Qty"
            value={newMaterialQuantity}
            onChangeText={setNewMaterialQuantity}
            keyboardType="numeric"
            style={[styles.input, { flex: 1, marginLeft: 8 }]}
            mode="outlined"
          />
          <IconButton
            icon="plus-circle"
            size={30}
            onPress={handleAddMaterial}
            style={{ alignSelf: 'center' }}
          />
        </View>
        
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={styles.submitButton}
        >
          Create Activity
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
  scrollContent: {
    padding: SIZES.padding,
    paddingBottom: 50,
  },
  sectionTitle: {
    ...FONTS.h3,
    marginBottom: 12,
    marginTop: 8,
    color: COLORS.text,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 4,
  },
  inputLabel: {
    ...FONTS.body2,
    color: COLORS.text,
    marginBottom: 8,
    marginTop: 8,
  },
  segmentedButtons: {
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SIZES.padding,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 16,
  },
  switchLabel: {
    ...FONTS.body2,
    color: COLORS.text,
  },
  materialsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  materialChip: {
    margin: 4,
    backgroundColor: COLORS.background,
  },
  addMaterialContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  submitButton: {
    marginTop: 24,
    marginBottom: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
  },
  menu: {
    width: '90%',
    maxHeight: 300,
  },
});

export default CreateActivityScreen; 