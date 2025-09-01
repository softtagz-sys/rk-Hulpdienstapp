import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const Signup: React.FC = () => {
  const { signup, confirmSignup } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<'signup' | 'confirm'>('signup');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    confirmationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const validateSignupForm = () => {
    if (!formData.name.trim()) {
      setError('Naam is verplicht');
      return false;
    }
    if (!formData.email.trim()) {
      setError('E-mailadres is verplicht');
      return false;
    }
    if (!formData.email.endsWith('@vrijwilliger.rodekruis.be')) {
      setError('Alleen e-mailadressen met @vrijwilliger.rodekruis.be zijn toegestaan');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Wachtwoord moet minimaal 8 karakters bevatten');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen');
      return false;
    }
    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSignupForm()) {
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await signup(formData.email, formData.password, formData.name);
    
    if (result.success) {
      if (result.requiresConfirmation) {
        setStep('confirm');
      } else {
        navigate('/login');
      }
    } else {
      setError(result.error || 'Account aanmaken mislukt');
    }
    
    setIsSubmitting(false);
  };

  const handleConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.confirmationCode.trim()) {
      setError('Bevestigingscode is verplicht');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const result = await confirmSignup(formData.email, formData.confirmationCode);
    
    if (result.success) {
      alert('Account succesvol bevestigd! U kunt nu inloggen.');
      navigate('/login');
    } else {
      setError(result.error || 'Bevestiging mislukt');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-8">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">+</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Rode Kruis</h1>
          <p className="text-gray-600 mt-2">Hulpdienst Platform</p>
        </div>

        {step === 'signup' ? (
          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account aanmaken</h2>
              <p className="text-gray-600 text-sm">
                Maak een vrijwilligersaccount aan voor het platform.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Volledige naam
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Jan Janssen"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="naam@vrijwilliger.rodekruis.be"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Alleen e-mailadressen met @vrijwilliger.rodekruis.be zijn toegestaan
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Minimaal 8 karakters"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bevestig wachtwoord
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Herhaal uw wachtwoord"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="text-blue-600 mt-0.5" size={16} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Automatische toewijzing:</p>
                  <p>Alle nieuwe accounts worden automatisch toegewezen aan de afdeling Sint-Job.</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Account aanmaken...
                </>
              ) : (
                'Account aanmaken'
              )}
            </button>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Al een account?{' '}
                <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
                  Inloggen
                </Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmation} className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Account bevestigen</h2>
              <p className="text-gray-600 text-sm">
                We hebben een bevestigingscode naar <strong>{formData.email}</strong> gestuurd.
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bevestigingscode
              </label>
              <input
                type="text"
                value={formData.confirmationCode}
                onChange={(e) => handleInputChange('confirmationCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg tracking-widest"
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Bevestigen...
                </>
              ) : (
                'Account bevestigen'
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setStep('signup')}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Terug naar aanmelden
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;