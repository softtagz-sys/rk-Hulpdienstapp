import React from 'react';
import { Calendar, Clock, MapPin, Users, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Service, ServiceAssignment } from '../../types';

interface ServiceCardProps {
  service: Service;
  userAssignment?: ServiceAssignment;
  onPreferenceChange?: (serviceId: string, preference: 'enrolled' | 'reserve' | 'not_chosen') => void;
  showManagement?: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  service,
  userAssignment,
  onPreferenceChange,
  showManagement = false
}) => {
  const getPreferenceColor = (preference?: string) => {
    switch (preference) {
      case 'enrolled':
        return 'bg-green-100 border-green-500 text-green-800';
      case 'reserve':
        return 'bg-yellow-100 border-yellow-500 text-yellow-800';
      case 'not_chosen':
        return 'bg-gray-100 border-gray-300 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getPreferenceText = (preference?: string) => {
    switch (preference) {
      case 'enrolled':
        return 'Ingeschreven';
      case 'reserve':
        return 'Reserve';
      case 'not_chosen':
        return 'Niet gekozen';
      default:
        return 'Geen voorkeur';
    }
  };

  const occupancyPercentage = (service.assignedVolunteers.length / service.maxVolunteers) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.title}</h3>
            <p className="text-gray-600 text-sm mb-4">{service.description}</p>
          </div>
          <Link
            to={`/services/${service.id}`}
            className="text-red-600 hover:text-red-700 transition-colors"
          >
            <ChevronRight size={20} />
          </Link>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar size={16} className="mr-2" />
            <span>{new Date(service.date).toLocaleDateString('nl-NL')}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2" />
            <span>{service.startTime} - {service.endTime}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2" />
            <span>{service.location}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-2" />
            <span>{service.assignedVolunteers.length} / {service.maxVolunteers} vrijwilligers</span>
          </div>
        </div>

        {showManagement && (
          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-gray-600">Bezetting</span>
              <span className="font-medium">{Math.round(occupancyPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-red-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${occupancyPercentage}%` }}
              />
            </div>
          </div>
        )}

        {userAssignment && (
          <div className="flex items-center justify-between">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getPreferenceColor(userAssignment.preference)}`}>
              {getPreferenceText(userAssignment.preference)}
            </div>
            <div className="flex space-x-2">
              {onPreferenceChange && (
                <>
                  <button
                    onClick={() => onPreferenceChange(service.id, 'enrolled')}
                    className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                  >
                    Inschrijven
                  </button>
                  <button
                    onClick={() => onPreferenceChange(service.id, 'reserve')}
                    className="text-xs px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors"
                  >
                    Reserve
                  </button>
                  <button
                    onClick={() => onPreferenceChange(service.id, 'not_chosen')}
                    className="text-xs px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Afmelden
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;