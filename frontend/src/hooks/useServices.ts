import { useState, useEffect } from 'react';
import type { Service, ServiceAssignment } from '../types';
import { apiService } from '../api/apiService';

export const useServices = (departmentId?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [departmentId]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getServices(departmentId);
      setServices(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen') => {
    try {
      await apiService.updateServicePreference(serviceId, preference);
      await fetchServices(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update preference');
    }
  };

  const assignVolunteer = async (serviceId: string, volunteerId: string) => {
    try {
      await apiService.assignVolunteerToService(serviceId, volunteerId);
      await fetchServices(); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign volunteer');
    }
  };

  return {
    services,
    isLoading,
    error,
    fetchServices,
    updatePreference,
    assignVolunteer
  };
};