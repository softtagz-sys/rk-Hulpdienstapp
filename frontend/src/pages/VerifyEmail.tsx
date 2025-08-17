import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const VerifyEmail: React.FC = () => {
    const { confirmSignUp, resendVerificationCode } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [verificationCode, setVerificationCode] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [email, setEmail] = useState('');

    useEffect(() => {
        const emailFromState = location.state?.email;
        if (emailFromState) {
            setEmail(emailFromState);
        } else {
            // If no email in state, redirect to login
            navigate('/login');
        }
    }, [location, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verificationCode.trim()) {
            setError('Voer de verificatiecode in');
            return;
        }

        setIsSubmitting(true);
        setError('');

        const result = await confirmSignUp(email, verificationCode);

        if (result.success) {
            setSuccess('Account succesvol geverifieerd! U wordt doorgestuurd...');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } else {
            setError(result.error || 'Verificatie mislukt');
        }

        setIsSubmitting(false);
    };

    const handleResendCode = async () => {
        setIsResending(true);
        setError('');
        setSuccess('');

        const result = await resendVerificationCode(email);

        if (result.success) {
            setSuccess('Nieuwe verificatiecode verstuurd naar uw email');
        } else {
            setError(result.error || 'Fout bij het versturen van code');
        }

        setIsResending(false);
    };

    if (!email) {
        return null; // Will redirect in useEffect
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Mail className="text-white" size={24} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Email Verificatie</h1>
                    <p className="text-gray-600 mt-2">
                        We hebben een verificatiecode gestuurd naar:<br />
                        <span className="font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <p className="text-red-800 text-sm">{error}</p>
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <p className="text-green-800 text-sm">{success}</p>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Verificatiecode
                        </label>
                        <input
                            type="text"
                            value={verificationCode}
                            onChange={(e) => {
                                setVerificationCode(e.target.value);
                                setError('');
                            }}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent text-center text-lg tracking-widest"
                            placeholder="123456"
                            maxLength={6}
                            required
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">
                            Voer de 6-cijferige code uit uw email in
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-red-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                    >
                        {isSubmitting ? (
                            <>
                                <LoadingSpinner size="sm" className="mr-2" />
                                Verifiëren...
                            </>
                        ) : (
                            'Account Verifiëren'
                        )}
                    </button>

                    <div className="text-center space-y-2">
                        <button
                            type="button"
                            onClick={handleResendCode}
                            disabled={isResending}
                            className="text-red-600 hover:text-red-700 text-sm font-medium disabled:opacity-50"
                        >
                            {isResending ? 'Versturen...' : 'Code opnieuw versturen'}
                        </button>

                        <div>
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="inline-flex items-center text-gray-600 hover:text-gray-700 text-sm"
                            >
                                <ArrowLeft size={16} className="mr-1" />
                                Terug naar inloggen
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VerifyEmail;
