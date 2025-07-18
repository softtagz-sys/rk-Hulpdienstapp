import type { Service, ServiceAssignment, User, Department } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Mock data for demonstration
const mockServices: Service[] = [
  {
    id: '1',
    title: 'Nieuwjaarsduik Scheveningen',
    description: 'EHBO-post bij de nieuwjaarsduik',
    date: '2025-01-01',
    startTime: '10:00',
    endTime: '16:00',
    location: 'Scheveningen Beach',
    department: 'Sint-Job',
    requiredQualifications: ['ehbo'],
    maxVolunteers: 8,
    assignedVolunteers: [
      {
        id: '1',
        serviceId: '1',
        volunteerId: 'user1',
        volunteerName: 'Jan Janssen',
        volunteerQualifications: ['ehbo', 'helper'],
        preference: 'enrolled',
        status: 'assigned'
      }
    ],
    status: 'open'
  },
  {
    id: '2',
    title: 'Voetbalwedstrijd Ajax - Feyenoord',
    description: 'Medische ondersteuning bij voetbalwedstrijd',
    date: '2025-01-15',
    startTime: '18:00',
    endTime: '23:00',
    location: 'Johan Cruijff Arena',
    department: 'Sint-Job',
    requiredQualifications: ['ehbo', 'event'],
    maxVolunteers: 12,
    assignedVolunteers: [],
    status: 'open'
  }
];

const mockDepartments: Department[] = [
  { id: '1', name: 'Sint-Job', code: 'SJ', active: true },
  { id: '2', name: 'Rand', code: 'RD', active: true }
];

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    // In a real app, this would make actual HTTP requests
    // For demo purposes, we'll simulate API calls with mock data
    
    const url = `${API_BASE_URL}${endpoint}`;
    console.log(`API Call: ${options?.method || 'GET'} ${url}`);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Return mock data based on endpoint
    if (endpoint.includes('/services')) {
      return mockServices as T;
    }
    
    if (endpoint.includes('/departments')) {
      return mockDepartments as T;
    }
    
    return {} as T;
  }

  async getServices(departmentId?: string): Promise<Service[]> {
    const services = await this.request<Service[]>('/services');
    return departmentId ? services.filter(s => s.department === departmentId) : services;
  }

  async getService(id: string): Promise<Service> {
    const services = await this.request<Service[]>('/services');
    const service = services.find(s => s.id === id);
    if (!service) throw new Error('Service not found');
    return service;
  }

  async updateServicePreference(serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen'): Promise<void> {
    await this.request(`/services/${serviceId}/preference`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ preference })
    });
  }

  async assignVolunteerToService(serviceId: string, volunteerId: string): Promise<void> {
    await this.request(`/services/${serviceId}/assign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ volunteerId })
    });
  }

  async getDepartments(): Promise<Department[]> {
    return await this.request<Department[]>('/departments');
  }

  async registerForService(serviceId: string, hours: string[], notes?: string): Promise<void> {
    await this.request(`/services/${serviceId}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hours, notes })
    });
  }

  async updateProfile(profileData: Partial<User>): Promise<User> {
    return await this.request<User>('/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profileData)
    });
  }
}

export const apiService = new ApiService();