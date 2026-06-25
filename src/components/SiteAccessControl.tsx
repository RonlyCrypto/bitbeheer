import { useAuth } from '../contexts/AuthContext';
import { useSupabaseAuth } from '../contexts/SupabaseAuthContext';
import SoonOnlinePage from '../pages/SoonOnlinePage';

interface SiteAccessControlProps {
  children: React.ReactNode;
}

export default function SiteAccessControl({ children }: SiteAccessControlProps) {
  const { isSiteAccessible, isAuthenticated } = useAuth();
  const { user: supabaseUser } = useSupabaseAuth();

  // Ingelogde gebruikers (zowel oude auth als Supabase) krijgen altijd toegang tot de echte site
  if (isSiteAccessible() || isAuthenticated || supabaseUser) {
    return <>{children}</>;
  }

  // Niet-ingelogde bezoekers zien SoonOnlinePage
  return <SoonOnlinePage />;
}
