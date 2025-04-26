/**
 * Default data for testing when APIs are not available 
 */

export const defaultPrograms = [
  {
    id: 1,
    name: "Maternal Care Initiative",
    description: "A comprehensive program for expectant mothers.",
    start_date: "2023-01-01",
    end_date: "2023-12-31",
    eligibility_criteria: "Pregnant women between 18-45 years",
    capacity: 500,
    location: "Nairobi County",
    category: {
      id: 1,
      name: "Maternal Health",
      description: "Programs focused on maternal and child health care."
    }
  },
  {
    id: 2,
    name: "Diabetes Management",
    description: "A program to help patients manage diabetes effectively.",
    start_date: "2023-02-01",
    end_date: "2023-11-30",
    eligibility_criteria: "Diagnosed with Type 1 or Type 2 diabetes",
    capacity: 300,
    location: "Mombasa County",
    category: {
      id: 2,
      name: "Chronic Disease",
      description: "Programs for managing chronic diseases like diabetes and hypertension."
    }
  },
  {
    id: 3,
    name: "Vaccination Drive",
    description: "Regular vaccination program for children and adults.",
    start_date: "2023-03-01",
    end_date: "2023-10-31",
    eligibility_criteria: "All age groups",
    capacity: 1000,
    location: "Multiple Counties",
    category: {
      id: 3,
      name: "Preventive Care",
      description: "Programs focused on health prevention and wellness."
    }
  }
];

export const defaultCategories = [
  {
    id: 1,
    name: "Maternal Health",
    description: "Programs focused on maternal and child health care."
  },
  {
    id: 2,
    name: "Chronic Disease",
    description: "Programs for managing chronic diseases like diabetes and hypertension."
  },
  {
    id: 3,
    name: "Preventive Care",
    description: "Programs focused on health prevention and wellness."
  }
];

export const defaultClients = [
  {
    client_id: "550e8400-e29b-41d4-a716-446655440000",
    first_name: "John",
    last_name: "Doe",
    id_number: "12345678",
    date_of_birth: "1990-01-01",
    gender: "M",
    phone_number: "+254700123456",
    email: "johndoe@example.com",
    county: "Nairobi",
    sub_county: "Westlands",
    ward: "Parklands",
    created_at: "2023-01-15T12:30:45Z",
    updated_at: "2023-01-15T12:30:45Z"
  },
  {
    client_id: "550e8400-e29b-41d4-a716-446655440001",
    first_name: "Jane",
    last_name: "Smith",
    id_number: "87654321",
    date_of_birth: "1985-05-15",
    gender: "F",
    phone_number: "+254700654321",
    email: "janesmith@example.com",
    county: "Mombasa",
    sub_county: "Nyali",
    ward: "Frere Town",
    created_at: "2023-01-20T09:15:30Z",
    updated_at: "2023-01-20T09:15:30Z"
  }
];

export const defaultEnrollments = [
  {
    id: 1,
    client: defaultClients[0].client_id,
    program: defaultPrograms[0].id,
    program_name: defaultPrograms[0].name,
    program_code: "MCI-001",
    enrollment_date: "2023-02-01",
    is_active: true,
    facility_name: "Kenyatta National Hospital",
    mfl_code: "KNH001"
  },
  {
    id: 2,
    client: defaultClients[1].client_id,
    program: defaultPrograms[1].id,
    program_name: defaultPrograms[1].name,
    program_code: "DM-001",
    enrollment_date: "2023-02-15",
    is_active: true,
    facility_name: "Coast General Hospital",
    mfl_code: "CGH001"
  }
];

export const defaultDashboardData = {
  clients: {
    total: 145,
    new_this_month: 23,
  },
  programs: {
    active: 15,
    total: 18,
  },
  enrollments: {
    by_status: [
      { status: "Active", count: 120 },
      { status: "Completed", count: 45 },
      { status: "Withdrawn", count: 10 },
      { status: "Pending", count: 15 }
    ],
    by_program: [
      { program__name: "Maternal Care Initiative", count: 50 },
      { program__name: "Diabetes Management", count: 35 },
      { program__name: "Vaccination Drive", count: 70 },
      { program__name: "HIV Prevention", count: 25 },
      { program__name: "Nutrition Support", count: 10 }
    ],
  },
  clients_by_county: [
    { county: "Nairobi", count: 50 },
    { county: "Mombasa", count: 35 },
    { county: "Kisumu", count: 25 },
    { county: "Nakuru", count: 20 },
    { county: "Eldoret", count: 15 }
  ],
}; 