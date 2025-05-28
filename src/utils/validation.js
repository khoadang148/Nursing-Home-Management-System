// Validation utilities for professional healthcare data
import { format, isValid, parseISO, differenceInYears } from 'date-fns';

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return { isValid: false, message: 'Email là bắt buộc' };
  if (!emailRegex.test(email)) return { isValid: false, message: 'Định dạng email không hợp lệ' };
  return { isValid: true };
};

// Password validation for healthcare standards
export const validatePassword = (password) => {
  if (!password) return { isValid: false, message: 'Mật khẩu là bắt buộc' };
  if (password.length < 8) return { isValid: false, message: 'Mật khẩu phải có ít nhất 8 ký tự' };
  if (!/(?=.*[a-z])/.test(password)) return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ thường' };
  if (!/(?=.*[A-Z])/.test(password)) return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 chữ hoa' };
  if (!/(?=.*\d)/.test(password)) return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 số' };
  if (!/(?=.*[@$!%*?&])/.test(password)) return { isValid: false, message: 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt' };
  return { isValid: true };
};

// Phone number validation
export const validatePhone = (phone) => {
  const phoneRegex = /^(\+84|0)[0-9]{9,10}$/;
  if (!phone) return { isValid: false, message: 'Số điện thoại là bắt buộc' };
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return { isValid: false, message: 'Số điện thoại không hợp lệ' };
  }
  return { isValid: true };
};

// Medical record number validation
export const validateMedicalRecordNumber = (mrn) => {
  if (!mrn) return { isValid: false, message: 'Số hồ sơ y tế là bắt buộc' };
  if (mrn.length < 6) return { isValid: false, message: 'Số hồ sơ y tế phải có ít nhất 6 ký tự' };
  if (!/^[A-Z0-9]+$/.test(mrn)) return { isValid: false, message: 'Số hồ sơ y tế chỉ được chứa chữ hoa và số' };
  return { isValid: true };
};

// Date of birth validation
export const validateDateOfBirth = (dob) => {
  if (!dob) return { isValid: false, message: 'Ngày sinh là bắt buộc' };
  
  const date = typeof dob === 'string' ? parseISO(dob) : dob;
  if (!isValid(date)) return { isValid: false, message: 'Ngày sinh không hợp lệ' };
  
  const age = differenceInYears(new Date(), date);
  if (age < 0) return { isValid: false, message: 'Ngày sinh không thể trong tương lai' };
  if (age > 120) return { isValid: false, message: 'Tuổi không hợp lệ' };
  if (age < 50) return { isValid: false, message: 'Cư dân phải từ 50 tuổi trở lên' };
  
  return { isValid: true };
};

// Room number validation
export const validateRoomNumber = (roomNumber) => {
  if (!roomNumber) return { isValid: false, message: 'Số phòng là bắt buộc' };
  if (!/^\d{3}[A-Z]?$/.test(roomNumber)) {
    return { isValid: false, message: 'Số phòng phải có định dạng 3 số (ví dụ: 101, 201A)' };
  }
  return { isValid: true };
};

// Medication dosage validation
export const validateMedicationDosage = (dosage) => {
  if (!dosage) return { isValid: false, message: 'Liều lượng là bắt buộc' };
  if (!/^\d+(\.\d+)?\s*(mg|g|ml|mcg|units?)$/i.test(dosage)) {
    return { isValid: false, message: 'Liều lượng phải có định dạng hợp lệ (ví dụ: 10mg, 2.5ml)' };
  }
  return { isValid: true };
};

