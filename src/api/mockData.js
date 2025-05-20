// Mock data for residents
export const residents = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    photo: 'https://randomuser.me/api/portraits/men/1.jpg',
    roomNumber: '101',
    dateOfBirth: '1945-05-15',
    admissionDate: '2023-01-10',
    medicalConditions: ['Diabetes', 'Hypertension', 'Arthritis'],
    allergies: ['Penicillin', 'Peanuts'],
    doctor: 'Dr. Sarah Johnson',
    careLevel: 'Medium', // Low, Medium, High
    dietaryRestrictions: 'Low sodium',
    contactInfo: {
      emergency: {
        name: 'Jane Doe',
        relationship: 'Daughter',
        phone: '555-123-4567',
        email: 'jane.doe@example.com',
      },
    },
    status: 'Active',
  },
  {
    id: '2',
    firstName: 'Mary',
    lastName: 'Smith',
    photo: 'https://randomuser.me/api/portraits/women/2.jpg',
    roomNumber: '102',
    dateOfBirth: '1940-11-22',
    admissionDate: '2022-09-15',
    medicalConditions: ['Dementia', 'Osteoporosis'],
    allergies: ['Sulfa drugs'],
    doctor: 'Dr. Michael Chen',
    careLevel: 'High',
    dietaryRestrictions: 'Pureed food, Thickened liquids',
    contactInfo: {
      emergency: {
        name: 'Robert Smith',
        relationship: 'Son',
        phone: '555-987-6543',
        email: 'robert.smith@example.com',
      },
    },
    status: 'Active',
  },
  {
    id: '3',
    firstName: 'William',
    lastName: 'Johnson',
    photo: 'https://randomuser.me/api/portraits/men/3.jpg',
    roomNumber: '103',
    dateOfBirth: '1950-03-28',
    admissionDate: '2023-03-05',
    medicalConditions: ['COPD', 'Heart Disease'],
    allergies: ['Latex'],
    doctor: 'Dr. Lisa Wong',
    careLevel: 'Medium',
    dietaryRestrictions: 'No restrictions',
    contactInfo: {
      emergency: {
        name: 'Elizabeth Johnson',
        relationship: 'Wife',
        phone: '555-456-7890',
        email: 'elizabeth.johnson@example.com',
      },
    },
    status: 'Active',
  },
  {
    id: '4',
    firstName: 'Patricia',
    lastName: 'Brown',
    photo: 'https://randomuser.me/api/portraits/women/4.jpg',
    roomNumber: '104',
    dateOfBirth: '1938-07-12',
    admissionDate: '2022-11-20',
    medicalConditions: ['Stroke recovery', 'Diabetes'],
    allergies: ['Aspirin'],
    doctor: 'Dr. James Wilson',
    careLevel: 'High',
    dietaryRestrictions: 'Diabetic diet',
    contactInfo: {
      emergency: {
        name: 'Michael Brown',
        relationship: 'Son',
        phone: '555-567-8901',
        email: 'michael.brown@example.com',
      },
    },
    status: 'Active',
  },
  {
    id: '5',
    firstName: 'Richard',
    lastName: 'Miller',
    photo: 'https://randomuser.me/api/portraits/men/5.jpg',
    roomNumber: '105',
    dateOfBirth: '1943-09-30',
    admissionDate: '2023-02-18',
    medicalConditions: ['Parkinson\'s', 'Depression'],
    allergies: ['Shellfish'],
    doctor: 'Dr. Emily Davis',
    careLevel: 'Medium',
    dietaryRestrictions: 'Low fat diet',
    contactInfo: {
      emergency: {
        name: 'Susan Miller',
        relationship: 'Daughter',
        phone: '555-234-5678',
        email: 'susan.miller@example.com',
      },
    },
    status: 'Active',
  },
];

// Mock data for resident care plans
export const carePlans = [
  {
    id: '1',
    residentId: '1',
    title: 'Daily Diabetes Management',
    description: 'Management plan for blood sugar monitoring and insulin administration',
    goals: [
      'Maintain blood glucose between 100-150 mg/dL',
      'Prevent hypoglycemic episodes',
      'Promote self-care when appropriate',
    ],
    interventions: [
      'Monitor blood glucose 3x daily before meals',
      'Administer insulin as prescribed',
      'Provide diabetic diet as specified by nutritionist',
      'Educate on signs of high/low blood sugar',
    ],
    startDate: '2023-01-15',
    reviewDate: '2023-04-15',
    status: 'Active',
  },
  {
    id: '2',
    residentId: '1',
    title: 'Mobility Support Plan',
    description: 'Plan to maintain and improve mobility and prevent falls',
    goals: [
      'Maintain ability to transfer independently',
      'Prevent falls',
      'Strengthen lower extremities',
    ],
    interventions: [
      'Physical therapy 3x weekly',
      'Daily walking with assistance',
      'Environmental safety checks',
      'Use of walker when ambulating',
    ],
    startDate: '2023-01-20',
    reviewDate: '2023-04-20',
    status: 'Active',
  },
  {
    id: '3',
    residentId: '2',
    title: 'Dementia Care Plan',
    description: 'Comprehensive approach to managing dementia symptoms and maintaining quality of life',
    goals: [
      'Minimize behavioral disturbances',
      'Maintain cognitive function',
      'Ensure safety and prevent wandering',
    ],
    interventions: [
      'Structured daily routine',
      'Memory care activities daily',
      'Redirect when agitated',
      'Secure unit placement with wander guard',
      'Regular family visits scheduled',
    ],
    startDate: '2022-09-20',
    reviewDate: '2023-03-20',
    status: 'Active',
  },
];

