import React, { useState } from 'react';
import { Save, AlertCircle } from 'lucide-react';
import type { User, Qualification } from '../../types';

interface ProfileFormProps {
  user: User;
  onSave: (userData: Partial<User>) => Promise<void>;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    allergies: user.allergies || '',
    medicalInfo: user.medicalInfo || '',
    notifications: user.notifications
  });
  const [selectedQualifications, setSelectedQualifications] = useState<string[]>(
    user.qualifications.map(q => q.name)
  );
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>(user.departments);
  const [isSaving, setIsSaving] = useState(false);

  const availableQualifications = ['helper', 'ehbo', 'event', 'vpk', 'arts'];
  const availableDepartments = ['Sint-Job', 'Rand'];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQualificationChange = (qualification: string) => {
    setSelectedQualifications(prev => 
      prev.includes(qualification)
        ? prev.filter(q => q !== qualification)
        : [...prev, qualification]
    );
  };

  const handleDepartmentChange = (department: string) => {
    setSelectedDepartments(prev => 
      prev.includes(department)
        ? prev.filter(d => d !== department)
        : [...prev, department]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const qualifications: Qualification[] = selectedQualifications.map(name => ({
        id: `${name}_${Date.now()}`,
        name: name as any,
        level: 1
      }));

      await onSave({
        ...formData,
        qualifications,
        departments: selectedDepartments
      });

      alert('Profiel succesvol bijgewerkt!');
    } catch (error) {
      alert('Er is een fout opgetreden bij het opslaan van uw profiel.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Mijn Profiel</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Naam
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefoonnummer
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kwalificaties
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableQualifications.map(qualification => (
              <label key={qualification} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedQualifications.includes(qualification)}
                  onChange={() => handleQualificationChange(qualification)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700 capitalize">{qualification}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Departments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Afdelingen
          </label>
          <div className="grid grid-cols-2 gap-3">
            {availableDepartments.map(department => (
              <label key={department} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedDepartments.includes(department)}
                  onChange={() => handleDepartmentChange(department)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <span className="text-sm text-gray-700">{department}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Medical Information */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Allergieën / Dieetwensen
          </label>
          <textarea
            value={formData.allergies}
            onChange={(e) => handleInputChange('allergies', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Bijv. noten, lactose-intolerant, vegetarisch..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Medische informatie
          </label>
          <textarea
            value={formData.medicalInfo}
            onChange={(e) => handleInputChange('medicalInfo', e.target.value)}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            placeholder="Relevante medische informatie voor leidinggevenden..."
          />
        </div>

        {/* Notifications */}
        <div>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.notifications}
              onChange={(e) => handleInputChange('notifications', e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm text-gray-700">Meldingen ontvangen via e-mail</span>
          </label>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            <span>{isSaving ? 'Opslaan...' : 'Profiel opslaan'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;