// Vital signs validation
export const validateVitalSigns = (vitals) => {
  const errors = {};
  
  // Blood pressure
  if (vitals.bloodPressure) {
    const bpRegex = /^\d{2,3}\/\d{2,3}$/;
    if (!bpRegex.test(vitals.bloodPressure)) {
      errors.bloodPressure = 'Huyết áp phải có định dạng SYS/DIA (ví dụ: 120/80)';
    } else {
      const [systolic, diastolic] = vitals.bloodPressure.split('/').map(Number);
      if (systolic < 70 || systolic > 250) errors.bloodPressure = 'Huyết áp tâm thu không hợp lệ (70-250)';
      if (diastolic < 40 || diastolic > 150) errors.bloodPressure = 'Huyết áp tâm trương không hợp lệ (40-150)';
    }
  }
  
  // Heart rate
  if (vitals.heartRate) {
    const hr = Number(vitals.heartRate);
    if (isNaN(hr) || hr < 30 || hr > 200) {
      errors.heartRate = 'Nhịp tim phải từ 30-200 bpm';
    }
  }
  
  // Temperature
  if (vitals.temperature) {
    const temp = Number(vitals.temperature);
    if (isNaN(temp) || temp < 35 || temp > 42) {
      errors.temperature = 'Nhiệt độ phải từ 35-42°C';
    }
  }
  
  // Respiratory rate
  if (vitals.respiratoryRate) {
    const rr = Number(vitals.respiratoryRate);
    if (isNaN(rr) || rr < 8 || rr > 40) {
      errors.respiratoryRate = 'Nhịp thở phải từ 8-40 lần/phút';
    }
  }
  
  // Oxygen saturation
  if (vitals.oxygenSaturation) {
    const spo2 = Number(vitals.oxygenSaturation);
    if (isNaN(spo2) || spo2 < 70 || spo2 > 100) {
      errors.oxygenSaturation = 'SpO2 phải từ 70-100%';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Care plan validation
export const validateCarePlan = (carePlan) => {
  const errors = {};
  
  if (!carePlan.title?.trim()) errors.title = 'Tiêu đề kế hoạch chăm sóc là bắt buộc';
  if (!carePlan.description?.trim()) errors.description = 'Mô tả là bắt buộc';
  if (!carePlan.goals || carePlan.goals.length === 0) errors.goals = 'Phải có ít nhất 1 mục tiêu';
  if (!carePlan.interventions || carePlan.interventions.length === 0) {
    errors.interventions = 'Phải có ít nhất 1 can thiệp';
  }
  
  if (carePlan.startDate) {
    const startDate = typeof carePlan.startDate === 'string' ? parseISO(carePlan.startDate) : carePlan.startDate;
    if (!isValid(startDate)) errors.startDate = 'Ngày bắt đầu không hợp lệ';
  }
  
  if (carePlan.reviewDate) {
    const reviewDate = typeof carePlan.reviewDate === 'string' ? parseISO(carePlan.reviewDate) : carePlan.reviewDate;
    if (!isValid(reviewDate)) errors.reviewDate = 'Ngày đánh giá không hợp lệ';
    
    if (carePlan.startDate && reviewDate <= carePlan.startDate) {
      errors.reviewDate = 'Ngày đánh giá phải sau ngày bắt đầu';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Emergency contact validation
export const validateEmergencyContact = (contact) => {
  const errors = {};
  
  if (!contact.name?.trim()) errors.name = 'Tên người liên hệ là bắt buộc';
  if (!contact.relationship?.trim()) errors.relationship = 'Mối quan hệ là bắt buộc';
  
  const phoneValidation = validatePhone(contact.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
  
  if (contact.email) {
    const emailValidation = validateEmail(contact.email);
    if (!emailValidation.isValid) errors.email = emailValidation.message;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Staff validation
export const validateStaff = (staff) => {
  const errors = {};
  
  if (!staff.firstName?.trim()) errors.firstName = 'Tên là bắt buộc';
  if (!staff.lastName?.trim()) errors.lastName = 'Họ là bắt buộc';
  if (!staff.employeeId?.trim()) errors.employeeId = 'Mã nhân viên là bắt buộc';
  if (!staff.role?.trim()) errors.role = 'Vai trò là bắt buộc';
  if (!staff.department?.trim()) errors.department = 'Khoa/Phòng ban là bắt buộc';
  
  const emailValidation = validateEmail(staff.email);
  if (!emailValidation.isValid) errors.email = emailValidation.message;
  
  const phoneValidation = validatePhone(staff.phone);
  if (!phoneValidation.isValid) errors.phone = phoneValidation.message;
  
  if (staff.licenseNumber && !/^[A-Z0-9]{6,12}$/.test(staff.licenseNumber)) {
    errors.licenseNumber = 'Số giấy phép hành nghề không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Resident validation
export const validateResident = (resident) => {
  const errors = {};
  
  if (!resident.firstName?.trim()) errors.firstName = 'Tên là bắt buộc';
  if (!resident.lastName?.trim()) errors.lastName = 'Họ là bắt buộc';
  
  const dobValidation = validateDateOfBirth(resident.dateOfBirth);
  if (!dobValidation.isValid) errors.dateOfBirth = dobValidation.message;
  
  const roomValidation = validateRoomNumber(resident.roomNumber);
  if (!roomValidation.isValid) errors.roomNumber = roomValidation.message;
  
  if (!resident.careLevel) errors.careLevel = 'Mức độ chăm sóc là bắt buộc';
  
  if (resident.emergencyContact) {
    const contactValidation = validateEmergencyContact(resident.emergencyContact);
    if (!contactValidation.isValid) {
      errors.emergencyContact = contactValidation.errors;
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Activity validation
export const validateActivity = (activity) => {
  const errors = {};
  
  if (!activity.name?.trim()) errors.name = 'Tên hoạt động là bắt buộc';
  if (!activity.description?.trim()) errors.description = 'Mô tả là bắt buộc';
  if (!activity.type) errors.type = 'Loại hoạt động là bắt buộc';
  if (!activity.facilitator?.trim()) errors.facilitator = 'Người hướng dẫn là bắt buộc';
  if (!activity.location?.trim()) errors.location = 'Địa điểm là bắt buộc';
  
  if (activity.duration) {
    const duration = Number(activity.duration);
    if (isNaN(duration) || duration <= 0 || duration > 480) {
      errors.duration = 'Thời lượng phải từ 1-480 phút';
    }
  }
  
  if (activity.maxParticipants) {
    const max = Number(activity.maxParticipants);
    if (isNaN(max) || max <= 0 || max > 100) {
      errors.maxParticipants = 'Số người tham gia tối đa phải từ 1-100';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Medication validation
export const validateMedication = (medication) => {
  const errors = {};
  
  if (!medication.name?.trim()) errors.name = 'Tên thuốc là bắt buộc';
  if (!medication.dosage?.trim()) {
    errors.dosage = 'Liều lượng là bắt buộc';
  } else {
    const dosageValidation = validateMedicationDosage(medication.dosage);
    if (!dosageValidation.isValid) errors.dosage = dosageValidation.message;
  }
  
  if (!medication.frequency?.trim()) errors.frequency = 'Tần suất là bắt buộc';
  if (!medication.route?.trim()) errors.route = 'Đường dùng là bắt buộc';
  if (!medication.prescribedBy?.trim()) errors.prescribedBy = 'Bác sĩ kê đơn là bắt buộc';
  
  if (medication.startDate) {
    const startDate = typeof medication.startDate === 'string' ? parseISO(medication.startDate) : medication.startDate;
    if (!isValid(startDate)) errors.startDate = 'Ngày bắt đầu không hợp lệ';
  }
  
  if (medication.endDate) {
    const endDate = typeof medication.endDate === 'string' ? parseISO(medication.endDate) : medication.endDate;
    if (!isValid(endDate)) errors.endDate = 'Ngày kết thúc không hợp lệ';
    
    if (medication.startDate && endDate <= medication.startDate) {
      errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Task validation
export const validateTask = (task) => {
  const errors = {};
  
  if (!task.title?.trim()) errors.title = 'Tiêu đề nhiệm vụ là bắt buộc';
  if (!task.description?.trim()) errors.description = 'Mô tả là bắt buộc';
  if (!task.assignedTo?.trim()) errors.assignedTo = 'Người được giao là bắt buộc';
  if (!task.priority) errors.priority = 'Mức độ ưu tiên là bắt buộc';
  if (!task.category) errors.category = 'Danh mục là bắt buộc';
  
  if (task.dueDate) {
    const dueDate = typeof task.dueDate === 'string' ? parseISO(task.dueDate) : task.dueDate;
    if (!isValid(dueDate)) errors.dueDate = 'Ngày hạn không hợp lệ';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generic form validation helper
export const validateForm = (data, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = validationRules[field];
    const value = data[field];
    
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = rules.requiredMessage || `${field} là bắt buộc`;
      return;
    }
    
    // Skip other validations if field is empty and not required
    if (!value) return;
    
    // Custom validation function
    if (rules.validate) {
      const result = rules.validate(value);
      if (!result.isValid) {
        errors[field] = result.message;
        return;
      }
    }
    
    // Min length validation
    if (rules.minLength && value.length < rules.minLength) {
      errors[field] = `${field} phải có ít nhất ${rules.minLength} ký tự`;
      return;
    }
    
    // Max length validation
    if (rules.maxLength && value.length > rules.maxLength) {
      errors[field] = `${field} không được vượt quá ${rules.maxLength} ký tự`;
      return;
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
      errors[field] = rules.patternMessage || `${field} không đúng định dạng`;
      return;
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePhone,
  validateMedicalRecordNumber,
  validateDateOfBirth,
  validateRoomNumber,
  validateMedicationDosage,
  validateVitalSigns,
  validateCarePlan,
  validateEmergencyContact,
  validateStaff,
  validateResident,
  validateActivity,
  validateMedication,
  validateTask,
  validateForm
}; 