import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Save } from 'lucide-react';
import { useServices } from '../hooks/useServices';
import { apiService } from '../api/apiService';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ServiceRegistration: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { services, isLoading } = useServices();
  const [selectedHours, setSelectedHours] = useState<string[]>([]);
  const [preference, setPreference] = useState<'enrolled' | 'reserve' | 'not_chosen'>('enrolled');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const service = services.find(s => s.id === id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <LoadingSpinner size="lg" className="h-64" />
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dienst niet gevonden</h1>
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

  const generateTimeSlots = () => {
    const start = new Date(`2000-01-01T${service.startTime}`);
    const end = new Date(`2000-01-01T${service.endTime}`);
    const slots = [];
    
    const current = new Date(start);
    while (current < end) {
      const timeString = current.toLocaleTimeString('nl-NL', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      slots.push(timeString);
      current.setHours(current.getHours() + 1);
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleHourToggle = (hour: string) => {
    setSelectedHours(prev => 
      prev.includes(hour) 
        ? prev.filter(h => h !== hour)
        : [...prev, hour]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await apiService.registerForService(service.id, selectedHours, notes);
      alert('Inschrijving succesvol verzonden!');
      navigate(`/services/${service.id}`);
    } catch (error) {
      alert('Er is een fout opgetreden bij het verzenden van je inschrijving.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <Link
            to={`/services/${service.id}`}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Terug</span>
          </Link>
          <div className="h-6 w-px bg-gray-300"></div>
          <h1 className="text-2xl font-bold text-gray-900">Inschrijven voor Dienst</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Service Info */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">{service.title}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{new Date(service.date).toLocaleDateString('nl-NL')}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <Clock size={16} className="mr-2" />
                  <span>{service.startTime} - {service.endTime}</span>
                </div>
                <div className="text-gray-600">
                  <strong>Locatie:</strong> {service.location}
                </div>
                <div className="text-gray-600">
                  <strong>Beschrijving:</strong> {service.description}
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Preference Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Voorkeur
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'enrolled', label: 'Inschrijven', color: 'green' },
                      { value: 'reserve', label: 'Reserve', color: 'yellow' },
                      { value: 'not_chosen', label: 'Niet beschikbaar', color: 'gray' }
                    ].map(option => (
                      <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="preference"
                          value={option.value}
                          checked={preference === option.value}
                          onChange={(e) => setPreference(e.target.value as any)}
                          className="w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                        />
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          option.color === 'green' ? 'bg-green-100 text-green-800' :
                          option.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {option.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                {preference !== 'not_chosen' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Beschikbare uren (optioneel)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {timeSlots.map(hour => (
                        <label key={hour} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedHours.includes(hour)}
                            onChange={() => handleHourToggle(hour)}
                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                          />
                          <span className="text-sm text-gray-700">{hour}</span>
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Selecteer de uren waarin je beschikbaar bent. Laat leeg als je de hele dienst beschikbaar bent.
                    </p>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Opmerkingen (optioneel)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    placeholder="Eventuele opmerkingen, speciale wensen, of aanvullende informatie..."
                  />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                  <Link
                    to={`/services/${service.id}`}
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
                    <span>{isSubmitting ? 'Verzenden...' : 'Inschrijving verzenden'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceRegistration;