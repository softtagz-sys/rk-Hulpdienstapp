import React, { useState } from 'react';
import { Plus, Users, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import ServiceCard from '../components/services/ServiceCard';
import DepartmentSelector from '../components/common/DepartmentSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';

const SupervisorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDepartment, setSelectedDepartment] = useState(user?.departments[0] || 'Sint-Job');
  const { services, isLoading, assignVolunteer } = useServices(selectedDepartment);

  const handleAssignVolunteer = async (serviceId: string, volunteerId: string) => {
    try {
      await assignVolunteer(serviceId, volunteerId);
      alert('Vrijwilliger succesvol toegewezen');
    } catch (error) {
      alert('Er is een fout opgetreden bij het toewijzen van de vrijwilliger.');
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
  const understaffedServices = services.filter(s => 
    s.assignedVolunteers.length < s.maxVolunteers * 0.8
  );
  const totalVolunteers = services.reduce((acc, s) => acc + s.assignedVolunteers.length, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Leidinggevende Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welkom terug, {user?.name}! Beheer diensten en vrijwilligers.
              </p>
            </div>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <DepartmentSelector 
                selectedDepartment={selectedDepartment}
                onDepartmentChange={setSelectedDepartment}
              />
              <Link
                to="/services/create"
                className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus size={16} />
                <span>Nieuwe Dienst</span>
              </Link>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal diensten</p>
                  <p className="text-2xl font-bold text-gray-900">{services.length}</p>
                </div>
                <Calendar className="text-blue-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Komende diensten</p>
                  <p className="text-2xl font-bold text-gray-900">{upcomingServices.length}</p>
                </div>
                <Plus className="text-green-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Totaal vrijwilligers</p>
                  <p className="text-2xl font-bold text-gray-900">{totalVolunteers}</p>
                </div>
                <Users className="text-purple-600" size={24} />
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Onderbezette diensten</p>
                  <p className="text-2xl font-bold text-gray-900">{understaffedServices.length}</p>
                </div>
                <AlertCircle className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Services Management */}
        <div className="space-y-8">
          {/* Understaffed Services Alert */}
          {understaffedServices.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <AlertCircle className="text-red-600" size={24} />
                <h3 className="text-lg font-semibold text-red-800">Aandacht vereist</h3>
              </div>
              <p className="text-red-700 mb-4">
                De volgende diensten hebben onvoldoende vrijwilligers aangemeld:
              </p>
              <div className="space-y-2">
                {understaffedServices.map(service => (
                  <div key={service.id} className="flex items-center justify-between bg-white p-3 rounded">
                    <div>
                      <span className="font-medium">{service.title}</span>
                      <span className="text-sm text-gray-600 ml-2">
                        ({service.assignedVolunteers.length}/{service.maxVolunteers})
                      </span>
                    </div>
                    <Link
                      to={`/services/${service.id}`}
                      className="text-red-600 hover:text-red-800 font-medium"
                    >
                      Bekijk details
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* All Services */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Alle Diensten</h2>
            {services.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Er zijn geen diensten gepland voor deze afdeling.</p>
                <Link
                  to="/services/create"
                  className="inline-flex items-center space-x-2 mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                  <Plus size={16} />
                  <span>Nieuwe Dienst Aanmaken</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    showManagement={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorDashboard;