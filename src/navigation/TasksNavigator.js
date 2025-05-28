import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import TaskListScreen from '../screens/tasks/TaskListScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import AddTaskScreen from '../screens/tasks/AddTaskScreen';
import EditTaskScreen from '../screens/tasks/EditTaskScreen';

const Stack = createStackNavigator();

const TasksNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="DanhSachNhiemVu"
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="DanhSachNhiemVu" component={TaskListScreen} />
      <Stack.Screen name="ChiTietNhiemVu" component={TaskDetailScreen} />
      <Stack.Screen name="ThemNhiemVu" component={AddTaskScreen} />
      <Stack.Screen name="SuaNhiemVu" component={EditTaskScreen} />
    </Stack.Navigator>
  );
};

export default TasksNavigator; 