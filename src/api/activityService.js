import apiService from './apiService';
import { ACTIVITY_ENDPOINTS } from '../constants/api';
import { activities, activityParticipation, mockActivities, mockParticipants } from './mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Simulates API delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Activity service functions
const activityService = {
  // Get all activities
  getAllActivities: async () => {
    await simulateNetworkDelay();
    return { data: activities, success: true };
  },
  
  // Get activity details by ID
  getActivityDetails: async (id) => {
    await simulateNetworkDelay();
    const activity = activities.find(a => a.id === id);
    if (!activity) {
      return { data: null, success: false, error: 'Activity not found' };
    }
    return { data: activity, success: true };
  },
  
  // Create new activity
  createActivity: async (activityData) => {
    await simulateNetworkDelay();
    const newActivity = {
      id: (activities.length + 1).toString(),
      ...activityData,
    };
    return { data: newActivity, success: true };
  },
  
  // Update activity information
  updateActivity: async (id, activityData) => {
    await simulateNetworkDelay();
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
      return { data: null, success: false, error: 'Activity not found' };
    }
    const updatedActivity = { ...activities[activityIndex], ...activityData };
    return { data: updatedActivity, success: true };
  },
  
  // Delete activity
  deleteActivity: async (id) => {
    await simulateNetworkDelay();
    const activityIndex = activities.findIndex(a => a.id === id);
    if (activityIndex === -1) {
      return { data: null, success: false, error: 'Activity not found' };
    }
    return { data: { id }, success: true };
  },
  
  // Get resident activities
  getResidentActivities: async (residentId) => {
    await simulateNetworkDelay();
    const participations = activityParticipation.filter(p => p.residentId === residentId);
    
    // Get full activity details for each participation
    const residentActivities = participations.map(p => {
      const activity = activities.find(a => a.id === p.activityId);
      return {
        ...p,
        activity: activity || { name: 'Unknown Activity' },
      };
    });
    
    return { data: residentActivities, success: true };
  },
  
  // Get recommended activities for a resident
  getRecommendedActivities: async (residentId) => {
    await simulateNetworkDelay();
    // This would typically use a recommendation algorithm
    // For now, just return a subset of activities as recommendations
    const recommendedActivities = activities.slice(0, 3);
    return { data: recommendedActivities, success: true };
  },
  
  // Record activity participation
  recordParticipation: async (participationData) => {
    await simulateNetworkDelay();
    const newParticipation = {
      id: (activityParticipation.length + 1).toString(),
      date: new Date().toISOString().slice(0, 10), // Today's date in YYYY-MM-DD format
      ...participationData,
    };
    return { data: newParticipation, success: true };
  },
  
  // Get activity participation list
  getActivityParticipants: async (activityId) => {
    await simulateNetworkDelay();
    const participants = activityParticipation.filter(p => p.activityId === activityId);
    return { data: participants, success: true };
  },
  
  // Get activities by date
  getActivitiesByDate: async (date) => {
    await simulateNetworkDelay();
    // Convert date string to day of week
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Filter activities that occur on this day of the week
    const activitiesOnDate = activities.filter(a => 
      a.daysOfWeek.includes(dayOfWeek)
    );
    
    return { data: activitiesOnDate, success: true };
  },
  
  // Search activities by criteria
  searchActivities: async (criteria) => {
    await simulateNetworkDelay();
    let filteredActivities = [...activities];
    
    if (criteria.name) {
      const searchName = criteria.name.toLowerCase();
      filteredActivities = filteredActivities.filter(
        a => a.name.toLowerCase().includes(searchName) || 
             a.description.toLowerCase().includes(searchName)
      );
    }
    
    if (criteria.location) {
      filteredActivities = filteredActivities.filter(a => a.location === criteria.location);
    }
    
    if (criteria.careLevel) {
      filteredActivities = filteredActivities.filter(a => a.careLevel.includes(criteria.careLevel));
    }
    
    if (criteria.facilitator) {
      filteredActivities = filteredActivities.filter(a => a.facilitator === criteria.facilitator);
    }
    
    if (criteria.dayOfWeek) {
      filteredActivities = filteredActivities.filter(a => a.daysOfWeek.includes(criteria.dayOfWeek));
    }
    
    return { data: filteredActivities, success: true };
  },
};

