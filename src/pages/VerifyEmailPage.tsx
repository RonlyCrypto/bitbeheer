import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'expired'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');
      const email = searchParams.get('email');

      if (!token || !email) {
        setStatus('error');
        setMessage('Ongeldige verificatie link');
        return;
      }

      try {
        const response = await fetch('/api/verify-email-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token, email }),
        });

        const result = await response.json();

        if (result.success) {
          setStatus('success');
          setMessage('Je account is succesvol geactiveerd! Je kunt nu inloggen.');
          
          // Redirect to login after 3 seconds
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else if (result.expired) {
          setStatus('expired');
          setMessage('De verificatie link is verlopen. Neem contact op voor een nieuwe link.');
        } else {
          setStatus('error');
          setMessage(result.error || 'Er is een fout opgetreden bij het verifiëren van je account.');
        }
      } catch (error) {
        console.error('Verification error:', error);
        setStatus('error');
        setMessage('Er is een onverwachte fout opgetreden.');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'expired':
        return 'text-orange-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Email Verificatie
          </h2>
          <p className={`mt-2 text-lg ${getStatusColor()}`}>
            {message}
          </p>
        </div>

        {status === 'loading' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Je account wordt geactiveerd...</p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-green-800 mb-2">
                🎉 Welkom bij BitBeheer!
              </h3>
              <p className="text-sm text-green-700">
                Je account is nu actief. Je wordt automatisch doorgestuurd naar de login pagina.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Ga naar Login
            </button>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Verificatie Mislukt
              </h3>
              <p className="text-sm text-red-700">
                Er is een probleem opgetreden. Controleer je link of neem contact op.
              </p>
            </div>
            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Terug naar Home
            </button>
          </div>
        )}

        {status === 'expired' && (
          <div className="text-center space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-md p-4">
              <h3 className="text-lg font-medium text-orange-800 mb-2">
                Link Verlopen
              </h3>
              <p className="text-sm text-orange-700">
                Je verificatie link is verlopen. Neem contact op voor een nieuwe link.
              </p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/contact')}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Neem Contact Op
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Terug naar Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}