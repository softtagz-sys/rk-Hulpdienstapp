export interface User {
  id: string;
  email: string;
  name: string;
  role: 'volunteer' | 'supervisor';
  departments: string[];
  qualifications: Qualification[];
  allergies?: string;
  medicalInfo?: string;
  notifications: boolean;
  phone?: string;
  avatar?: string;
}

export interface Qualification {
  id: string;
  name: 'helper' | 'ehbo' | 'event' | 'vpk' | 'arts';
  level: number;
  expiryDate?: string;
}

export interface Service {
  id: string;
  title: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  department: string;
  requiredQualifications: string[];
  maxVolunteers: number;
  assignedVolunteers: ServiceAssignment[];
  status: 'open' | 'full' | 'cancelled';
}

export interface ServiceAssignment {
  id: string;
  serviceId: string;
  volunteerId: string;
  volunteerName: string;
  volunteerQualifications: string[];
  preference: 'enrolled' | 'reserve' | 'not_chosen';
  status: 'assigned' | 'pending' | 'declined';
  notes?: string;
  assignedBy?: string;
  assignedAt?: string;
}

export interface ServicePreference {
  serviceId: string;
  preference: 'enrolled' | 'reserve' | 'not_chosen';
  availableHours?: string[];
  notes?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  active: boolean;
}