import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Clock, Mail } from 'lucide-react';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');
  const [user, setUser] = useState<any>(null);
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    } else {
      setStatus('error');
      setMessage('Geen verificatie token gevonden');
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    try {
      const response = await fetch(`/api/verify-email?token=${verificationToken}`);
      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setUser(data.user);
      } else if (data.expired) {
        setStatus('expired');
        setMessage(data.error);
      } else {
        setStatus('error');
        setMessage(data.error);
      }
    } catch (error) {
      setStatus('error');
      setMessage('Er is een fout opgetreden bij het verifiëren van je e-mail');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-600" />;
      case 'error':
      case 'expired':
        return <XCircle className="w-16 h-16 text-red-600" />;
      default:
        return <Clock className="w-16 h-16 text-orange-600 animate-pulse" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
      case 'expired':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-orange-50 border-orange-200';
    }
  };

  const getStatusTextColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-800';
      case 'error':
      case 'expired':
        return 'text-red-800';
      default:
        return 'text-orange-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className={`rounded-2xl border-2 p-8 text-center ${getStatusColor()}`}>
          {/* Icon */}
          <div className="flex justify-center mb-6">
            {getStatusIcon()}
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold mb-4">
            {status === 'success' && 'E-mail Geverifieerd! 🎉'}
            {status === 'error' && 'Verificatie Mislukt'}
            {status === 'expired' && 'Verificatie Verlopen'}
            {status === 'loading' && 'E-mail Verifiëren...'}
          </h1>

          {/* Message */}
          <p className={`text-lg mb-6 ${getStatusTextColor()}`}>
            {message}
          </p>

          {/* Success Actions */}
          {status === 'success' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="font-semibold text-gray-900 mb-2">Welkom bij BitBeheer!</h3>
                <p className="text-sm text-gray-600">
                  Je account is succesvol geverifieerd. Je kunt nu inloggen en alle functies gebruiken.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-center"
                >
                  🚀 Ga naar BitBeheer
                </a>
                <a
                  href="/#login"
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
                >
                  🔐 Inloggen
                </a>
              </div>
            </div>
          )}

          {/* Error Actions */}
          {(status === 'error' || status === 'expired') && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <h3 className="font-semibold text-gray-900 mb-2">
                  {status === 'expired' ? 'Verificatie Verlopen' : 'Verificatie Mislukt'}
                </h3>
                <p className="text-sm text-gray-600">
                  {status === 'expired' 
                    ? 'Je verificatie link is verlopen. Registreer opnieuw om een nieuwe link te ontvangen.'
                    : 'Er is een probleem opgetreden. Probeer opnieuw of neem contact met ons op.'
                  }
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <a
                  href="/"
                  className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors text-center"
                >
                  🔄 Opnieuw Registreren
                </a>
                <a
                  href="mailto:update@bitbeheer.nl"
                  className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors text-center"
                >
                  📧 Contact Opnemen
                </a>
              </div>
            </div>
          )}

          {/* Loading State */}
          {status === 'loading' && (
            <div className="space-y-4">
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <h3 className="font-semibold text-gray-900 mb-2">Verificatie in Uitvoering</h3>
                <p className="text-sm text-gray-600">
                  We controleren je verificatie link...
                </p>
              </div>
              
              <div className="flex items-center justify-center gap-2 text-orange-600">
                <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm">Bezig met verifiëren...</span>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
              <Mail className="w-4 h-4" />
              <span>BitBeheer Email Verificatie</span>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Heb je vragen? Neem contact op via update@bitbeheer.nl
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
