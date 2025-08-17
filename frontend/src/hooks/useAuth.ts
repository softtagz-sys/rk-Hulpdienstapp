import { useState, useEffect } from 'react';
import { Amplify } from 'aws-amplify';
import {
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  fetchAuthSession,
  confirmSignUp as amplifyConfirmSignUp,
  resendSignUpCode,
  type SignUpInput
} from 'aws-amplify/auth';
import { CookieStorage } from 'aws-amplify/utils';
import { cognitoUserPoolsTokenProvider } from 'aws-amplify/auth/cognito';
import type { User } from '../types';

// Configure Amplify
Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_USER_POOL_ID!,
      userPoolClientId: import.meta.env.VITE_USER_POOL_CLIENT_ID!,
    },
  },
});

// Use CookieStorage for token persistence
cognitoUserPoolsTokenProvider.setKeyValueStorage(
    new CookieStorage({ domain: window.location.hostname })
);

console.log(import.meta.env.VITE_USER_POOL_ID, import.meta.env.VITE_USER_POOL_CLIENT_ID);

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { checkAuthStatus(); }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();

      if (currentUser && session.tokens) {
        setUser({
          id: currentUser.userId,
          email: currentUser.signInDetails?.loginId ?? '',
          name: currentUser.signInDetails?.loginId?.split('@')[0] ?? 'User',
          role: 'volunteer',
          departments: ['Sint-Job'],
          qualifications: [],
          notifications: true,
          phone: ''
        });
        setIsAuthenticated(true);
      }
    } catch {
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { isSignedIn, nextStep } = await signIn({ username: email, password });
      if (isSignedIn) {
        await checkAuthStatus();
        return { success: true };
      }
      if (nextStep.signInStep === 'CONFIRM_SIGN_UP')
        return { success: false, error: 'Account niet geverifieerd. Controleer je email.', needsVerification: true };
      return { success: false, error: 'Aanmelding vereist aanvullende stappen.' };
    } catch (error: any) {
      console.error('Signup error:', error);
      let message = 'Er is een fout opgetreden bij het inloggen';
      if (error.name === 'NotAuthorizedException') message = 'Ongeldige inloggegevens';
      if (error.name === 'UserNotConfirmedException') message = 'Account niet geverifieerd. Controleer je email.';
      if (error.name === 'UserNotFoundException') message = 'Gebruiker niet gevonden';
      if (error.name === 'TooManyRequestsException') message = 'Te veel inlogpogingen. Probeer het later opnieuw.';
      return { success: false, error: message };
    }
  };

  const signup = async (
      email: string,
      password: string,
      name?: string,
      role?: 'volunteer' | 'supervisor'
  ) => {
    try {
      const resolvedName = name?.trim() || email.split('@')[0] || 'User';
      const resolvedRole = role || 'volunteer';

      const signUpInput: SignUpInput = {
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: resolvedName,
            'custom:role': resolvedRole
          }
        }
      };

      console.log('[Auth] SignUp payload:', signUpInput);

      const { isSignUpComplete, nextStep } = await signUp(signUpInput);

      if (isSignUpComplete) return { success: true };
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        return {
          success: false,
          error: 'Registratie succesvol! Controleer je email voor de verificatiecode.',
          needsVerification: true
        };
      }

      return { success: false, error: 'Registratie vereist aanvullende stappen.' };
    } catch (error: any) {
      console.error('[Auth] Signup full error:', error);
      let message = 'Registratie mislukt';
      if (error.name === 'UsernameExistsException') message = 'Een account met dit emailadres bestaat al';
      if (error.name === 'InvalidPasswordException') message = 'Wachtwoord voldoet niet aan de vereisten';
      if (error.name === 'InvalidParameterException') message = `Ongeldige parameters opgegeven: ${error.message || ''}`;
      return { success: false, error: message };
    }
  };

  const confirmSignUp = async (email: string, code: string) => {
    try {
      await amplifyConfirmSignUp({ username: email, confirmationCode: code });
      return { success: true };
    } catch (error: any) {
      let message = 'Verificatie mislukt';
      if (error.name === 'CodeMismatchException') message = 'Ongeldige verificatiecode';
      if (error.name === 'ExpiredCodeException') message = 'Verificatiecode is verlopen';
      return { success: false, error: message };
    }
  };

  const resendVerificationCode = async (email: string) => {
    try {
      await resendSignUpCode({ username: email });
      return { success: true };
    } catch {
      return { success: false, error: 'Fout bij het versturen van verificatiecode' };
    }
  };

  const logout = async () => {
    try {
      await signOut({ global: true });
    } finally {
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    signup,
    logout,
    checkAuthStatus,
    confirmSignUp,
    resendVerificationCode
  };
};
