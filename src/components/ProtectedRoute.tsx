import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';
import AdminMfaGate from './AdminMfaGate';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();

  if (!isAuthenticated && !supabaseUser) {
    return <Navigate to="/" replace />;
  }

  // De beheerder moet een tweede stap (authenticator-code) doorlopen voordat het beheer opent.
  if (supabaseUser?.email === 'admin@bitbeheer.nl') {
    return <AdminMfaGate>{children}</AdminMfaGate>;
  }

  return <>{children}</>;
}
