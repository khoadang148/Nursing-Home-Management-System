import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApiBaseUrl } from '../../config/appConfig';

class BillService {
  constructor() {
    this.api = axios.create({
      baseURL: getApiBaseUrl(),
      timeout: 10000,
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('accessToken');
        console.log('DEBUG - BillService token check:', token ? 'Token exists' : 'No token found');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
          console.log('DEBUG - BillService Authorization header set');
        } else {
          console.log('DEBUG - BillService No token available');
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );
  }

  // Get all residents for dropdown
  async getResidents() {
    try {
      const response = await this.api.get('/residents');
      return response.data;
    } catch (error) {
      console.error('Error fetching residents:', error);
      throw error;
    }
  }

  // Get care plan assignment by resident ID
  async getCarePlanAssignmentByResident(residentId) {
    try {
      console.log('DEBUG - Getting care plan assignment for resident:', residentId);
      const response = await this.api.get(`/care-plan-assignments/by-resident/${residentId}`);
      console.log('DEBUG - Care plan assignment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching care plan assignment:', error);
      throw error;
    }
  }

  // Get bed assignment by resident ID
  async getBedAssignmentByResident(residentId) {
    try {
      console.log('DEBUG - Getting bed assignment for resident:', residentId);
      const response = await this.api.get(`/bed-assignments/by-resident?resident_id=${residentId}`);
      console.log('DEBUG - Bed assignment response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching bed assignment:', error);
      throw error;
    }
  }

  // Get room types for price calculation
  async getRoomTypes() {
    try {
      const response = await this.api.get('/room-types');
      return response.data;
    } catch (error) {
      console.error('Error fetching room types:', error);
      throw error;
    }
  }

  // Calculate bill amount
  calculateBillAmount(carePlanAssignment, bedAssignment, roomTypes) {
    try {
      let totalAmount = 0;

      // Handle carePlanAssignment as array (take first item)
      const carePlan = Array.isArray(carePlanAssignment) ? carePlanAssignment[0] : carePlanAssignment;
      const bedAssign = Array.isArray(bedAssignment) ? bedAssignment[0] : bedAssignment;

      console.log('DEBUG - Processing care plan:', carePlan);
      console.log('DEBUG - Processing bed assignment:', bedAssign);

      // Add care plans cost from care plan assignment
      if (carePlan && carePlan.care_plans_monthly_cost) {
        totalAmount += carePlan.care_plans_monthly_cost;
        console.log('DEBUG - Added care plans cost:', carePlan.care_plans_monthly_cost);
      }

      // Add room cost from care plan assignment (this already includes room cost)
      if (carePlan && carePlan.room_monthly_cost) {
        totalAmount += carePlan.room_monthly_cost;
        console.log('DEBUG - Added room cost from care plan assignment:', carePlan.room_monthly_cost);
      }

      // Alternative: If room cost is not in care plan assignment, try to get from bed assignment
      if (totalAmount === 0 && bedAssign && bedAssign.room_id) {
        if (bedAssign.room_id.monthly_price) {
          totalAmount += bedAssign.room_id.monthly_price;
          console.log('DEBUG - Added room cost from bed assignment:', bedAssign.room_id.monthly_price);
        } else if (bedAssign.room_id.room_type_id) {
          const roomType = roomTypes.find(rt => rt._id === bedAssign.room_id.room_type_id);
          if (roomType && roomType.monthly_price) {
            totalAmount += roomType.monthly_price;
            console.log('DEBUG - Added room cost from room type:', roomType.monthly_price);
          }
        }
      }

      console.log('DEBUG - Final calculated bill amount:', totalAmount);
      return totalAmount;
    } catch (error) {
      console.error('Error calculating bill amount:', error);
      return 0;
    }
  }

  // Create bill
  async createBill(billData) {
    try {
      console.log('DEBUG - Creating bill with data:', billData);
      const response = await this.api.post('/bills', billData);
      console.log('DEBUG - Bill created successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating bill:', error);
      console.error('Error response data:', error.response?.data);
      throw error;
    }
  }

  // Get all bills
  async getBills() {
    try {
      const response = await this.api.get('/bills');
      return response.data;
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }

  // Get bills by resident
  async getBillsByResident(residentId) {
    try {
      const response = await this.api.get(`/bills/by-resident?resident_id=${residentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching bills by resident:', error);
      throw error;
    }
  }
}

export default new BillService();