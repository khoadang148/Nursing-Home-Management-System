import { apiRequest } from '../config/axiosConfig';
import { API_CONFIG, buildUrl } from '../config/apiConfig';

class ResidentService {
  // Get all residents
  async getAllResidents() {
    try {
      const response = await apiRequest.get(API_CONFIG.ENDPOINTS.RESIDENT.LIST);
      
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
      const response = await apiRequest.get(url);
      
      if (response.data && response.data._id) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: 'Resident not found',
        };
      }
    } catch (error) {
      console.error('Get resident by ID error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Không thể lấy thông tin người cao tuổi',
      };
    }
  }

  // Get residents by family member ID
  async getResidentsByFamilyMember(familyMemberId) {
    try {
      const url = buildUrl(API_CONFIG.ENDPOINTS.RESIDENT.BY_FAMILY_MEMBER, { familyMemberId });
      const response = await apiRequest.get(url);
      
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
      const response = await apiRequest.post(API_CONFIG.ENDPOINTS.RESIDENT.CREATE, residentData);
      
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
      const response = await apiRequest.patch(url, updateData);
      
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
      const response = await apiRequest.delete(url);
      
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
}

export default new ResidentService(); 