import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FrontPage from './pages/FrontPage';
import HomePage from './pages/HomePage';
import MarketCapComparerPage from './pages/MarketCapComparerPage';
import AanmeldenPage from './pages/AanmeldenPage';
import PortfolioPage from './pages/PortfolioPage';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <Router>
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
              </Routes>

            <Footer />
          </div>
        </Router>
      </CurrencyProvider>
    </AuthProvider>
  );
}

export default App;