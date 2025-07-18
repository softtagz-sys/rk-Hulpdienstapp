import { useState, useEffect } from 'react';
import type { User } from '../types';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const userData = localStorage.getItem('userData');

      if (token && userData) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.log('Not authenticated');
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      // Simulate API call - replace with actual authentication
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Check demo credentials
      const validCredentials = [
        { email: 'volunteer@rodekruis.nl', password: 'demo123', role: 'volunteer' as const },
        { email: 'supervisor@rodekruis.nl', password: 'demo123', role: 'supervisor' as const }
      ];

      const validUser = validCredentials.find(cred =>
          cred.email === email && cred.password === password
      );

      if (!validUser) {
        return { success: false, error: 'Ongeldige inloggegevens' };
      }

      // Mock user data based on email
      const userData: User = {
        id: 'user_' + Date.now(),
        email,
        name: validUser.role === 'supervisor' ? 'Maria Supervisor' : 'Jan Janssen',
        role: validUser.role,
        departments: ['Sint-Job'],
        qualifications: [
          { id: '1', name: 'ehbo', level: 1 },
          { id: '2', name: 'helper', level: 2 }
        ],
        notifications: true,
        phone: '+31 6 12345678'
      };

      // Store auth data
      localStorage.setItem('authToken', 'mock_token_' + Date.now());
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Er is een fout opgetreden bij het inloggen' };
    }
  };

  const signup = async (email: string, password: string, name: string, role: 'volunteer' | 'supervisor') => {
    try {
      // Simulate API call - replace with actual registration
      await new Promise(resolve => setTimeout(resolve, 1000));

      const userData: User = {
        id: 'user_' + Date.now(),
        email,
        name,
        role,
        departments: ['Sint-Job'],
        qualifications: [],
        notifications: true
      };

      // Store auth data
      localStorage.setItem('authToken', 'mock_token_' + Date.now());
      localStorage.setItem('userData', JSON.stringify(userData));

      setUser(userData);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userData');
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus
  };
};