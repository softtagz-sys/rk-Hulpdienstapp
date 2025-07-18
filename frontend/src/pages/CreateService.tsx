import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Save, Calendar, Clock, MapPin, Users } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const CreateService: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        startTime: '',
        endTime: '',
        location: '',
        department: user?.departments[0] || 'Sint-Job',
        maxVolunteers: 8,
        requiredQualifications: [] as string[]
    });

    const availableQualifications = ['helper', 'ehbo', 'event', 'vpk', 'arts'];
    const departments = ['Sint-Job', 'Rand'];

    const handleInputChange = (field: string, value: string | number | string[]) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
        if (formData.maxVolunteers < 1) {
            setError('Minimaal 1 vrijwilliger vereist');
            return false;
        }

        // Check if end time is after start time
        const startTime = new Date(`2000-01-01T${formData.startTime}`);
        const endTime = new Date(`2000-01-01T${formData.endTime}`);
        if (endTime <= startTime) {
            setError('Eindtijd moet na starttijd zijn');
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
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real app, this would make an API call to create the service
            console.log('Creating service:', formData);

            alert('Dienst succesvol aangemaakt!');
            navigate('/');
        } catch (error) {
            setError('Er is een fout opgetreden bij het aanmaken van de dienst.');
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
                                    Datum *
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
                                    <Clock size={16} className="inline mr-2" />
                                    Starttijd *
                                </label>
                                <input
                                    type="time"
                                    value={formData.startTime}
                                    onChange={(e) => handleInputChange('startTime', e.target.value)}
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
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                                    Maximum aantal vrijwilligers *
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="50"
                                    value={formData.maxVolunteers}
                                    onChange={(e) => handleInputChange('maxVolunteers', parseInt(e.target.value))}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    required
                                />
                            </div>
                        </div>

                        {/* Required Qualifications */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                Vereiste kwalificaties
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableQualifications.map(qualification => (
                                    <label key={qualification} className="flex items-center space-x-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.requiredQualifications.includes(qualification)}
                                            onChange={() => handleQualificationToggle(qualification)}
                                            className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                                        />
                                        <span className="text-sm text-gray-700 capitalize">{qualification}</span>
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-500 mt-2">
                                Selecteer de kwalificaties die vereist zijn voor deze dienst.
                            </p>
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