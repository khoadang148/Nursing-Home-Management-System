import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import CreateTaskScreen from '../screens/tasks/CreateTaskScreen';
import EditTaskScreen from '../screens/tasks/EditTaskScreen';
import RecordVitalsScreen from '../screens/residents/RecordVitalsScreen';
import AddAssessmentScreen from '../screens/residents/AddAssessmentScreen';

const Stack = createStackNavigator();

const TasksNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false
      }}
    >
      <Stack.Screen name="TaskList" component={TaskListScreen} />
      <Stack.Screen name="TaskDetail" component={TaskDetailScreen} />
      <Stack.Screen name="CreateTask" component={CreateTaskScreen} />
      <Stack.Screen name="EditTask" component={EditTaskScreen} />
      <Stack.Screen name="RecordVitals" component={RecordVitalsScreen} />
      <Stack.Screen name="AddAssessment" component={AddAssessmentScreen} />
    </Stack.Navigator>
  );
};

export default TasksNavigator; 