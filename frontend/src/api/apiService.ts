import type { 
  Service,
  User, 
  Department, 
  ServiceListResponse,
  ServiceRegistrationRequest,
  ApiError 
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/dev';

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options?.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          window.location.href = '/login';
          throw new Error('Authentication required');
        }
        
        const errorData: ApiError = await response.json().catch(() => ({}));
        const errorMessage = errorData.detail?.[0]?.msg || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return {} as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Health check
  async healthCheck(): Promise<unknown> {
    return this.request('/health');
  }

  // Auth endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/v1/auth/me');
  }

  async verifyToken(): Promise<unknown> {
    return this.request('/api/v1/auth/verify-token', { method: 'POST' });
  }

  // User endpoints
  async getMyProfile(): Promise<User> {
    return this.request<User>('/api/v1/users/me');
  }

  async updateMyProfile(profileData: Partial<User>): Promise<User> {
    return this.request<User>('/api/v1/users/me', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
  }

  async listUsers(department?: string, role?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (department) params.append('department', department);
    if (role) params.append('role', role);
    
    const queryString = params.toString();
    const endpoint = `/api/v1/users/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<User[]>(endpoint);
  }

  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/api/v1/users/${userId}`);
  }

  async getQualifiedVolunteers(qualification: string): Promise<User[]> {
    return this.request<User[]>(`/api/v1/users/volunteers/qualified?qualification=${qualification}`);
  }

  // Service endpoints
  async getServices(filters?: {
    department?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ServiceListResponse> {
    const params = new URLSearchParams();
    if (filters?.department) params.append('department', filters.department);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.page_size) params.append('page_size', filters.page_size.toString());
    
    const queryString = params.toString();
    const endpoint = `/api/v1/services/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ServiceListResponse>(endpoint);
  }

  async getService(serviceId: string): Promise<Service> {
    return this.request<Service>(`/api/v1/services/${serviceId}`);
  }

  async createService(serviceData: {
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    department: string;
    required_qualifications?: string[];
    min_volunteers: number;
  }): Promise<Service> {
    return this.request<Service>('/api/v1/services/', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(serviceId: string, serviceData: Partial<{
    title: string;
    description: string;
    date: string;
    start_time: string;
    end_time: string;
    location: string;
    department: string;
    required_qualifications: string[];
    min_volunteers: number;
    status: 'open' | 'closed' | 'cancelled';
  }>): Promise<Service> {
    return this.request<Service>(`/api/v1/services/${serviceId}`, {
      method: 'PUT',
      body: JSON.stringify(serviceData)
    });
  }

  async registerForService(serviceId: string, registrationData: ServiceRegistrationRequest): Promise<void> {
    return this.request(`/api/v1/services/${serviceId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData)
    });
  }

  async assignVolunteerToService(serviceId: string, volunteerId: string): Promise<void> {
    return this.request(`/api/v1/services/${serviceId}/assign/${volunteerId}`, {
      method: 'POST'
    });
  }

  async unassignVolunteerFromService(serviceId: string, volunteerId: string): Promise<void> {
    return this.request(`/api/v1/services/${serviceId}/assign/${volunteerId}`, {
      method: 'DELETE'
    });
  }

  // Department endpoints
  async getDepartments(activeOnly: boolean = true): Promise<Department[]> {
    return this.request<Department[]>(`/api/v1/departments/?active_only=${activeOnly}`);
  }

  async getDepartment(departmentId: string): Promise<Department> {
    return this.request<Department>(`/api/v1/departments/${departmentId}`);
  }

  async createDepartment(departmentData: {
    name: string;
    code: string;
    active?: boolean;
  }): Promise<Department> {
    return this.request<Department>('/api/v1/departments/', {
      method: 'POST',
      body: JSON.stringify(departmentData)
    });
  }

  async updateDepartment(departmentId: string, departmentData: Partial<{
    name: string;
    code: string;
    active: boolean;
  }>): Promise<Department> {
    return this.request<Department>(`/api/v1/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(departmentData)
    });
  }

  // Legacy methods for backward compatibility
  async updateServicePreference(serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen'): Promise<void> {
    return this.registerForService(serviceId, { preference });
  }
}

export const apiService = new ApiService();