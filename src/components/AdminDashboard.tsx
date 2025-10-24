import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  BarChart3, 
  TrendingUp, 
  Settings, 
  Users, 
  FileText, 
  ChevronRight,
  Plus,
  Edit3,
  Eye,
  Wallet,
  Mail, // Added for email management
  Send, // Added for bulk email
  Globe,
  Lock,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
// import PageManagement from './PageManagement';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isSoonOnlineMode, setIsSoonOnlineMode] = useState(true);

  useEffect(() => {
    // Check current soon online mode status
    const soonOnlineMode = localStorage.getItem('soon_online_mode');
    setIsSoonOnlineMode(soonOnlineMode !== 'false');
  }, []);

  const toggleSoonOnlineMode = () => {
    const newMode = !isSoonOnlineMode;
    setIsSoonOnlineMode(newMode);
    localStorage.setItem('soon_online_mode', String(newMode));
    
    if (!newMode) {
      // Site is now live
      alert('Website is nu live! Alle bezoekers kunnen de site zien.');
    } else {
      // Site is back to "soon online" mode
      alert('Website is terug in "Soon Online" modus. Alleen admin en test gebruikers kunnen de site zien.');
    }
  };

  const adminPages = [
    {
      id: 'bitcoin-history',
      title: 'Bitcoin Geschiedenis',
      description: 'Bitcoin prijsdata, DCA simulator en market cycli',
      icon: TrendingUp,
      path: '/admin/bitcoin-history',
      color: 'bg-orange-500'
    },
    {
      id: 'portfolio',
      title: 'Portfolio',
      description: 'Koppel je Bitcoin wallets en bekijk je inkoop geschiedenis',
      icon: Wallet,
      path: '/admin/portfolio',
      color: 'bg-blue-500'
    },
    {
      id: 'market-cap-comparer',
      title: 'Market Cap Vergelijker',
      description: 'Vergelijk cryptocurrencies op basis van marktkapitalisatie',
      icon: BarChart3,
      path: '/admin/market-cap-comparer',
      color: 'bg-green-500'
    }
  ];

  const adminControls = [
    {
      id: 'aanmeldingen',
      title: 'Aanmeldingen Beheren',
      description: 'Bekijk en beheer nieuwe aanmeldingen',
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      id: 'content',
      title: 'Content Beheren',
      description: 'Pas website content en teksten aan',
      icon: FileText,
      color: 'bg-orange-500'
    },
    {
      id: 'page-visibility',
      title: 'Pagina Zichtbaarheid',
      description: 'Beheer welke pagina\'s zichtbaar zijn',
      icon: Eye,
      color: 'bg-blue-500'
    },
    {
      id: 'settings',
      title: 'Instellingen',
      description: 'Algemene instellingen en configuratie',
      icon: Settings,
      color: 'bg-gray-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Admin Dashboard
            </h1>
            <p className="text-xl text-gray-600">
              Beheer je Bitcoin begeleiding platform
            </p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Overzicht
                </button>
                <button
                  onClick={() => setActiveTab('pages')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pages'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pagina's
                </button>
                <button
                  onClick={() => setActiveTab('controls')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'controls'
                      ? 'border-orange-500 text-orange-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Beheer
                </button>
              </nav>
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Site Status Toggle */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl ${isSoonOnlineMode ? 'bg-orange-100' : 'bg-green-100'}`}>
                      {isSoonOnlineMode ? <Lock className="w-8 h-8 text-orange-600" /> : <Globe className="w-8 h-8 text-green-600" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isSoonOnlineMode ? 'Website in "Soon Online" Modus' : 'Website Live'}
                      </h3>
                      <p className="text-gray-600">
                        {isSoonOnlineMode 
                          ? 'Alleen admin en test gebruikers kunnen de site zien' 
                          : 'Alle bezoekers kunnen de site zien'
                        }
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={toggleSoonOnlineMode}
                    className={`flex items-center gap-3 px-6 py-3 rounded-lg font-semibold transition-all ${
                      isSoonOnlineMode
                        ? 'bg-orange-600 text-white hover:bg-orange-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {isSoonOnlineMode ? (
                      <>
                        <ToggleRight className="w-5 h-5" />
                        Site Live Maken
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="w-5 h-5" />
                        Terug naar Soon Online
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-100 p-3 rounded-xl">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">12</h3>
                      <p className="text-gray-600">Nieuwe Aanmeldingen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-green-100 p-3 rounded-xl">
                      <TrendingUp className="w-8 h-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">8</h3>
                      <p className="text-gray-600">Actieve Begeleidingen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="bg-orange-100 p-3 rounded-xl">
                      <BarChart3 className="w-8 h-8 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">24</h3>
                      <p className="text-gray-600">Totaal Bezoekers</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Email Management Section */}
              <div className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-3 rounded-xl">
                      <Mail className="w-8 h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">E-mail Beheer</h3>
                      <p className="text-gray-600">Beheer notificatie e-mails en verstuur bulk berichten</p>
                    </div>
                  </div>
                  <Link
                    to="/admin/emails"
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Mail className="w-4 h-4" />
                    E-mail Beheer
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Notificatie E-mails</h4>
                    <p className="text-sm text-gray-600 mb-3">Beheer alle e-mail adressen die notificaties willen ontvangen</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>0 e-mails opgeslagen</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Bulk E-mail</h4>
                    <p className="text-sm text-gray-600 mb-3">Verstuur berichten naar alle of geselecteerde e-mails</p>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Send className="w-4 h-4" />
                      <span>Klaar voor bulk verzending</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-lg">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recente Activiteit</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">Nieuwe aanmelding van Jan de Vries</span>
                    <span className="text-gray-500 text-sm ml-auto">2 uur geleden</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-700">Bitcoin Geschiedenis pagina bekeken</span>
                    <span className="text-gray-500 text-sm ml-auto">4 uur geleden</span>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-700">Market Cap Vergelijker gebruikt</span>
                    <span className="text-gray-500 text-sm ml-auto">6 uur geleden</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pages Tab */}
          {activeTab === 'pages' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold text-gray-900">Beschikbare Pagina's</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
                  <Plus className="w-4 h-4" />
                  Nieuwe Pagina
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {adminPages.map((page) => (
                  <Link
                    key={page.id}
                    to={page.path}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${page.color} p-3 rounded-xl`}>
                        <page.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {page.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{page.description}</p>
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <span>Openen</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Controls Tab */}
          {activeTab === 'controls' && (
            <div className="space-y-6">
              <h3 className="text-2xl font-bold text-gray-900">Beheer Opties</h3>

              {/* Page Visibility Management - Temporarily disabled */}
              {/* <PageManagement /> */}

              <div className="grid md:grid-cols-2 gap-6">
                {adminControls.filter(control => control.id !== 'page-visibility').map((control) => (
                  <div
                    key={control.id}
                    className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`${control.color} p-3 rounded-xl`}>
                        <control.icon className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                          {control.title}
                        </h4>
                        <p className="text-gray-600 mb-4">{control.description}</p>
                        <div className="flex items-center gap-2 text-orange-600 font-medium">
                          <Edit3 className="w-4 h-4" />
                          <span>Beheren</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
