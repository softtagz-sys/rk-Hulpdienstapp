import React from 'react';
import { Calendar, Clock, MapPin, Users, Award, Phone, Mail } from 'lucide-react';
import type { Service, ServiceAssignment } from '../../types';

interface ServiceDetailProps {
  service: Service;
  onAssignVolunteer?: (volunteerId: string) => void;
  showManagement?: boolean;
}

const ServiceDetail: React.FC<ServiceDetailProps> = ({
  service,
  onAssignVolunteer,
  showManagement = false
}) => {
  const getQualificationIcon = (qualification: string) => {
    return <Award size={16} className="text-blue-600" />;
  };

  const getPreferenceColor = (preference: string) => {
    switch (preference) {
      case 'enrolled':
        return 'text-green-600 bg-green-100';
      case 'reserve':
        return 'text-yellow-600 bg-yellow-100';
      case 'not_chosen':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'declined':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Service Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">{service.title}</h2>
        <p className="text-gray-600 mb-6">{service.description}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center text-gray-600">
            <Calendar size={20} className="mr-3" />
            <span>{new Date(service.date).toLocaleDateString('nl-NL', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock size={20} className="mr-3" />
            <span>{service.startTime} - {service.endTime}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <MapPin size={20} className="mr-3" />
            <span>{service.location}</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Users size={20} className="mr-3" />
            <span>{service.assignedVolunteers.length} / {service.maxVolunteers} vrijwilligers</span>
          </div>
        </div>

        {service.requiredQualifications.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Vereiste kwalificaties</h3>
            <div className="flex flex-wrap gap-2">
              {service.requiredQualifications.map((qualification, index) => (
                <div key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  {getQualificationIcon(qualification)}
                  <span className="ml-2 capitalize">{qualification}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Volunteers List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Vrijwilligers ({service.assignedVolunteers.length})
        </h3>

        {service.assignedVolunteers.length === 0 ? (
          <p className="text-gray-500 text-center py-8">Nog geen vrijwilligers ingeschreven</p>
        ) : (
          <div className="space-y-4">
            {service.assignedVolunteers.map((assignment) => (
              <div
                key={assignment.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-600">
                      {assignment.volunteerName.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.volunteerName}</h4>
                    <div className="flex items-center space-x-2 mt-1">
                      {assignment.volunteerQualifications.map((qual, index) => (
                        <span key={index} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {qual}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getPreferenceColor(assignment.preference)}`}>
                    {assignment.preference === 'enrolled' && 'Ingeschreven'}
                    {assignment.preference === 'reserve' && 'Reserve'}
                    {assignment.preference === 'not_chosen' && 'Niet gekozen'}
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                    {assignment.status === 'assigned' && 'Toegewezen'}
                    {assignment.status === 'pending' && 'In afwachting'}
                    {assignment.status === 'declined' && 'Afgewezen'}
                  </div>
                  {showManagement && (
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Phone size={16} />
                      </button>
                      <button className="text-blue-600 hover:text-blue-800 transition-colors">
                        <Mail size={16} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceDetail;