import apiService from './apiService';
import { medications as mockMedications } from './mockData';

// Helper function to simulate API delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to generate a unique ID
const generateId = () => Math.floor(Math.random() * 10000).toString();

// In-memory medication data for mock implementation
let medications = [...mockMedications];

export const medicationService = {
  // Get all medications
  getMedications: async () => {
    try {
      // For production, use the API service
      // const response = await apiService.get('/medications');
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      return [...medications];
    } catch (error) {
      console.error('Error fetching medications:', error);
      throw error;
    }
  },
  
  // Get medication by ID
  getMedicationById: async (id) => {
    try {
      // For production, use the API service
      // const response = await apiService.get(`/medications/${id}`);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const medication = medications.find(med => med.id === id);
      if (!medication) {
        throw new Error('Medication not found');
      }
      return { ...medication };
    } catch (error) {
      console.error(`Error fetching medication with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Create a new medication
  createMedication: async (medicationData) => {
    try {
      // For production, use the API service
      // const response = await apiService.post('/medications', medicationData);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const newMedication = {
        id: generateId(),
        ...medicationData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        administrationHistory: [],
      };
      medications.push(newMedication);
      return { ...newMedication };
    } catch (error) {
      console.error('Error creating medication:', error);
      throw error;
    }
  },
  
  // Update an existing medication
  updateMedication: async (id, medicationData) => {
    try {
      // For production, use the API service
      // const response = await apiService.put(`/medications/${id}`, medicationData);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const index = medications.findIndex(med => med.id === id);
      if (index === -1) {
        throw new Error('Medication not found');
      }
      
      const updatedMedication = {
        ...medications[index],
        ...medicationData,
        updatedAt: new Date().toISOString(),
      };
      
      medications[index] = updatedMedication;
      return { ...updatedMedication };
    } catch (error) {
      console.error(`Error updating medication with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Delete a medication
  deleteMedication: async (id) => {
    try {
      // For production, use the API service
      // await apiService.delete(`/medications/${id}`);
      
      // For development, use mock data
      await simulateDelay();
      const index = medications.findIndex(med => med.id === id);
      if (index === -1) {
        throw new Error('Medication not found');
      }
      medications.splice(index, 1);
      return true;
    } catch (error) {
      console.error(`Error deleting medication with ID ${id}:`, error);
      throw error;
    }
  },
  
  // Record medication administration
  recordAdministration: async (medicationId, administrationData) => {
    try {
      // For production, use the API service
      // const response = await apiService.post(`/medications/${medicationId}/administrations`, administrationData);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const index = medications.findIndex(med => med.id === medicationId);
      if (index === -1) {
        throw new Error('Medication not found');
      }
      
      const administration = {
        id: generateId(),
        ...administrationData,
        timestamp: new Date().toISOString(),
      };
      
      if (!medications[index].administrationHistory) {
        medications[index].administrationHistory = [];
      }
      
      medications[index].administrationHistory.push(administration);
      
      return {
        medicationId,
        administration,
      };
    } catch (error) {
      console.error(`Error recording administration for medication ${medicationId}:`, error);
      throw error;
    }
  },
  
  // Get medication schedule for a resident
  getResidentMedicationSchedule: async (residentId) => {
    try {
      // For production, use the API service
      // const response = await apiService.get(`/residents/${residentId}/medications/schedule`);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const residentMedications = medications.filter(med => med.residentId === residentId);
      return residentMedications.map(med => ({
        ...med,
        nextDose: calculateNextDose(med.schedule),
      }));
    } catch (error) {
      console.error(`Error fetching medication schedule for resident ${residentId}:`, error);
      throw error;
    }
  },
  
  // Get medications due in the next X hours
  getMedicationsDue: async (hours = 4) => {
    try {
      // For production, use the API service
      // const response = await apiService.get(`/medications/due?hours=${hours}`);
      // return response.data;
      
      // For development, use mock data
      await simulateDelay();
      const now = new Date();
      const cutoff = new Date(now.getTime() + hours * 60 * 60 * 1000);
      
      return medications.filter(med => {
        const nextDose = calculateNextDose(med.schedule);
        return nextDose && new Date(nextDose) <= cutoff;
      }).map(med => ({
        ...med,
        nextDose: calculateNextDose(med.schedule),
      }));
    } catch (error) {
      console.error(`Error fetching medications due in the next ${hours} hours:`, error);
      throw error;
    }
  },
};

// Helper function to calculate the next dose time based on the medication schedule
const calculateNextDose = (schedule) => {
  if (!schedule || !schedule.times || schedule.times.length === 0) {
    return null;
  }
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Sort times chronologically
  const sortedTimes = [...schedule.times].sort();
  
  // Check if any times are still upcoming today
  for (const time of sortedTimes) {
    const [hours, minutes] = time.split(':').map(Number);
    const doseTime = new Date(today);
    doseTime.setHours(hours, minutes, 0, 0);
    
    if (doseTime > now) {
      return doseTime.toISOString();
    }
  }
  
  // If no times are upcoming today, get the first time for tomorrow
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const [hours, minutes] = sortedTimes[0].split(':').map(Number);
  const nextDose = new Date(tomorrow);
  nextDose.setHours(hours, minutes, 0, 0);
  
  return nextDose.toISOString();
};

export default medicationService; 