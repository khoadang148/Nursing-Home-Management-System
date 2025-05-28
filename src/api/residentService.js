import apiService from './apiService';
import { RESIDENT_ENDPOINTS } from '../constants/api';
import { residents, carePlans, medications, vitals } from './mockData';

// Simulated API delay
const simulateNetworkDelay = () => new Promise(resolve => setTimeout(resolve, 500));

// Resident service functions
const residentService = {
  // Get all residents
  getAllResidents: async () => {
    await simulateNetworkDelay();
    return { data: residents, success: true };
  },
  
  // Get resident details by ID
  getResidentDetails: async (id) => {
    await simulateNetworkDelay();
    const resident = residents.find(r => r.id === id);
    if (!resident) {
      return { data: null, success: false, error: 'Không tìm thấy cư dân' };
    }
    return { data: resident, success: true };
  },
  
  // Create new resident
  createResident: async (residentData) => {
    await simulateNetworkDelay();
    const newResident = {
      id: (residents.length + 1).toString(),
      ...residentData,
      status: 'Hoạt động',
    };
    return { data: newResident, success: true };
  },
  
  // Update resident information
  updateResident: async (id, residentData) => {
    await simulateNetworkDelay();
    const residentIndex = residents.findIndex(r => r.id === id);
    if (residentIndex === -1) {
      return { data: null, success: false, error: 'Không tìm thấy cư dân' };
    }
    const updatedResident = { ...residents[residentIndex], ...residentData };
    return { data: updatedResident, success: true };
  },
  
  // Delete resident (set status to inactive)
  deleteResident: async (id) => {
    await simulateNetworkDelay();
    const residentIndex = residents.findIndex(r => r.id === id);
    if (residentIndex === -1) {
      return { data: null, success: false, error: 'Không tìm thấy cư dân' };
    }
    return { data: { id }, success: true };
  },
  
  // Get resident medications
  getMedications: async (id) => {
    await simulateNetworkDelay();
    const residentMedications = medications.filter(m => m.residentId === id);
    return { data: residentMedications, success: true };
  },
  
  // Get resident care plans
  getCarePlans: async (id) => {
    await simulateNetworkDelay();
    const residentCarePlans = carePlans.filter(cp => cp.residentId === id);
    return { data: residentCarePlans, success: true };
  },
  
  // Get resident vital signs
  getVitals: async (id) => {
    await simulateNetworkDelay();
    const residentVitals = vitals.filter(v => v.residentId === id);
    return { data: residentVitals, success: true };
  },
  
  // Add new medication for resident
  addMedication: async (id, medicationData) => {
    await simulateNetworkDelay();
    const newMedication = {
      id: (medications.length + 1).toString(),
      residentId: id,
      ...medicationData,
      status: 'Hoạt động',
    };
    return { data: newMedication, success: true };
  },
  
  // Add new care plan for resident
  addCarePlan: async (id, carePlanData) => {
    await simulateNetworkDelay();
    const newCarePlan = {
      id: (carePlans.length + 1).toString(),
      residentId: id,
      ...carePlanData,
      status: 'Hoạt động',
    };
    return { data: newCarePlan, success: true };
  },
  
  // Record vital signs for resident
  recordVitals: async (id, vitalsData) => {
    await simulateNetworkDelay();
    const newVitals = {
      id: (vitals.length + 1).toString(),
      residentId: id,
      date: new Date().toISOString(),
      ...vitalsData,
    };
    return { data: newVitals, success: true };
  },
  
  // Search residents by criteria
  searchResidents: async (criteria) => {
    await simulateNetworkDelay();
    let filteredResidents = [...residents];
    
    if (criteria.name) {
      const searchName = criteria.name.toLowerCase();
      filteredResidents = filteredResidents.filter(
        r => r.firstName.toLowerCase().includes(searchName) || 
             r.lastName.toLowerCase().includes(searchName)
      );
    }
    
    if (criteria.roomNumber) {
      filteredResidents = filteredResidents.filter(r => r.roomNumber === criteria.roomNumber);
    }
    
    if (criteria.careLevel) {
      filteredResidents = filteredResidents.filter(r => r.careLevel === criteria.careLevel);
    }
    
    return { data: filteredResidents, success: true };
  },
};

// For real API implementation (when backend is ready)
const realResidentService = {
  getAllResidents: () => apiService.get(RESIDENT_ENDPOINTS.getAllResidents),
  getResidentDetails: (id) => apiService.get(RESIDENT_ENDPOINTS.getResidentDetails(id)),
  createResident: (data) => apiService.post(RESIDENT_ENDPOINTS.createResident, data),
  updateResident: (id, data) => apiService.put(RESIDENT_ENDPOINTS.updateResident(id), data),
  deleteResident: (id) => apiService.delete(RESIDENT_ENDPOINTS.deleteResident(id)),
  getMedications: (id) => apiService.get(RESIDENT_ENDPOINTS.getMedications(id)),
  getCarePlans: (id) => apiService.get(RESIDENT_ENDPOINTS.getCarePlans(id)),
  getVitals: (id) => apiService.get(RESIDENT_ENDPOINTS.getVitals(id)),
};

// Export the mock service for now
export default residentService; 