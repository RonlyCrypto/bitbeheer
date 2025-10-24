import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
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
import ProtectedRoute from './components/ProtectedRoute';
import SiteAccessControl from './components/SiteAccessControl';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
          <SiteAccessControl>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
              <Header />

              <Routes>
                <Route path="/" element={<FrontPage />} />
                <Route path="/aanmelden" element={<AanmeldenPage />} />
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute>
                      <AdminDashboard />
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
              </Routes>

              <Footer />
            </div>
          </SiteAccessControl>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;