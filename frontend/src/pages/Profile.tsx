import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { apiService } from '../api/apiService';
import ProfileForm from '../components/profile/ProfileForm';
import type { User } from '../types';

const Profile: React.FC = () => {
  const { user, checkAuthStatus } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Niet ingelogd</h1>
            <p className="text-gray-600">Je moet ingelogd zijn om je profiel te bekijken.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleProfileSave = async (profileData: Partial<User>) => {
    try {
      await apiService.updateProfile(profileData);
      await checkAuthStatus(); // Refresh user data
    } catch (error) {
      throw new Error('Failed to update profile');
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Profiel</h1>
        </div>

        {/* Profile Form */}
        <ProfileForm user={user} onSave={handleProfileSave} />
      </div>
    </div>
  );
};

export default Profile;