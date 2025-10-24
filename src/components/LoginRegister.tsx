import { useState } from 'react';
import { User, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';

interface LoginRegisterProps {
  onLogin: (email: string, password: string) => boolean;
  onRegister: (email: string, password: string, name: string) => Promise<boolean>;
  onPasswordReset: (email: string) => Promise<boolean>;
}

export default function LoginRegister({ onLogin, onRegister, onPasswordReset }: LoginRegisterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (mode === 'login') {
        const success = onLogin(email, password);
        if (success) {
          setMessage({ type: 'success', text: 'Succesvol ingelogd!' });
          setTimeout(() => {
            setIsOpen(false);
            setEmail('');
            setPassword('');
            setMessage(null);
          }, 1500);
        } else {
          setMessage({ type: 'error', text: 'Onjuiste e-mail of wachtwoord' });
        }
      } else if (mode === 'register') {
        const success = await onRegister(email, password, name);
        if (success) {
          setMessage({ type: 'success', text: 'Account aangemaakt! Check je e-mail voor je inloggegevens.' });
          setTimeout(() => {
            setIsOpen(false);
            setEmail('');
            setPassword('');
            setName('');
            setMessage(null);
          }, 2000);
        } else {
          setMessage({ type: 'error', text: 'E-mail al in gebruik of fout bij aanmaken' });
        }
      } else if (mode === 'reset') {
        const success = await onPasswordReset(email);
        if (success) {
          setMessage({ type: 'success', text: 'Wachtwoord reset e-mail verzonden!' });
          setTimeout(() => {
            setMode('login');
            setEmail('');
            setMessage(null);
          }, 2000);
        } else {
          setMessage({ type: 'error', text: 'E-mail niet gevonden' });
        }
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Er is een fout opgetreden' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setMessage(null);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
      >
        <User className="w-4 h-4" />
        Aanmelden
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-6 w-96 z-50 text-gray-900">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {mode === 'login' && 'Inloggen'}
              {mode === 'register' && 'Account Aanmaken'}
              {mode === 'reset' && 'Wachtwoord Reset'}
            </h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-200 mb-4">
            <button
              onClick={() => { setMode('login'); resetForm(); }}
              className={`px-4 py-2 text-sm font-medium ${
                mode === 'login'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Inloggen
            </button>
            <button
              onClick={() => { setMode('register'); resetForm(); }}
              className={`px-4 py-2 text-sm font-medium ${
                mode === 'register'
                  ? 'border-b-2 border-orange-500 text-orange-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Aanmelden
            </button>
          </div>

          {/* Message */}
          {message && (
            <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-red-100 text-red-700'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Volledige naam
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Je volledige naam"
                    style={{ color: '#374151' }}
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mailadres
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                  placeholder="je@email.com"
                  style={{ color: '#374151' }}
                  required
                />
              </div>
            </div>

            {mode !== 'reset' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900"
                    placeholder="Je wachtwoord"
                    style={{ color: '#374151' }}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => setMode('reset')}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  Wachtwoord vergeten?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {mode === 'login' && 'Inloggen...'}
                  {mode === 'register' && 'Aanmaken...'}
                  {mode === 'reset' && 'Verzenden...'}
                </>
              ) : (
                <>
                  {mode === 'login' && (
                    <>
                      <LogIn className="w-4 h-4" />
                      Inloggen
                    </>
                  )}
                  {mode === 'register' && (
                    <>
                      <UserPlus className="w-4 h-4" />
                      Account Aanmaken
                    </>
                  )}
                  {mode === 'reset' && (
                    <>
                      <Mail className="w-4 h-4" />
                      Reset Verzenden
                    </>
                  )}
                </>
              )}
            </button>
          </form>

          {mode === 'register' && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">
                <strong>Let op:</strong> Na aanmelding ontvang je een e-mail met je inloggegevens. 
                Je kunt je wachtwoord later wijzigen in je account.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
