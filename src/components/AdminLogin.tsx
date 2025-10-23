import { useState } from 'react';
import { Lock, Eye, EyeOff, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, userType, login, logout } = useAuth();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (login(password)) {
      setPassword('');
      setIsOpen(false);
    } else {
      setError('Onjuist wachtwoord');
    }
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  if (isAuthenticated) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-300">
          {userType === 'admin' ? 'Admin ingelogd' : 'Test gebruiker ingelogd'}
        </span>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Uitloggen
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-md transition-colors"
      >
        <User className="w-4 h-4" />
        Login
      </button>

      {isOpen && (
        <div className="absolute bottom-full right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Inloggen</h3>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wachtwoord
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Admin of test wachtwoord"
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

            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Admin:</strong> Volledige toegang tot alle functies</p>
              <p><strong>Test:</strong> Beperkte toegang voor testen</p>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Inloggen
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
