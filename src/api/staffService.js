import apiService from './apiService';
import { STAFF_ENDPOINTS } from '../constants/api';
import { staff, tasks } from './mockData';
import notificationService from './notificationService';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Staff service functions
const staffService = {
  // Get all staff
  getAllStaff: async () => {
    await simulateNetworkDelay();
    return { data: staff, success: true };
  },
  
  // Get staff details by ID
  getStaffDetails: async (id) => {
    await simulateNetworkDelay();
    const staffMember = staff.find(s => s.id === id);
    if (!staffMember) {
      return { data: null, success: false, error: 'Staff member not found' };
    }
    return { data: staffMember, success: true };
  },
  
  // Create new staff member
  createStaff: async (staffData) => {
    await simulateNetworkDelay();
    const newStaff = {
      id: (staff.length + 1).toString(),
      ...staffData,
      status: 'Active',
    };
    return { data: newStaff, success: true };
  },
  
  // Update staff information
  updateStaff: async (id, staffData) => {
    await simulateNetworkDelay();
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) {
      return { data: null, success: false, error: 'Staff member not found' };
    }
    const updatedStaff = { ...staff[staffIndex], ...staffData };
    return { data: updatedStaff, success: true };
  },
  
  // Delete staff (set status to inactive)
  deleteStaff: async (id) => {
    await simulateNetworkDelay();
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) {
      return { data: null, success: false, error: 'Staff member not found' };
    }
    return { data: { id }, success: true };
  },
  
  // Get staff schedule
  getStaffSchedule: async (id) => {
    await simulateNetworkDelay();
    const staffMember = staff.find(s => s.id === id);
    if (!staffMember) {
      return { data: null, success: false, error: 'Staff member not found' };
    }
    return { data: staffMember.schedule, success: true };
  },
  
  // Update staff schedule
  updateStaffSchedule: async (id, scheduleData) => {
    await simulateNetworkDelay();
    const staffIndex = staff.findIndex(s => s.id === id);
    if (staffIndex === -1) {
      return { data: null, success: false, error: 'Staff member not found' };
    }
    const updatedSchedule = { ...staff[staffIndex].schedule, ...scheduleData };
    return { data: updatedSchedule, success: true };
  },
  
  // Get tasks assigned to staff member
  getStaffTasks: async (id) => {
    await simulateNetworkDelay();
    const staffTasks = tasks.filter(t => t.assignedTo === id);
    return { data: staffTasks, success: true };
  },
  
  // Assign task to staff member
  assignTask: async (id, taskData) => {
    await simulateNetworkDelay();
    const newTask = {
      id: (tasks.length + 1).toString(),
      assignedTo: id,
      status: 'Not Started',
      ...taskData,
    };
    
    // Tạo thông báo tiếng Việt cho việc giao nhiệm vụ
    try {
      await notificationService.createNotification('TASK_ASSIGNED', {
        taskName: taskData.title || 'Nhiệm vụ mới',
        assigneeName: 'nhân viên'
      }, {
        recipientId: id,
        relatedId: newTask.id,
        type: 'task'
      });
    } catch (error) {
      console.log('Không thể tạo thông báo cho nhiệm vụ:', error);
    }
    
    return { data: newTask, success: true };
  },
  
  // Update task status
  updateTaskStatus: async (taskId, status, completedAt = null) => {
    await simulateNetworkDelay();
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) {
      return { data: null, success: false, error: 'Task not found' };
    }
    const updatedTask = { 
      ...tasks[taskIndex], 
      status,
      ...(status === 'Completed' && { completedAt: completedAt || new Date().toISOString() }),
    };
    return { data: updatedTask, success: true };
  },
  
  // Search staff by criteria
  searchStaff: async (criteria) => {
    await simulateNetworkDelay();
    let filteredStaff = [...staff];
    
    if (criteria.name) {
      const searchName = criteria.name.toLowerCase();
      filteredStaff = filteredStaff.filter(
        s => s.firstName.toLowerCase().includes(searchName) || 
             s.lastName.toLowerCase().includes(searchName)
      );
    }
    
    if (criteria.role) {
      filteredStaff = filteredStaff.filter(s => s.role === criteria.role);
    }
    
    if (criteria.department) {
      filteredStaff = filteredStaff.filter(s => s.department === criteria.department);
    }
    
    return { data: filteredStaff, success: true };
  },
};

// For real API implementation (when backend is ready)
const realStaffService = {
  getAllStaff: () => apiService.get(STAFF_ENDPOINTS.getAllStaff),
  getStaffDetails: (id) => apiService.get(STAFF_ENDPOINTS.getStaffDetails(id)),
  createStaff: (data) => apiService.post(STAFF_ENDPOINTS.createStaff, data),
  updateStaff: (id, data) => apiService.put(STAFF_ENDPOINTS.updateStaff(id), data),
  deleteStaff: (id) => apiService.delete(STAFF_ENDPOINTS.deleteStaff(id)),
  getStaffSchedule: (id) => apiService.get(STAFF_ENDPOINTS.getStaffSchedule(id)),
};

// Export the mock service for now
export default staffService; 