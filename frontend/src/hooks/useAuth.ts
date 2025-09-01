import { useState, useEffect } from 'react';
import { signIn, signUp, signOut, getCurrentUser, fetchAuthSession, confirmSignUp } from 'aws-amplify/auth';
import { apiService } from '../api/apiService';
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
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (currentUser && session.tokens?.idToken) {
        const token = session.tokens.idToken.toString();
        localStorage.setItem('authToken', token);

        // Get user profile from our API
        try {
          const userData = await apiService.getCurrentUser();
          const transformedUser: User = {
            ...userData,
            id: userData.user_id || userData.id,
            qualifications: userData.qualifications || []
          };

          setUser(transformedUser);
          setIsAuthenticated(true);
        } catch (apiError) {
          // If user doesn't exist in our API yet, create a basic profile
          const basicUser: User = {
            id: currentUser.userId,
            user_id: currentUser.userId,
            email: currentUser.signInDetails?.loginId || '',
            name: currentUser.signInDetails?.loginId?.split('@')[0] || 'Gebruiker',
            role: currentUser.signInDetails?.loginId === import.meta.env.VITE_ADMIN_EMAIL ? 'supervisor' : 'volunteer',
            departments: ['Sint-Job'],
            qualifications: [],
            notifications: true,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          setUser(basicUser);
          setIsAuthenticated(true);
        }
      } else {
        setIsAuthenticated(false);
        localStorage.removeItem('authToken');
      }
    } catch (error) {
      console.log('Not authenticated:', error);
      setIsAuthenticated(false);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await signIn({
        username: email,
        password: password,
      });

      if (result.isSignedIn) {
        await checkAuthStatus();
        return { success: true };
      } else {
        return { success: false, error: 'Aanmelding niet voltooid' };
      }
    } catch (error: any) {
      let errorMessage = 'Er is een fout opgetreden bij het inloggen';

      if (error.name === 'NotAuthorizedException') {
        errorMessage = 'Ongeldige inloggegevens';
      } else if (error.name === 'UserNotConfirmedException') {
        errorMessage = 'Account is nog niet bevestigd. Controleer uw e-mail.';
      } else if (error.name === 'UserNotFoundException') {
        errorMessage = 'Gebruiker niet gevonden';
      }

      return { success: false, error: errorMessage };
    }
  };

  const signup = async (email: string, password: string, name: string) => {
    try {
      // Validate email domain
      if (!email.endsWith('@vrijwilliger.rodekruis.be')) {
        return {
          success: false,
          error: 'Alleen e-mailadressen met @vrijwilliger.rodekruis.be zijn toegestaan'
        };
      }

      const result = await signUp({
        username: email,
        password: password,
        options: {
          userAttributes: {
            email: email,
            name: name,
          },
        },
      });

      if (result.isSignUpComplete) {
        return { success: true, requiresConfirmation: false };
      } else {
        return {
          success: true,
          requiresConfirmation: true,
          message: 'Controleer uw e-mail voor de bevestigingscode'
        };
      }
    } catch (error: any) {
      let errorMessage = 'Er is een fout opgetreden bij het aanmaken van het account';

      if (error.name === 'UsernameExistsException') {
        errorMessage = 'Er bestaat al een account met dit e-mailadres';
      } else if (error.name === 'InvalidPasswordException') {
        errorMessage = 'Wachtwoord voldoet niet aan de vereisten';
      } else if (error.name === 'InvalidParameterException') {
        errorMessage = 'Ongeldige parameters opgegeven';
      }

      return { success: false, error: errorMessage };
    }
  };

  const confirmSignup = async (email: string, confirmationCode: string) => {
    try {
      await confirmSignUp({
        username: email,
        confirmationCode: confirmationCode,
      });

      return { success: true };
    } catch (error: any) {
      let errorMessage = 'Er is een fout opgetreden bij het bevestigen van het account';

      if (error.name === 'CodeMismatchException') {
        errorMessage = 'Ongeldige bevestigingscode';
      } else if (error.name === 'ExpiredCodeException') {
        errorMessage = 'Bevestigingscode is verlopen';
      }

      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await signOut();
      localStorage.removeItem('authToken');
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
    confirmSignup,
    logout,
    checkAuthStatus
  };
};