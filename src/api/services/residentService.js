import apiClient from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';

class ResidentService {
  // Get all residents
  async getAllResidents() {
    try {
      const response = await apiClient.get(API_CONFIG.ENDPOINTS.RESIDENT.LIST);
      
      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Get residents error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách người cao tuổi',
      };
    }
  }

  // Get resident by ID
  async getResidentById(id) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.RESIDENT.DETAIL, { id });
      const response = await apiClient.get(url);
      // Log response để debug
      console.log('[residentService] getResidentById response:', response.data);
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Resident not found',
        };
      }
    } catch (error) {
      console.error('Get resident by ID error:', error);
      return {
        success: false,
        data: null,
        error: error.response?.data?.message || 'Không thể lấy thông tin người cao tuổi',
      };
    }
  }

  // Get residents by family member ID
  async getResidentsByFamilyMember(familyMemberId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.RESIDENT.BY_FAMILY_MEMBER, { familyMemberId });
      const response = await apiClient.get(url);
      
      if (response.data && Array.isArray(response.data)) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'No residents found for this family member',
        };
      }
    } catch (error) {
      console.error('Get residents by family member error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy danh sách người cao tuổi của gia đình',
      };
    }
  }

  // Create new resident
  async createResident(residentData) {
    try {
      const response = await apiClient.post(API_CONFIG.ENDPOINTS.RESIDENT.CREATE, residentData);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
          message: 'Tạo hồ sơ người cao tuổi thành công',
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Create resident error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể tạo hồ sơ người cao tuổi',
      };
    }
  }

  // Update resident
  async updateResident(id, updateData) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.RESIDENT.UPDATE, { id });
      const response = await apiClient.patch(url, updateData);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
          message: 'Cập nhật hồ sơ người cao tuổi thành công',
        };
      } else {
        return {
          success: false,
          error: 'Invalid response format',
        };
      }
    } catch (error) {
      console.error('Update resident error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể cập nhật hồ sơ người cao tuổi',
      };
    }
  }

  // Delete resident
  async deleteResident(id) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.RESIDENT.DELETE, { id });
      const response = await apiClient.delete(url);
      
      if (response.status === 200) {
        return {
          success: true,
          message: 'Xóa hồ sơ người cao tuổi thành công',
        };
      } else {
        return {
          success: false,
          error: 'Delete failed',
        };
      }
    } catch (error) {
      console.error('Delete resident error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể xóa hồ sơ người cao tuổi',
      };
    }
  }

  // Get resident medications (from old service)
  async getResidentMedications(residentId) {
    try {
      // For now, return medications from resident data
      // In the future, this could be a separate API endpoint
      const residentResponse = await this.getResidentById(residentId);
      if (residentResponse.success && residentResponse.data.current_medications) {
        return {
          success: true,
          data: residentResponse.data.current_medications,
        };
      } else {
        return {
          success: true,
          data: [],
        };
      }
    } catch (error) {
      console.error('Get resident medications error:', error);
      return {
        success: false,
        error: 'Không thể lấy thông tin thuốc',
      };
    }
  }

  // Get resident care plans (from old service)
  async getResidentCarePlans(residentId) {
    try {
      // For now, return mock care plan data
      // In the future, this could be a separate API endpoint
      const mockCarePlan = {
        plan_name: 'Gói Chăm Sóc Tiêu Chuẩn',
        monthly_cost: 15000000,
        status: 'active',
        services: ['Chăm sóc cơ bản', 'Khám sức khỏe định kỳ', 'Hoạt động giải trí'],
      };
      
      return {
        success: true,
        data: [mockCarePlan],
      };
    } catch (error) {
      console.error('Get resident care plans error:', error);
      return {
        success: false,
        error: 'Không thể lấy thông tin gói chăm sóc',
      };
    }
  }

  // Get resident vital signs (from old service)
  async getResidentVitals(residentId) {
    try {
      // For now, return mock vital signs data
      // In the future, this could be a separate API endpoint
      const mockVitals = [
        {
          id: '1',
          residentId: residentId,
          temperature: 36.5 + Math.random() * 1,
          heart_rate: 70 + Math.floor(Math.random() * 20),
          blood_pressure: '130/80',
          date: new Date().toISOString(),
        },
        {
          id: '2',
          residentId: residentId,
          temperature: 36.8,
          heart_rate: 75,
          blood_pressure: '135/85',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
      ];
      
      return {
        success: true,
        data: mockVitals,
      };
    } catch (error) {
      console.error('Get resident vitals error:', error);
      return {
        success: false,
        error: 'Không thể lấy thông tin chỉ số sinh hiệu',
      };
    }
  }

  // Add medication for resident (from old service)
  async addResidentMedication(residentId, medicationData) {
    try {
      // Get current resident data
      const residentResponse = await this.getResidentById(residentId);
      if (!residentResponse.success) {
        return {
          success: false,
          error: 'Không tìm thấy thông tin cư dân',
        };
      }

      const resident = residentResponse.data;
      const currentMedications = resident.current_medications || [];
      
      // Add new medication
      const newMedication = {
        medication_name: medicationData.medication_name,
        dosage: medicationData.dosage,
        frequency: medicationData.frequency,
        start_date: new Date().toISOString(),
        status: 'active',
      };
      
      const updatedMedications = [...currentMedications, newMedication];
      
      // Update resident with new medication
      const updateResponse = await this.updateResident(residentId, {
        current_medications: updatedMedications,
      });
      
      if (updateResponse.success) {
        return {
          success: true,
          data: newMedication,
          message: 'Thêm thuốc thành công',
        };
      } else {
        return updateResponse;
      }
    } catch (error) {
      console.error('Add resident medication error:', error);
      return {
        success: false,
        error: 'Không thể thêm thuốc',
      };
    }
  }

  // Record vital signs for resident (from old service)
  async recordResidentVitals(residentId, vitalsData) {
    try {
      // For now, just return success
      // In the future, this could save to a separate vitals collection
      const newVitals = {
        id: Date.now().toString(),
        residentId: residentId,
        date: new Date().toISOString(),
        ...vitalsData,
      };
      
      return {
        success: true,
        data: newVitals,
        message: 'Ghi nhận chỉ số sinh hiệu thành công',
      };
    } catch (error) {
      console.error('Record resident vitals error:', error);
      return {
        success: false,
        error: 'Không thể ghi nhận chỉ số sinh hiệu',
      };
    }
  }

  // Search residents by criteria (from old service)
  async searchResidents(criteria) {
    try {
      const allResidentsResponse = await this.getAllResidents();
      if (!allResidentsResponse.success) {
        return allResidentsResponse;
      }

      let filteredResidents = allResidentsResponse.data;
      
      if (criteria.name) {
        const searchName = criteria.name.toLowerCase();
        filteredResidents = filteredResidents.filter(resident =>
          resident.full_name?.toLowerCase().includes(searchName)
        );
      }
      
      if (criteria.roomNumber) {
        filteredResidents = filteredResidents.filter(resident =>
          resident.roomNumber === criteria.roomNumber
        );
      }
      
      if (criteria.status) {
        filteredResidents = filteredResidents.filter(resident =>
          resident.status === criteria.status
        );
      }
      
      if (criteria.gender) {
        filteredResidents = filteredResidents.filter(resident =>
          resident.gender === criteria.gender
        );
      }
      
      return {
        success: true,
        data: filteredResidents,
      };
    } catch (error) {
      console.error('Search residents error:', error);
      return {
        success: false,
        error: 'Không thể tìm kiếm cư dân',
      };
    }
  }

  // Helper method to format resident data for backend
  formatResidentData(data) {
    return {
      full_name: data.full_name,
      date_of_birth: data.date_of_birth,
      gender: data.gender,
      avatar: data.avatar,
      admission_date: data.admission_date,
      discharge_date: data.discharge_date,
      family_member_id: data.family_member_id,
      relationship: data.relationship,
      medical_history: data.medical_history,
      current_medications: data.current_medications || [],
      allergies: data.allergies || [],
      emergency_contact: data.emergency_contact,
      status: data.status || 'active',
    };
  }

  // Helper method to calculate age from date of birth
  calculateAge(dateOfBirth) {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Helper method to format resident data for display
  formatResidentForDisplay(resident) {
    return {
      ...resident,
      age: this.calculateAge(resident.date_of_birth),
      displayName: resident.full_name || 'Không có tên',
      displayRoom: resident.roomNumber || 'Chưa phân phòng',
      displayStatus: resident.status === 'active' ? 'Ổn định' : 'Cần chú ý',
    };
  }

  // Helper method to format medication data
  formatMedicationData(medication) {
    return {
      medication_name: medication.medication_name,
      dosage: medication.dosage,
      frequency: medication.frequency,
      start_date: medication.start_date || new Date().toISOString(),
      end_date: medication.end_date,
      notes: medication.notes,
      status: medication.status || 'active',
    };
  }

  // Helper method to format vital signs data
  formatVitalsData(vitals) {
    return {
      temperature: vitals.temperature,
      heart_rate: vitals.heart_rate,
      blood_pressure: vitals.blood_pressure,
      oxygen_saturation: vitals.oxygen_saturation,
      respiratory_rate: vitals.respiratory_rate,
      date: vitals.date || new Date().toISOString(),
      notes: vitals.notes,
    };
  }
}

export default new ResidentService(); 