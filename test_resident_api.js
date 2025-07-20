const axios = require('axios');

// API Configuration
const API_BASE_URL = 'http://192.168.1.13:8000'; // Thay đổi IP theo máy của bạn
const RESIDENT_ENDPOINTS = {
  LIST: '/residents',
  CREATE: '/residents',
  DETAIL: (id) => `/residents/${id}`,
  UPDATE: (id) => `/residents/${id}`,
  DELETE: (id) => `/residents/${id}`,
  BY_FAMILY_MEMBER: (familyMemberId) => `/residents/family-member/${familyMemberId}`,
};

// Test data
const testResident = {
  full_name: "Nguyễn Văn Nam",
  date_of_birth: "1950-05-15",
  gender: "male",
  avatar: "https://example.com/avatar.jpg",
  admission_date: "2024-01-10",
  discharge_date: "2024-06-01",
  family_member_id: "664f1b2c2f8b2c0012a4e750",
  relationship: "con gái",
  medical_history: "Cao huyết áp, tiểu đường type 2",
  current_medications: [
    {
      medication_name: "Aspirin",
      dosage: "81mg",
      frequency: "Sáng"
    }
  ],
  allergies: ["Dị ứng hải sản"],
  emergency_contact: {
    name: "Nguyễn Văn A",
    phone: "0987654321",
    relationship: "con gái"
  },
  status: "active"
};

const updatedResident = {
  full_name: "Nguyễn Văn Nam (Cập nhật)",
  date_of_birth: "1950-05-15",
  gender: "male",
  avatar: "https://example.com/avatar-updated.jpg",
  admission_date: "2024-01-10",
  discharge_date: "2024-06-01",
  family_member_id: "664f1b2c2f8b2c0012a4e750",
  relationship: "con gái",
  medical_history: "Cao huyết áp, tiểu đường type 2 - Đã cập nhật",
  current_medications: [
    {
      medication_name: "Aspirin",
      dosage: "100mg",
      frequency: "Sáng"
    }
  ],
  allergies: ["Dị ứng hải sản", "Penicillin"],
  emergency_contact: {
    name: "Nguyễn Văn A",
    phone: "0987654321",
    relationship: "con gái"
  },
  status: "active"
};

// Helper function để tạo axios instance với auth
const createAuthInstance = (token) => {
  return axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
};

// Test functions
async function testLogin() {
  try {
    console.log('🔐 Testing login...');
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email: 'admin@gmail.com',
      password: '123456',
    });
    
    if (response.data.access_token) {
      console.log('✅ Login successful');
      return response.data.access_token;
    } else {
      console.log('❌ Login failed');
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetAllResidents(token) {
  try {
    console.log('\n📋 Testing GET /residents...');
    const authInstance = createAuthInstance(token);
    const response = await authInstance.get(RESIDENT_ENDPOINTS.LIST);
    
    console.log('✅ Get all residents successful');
    console.log(`📊 Found ${response.data.length} residents`);
    console.log('📝 Sample resident:', response.data[0]);
    
    return response.data;
  } catch (error) {
    console.error('❌ Get all residents error:', error.response?.data || error.message);
    return null;
  }
}

async function testCreateResident(token) {
  try {
    console.log('\n➕ Testing POST /residents...');
    const authInstance = createAuthInstance(token);
    const response = await authInstance.post(RESIDENT_ENDPOINTS.CREATE, testResident);
    
    console.log('✅ Create resident successful');
    console.log('📝 Created resident:', response.data);
    
    return response.data._id;
  } catch (error) {
    console.error('❌ Create resident error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetResidentById(token, residentId) {
  try {
    console.log(`\n🔍 Testing GET /residents/${residentId}...`);
    const authInstance = createAuthInstance(token);
    const response = await authInstance.get(RESIDENT_ENDPOINTS.DETAIL(residentId));
    
    console.log('✅ Get resident by ID successful');
    console.log('📝 Resident details:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Get resident by ID error:', error.response?.data || error.message);
    return null;
  }
}

async function testGetResidentsByFamilyMember(token, familyMemberId) {
  try {
    console.log(`\n👨‍👩‍👧‍👦 Testing GET /residents/family-member/${familyMemberId}...`);
    const authInstance = createAuthInstance(token);
    const response = await authInstance.get(RESIDENT_ENDPOINTS.BY_FAMILY_MEMBER(familyMemberId));
    
    console.log('✅ Get residents by family member successful');
    console.log(`📊 Found ${response.data.length} residents for family member`);
    console.log('📝 Residents:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Get residents by family member error:', error.response?.data || error.message);
    return null;
  }
}

async function testUpdateResident(token, residentId) {
  try {
    console.log(`\n✏️ Testing PATCH /residents/${residentId}...`);
    const authInstance = createAuthInstance(token);
    const response = await authInstance.patch(RESIDENT_ENDPOINTS.UPDATE(residentId), updatedResident);
    
    console.log('✅ Update resident successful');
    console.log('📝 Updated resident:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Update resident error:', error.response?.data || error.message);
    return null;
  }
}

async function testDeleteResident(token, residentId) {
  try {
    console.log(`\n🗑️ Testing DELETE /residents/${residentId}...`);
    const authInstance = createAuthInstance(token);
    const response = await authInstance.delete(RESIDENT_ENDPOINTS.DELETE(residentId));
    
    console.log('✅ Delete resident successful');
    console.log('📝 Response:', response.data);
    
    return true;
  } catch (error) {
    console.error('❌ Delete resident error:', error.response?.data || error.message);
    return false;
  }
}

// Main test function
async function runResidentTests() {
  console.log('🚀 Starting Resident API Tests...\n');
  
  // Step 1: Login
  const token = await testLogin();
  if (!token) {
    console.log('❌ Cannot proceed without authentication');
    return;
  }
  
  // Step 2: Get all residents
  const residents = await testGetAllResidents(token);
  if (!residents) {
    console.log('❌ Cannot proceed without getting residents');
    return;
  }
  
  // Step 3: Create new resident
  const newResidentId = await testCreateResident(token);
  if (!newResidentId) {
    console.log('❌ Cannot proceed without creating resident');
    return;
  }
  
  // Step 4: Get resident by ID
  await testGetResidentById(token, newResidentId);
  
  // Step 5: Get residents by family member (using the family_member_id from test data)
  await testGetResidentsByFamilyMember(token, testResident.family_member_id);
  
  // Step 6: Update resident
  await testUpdateResident(token, newResidentId);
  
  // Step 7: Verify update
  await testGetResidentById(token, newResidentId);
  
  // Step 8: Delete resident
  await testDeleteResident(token, newResidentId);
  
  // Step 9: Verify deletion
  console.log('\n🔍 Verifying deletion...');
  const authInstance = createAuthInstance(token);
  try {
    await authInstance.get(RESIDENT_ENDPOINTS.DETAIL(newResidentId));
    console.log('❌ Resident still exists after deletion');
  } catch (error) {
    if (error.response?.status === 404) {
      console.log('✅ Resident successfully deleted');
    } else {
      console.log('❌ Unexpected error during deletion verification');
    }
  }
  
  console.log('\n🎉 Resident API Tests Completed!');
}

// Run tests
runResidentTests().catch(console.error); 