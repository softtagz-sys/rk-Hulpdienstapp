export interface User {
  id: string;
  user_id?: string;
  email: string;
  name: string;
  role: 'volunteer' | 'supervisor';
  departments: string[];
  qualifications: string[];
  notifications: boolean;
  phone?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: string;
  service_id?: string;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
  location: string;
  department: string;
  required_qualifications: string[];
  max_volunteers: number;
  assigned_volunteers: ServiceAssignment[];
  assigned_count?: number;
  status: 'open' | 'closed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
}

export interface ServiceAssignment {
  id: string;
  assignment_id?: string;
  service_id: string;
  volunteer_id: string;
  volunteer_name: string;
  volunteer_qualifications: string[];
  preference: 'enrolled' | 'reserve' | 'not_chosen';
  status: 'assigned' | 'pending' | 'declined';
  created_at?: string;
  updated_at?: string;
}

export interface ServiceRegistrationRequest {
  preference: 'enrolled' | 'reserve' | 'not_chosen';
  notes?: string;
}

export interface Department {
  id: string;
  department_id?: string;
  name: string;
  code: string;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ServiceListResponse {
  services: Service[];
  total_count: number;
  page?: number;
  page_size?: number;
}

export interface ApiError {
  detail?: Array<{
    loc: (string | number)[];
    msg: string;
    type: string;
  }>;
}