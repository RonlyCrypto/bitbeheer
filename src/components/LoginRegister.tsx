import { useState } from 'react';
import { User, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';

export default function LoginRegister() {
  const { signUp, signIn, signOut, isAuthenticated, user } = useSupabaseAuth();
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
        const result = await signIn(email, password);
        if (result.success) {
          setMessage({ type: 'success', text: 'Succesvol ingelogd!' });
          setTimeout(() => {
            setIsOpen(false);
            setEmail('');
            setPassword('');
            setMessage(null);
          }, 1500);
        } else {
          setMessage({ type: 'error', text: result.error || 'Onjuiste e-mail of wachtwoord' });
        }
      } else if (mode === 'register') {
        const result = await signUp(email, password, { name: name.trim() });
        if (result.success) {
          setMessage({ 
            type: 'success', 
            text: 'Account aangemaakt! Controleer je e-mail om je account te activeren.' 
          });
          setTimeout(() => {
            setIsOpen(false);
            setEmail('');
            setPassword('');
            setName('');
            setMessage(null);
          }, 3000);
        } else {
          setMessage({ type: 'error', text: result.error || 'Er is een fout opgetreden bij het aanmaken van je account.' });
        }
      } else if (mode === 'reset') {
        // Password reset functionality will be implemented
        setMessage({ type: 'success', text: 'Wachtwoord reset functionaliteit wordt binnenkort toegevoegd.' });
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setMessage({ type: 'error', text: 'Er is een onverwachte fout opgetreden.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        <div className="text-sm text-gray-600">
          Welkom, {user.user_metadata?.name || user.email}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <User className="w-4 h-4" />
          Uitloggen
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
      >
        <User className="w-4 h-4" />
        Inloggen
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {mode === 'login' && 'Inloggen'}
                {mode === 'register' && 'Account Aanmaken'}
                {mode === 'reset' && 'Wachtwoord Reset'}
              </h2>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setEmail('');
                  setPassword('');
                  setName('');
                  setMessage(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {message && (
              <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
                message.type === 'success' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : 'bg-red-100 text-red-700 border border-red-200'
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Naam
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Je volledige naam"
                      required
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-mailadres
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="je@email.com"
                    required
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Wachtwoord
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      placeholder="Je wachtwoord"
                      required
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Bezig...
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
                        Reset E-mail Verzenden
                      </>
                    )}
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              {mode === 'login' && (
                <div className="space-y-2">
                  <button
                    onClick={() => setMode('register')}
                    className="text-orange-600 hover:text-orange-700 font-medium"
                  >
                    Nog geen account? Registreer hier
                  </button>
                  <div>
                    <button
                      onClick={() => setMode('reset')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Wachtwoord vergeten?
                    </button>
                  </div>
                </div>
              )}
              {mode === 'register' && (
                <button
                  onClick={() => setMode('login')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Al een account? Log hier in
                </button>
              )}
              {mode === 'reset' && (
                <button
                  onClick={() => setMode('login')}
                  className="text-orange-600 hover:text-orange-700 font-medium"
                >
                  Terug naar inloggen
                </button>
              )}
            </div>

            {mode === 'register' && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  <strong>Let op:</strong> Na aanmelding ontvang je een e-mail om je account te activeren. 
                  Controleer ook je spam folder.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}