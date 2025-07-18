import React, { useState } from 'react';
import { Plus, Calendar, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/services/ServiceCard';
import DepartmentSelector from '../components/common/DepartmentSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState(user?.departments[0] || 'Sint-Job');
  const { services, isLoading, updatePreference } = useServices(selectedDepartment);

  const handlePreferenceChange = async (serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen') => {
    try {
      await updatePreference(serviceId, preference);
      // Show success message
      const preferenceText = preference === 'enrolled' ? 'ingeschreven' : 
                           preference === 'reserve' ? 'reserve' : 'afgemeld';
      alert(`Voorkeur succesvol gewijzigd naar ${preferenceText}`);
    } catch (error) {
      alert('Er is een fout opgetreden bij het wijzigen van uw voorkeur.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" className="h-64" />
        </div>
      </div>
    );
  }

  const upcomingServices = services.filter(s => new Date(s.date) >= new Date());
  const myServices = services.filter(s => 
    s.assignedVolunteers.some(a => a.volunteerId === user?.id)
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vrijwilliger Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welkom terug, {user?.name}! Beheer je diensten en voorkeuren.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <DepartmentSelector 
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
              />
              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                <span>Profiel</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Mijn diensten</p>
                  <p className="text-2xl font-bold text-gray-900">{myServices.length}</p>
                </div>
                <Calendar className="text-red-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Komende diensten</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingServices.length}</p>
                </div>
                <Plus className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Ingeschreven</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {services.filter(s => s.assignedVolunteers.some(a => a.volunteerId === user?.id && a.preference === 'enrolled')).length}
                  </p>
                </div>
                <div className="w-6 h-6 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          {/* My Services */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Mijn Diensten</h2>
            {myServices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Je hebt nog geen diensten waaraan je deelneemt.</p>
                <p className="text-gray-500 mt-2">Scroll naar beneden om je in te schrijven voor komende diensten.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myServices.map(service => {
                  const userAssignment = service.assignedVolunteers.find(a => a.volunteerId === user?.id);
                  return (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      userAssignment={userAssignment}
                      onPreferenceChange={handlePreferenceChange}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* Available Services */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Beschikbare Diensten</h2>
            {upcomingServices.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Er zijn momenteel geen komende diensten beschikbaar.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingServices.map(service => {
                  const userAssignment = service.assignedVolunteers.find(a => a.volunteerId === user?.id);
                  return (
                    <ServiceCard
                      key={service.id}
                      service={service}
                      userAssignment={userAssignment}
                      onPreferenceChange={handlePreferenceChange}
                    />
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VolunteerDashboard;