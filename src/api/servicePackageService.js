import { delay } from '../utils/helpers';

// Mock data based on MongoDB schema from nhms_setup_redesigned.js
const mockCarePackages = [
  // Main Care Plans
  {
    _id: '1',
    plan_name: 'Gói Chăm Sóc Tiêu Chuẩn',
    description: 'Gói chăm sóc cơ bản cho người cao tuổi có sức khỏe ổn định',
    monthly_price: 6000000,
    plan_type: 'cham_soc_tieu_chuan',
    category: 'main',
    services_included: [
      'Kiểm tra sức khỏe định kỳ',
      'Bác sĩ thăm khám 1 lần/tuần',
      'Hỗ trợ sinh hoạt hàng ngày',
      'Bữa ăn đầy đủ dinh dưỡng',
      'Thuốc cơ bản',
      'Hoạt động vui chơi giải trí',
      'Tư vấn sức khỏe'
    ],
    staff_ratio: '1:8',
    duration_type: 'monthly',
    prerequisites: ['Sức khỏe ổn định', 'Tự chăm sóc cơ bản'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '2',
    plan_name: 'Gói Chăm Sóc Tích Cực',
    description: 'Chăm sóc tích cực cho người cao tuổi cần hỗ trợ y tế thường xuyên',
    monthly_price: 9000000,
    plan_type: 'cham_soc_tich_cuc',
    category: 'main',
    services_included: [
      'Theo dõi sức khỏe thường xuyên',
      'Bác sĩ thăm khám 2 lần/tuần',
      'Điều dưỡng có mặt trong giờ hành chính',
      'Vật lý trị liệu nhóm',
      'Chế độ ăn dinh dưỡng cân bằng',
      'Thuốc cơ bản theo đơn',
      'Hoạt động giải trí hàng ngày'
    ],
    staff_ratio: '1:5',
    duration_type: 'monthly',
    prerequisites: ['Cần hỗ trợ y tế', 'Bệnh mãn tính ổn định'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '3',
    plan_name: 'Gói Chăm Sóc Đặc Biệt',
    description: 'Dành cho những người cao tuổi cần chăm sóc đặc biệt với tình trạng sức khỏe phức tạp',
    monthly_price: 12000000,
    plan_type: 'cham_soc_dac_biet',
    category: 'main',
    services_included: [
      'Theo dõi sức khỏe 24/7',
      'Bác sĩ chuyên khoa thăm khám hàng tuần',
      'Điều dưỡng chuyên nghiệp túc trực',
      'Vật lý trị liệu cá nhân hóa',
      'Dinh dưỡng theo chỉ định bác sĩ',
      'Thuốc và thiết bị y tế chuyên dụng',
      'Tư vấn tâm lý cá nhân'
    ],
    staff_ratio: '1:3',
    duration_type: 'monthly',
    prerequisites: ['Tình trạng sức khỏe phức tạp', 'Cần theo dõi liên tục'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '4',
    plan_name: 'Gói Chăm Sóc Sa Sút Trí Tuệ',
    description: 'Chăm sóc chuyên biệt cho người cao tuổi mắc chứng sa sút trí tuệ',
    monthly_price: 10000000,
    plan_type: 'cham_soc_sa_sut_tri_tue',
    category: 'main',
    services_included: [
      'Theo dõi hành vi 24/7',
      'Bác sĩ thần kinh thăm khám định kỳ',
      'Nhân viên được đào tạo chuyên biệt',
      'Liệu pháp nhận thức',
      'Môi trường an toàn, thân thiện',
      'Thuốc điều trị chuyên khoa',
      'Hỗ trợ gia đình',
      'Hoạt động kích thích trí nhớ'
    ],
    staff_ratio: '1:4',
    duration_type: 'monthly',
    prerequisites: ['Chẩn đoán sa sút trí tuệ'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },

  // Supplementary Care Plans
  {
    _id: '5',
    plan_name: 'Dịch Vụ Hỗ Trợ Dinh Dưỡng',
    description: 'Dịch vụ cho ăn qua sonde cho bệnh nhân không thể ăn bình thường',
    monthly_price: 1500000,
    plan_type: 'ho_tro_dinh_duong',
    category: 'supplementary',
    services_included: [
      'Cho ăn qua sonde theo lịch trình',
      'Vệ sinh và chăm sóc ống sonde',
      'Theo dõi dinh dưỡng',
      'Báo cáo tình trạng hàng ngày'
    ],
    staff_ratio: 'chuyên biệt',
    duration_type: 'monthly',
    prerequisites: ['Có ống sonde', 'Chỉ định của bác sĩ'],
    contraindications: ['Nhiễm trùng đường tiêu hóa'],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '6',
    plan_name: 'Chăm Sóc Vết Thương',
    description: 'Chăm sóc và thay băng vết thương chuyên nghiệp',
    monthly_price: 2000000,
    plan_type: 'cham_soc_vet_thuong',
    category: 'supplementary',
    services_included: [
      'Thay băng vết thương hàng ngày',
      'Sát trùng và vệ sinh vết thương',
      'Theo dõi quá trình lành vết thương',
      'Báo cáo tiến triển cho bác sĩ'
    ],
    staff_ratio: 'chuyên biệt',
    duration_type: 'monthly',
    prerequisites: ['Có vết thương cần chăm sóc'],
    contraindications: ['Dị ứng với thuốc bôi'],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '7',
    plan_name: 'Vật Lý Trị Liệu',
    description: 'Vật lý trị liệu cá nhân hóa để phục hồi chức năng vận động',
    monthly_price: 2500000,
    plan_type: 'vat_ly_tri_lieu',
    category: 'supplementary',
    services_included: [
      'Đánh giá chức năng vận động',
      'Bài tập vật lý trị liệu cá nhân',
      'Massage y học',
      'Tư vấn về hoạt động hàng ngày'
    ],
    staff_ratio: '1:1 (trong session)',
    duration_type: 'monthly',
    prerequisites: ['Cần phục hồi chức năng'],
    contraindications: ['Cấm vận động'],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '8',
    plan_name: 'Chăm Sóc Bệnh Tiểu Đường',
    description: 'Chăm sóc chuyên biệt cho người mắc bệnh tiểu đường',
    monthly_price: 1500000,
    plan_type: 'cham_soc_tieu_duong',
    category: 'supplementary',
    services_included: [
      'Theo dõi đường huyết hàng ngày',
      'Chế độ ăn kiêng chuyên biệt',
      'Giáo dục về bệnh tiểu đường',
      'Chăm sóc chân đặc biệt'
    ],
    staff_ratio: 'chuyên biệt',
    duration_type: 'monthly',
    prerequisites: ['Chẩn đoán tiểu đường'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '9',
    plan_name: 'Phục Hồi Chức Năng',
    description: 'Chương trình phục hồi chức năng sau bệnh tật hoặc chấn thương',
    monthly_price: 3000000,
    plan_type: 'phuc_hoi_chuc_nang',
    category: 'supplementary',
    services_included: [
      'Đánh giá khả năng vận động',
      'Lập kế hoạch phục hồi cá nhân',
      'Tập luyện vận động cơ bản',
      'Theo dõi tiến độ phục hồi'
    ],
    staff_ratio: '1:2',
    duration_type: 'monthly',
    prerequisites: ['Cần phục hồi sau bệnh/chấn thương'],
    contraindications: ['Cấm tuyệt đối vận động'],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  },
  {
    _id: '10',
    plan_name: 'Chăm Sóc Giảm Nhẹ',
    description: 'Chăm sóc giảm nhẹ đau đớn cho bệnh nhân giai đoạn cuối',
    monthly_price: 3500000,
    plan_type: 'cham_soc_giam_nhe',
    category: 'supplementary',
    services_included: [
      'Giảm đau chuyên biệt',
      'Chăm sóc tâm lý',
      'Hỗ trợ gia đình',
      'Môi trường thoải mái yên bình'
    ],
    staff_ratio: '1:1',
    duration_type: 'monthly',
    prerequisites: ['Chẩn đoán giai đoạn cuối'],
    contraindications: [],
    default_medications: [],
    is_active: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01')
  }
];

// Mock data cho các gói đã đăng ký của gia đình
const mockRegisteredPackages = [
  {
    _id: 'assign_1',
    resident: {
      _id: 'resident_1',
      full_name: 'Nguyễn Văn Nam',
      gender: 'male',
      date_of_birth: new Date('1950-05-15'),
      room_number: '101',
      bed_number: '101-A'
    },
    care_plan_ids: ['1', '5'], // Gói tiêu chuẩn + hỗ trợ dinh dưỡng
    main_care_plan: {
      _id: '1',
      plan_name: 'Gói Chăm Sóc Tiêu Chuẩn',
      monthly_price: 6000000,
      category: 'main'
    },
    supplementary_plans: [
      {
        _id: '5',
        plan_name: 'Dịch Vụ Hỗ Trợ Dinh Dưỡng',
        monthly_price: 1500000,
        category: 'supplementary'
      }
    ],
    registration_date: new Date('2024-01-05'),
    start_date: new Date('2024-01-10'),
    end_date: new Date('2024-04-10'),
    total_monthly_cost: 7500000,
    care_plans_monthly_cost: 7500000,
    room_monthly_cost: 0, // Đã bao gồm trong gói chính
    status: 'active',
    payment_status: 'fully_paid',
    notes: 'Đã hoàn tất thanh toán. Bệnh nhân đã ổn định trong gói chăm sóc.',
    family_member_id: 'family_1'
  },
  {
    _id: 'assign_2',
    resident: {
      _id: 'resident_2',
      full_name: 'Trần Thị Lan',
      gender: 'female',
      date_of_birth: new Date('1948-12-03'),
      room_number: '102',
      bed_number: '102-A'
    },
    care_plan_ids: ['4', '6'], // Gói sa sút trí tuệ + chăm sóc vết thương
    main_care_plan: {
      _id: '4',
      plan_name: 'Gói Chăm Sóc Sa Sút Trí Tuệ',
      monthly_price: 10000000,
      category: 'main'
    },
    supplementary_plans: [
      {
        _id: '6',
        plan_name: 'Chăm Sóc Vết Thương',
        monthly_price: 2000000,
        category: 'supplementary'
      }
    ],
    registration_date: new Date('2024-02-10'),
    start_date: new Date('2024-02-15'),
    end_date: new Date('2024-05-15'),
    total_monthly_cost: 12000000,
    care_plans_monthly_cost: 12000000,
    room_monthly_cost: 0, // Đã bao gồm trong gói chính
    status: 'active',
    payment_status: 'fully_paid',
    notes: 'Gói chăm sóc đặc biệt cho sa sút trí tuệ, theo dõi chặt chẽ vết thương.',
    family_member_id: 'family_2'
  }
];

// Mock residents data for family member
const mockResidents = [
  {
    _id: 'resident_1',
    full_name: 'Nguyễn Văn Nam',
    room_number: '101',
    bed_number: '101-A',
    date_of_birth: new Date('1950-03-15'),
    health_status: 'stable',
    current_main_package: 'cham_soc_tich_cuc',
    current_supplementary_packages: ['ho_tro_dinh_duong']
  },
  {
    _id: 'resident_2', 
    full_name: 'Trần Thị Lan',
    room_number: '102',
    bed_number: '102-A',
    date_of_birth: new Date('1948-07-22'),
    health_status: 'stable',
    current_main_package: 'cham_soc_sa_sut_tri_tue',
    current_supplementary_packages: ['cham_soc_vet_thuong']
  }
];

class ServicePackageService {
  
  // Lấy tất cả gói dịch vụ có sẵn
  static async getAllServicePackages() {
    try {
      await delay(800); // Simulate API delay
      
      // Phân loại gói chính và gói phụ
      const mainPackages = mockCarePackages.filter(pkg => pkg.category === 'main');
      const supplementaryPackages = mockCarePackages.filter(pkg => pkg.category === 'supplementary');
      
      return {
        success: true,
        data: {
          main_packages: mainPackages,
          supplementary_packages: supplementaryPackages,
          all_packages: mockCarePackages
        }
      };
    } catch (error) {
      console.error('Error fetching service packages:', error);
      return {
        success: false,
        error: 'Không thể tải danh sách gói dịch vụ'
      };
    }
  }

  // Lấy chi tiết 1 gói dịch vụ
  static async getServicePackageDetail(packageId) {
    try {
      await delay(500);
      
      const packageDetail = mockCarePackages.find(pkg => pkg._id === packageId);
      
      if (!packageDetail) {
        return {
          success: false,
          error: 'Không tìm thấy gói dịch vụ'
        };
      }

      return {
        success: true,
        data: packageDetail
      };
    } catch (error) {
      console.error('Error fetching package detail:', error);
      return {
        success: false,
        error: 'Không thể tải thông tin gói dịch vụ'
      };
    }
  }

  // Lấy các gói đã đăng ký của gia đình
  static async getRegisteredPackages(familyId) {
    try {
      await delay(600);
      
      // Filter theo family member ID (trong thực tế sẽ dùng familyId)
      const registeredPackages = mockRegisteredPackages.filter(
        pkg => pkg.family_member_id === familyId || familyId === 'current_user'
      );

      return {
        success: true,
        data: registeredPackages
      };
    } catch (error) {
      console.error('Error fetching registered packages:', error);
      return {
        success: false,
        error: 'Không thể tải danh sách gói đã đăng ký'
      };
    }
  }

  // Đăng ký gói dịch vụ mới
  static async registerServicePackage(packageData) {
    try {
      await delay(1000);
      
      // Simulate API call to register new package
      console.log('Registering package:', packageData);
      
      return {
        success: true,
        data: {
          message: 'Đăng ký gói dịch vụ thành công',
          registration_id: Date.now().toString()
        }
      };
    } catch (error) {
      console.error('Error registering package:', error);
      return {
        success: false,
        error: 'Không thể đăng ký gói dịch vụ'
      };
    }
  }

  // Thay đổi gói dịch vụ chính
  static async changeMainPackage(residentId, newPackageId, changeReason) {
    try {
      await delay(1200);
      
      console.log('Changing main package:', { residentId, newPackageId, changeReason });
      
      return {
        success: true,
        data: {
          message: 'Thay đổi gói dịch vụ chính thành công',
          effective_date: new Date()
        }
      };
    } catch (error) {
      console.error('Error changing main package:', error);
      return {
        success: false,
        error: 'Không thể thay đổi gói dịch vụ chính'
      };
    }
  }

  // Hủy gói dịch vụ phụ
  static async cancelSupplementaryPackage(assignmentId, reason) {
    try {
      await delay(800);
      
      console.log('Cancelling supplementary package:', { assignmentId, reason });
      
      return {
        success: true,
        data: {
          message: 'Hủy gói dịch vụ phụ thành công',
          cancellation_date: new Date()
        }
      };
    } catch (error) {
      console.error('Error cancelling supplementary package:', error);
      return {
        success: false,
        error: 'Không thể hủy gói dịch vụ phụ'
      };
    }
  }

  // Lấy lịch sử thay đổi gói dịch vụ
  static async getPackageHistory(residentId) {
    try {
      await delay(700);
      
      // Mock history data
      const history = [
        {
          id: '1',
          date: new Date('2024-01-10'),
          action: 'register',
          package_name: 'Gói Chăm Sóc Tiêu Chuẩn',
          details: 'Đăng ký gói chăm sóc ban đầu',
          performed_by: 'Nguyễn Thị Hoa'
        },
        {
          id: '2',
          date: new Date('2024-01-15'),
          action: 'add_supplementary',
          package_name: 'Dịch Vụ Hỗ Trợ Dinh Dưỡng',
          details: 'Bổ sung dịch vụ hỗ trợ dinh dưỡng theo yêu cầu bác sĩ',
          performed_by: 'Nguyễn Thị Hoa'
        }
      ];

      return {
        success: true,
        data: history
      };
    } catch (error) {
      console.error('Error fetching package history:', error);
      return {
        success: false,
        error: 'Không thể tải lịch sử thay đổi'
      };
    }
  }

  // Get available residents for package registration
  static async getAvailableResidents(packageData) {
    await delay(500);
    
    try {
      // Filter residents based on package type and current registrations
      const availableResidents = mockResidents.filter(resident => {
        if (packageData.category === 'main') {
          // For main packages, exclude residents who already have a main package
          return !resident.current_main_package || resident.current_main_package !== packageData.plan_type;
        } else {
          // For supplementary packages, exclude residents who already have this specific supplementary package
          return !resident.current_supplementary_packages.includes(packageData.plan_type);
        }
      });

      return {
        success: true,
        data: availableResidents
      };
    } catch (error) {
      return {
        success: false,
        error: 'Không thể tải danh sách người thân'
      };
    }
  }

  // Get all residents for family member
  static async getAllResidents() {
    await delay(300);
    
    try {
      return {
        success: true,
        data: mockResidents
      };
    } catch (error) {
      return {
        success: false,
        error: 'Không thể tải danh sách người thân'
      };
    }
  }
}

export { ServicePackageService };
