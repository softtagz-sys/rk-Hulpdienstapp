import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../contexts/ToastContext';
import {apiService} from "../api/apiService.ts";
import {QUALIFICATIONS} from "../constants/Qualifications.ts";

const CreateService: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    endDate: '',
    rvTime: '',
    location: '',
    department: user?.departments[0] || 'Sint-Job',
    minVolunteers: 2,
    requiredQualifications: [] as string[]
  });

  const availableQualifications = QUALIFICATIONS;
  const departments = ['Sint-Job'];

  const handleInputChange = (field: string, value: string | number | string[]) => {
    setFormData(prev => {
      const updates: any = { [field]: value };

      // Auto-set end date to start date when start date changes
      if (field === 'date' && !prev.endDate) {
        updates.endDate = value;
      }

      return { ...prev, ...updates };
    });
    setError('');
  };

  const handleQualificationToggle = (qualification: string) => {
    setFormData(prev => ({
      ...prev,
      requiredQualifications: prev.requiredQualifications.includes(qualification)
        ? prev.requiredQualifications.filter(q => q !== qualification)
        : [...prev.requiredQualifications, qualification]
    }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Titel is verplicht');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Beschrijving is verplicht');
      return false;
    }
    if (!formData.date) {
      setError('Datum is verplicht');
      return false;
    }
    if (!formData.startTime) {
      setError('Starttijd is verplicht');
      return false;
    }
    if (!formData.endTime) {
      setError('Eindtijd is verplicht');
      return false;
    }
    if (!formData.location.trim()) {
      setError('Locatie is verplicht');
      return false;
    }
    if (formData.minVolunteers < 1) {
      setError('Minimaal 1 vrijwilliger vereist');
      return false;
    }

    if (!formData.endDate) {
      setError('Einddatum is verplicht');
      return false;
    }

    // Validate dates and times with proper date handling
    const startDateTime = new Date(`${formData.date}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

    if (endDateTime <= startDateTime) {
      setError('Einddatum/tijd moet na startdatum/tijd zijn');
      return false;
    }

    // Check if shift is not unreasonably long (more than 7 days)
    const diffDays = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 7) {
      setError('Diensten kunnen maximaal 7 dagen duren');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const serviceData = {
        title: formData.title,
        description: formData.description,
        date: formData.date,
        start_time: formData.startTime,
        end_time: formData.endTime,
        end_date: formData.endDate,
        rv_time: formData.rvTime || undefined,
        location: formData.location,
        department: formData.department,
        required_qualifications: formData.requiredQualifications,
        min_volunteers: formData.minVolunteers
      };
      
      await apiService.createService(serviceData);

      // Silent success - just navigate (per UX feedback)
      navigate('/');
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Er is een fout opgetreden bij het aanmaken van de dienst.';
      showToast(errorMsg, 'error', 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (user?.role !== 'supervisor') {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Geen toegang</h1>
            <p className="text-gray-600 mb-6">Je hebt geen rechten om diensten aan te maken.</p>
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

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to="/"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Terug naar Dashboard</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">Nieuwe Dienst Aanmaken</h1>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titel *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Bijv. Nieuwjaarsduik Scheveningen"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Beschrijving *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Beschrijf de dienst en wat er van vrijwilligers verwacht wordt..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Startdatum *
                </label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange('date', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Starttijd *
                </label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleInputChange('startTime', e.target.value)}
                  step="900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">24-uurs formaat (bijv. 14:30)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar size={16} className="inline mr-2" />
                  Einddatum *
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => handleInputChange('endDate', e.target.value)}
                  min={formData.date}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  Eindtijd *
                </label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleInputChange('endTime', e.target.value)}
                  step="900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">24-uurs formaat (bijv. 23:45)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock size={16} className="inline mr-2" />
                  RV tijd (Rendez-vous)
                </label>
                <input
                  type="time"
                  value={formData.rvTime}
                  onChange={(e) => handleInputChange('rvTime', e.target.value)}
                  step="900"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">Verzameltijd voor vrijwilligers (optioneel)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Locatie *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Bijv. Scheveningen Beach"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Afdeling
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleInputChange('department', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Users size={16} className="inline mr-2" />
                  Minimum aantal vrijwilligers *
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.minVolunteers}
                  onChange={(e) => handleInputChange('minVolunteers', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                to="/"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                <Save size={16} />
                <span>{isSubmitting ? 'Aanmaken...' : 'Dienst aanmaken'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateService;