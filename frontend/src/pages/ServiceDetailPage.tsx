import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Users, Calendar } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { useAuth } from '../hooks/useAuth';
import ServiceDetail from '../components/services/ServiceDetail';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { services, isLoading, assignVolunteer } = useServices();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" className="h-64" />
        </div>
      </div>
    );
  }

  const service = services.find(s => s.id === id);

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dienst niet gevonden</h1>
            <p className="text-gray-600 mb-6">De opgevraagde dienst kon niet worden gevonden.</p>
            <Link
              to="/"
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <ArrowLeft size={16} />
              <span>Terug naar Dashboard</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const canManage = user?.role === 'supervisor';
  const userAssignment = service.assignedVolunteers.find(a => a.volunteerId === user?.id);

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/"
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Terug</span>
            </Link>
            <div className="h-6 w-px bg-gray-300"></div>
            <h1 className="text-2xl font-bold text-gray-900">Dienst Details</h1>
          </div>

          <div className="flex items-center space-x-4">
            {canManage && (
              <Link
                to={`/services/${service.id}/edit`}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit size={16} />
                <span>Bewerken</span>
              </Link>
            )}
            {!userAssignment && user?.role === 'volunteer' && (
              <Link
                to={`/services/${service.id}/register`}
                className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <Users size={16} />
                <span>Inschrijven</span>
              </Link>
            )}
          </div>
        </div>

        {/* Service Details */}
        <ServiceDetail
          service={service}
          onAssignVolunteer={canManage ? assignVolunteer : undefined}
          showManagement={canManage}
        />

        {/* User Status */}
        {userAssignment && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Mijn Status</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Voorkeur:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userAssignment.preference === 'enrolled' ? 'bg-green-100 text-green-800' :
                    userAssignment.preference === 'reserve' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {userAssignment.preference === 'enrolled' ? 'Ingeschreven' :
                     userAssignment.preference === 'reserve' ? 'Reserve' : 'Niet gekozen'}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    userAssignment.status === 'assigned' ? 'bg-green-100 text-green-800' :
                    userAssignment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {userAssignment.status === 'assigned' ? 'Toegewezen' :
                     userAssignment.status === 'pending' ? 'In afwachting' : 'Afgewezen'}
                  </span>
                </div>
              </div>
              <Link
                to={`/services/${service.id}/register`}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Wijzig inschrijving
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetailPage;