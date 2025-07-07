/**
 * Mapper để chuyển đổi dữ liệu từ MongoDB sang cấu trúc dữ liệu ứng dụng
 * Giúp tách biệt cấu trúc dữ liệu backend và frontend
 */

/**
 * Chuyển đổi dữ liệu resident từ MongoDB sang định dạng ứng dụng
 * @param {Object} mongoResident - Dữ liệu resident từ MongoDB
 * @returns {Object} - Dữ liệu resident theo định dạng ứng dụng
 */
export const mapMongoResidentToAppResident = (mongoResident) => {
  if (!mongoResident) return null;

  // Lấy thông tin phòng từ bed_assignments
  let roomInfo = { number: 'Chưa phân phòng', type: 'N/A' };
  
  if (mongoResident.bed_assignment && mongoResident.bed_assignment.bed) {
    const { room } = mongoResident.bed_assignment.bed;
    roomInfo = {
      number: room.room_number || 'N/A',
      type: room.room_type || 'N/A',
    };
  }

  return {
    id: mongoResident._id,
    name: mongoResident.full_name,
    room: roomInfo.number,
    roomType: roomInfo.type,
    dateOfBirth: mongoResident.date_of_birth,
    gender: mongoResident.gender,
    careLevel: mongoResident.care_level,
    admissionDate: mongoResident.admission_date,
  };
};

/**
 * Chuyển đổi danh sách residents từ MongoDB sang định dạng ứng dụng
 * @param {Array} mongoResidents - Danh sách residents từ MongoDB
 * @returns {Array} - Danh sách residents theo định dạng ứng dụng
 */
export const mapMongoResidentsToAppResidents = (mongoResidents) => {
  if (!mongoResidents || !Array.isArray(mongoResidents)) return [];
  
  return mongoResidents.map(mapMongoResidentToAppResident);
};

/**
 * Chuyển đổi dữ liệu bill item từ MongoDB sang định dạng ứng dụng
 * @param {Object} mongoBillItem - Dữ liệu bill item từ MongoDB
 * @returns {Object} - Dữ liệu bill item theo định dạng ứng dụng
 */
const mapMongoBillItemToAppBillItem = (mongoBillItem) => {
  let type = 'other';
  
  // Xác định loại item dựa vào dữ liệu MongoDB
  if (mongoBillItem.type === 'care_plan' || mongoBillItem.plan_type) {
    type = 'care_plan';
  } else if (mongoBillItem.type === 'room' || mongoBillItem.room_type) {
    type = 'room';
  } else if (mongoBillItem.type === 'supplementary' || mongoBillItem.category === 'supplementary') {
    type = 'supplementary';
  } else if (mongoBillItem.type === 'medication' || mongoBillItem.medication_name) {
    type = 'medication';
  }
  
  return {
    name: mongoBillItem.name || mongoBillItem.plan_name || mongoBillItem.item_name || 'Không có tên',
    amount: mongoBillItem.amount || mongoBillItem.price || mongoBillItem.monthly_price || 0,
    type,
    description: mongoBillItem.description || '',
  };
};

/**
 * Tạo các bill items từ care_plan_assignment MongoDB
 * @param {Object} assignment - care_plan_assignment từ MongoDB
 * @returns {Array} - Danh sách bill items theo định dạng ứng dụng
 */
const createBillItemsFromAssignment = (assignment, carePlans, roomTypes) => {
  const items = [];
  
  // Thêm các gói chăm sóc
  if (assignment.care_plan_ids && Array.isArray(assignment.care_plan_ids)) {
    assignment.care_plan_ids.forEach(planId => {
      const plan = carePlans.find(p => p._id.toString() === planId.toString());
      if (plan) {
        items.push({
          name: plan.plan_name,
          amount: plan.monthly_price,
          type: 'care_plan',
          description: plan.description,
        });
      }
    });
  }
  
  // Thêm chi phí phòng
  if (assignment.selected_room_type && roomTypes) {
    const roomType = roomTypes.find(r => r.room_type === assignment.selected_room_type);
    if (roomType) {
      items.push({
        name: roomType.type_name,
        amount: roomType.monthly_price,
        type: 'room',
        description: `Chi phí phòng ${roomType.type_name}`,
      });
    }
  }
  
  // Thêm các thuốc bổ sung
  if (assignment.additional_medications && Array.isArray(assignment.additional_medications)) {
    const medicationItem = {
      name: 'Thuốc và vật tư y tế',
      amount: 0, // Giá thuốc sẽ được tính riêng trong billing
      type: 'medication',
      description: 'Chi phí thuốc và vật tư y tế theo chỉ định',
    };
    items.push(medicationItem);
  }
  
  return items;
};

/**
 * Chuyển đổi dữ liệu bill từ MongoDB sang định dạng ứng dụng
 * @param {Object} mongoBill - Dữ liệu bill từ MongoDB
 * @param {Object} options - Các tùy chọn bổ sung (resident, care_plan_assignment, etc.)
 * @returns {Object} - Dữ liệu bill theo định dạng ứng dụng
 */
export const mapMongoBillToAppBill = (mongoBill, options = {}) => {
  if (!mongoBill) return null;
  
  const { residents = [], carePlans = [], roomTypes = [] } = options;
  
  // Tìm resident liên quan
  const resident = residents.find(r => r._id.toString() === mongoBill.resident_id?.toString());
  
  // Tìm care plan assignment liên quan
  const assignment = options.assignments?.find(a => 
    a._id.toString() === mongoBill.care_plan_assignment_id?.toString()
  );
  
  // Xác định thời gian hóa đơn (tháng/năm)
  const billDate = new Date(mongoBill.created_at || mongoBill.createdAt);
  const period = `${billDate.getFullYear()}-${String(billDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Tạo các bill items
  let items = [];
  
  // Nếu có sẵn items trong mongoBill
  if (mongoBill.items && Array.isArray(mongoBill.items)) {
    items = mongoBill.items.map(mapMongoBillItemToAppBillItem);
  } 
  // Nếu không có items, tạo từ care_plan_assignment
  else if (assignment) {
    items = createBillItemsFromAssignment(assignment, carePlans, roomTypes);
  }
  
  // Map resident
  const mappedResident = resident ? {
    id: resident._id.toString(),
    name: resident.full_name,
    room: resident.room_number || 'N/A',
  } : {
    id: mongoBill.resident_id?.toString() || 'unknown',
    name: 'Không xác định',
    room: 'N/A',
  };
  
  return {
    id: mongoBill._id.toString(),
    title: mongoBill.title || `Phí chăm sóc tháng ${billDate.getMonth() + 1}/${billDate.getFullYear()}`,
    resident: mappedResident,
    amount: mongoBill.amount,
    dueDate: mongoBill.due_date || mongoBill.dueDate,
    status: mongoBill.status,
    type: mongoBill.type || 'monthly',
    description: mongoBill.notes || mongoBill.description || '',
    createdAt: mongoBill.created_at || mongoBill.createdAt,
    paymentDate: mongoBill.paid_date || mongoBill.paymentDate,
    paymentMethod: mongoBill.payment_method || mongoBill.paymentMethod,
    period,
    items,
  };
};

/**
 * Chuyển đổi danh sách bills từ MongoDB sang định dạng ứng dụng
 * @param {Array} mongoBills - Danh sách bills từ MongoDB
 * @param {Object} options - Các tùy chọn bổ sung
 * @returns {Array} - Danh sách bills theo định dạng ứng dụng
 */
export const mapMongoBillsToAppBills = (mongoBills, options = {}) => {
  if (!mongoBills || !Array.isArray(mongoBills)) return [];
  
  return mongoBills.map(bill => mapMongoBillToAppBill(bill, options));
};

/**
 * Chuyển đổi phương thức thanh toán từ MongoDB sang định dạng ứng dụng
 * @param {Array} mongoPaymentMethods - Danh sách phương thức thanh toán từ MongoDB
 * @returns {Array} - Danh sách phương thức thanh toán theo định dạng ứng dụng
 */
export const mapMongoPaymentMethodsToAppPaymentMethods = (mongoPaymentMethods) => {
  if (!mongoPaymentMethods || !Array.isArray(mongoPaymentMethods)) return [];
  
  const iconMap = {
    'cash': 'cash-outline',
    'bank_transfer': 'swap-horizontal-outline',
    'credit_card': 'card-outline',
    'other': 'wallet-outline',
  };
  
  return mongoPaymentMethods.map(method => ({
    id: method.code || method._id.toString(),
    name: method.name || method.payment_method,
    icon: iconMap[method.code] || 'wallet-outline',
    // Thêm các thông tin khác nếu có
    banks: method.banks || [],
    providers: method.providers || [],
  }));
};

export default {
  mapMongoResidentToAppResident,
  mapMongoResidentsToAppResidents,
  mapMongoBillToAppBill,
  mapMongoBillsToAppBills,
  mapMongoPaymentMethodsToAppPaymentMethods,
}; 