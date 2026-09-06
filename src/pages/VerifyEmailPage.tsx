import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const email = searchParams.get('email');

  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error' | 'expired'>(
    token && email ? 'form' : 'error'
  );
  const [message, setMessage] = useState(
    token && email ? '' : 'Ongeldige verificatie link'
  );
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (password.length < 8) {
      setFormError('Je wachtwoord moet minstens 8 tekens lang zijn.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('De wachtwoorden komen niet overeen.');
      return;
    }

    setStatus('submitting');

    try {
      const response = await fetch('/api/verify-email-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, email, password }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('Je account is succesvol geactiveerd! Je kunt nu inloggen met je nieuwe wachtwoord.');
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

  const getStatusIcon = () => {
    switch (status) {
      case 'submitting':
        return '⏳';
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'expired':
        return '⏰';
      default:
        return '🔐';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'submitting':
        return 'text-blue-600';
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'expired':
        return 'text-orange-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">{getStatusIcon()}</div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Account activeren
          </h2>
          {message && (
            <p className={`mt-2 text-lg ${getStatusColor()}`}>
              {message}
            </p>
          )}
        </div>

        {(status === 'form' || status === 'submitting') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <p className="text-sm text-gray-600">
              Kies een wachtwoord om je account te activeren en direct in te kunnen loggen.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Wachtwoord</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Minstens 8 tekens"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig wachtwoord</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Herhaal je wachtwoord"
              />
            </div>
            {formError && (
              <p className="text-sm text-red-600">{formError}</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Bezig met activeren...' : 'Account activeren'}
            </button>
          </form>
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
