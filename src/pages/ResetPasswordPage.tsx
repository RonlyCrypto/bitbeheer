import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'form' | 'submitting' | 'success' | 'error' | 'expired'>(
    token ? 'form' : 'error'
  );
  const [message, setMessage] = useState(token ? '' : 'Ongeldige reset-link');
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
      const response = await fetch('/api/password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset', token, password }),
      });
      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setMessage('Je wachtwoord is bijgewerkt. Je kunt nu inloggen.');
        setTimeout(() => navigate('/'), 3000);
      } else if (result.expired) {
        setStatus('expired');
        setMessage('Deze reset-link is verlopen. Vraag een nieuwe aan via "Wachtwoord vergeten".');
      } else {
        setStatus('error');
        setMessage(result.error || 'Er is een fout opgetreden.');
      }
    } catch (error) {
      console.error('Reset password error:', error);
      setStatus('error');
      setMessage('Er is een onverwachte fout opgetreden.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="text-6xl mb-4">
            {status === 'success' ? '✅' : status === 'error' ? '❌' : status === 'expired' ? '⏰' : '🔐'}
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Nieuw wachtwoord instellen</h2>
          {message && <p className="mt-2 text-lg text-gray-700">{message}</p>}
        </div>

        {(status === 'form' || status === 'submitting') && (
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
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
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
            >
              {status === 'submitting' ? 'Bezig...' : 'Wachtwoord instellen'}
            </button>
          </form>
        )}

        {(status === 'success' || status === 'error' || status === 'expired') && (
          <button
            onClick={() => navigate('/')}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            Terug naar Home
          </button>
        )}
      </div>
    </div>
  );
}