// For real API implementation (when backend is ready)
const realActivityService = {
  getAllActivities: () => apiService.get(ACTIVITY_ENDPOINTS.getAllActivities),
  getActivityDetails: (id) => apiService.get(ACTIVITY_ENDPOINTS.getActivityDetails(id)),
  createActivity: (data) => apiService.post(ACTIVITY_ENDPOINTS.createActivity, data),
  updateActivity: (id, data) => apiService.put(ACTIVITY_ENDPOINTS.updateActivity(id), data),
  deleteActivity: (id) => apiService.delete(ACTIVITY_ENDPOINTS.deleteActivity(id)),
  getResidentActivities: (residentId) => apiService.get(ACTIVITY_ENDPOINTS.getResidentActivities(residentId)),
  getRecommendedActivities: (residentId) => apiService.get(ACTIVITY_ENDPOINTS.getRecommendedActivities(residentId)),
};

// Get all activities
export const getAllActivities = async () => {
  try {
    await delay(800); // Simulate network delay
    return [...mockActivities];
  } catch (error) {
    console.error('Error fetching activities:', error);
    throw new Error('Failed to fetch activities');
  }
};

// Get activity by ID
export const getActivityById = async (activityId) => {
  try {
    await delay(600);
    const activity = mockActivities.find(activity => activity.id === Number(activityId));
    
    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    
    // Add participants list to the activity details
    const activityWithParticipants = {
      ...activity,
      participantsList: mockParticipants.filter(
        participant => participant.assignedActivities.includes(Number(activityId))
      )
    };
    
    return activityWithParticipants;
  } catch (error) {
    console.error(`Error fetching activity ${activityId}:`, error);
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
};

// Create new activity
export const createNewActivity = async (activityData) => {
  try {
    await delay(1000);
    
    // Generate a new ID
    const newId = Math.max(...mockActivities.map(a => a.id)) + 1;
    
    const newActivity = {
      id: newId,
      ...activityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Add to mock data (in a real app this would be a server call)
    mockActivities.push(newActivity);
    
    return newActivity;
  } catch (error) {
    console.error('Error creating activity:', error);
    throw new Error(`Failed to create activity: ${error.message}`);
  }
};

// Update activity by ID
export const updateActivityById = async (activityId, activityData) => {
  try {
    await delay(800);
    
    const index = mockActivities.findIndex(activity => activity.id === Number(activityId));
    
    if (index === -1) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    
    const updatedActivity = {
      ...mockActivities[index],
      ...activityData,
      updatedAt: new Date().toISOString()
    };
    
    // Update in mock data (in a real app this would be a server call)
    mockActivities[index] = updatedActivity;
    
    return updatedActivity;
  } catch (error) {
    console.error(`Error updating activity ${activityId}:`, error);
    throw new Error(`Failed to update activity: ${error.message}`);
  }
};

// Delete activity by ID
export const deleteActivityById = async (activityId) => {
  try {
    await delay(700);
    
    const index = mockActivities.findIndex(activity => activity.id === Number(activityId));
    
    if (index === -1) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    
    // Remove from mock data (in a real app this would be a server call)
    mockActivities.splice(index, 1);
    
    return true;
  } catch (error) {
    console.error(`Error deleting activity ${activityId}:`, error);
    throw new Error(`Failed to delete activity: ${error.message}`);
  }
};

// Get activities by date
export const getActivitiesByDate = async (date) => {
  try {
    await delay(600);
    
    const targetDate = new Date(date).toISOString().split('T')[0];
    
    const filteredActivities = mockActivities.filter(activity => {
      const activityDate = new Date(activity.scheduledTime).toISOString().split('T')[0];
      return activityDate === targetDate;
    });
    
    return filteredActivities;
  } catch (error) {
    console.error(`Error fetching activities for date ${date}:`, error);
    throw new Error(`Failed to fetch activities by date: ${error.message}`);
  }
};

// Get activities by type
export const getActivitiesByType = async (type) => {
  try {
    await delay(500);
    
    const filteredActivities = mockActivities.filter(
      activity => activity.type.toLowerCase() === type.toLowerCase()
    );
    
    return filteredActivities;
  } catch (error) {
    console.error(`Error fetching activities of type ${type}:`, error);
    throw new Error(`Failed to fetch activities by type: ${error.message}`);
  }
};

// Search activities
export const searchActivities = async (searchTerm) => {
  try {
    await delay(700);
    
    const filteredActivities = mockActivities.filter(activity => {
      const nameMatch = activity.name.toLowerCase().includes(searchTerm.toLowerCase());
      const descriptionMatch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
      const locationMatch = activity.location.toLowerCase().includes(searchTerm.toLowerCase());
      
      return nameMatch || descriptionMatch || locationMatch;
    });
    
    return filteredActivities;
  } catch (error) {
    console.error(`Error searching activities with term ${searchTerm}:`, error);
    throw new Error(`Failed to search activities: ${error.message}`);
  }
};

// Record activity attendance
export const recordAttendance = async (activityId, participantData) => {
  try {
    await delay(800);
    
    const activity = mockActivities.find(activity => activity.id === Number(activityId));
    
    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    
    // In a real app, this would update the attendance record in the database
    return {
      activityId: Number(activityId),
      participantId: participantData.participantId,
      status: participantData.status,
      notes: participantData.notes,
      recordedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error(`Error recording attendance for activity ${activityId}:`, error);
    throw new Error(`Failed to record attendance: ${error.message}`);
  }
};

// Add participant to activity
export const addParticipant = async (activityId, participantId) => {
  try {
    await delay(600);
    
    const activity = mockActivities.find(activity => activity.id === Number(activityId));
    const participant = mockParticipants.find(p => p.id === Number(participantId));
    
    if (!activity) {
      throw new Error(`Activity with ID ${activityId} not found`);
    }
    
    if (!participant) {
      throw new Error(`Participant with ID ${participantId} not found`);
    }
    
    // Add the activity to the participant's assigned activities
    if (!participant.assignedActivities.includes(Number(activityId))) {
      participant.assignedActivities.push(Number(activityId));
    }
    
    return { success: true };
  } catch (error) {
    console.error(`Error adding participant ${participantId} to activity ${activityId}:`, error);
    throw new Error(`Failed to add participant: ${error.message}`);
  }
};

// Remove participant from activity
export const removeParticipant = async (activityId, participantId) => {
  try {
    await delay(600);
    
    const participant = mockParticipants.find(p => p.id === Number(participantId));
    
    if (!participant) {
      throw new Error(`Participant with ID ${participantId} not found`);
    }
    
    // Remove the activity from the participant's assigned activities
    participant.assignedActivities = participant.assignedActivities.filter(
      id => id !== Number(activityId)
    );
    
    return { success: true };
  } catch (error) {
    console.error(`Error removing participant ${participantId} from activity ${activityId}:`, error);
    throw new Error(`Failed to remove participant: ${error.message}`);
  }
};

// Get upcoming activities
export const getUpcomingActivities = async () => {
  try {
    await delay(700);
    
    const now = new Date();
    
    const upcomingActivities = mockActivities.filter(activity => {
      const activityDate = new Date(activity.scheduledTime);
      return activityDate >= now;
    }).sort((a, b) => {
      return new Date(a.scheduledTime) - new Date(b.scheduledTime);
    });
    
    return upcomingActivities;
  } catch (error) {
    console.error('Error fetching upcoming activities:', error);
    throw new Error(`Failed to fetch upcoming activities: ${error.message}`);
  }
};

// Get past activities
export const getPastActivities = async () => {
  try {
    await delay(700);
    
    const now = new Date();
    
    const pastActivities = mockActivities.filter(activity => {
      const activityDate = new Date(activity.scheduledTime);
      return activityDate < now;
    }).sort((a, b) => {
      return new Date(b.scheduledTime) - new Date(a.scheduledTime);
    });
    
    return pastActivities;
  } catch (error) {
    console.error('Error fetching past activities:', error);
    throw new Error(`Failed to fetch past activities: ${error.message}`);
  }
};

// Export the mock service for now
export default activityService; 