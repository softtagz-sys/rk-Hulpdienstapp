import React, { useState } from 'react';
import { User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">+</span>
            </div>
            <h1 className="text-xl font-bold">Rode Kruis</h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-sm">
              {user?.name} • {user?.role === 'volunteer' ? 'Vrijwilliger' : 'Leidinggevende'}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              <span>Uitloggen</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-red-500">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User size={20} />
                <div>
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-sm text-red-200">
                    {user?.role === 'volunteer' ? 'Vrijwilliger' : 'Leidinggevende'}
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-left"
              >
                <LogOut size={16} />
                <span>Uitloggen</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;