// Mock data for medications
export const medications = [
  {
    id: '1',
    residentId: '1',
    name: 'Metformin',
    dosage: '500 mg',
    route: 'Oral',
    frequency: 'Twice daily',
    schedule: {
      times: ['08:00', '20:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2023-01-12',
    endDate: null,
    prescriber: 'Dr. Sarah Johnson',
    notes: 'Take with food',
    status: 'Active',
    type: 'Regular',
    category: 'Antidiabetic',
    administrationHistory: [
      {
        id: '101',
        timestamp: '2023-06-10T08:05:00Z',
        administeredBy: 'Nurse Johnson',
        status: 'Administered',
        notes: 'Taken without issues'
      },
      {
        id: '102',
        timestamp: '2023-06-10T20:03:00Z',
        administeredBy: 'Nurse Williams',
        status: 'Administered',
        notes: 'Taken with dinner'
      }
    ]
  },
  {
    id: '2',
    residentId: '1',
    name: 'Lisinopril',
    dosage: '10 mg',
    route: 'Oral',
    frequency: 'Once daily',
    schedule: {
      times: ['09:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2023-01-15',
    endDate: null,
    prescriber: 'Dr. Sarah Johnson',
    notes: 'Monitor blood pressure',
    status: 'Active',
    type: 'Regular',
    category: 'Antihypertensive',
    administrationHistory: [
      {
        id: '201',
        timestamp: '2023-06-10T09:02:00Z',
        administeredBy: 'Nurse Johnson',
        status: 'Administered',
        notes: 'BP 130/80 before administration'
      }
    ]
  },
  {
    id: '3',
    residentId: '2',
    name: 'Donepezil',
    dosage: '5 mg',
    route: 'Oral',
    frequency: 'Once daily',
    schedule: {
      times: ['21:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2022-09-20',
    endDate: null,
    prescriber: 'Dr. Michael Chen',
    notes: 'Take at bedtime',
    status: 'Active',
    type: 'Regular',
    category: 'Cognitive Enhancer',
    administrationHistory: [
      {
        id: '301',
        timestamp: '2023-06-10T21:00:00Z',
        administeredBy: 'Nurse Garcia',
        status: 'Administered',
        notes: 'Taken without issues'
      }
    ]
  },
  {
    id: '4',
    residentId: '3',
    name: 'Albuterol',
    dosage: '2 puffs',
    route: 'Inhalation',
    frequency: 'As needed',
    schedule: {
      times: [],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2023-03-10',
    endDate: null,
    prescriber: 'Dr. Lisa Wong',
    notes: 'Use for shortness of breath',
    status: 'Active',
    type: 'PRN',
    category: 'Bronchodilator',
    administrationHistory: [
      {
        id: '401',
        timestamp: '2023-06-09T14:30:00Z',
        administeredBy: 'Nurse Thompson',
        status: 'Administered',
        notes: 'Given for mild wheezing, effective'
      }
    ]
  },
  {
    id: '5',
    residentId: '4',
    name: 'Warfarin',
    dosage: '3 mg',
    route: 'Oral',
    frequency: 'Once daily',
    schedule: {
      times: ['18:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2022-11-25',
    endDate: null,
    prescriber: 'Dr. James Wilson',
    notes: 'Monitor INR weekly',
    status: 'Active',
    type: 'Regular',
    category: 'Anticoagulant',
    administrationHistory: [
      {
        id: '501',
        timestamp: '2023-06-10T18:05:00Z',
        administeredBy: 'Nurse Roberts',
        status: 'Administered',
        notes: 'Next INR check scheduled for 6/15'
      }
    ]
  },
  {
    id: '6',
    residentId: '5',
    name: 'Carbidopa/Levodopa',
    dosage: '25/100 mg',
    route: 'Oral',
    frequency: 'Three times daily',
    schedule: {
      times: ['08:00', '14:00', '20:00'],
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    },
    startDate: '2023-02-20',
    endDate: null,
    prescriber: 'Dr. Emily Davis',
    notes: 'Take 30 minutes before meals',
    status: 'Active',
    type: 'Regular',
    category: 'Antiparkinson',
    administrationHistory: [
      {
        id: '601',
        timestamp: '2023-06-10T07:45:00Z',
        administeredBy: 'Nurse Johnson',
        status: 'Administered',
        notes: 'Given before breakfast'
      },
      {
        id: '602',
        timestamp: '2023-06-10T13:40:00Z',
        administeredBy: 'Nurse Williams',
        status: 'Administered',
        notes: 'Given before lunch'
      }
    ]
  }
];

// Mock data for vital signs
export const vitals = [
  {
    id: '1',
    residentId: '1',
    date: '2023-03-15T08:30:00',
    bloodPressure: '130/85',
    heartRate: 78,
    respiratoryRate: 18,
    oxygenSaturation: 96,
    temperature: 36.7,
    bloodGlucose: 142,
    weight: 72.5,
    pain: 2,
    notes: 'Resident reports mild joint pain',
    recordedBy: 'Nurse Jane Wilson',
  },
  {
    id: '2',
    residentId: '1',
    date: '2023-03-14T08:30:00',
    bloodPressure: '128/82',
    heartRate: 76,
    respiratoryRate: 17,
    oxygenSaturation: 97,
    temperature: 36.6,
    bloodGlucose: 138,
    weight: 72.5,
    pain: 1,
    notes: '',
    recordedBy: 'Nurse Mark Thompson',
  },
  {
    id: '3',
    residentId: '2',
    date: '2023-03-15T09:00:00',
    bloodPressure: '142/88',
    heartRate: 82,
    respiratoryRate: 20,
    oxygenSaturation: 95,
    temperature: 36.8,
    bloodGlucose: null,
    weight: 65.2,
    pain: 0,
    notes: 'Resident appears anxious today',
    recordedBy: 'Nurse Lisa Chen',
  },
];

// Mock data for staff
export const staff = [
  {
    id: '1',
    firstName: 'Jane',
    lastName: 'Wilson',
    photo: 'https://randomuser.me/api/portraits/women/21.jpg',
    role: 'Registered Nurse',
    department: 'Nursing',
    contactNumber: '555-111-2222',
    email: 'jane.wilson@nhms.example.com',
    qualifications: ['RN', 'BSN', 'Wound Care Certified'],
    hireDate: '2020-05-15',
    schedule: {
      monday: { start: '07:00', end: '19:00' },
      tuesday: { start: '07:00', end: '19:00' },
      wednesday: { start: null, end: null },
      thursday: { start: null, end: null },
      friday: { start: '07:00', end: '19:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    },
    status: 'Active',
  },
  {
    id: '2',
    firstName: 'Mark',
    lastName: 'Thompson',
    photo: 'https://randomuser.me/api/portraits/men/22.jpg',
    role: 'Licensed Practical Nurse',
    department: 'Nursing',
    contactNumber: '555-222-3333',
    email: 'mark.thompson@nhms.example.com',
    qualifications: ['LPN'],
    hireDate: '2021-02-10',
    schedule: {
      monday: { start: null, end: null },
      tuesday: { start: null, end: null },
      wednesday: { start: '07:00', end: '19:00' },
      thursday: { start: '07:00', end: '19:00' },
      friday: { start: null, end: null },
      saturday: { start: '07:00', end: '19:00' },
      sunday: { start: '07:00', end: '19:00' },
    },
    status: 'Active',
  },
  {
    id: '3',
    firstName: 'Sarah',
    lastName: 'Martinez',
    photo: 'https://randomuser.me/api/portraits/women/23.jpg',
    role: 'Certified Nursing Assistant',
    department: 'Nursing',
    contactNumber: '555-333-4444',
    email: 'sarah.martinez@nhms.example.com',
    qualifications: ['CNA'],
    hireDate: '2022-01-05',
    schedule: {
      monday: { start: '07:00', end: '15:00' },
      tuesday: { start: '07:00', end: '15:00' },
      wednesday: { start: '07:00', end: '15:00' },
      thursday: { start: '07:00', end: '15:00' },
      friday: { start: '07:00', end: '15:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    },
    status: 'Active',
  },
  {
    id: '4',
    firstName: 'David',
    lastName: 'Brown',
    photo: 'https://randomuser.me/api/portraits/men/24.jpg',
    role: 'Physical Therapist',
    department: 'Rehabilitation',
    contactNumber: '555-444-5555',
    email: 'david.brown@nhms.example.com',
    qualifications: ['PT', 'DPT'],
    hireDate: '2019-08-20',
    schedule: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    },
    status: 'Active',
  },
  {
    id: '5',
    firstName: 'Lisa',
    lastName: 'Chen',
    photo: 'https://randomuser.me/api/portraits/women/25.jpg',
    role: 'Registered Nurse',
    department: 'Nursing',
    contactNumber: '555-555-6666',
    email: 'lisa.chen@nhms.example.com',
    qualifications: ['RN', 'MSN'],
    hireDate: '2018-11-15',
    schedule: {
      monday: { start: '19:00', end: '07:00' },
      tuesday: { start: '19:00', end: '07:00' },
      wednesday: { start: '19:00', end: '07:00' },
      thursday: { start: null, end: null },
      friday: { start: null, end: null },
      saturday: { start: null, end: null },
      sunday: { start: null, end: null },
    },
    status: 'Active',
  },
];

// Mock data for activities
export const activities = [
  {
    id: '1',
    name: 'Morning Exercise Group',
    description: 'Light stretching and seated exercises',
    location: 'Activity Room',
    startTime: '10:00',
    endTime: '10:45',
    daysOfWeek: ['Monday', 'Wednesday', 'Friday'],
    capacity: 15,
    careLevel: ['Low', 'Medium'],
    facilitator: 'David Brown',
    materials: 'Exercise bands, stress balls',
  },
  {
    id: '2',
    name: 'Memory Care Workshop',
    description: 'Cognitive stimulation activities for memory enhancement',
    location: 'Memory Care Unit',
    startTime: '14:00',
    endTime: '15:00',
    daysOfWeek: ['Monday', 'Thursday'],
    capacity: 8,
    careLevel: ['Medium', 'High'],
    facilitator: 'Rebecca Adams',
    materials: 'Memory games, photo albums, puzzles',
  },
  {
    id: '3',
    name: 'Art Therapy',
    description: 'Creative expression through painting and crafts',
    location: 'Craft Room',
    startTime: '13:30',
    endTime: '14:30',
    daysOfWeek: ['Tuesday', 'Friday'],
    capacity: 12,
    careLevel: ['Low', 'Medium', 'High'],
    facilitator: 'Jennifer Lewis',
    materials: 'Paint, brushes, canvas, crafting supplies',
  },
  {
    id: '4',
    name: 'Music Appreciation',
    description: 'Listening to various musical genres and discussing memories',
    location: 'Lounge',
    startTime: '15:30',
    endTime: '16:30',
    daysOfWeek: ['Wednesday'],
    capacity: 20,
    careLevel: ['Low', 'Medium', 'High'],
    facilitator: 'Michael Garcia',
    materials: 'Music player, speakers, song booklets',
  },
  {
    id: '5',
    name: 'Gardening Club',
    description: 'Indoor and outdoor gardening activities',
    location: 'Garden Patio',
    startTime: '10:30',
    endTime: '11:30',
    daysOfWeek: ['Tuesday', 'Saturday'],
    capacity: 10,
    careLevel: ['Low', 'Medium'],
    facilitator: 'Thomas Rivera',
    materials: 'Gardening tools, plants, soil, pots',
  },
];

// Mock data for resident activity participation
export const activityParticipation = [
  {
    id: '1',
    residentId: '1',
    activityId: '1',
    date: '2023-03-13',
    attended: true,
    engagementLevel: 'High', // Low, Medium, High
    notes: 'Actively participated in all exercises',
  },
  {
    id: '2',
    residentId: '1',
    activityId: '5',
    date: '2023-03-14',
    attended: true,
    engagementLevel: 'Medium',
    notes: 'Enjoyed planting herbs but tired quickly',
  },
  {
    id: '3',
    residentId: '2',
    activityId: '2',
    date: '2023-03-13',
    attended: true,
    engagementLevel: 'Medium',
    notes: 'Recognized family photos, became agitated after 30 minutes',
  },
  {
    id: '4',
    residentId: '2',
    activityId: '3',
    date: '2023-03-14',
    attended: false,
    engagementLevel: null,
    notes: 'Not feeling well, stayed in room',
  },
  {
    id: '5',
    residentId: '3',
    activityId: '4',
    date: '2023-03-15',
    attended: true,
    engagementLevel: 'High',
    notes: 'Sang along to songs from the 1950s',
  },
];

// Mock data for inventory
export const inventory = [
  {
    id: '1',
    name: 'Adult Briefs - Medium',
    category: 'Incontinence Care',
    currentStock: 145,
    minimumStock: 50,
    unit: 'Each',
    location: 'Supply Room A, Shelf 2',
    lastRestockDate: '2023-03-01',
    restockAmount: 200,
    vendor: 'Medical Supply Co.',
  },
  {
    id: '2',
    name: 'Disposable Gloves - Medium',
    category: 'Personal Protective Equipment',
    currentStock: 870,
    minimumStock: 300,
    unit: 'Each',
    location: 'Supply Room A, Shelf 1',
    lastRestockDate: '2023-03-05',
    restockAmount: 1000,
    vendor: 'SafeCare Products',
  },
  {
    id: '3',
    name: 'Blood Glucose Test Strips',
    category: 'Medical Testing',
    currentStock: 210,
    minimumStock: 100,
    unit: 'Each',
    location: 'Medication Room, Cabinet 3',
    lastRestockDate: '2023-02-20',
    restockAmount: 300,
    vendor: 'DiabeCare Inc.',
  },
  {
    id: '4',
    name: 'Hand Sanitizer',
    category: 'Hygiene',
    currentStock: 42,
    minimumStock: 20,
    unit: 'Bottles',
    location: 'Supply Room B, Shelf 3',
    lastRestockDate: '2023-02-15',
    restockAmount: 50,
    vendor: 'CleanMed Supplies',
  },
  {
    id: '5',
    name: 'Disposable Bed Pads',
    category: 'Bedding',
    currentStock: 85,
    minimumStock: 50,
    unit: 'Each',
    location: 'Supply Room A, Shelf 4',
    lastRestockDate: '2023-03-10',
    restockAmount: 100,
    vendor: 'Medical Supply Co.',
  },
];

// Mock data for rooms
export const rooms = [
  {
    id: '1',
    number: '101',
    type: 'Private',
    floor: 1,
    wing: 'East',
    status: 'Occupied',
    occupant: {
      residentId: '1',
      name: 'John Doe',
    },
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV'],
    notes: 'Near nurses station',
  },
  {
    id: '2',
    number: '102',
    type: 'Private',
    floor: 1,
    wing: 'East',
    status: 'Occupied',
    occupant: {
      residentId: '2',
      name: 'Mary Smith',
    },
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV'],
    notes: '',
  },
  {
    id: '3',
    number: '103',
    type: 'Private',
    floor: 1,
    wing: 'East',
    status: 'Occupied',
    occupant: {
      residentId: '3',
      name: 'William Johnson',
    },
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV', 'Oxygen Hookup'],
    notes: 'Requires oxygen supply',
  },
  {
    id: '4',
    number: '104',
    type: 'Private',
    floor: 1,
    wing: 'East',
    status: 'Occupied',
    occupant: {
      residentId: '4',
      name: 'Patricia Brown',
    },
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV', 'Ceiling Lift'],
    notes: 'Ceiling lift installed for transfers',
  },
  {
    id: '5',
    number: '105',
    type: 'Private',
    floor: 1,
    wing: 'East',
    status: 'Occupied',
    occupant: {
      residentId: '5',
      name: 'Richard Miller',
    },
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV'],
    notes: '',
  },
  {
    id: '6',
    number: '201',
    type: 'Private',
    floor: 2,
    wing: 'West',
    status: 'Available',
    occupant: null,
    features: ['Hospital Bed', 'Private Bathroom', 'Window View', 'TV'],
    notes: 'Recently renovated',
  },
  {
    id: '7',
    number: '202',
    type: 'Semi-Private',
    floor: 2,
    wing: 'West',
    status: 'Available',
    occupant: null,
    features: ['Hospital Bed', 'Shared Bathroom', 'Window View'],
    notes: '',
  },
];

// Mock data for notifications
export const notifications = [
  {
    id: '1',
    type: 'urgent',
    title: 'Medication Due',
    message: 'Lisinopril due for John Doe in 15 minutes',
    details: 'Please administer 10mg of Lisinopril to John Doe in Room 101 within the next 15 minutes.',
    actionRequired: 'Administer medication and record in MAR system.',
    timestamp: '2023-03-15T07:45:00',
    isRead: false,
  },
  {
    id: '2',
    type: 'warning',
    title: 'Abnormal Vital Signs',
    message: 'Mary Smith has blood pressure 160/95, above threshold',
    details: 'Blood pressure reading taken at 8:15 AM shows elevated levels. Previous reading was 145/90 at 8:00 PM yesterday.',
    actionRequired: 'Re-check blood pressure in 30 minutes and notify physician if still elevated.',
    timestamp: '2023-03-15T08:15:00',
    isRead: true,
  },
  {
    id: '3',
    type: 'info',
    title: 'Activity Starting Soon',
    message: 'Morning Exercise Group starts in 30 minutes',
    details: 'The Morning Exercise Group will begin at 10:00 AM in the Activity Room. Please assist residents who wish to attend.',
    timestamp: '2023-03-15T09:30:00',
    isRead: false,
  },
  {
    id: '4',
    type: 'warning',
    title: 'Staff Call Out',
    message: 'CNA Sarah Martinez called out sick for today\'s shift',
    details: 'Sarah Martinez has reported illness and will not be available for the 7 AM - 3 PM shift today. Coverage is needed.',
    actionRequired: 'Contact on-call staff for shift coverage.',
    timestamp: '2023-03-15T06:00:00',
    isRead: true,
  },
  {
    id: '5',
    type: 'info',
    title: 'Low Inventory',
    message: 'Hand Sanitizer stock below minimum threshold',
    details: 'Current inventory of hand sanitizer is at 15% of desired stock level. Reorder is recommended.',
    actionRequired: 'Place order with supply department.',
    timestamp: '2023-03-14T14:30:00',
    isRead: false,
  },
];

// Mock data for tasks
export const tasks = [
  {
    id: '1',
    title: 'Administer 8AM medications',
    description: 'Distribute morning medications to residents',
    assignedTo: '1', // Jane Wilson
    status: 'In Progress',
    priority: 'High',
    dueDate: '2023-03-15T08:30:00',
    category: 'Medication',
    relatedTo: { type: 'Floor', id: '1', name: 'First Floor' },
  },
  {
    id: '2',
    title: 'Morning vital signs check',
    description: 'Check vital signs for all residents on first floor',
    assignedTo: '2', // Mark Thompson
    status: 'Completed',
    priority: 'High',
    dueDate: '2023-03-15T09:00:00',
    category: 'Vital Signs',
    relatedTo: { type: 'Floor', id: '1', name: 'First Floor' },
    completedAt: '2023-03-15T08:50:00',
  },
  {
    id: '3',
    title: 'Physical therapy session',
    description: 'One-on-one PT with William Johnson',
    assignedTo: '4', // David Brown
    status: 'Scheduled',
    priority: 'Medium',
    dueDate: '2023-03-15T11:00:00',
    category: 'Therapy',
    relatedTo: { type: 'Resident', id: '3', name: 'William Johnson' },
  },
  {
    id: '4',
    title: 'Restock supply cart',
    description: 'Restock east wing supply cart with fresh linens and hygiene products',
    assignedTo: '3', // Sarah Martinez
    status: 'Not Started',
    priority: 'Medium',
    dueDate: '2023-03-15T14:00:00',
    category: 'Housekeeping',
    relatedTo: { type: 'Wing', id: 'East', name: 'East Wing' },
  },
  {
    id: '5',
    title: 'Complete incident report',
    description: 'Document fall incident for Mary Smith that occurred on night shift',
    assignedTo: '5', // Lisa Chen
    status: 'Completed',
    priority: 'High',
    dueDate: '2023-03-15T10:00:00',
    category: 'Documentation',
    relatedTo: { type: 'Resident', id: '2', name: 'Mary Smith' },
    completedAt: '2023-03-15T09:45:00',
  },
];

// Mock data for the application
// This simulates data that would normally come from an API

// Mock Activities
export const mockActivities = [
  {
    id: 1,
    name: "Morning Exercise",
    description: "Light stretching and movement exercises designed to improve mobility and start the day energized.",
    type: "Physical",
    scheduledTime: "2023-09-18T09:00:00Z",
    durationMinutes: 45,
    location: "Activity Room",
    facilitator: "Sarah Martinez",
    participants: 12,
    materials: [
      { name: "Exercise mats", quantity: 15 },
      { name: "Resistance bands", quantity: 10 }
    ],
    isRecurring: true,
    createdAt: "2023-09-01T10:30:00Z",
    updatedAt: "2023-09-01T10:30:00Z"
  },
  {
    id: 2,
    name: "Memory Games",
    description: "Interactive cognitive exercises to stimulate memory and cognitive function through fun games and activities.",
    type: "Cognitive",
    scheduledTime: "2023-09-18T11:00:00Z",
    durationMinutes: 60,
    location: "Common Area",
    facilitator: "David Brown",
    participants: 8,
    materials: [
      { name: "Memory cards", quantity: 10 },
      { name: "Picture books", quantity: 5 },
      { name: "Word puzzles", quantity: 15 }
    ],
    isRecurring: true,
    createdAt: "2023-09-02T09:15:00Z",
    updatedAt: "2023-09-02T09:15:00Z"
  },
  {
    id: 3,
    name: "Art Therapy",
    description: "Creative expression through painting, drawing, and other art forms to promote relaxation and self-expression.",
    type: "Creative",
    scheduledTime: "2023-09-18T14:00:00Z",
    durationMinutes: 90,
    location: "Art Room",
    facilitator: "Lisa Chen",
    participants: 10,
    materials: [
      { name: "Canvases", quantity: 12 },
      { name: "Paint sets", quantity: 12 },
      { name: "Brushes", quantity: 24 },
      { name: "Easels", quantity: 10 }
    ],
    isRecurring: false,
    createdAt: "2023-09-03T11:45:00Z",
    updatedAt: "2023-09-03T11:45:00Z"
  },
  {
    id: 4,
    name: "Music & Singing",
    description: "Group singing of classic songs to encourage social interaction and reminiscence therapy.",
    type: "Social",
    scheduledTime: "2023-09-19T10:00:00Z",
    durationMinutes: 60,
    location: "Common Area",
    facilitator: "Mark Thompson",
    participants: 15,
    materials: [
      { name: "Song books", quantity: 20 },
      { name: "Piano", quantity: 1 },
      { name: "Percussion instruments", quantity: 10 }
    ],
    isRecurring: true,
    createdAt: "2023-09-04T13:20:00Z",
    updatedAt: "2023-09-04T13:20:00Z"
  },
  {
    id: 5,
    name: "Gardening Club",
    description: "Indoor plant care and gardening activities to connect with nature and promote sensory stimulation.",
    type: "Physical",
    scheduledTime: "2023-09-19T14:00:00Z",
    durationMinutes: 45,
    location: "Garden Patio",
    facilitator: "Sarah Martinez",
    participants: 6,
    materials: [
      { name: "Potting soil", quantity: 1 },
      { name: "Plant pots", quantity: 10 },
      { name: "Gardening tools", quantity: 6 },
      { name: "Plants", quantity: 12 }
    ],
    isRecurring: false,
    createdAt: "2023-09-05T09:30:00Z",
    updatedAt: "2023-09-05T09:30:00Z"
  },
  {
    id: 6,
    name: "Book Club",
    description: "Discussion of selected short stories and books to stimulate intellectual engagement and social interaction.",
    type: "Cognitive",
    scheduledTime: "2023-09-20T15:00:00Z",
    durationMinutes: 60,
    location: "Library",
    facilitator: "Patricia Williams",
    participants: 7,
    materials: [
      { name: "Books", quantity: 10 },
      { name: "Reading glasses", quantity: 5 },
      { name: "Bookmarks", quantity: 10 }
    ],
    isRecurring: true,
    createdAt: "2023-09-06T10:00:00Z",
    updatedAt: "2023-09-06T10:00:00Z"
  },
  {
    id: 7,
    name: "Cooking Class",
    description: "Simple cooking activities to promote independence and sensory stimulation through food preparation.",
    type: "Creative",
    scheduledTime: "2023-09-21T11:00:00Z",
    durationMinutes: 90,
    location: "Kitchen",
    facilitator: "James Wilson",
    participants: 8,
    materials: [
      { name: "Recipe cards", quantity: 10 },
      { name: "Mixing bowls", quantity: 5 },
      { name: "Cooking utensils", quantity: 15 },
      { name: "Ingredients", quantity: 1 }
    ],
    isRecurring: false,
    createdAt: "2023-09-07T14:45:00Z",
    updatedAt: "2023-09-07T14:45:00Z"
  },
  {
    id: 8,
    name: "Movie Afternoon",
    description: "Screening of classic films to promote social engagement and reminiscence.",
    type: "Social",
    scheduledTime: "2023-09-22T14:00:00Z",
    durationMinutes: 120,
    location: "Theater Room",
    facilitator: "Robert Johnson",
    participants: 20,
    materials: [
      { name: "Movie selection", quantity: 3 },
      { name: "Popcorn", quantity: 20 },
      { name: "Comfortable seating", quantity: 25 }
    ],
    isRecurring: true,
    createdAt: "2023-09-08T09:15:00Z",
    updatedAt: "2023-09-08T09:15:00Z"
  },
  {
    id: 9,
    name: "Chair Yoga",
    description: "Gentle yoga exercises performed while seated to improve flexibility, balance, and relaxation.",
    type: "Physical",
    scheduledTime: "2023-09-23T10:30:00Z",
    durationMinutes: 45,
    location: "Activity Room",
    facilitator: "Emily Rodriguez",
    participants: 12,
    materials: [
      { name: "Chairs", quantity: 15 },
      { name: "Yoga straps", quantity: 15 },
      { name: "Small pillows", quantity: 15 }
    ],
    isRecurring: true,
    createdAt: "2023-09-09T11:30:00Z",
    updatedAt: "2023-09-09T11:30:00Z"
  },
  {
    id: 10,
    name: "Meditation Session",
    description: "Guided meditation for relaxation, stress reduction, and mental well-being.",
    type: "Spiritual",
    scheduledTime: "2023-09-24T09:30:00Z",
    durationMinutes: 30,
    location: "Quiet Room",
    facilitator: "Michelle Lee",
    participants: 8,
    materials: [
      { name: "Cushions", quantity: 10 },
      { name: "Blankets", quantity: 10 },
      { name: "Meditation guide", quantity: 1 }
    ],
    isRecurring: true,
    createdAt: "2023-09-10T13:00:00Z",
    updatedAt: "2023-09-10T13:00:00Z"
  }
];

// Mock Participants (Residents)
export const mockParticipants = [
  {
    id: 1,
    firstName: "Margaret",
    lastName: "Johnson",
    age: 78,
    roomNumber: "101",
    photo: null,
    preferences: ["Reading", "Music", "Art"],
    healthConditions: ["Arthritis", "Hypertension"],
    mobilityLevel: "Walker-assisted",
    assignedActivities: [1, 3, 4, 6],
    engagementScores: {
      physical: 65,
      social: 80,
      cognitive: 75,
      creative: 90
    }
  },
  {
    id: 2,
    firstName: "Robert",
    lastName: "Smith",
    age: 82,
    roomNumber: "102",
    photo: null,
    preferences: ["Gardening", "History", "Chess"],
    healthConditions: ["Diabetes", "Vision impairment"],
    mobilityLevel: "Independent",
    assignedActivities: [2, 5, 6, 8],
    engagementScores: {
      physical: 70,
      social: 65,
      cognitive: 85,
      creative: 60
    }
  },
  {
    id: 3,
    firstName: "Alice",
    lastName: "Williams",
    age: 75,
    roomNumber: "103",
    photo: null,
    preferences: ["Cooking", "Dancing", "Movies"],
    healthConditions: ["Parkinson's", "Osteoporosis"],
    mobilityLevel: "Cane-assisted",
    assignedActivities: [4, 7, 8, 9],
    engagementScores: {
      physical: 60,
      social: 85,
      cognitive: 70,
      creative: 80
    }
  },
  {
    id: 4,
    firstName: "Thomas",
    lastName: "Brown",
    age: 84,
    roomNumber: "104",
    photo: null,
    preferences: ["Music", "Sports", "Puzzles"],
    healthConditions: ["Heart condition", "Hearing impairment"],
    mobilityLevel: "Wheelchair",
    assignedActivities: [2, 4, 8, 10],
    engagementScores: {
      physical: 40,
      social: 75,
      cognitive: 80,
      creative: 50
    }
  },
  {
    id: 5,
    firstName: "Patricia",
    lastName: "Miller",
    age: 79,
    roomNumber: "105",
    photo: null,
    preferences: ["Painting", "Meditation", "Birdwatching"],
    healthConditions: ["Anxiety", "Arthritis"],
    mobilityLevel: "Independent",
    assignedActivities: [3, 6, 9, 10],
    engagementScores: {
      physical: 75,
      social: 50,
      cognitive: 65,
      creative: 95
    }
  },
  {
    id: 6,
    firstName: "James",
    lastName: "Wilson",
    age: 81,
    roomNumber: "106",
    photo: null,
    preferences: ["Woodworking", "Reading", "Gardening"],
    healthConditions: ["COPD", "Diabetes"],
    mobilityLevel: "Walker-assisted",
    assignedActivities: [1, 5, 6],
    engagementScores: {
      physical: 55,
      social: 60,
      cognitive: 85,
      creative: 70
    }
  },
  {
    id: 7,
    firstName: "Barbara",
    lastName: "Davis",
    age: 76,
    roomNumber: "107",
    photo: null,
    preferences: ["Knitting", "Baking", "Television"],
    healthConditions: ["Hypertension", "Vision impairment"],
    mobilityLevel: "Independent",
    assignedActivities: [3, 4, 7],
    engagementScores: {
      physical: 60,
      social: 70,
      cognitive: 65,
      creative: 85
    }
  },
  {
    id: 8,
    firstName: "Richard",
    lastName: "Garcia",
    age: 83,
    roomNumber: "108",
    photo: null,
    preferences: ["Chess", "History", "Movies"],
    healthConditions: ["Dementia - early stage", "Hearing impairment"],
    mobilityLevel: "Cane-assisted",
    assignedActivities: [2, 6, 8],
    engagementScores: {
      physical: 50,
      social: 45,
      cognitive: 70,
      creative: 40
    }
  },
  {
    id: 9,
    firstName: "Elizabeth",
    lastName: "Rodriguez",
    age: 77,
    roomNumber: "109",
    photo: null,
    preferences: ["Dancing", "Singing", "Crafts"],
    healthConditions: ["Depression", "Osteoporosis"],
    mobilityLevel: "Independent",
    assignedActivities: [1, 4, 9],
    engagementScores: {
      physical: 80,
      social: 90,
      cognitive: 75,
      creative: 85
    }
  },
  {
    id: 10,
    firstName: "Joseph",
    lastName: "Martinez",
    age: 80,
    roomNumber: "110",
    photo: null,
    preferences: ["Meditation", "Reading", "Walking"],
    healthConditions: ["Stroke recovery", "Hypertension"],
    mobilityLevel: "Walker-assisted",
    assignedActivities: [6, 9, 10],
    engagementScores: {
      physical: 65,
      social: 60,
      cognitive: 70,
      creative: 45
    }
  }
];

// Mock Activity Recommendations
export const mockActivityRecommendations = [
  {
    residentId: 1,
    recommendations: [
      {
        activityId: 3,
        activityName: "Art Therapy",
        category: "Creative",
        matchScore: 95,
        reason: "Based on Margaret's interest in art and high engagement in creative activities",
        benefits: ["Self-expression", "Fine motor skills", "Stress reduction"]
      },
      {
        activityId: 10,
        activityName: "Meditation Session",
        category: "Spiritual",
        matchScore: 85,
        reason: "Could help with managing arthritis pain and promoting relaxation",
        benefits: ["Stress reduction", "Pain management", "Mental well-being"]
      },
      {
        activityId: 7,
        activityName: "Cooking Class",
        category: "Creative",
        matchScore: 80,
        reason: "Would provide sensory stimulation and build on creative interests",
        benefits: ["Sensory stimulation", "Life skills", "Social interaction"]
      }
    ]
  },
  {
    residentId: 2,
    recommendations: [
      {
        activityId: 5,
        activityName: "Gardening Club",
        category: "Physical",
        matchScore: 90,
        reason: "Directly aligns with Robert's interest in gardening",
        benefits: ["Connection to nature", "Light physical activity", "Sensory stimulation"]
      },
      {
        activityId: 2,
        activityName: "Memory Games",
        category: "Cognitive",
        matchScore: 85,
        reason: "Complements cognitive interests like chess and history",
        benefits: ["Cognitive stimulation", "Memory support", "Strategic thinking"]
      },
      {
        activityId: 6,
        activityName: "Book Club",
        category: "Cognitive",
        matchScore: 80,
        reason: "History discussions are often included in book club selections",
        benefits: ["Intellectual stimulation", "Social discussion", "Knowledge sharing"]
      }
    ]
  },
  {
    residentId: 3,
    recommendations: [
      {
        activityId: 7,
        activityName: "Cooking Class",
        category: "Creative",
        matchScore: 95,
        reason: "Directly matches Alice's interest in cooking",
        benefits: ["Familiar activity", "Sensory stimulation", "Life skills practice"]
      },
      {
        activityId: 4,
        activityName: "Music & Singing",
        category: "Social",
        matchScore: 90,
        reason: "Complements interest in dancing with musical activities",
        benefits: ["Movement opportunity", "Social engagement", "Reminiscence"]
      },
      {
        activityId: 9,
        activityName: "Chair Yoga",
        category: "Physical",
        matchScore: 85,
        reason: "Gentle exercise beneficial for Parkinson's and osteoporosis",
        benefits: ["Flexibility", "Balance improvement", "Pain management"]
      }
    ]
  },
  {
    residentId: 4,
    recommendations: [
      {
        activityId: 4,
        activityName: "Music & Singing",
        category: "Social",
        matchScore: 95,
        reason: "Matches Thomas's interest in music",
        benefits: ["Auditory stimulation", "Social connection", "Emotional expression"]
      },
      {
        activityId: 2,
        activityName: "Memory Games",
        category: "Cognitive",
        matchScore: 90,
        reason: "Aligns with interest in puzzles and cognitive activities",
        benefits: ["Problem solving", "Cognitive maintenance", "Achievement"]
      },
      {
        activityId: 10,
        activityName: "Meditation Session",
        category: "Spiritual",
        matchScore: 75,
        reason: "Could benefit heart condition through relaxation techniques",
        benefits: ["Stress reduction", "Blood pressure management", "Mindfulness"]
      }
    ]
  },
  {
    residentId: 5,
    recommendations: [
      {
        activityId: 3,
        activityName: "Art Therapy",
        category: "Creative",
        matchScore: 98,
        reason: "Perfect match for Patricia's interest in painting",
        benefits: ["Creative expression", "Familiar activity", "Sense of accomplishment"]
      },
      {
        activityId: 10,
        activityName: "Meditation Session",
        category: "Spiritual",
        matchScore: 95,
        reason: "Direct match with interest in meditation and can help with anxiety",
        benefits: ["Anxiety reduction", "Mindfulness practice", "Emotional regulation"]
      },
      {
        activityId: 5,
        activityName: "Gardening Club",
        category: "Physical",
        matchScore: 80,
        reason: "Connects with interest in birdwatching through nature-based activity",
        benefits: ["Nature connection", "Sensory stimulation", "Gentle physical activity"]
      }
    ]
  }
];

// Mock Staff
export const mockStaff = [
  {
    id: 1,
    firstName: "Sarah",
    lastName: "Martinez",
    role: "Activity Director",
    email: "s.martinez@nhms.example.com",
    phone: "555-1001",
    photo: null,
    schedule: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
      saturday: null,
      sunday: null
    },
    certifications: ["CPR", "First Aid", "Activity Director Certified"]
  },
  {
    id: 2,
    firstName: "David",
    lastName: "Brown",
    role: "Recreational Therapist",
    email: "d.brown@nhms.example.com",
    phone: "555-1002",
    photo: null,
    schedule: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: { start: "09:00", end: "17:00" },
      friday: null,
      saturday: { start: "10:00", end: "14:00" },
      sunday: null
    },
    certifications: ["CPR", "Certified Therapeutic Recreation Specialist"]
  },
  {
    id: 3,
    firstName: "Lisa",
    lastName: "Chen",
    role: "Art Therapist",
    email: "l.chen@nhms.example.com",
    phone: "555-1003",
    photo: null,
    schedule: {
      monday: { start: "13:00", end: "19:00" },
      tuesday: { start: "13:00", end: "19:00" },
      wednesday: null,
      thursday: { start: "13:00", end: "19:00" },
      friday: { start: "13:00", end: "19:00" },
      saturday: null,
      sunday: null
    },
    certifications: ["Registered Art Therapist", "CPR"]
  },
  {
    id: 4,
    firstName: "Mark",
    lastName: "Thompson",
    role: "Music Therapist",
    email: "m.thompson@nhms.example.com",
    phone: "555-1004",
    photo: null,
    schedule: {
      monday: null,
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: { start: "10:00", end: "18:00" },
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
      saturday: null,
      sunday: null
    },
    certifications: ["Board Certified Music Therapist", "CPR", "First Aid"]
  },
  {
    id: 5,
    firstName: "Patricia",
    lastName: "Williams",
    role: "Occupational Therapist",
    email: "p.williams@nhms.example.com",
    phone: "555-1005",
    photo: null,
    schedule: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: null,
      friday: null,
      saturday: { start: "09:00", end: "15:00" },
      sunday: null
    },
    certifications: ["Licensed Occupational Therapist", "Certified Hand Therapist"]
  },
  {
    id: 6,
    firstName: "James",
    lastName: "Wilson",
    role: "Culinary Instructor",
    email: "j.wilson@nhms.example.com",
    phone: "555-1006",
    photo: null,
    schedule: {
      monday: null,
      tuesday: { start: "11:00", end: "19:00" },
      wednesday: { start: "11:00", end: "19:00" },
      thursday: { start: "11:00", end: "19:00" },
      friday: { start: "11:00", end: "19:00" },
      saturday: null,
      sunday: null
    },
    certifications: ["Culinary Arts Certificate", "Food Safety", "CPR"]
  },
  {
    id: 7,
    firstName: "Robert",
    lastName: "Johnson",
    role: "Activity Assistant",
    email: "r.johnson@nhms.example.com",
    phone: "555-1007",
    photo: null,
    schedule: {
      monday: { start: "10:00", end: "18:00" },
      tuesday: { start: "10:00", end: "18:00" },
      wednesday: null,
      thursday: { start: "10:00", end: "18:00" },
      friday: { start: "10:00", end: "18:00" },
      saturday: { start: "09:00", end: "17:00" },
      sunday: null
    },
    certifications: ["CPR", "First Aid", "Activities Assistant Certification"]
  },
  {
    id: 8,
    firstName: "Emily",
    lastName: "Rodriguez",
    role: "Physical Therapist",
    email: "e.rodriguez@nhms.example.com",
    phone: "555-1008",
    photo: null,
    schedule: {
      monday: { start: "08:00", end: "16:00" },
      tuesday: { start: "08:00", end: "16:00" },
      wednesday: { start: "08:00", end: "16:00" },
      thursday: { start: "08:00", end: "16:00" },
      friday: { start: "08:00", end: "16:00" },
      saturday: null,
      sunday: null
    },
    certifications: ["Doctor of Physical Therapy", "Geriatric Certified Specialist"]
  },
  {
    id: 9,
    firstName: "Michelle",
    lastName: "Lee",
    role: "Wellness Coordinator",
    email: "m.lee@nhms.example.com",
    phone: "555-1009",
    photo: null,
    schedule: {
      monday: { start: "09:00", end: "17:00" },
      tuesday: { start: "09:00", end: "17:00" },
      wednesday: { start: "09:00", end: "17:00" },
      thursday: null,
      friday: null,
      saturday: { start: "09:00", end: "17:00" },
      sunday: { start: "09:00", end: "13:00" }
    },
    certifications: ["Registered Nurse", "Certified Wellness Coach", "Yoga Instructor"]
  },
  {
    id: 10,
    firstName: "William",
    lastName: "Taylor",
    role: "Social Worker",
    email: "w.taylor@nhms.example.com",
    phone: "555-1010",
    photo: null,
    schedule: {
      monday: { start: "08:30", end: "16:30" },
      tuesday: { start: "08:30", end: "16:30" },
      wednesday: { start: "08:30", end: "16:30" },
      thursday: { start: "08:30", end: "16:30" },
      friday: { start: "08:30", end: "16:30" },
      saturday: null,
      sunday: null
    },
    certifications: ["Licensed Clinical Social Worker", "Gerontology Specialty"]
  }
];

// Mock Tasks
export const mockTasks = [
  {
    id: 1,
    title: "Prepare for Morning Exercise",
    description: "Set up activity room with exercise mats and equipment",
    assignedTo: 1, // Staff ID
    scheduledDate: "2023-09-18",
    scheduledTime: "08:30",
    duration: 30,
    priority: "Medium",
    status: "Pending",
    category: "Activity Preparation",
    relatedActivityId: 1
  },
  {
    id: 2,
    title: "Medication Review for Margaret Johnson",
    description: "Review and update medication chart for pain management",
    assignedTo: 10,
    scheduledDate: "2023-09-18",
    scheduledTime: "10:15",
    duration: 20,
    priority: "High",
    status: "Completed",
    category: "Resident Care",
    relatedResidentId: 1
  },
  {
    id: 3,
    title: "Family Meeting with Smith Family",
    description: "Quarterly care update for Robert Smith",
    assignedTo: 10,
    scheduledDate: "2023-09-18",
    scheduledTime: "14:00",
    duration: 45,
    priority: "High",
    status: "Pending",
    category: "Family Communication",
    relatedResidentId: 2
  },
  {
    id: 4,
    title: "Art Supply Inventory",
    description: "Check and order needed art supplies for upcoming activities",
    assignedTo: 3,
    scheduledDate: "2023-09-19",
    scheduledTime: "11:00",
    duration: 60,
    priority: "Medium",
    status: "Pending",
    category: "Inventory Management",
    relatedActivityId: 3
  },
  {
    id: 5,
    title: "Physical Assessment for Alice Williams",
    description: "Quarterly mobility assessment",
    assignedTo: 8,
    scheduledDate: "2023-09-19",
    scheduledTime: "09:30",
    duration: 45,
    priority: "Medium",
    status: "Pending",
    category: "Resident Care",
    relatedResidentId: 3
  },
  {
    id: 6,
    title: "Order Gardening Supplies",
    description: "Purchase soil and new plants for Gardening Club",
    assignedTo: 1,
    scheduledDate: "2023-09-19",
    scheduledTime: "13:00",
    duration: 30,
    priority: "Low",
    status: "Pending",
    category: "Inventory Management",
    relatedActivityId: 5
  },
  {
    id: 7,
    title: "Staff Training - New Activity Tracking System",
    description: "Train activity staff on new digital record-keeping system",
    assignedTo: 1,
    scheduledDate: "2023-09-20",
    scheduledTime: "10:00",
    duration: 90,
    priority: "High",
    status: "Pending",
    category: "Staff Development",
    relatedStaffIds: [1, 2, 3, 4, 6, 7]
  },
  {
    id: 8,
    title: "Room Change Preparation for Thomas Brown",
    description: "Prepare room 106 for Thomas's move from 104",
    assignedTo: 7,
    scheduledDate: "2023-09-20",
    scheduledTime: "14:00",
    duration: 60,
    priority: "Medium",
    status: "Pending",
    category: "Facility Management",
    relatedResidentId: 4
  },
  {
    id: 9,
    title: "Weekly Menu Planning",
    description: "Plan next week's menus including dietary restrictions",
    assignedTo: 6,
    scheduledDate: "2023-09-21",
    scheduledTime: "10:00",
    duration: 120,
    priority: "Medium",
    status: "Pending",
    category: "Nutrition Management"
  },
  {
    id: 10,
    title: "Activity Calendar for October",
    description: "Finalize and print activity calendar for October",
    assignedTo: 1,
    scheduledDate: "2023-09-22",
    scheduledTime: "13:30",
    duration: 90,
    priority: "High",
    status: "Pending",
    category: "Activity Planning"
  }
];

// Mock Notifications
export const mockNotifications = [
  {
    id: 1,
    title: "New Task Assigned",
    message: "You have been assigned to prepare for Morning Exercise at 8:30 AM",
    type: "Task",
    relatedId: 1,
    timestamp: "2023-09-18T08:00:00Z",
    isRead: false,
    recipientId: 1
  },
  {
    id: 2,
    title: "Medication Change Alert",
    message: "Medication changes for Margaret Johnson require review",
    type: "Resident",
    relatedId: 1,
    timestamp: "2023-09-18T09:15:00Z",
    isRead: false,
    recipientId: 10
  },
  {
    id: 3,
    title: "Family Meeting Reminder",
    message: "Meeting with Smith family scheduled for 2:00 PM today",
    type: "Meeting",
    relatedId: 3,
    timestamp: "2023-09-18T13:00:00Z",
    isRead: true,
    recipientId: 10
  },
  {
    id: 4,
    title: "Activity Attendance Update",
    message: "Morning Exercise had 10/12 participants",
    type: "Activity",
    relatedId: 1,
    timestamp: "2023-09-18T10:15:00Z",
    isRead: true,
    recipientId: 1
  },
  {
    id: 5,
    title: "Inventory Alert",
    message: "Art supplies running low - please review the inventory task",
    type: "Inventory",
    relatedId: 4,
    timestamp: "2023-09-19T09:00:00Z",
    isRead: false,
    recipientId: 3
  },
  {
    id: 6,
    title: "Staff Meeting",
    message: "Reminder: Staff meeting tomorrow at 8:30 AM",
    type: "Meeting",
    timestamp: "2023-09-19T16:00:00Z",
    isRead: false,
    recipientId: 1
  },
  {
    id: 7,
    title: "New Resident Arriving",
    message: "New resident arriving tomorrow - prepare welcome package",
    type: "Administrative",
    timestamp: "2023-09-20T09:00:00Z",
    isRead: false,
    recipientId: 1
  },
  {
    id: 8,
    title: "Training Reminder",
    message: "New Activity Tracking System training at 10:00 AM",
    type: "Training",
    relatedId: 7,
    timestamp: "2023-09-20T08:00:00Z",
    isRead: false,
    recipientIds: [1, 2, 3, 4, 6, 7]
  },
  {
    id: 9,
    title: "Room Change Confirmed",
    message: "Thomas Brown's room change to 106 approved for tomorrow",
    type: "Facility",
    relatedId: 8,
    timestamp: "2023-09-19T15:30:00Z",
    isRead: false,
    recipientId: 7
  },
  {
    id: 10,
    title: "Activity Calendar Due",
    message: "October activity calendar due by end of week",
    type: "Reminder",
    relatedId: 10,
    timestamp: "2023-09-20T09:15:00Z",
    isRead: false,
    recipientId: 1
  }
];

// Export all mock data
export default {
  residents,
  carePlans,
  medications,
  vitals,
  staff,
  activities,
  activityParticipation,
  inventory,
  rooms,
  notifications,
  tasks,
  mockActivities,
  mockParticipants,
  mockActivityRecommendations,
  mockStaff,
  mockTasks,
  mockNotifications
}; 