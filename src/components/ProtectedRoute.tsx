import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();

  if (!isAuthenticated && !supabaseUser) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
