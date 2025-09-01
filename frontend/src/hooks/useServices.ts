import { useState, useEffect } from 'react';
import type { Service } from '../types';
import { apiService } from '../api/apiService';

export const useServices = (department?: string) => {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchServices();
  }, [department]);

  const fetchServices = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getServices({ department });
      
      // Transform API response to match frontend expectations
      const transformedServices = response.services.map(service => ({
        ...service,
        id: service.service_id || service.id,
        startTime: service.start_time,
        endTime: service.end_time,
        requiredQualifications: service.required_qualifications || [],
        maxVolunteers: service.max_volunteers,
        assignedVolunteers: (service.assigned_volunteers || []).map(assignment => ({
          ...assignment,
          id: assignment.assignment_id || assignment.id,
          serviceId: assignment.service_id,
          volunteerId: assignment.volunteer_id,
          volunteerName: assignment.volunteer_name,
          volunteerQualifications: assignment.volunteer_qualifications || []
        }))
      }));
      
      setServices(transformedServices);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch services');
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreference = async (serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen') => {
    try {
      await apiService.registerForService(serviceId, { preference });
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