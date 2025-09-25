import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../../config/appConfig';

class CarePlanService {
  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
    });

    // Add request interceptor to include auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Get all care plans
  async getCarePlans() {
    try {
      const response = await this.api.get('/care-plans');
      return response.data;
    } catch (error) {
      console.error('Error fetching care plans:', error);
      throw error;
    }
  }

  // Get room types
  async getRoomTypes() {
    try {
      const response = await this.api.get('/room-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error;
    }
  }

  // Get all residents
  async getResidents() {
    try {
      const response = await this.api.get('/residents');
      return response.data;
    } catch (error) {
      console.error('Error fetching residents:', error);
      throw error;
    }
  }

  // Get care plan assignments to check which residents are already registered
  async getCarePlanAssignments() {
    try {
      const response = await this.api.get('/care-plan-assignments');
      return response.data;
    } catch (error) {
      console.error('Error fetching care plan assignments:', error);
      throw error;
    }
  }

  // Get unregistered residents (those without care plan assignments)
  async getUnregisteredResidents() {
    try {
      // Temporarily disable new API endpoint due to 400 error
      // Use legacy method directly since it's working correctly
      console.log('Using legacy method for unregistered residents...');
      return await this.getUnregisteredResidentsLegacy();
      
      // TODO: Fix backend API endpoint and uncomment below
      /*
      // Use the new backend API endpoint
      const response = await this.api.get('/care-plan-assignments/unregistered-residents');
      return response.data;
      */
    } catch (error) {
      console.error('Error fetching unregistered residents:', error);
      throw error;
    }
  }

  // Legacy method - kept for backward compatibility
  async getUnregisteredResidentsLegacy() {
    try {
      const [residents, assignments] = await Promise.all([
        this.getResidents(),
        this.getCarePlanAssignments()
      ]);

      console.log('DEBUG - All residents:', residents.length);
      console.log('DEBUG - All assignments:', assignments.length);
      
      // Debug: Check first assignment structure
      if (assignments.length > 0) {
        console.log('DEBUG - First assignment resident_id type:', typeof assignments[0].resident_id);
        console.log('DEBUG - First assignment resident_id:', assignments[0].resident_id);
        console.log('DEBUG - First assignment resident_id keys:', Object.keys(assignments[0].resident_id || {}));
      }

      // Get list of resident IDs that already have care plan assignments
      // Handle both populated and unpopulated resident_id
      const registeredResidentIds = assignments.map(assignment => {
        // If resident_id is populated (object), use _id
        if (assignment.resident_id && typeof assignment.resident_id === 'object' && assignment.resident_id._id) {
          return assignment.resident_id._id.toString();
        }
        // If resident_id is just the ObjectId string
        return assignment.resident_id?.toString();
      }).filter(Boolean); // Remove any undefined values

      console.log('DEBUG - Registered resident IDs:', registeredResidentIds);

      // Filter out residents who already have care plan assignments
      // Convert resident._id to string for comparison
      const unregisteredResidents = residents.filter(resident => {
        const residentIdString = resident._id?.toString();
        const isRegistered = registeredResidentIds.includes(residentIdString);
        
        console.log(`DEBUG - Resident ${resident.full_name} (${residentIdString}): ${isRegistered ? 'REGISTERED' : 'UNREGISTERED'}`);
        
        return !isRegistered;
      });

      console.log('DEBUG - Unregistered residents:', unregisteredResidents.length);
      console.log('DEBUG - Unregistered residents names:', unregisteredResidents.map(r => r.full_name));

      return unregisteredResidents;
    } catch (error) {
      console.error('Error fetching unregistered residents:', error);
      throw error;
    }
  }

  // Get rooms by filter
  async getRoomsByFilter(filters) {
    try {
      console.log('DEBUG - Calling rooms/filter with params:', filters);
      const response = await this.api.get('/rooms/filter', { params: filters });
      console.log('DEBUG - Rooms filter response:', response.data.length, 'rooms found');
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms by filter:', error);
      throw error;
    }
  }

  // Get available beds by room
  async getAvailableBedsByRoom(roomId) {
    try {
      const response = await this.api.get(`/beds/available/by-room/${roomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching available beds by room:', error);
      throw error;
    }
  }

  // Create care plan assignment
  async createCarePlanAssignment(assignmentData) {
    try {
      console.log('DEBUG - Calling POST /care-plan-assignments with data:', assignmentData);
      const response = await this.api.post('/care-plan-assignments', assignmentData);
      console.log('DEBUG - Care plan assignment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating care plan assignment:', error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  }

  // Create bed assignment
  async createBedAssignment(bedAssignmentData) {
    try {
      console.log('DEBUG - Calling POST /bed-assignments with data:', bedAssignmentData);
      const response = await this.api.post('/bed-assignments', bedAssignmentData);
      console.log('DEBUG - Bed assignment created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bed assignment:', error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  }

  // Get bed assignments by bed id (include all statuses)
  async getBedAssignmentsByBedId(bedId) {
    try {
      const response = await this.api.get('/bed-assignments', {
        params: { bed_id: bedId, statuses: 'completed,pending' },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bed assignments by bed id:', error);
      return [];
    }
  }

  // Calculate total cost
  calculateTotalCost(selectedPlans, roomType, roomTypes) {
    const carePlansCost = selectedPlans.reduce((total, plan) => {
      return total + (plan?.monthly_price || 0);
    }, 0);

    const roomCost = roomType ? roomType.monthly_price || 0 : 0;
    const totalCost = carePlansCost + roomCost;

    return {
      carePlansCost,
      roomCost,
      totalCost
    };
  }
}

export default new CarePlanService(); 