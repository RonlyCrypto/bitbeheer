import { useState, useEffect } from 'react';
import { User, Mail, Calendar, MessageSquare, Tag, LogOut, ArrowLeft } from 'lucide-react';

interface UserSession {
  id: string;
  email: string;
  name: string;
  category: string;
  loginTime: string;
}

export default function UserDashboard() {
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load user session from localStorage
    const session = localStorage.getItem('user_session');
    if (session) {
      setUserSession(JSON.parse(session));
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user_session');
    window.location.href = '/admin';
  };

  const handleBackToAdmin = () => {
    window.location.href = '/admin';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Account laden...</p>
        </div>
      </div>
    );
  }

  if (!userSession) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 p-4 rounded-lg mb-4">
            <p className="text-red-600">Geen actieve sessie gevonden</p>
          </div>
          <button
            onClick={handleBackToAdmin}
            className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors"
          >
            Terug naar Admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-orange-100 p-3 rounded-xl">
                  <User className="w-8 h-8 text-orange-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Mijn Account</h1>
                  <p className="text-gray-600">Welkom terug, {userSession.name}!</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleBackToAdmin}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Terug naar Admin
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Uitloggen
                </button>
              </div>
            </div>
          </div>

          {/* Account Info */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Informatie</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">E-mail</p>
                    <p className="font-medium text-gray-900">{userSession.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Naam</p>
                    <p className="font-medium text-gray-900">{userSession.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Tag className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Categorie</p>
                    <span className="inline-block bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm">
                      {userSession.category}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-600">Ingelogd sinds</p>
                    <p className="font-medium text-gray-900">
                      {new Date(userSession.loginTime).toLocaleString('nl-NL')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Account Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-medium text-gray-900">Actief</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Notificaties</p>
                    <p className="font-medium text-gray-900">Ingeschreven</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                  <div>
                    <p className="text-sm text-gray-600">Categorie</p>
                    <p className="font-medium text-gray-900">{userSession.category}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recente Activiteit</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Account aangemaakt</span>
                <span className="text-gray-500 text-sm ml-auto">Vandaag</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Notificatie ingeschreven voor {userSession.category}</span>
                <span className="text-gray-500 text-sm ml-auto">Vandaag</span>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Ingelogd als gebruiker</span>
                <span className="text-gray-500 text-sm ml-auto">Nu</span>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Account Acties</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <button className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">Bericht Wijzigen</p>
                  <p className="text-sm text-gray-600">Pas je bericht aan</p>
                </div>
              </button>
              <button className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <Mail className="w-6 h-6 text-green-600" />
                <div className="text-left">
                  <p className="font-medium text-gray-900">E-mail Instellingen</p>
                  <p className="text-sm text-gray-600">Beheer je notificaties</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
