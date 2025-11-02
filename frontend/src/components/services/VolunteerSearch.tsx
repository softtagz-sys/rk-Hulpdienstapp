import React, { useState } from 'react';
import { Search, UserPlus, Award } from 'lucide-react';
import { apiService } from '../../api/apiService';
import { useToast } from '../../contexts/ToastContext';
import type { User } from '../../types';

interface VolunteerSearchProps {
  serviceId: string;
  serviceDepartment: string;
  onVolunteerAdded: () => void;
}

const VolunteerSearch: React.FC<VolunteerSearchProps> = ({
  serviceId,
  serviceDepartment,
  onVolunteerAdded
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [addingVolunteerId, setAddingVolunteerId] = useState<string | null>(null);
  const { showToast } = useToast();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const results = await apiService.searchVolunteers(searchQuery, serviceDepartment);
      setSearchResults(results);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Fout bij zoeken naar vrijwilligers';
      showToast(errorMsg, 'error');
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddVolunteer = async (volunteerId: string) => {
    setAddingVolunteerId(volunteerId);
    try {
      await apiService.assignVolunteerToService(serviceId, volunteerId);
      showToast('Vrijwilliger succesvol toegevoegd', 'success');

      // Clear search and refresh
      setSearchQuery('');
      setSearchResults([]);
      onVolunteerAdded();
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Fout bij toevoegen vrijwilliger';
      showToast(errorMsg, 'error');
    } finally {
      setAddingVolunteerId(null);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Vrijwilliger Toevoegen</h3>

      {/* Search Input */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Zoek vrijwilliger op naam..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
          <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={isSearching || !searchQuery.trim()}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Zoeken...' : 'Zoeken'}
        </button>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-gray-600">{searchResults.length} vrijwilliger(s) gevonden</p>
          {searchResults.map((volunteer) => (
            <div
              key={volunteer.id}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-600">
                    {volunteer.name.charAt(0)}
                  </span>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{volunteer.name}</h4>
                  <p className="text-sm text-gray-600">{volunteer.email}</p>
                  {volunteer.qualifications && volunteer.qualifications.length > 0 && (
                    <div className="flex items-center gap-2 mt-1">
                      <Award size={14} className="text-blue-600" />
                      <div className="flex flex-wrap gap-1">
                        {volunteer.qualifications.map((qual, index) => (
                          <span
                            key={index}
                            className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"
                          >
                            {qual}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {(!volunteer.qualifications || volunteer.qualifications.length === 0) && (
                    <p className="text-xs text-gray-500 mt-1">Geen kwalificaties</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleAddVolunteer(volunteer.id)}
                disabled={addingVolunteerId === volunteer.id}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus size={16} />
                <span>{addingVolunteerId === volunteer.id ? 'Toevoegen...' : 'Toevoegen'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* No Results Message */}
      {!isSearching && searchQuery && searchResults.length === 0 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Geen vrijwilligers gevonden met de naam "{searchQuery}"
        </p>
      )}

      {/* Help Text */}
      {!searchQuery && (
        <p className="text-sm text-gray-500">
          Zoek op naam om vrijwilligers uit de afdeling {serviceDepartment} te vinden
        </p>
      )}
    </div>
  );
};

export default VolunteerSearch;
