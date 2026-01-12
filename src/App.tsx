import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import FrontPage from './pages/FrontPage';
import SoonOnlinePage from './pages/SoonOnlinePage';
import HomePage from './pages/HomePage';
import MarketCapComparerPage from './pages/MarketCapComparerPage';
import AanmeldenPage from './pages/AanmeldenPage';
import PortfolioPage from './pages/PortfolioPage';
import EmailManagement from './pages/EmailManagement';
import AdminDashboard from './components/AdminDashboard';
import UserDashboard from './components/UserDashboard';
import DatabaseTest from './components/DatabaseTest';
import VerifyEmailPage from './pages/VerifyEmailPage';
import WelcomePopup from './components/WelcomePopup';
import ProtectedRoute from './components/ProtectedRoute';
import SiteAccessControl from './components/SiteAccessControl';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';
import { SupabaseAuthProvider, useSupabaseAuth } from './contexts/SupabaseAuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { PermissionsProvider } from './contexts/PermissionsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { ProfilePopupProvider } from './contexts/ProfilePopupContext';
import ImpersonationBanner from './components/ImpersonationBanner';
import SystemStatusDebug from './components/SystemStatusDebug';
import MobileBottomNav from './components/MobileBottomNav';
import { initVisitorTracking } from './utils/visitorTracking';
import { initBitcoinPriceTracking } from './lib/initPriceTracking';
import { APP_VERSION } from './config/appVersion';

// Import simple versions if needed
import AdminDashboardSimple from './components/AdminDashboardSimple';
import UserDashboardSimple from './components/UserDashboardSimple';

function AppContent() {
  const { showWelcomePopup, setShowWelcomePopup, user } = useSupabaseAuth();

  // Initialize visitor tracking and Bitcoin price tracking
  useEffect(() => {
    initVisitorTracking();
    initBitcoinPriceTracking(); // Start automatic price updates
  }, []);

  return (
    <>
      <SiteAccessControl>
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" style={{ backgroundColor: '#f9fafb' }}>
      <Header />

          {/* Global Impersonation Banner - Show on all routes when impersonating (only in complex version) */}
          {APP_VERSION === 'complex' && <ImpersonationBanner />}
          
          {/* System Status Debug - Only in complex version */}
          {APP_VERSION === 'complex' && <SystemStatusDebug />}

          <Routes>
                {/* Root route: show dashboard if logged in, otherwise show front page */}
                <Route 
                  path="/" 
                  element={user ? (APP_VERSION === 'simple' ? <UserDashboardSimple /> : <UserDashboard />) : <FrontPage />}
                />
                {/* Dedicated front page route - accessible even when logged in */}
                <Route path="/home" element={<FrontPage />} />
                <Route path="/aanmelden" element={<AanmeldenPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      {APP_VERSION === 'simple' ? <AdminDashboardSimple /> : <AdminDashboard />}
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/bitcoin-history" 
                  element={
                    <ProtectedRoute>
                      <HomePage />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/market-cap-comparer" 
                  element={
                    <ProtectedRoute>
                      <MarketCapComparerPage />
                    </ProtectedRoute>
                  } 
                />
                        <Route 
                          path="/admin/portfolio" 
                          element={
                            <ProtectedRoute>
                              <PortfolioPage />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/admin/emails" 
                          element={
                            <ProtectedRoute>
                              <EmailManagement />
                            </ProtectedRoute>
                          } 
                        />
                        <Route 
                          path="/user-dashboard" 
                          element={<UserDashboard />}
                        />
                        {/* Database Test - alleen in complexe versie */}
                        {APP_VERSION === 'complex' && (
                          <Route 
                            path="/database-test" 
                            element={<DatabaseTest />}
                          />
                        )}
                        <Route 
                          path="/verify-email" 
                          element={<VerifyEmailPage />}
                        />
                        {/* Catch-all route for 404 handling */}
                        <Route 
                          path="*" 
                          element={
                            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
                              <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
                                <h1 className="text-6xl font-bold text-orange-600 mb-4">404</h1>
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">Pagina Niet Gevonden</h2>
                                <p className="text-gray-600 mb-6">De pagina die je zoekt bestaat niet of is verplaatst.</p>
                                <a 
                                  href="/" 
                                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
                                >
                                  Terug naar Home
              </a>
            </div>
        </div>
                          }
                        />
          </Routes>

          {/* Mobile Bottom Navigation - Only for logged in users */}
          <MobileBottomNav />
        </div>
      <Footer />
      </SiteAccessControl>
      
      {/* Welcome Popup */}
      {showWelcomePopup && user && (
        <WelcomePopup
          userName={user.user_metadata?.name || user.email || 'Gebruiker'}
          onClose={() => setShowWelcomePopup(false)}
        />
      )}
    </>
  );
}

function App() {
  // Simple version: fewer providers
  if (APP_VERSION === 'simple') {
    return (
      <ThemeProvider>
        <SupabaseAuthProvider>
          <CurrencyProvider>
            <Router>
              <AppContent />
            </Router>
          </CurrencyProvider>
        </SupabaseAuthProvider>
      </ThemeProvider>
    );
  }

  // Complex version: all providers
  return (
    <ThemeProvider>
      <SupabaseAuthProvider>
        <AuthProvider>
          <PermissionsProvider>
            <SettingsProvider>
              <ProfilePopupProvider>
                <CurrencyProvider>
                  <Router>
                    <AppContent />
                  </Router>
                </CurrencyProvider>
              </ProfilePopupProvider>
            </SettingsProvider>
          </PermissionsProvider>
        </AuthProvider>
      </SupabaseAuthProvider>
    </ThemeProvider>
  );
}

export default App;