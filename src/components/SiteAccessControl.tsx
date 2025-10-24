import { useAuth } from '../contexts/AuthContext';
import SoonOnlinePage from '../pages/SoonOnlinePage';
import FrontPage from '../pages/FrontPage';

interface SiteAccessControlProps {
  children: React.ReactNode;
}

export default function SiteAccessControl({ children }: SiteAccessControlProps) {
  const { isSiteAccessible, isAuthenticated } = useAuth();

  if (!isSiteAccessible()) {
    // If admin is logged in, show FrontPage (full site)
    if (isAuthenticated) {
      return <FrontPage />;
    }
    // Non-authenticated users see SoonOnlinePage
    return <SoonOnlinePage />;
  }

  return <>{children}</>;
}
