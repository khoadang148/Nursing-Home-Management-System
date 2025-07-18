import { apiService } from './apiService';
import { carePlans, roomTypes, residents, carePlanAssignments } from './mockData';

// Lấy danh sách tất cả gói dịch vụ chăm sóc
export const getCarePlans = async () => {
  try {
    // Sử dụng mock data cho development
    return carePlans;
    
    // Uncomment khi có API thật
    // const response = await apiService.get('/care-plans');
    // return response.data;
  } catch (error) {
    console.error('Error fetching care plans:', error);
    throw error;
  }
};

// Lấy gói dịch vụ theo loại (main hoặc supplementary)
export const getCarePlansByCategory = async (category) => {
  try {
    const response = await apiService.get(`/care-plans?category=${category}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching care plans by category:', error);
    throw error;
  }
};

// Lấy danh sách phòng có sẵn
export const getAvailableRooms = async () => {
  try {
    const response = await apiService.get('/rooms?status=available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available rooms:', error);
    throw error;
  }
};

// Lấy danh sách giường có sẵn
export const getAvailableBeds = async () => {
  try {
    const response = await apiService.get('/beds?status=available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available beds:', error);
    throw error;
  }
};

// Lấy thông tin loại phòng và giá
export const getRoomTypes = async () => {
  try {
    // Sử dụng mock data cho development
    return roomTypes;
    
    // Uncomment khi có API thật
    // const response = await apiService.get('/room-types');
    // return response.data;
  } catch (error) {
    console.error('Error fetching room types:', error);
    throw error;
  }
};

// Lấy danh sách cư dân (residents)
export const getResidents = async () => {
  try {
    // Sử dụng mock data cho development
    return residents;
    
    // Uncomment khi có API thật
    // const response = await apiService.get('/residents');
    // return response.data;
  } catch (error) {
    console.error('Error fetching residents:', error);
    throw error;
  }
};

// Tạo đăng ký gói dịch vụ mới
export const createCarePlanAssignment = async (assignmentData) => {
  try {
    // Sử dụng mock data cho development
    const newAssignment = {
      _id: `assignment_${Date.now()}`,
      ...assignmentData,
      created_at: new Date(),
      updated_at: new Date()
    };
    
    // Trong thực tế, đây sẽ được lưu vào database
    console.log('Created care plan assignment:', newAssignment);
    return newAssignment;
    
    // Uncomment khi có API thật
    // const response = await apiService.post('/care-plan-assignments', assignmentData);
    // return response.data;
  } catch (error) {
    console.error('Error creating care plan assignment:', error);
    throw error;
  }
};

// Cập nhật đăng ký gói dịch vụ
export const updateCarePlanAssignment = async (assignmentId, updateData) => {
  try {
    const response = await apiService.put(`/care-plan-assignments/${assignmentId}`, updateData);
    return response.data;
  } catch (error) {
    console.error('Error updating care plan assignment:', error);
    throw error;
  }
};

// Lấy danh sách đăng ký gói dịch vụ
export const getCarePlanAssignments = async () => {
  try {
    // Sử dụng mock data cho development
    return carePlanAssignments;
    
    // Uncomment khi có API thật
    // const response = await apiService.get('/care-plan-assignments');
    // return response.data;
  } catch (error) {
    console.error('Error fetching care plan assignments:', error);
    throw error;
  }
};

// Lấy chi tiết đăng ký gói dịch vụ
export const getCarePlanAssignmentById = async (assignmentId) => {
  try {
    const response = await apiService.get(`/care-plan-assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching care plan assignment:', error);
    throw error;
  }
};

// Tính toán giá tiền dựa trên gói dịch vụ và loại phòng
export const calculateTotalCost = (selectedCarePlans, selectedRoomType, roomTypes) => {
  let carePlansCost = 0;
  let roomCost = 0;

  // Tính tổng chi phí gói dịch vụ
  if (selectedCarePlans && selectedCarePlans.length > 0) {
    carePlansCost = selectedCarePlans.filter(Boolean).reduce((total, plan) => {
      return total + (plan?.monthly_price || 0);
    }, 0);
  }

  // Tính chi phí phòng
  if (selectedRoomType && roomTypes) {
    const roomType = roomTypes.filter(Boolean).find(rt => rt.room_type === selectedRoomType);
    if (roomType) {
      roomCost = roomType?.monthly_price || 0;
    }
  }

  return {
    carePlansCost,
    roomCost,
    totalCost: carePlansCost + roomCost
  };
}; 