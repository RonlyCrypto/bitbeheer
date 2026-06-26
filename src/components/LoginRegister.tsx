import { useState } from 'react';
import { User, LogIn, UserPlus, Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle, Phone, DollarSign, MessageSquare, X } from 'lucide-react';
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
  
  // Extended form data for registration
  const [formData, setFormData] = useState({
    naam: '',
    email: '',
    telefoon: '',
    spaargeld: '',
    ervaring: '',
    motivatie: '',
    verwachtingen: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    if (mode === 'register') {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      });
    } else {
      // For login mode, update individual state
      if (e.target.name === 'email') setEmail(e.target.value);
      if (e.target.name === 'password') setPassword(e.target.value);
      if (e.target.name === 'name') setName(e.target.value);
    }
  };

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
        // Use the same API as the aanmeldformulier
        const accountResponse = await fetch('/api/create-account', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            naam: formData.naam,
            telefoon: formData.telefoon,
            spaargeld: formData.spaargeld,
            ervaring: formData.ervaring,
            motivatie: formData.motivatie,
            verwachtingen: formData.verwachtingen
          }),
        });

        if (accountResponse.ok) {
          const result = await accountResponse.json();
          setMessage({ 
            type: 'success', 
            text: 'Account succesvol aangemaakt! Controleer je e-mail om je account te activeren.' 
          });
          setTimeout(() => {
            setIsOpen(false);
            setFormData({
              naam: '',
              email: '',
              telefoon: '',
              spaargeld: '',
              ervaring: '',
              motivatie: '',
              verwachtingen: ''
            });
            setMessage(null);
          }, 3000);
        } else {
          const errorData = await accountResponse.json();
          setMessage({ 
            type: 'error', 
            text: errorData.error || 'Er is een fout opgetreden bij het aanmaken van je account.' 
          });
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
      <div className="flex flex-col items-end gap-1">
        <span className="text-sm font-medium opacity-90">
          Welkom, {user.user_metadata?.name || user.email}
        </span>
        <button
          onClick={handleLogout}
          className="bg-white text-orange-600 px-3 py-1.5 rounded-md hover:bg-orange-50 transition-colors flex items-center space-x-1.5 text-sm font-semibold"
        >
          <LogIn size={14} />
          <span>Uitloggen</span>
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition-colors flex items-center space-x-2"
      >
        <User size={16} />
        <span>Login</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">
                  {mode === 'login' ? 'Inloggen' : mode === 'register' ? 'Account Aanmaken' : 'Wachtwoord Reset'}
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-200 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Mode Tabs */}
              <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'login'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Inloggen
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    mode === 'register'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  Account Aanmaken
                </button>
              </div>

              {/* Message */}
              {message && (
                <div className={`mb-4 p-4 rounded-md flex items-center space-x-2 ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-800 border border-green-200' 
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}>
                  {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                  <span>{message.text}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === 'login' ? (
                  // Login Form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mailadres
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                          placeholder="je@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Wachtwoord
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="password"
                          value={password}
                          onChange={handleChange}
                          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                          placeholder="Je wachtwoord"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </div>
                  </>
                ) : mode === 'register' ? (
                  // Registration Form (same as aanmeldformulier)
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Naam *
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="text"
                            name="naam"
                            value={formData.naam}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                            placeholder="Je volledige naam"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          E-mailadres *
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                            placeholder="je@email.com"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Telefoonnummer
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <input
                            type="tel"
                            name="telefoon"
                            value={formData.telefoon}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                            placeholder="06-12345678"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Spaargeld beschikbaar
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                          <select
                            name="spaargeld"
                            value={formData.spaargeld}
                            onChange={handleChange}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                          >
                            <option value="">Selecteer bedrag</option>
                            <option value="0-1000">€0 - €1.000</option>
                            <option value="1000-5000">€1.000 - €5.000</option>
                            <option value="5000-10000">€5.000 - €10.000</option>
                            <option value="10000-25000">€10.000 - €25.000</option>
                            <option value="25000+">€25.000+</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bitcoin ervaring
                      </label>
                      <select
                        name="ervaring"
                        value={formData.ervaring}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                      >
                        <option value="">Selecteer je ervaring</option>
                        <option value="beginner">Beginner - Nog nooit Bitcoin gekocht</option>
                        <option value="basis">Basis - Enkele keren gekocht via exchange</option>
                        <option value="gemiddeld">Gemiddeld - Regelmatig Bitcoin gekocht</option>
                        <option value="gevorderd">Gevorderd - Ervaren met verschillende strategieën</option>
                        <option value="expert">Expert - Professioneel actief</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Motivatie voor Bitcoin investeren
                      </label>
                      <textarea
                        name="motivatie"
                        value={formData.motivatie}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                        placeholder="Vertel ons waarom je wilt investeren in Bitcoin..."
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Verwachtingen van de begeleiding
                      </label>
                      <textarea
                        name="verwachtingen"
                        value={formData.verwachtingen}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                        placeholder="Wat hoop je te leren en bereiken met onze begeleiding?"
                      />
                    </div>
                  </>
                ) : (
                  // Password Reset Form
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        E-mailadres
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-black"
                          placeholder="je@email.com"
                          required
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-md hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Bezig...</span>
                    </>
                  ) : (
                    <>
                      {mode === 'login' ? <LogIn size={20} /> : <UserPlus size={20} />}
                      <span>
                        {mode === 'login' ? 'Inloggen' : mode === 'register' ? 'Account Aanmaken' : 'Reset Versturen'}
                      </span>
                    </>
                  )}
                </button>

                {/* Mode Switch */}
                <div className="text-center">
                  {mode === 'login' ? (
                    <p className="text-sm text-gray-600">
                      Nog geen account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('register')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Maak er een aan
                      </button>
                    </p>
                  ) : mode === 'register' ? (
                    <p className="text-sm text-gray-600">
                      Al een account?{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        Log hier in
                      </button>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-600">
                      Terug naar{' '}
                      <button
                        type="button"
                        onClick={() => setMode('login')}
                        className="text-orange-600 hover:text-orange-700 font-medium"
                      >
                        inloggen
                      </button>
                    </p>
                  )}
                </div>

                {/* Info Box for Registration */}
                {mode === 'register' && (
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Let op:</strong> Na aanmelding ontvang je een e-mail om je account te activeren. 
                      Controleer ook je spam folder. Je hebt 5 dagen om je account te bevestigen.
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}