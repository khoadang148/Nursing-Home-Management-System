/**
 * MOCK DATA CHO NHMS MOBILE APP
 * Dựa trên schema MongoDB thực tế từ nhms_setup_redesigned.js
 * Đồng bộ với dữ liệu mẫu nhms_sample_data_redesigned.js
 * 
 * Các trường chính:
 * - category: 'main' | 'supplementary' (thay vì type)
 * - care_plan_assignment_id: Tham chiếu đến assignment
 * - resident_id, family_member_id: Tham chiếu thực tế
 * - Status tính toán từ pending + due_date = overdue
 */

// Mock ObjectIds for development
const ObjectId = () => Math.random().toString(36).substr(2, 24);

// === MOCK USERS (users collection) ===
export const MOCK_USERS = [
  // Admin users
  {
    _id: "admin_001",
    full_name: "Nguyễn Văn Admin",
    email: "admin@nhms.com",
    phone: "0901234567",
    username: "admin",
    password: "$2a$10$hashedpassword123",
    role: "admin",
    is_super_admin: true,
    notes: "Super administrator of the system",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  // Staff users
  {
    _id: "staff_nurse_001",
    full_name: "Lê Văn Nurse",
    email: "nurse1@nhms.com",
    phone: "0901234569",
    username: "nurse1",
    password: "$2a$10$hashedpassword789",
    role: "staff",
    position: "Điều dưỡng",
    qualification: "Cử nhân Điều dưỡng",
    join_date: new Date("2023-01-15"),
    notes: "Experienced nurse specializing in elderly care",
    created_at: new Date("2023-01-15"),
    updated_at: new Date("2023-01-15")
  },
  {
    _id: "staff_doctor_001",
    full_name: "Phạm Thị Doctor",
    email: "doctor1@nhms.com",
    phone: "0901234570",
    username: "doctor1",
    password: "$2a$10$hashedpassword101",
    role: "staff",
    position: "Bác sĩ",
    qualification: "Thạc sĩ Y khoa",
    join_date: new Date("2022-06-01"),
    notes: "Geriatric specialist",
    created_at: new Date("2022-06-01"),
    updated_at: new Date("2022-06-01")
  },
  // Family member users
  {
    _id: "family_001",
    full_name: "Nguyễn Thị Hoa",
    email: "hoa.nguyen@gmail.com",
    phone: "0912345678",
    username: "family1",
    password: "$2a$10$hashedpassword303",
    role: "family",
    relationship: "con gái",
    residents: ["1"],
    address: "123 Đường ABC, Quận 1, TP.HCM",
    notes: "Primary contact for resident Nguyễn Văn Nam",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "family_002",
    full_name: "Trần Văn Minh",
    email: "minh.tran@gmail.com",
    phone: "0912345679",
    username: "family2",
    password: "$2a$10$hashedpassword404",
    role: "family",
    relationship: "con trai",
    residents: ["2"],
    address: "456 Đường XYZ, Quận 3, TP.HCM",
    notes: "Son of resident Trần Thị Lan",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "family_003",
    full_name: "Lê Thị Cúc",
    email: "cuc.le@gmail.com",
    phone: "0918765432",
    username: "family3",
    password: "$2a$10$hashedpassword505",
    role: "family",
    relationship: "con gái",
    residents: ["3"],
    address: "789 Đường DEF, Quận 7, TP.HCM",
    notes: "Daughter of resident Lê Văn Hoàng",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  }
];

// === MOCK RESIDENTS (residents collection) ===
export const MOCK_RESIDENTS = [
  {
    _id: "1",
    full_name: "Nguyễn Văn Nam",
    date_of_birth: new Date("1950-05-15"),
    gender: "male",
    admission_date: new Date("2024-01-10"),
    discharge_date: null,
    family_member_id: "family_001",
    medical_history: "Cao huyết áp, tiểu đường type 2",
    current_medications: [
      {
        medication_name: "Metformin",
        dosage: "500mg",
        frequency: "2 lần/ngày"
      },
      {
        medication_name: "Lisinopril",
        dosage: "10mg",
        frequency: "1 lần/ngày"
      }
    ],
    allergies: ["Penicillin"],
    emergency_contact: {
      name: "Nguyễn Thị Hoa",
      phone: "0912345678",
      relationship: "con gái"
    },
    care_level: "intermediate",
    status: "active",
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-10")
  },
  {
    _id: "2",
    full_name: "Trần Thị Lan",
    date_of_birth: new Date("1948-12-03"),
    gender: "female",
    admission_date: new Date("2024-02-15"),
    discharge_date: null,
    family_member_id: "family_002",
    medical_history: "Viêm khớp, suy tim nhẹ",
    current_medications: [
      {
        medication_name: "Ibuprofen",
        dosage: "400mg",
        frequency: "3 lần/ngày"
      },
      {
        medication_name: "Enalapril",
        dosage: "5mg",
        frequency: "2 lần/ngày"
      }
    ],
    allergies: ["Aspirin"],
    emergency_contact: {
      name: "Trần Văn Minh",
      phone: "0912345679",
      relationship: "con trai"
    },
    care_level: "intensive",
    status: "active",
    created_at: new Date("2024-02-15"),
    updated_at: new Date("2024-02-15")
  },
  {
    _id: "3",
    full_name: "Lê Văn Hoàng",
    date_of_birth: new Date("1945-08-25"),
    gender: "male",
    admission_date: new Date("2024-03-01"),
    discharge_date: null,
    family_member_id: "family_003",
    medical_history: "Sa sút trí tuệ giai đoạn vừa, huyết áp thấp",
    current_medications: [
      {
        medication_name: "Donepezil",
        dosage: "5mg",
        frequency: "1 lần/ngày"
      }
    ],
    allergies: [],
    emergency_contact: {
      name: "Lê Thị Cúc",
      phone: "0918765432",
      relationship: "con gái"
    },
    care_level: "intensive",
    status: "active",
    created_at: new Date("2024-03-01"),
    updated_at: new Date("2024-03-01")
  }
];

// === MOCK CARE PLANS (care_plans collection) ===
export const MOCK_CARE_PLANS = [
  // === GÓI CHĂM SÓC CHÍNH (MAIN PACKAGES) ===
  {
    _id: "care_plan_main_001",
    plan_name: "Gói Chăm Sóc Tiêu Chuẩn",
    description: "Gói chăm sóc cơ bản cho người cao tuổi có sức khỏe ổn định",
    monthly_price: 6000000, // 6 triệu VND/tháng
    plan_type: "cham_soc_tieu_chuan",
    category: "main", // ← QUAN TRỌNG: category thay vì type
    services_included: [
      "Kiểm tra sức khỏe định kỳ",
      "Bác sĩ thăm khám 1 lần/tuần",
      "Hỗ trợ sinh hoạt hàng ngày",
      "Bữa ăn đầy đủ dinh dưỡng",
      "Thuốc cơ bản",
      "Hoạt động vui chơi giải trí",
      "Tư vấn sức khỏe"
    ],
    staff_ratio: "1:8",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Sức khỏe ổn định", "Tự chăm sóc cơ bản"],
    contraindications: [],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_main_002",
    plan_name: "Gói Chăm Sóc Tích Cực",
    description: "Chăm sóc tích cực cho người cao tuổi cần hỗ trợ y tế thường xuyên",
    monthly_price: 9000000, // 9 triệu VND/tháng
    plan_type: "cham_soc_tich_cuc",
    category: "main", // ← QUAN TRỌNG: category = main
    services_included: [
      "Theo dõi sức khỏe thường xuyên",
      "Bác sĩ thăm khám 2 lần/tuần",
      "Điều dưỡng có mặt trong giờ hành chính",
      "Vật lý trị liệu nhóm",
      "Chế độ ăn dinh dưỡng cân bằng",
      "Thuốc cơ bản theo đơn",
      "Hoạt động giải trí hàng ngày"
    ],
    staff_ratio: "1:5",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Cần hỗ trợ y tế", "Bệnh mãn tính ổn định"],
    contraindications: [],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_main_003",
    plan_name: "Gói Chăm Sóc Đặc Biệt",
    description: "Dành cho những người cao tuổi cần chăm sóc đặc biệt với tình trạng sức khỏe phức tạp",
    monthly_price: 12000000, // 12 triệu VND/tháng
    plan_type: "cham_soc_dac_biet",
    category: "main", // ← QUAN TRỌNG: category = main
    services_included: [
      "Theo dõi sức khỏe 24/7",
      "Bác sĩ chuyên khoa thăm khám hàng tuần",
      "Điều dưỡng chuyên nghiệp túc trực",
      "Vật lý trị liệu cá nhân hóa",
      "Dinh dưỡng theo chỉ định bác sĩ",
      "Thuốc và thiết bị y tế chuyên dụng",
      "Tư vấn tâm lý cá nhân"
    ],
    staff_ratio: "1:3",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Tình trạng sức khỏe phức tạp", "Cần theo dõi liên tục"],
    contraindications: [],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_main_004",
    plan_name: "Gói Chăm Sóc Sa Sút Trí Tuệ",
    description: "Chăm sóc chuyên biệt cho người cao tuổi mắc chứng sa sút trí tuệ",
    monthly_price: 10000000, // 10 triệu VND/tháng
    plan_type: "cham_soc_sa_sut_tri_tue",
    category: "main", // ← QUAN TRỌNG: category = main
    services_included: [
      "Theo dõi hành vi 24/7",
      "Bác sĩ thần kinh thăm khám định kỳ",
      "Nhân viên được đào tạo chuyên biệt",
      "Liệu pháp nhận thức",
      "Môi trường an toàn, thân thiện",
      "Thuốc điều trị chuyên khoa",
      "Hỗ trợ gia đình",
      "Hoạt động kích thích trí nhớ"
    ],
    staff_ratio: "1:4",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Chẩn đoán sa sút trí tuệ"],
    contraindications: [],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },

  // === GÓI DỊCH VỤ PHỤ (SUPPLEMENTARY PACKAGES) ===
  {
    _id: "care_plan_supp_001",
    plan_name: "Dịch Vụ Hỗ Trợ Dinh Dưỡng",
    description: "Dịch vụ cho ăn qua sonde cho bệnh nhân không thể ăn bình thường",
    monthly_price: 1500000, // 1.5 triệu VND/tháng
    plan_type: "ho_tro_dinh_duong",
    category: "supplementary", // ← QUAN TRỌNG: category = supplementary
    services_included: [
      "Cho ăn qua sonde theo lịch trình",
      "Vệ sinh và chăm sóc ống sonde",
      "Theo dõi dinh dưỡng",
      "Báo cáo tình trạng hàng ngày"
    ],
    staff_ratio: "chuyên biệt",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Có ống sonde", "Chỉ định của bác sĩ"],
    contraindications: ["Nhiễm trùng đường tiêu hóa"],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_supp_002",
    plan_name: "Chăm Sóc Vết Thương",
    description: "Chăm sóc và thay băng vết thương chuyên nghiệp",
    monthly_price: 2000000, // 2 triệu VND/tháng
    plan_type: "cham_soc_vet_thuong",
    category: "supplementary", // ← QUAN TRỌNG: category = supplementary
    services_included: [
      "Thay băng vết thương hàng ngày",
      "Sát trùng và vệ sinh vết thương",
      "Theo dõi quá trình lành vết thương",
      "Báo cáo tiến triển cho bác sĩ"
    ],
    staff_ratio: "chuyên biệt",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Có vết thương cần chăm sóc"],
    contraindications: ["Dị ứng với thuốc bôi"],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_supp_003",
    plan_name: "Vật Lý Trị Liệu",
    description: "Vật lý trị liệu cá nhân hóa để phục hồi chức năng vận động",
    monthly_price: 2500000, // 2.5 triệu VND/tháng
    plan_type: "vat_ly_tri_lieu",
    category: "supplementary", // ← QUAN TRỌNG: category = supplementary
    services_included: [
      "Đánh giá chức năng vận động",
      "Bài tập vật lý trị liệu cá nhân",
      "Massage y học",
      "Tư vấn về hoạt động hàng ngày"
    ],
    staff_ratio: "1:1 (trong session)",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Cần phục hồi chức năng"],
    contraindications: ["Cấm vận động"],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_supp_004",
    plan_name: "Chăm Sóc Bệnh Tiểu Đường",
    description: "Chăm sóc chuyên biệt cho người mắc bệnh tiểu đường",
    monthly_price: 1500000, // 1.5 triệu VND/tháng
    plan_type: "cham_soc_tieu_duong",
    category: "supplementary", // ← QUAN TRỌNG: category = supplementary
    services_included: [
      "Theo dõi đường huyết hàng ngày",
      "Chế độ ăn kiêng chuyên biệt",
      "Giáo dục về bệnh tiểu đường",
      "Chăm sóc chân đặc biệt"
    ],
    staff_ratio: "chuyên biệt",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Chẩn đoán tiểu đường"],
    contraindications: [],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "care_plan_supp_005",
    plan_name: "Phục Hồi Chức Năng",
    description: "Chương trình phục hồi chức năng sau bệnh tật hoặc chấn thương",
    monthly_price: 3000000, // 3 triệu VND/tháng
    plan_type: "phuc_hoi_chuc_nang",
    category: "supplementary", // ← QUAN TRỌNG: category = supplementary
    services_included: [
      "Đánh giá khả năng vận động",
      "Lập kế hoạch phục hồi cá nhân",
      "Tập luyện vận động cơ bản",
      "Theo dõi tiến độ phục hồi"
    ],
    staff_ratio: "1:2",
    duration_type: "monthly",
    default_medications: [],
    prerequisites: ["Cần phục hồi sau bệnh/chấn thương"],
    contraindications: ["Cấm tuyệt đối vận động"],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  }
];

// === MOCK ROOMS (rooms collection) ===
export const MOCK_ROOMS = [
  {
    _id: "room_001",
    room_number: "101",
    bed_count: 2,
    room_type: "2_bed",
    gender: "male",
    floor: 1,
    status: "occupied",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "room_002",
    room_number: "102",
    bed_count: 2,
    room_type: "2_bed",
    gender: "female",
    floor: 1,
    status: "occupied",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "room_003",
    room_number: "201",
    bed_count: 4,
    room_type: "4_5_bed",
    gender: "male",
    floor: 2,
    status: "available",
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  }
];

// === MOCK ROOM TYPES (room_types collection) ===
export const MOCK_ROOM_TYPES = [
  {
    _id: "room_type_001",
    room_type: "2_bed",
    type_name: "Phòng 2 giường",
    bed_count: "2 giường",
    monthly_price: 8000000, // 8 triệu VND/tháng
    description: "Phòng riêng tư với 2 giường, không gian rộng rãi và thoải mái",
    amenities: [
      "Điều hòa riêng biệt", 
      "Tủ quần áo cá nhân", 
      "Bàn làm việc nhỏ",
      "TV màn hình phẳng",
      "Phòng tắm riêng"
    ],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "room_type_002",
    room_type: "3_bed",
    type_name: "Phòng 3 giường",
    bed_count: "3 giường", 
    monthly_price: 6500000, // 6.5 triệu VND/tháng
    description: "Phòng chia sẻ nhỏ với 3 giường, phù hợp cho những người thích có bạn đồng phòng",
    amenities: [
      "Điều hòa chung",
      "Tủ quần áo cá nhân", 
      "TV chung",
      "Phòng tắm chung trong phòng"
    ],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "room_type_003",
    room_type: "4_5_bed",
    type_name: "Phòng 4-5 giường",
    bed_count: "4-5 giường",
    monthly_price: 5500000, // 5.5 triệu VND/tháng
    description: "Phòng chia sẻ vừa phải với 4-5 giường, môi trường cộng đồng ấm cúng",
    amenities: [
      "Điều hòa chung",
      "Tủ đầu giường cá nhân",
      "TV chung", 
      "Phòng tắm chung"
    ],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  },
  {
    _id: "room_type_004",
    room_type: "6_8_bed",
    type_name: "Phòng 6-8 giường",
    bed_count: "6-8 giường",
    monthly_price: 4500000, // 4.5 triệu VND/tháng
    description: "Phòng chia sẻ lớn với 6-8 giường, phù hợp cho những người thích không khí đông đúc",
    amenities: [
      "Điều hòa chung",
      "Tủ đầu giường cá nhân",
      "TV chung",
      "Phòng tắm chung"
    ],
    is_active: true,
    created_at: new Date("2024-01-01"),
    updated_at: new Date("2024-01-01")
  }
];

// === MOCK CARE PLAN ASSIGNMENTS (care_plan_assignments collection) ===
export const MOCK_CARE_PLAN_ASSIGNMENTS = [
  {
    _id: "assignment_001",
    staff_id: "staff_nurse_001",
    care_plan_ids: [
      "care_plan_main_002", // Gói chính: Chăm sóc tích cực
      "care_plan_supp_001", // Gói phụ: Hỗ trợ dinh dưỡng
      "care_plan_supp_003"  // Gói phụ: Vật lý trị liệu
    ],
    resident_id: "1",
    family_member_id: "family_001",
    registration_date: new Date("2024-01-05"),
    consultation_notes: "Bệnh nhân cần chăm sóc tích cực do tiểu đường và huyết áp cao. Gia đình mong muốn phòng có ít người để dễ thăm nom.",
    selected_room_type: "2_bed",
    assigned_room_id: "room_001",
    assigned_bed_id: "bed_001",
    family_preferences: {
      preferred_room_gender: "male",
      preferred_floor: 1,
      special_requests: "Gần cửa sổ, thoáng mát"
    },
    total_monthly_cost: 21000000, // 9M (intensive) + 8M (2_bed room) + 1.5M (nutrition) + 2.5M (physio)
    room_monthly_cost: 8000000,
    care_plans_monthly_cost: 13000000, // 9M + 1.5M + 2.5M
    start_date: new Date("2024-01-10"),
    end_date: null,
    additional_medications: [
      {
        medication_name: "Vitamin D3",
        dosage: "1000 IU",
        frequency: "1 lần/ngày"
      }
    ],
    status: "active",
    payment_status: "fully_paid",
    notes: "Đã hoàn tất thanh toán. Bệnh nhân đã ổn định trong gói chăm sóc.",
    created_at: new Date("2024-01-05"),
    updated_at: new Date("2024-01-10")
  },
  {
    _id: "assignment_002",
    staff_id: "staff_doctor_001",
    care_plan_ids: [
      "care_plan_main_004", // Gói chính: Sa sút trí tuệ
      "care_plan_supp_002"  // Gói phụ: Chăm sóc vết thương
    ],
    resident_id: "2",
    family_member_id: "family_002",
    registration_date: new Date("2024-02-10"),
    consultation_notes: "Bệnh nhân mắc sa sút trí tuệ giai đoạn vừa, có vết loét chân cần chăm sóc đặc biệt. Gia đình yêu cầu môi trường yên tĩnh.",
    selected_room_type: "2_bed",
    assigned_room_id: "room_002",
    assigned_bed_id: "bed_002",
    family_preferences: {
      preferred_room_gender: "female",
      preferred_floor: 1,
      special_requests: "Phòng yên tĩnh, ít tiếng ồn"
    },
    total_monthly_cost: 20000000, // 10M (dementia) + 8M (2_bed room) + 2M (wound_care)
    room_monthly_cost: 8000000,
    care_plans_monthly_cost: 12000000, // 10M + 2M
    start_date: new Date("2024-02-15"),
    end_date: null,
    additional_medications: [
      {
        medication_name: "Glucosamine",
        dosage: "500mg",
        frequency: "2 lần/ngày"
      },
      {
        medication_name: "Omega-3",
        dosage: "1000mg",
        frequency: "1 lần/ngày"
      }
    ],
    status: "active",
    payment_status: "fully_paid",
    notes: "Gói chăm sóc đặc biệt cho sa sút trí tuệ, theo dõi chặt chẽ vết thương.",
    created_at: new Date("2024-02-10"),
    updated_at: new Date("2024-02-15")
  },
  {
    _id: "assignment_003",
    staff_id: "staff_nurse_001",
    care_plan_ids: [
      "care_plan_main_001", // Gói chính: Chăm sóc tiêu chuẩn
      "care_plan_supp_004"  // Gói phụ: Chăm sóc tiểu đường
    ],
    resident_id: "3",
    family_member_id: "family_003",
    registration_date: new Date("2024-02-25"),
    consultation_notes: "Cụ Hoàng có sa sút trí tuệ nhẹ, cần môi trường yên tĩnh và chăm sóc cơ bản. Gia đình chọn gói tiêu chuẩn với chi phí hợp lý.",
    selected_room_type: "4_5_bed",
    assigned_room_id: "room_003",
    assigned_bed_id: "bed_003",
    family_preferences: {
      preferred_room_gender: "male",
      preferred_floor: 2,
      special_requests: "Chọn giường gần cửa sổ"
    },
    total_monthly_cost: 13000000, // 6M (standard) + 5.5M (4_5_bed room) + 1.5M (diabetes_care)
    room_monthly_cost: 5500000,
    care_plans_monthly_cost: 7500000, // 6M + 1.5M
    start_date: new Date("2024-03-01"),
    end_date: null,
    additional_medications: [],
    status: "active",
    payment_status: "pending",
    notes: "Đăng ký mới, chờ thanh toán đợt đầu.",
    created_at: new Date("2024-02-25"),
    updated_at: new Date("2024-03-01")
  }
];

// === MOCK BILLINGS (billings collection) ===
export const MOCK_BILLINGS = [
  {
    _id: "bill_001",
    family_member_id: "family_001",
    resident_id: "1",
    care_plan_assignment_id: "assignment_001",
    staff_id: "staff_nurse_001",
    amount: 21000000,
    due_date: new Date("2024-04-15"),
    paid_date: new Date("2024-04-10"),
    payment_method: "qr_payment",
    status: "paid",
    notes: "Hóa đơn tháng 4/2024 cho cụ Nguyễn Văn Nam - Gói tích cực",
    created_at: new Date("2024-04-01"),
    updated_at: new Date("2024-04-10"),
    
    // Extended fields for mobile app UI
    title: "Phí chăm sóc tháng 4/2024",
    period: "2024-04",
    description: "Phí chăm sóc hàng tháng cho cụ Nguyễn Văn Nam",
    resident: {
      id: "1",
      name: "Nguyễn Văn Nam",
      room: "101"
    },
    items: [
      {
        name: "Gói Chăm Sóc Tích Cực",
        amount: 9000000,
        category: "main", // ← QUAN TRỌNG: category = main (gói chính)
        description: "Chăm sóc tích cực với hỗ trợ y tế thường xuyên"
      },
      {
        name: "Phòng 2 giường",
        amount: 8000000,
        category: "room",
        description: "Chi phí phòng ở tháng 4/2024"
      },
      {
        name: "Dịch Vụ Hỗ Trợ Dinh Dưỡng",
        amount: 1500000,
        category: "supplementary", // ← Gói phụ
        description: "Hỗ trợ dinh dưỡng qua sonde"
      },
      {
        name: "Vật Lý Trị Liệu",
        amount: 2500000,
        category: "supplementary", // ← Gói phụ
        description: "Vật lý trị liệu cá nhân hóa"
      }
    ],
    paymentDate: new Date("2024-04-10"),
    paymentMethod: "qr_payment"
  },
  {
    _id: "bill_002",
    family_member_id: "family_002",
    resident_id: "2",
    care_plan_assignment_id: "assignment_002",
    staff_id: "staff_doctor_001",
    amount: 20000000,
    due_date: new Date("2024-05-15"),
    paid_date: null,
    payment_method: "qr_payment",
    status: "pending",
    notes: "Hóa đơn tháng 5/2024 cho cụ Trần Thị Lan - Gói sa sút trí tuệ",
    created_at: new Date("2024-05-01"),
    updated_at: new Date("2024-05-01"),
    
    // Extended fields for mobile app UI
    title: "Phí chăm sóc tháng 5/2024",
    period: "2024-05",
    description: "Phí chăm sóc hàng tháng cho cụ Trần Thị Lan",
    resident: {
      id: "2",
      name: "Trần Thị Lan",
      room: "102"
    },
    items: [
      {
        name: "Gói Chăm Sóc Sa Sút Trí Tuệ",
        amount: 10000000,
        category: "main", // ← QUAN TRỌNG: category = main (gói chính)
        description: "Chăm sóc chuyên biệt cho sa sút trí tuệ"
      },
      {
        name: "Phòng 2 giường",
        amount: 8000000,
        category: "room",
        description: "Chi phí phòng ở tháng 5/2024"
      },
      {
        name: "Chăm Sóc Vết Thương",
        amount: 2000000,
        category: "supplementary", // ← Gói phụ
        description: "Chăm sóc và thay băng vết thương chuyên nghiệp"
      }
    ]
  },
  {
    _id: "bill_003",
    family_member_id: "family_003",
    resident_id: "3", 
    care_plan_assignment_id: "assignment_003",
    staff_id: "staff_nurse_001",
    amount: 13000000,
    due_date: new Date("2025-06-20"), // ← OVERDUE: quá ngày 20/6/2025
    paid_date: null,
    payment_method: "qr_payment",
    status: "pending", // ← Sẽ tính overdue bằng logic (pending + quá due_date)
    notes: "Hóa đơn tháng 6/2025 cho cụ Lê Văn Hoàng - Gói tiêu chuẩn",
    created_at: new Date("2025-06-01"),
    updated_at: new Date("2025-06-01"),
    
    // Extended fields for mobile app UI  
    title: "Phí chăm sóc tháng 6/2025",
    period: "2025-06",
    description: "Phí chăm sóc hàng tháng cho cụ Lê Văn Hoàng",
    resident: {
      id: "3",
      name: "Lê Văn Hoàng",
      room: "201"
    },
    items: [
      {
        name: "Gói Chăm Sóc Tiêu Chuẩn",
        amount: 6000000,
        category: "main", // ← QUAN TRỌNG: category = main (gói chính)
        description: "Chăm sóc cơ bản cho người cao tuổi ổn định"
      },
      {
        name: "Phòng 4-5 giường",
        amount: 5500000,
        category: "room",
        description: "Chi phí phòng ở tháng 6/2025"
      },
      {
        name: "Chăm Sóc Bệnh Tiểu Đường",
        amount: 1500000,
        category: "supplementary", // ← Gói phụ
        description: "Chăm sóc chuyên biệt cho bệnh tiểu đường"
      }
    ]
  },
  {
    _id: "bill_004",
    family_member_id: "family_001",
    resident_id: "1",
    care_plan_assignment_id: "assignment_001", 
    staff_id: "staff_nurse_001",
    amount: 21000000,
    due_date: new Date("2025-07-01"), // ← GẦN ĐẾN HẠN (chưa quá)
    paid_date: null,
    payment_method: "qr_payment",
    status: "pending", // ← Pending nhưng chưa overdue
    notes: "Hóa đơn tháng 6/2025 cho cụ Nguyễn Văn Nam - Gói tích cực",
    created_at: new Date("2025-06-30"),
    updated_at: new Date("2025-06-30"),
    
    // Extended fields for mobile app UI
    title: "Phí chăm sóc tháng 7/2025",
    period: "2025-07",
    description: "Phí chăm sóc hàng tháng cho cụ Nguyễn Văn Nam",
    resident: {
      id: "1",
      name: "Nguyễn Văn Nam",
      room: "101"
    },
    items: [
      {
        name: "Gói Chăm Sóc Tích Cực",
        amount: 9000000,
        category: "main", // ← QUAN TRỌNG: category = main (gói chính)
        description: "Chăm sóc tích cực với hỗ trợ y tế thường xuyên"
      },
      {
        name: "Phòng 2 giường",
        amount: 8000000,
        category: "room",
        description: "Chi phí phòng ở tháng 6/2025"
      },
      {
        name: "Dịch Vụ Hỗ Trợ Dinh Dưỡng",
        amount: 1500000,
        category: "supplementary", // ← Gói phụ
        description: "Hỗ trợ dinh dưỡng qua sonde"
      },
      {
        name: "Vật Lý Trị Liệu",
        amount: 2500000,
        category: "supplementary", // ← Gói phụ  
        description: "Vật lý trị liệu cá nhân hóa"
      }
    ]
  }
];

// === PAYMENT METHODS ===
export const MOCK_PAYMENT_METHODS = [
  {
    id: 'qr_payment',
    name: 'Thanh toán QR Code',
    description: 'Quét mã QR để thanh toán',
    icon: 'qr-code-outline',
    isDefault: true
  }
];

/**
 * HELPER FUNCTIONS để tương thích với logic hiện tại
 */

// Helper function để lấy care plan theo ID
export const getCarePlanById = (planId) => {
  return MOCK_CARE_PLANS.find(plan => plan._id === planId);
};

// Helper function để lấy resident theo ID  
export const getResidentById = (residentId) => {
  return MOCK_RESIDENTS.find(resident => resident._id === residentId);
};

// Helper function để lấy assignment theo ID
export const getAssignmentById = (assignmentId) => {
  return MOCK_CARE_PLAN_ASSIGNMENTS.find(assignment => assignment._id === assignmentId);
};

// Helper function để lấy room type theo room_type
export const getRoomTypeByType = (roomType) => {
  return MOCK_ROOM_TYPES.find(type => type.room_type === roomType);
};
