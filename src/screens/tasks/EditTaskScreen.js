import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { 
  Appbar, 
  TextInput, 
  Text, 
  Button,
  Menu,
  HelperText,
  Divider,
  Portal,
  Dialog,
  Switch
} from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS, SIZES, FONTS } from '../../constants/theme';
import DateTimePicker from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useNavigation, useRoute } from '@react-navigation/native';

// Mock tasks data - in a real app, this would come from an API or Redux store
import { mockTasks } from './TaskListScreen';

const EditTaskScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { taskId } = route.params;
  
  const [loading, setLoading] = useState(true);
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
  const [resident, setResident] = useState({ id: '', name: '', roomNumber: '' });
  const [assignedTo, setAssignedTo] = useState('');
  const [errors, setErrors] = useState({});
  const [discardDialogVisible, setDiscardDialogVisible] = useState(false);
  
  const categories = [
    'Daily Care',
    'Medication',
    'Housekeeping',
    'Meals',
    'Activities',
    'Administrative',
    'Other'
  ];
  
  const priorities = ['Low', 'Medium', 'High'];
  
  useEffect(() => {
    // Simulating API loading
    setTimeout(() => {
      // Find the task with the given ID from the mock data
      const task = mockTasks.find(t => t.id === taskId);
      
      if (task) {
        setTitle(task.title);
        setDescription(task.description);
        
        const taskDueDate = new Date(task.dueDate);
        setDueDate(taskDueDate);
        setDueTime(taskDueDate);
        
        setPriority(task.priority);
        setCategory(task.category);
        setResident({
          id: task.residentId,
          name: task.residentName,
          roomNumber: task.roomNumber
        });
        setAssignedTo(task.assignedTo);
      }
      
      setLoading(false);
    }, 500);
  }, [taskId]);
  
  const validate = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!assignedTo.trim()) newErrors.assignedTo = 'Assigned staff is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSaveTask = () => {
    if (!validate()) return;
    
    const updatedDueDate = new Date(dueDate);
    updatedDueDate.setHours(dueTime.getHours(), dueTime.getMinutes(), 0, 0);
    
    const updatedTask = {
      id: taskId,
      title,
      description,
      dueDate: updatedDueDate.toISOString(),
      priority,
      status: 'Pending',
      category,
      residentId: resident.id,
      residentName: resident.name,
      roomNumber: resident.roomNumber,
      assignedTo
    };
    
    // In a real app, send to API or update in Redux
    console.log('Updated task:', updatedTask);
    
    // Navigate back to details
    Alert.alert(
      "Task Updated",
      "The task has been updated successfully!",
      [
        { 
          text: "OK", 
          onPress: () => navigation.navigate('TaskDetail', { taskId }) 
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
  
  const handleBack = () => {
    if (hasUnsavedChanges()) {
      setDiscardDialogVisible(true);
    } else {
      navigation.goBack();
    }
  };

  const hasUnsavedChanges = () => {
    return title !== resident.name || 
           description !== resident.description || 
           format(dueDate, 'yyyy-MM-dd') !== format(new Date(resident.dueDate), 'yyyy-MM-dd') ||
           priority !== resident.priority ||
           category !== resident.category ||
           assignedTo !== resident.assignedTo;
  };
  
  if (loading) {
    return (
      <View style={styles.container}>
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Chỉnh sửa nhiệm vụ" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Đang tải...</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={handleBack} />
        <Appbar.Content title="Chỉnh sửa nhiệm vụ" />
      </Appbar.Header>

      <Portal>
        <Dialog
          visible={discardDialogVisible}
          onDismiss={() => setDiscardDialogVisible(false)}
        >
          <Dialog.Title>Discard Changes?</Dialog.Title>
          <Dialog.Content>
            <Text>You have unsaved changes. Are you sure you want to discard them?</Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setDiscardDialogVisible(false)}>Cancel</Button>
            <Button onPress={() => {
              setDiscardDialogVisible(false);
              navigation.goBack();
            }}>Discard</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              {priorities.map((item) => (
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
              {categories.map((item) => (
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
          <View style={styles.residentContainer}>
            <Text style={styles.residentName}>{resident.name}</Text>
            <Text style={styles.roomNumber}>Room {resident.roomNumber}</Text>
            <Button
              mode="outlined"
              onPress={() => {
                // In a real app, navigate to a resident picker screen
                Alert.alert("Feature Not Available", "Resident selection is not available in this demo.");
              }}
              style={styles.residentChangeButton}
            >
              Change Resident
            </Button>
          </View>
          
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
            onPress={handleSaveTask}
            style={styles.saveButton}
          >
            Save Changes
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
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
  keyboardAvoidView: {
    flex: 1,
  },
  scrollContainer: {
    padding: SIZES.padding,
  },
  input: {
    marginBottom: 8,
  },
  datePickerButton: {
    marginBottom: 16,
  },
  menuContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    marginBottom: 4,
    color: COLORS.textSecondary,
  },
  selector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 14,
    backgroundColor: COLORS.surface,
  },
  selectorText: {
    fontSize: 16,
    color: COLORS.textPrimary,
  },
  menu: {
    marginTop: 40,
  },
  divider: {
    marginVertical: 16,
  },
  submitButton: {
    marginTop: 16,
    marginBottom: 32,
    backgroundColor: COLORS.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    ...FONTS.h3,
    color: COLORS.text,
    marginTop: 12,
    marginBottom: 16,
  },
  residentContainer: {
    backgroundColor: COLORS.surface,
    padding: 16,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  residentName: {
    ...FONTS.h4,
    color: COLORS.text,
  },
  roomNumber: {
    ...FONTS.body3,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
  residentChangeButton: {
    marginTop: 8,
    borderColor: COLORS.primary,
  },
  saveButton: {
    marginTop: 24,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
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
});

export default EditTaskScreen; 